<template lang="pug">
  .lqa-table(v-if="vendorsData")
    .lqa-table__form(v-if="isForm")
      VendorLqa(:vendorData="lqaData", @closeForm="closeForm()", @saveVendorLqa="saveVendorLqa")
    DataTable(
      :fields="fields"
      :tableData="vendorsData"
      :bodyClass="vendorsData.length < 6 ? 'tbody_visible-overflow' : ''"
      :tableheadRowClass="vendorsData.length < 6 ? 'tbody_visible-overflow' : ''"
    )
      .lqa-table__header(v-for="{label, headerKey} in fields" :slot="headerKey" slot-scope="{ field }") {{ label }}

      .lqa-table__data(slot="vendor" slot-scope="{ row }") {{ row.name }}

      .lqa-table__data(slot="wordcount" slot-scope="{ row }") {{ row.wordCount | roundWordCount}}

      .lqa-table__data(slot="tqi" slot-scope="{ row }")
        a(v-if="getTQIInfo(row).path" :href="domain + getTQIInfo(row).path" class="lqa-table__link" target="_blank")
          span {{ getTQIInfo(row).grade }}
          img(:class="'lqa-table__download'" src="../../../assets/images/download-big-b.png")
        .lqa-table__upload(v-if="!getTQIInfo(row).grade")
          .lqa-table__load-file(@click="openForm(getTQIInfo(row))")

      .lqa-table__data(slot="lqa1" slot-scope="{ row }")
        a(v-if="getLQAOneInfo(row).path" :href="domain + getLQAOneInfo(row).path" class="lqa-table__link" target="_blank")
          span {{ getLQAOneInfo(row).grade }}
          img(:class="'lqa-table__download'" src="../../../assets/images/download-big-b.png")
        .lqa-table__upload(v-if="!getLQAOneInfo(row).grade && getTQIInfo(row).grade")
          .lqa-table__load-file(@click="openForm({ field: 'Lqa3', index, mainIndex, industryIndex })")

      .lqa-table__data(slot="lqa2" slot-scope="{ row }")
        a(v-if="getLQATwoInfo(row).path" :href="domain + getLQATwoInfo(row).path" class="lqa-table__link" target="_blank")
          span {{ getLQATwoInfo(row).grade }}
          img(:class="'lqa-table__download'" src="../../../assets/images/download-big-b.png")
        .lqa-table__upload(v-if="!getLQATwoInfo(row).grade && getLQAOneInfo(row).grade")
          .lqa-table__load-file(@click="openForm({ field: 'Lqa3', index, mainIndex, industryIndex })")

      .lqa-table__data(slot="lqa3" slot-scope="{ row }")
        a(v-if="getLQAThreeInfo(row).path" :href="domain + getLQAThreeInfo(row).path" class="lqa-table__link" target="_blank")
          .dowlowad
            span {{ getLQAThreeInfo(row).grade }}
            img(:class="'lqa-table__download'" src="../../../assets/images/download-big-b.png")
        .lqa-table__upload(v-if="!getLQAThreeInfo(row).grade && getLQATwoInfo(row).grade")
          .lqa-table__load-file(@click="openForm({ field: 'Lqa3', index, mainIndex, industryIndex })")

      .lqa-table__data(slot="link" slot-scope="{ row }")
        a(:href="getVendorProfileLink(row.vendor._id)" target="_blank" style="position: relative")
          i.fa.fa-external-link.icon-link


</template>

