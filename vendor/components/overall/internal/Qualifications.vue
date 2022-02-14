<template lang="pug">
  .qualifications
    //.qualifications__preview(v-if="isEditAndSend")
      WYSIWYG(@closePreview="closePreview", :message="previewMessage", @send="sendMessage")
    //.qualifications__form(v-if="isForm")
      VendorLqa(:vendorData="lqaData", @closeForm="closeForm", @saveVendorLqa="saveVendorLqa")
    .qualifications__table
      SettingsTable(
        :fields="fields",
        :tableData="qualificationData",
      )
        template(v-for="field in fields", :slot="field.headerKey", slot-scope="{ field }")
          .qualifications__head-title {{ field.label }}

        template(slot="source", slot-scope="{ row, index }")
          .qualifications__data {{ row.source.lang }}
        template(slot="target", slot-scope="{ row, index }")
          .qualifications__data {{ row.target.lang }}
        template(slot="industry", slot-scope="{ row, index }")
          .qualifications__data {{ presentArrays(row.industries, 'name') }}
        template(slot="step", slot-scope="{ row, index }")
          .qualifications__data {{ presentArrays(row.steps, 'title') }}

        template(slot="status", slot-scope="{ row, index }")
          .qualifications__data {{ row.status }}
          //.qualifications__drop-menu(v-else)
            .drop-type(v-if="row.testType === 'Test'")
              SelectSingle(:isTableDropMenu="isTableDropMenu", placeholder="Select", :selectedOption="currentStatus", :options="TestWorkflowStatusesTest", @chooseOption="setStatus" )
            .drop-type(v-if="row.testType === 'Sample'")
              SelectSingle(:isTableDropMenu="isTableDropMenu", placeholder="Select", :selectedOption="currentStatus", :options="TestWorkflowStatusesSample",@chooseOption="setStatus")

        template(slot="progress", slot-scope="{ row, index }")
          .progress-line
            .progress-line__body(v-for="stage in 5")
              .progress-line__bar(v-if="stage <= setStatusStage(row.status)", :style="{ background: '#2cb42c' }")
              .progress-line__bar(v-else)

        template(slot="tqi", slot-scope="{ row, index }")
          .qualifications__data {{ row.tqi }}

        //template(slot="icons", slot-scope="{ row, index }")
          //.qualifications__icons
            img.qualifications__icon(v-for="(icon, key) in icons", :src="icon.icon", @click="makeAction(index, key)", :class="{ qualifications_opacity: isActive(key, index) }")
</template>

