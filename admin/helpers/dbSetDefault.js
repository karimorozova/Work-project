const ObjectId = require("mongodb").ObjectID
const {
	Languages,
	User,
	Services,
	Industries,
	Pricelist,
	Timezones,
	LeadSource,
	Group,
	Step,
	Clients,
	Vendors,
	Instruction,
	CancelReason,
	Units,
	CurrencyRatio,
	Discounts,
	TierInfo,
	IndustryTierInfo
} = require("../models")

const {
	getDefaultBasicPrices,
	getDefaultStepMultipliers,
	getDefaultIndustryMultipliers,
	defaultLanguages,
	defaultUsers,
	defaultServices,
	defaultIndustries,
	defaultTimezones,
	defaultGroups,
	defaultSteps,
	defaultUnits,
	defaultCancelReasons,
	defaultInstructions,
	defaultLeadSources,
	defaultDiscounts,
	defaultTierInfo,
	defaultIndustryTierInfo
} = require("./defaults")

async function fillInstructions() {
	try {
		const instructions = await Instruction.find()
		if (!instructions.length) {
			for (let instruction of defaultInstructions) {
				await new Instruction(instruction).save()
			}
		}
	} catch (err) {
		console.log("Error on filling default Instructions")
		console.log(err)
	}
}

async function fillCancelReasons() {
	try {
		const cancelReasons = await CancelReason.find()
		if (!cancelReasons.length) {
			for (let cancelReason of defaultCancelReasons) {
				await new CancelReason(cancelReason).save()
			}
		}
	} catch (err) {
		console.log("Error on filling default Cancel Reasons")
		console.log(err)
	}
}

function fillLeadSources() {
	return LeadSource.find({})
			.then(async sources => {
				if (!sources.length) {
					for (const source of defaultLeadSources) {
						await new LeadSource({ source })
								.save()
								.then(res => {
								})
								.catch(err => {
									console.log(
											`Leadsource ${ source } hasn't been saved because of ${ err.message }`
									)
								})
					}
					console.log("Leadsources are saved!")
				}
			})
			.catch(err => {
				console.log("Something is wrong" + err)
			})
}

function fillGroups() {
	return Group.find({})
			.then(async groups => {
				if (!groups.length) {
					for (const group of defaultGroups) {
						await new Group({ name: group })
								.save()
								.then(res => {
								})
								.catch(err => {
									console.log(
											`Group ${ group } hasn't been saved because of ${ err.message }`
									)
								})
					}
					console.log("Groups are saved!")
				}
			})
			.catch(err => {
				console.log("Something is wrong " + err)
			})
}

async function fillDefaultDiscounts() {
	const discounts = await Discounts.find()
	if (!discounts.length) {
		for (let discount of defaultDiscounts) {
			await new Discounts(discount).save().catch(err => {
				console.log("Cannot save discounts" + err.message)
			})
		}
	}
}

function fillSteps() {
	return Step.find({})
			.then(async steps => {
				if (!steps.length) {
					for (const step of defaultSteps) {
						let unit
						let calculationUnit
						const { title } = step
						switch (title) {
							default:
							case "Translation":
							case "Revising":
								unit = await Units.findOne({ type: "CAT Wordcount" })
								calculationUnit = unit._id
								break
							case "QA":
							case "Graphic Design":
								unit = await Units.findOne({ type: "Hours" })
								calculationUnit = unit._id
								break
							case "Copywriting":
							case "Proofreading":
								unit = await Units.findOne({ type: "Packages" })
								calculationUnit = unit._id
								break
						}
						await new Step({ ...step, calculationUnit })
								.save()
								.then(res => {
								})
								.catch(err => {
									console.log(
											`Step ${ step } hasn't been saved because of ${ err.message }`
									)
								})
					}
					console.log("Steps are saved!")
				}
			})
			.catch(err => {
				console.log("Something is wrong " + err)
			})
}

function timeZones() {
	return Timezones.find({})
			.then(async timezones => {
				if (!timezones.length) {
					for (const time of defaultTimezones) {
						await new Timezones({ zone: time })
								.save()
								.then(res => {
								})
								.catch(err => {
									console.log(
											`Timezone ${ time } hasn't been saved because of ${ err.message }`
									)
								})
					}
					console.log("Timezones are saved!")
				}
			})
			.catch(err => {
				console.log("Something is wrong" + err)
			})
}

