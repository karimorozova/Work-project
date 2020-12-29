const { MemoqProject, Languages, XtrfLqa, Industries, Vendors } = require('../models');
const { findIndustry } = require('./newLangTierReport')
const { findLanguageByMemoqLanguageCode } = require('../helpers/commonFunctions');
const { ObjectId } = require('mongodb');
const _ = require('lodash')
const newLQAStatusFromXTRFProjects = async () => {

	let projects = await MemoqProject.find({ isInLQAReports: { $ne: true }, creationTime: {$gte: "2020-10-01" }});
	let reports = await XtrfLqa.find()
	const languages = await Languages.find();
	const allIndustries = await Industries.find()
	const otherIndustry = await Industries.findOne({ name: 'Other' })
	const allVendors = await Vendors.find();

	for (project of projects) {
		if(!project) {
			continue;
		}

		let { domain, serverProjectGuid, documents, sourceLanguage } = project;
		const projectIndustry = _.find(allIndustries, { name: domain }) || otherIndustry;
		const projectIndustryGroup = _.find(allIndustries, { name: findIndustry(domain) }) || otherIndustry;
		await MemoqProject.findOneAndUpdate({ serverProjectGuid }, { isInLQAReports: true })
		for ({
			TotalWordCount,
			TargetLangCode,
			UserAssignments: { TranslationDocumentUserRoleAssignmentDetails: users }
		} of documents) {
			let targetLanguage = getLanguageByMemoqLangCode(languages, TargetLangCode) || TargetLangCode;

			const user = _.filter(users, (user) => user.DocumentAssignmentRole === '0').shift();

			if(!user || !targetLanguage) {
				continue;
			}

			const languagePair = sourceLanguage.lang + " >> " + targetLanguage.lang;
			const index = _.findIndex(reports, { languagePair });

			const vendorAliases = allVendors.map(({ _id, aliases }) => ({ _id, aliases }));
			const vendorId = vendorAliases.find(({ aliases }) => aliases.includes(user.UserInfoHeader.FullName));

			const userInfo = {
				vendor: vendorId ? vendorId._id : null,
				name: user.UserInfoHeader.FullName,
				wordCount: TotalWordCount,
			}
			if(index < 0) {
				reports.push({
					languagePair,
					sourceLanguage: sourceLanguage._id,
					targetLanguage: targetLanguage._id,
          tier: 0,
					industries:
							[
								{
									industry: ObjectId(projectIndustry._id),
									industryGroup: ObjectId(projectIndustryGroup._id),
									vendors: [userInfo]
								}
							]

				})
				continue;
			}

			const indexIndustry = _.findIndex(reports[index].industries, { industry: projectIndustry._id })

			if(indexIndustry < 0) {
				reports[index].industries.push(
						{
							industry: ObjectId(projectIndustry._id),
							industryGroup: ObjectId(projectIndustryGroup._id),
							vendors: [userInfo]
						}
				)
				continue;
			}

			const indexVendor = _.findIndex(reports[index].industries[indexIndustry].vendors, { name: user.UserInfoHeader.FullName });

			if(indexVendor < 0) {
				reports[index].industries[indexIndustry].vendors.push(userInfo);
				continue;
			}

			const wordCount = reports[index].industries[indexIndustry].vendors[indexVendor].wordCount;
			reports[index].industries[indexIndustry].vendors[indexVendor].wordCount = +wordCount + +TotalWordCount;
			reports[index].industries[indexIndustry].vendors[indexVendor].tier = getTier(projectIndustryGroup.name, wordCount);
		}
	}

	await XtrfLqa.create(reports);
	return await XtrfLqa
    .find()
    .populate('sourceLanguage', 'lang')
    .populate('targetLanguage', 'lang')
    .populate('industries.industryGroup', ['name']);
}


const getTier = (industry, worldCount) => {
	const tierValues = { max: 30000, min: 5000 }

	switch (true) {
		case tierValues.max < +worldCount:
			return 1;
		case tierValues.min > +worldCount:
			return 3;
		default:
			return 2;
	}
}

function getLanguageByMemoqLangCode(languages, TargetLangCode) {
	return languages.find(lang => {
		return findLanguageByMemoqLanguageCode(lang, TargetLangCode);
	});
}

module.exports = {
	newLQAStatusFromXTRFProjects,
	getTier
}
