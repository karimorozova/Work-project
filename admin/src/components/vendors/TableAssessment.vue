<template lang="pug">
  .assessment
    .assessment__form(v-if="isForm")
      VendorLqa(:vendorData="lqaData", @closeForm="closeForm()", @saveVendorLqa="saveVendorLqa")

    .assessment__item(v-for="(assessment, mainIndex) in assessmentData")
      .assessment__languages {{ assessment.sourceLanguage.lang }} >> {{ assessment.targetLanguage.lang }}
      .assessment__industry(v-for="(industryData, industryIndex) in assessment.industries")
        .assessment__industry-title {{ industryData.industry.name }}
        .assessment__table
          SettingsTable(
            :fields="fields",
            :tableData="industryData.steps",
            :errors="errors",
            :areErrors="areErrors",
            :isApproveModal="isDeleting"
          )
            template(v-for="field in fields", :slot="field.headerKey", slot-scope="{ field }")
              .assessment__head-title {{ field.label }}

            template(slot="step", slot-scope="{ row, index }")
              .assessment__data(v-if="row.step") {{ row.step.title }}

            template(slot="tqi", slot-scope="{ row, index }")
              div(v-if="row.tqi.grade", :class="'assessment__grade'") {{ row.tqi.grade }}
                a(:href="domain + row.tqi.path")
                  img(:class="'assessment__download'", src="../../assets/images/download-big-b.png")

            template(slot="lqa1", slot-scope="{ row, index }")
              div(v-if="row.lqa1.grade", :class="'assessment__grade'") {{ row.lqa1.grade }}
                a(:href="domain + row.lqa1.path")
                  img(:class="'assessment__download'", src="../../assets/images/download-big-b.png")
              .assessment__upload(v-if="canNextAssessment(assessment, industryData, row, 'lqa1', 'tqi')")
                .assessment__load-file(@click="openForm({ field: 'Lqa1', index, mainIndex, industryIndex })")

            template(slot="lqa2", slot-scope="{ row, index }")
              div(v-if="row.lqa2.grade", :class="'assessment__grade'") {{ row.lqa2.grade }}
                a(:href="domain + row.lqa2.path")
                  img(:class="'assessment__download'", src="../../assets/images/download-big-b.png")
              .assessment__upload(v-if="canNextAssessment(assessment, industryData, row, 'lqa2', 'lqa1')")
                .assessment__load-file(@click="openForm({ field: 'Lqa2', index, mainIndex, industryIndex })")

            template(slot="lqa3", slot-scope="{ row, index }")
              div(v-if="row.lqa3.grade", :class="'assessment__grade'") {{ row.lqa3.grade }}
                a(:href="domain + row.lqa3.path")
                  img(:class="'assessment__download'", src="../../assets/images/download-big-b.png")
              .assessment__upload(v-if="canNextAssessment(assessment, industryData, row,'lqa3', 'lqa2')")
                .assessment__load-file(@click="openForm({ field: 'Lqa3', index, mainIndex, industryIndex })")
</template>