function languages() {
	return Languages.find({})
			.then(async languages => {
				if (!languages.length) {
					for (const lang of defaultLanguages) {
						await new Languages(lang)
								.save()
								.then(lang => {
								})
								.catch(err => {
									console.log(
											`Lang: ${ lang.lang } wasn't save. Because of ${ err.message }`
									)
								})
					}
					console.log("Langs are saved!")
				}
			})
			.catch(err => {
				console.log(err)
			})
}

function users() {
	User.find({})
			.then(async users => {
				if (!users.length) {
					for (let user of defaultUsers) {
						const group = await Group.findOne({ name: user.group })
						user.group = group.id
						new User(user)
								.save()
								.then(result => {
								})
								.catch(err => {
									console.log(`User cannot be saved. Because of ${ err.message }`)
								})
					}
				}
			})
			.catch(err => {
				console.log("Error on getting Users" + err.message)
			})
}

function industries() {
	return Industries.find({}).then(async industries => {
		if (!industries.length) {
			for (let industry of defaultIndustries) {
				await new Industries(industry)
						.save()
						.then(industry => {
						})
						.catch(err => {
							console.log(
									`Industry ${ industry.name } wasn't saved. Because of ${ err.message }`
							)
						})
			}
		} else if (industries.length < defaultIndustries.length) {
			const mapped = industries.map(item => item.name)
			const missingIndustries = defaultIndustries.filter(
					industry => !mapped.includes(industry.name)
			)
			for (let industry of missingIndustries) {
				await new Industries(industry)
						.save()
						.then(industry => {
							console.log(`industry ${ industry.name } was saved!`)
						})
						.catch(err => {
							console.log(
									`Industry ${ industry.name } wasn't saved. Because of ${ err.message }`
							)
						})
			}
		}
	})
}

function services() {
	return Services.find({})
			.then(async services => {
				if (!services.length) {
					const steps = await Step.find({}, { title: 1 })
					for (const service of defaultServices) {
						switch (service.title) {
							case "Translation":
							case "Localization":
							case "Certified Translation":
							case "SEO Translation":
							case "Transcreation":
							case "Official Translation":
								const translationSteps = steps.filter(
										step =>
												step.title === "Translation" || step.title === "Revising"
								)
								for (let i = 0; i < translationSteps.length; i++) {
									service.steps.push({
										stage: `stage${ i + 1 }`,
										step: ObjectId(translationSteps[i]._id)
									})
								}
								break
							case "Voice Over":
							case "Audio":
								const recordingStep = steps.find(
										step => step.title === "Recording"
								)
								recordingStep &&
								service.steps.push({
									stage: "stage1",
									steps: ObjectId(recordingStep._id)
								})
								break
							case "DTP":
							case "Localized Graphic Design":
								const dtpAndGraphicDesignSteps = steps.filter(
										step => step.title === "Graphic Design" || step.title === "QA"
								)
								for (let i = 0; i < dtpAndGraphicDesignSteps.length; i++) {
									service.steps.push({
										stage: `stage${ i + 1 }`,
										step: ObjectId(dtpAndGraphicDesignSteps[i]._id)
									})
								}
								break
							case "Copywriting":
								const copywritingAndProofreadingSteps = steps.filter(
										step =>
												step.title === "Copywriting" || step.title === "Proofreading"
								)
								for (let i = 0; i < copywritingAndProofreadingSteps.length; i++) {
									service.steps.push({
										stage: `stage${ i + 1 }`,
										step: ObjectId(copywritingAndProofreadingSteps[i]._id)
									})
								}
								break
							case "Proofing":
								const revisingStep = steps.find(
										step => step.title === "Revising"
								)
								revisingStep &&
								service.steps.push({
									stage: "stage1",
									step: ObjectId(revisingStep._id)
								})
								break
							case "Linguistic QA":
								const icrStep = steps.find(step => step.title === "ICR")
								icrStep &&
								service.steps.push({
									stage: "stage1",
									step: ObjectId(icrStep._id)
								})
								break
							case "Subtitling":
								const subtitlingAndRevisingSteps = steps.filter(
										step => step.title === "Subtitling" || step.title === "Revising"
								)
								for (let i = 0; i < subtitlingAndRevisingSteps.length; i++) {
									service.steps.push({
										stage: `stage${ i + 1 }`,
										step: ObjectId(subtitlingAndRevisingSteps[i]._id)
									})
								}
						}
						await new Services(service)
								.save()
								.then(service => {
								})
								.catch(err => {
									console.log(
											`Service ${ service.title } wasn't saved. Because of ${ err.message }`
									)
								})
					}
				}
			})
			.catch(err => {
				console.log(err)
			})
}

