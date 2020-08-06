<template lang="pug">
.assessment
    .assessment__form(v-if="isForm")
        VendorLqa(:vendorData="lqaData" @closeForm="closeForm()"  @saveVendorLqa="saveVendorLqa")

    .assessment__subtitle Download and check file 
    .assessment__subtitle Make sure to convert all doc file into PDF
    .assessment__item(v-for="(stepData, stepIndex ) in assessmentData")
        //- .assessment__step {{ stepData.step }}
        .assessment__language(v-for="(langsData, langsIndex) in stepData.langsData")
            .assessment__pair {{ getPair(langsData) }}
            .assessment__table
                SettingsTable(
                    :fields="fields"
                    :tableData="langsData.industries"
                    :errors="errors"
                    :areErrors="areErrors" 
                    :isApproveModal="isDeleting"
                )

                    template(v-for="field in fields"  :slot="field.headerKey" slot-scope="{ field }")
                        .assessment__head-title {{ field.label }}
                    
                    template(slot="industry" slot-scope="{ row, index }")
                        .assessment__data(v-if="row.industry") {{ row.industry.name }}
                    
                    template(slot="tqi" slot-scope="{ row, index }")
                        div(v-if="row.tqi.grade" :class="'assessment__grade'") {{ row.tqi.grade }}
                          a(:href="domain + row.tqi.path")
                              img( :class="'assessment__download'" src="../../assets/images/download-big-b.png")

                    template(slot="lqa1" slot-scope="{ row, index }")
                        div(v-if="row.lqa1.grade" :class="'assessment__grade'") {{ row.lqa1.grade }}
                          a(:href="domain + row.lqa1.path")
                              img( :class="'assessment__download'" src="../../assets/images/download-big-b.png")
                        .assessment__upload(v-if="!row.lqa1.grade && row.tqi.grade")
                            .assessment__load-file(@click="openForm({field: 'Lqa1', index, stepIndex, langsIndex})")

                    template(slot="lqa2" slot-scope="{ row, index }")
                        div(v-if="row.lqa2.grade" :class="'assessment__grade'") {{ row.lqa2.grade }}
                          a(:href="domain + row.lqa2.path")
                              img( :class="'assessment__download'" src="../../assets/images/download-big-b.png")
                        .assessment__upload(v-if="!row.lqa2.grade && row.lqa1.grade")
                            .assessment__load-file(@click="openForm({field: 'Lqa2', index, stepIndex, langsIndex})")

                    template(slot="lqa3" slot-scope="{ row, index }")
                        div(v-if="row.lqa3.grade" :class="'assessment__grade'") {{ row.lqa3.grade }}
                          a(:href="domain + row.lqa3.path")
                              img( :class="'assessment__download'" src="../../assets/images/download-big-b.png")
                        .assessment__upload(v-if="!row.lqa3.grade && row.lqa2.grade")
                            .assessment__load-file(@click="openForm({field: 'Lqa3', index, stepIndex, langsIndex})")
</template>

<script>
import SettingsTable from "../Table/SettingsTable";
import VendorLqa from "../vendors/VendorLqa";
import { mapGetters, mapActions } from "vuex";

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
          label: "Industry",
          headerKey: "headerIndustry",
          key: "industry",
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
      domain: "http://localhost:3001"
    };
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle",
      storeAssessment: "storeCurrentVendorAssessment"
    }),
    getPair(langsData) {
        if(langsData.source) {
            return `${langsData.source.lang} >> ${langsData.target.lang}`;
        }
        return langsData.target.lang;
    },
    async saveVendorLqa({ vendorData }) {
      const { file, grade, source, target, step, industryId } = vendorData;
      const assessment = {
        ...this.currentAssessment,
        step,
        source,
        target,
        [this.currentField]: { fileName: "", path: "", grade }
      };
      let formData = new FormData();
      formData.append("vendorId", this.currentVendor._id);
      formData.append("index", this.currentIndex);
      formData.append("assessment", JSON.stringify(assessment));
      formData.append("assessmentFile", file);

      try {
        const result = await this.storeAssessment(formData);
        this.alertToggle({
          message: "Assessment saved",
          isShow: true,
          type: "success"
        });
      } catch (err) {
      } finally {
        this.$emit("refreshAssessment");
        this.closeForm();
      }
    },
    closeErrors() {
      this.areErrors = false;
    },
    closeForm(field) {
      this.isForm = false;
    },
    openForm({ field, index, stepIndex, langsIndex }) {
      const stepData = this.assessmentData[stepIndex];
      const { source, target, industries } = stepData.langsData[langsIndex];
      this.currentAssessment = industries[index];
      this.currentIndex = index;
      this.currentField = field.toLowerCase();

      this.lqaData = {
        vendor: {
          name: `${this.currentVendor.firstName} ${this.currentVendor.surname}`,
          industry: this.currentAssessment.industry.name,
          sourceLang: source.lang,
          targetLang: target.lang,
          step: stepData.step.title,
        },
        step: stepData.step,
        source,
        target,
        industry: industries[index].name,
        industryId: industries[index]._id,
        [`is${field}`]: true
      };
      this.isForm = true;
    }
  },
  components: {
    SettingsTable,
    VendorLqa
  },
  mounted() {
    this.domain = __WEBPACK__API_URL__;
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";
@import "../../assets/styles/settingsTable";

.assessment {
  @extend %setting-table;
  margin: 20px 10px 40px;
  width: 920px;
  box-shadow: 0 0 10px #67573e9d;
  padding: 40px;

  &__subtitle {
    font-size: 14px;
    padding-bottom: 4px;
    font-weight: 600;
  }
  &__step {
    margin: 10px 0;
  }
  &__pair {
    font-size: 18px;
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
  }
}
</style>