<script>
	import { mapGetters, mapActions } from "vuex"
	import SettingsTable from "../SettingsTable"
	// import SelectSingle from "../SelectSingle"
	// import scrollDrop from "@/mixins/scrollDrop"
	// import crudIcons from "@/mixins/crudIcons"

	export default {
		// mixins: [ scrollDrop, crudIcons ],
		props: {
			qualificationData: {
				type: Array,
				default: () => []
			}
			// assessmentData: {
			// 	type: Array,
			// 	default: () => []
			// },
			// currentVendor: {
			// 	type: Object
			// },
			// refresh: {
			// 	type: Boolean,
			// 	default: false
			// }
		},
		data() {
			return {
				fields: [
					{
						label: "Source",
						headerKey: "headerSource",
						key: "source",
						width: "16%",
						padding: "0"
					},
					{
						label: "Target",
						headerKey: "headerTarget",
						key: "target",
						width: "16%",
						padding: "0"
					},
					{
						label: "Industry",
						headerKey: "headerIndustry",
						key: "industry",
						width: "16%",
						padding: "0"
					},
					{
						label: "Step",
						headerKey: "headerStep",
						key: "step",
						width: "16%",
						padding: "0"
					},
					{
						label: "Test Status",
						headerKey: "headerStatus",
						key: "status",
						width: "12%",
						padding: "0"
					},
					{
						label: "Progress",
						headerKey: "headerProgress",
						key: "progress",
						width: "16%",
						padding: "0"
					},
					{
						label: "TQI",
						headerKey: "headerTQI",
						key: "tqi",
						width: "9%",
						padding: "0"
					}
					// {
					// 	label: "",
					// 	headerKey: "headerIcons",
					// 	key: "icons",
					// 	width: "13%",
					// 	padding: "0"
					// }
				]
				// lqaData: {
				// 	isTqi: true
				// },
				// targets: [],
				// vendorTests: [],
				//
				// currentSource: "",
				// currentTarget: "",
				// currentIndustries: [],
				// currentSteps: [],
				// currentStatus: "",
				// currentIndex: "",
				// currentTqi: null,
				// currentTestType: "",
				//
				// previewMessage: "",
				//
				// areErrors: false,
				// errors: [],
				// isDeleting: false,
				// deleteIndex: -1,
				// isTableDropMenu: true,
				// currentActive: -1,
				// isForm: false,
				// isEditAndSend: false,
				// statusStage: -1
			}
		},
		methods: {

			presentArrays(Arr, key) {
				if (!Arr.length) return ""
				return Arr.reduce((acc, cur) => acc + `${ cur[key] }; `, "")
			},

			// closePreview() {
			// 	this.isEditAndSend = false
			// },
			// openPreview() {
			// 	this.isEditAndSend = true
			// },
			// async sendMessage(message) {
			// 	try {
			// 		await this.manageSaveClick(this.currentActive, message)
			// 	} catch (err) {
			// 		this.alertToggle({ message: err.message, isShow: true, type: "error" })
			// 	}
			// 	this.closePreview()
			// },
			// async makeAction(index, key) {
			// 	if (this.currentActive !== -1 && this.currentActive !== index) {
			// 		return this.isEditing()
			// 	}
			// 	switch (key) {
			// 		case "edit":
			// 			this.setEditingData(index)
			// 			break
			// 		case "cancel":
			// 			this.manageCancelEdition(index)
			// 			break
			// 		case "delete":
			// 			this.manageDeleteClick(index)
			// 			break
			// 		default:
			// 			await this.checkErrors(index)
			// 	}
			// },
			// setEditingData(index) {
			// 	this.currentActive = index
			// 	this.currentSource = this.qualificationData[index].source
			// 	this.currentTarget = this.qualificationData[index].target
			// 	this.currentIndustries = this.qualificationData[index].industries
			// 	this.currentStatus = this.qualificationData[index].status
			// 	this.currentSteps = this.qualificationData[index].steps
			// 	this.currentTqi = this.qualificationData[index].tqi
			// 	this.currentTestType = this.qualificationData[index].testType
			// },
			// manageCancelEdition(index) {
			// 	this.$emit("refreshQualifications")
			// 	this.setDefaults()
			// },
			// setDefaults() {
			// 	this.currentActive = -1
			// 	this.isDeleting = false
			// 	this.currentSource = []
			// 	this.currentTarget = ""
			// 	this.currentIndustries = []
			// 	this.currentStatus = ""
			// 	this.currentTqi = null
			// 	this.currentSteps = []
			// },
			//
			// async checkErrors(index) {
			// 	if (this.currentActive === -1) return
			// 	this.errors = []
			// 	if (!this.currentStatus) this.errors.push("Status should not be empty!")
			// 	if (this.errors.length) {
			// 		this.areErrors = true
			// 		return
			// 	}
			//
			// 	if (this.currentStatus === "Passed") {
			// 		this.handleLqa(index)
			// 	} else if (this.currentStatus === "Test Sent") {
			// 		const template = await this.$http.post(`/vendorsapi/get-message`, {
			// 			...this.currentVendor,
			// 			industries: this.currentIndustries,
			// 			target: this.currentTarget,
			// 			source: this.currentSource
			// 		})
			// 		this.previewMessage = template.body.message
			// 		this.openPreview()
			// 	} else {
			// 		await this.manageSaveClick(index)
			// 	}
			// },
			//
			// getAvailableTest() {
			// 	if (!this.vendorTests.length) return null
			// 	return this.vendorTests.find(
			// 			(test) =>
			// 					test.source._id.toString() === this.currentSource._id.toString() &&
			// 					test.targets.map((target) => target._id.toString()).includes(this.currentTarget._id.toString()) &&
			// 					test.industries.find((industry) => this.currentIndustries.some((currentIndustry) => industry.name === currentIndustry.name)) &&
			// 					test.steps.find((step) => this.currentSteps.some((currentStep) => step._id.toString() === currentStep._id.toString()))
			// 	)
			// },
			// handleLqa(index) {
			// 	if (this.isSampleStatus(this.qualificationData[index].status, this.currentStatus)) {
			// 		this.setDefaults()
			// 		return
			// 	}
			// 	this.lqaData = {
			// 		vendor: {
			// 			name: `${ this.currentVendor.firstName } ${ this.currentVendor.surname }`,
			// 			industries: this.presentArrays(this.currentIndustries, 'name'),
			// 			sourceLang: this.currentSource.lang,
			// 			targetLang: this.currentTarget.lang,
			// 			step: this.presentArrays(this.currentSteps, "title")
			// 		}
			// 	}
			// 	this.openForm(index)
			// },
			// async saveVendorLqa({ vendorData }) {
			// 	const { file, grade } = vendorData
			// 	let assessment = {
			// 		step: this.currentSteps,
			// 		target: this.currentTarget,
			// 		industry: this.currentIndustries,
			// 		source: this.currentSource,
			// 		tqi: { fileName: "", path: "", grade },
			// 		lqa1: {},
			// 		lqa2: {},
			// 		lqa3: {},
			// 		isNew: true
			// 	}
			//
			// 	//TEMPORARY FUNCTIONAL RESTRICTION, ONLY STEP "TRANSLATION"
			// 	assessment.step = assessment.step.filter(step => step.title === "Translation")
			// 	//TEMPORARY FUNCTIONAL RESTRICTION, ONLY STEP "TRANSLATION"
			//
			// 	let formData = new FormData()
			// 	formData.append("vendorId", this.currentVendor._id)
			// 	formData.append("assessment", JSON.stringify(assessment))
			// 	formData.append("assessmentFile", file)
			//
			// 	this.currentTqi = vendorData.grade
			//
			// 	try {
			// 		//TEMPORARY FUNCTIONAL RESTRICTION, ONLY STEP "TRANSLATION"
			// 		if (assessment.step.length) await this.storeAssessment(formData)
			// 		//TEMPORARY FUNCTIONAL RESTRICTION, ONLY STEP "TRANSLATION"
			//
			// 		await this.sendToRates()
			// 		await this.manageSaveClick(this.currentActive)
			// 	} catch (err) {
			// 	} finally {
			// 		this.$emit("updateRates", true)
			// 		this.closeForm()
			// 	}
			// },
			// isSampleStatus(dataStatus, currentStatus) {
			// 	return dataStatus === currentStatus
			// },
			//
			// async manageSaveClick(index, message) {
			// 	if (this.isSampleStatus(this.qualificationData[index].status, this.currentStatus)) {
			// 		this.setDefaults()
			// 		return
			// 	}
			// 	const tqi =
			// 			this.qualificationData[index].status === "Not Passed" || this.currentStatus === "Not Passed"
			// 					? 0
			// 					: this.currentTqi
			//
			// 	let qualification = {
			// 		testId: this.qualificationData[index].testId,
			// 		target: this.currentTarget,
			// 		industries: this.currentIndustries,
			// 		steps: this.currentSteps,
			// 		status: this.currentStatus,
			// 		source: this.currentSource,
			// 		testType: this.currentTestType,
			// 		tqi: tqi
			// 	}
			//
			// 	const test = this.getAvailableTest()
			// 	try {
			// 		await this.storeQualification({
			// 			vendor: this.currentVendor,
			// 			index,
			// 			qualification,
			// 			testPath: test ? test.path : "",
			// 			message: message ? message : ""
			// 		})
			// 		this.alertToggle({
			// 			message: "Qualification saved",
			// 			isShow: true,
			// 			type: "success"
			// 		})
			// 	} catch (err) {
			// 	} finally {
			// 		this.manageCancelEdition()
			// 	}
			// },

			// async manageDeleteClick(index) {
			// 	this.deleteIndex = index
			// 	this.isDeleting = true
			// },
			// async deleteData() {
			// 	try {
			// 		await this.deleteQualification({
			// 			vendorId: this.currentVendor._id,
			// 			index: this.deleteIndex
			// 		})
			// 		this.alertToggle({
			// 			message: "Qualification removed",
			// 			isShow: true,
			// 			type: "success"
			// 		})
			// 	} catch (err) {
			// 	} finally {
			// 		this.manageCancelEdition()
			// 	}
			// },

			// async sendToRates() {
			// 	let qualification = {
			// 		source: this.currentSource,
			// 		target: this.currentTarget,
			// 		steps: this.currentSteps,
			// 		industries: this.currentIndustries
			// 	}
			// 	await this.$http.post('/vendorsapi/qualification-rates/' + this.currentVendor._id, {
			// 		qualification
			// 	})
			// },
			//
			// setStatus({ option }) {
			// 	this.currentStatus = option
			// },
			// closeErrors() {
			// 	this.areErrors = false
			// },
			// closeForm() {
			// 	this.isForm = false
			// },
			// openForm() {
			// 	this.isForm = true
			// },
			// async getTests() {
			// 	try {
			// 		const result = await this.$http.get("/vendorsapi/lang-tests")
			// 		this.vendorTests = result.body
			// 	} catch (err) {
			// 		this.alertToggle({ message: "Error on getting tests", isShow: true })
			// 	}
			// },
			setStatusStage(status) {
				switch (status) {
					case "Test Sent":
					case "Sample Requested":
						return 2
					case "Test Received":
					case "Sample Received":
						return 3
					case "Test In Review":
					case "Sample In Review":
						return 4
					case "Passed":
					case "Not Passed":
						return 5
					default:
						return 1
				}
			}
		},
		watch: {
			// async refresh() {
			// 	if (this.refresh) {
			// 		try {
			// 			const id = this.$route.params.id
			// 			const vendor = await this.$http.get(`/vendorsapi/vendor?id=${ id }`)
			// 			await this.storeCurrentVendor(vendor.body)
			// 		} catch (err) {
			// 		} finally {
			// 			this.$emit("refreshQualifications")
			// 		}
			// 	}
			// }
		},
		computed: {
			// ...mapGetters({
			// 	currentVendorQualifications: "getCurrentVendorQualifications"
			// }),
			// TestWorkflowStatusesSample() {
			// 	let result = []
			// 	switch (this.qualificationData[this.currentActive].status) {
			// 		case "Created":
			// 		case "Re-Test":
			// 			result.push("Sample Requested")
			// 			break
			// 		case "Sample Requested":
			// 			result.push("Sample Received")
			// 			break
			// 		case "Sample Received":
			// 			result.push("Sample In Review")
			// 			break
			// 		case "Sample In Review":
			// 			result.push("Passed", "Not Passed")
			// 			break
			// 		case "Passed":
			// 			result.push("Not Passed")
			// 			break
			// 		case "Not Passed":
			// 			result.push("Re-Test")
			// 			break
			// 	}
			// 	return result
			// },
			// TestWorkflowStatusesTest() {
			// 	let result = []
			// 	switch (this.qualificationData[this.currentActive].status) {
			// 		case "Created":
			// 		case "Re-Test":
			// 			result.push("Test Sent")
			// 			break
			// 		case "Test Sent":
			// 			result.push("Test Received")
			// 			break
			// 		case "Test Received":
			// 			result.push("Test In Review")
			// 			break
			// 		case "Test In Review":
			// 			result.push("Passed", "Not Passed")
			// 			break
			// 		case "Passed":
			// 			result.push("Not Passed")
			// 			break
			// 		case "Not Passed":
			// 			result.push("Re-Test")
			// 			break
			// 	}
			// 	return result
			// }
		},
		components: {
			SettingsTable
			// SelectSingle,
			// WYSIWYG,
			// VendorLqa
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors";

  .qualifications {
    width: 1040px;
    height: auto;
    box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
    box-sizing: border-box;
    padding: 20px 20px 20px 20px;
    position: relative;
    margin-bottom: 50px;

    &__data {
      //@extend %table-data;
      overflow-x: hidden;
    }

    &__editing-data {
      //@extend %table-data;
      box-shadow: inset 0 0 7px $brown-shadow;
    }

    &__data-input {
      //@extend %table-text-input;
    }

    &__icons {
      //@extend %table-icons;
      height: 30px;
      justify-content: flex-end;
    }

    &__icon {
      //@extend %table-icon;
    }

    &__drop-menu {
      position: relative;
      box-shadow: inset 0 0 7px $brown-shadow;
    }

    &_opacity {
      opacity: 1;
    }

    &__form {
      width: 70%;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
  }

  .progress-line {
    display: flex;
    height: 30px;
    align-items: center;
    padding: 0 5px;

    &__body {
      width: 25%;
    }

    &__bar {
      height: 5px;
      margin: 0 1px;
      background: #ccc;
    }
  }
</style>