async function fillUnits() {
	try {
		const units = await Units.find()
		if (!units.length) {
			for (let unit of defaultUnits) {
				await new Units(unit).save()
			}
		}
	} catch (err) {
		console.log("Error on filling default Units")
		console.log(err)
	}
}

async function fillUnitSteps() {
	const units = await Units.find()
	const isEmptyUnitsStepsId =
			units[0].steps.length && units[1].steps.length && units[2].steps.length

	if (units.length && !isEmptyUnitsStepsId) {
		try {
			for (let unit of units) {
				const { type } = unit
				switch (type) {
					case "CAT Wordcount":
						const stepTranslation = await Step.findOne({
							title: "Translation"
						})
						const stepRevising = await Step.findOne({ title: "Revising" })
						const stepEditing = await Step.findOne({ title: "Editing" })
						unit.steps = [
							stepTranslation._id,
							stepRevising._id,
							stepEditing._id
						]
						break
					case "Packages":
						const stepCopywriting = await Step.findOne({
							title: "Copywriting"
						})
						const stepProofreading = await Step.findOne({
							title: "Proofreading"
						})
						unit.steps = [ stepCopywriting._id, stepProofreading._id ]
						break
					default:
						const stepGraphicDesign = await Step.findOne({
							title: "Graphic Design"
						})
						const stepQA = await Step.findOne({ title: "QA" })
						unit.steps = [ stepGraphicDesign._id, stepQA._id ]
						break
				}
				await Units.updateOne({ _id: ObjectId(unit._id) }, unit, {
					upsert: true
				})
			}
			console.log("Units are saved!")
		} catch (err) {
			console.log(err)
			console.log("Error on fillUnitSteps")
		}
	}
}

async function fillCurrencyRatio() {
	try {
		const currencyRatios = await CurrencyRatio.find()
		if (!currencyRatios.length) {
			await CurrencyRatio.create({
				USD: 1.2,
				GBP: 0.9
			})
			console.log("Currency ratios are saved!")
		}
	} catch (err) {
		console.log(err)
		console.log("Error on filling currency ratios")
	}
}

async function fillPricelist() {
	try {
		const pricelists = await Pricelist.find()
		if (!pricelists.length) {
			const defaultBasicPrices = await getDefaultBasicPrices()
			const defaultStepMultipliers = await getDefaultStepMultipliers()
			const defaultIndustryMultipliers = await getDefaultIndustryMultipliers()
			await Pricelist.create({
				name: "Default",
				isClientDefault: true,
				isVendorDefault: true,
				isActive: true,
				basicPricesTable: defaultBasicPrices,
				stepMultipliersTable: defaultStepMultipliers,
				industryMultipliersTable: defaultIndustryMultipliers
			})
			console.log("Pricelists are saved!")
		}
	} catch (err) {
		console.log(err)
		console.log("Error on filling pricelist")
	}
}

async function fillTierInfo() {
	try {
		const tierInfoCount = await TierInfo.countDocuments()
		if (tierInfoCount > 0) return
		await TierInfo.create(defaultTierInfo)
	} catch (e) {
	}
}

async function fillIndustryTierInfo() {
	try {
		const industryTierCount = await IndustryTierInfo.countDocuments()
		if (industryTierCount > 0) return
		let result = [ defaultIndustryTierInfo ]
		const industries = await Industries.find()
		industries.forEach(industry => {
			result.push({ ...defaultIndustryTierInfo, industry: industry._id })
		})
		await IndustryTierInfo.create(result)
	} catch (e) {
	}
}

async function checkCollections() {
	await fillInstructions()
	await fillCancelReasons()
	await fillDefaultDiscounts()
	await fillLeadSources()
	await fillGroups()
	await users()
	await fillUnits()
	await fillSteps()
	await fillUnitSteps()
	await services()
	await timeZones()
	await languages()
	await industries()
	await fillCurrencyRatio()
	await fillPricelist()
	await fillTierInfo()
	await fillIndustryTierInfo()
}

module.exports = {
	checkCollections
}
