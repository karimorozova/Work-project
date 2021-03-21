<template lang="pug">
  .lqa-table(v-if="vendorsData")
    .lqa-table__form(v-if="isForm")
      VendorLqa(:vendorData="lqaData", @closeForm="closeForm()", @saveVendorLqa="saveVendorLqa")
    DataTable(
      :fields="fields"
      bodyRowClass="cursor-default"
      :tableData="vendorsData"
      :bodyClass="vendorsData.length < 6 ? 'tbody_visible-overflow' : ''"
      :tableheadRowClass="vendorsData.length < 6 ? 'tbody_visible-overflow' : ''"
    )
      .lqa-table__header(v-for="{label, headerKey} in fields" :slot="headerKey" slot-scope="{ field }") {{ label }}

      .lqa-table__data(slot="vendor" slot-scope="{ row }") {{ row.name }}

      .lqa-table__data(slot="wordcount" slot-scope="{ row }") {{ row.wordCount | roundWordCount}}

      .lqa-table__data(slot="tqi" slot-scope="{ row }")
        a(v-if="getStepInfo(row,'tqi').path" :href="domain + getStepInfo(row, 'tqi').path" class="lqa-table__link" target="_blank")
          span {{ getStepInfo(row, 'tqi').grade }}
          img(:class="'lqa-table__download'" src="../../../assets/images/download-big-b.png")
        .lqa-table__upload(v-if="canNextStep(row,'tqi')")
          .lqa-table__load-file(@click="openForm({field: 'tqi', row})")

      .lqa-table__data(slot="lqa1" slot-scope="{ row }")
        a(v-if="getStepInfo(row,'lqa1').path" :href="domain + getStepInfo(row,'lqa1').path" class="lqa-table__link" target="_blank")
          span {{ getStepInfo(row,'lqa1').grade }}
          img(:class="'lqa-table__download'" src="../../../assets/images/download-big-b.png")
        .lqa-table__upload(v-if="canNextStep(row,'lqa1', 'tqi')")
          .lqa-table__load-file(@click="openForm({field: 'Lqa1', row})")

      .lqa-table__data(slot="lqa2" slot-scope="{ row }")
        a(v-if="getStepInfo(row,'lqa2').path" :href="domain + getStepInfo(row,'lqa2').path" class="lqa-table__link" target="_blank")
          span {{ getStepInfo(row,'lqa2').grade }}
          img(:class="'lqa-table__download'" src="../../../assets/images/download-big-b.png")
        .lqa-table__upload(v-if="canNextStep(row,'lqa2', 'lqa1')")
          .lqa-table__load-file(@click="openForm({field: 'Lqa2', row})")

      .lqa-table__data(slot="lqa3" slot-scope="{ row }")
        a(v-if="getStepInfo(row,'lqa3').path" :href="domain + getStepInfo(row,'lqa3').path" class="lqa-table__link" target="_blank")
          .dowlowad
            span {{ getStepInfo(row,'lqa3').grade }}
            img(:class="'lqa-table__download'" src="../../../assets/images/download-big-b.png")
        .lqa-table__upload(v-if="canNextStep(row,'lqa3', 'lqa2')")
          .lqa-table__load-file(@click="openForm({field: 'Lqa3', row})")

      .lqa-table__data.center(slot="link" slot-scope="{ row }")
        a(:href="getVendorProfileLink(row.vendor._id)" target="_blank" style="position: relative")
          i.fa.fa-external-link.icon-link


</template>

<script>
	import DataTable from "@/components/DataTable";
  import VendorLqa from "../../vendors/VendorLqa";
  import { mapGetters, mapActions } from "vuex";

	export default {
    props: {
      vendorsData: { type: Array, default: () => [] },
      industryTier: 0,
      tiersInfo: {1: {}, 2: {}, 3: {}}
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
        currentAssessment: {}
      }
    },
    methods: {
      ...mapActions({
        storeAssessment: "storeCurrentVendorAssessment",
      }),
      openForm({field,row}) {
        const { sourceLanguage, targetLanguage } = row.assessmentInfo.languages;
        this.currentAssessment = row.assessmentInfo.foundAssessment
        const step = row.step
        const industry = row.assessmentInfo.industryGroup
        const mainIndex = row.assessmentInfo.langPairIndex
        const industryIndex = row.assessmentInfo.industryIndex
        this.currentField = field.toLowerCase();
        this.lqaData = {
          vendor: {

            name: row.name,
            industries: industry.name,
                sourceLang: sourceLanguage.lang,
                targetLang: targetLanguage.lang,
                step: step.title,
          },
            step: step,
            vendorId: row.vendor._id,
            source: sourceLanguage,
            target: targetLanguage,
            industry: industry,
            [`is${field}`]: true,
            field,
            mainIndex,
            industryIndex,
            stepIndex: 0,
        };

        this.isForm = true;
      },
      async saveVendorLqa({ vendorData }) {

        const { file, grade, source, target, step, mainIndex, industryIndex, stepIndex, vendorId, industry} = vendorData;
        let assessment;
        const baseAssessmentInfo = {
          step,
          target,
          industry,
          source,
        };
        if (this.currentField === "tqi") {
          assessment = {
            ...baseAssessmentInfo,
            step:[step],
            industry: [industry],
            tqi: { fileName: "", path: "", grade },
            lqa1: {},
            lqa2: {},
            lqa3: {},
            isNew: true,
          };
        } else {
          assessment = {
            ...baseAssessmentInfo,
            ...this.currentAssessment,
            isNew: false,
            mainIndex,
            industryIndex,
            stepIndex,
            [this.currentField]: { fileName: "", path: "", grade },
          };
        }

        let formData = new FormData();
        formData.append("vendorId", vendorId);
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
      getStepInfo(row, step) {
        const assessmentInfo = row.assessmentInfo
        if (!assessmentInfo || !assessmentInfo.foundAssessment) return false
        return assessmentInfo.foundAssessment.steps[0][step] || false
      },

      getVendorProfileLink(vendorId) {
        return '/vendors/details/' + vendorId
      },
      canNextStep(row, step, previousStep = ''){
        const reformStepName = this.reformStep(step)
        if( this.getStepInfo(row,step).grade) return false
        if (previousStep.length > 0){
          if(!this.getStepInfo(row,previousStep).grade) return false

        }
        return this.canNextLQAStepByTier(row.wordCount, reformStepName, this.industryTier || 1)

      },
      canNextLQAStepByTier(wordCount, nextStep, tier) {
        const tierInfo = this.tiersInfo[tier]
        const index = tierInfo.find(({minWordCount}) =>  {
          return  minWordCount <= Math.round(wordCount)
        });
        return index ? index.allowSteps.includes(nextStep) : false
      },
      reformStep(step) {
        if (step === 'tqi') return step
        return step.charAt(0).toUpperCase() + step.slice(1);
      }
    },
    mounted() {
      this.domain = __WEBPACK__API_URL__;
    },
    computed: {
		  ...mapGetters({
        allLanguages: 'getAllLanguages',
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
        font-size: 16px;
      }
    }
    &__data.center {
      text-align: center;
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