<script>
	import DataTable from "@/components/DataTable";
  import VendorLqa from "../../vendors/VendorLqa";
  import { mapGetters } from "vuex";

	export default {
    props: {
      vendorsData: { type: Array, default: () => [] },
      additionalInformation: {type: Object}
    },
    data() {
      return {
        fields: [
          { label: "Vendor Name", headerKey: "headerVendor", key: "vendor", width: "35%"},
          { label: "Wordcount", headerKey: "headerWords", key: "wordcount", width: "12%"},
          { label: "TQI", headerKey: "headerTqi", key: "tqi", width: "12%"},
          { label: "LQA 1", headerKey: "headerLqa1", key: "lqa1", width: "12%"},
          { label: "LQA 2", headerKey: "headerLqa2", key: "lqa2", width: "12%"},
          { label: "LQA 3", headerKey: "headerLqa3", key: "lqa3", width: "12%"},
          { label: "", headerKey: "headerLink", key: "link", width: "5%"},
        ],
        domain: "http://localhost:3001",
        isForm: false,
        assessmentsInfo: {}
      }
    },
    methods: {
      openForm(row) {
        // console.log(row)
        // const stepData = this.assessmentData[mainIndex];
        // const { sourceLanguage, targetLanguage, industries } = row.vendor;
        // this.currentAssessment = industries[index];
        // const currentStep = this.currentAssessment.steps[industryIndex].step;
        // this.currentIndex = index;
        // this.currentField = field.toLowerCase();
        //
        // this.lqaData = {
        //   vendor: {
        //     name: row.name,
            // industry: this.currentAssessment.industry.name,
            //     sourceLang: sourceLanguage.lang,
            //     targetLang: targetLanguage.lang,
            //     step: currentStep.title,
          // },
          //   step: currentStep.title,
          //   sourceLanguage: sourceLanguage,
          //   targetLanguage: targetLanguage,
          //   industry: industries[index].industry,
          //   [`is${field}`]: true,
          //   mainIndex,
          //   industryIndex,
          //   stepIndex: index,
        // };
        this.isForm = true;
      },
      async saveVendorLqa({ vendorData }) {
        const { file, grade, source, target, step, mainIndex, industryIndex, stepIndex } = vendorData;
        const assessment = {
          ...this.currentAssessment,
          isNew: false,
          step,
          source,
          target,
          mainIndex,
          industryIndex,
          stepIndex,
          [this.currentField]: { fileName: "", path: "", grade },
        };
        let formData = new FormData();
        formData.append("vendorId", this.currentVendor._id);
        formData.append("assessment", JSON.stringify(assessment));
        formData.append("assessmentFile", file);

        try {
          const result = await this.storeAssessment(formData);
          this.alertToggle({
            message: "Assessment saved",
            isShow: true,
            type: "success",
          });
        } catch (err) {
        } finally {
          this.$emit("refreshAssessment");
          this.closeForm();
        }
      },
      closeForm(field) {
        this.isForm = false;
      },
      getStepLink(assessment, step) {
        // const languages = this.additionalInformation.languagePair.split(' >> ')
        // const industryGroup = this.additionalInformation.industryGroup
        // const sourceLang = this.findLanguageByTitle(languages[0])
        // const targetLang = this.findLanguageByTitle(languages[1])
        // const sourceLangId = sourceLang ? sourceLang._id : null
        // const targetLangId = targetLang ? targetLang._id : null
        //
        // if (!targetLang || !assessment || !assessment.length) return null
        //
        // const assessmentLangPair = assessment.find(({sourceLanguage, targetLanguage}) =>
        //   (
        //     sourceLanguage.toString() === sourceLangId.toString()
        //     && targetLanguage.toString() === targetLangId.toString()
        //   )
        // )
        //
        // if (!assessmentLangPair || !assessmentLangPair.industries.length) return null;
        //
        // const assessmentIndustry = assessmentLangPair.industries.find(({industry}) => {
        //   return industry === industryGroup._id.toString()
        // })
        const assessmentIndustry =  this.getAssessmentInfo(assessment)
        //
        return assessmentIndustry && assessmentIndustry.foundAssessment ? assessmentIndustry.foundAssessment.steps[0][step] : null
        // return assessmentIndustry  ? assessmentIndustry.steps[0][step] : null

      },

      getTQIInfo(row) {
        return this.getStepLink(row.vendor.assessments,'tqi') || false
      },
      getLQAOneInfo(row) {
        return this.getStepLink(row.vendor.assessments,'lqa1') || false
      },
      getLQATwoInfo(row) {
        return this.getStepLink(row.vendor.assessments,'lqa2') || false
      },
      getLQAThreeInfo(row) {
        return this.getStepLink(row.vendor.assessments,'lqa3') || false
      },

      findLanguageByTitle(title) {
        return this.allLanguages.find(language=>{
          return language.lang === title
        })
      },
      getVendorProfileLink(vendorId) {
        return '/vendors/details/' + vendorId
      },
      getAssessmentInfo(assessment) {
        const languages = this.additionalInformation.languagePair.split(' >> ')
        const industryGroup = this.additionalInformation.industryGroup
        const sourceLang = this.findLanguageByTitle(languages[0])
        const targetLang = this.findLanguageByTitle(languages[1])
        const sourceLangId = sourceLang ? sourceLang._id : null
        const targetLangId = targetLang ? targetLang._id : null

        if (!targetLang || !assessment || !assessment.length) return null

        const langPairIndex = assessment.findIndex(({sourceLanguage, targetLanguage}) =>
          (
            sourceLanguage.toString() === sourceLangId.toString()
            && targetLanguage.toString() === targetLangId.toString()
          )
        )

        if (!assessment[langPairIndex] || !assessment[langPairIndex].industries.length) return null;

        const industryIndex = assessment[langPairIndex].industries.findIndex(({industry}) => {
          return industry === industryGroup._id.toString()
        })

        const foundAssessment = assessment[langPairIndex].industries[industryIndex] || null


        // this.assessmentsInfo = {foundAssessment, langPairIndex, industryIndex}

        return {foundAssessment, langPairIndex, industryIndex}
      }
    },
    computed: {
		  ...mapGetters({
        allLanguages: 'getAllLanguages'
      }),
    },
		components: {
			DataTable,
      VendorLqa
		}
	}
</script>

<style lang="scss" scoped>

  .lqa-table {
    margin-top: 3px;

    a{
      color: #67573e;
      text-decoration: none;

      .icon-link {
        font-size: 18px;
      }
    }
    &__download {
      height: 21px;
      width: 21px;
      margin: -4px 7px;
    }
    &__upload {
      position: relative;
      background: url("../../../assets/images/upload-blue.png");
      background-position: center;
      background-repeat: no-repeat;
      height: 20px;
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
    &__form {
      width: 70%;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
    &__link {
      display: flex;
      justify-content: center;
    }


  }
</style>