<script>
	import SettingsTable from "../Table/SettingsTable"
	import VendorLqa from "../vendors/VendorLqa"
	import { mapGetters, mapActions } from "vuex"

	export default {
		props: {
			assessmentData: {
				type: Array,
				default: () => []
			},
			currentVendor: {
				type: Object
			}
		},
		data() {
			return {
				fields: [
					{
						label: "Step",
						headerKey: "headerStep",
						key: "step",
						width: "20%",
						padding: "0"
					},
					{
						label: "TQI",
						headerKey: "headerTQI",
						key: "tqi",
						width: "20%",
						padding: "0"
					},
					{
						label: "LQA 1",
						headerKey: "headerLQA1",
						key: "lqa1",
						width: "20%",
						padding: "0"
					},
					{
						label: "LQA 2",
						headerKey: "headerLQA2",
						key: "lqa2",
						width: "20%",
						padding: "0"
					},
					{
						label: "LQA 3",
						headerKey: "headerLQA3",
						key: "lqa3",
						width: "20%",
						padding: "0"
					}
				],
				gradeNextLvl: 50,
				currentIndex: "",
				currentAssessment: {},
				currentField: "lqa1",
				lqaData: {},
				isForm: false,
				currentActive: -1,
				areErrors: false,
				errors: [],
				isDeleting: false,
				deleteIndex: -1,
				domain: "http://localhost:3001",
				assessmentsWordCount: []
			}
		},
		methods: {
			...mapActions({
				alertToggle: "alertToggle",
				storeAssessment: "storeCurrentVendorAssessment"
			}),
			canNextLQAStepByTier(wordCount, nextStep, tier) {
				const tierInfo = this.tiersInfo[tier]
				const index = tierInfo.find(({ minWordCount }) => {
					return minWordCount <= Math.round(wordCount)
				})
				return index ? index.allowSteps.includes(nextStep) : false
			},
			canNextAssessment(assessment, industryData, row, nextStep, previousStep) {
				if (row[nextStep].grade || !row[previousStep].grade) return false

				const { sourceLanguage, targetLanguage } = assessment
				const languagePair = sourceLanguage.lang + ' >> ' + targetLanguage.lang
				const industryName = industryData.industry.name

				if (!this.assessmentsWordCount.length) return false
				const wordCount = this.assessmentsWordCount
						.find(({ langPair, industry }) => langPair === languagePair && industry === industryName).wordCount

				return this.canNextLQAStepByTier(wordCount, nextStep, 1)
			},
			async saveVendorLqa({ vendorData }) {
				const { file, grade, sourceLanguage, targetLanguage, step, mainIndex, industryIndex, stepIndex } = vendorData
				const assessment = {
					...this.currentAssessment,
					isNew: false,
					step,
					source: sourceLanguage,
					target: targetLanguage,
					mainIndex,
					industryIndex,
					stepIndex,
					[this.currentField]: { fileName: "", path: "", grade }
				}
				let formData = new FormData()
				formData.append("vendorId", this.$route.params.id)
				formData.append("assessment", JSON.stringify(assessment))
				formData.append("assessmentFile", file)

				try {
					await this.storeAssessment(formData)
					this.alertToggle({
						message: "Assessment saved",
						isShow: true,
						type: "success"
					})
				} catch (err) {
				} finally {
					this.$emit("refreshAssessment")
					this.closeForm()
				}
			},
			closeErrors() {
				this.areErrors = false
			},
			closeForm(field) {
				this.isForm = false
			},
			openForm({ field, index, mainIndex, industryIndex }) {
				const stepData = this.assessmentData[mainIndex]
				const { sourceLanguage, targetLanguage, industries } = stepData
				this.currentAssessment = industries[industryIndex]
				const currentStep = this.currentAssessment.steps[index].step
				this.currentIndex = index
				this.currentField = field.toLowerCase()

				this.lqaData = {
					vendor: {
						name: `${ this.currentVendor.firstName } ${ this.currentVendor.surname }`,
						industry: this.currentAssessment.industry.name,
						sourceLang: sourceLanguage.lang,
						targetLang: targetLanguage.lang,
						step: currentStep.title
					},
					step: currentStep.title,
					sourceLanguage: sourceLanguage,
					targetLanguage: targetLanguage,
					industry: industries[industryIndex].industry,
					[`is${ field }`]: true,
					mainIndex,
					industryIndex,
					stepIndex: index
				}
				this.isForm = true
			},
			async getVendorReports() {
				try {
					const res = await this.$http.get(`/vendorsapi/get-vendor-wordcount-from-reports/${ this.$route.params.id }`)
					this.assessmentsWordCount = res.body
				} catch (err) {
					console.log(err)
				}
			}
		},
		computed: {
			...mapGetters({
				tiersInfo: 'getTiersInfo'
			})
		},
		components: {
			SettingsTable,
			VendorLqa
		},
		mounted() {
			this.domain = __WEBPACK__API_URL__
		},
		created() {
			this.getVendorReports()
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors.scss";
  @import "../../assets/styles/settingsTable";

  .assessment {
    &__languages {
      font-size: 16px;
      font-family: 'Myriad600';
      padding-bottom: 7px;
    }

    &__industry {
      &-title {
        font-size: 14px;
        font-family: 'Myriad600';
        padding-bottom: 7px;
      }
    }

    &__subtitle {
      font-size: 14px;
      padding-bottom: 4px;
      font-family: 'Myriad600';
    }

    &__pair {
      font-size: 19px;
    }

    &__data {
      padding: 7.5px 5px;
    }

    &__editing-data {
      @extend %table-data;
      box-shadow: inset 0 0 7px $brown-shadow;
    }

    &__input {
      @extend %table-text-input;
    }

    &__icons {
      @extend %table-icons;
    }

    &__icon {
      @extend %table-icon;
    }

    &_opacity {
      opacity: 1;
    }

    &__no-file {
      opacity: 0.5;
    }

    &__upload {
      position: relative;
      background: url("../../assets/images/upload-blue.png");
      background-position: center;
      background-repeat: no-repeat;
      height: 30px;
      overflow: hidden;
      margin-left: 5px;
    }

    &__load-file {
      width: 100%;
      height: 100%;
      border: none;
      outline: none;
      opacity: 0;
      z-index: 2;
      position: absolute;
      cursor: pointer;
      font-size: 0;
    }

    &__download {
      height: 21px;
      width: 21px;
      margin-top: -5px;
      margin-left: 15px;
      cursor: pointer;
    }

    &__form {
      width: 70%;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }

    &__grade {
      padding: 8.5px 0 0 5px;
      display: flex;
      justify-content: center;
    }
  }
</style>
