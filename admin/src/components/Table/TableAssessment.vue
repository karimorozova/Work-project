<template lang="pug">
.assessment 
    .assessment__form(v-if="isForm")
        VendorLqaForm(:vendorData="vendorData" :uploadForm="true" @closeForm="closeForm()"  @saveVendorLqa="saveVendorLqa")

    .assessment__subtitle Download and check file 
    .assessment__subtitle Make sure to convert all doc file into PDF
    .assessment__table
        SettingsTable(
            :fields="fields"
            :tableData="assessmentData"
            :errors="errors"
            :areErrors="areErrors" 
            :isApproveModal="isDeleting"
            :bodyClass="'vendor__assessment-body'"
            :headerClass="'vendor__assessment-header'"
        )

            template(v-for="field in fields"  :slot="field.headerKey" slot-scope="{ field }")
                .assessment__head-title {{ field.label }}
            
            template(slot="industry" slot-scope="{ row, index }")
                .assessment__data(v-if="row.industry") {{ row.industry.name }}
            
            template(slot="tqi" slot-scope="{ row, index }")
                div(v-if="!row.tqi == ''" :class="'assessment__grade'") {{ row.tqi.grade }}
                  a(:href="domain + row.tqi.path")
                    img( :class="'assessment__download'" src="../../assets/images/download-big-b.png")

            template(slot="lqa1" slot-scope="{ row, index }")
                div(v-if="!row.lqa1 == ''" :class="'assessment__grade'") {{ row.lqa1.grade }}
                  a(:href="domain + row.lqa1.path")
                    img( :class="'assessment__download'" src="../../assets/images/download-big-b.png")
                span(v-if="!row.tqi == ''")
                  .assessment__upload
                      .assessment__load-file(@click="openForm('isLqa1',index)")

            template(slot="lqa2" slot-scope="{ row, index }")
                div(v-if="!row.lqa2 == ''" :class="'assessment__grade'") {{ row.lqa2.grade }}
                  a(:href="domain + row.lqa2.path")
                    img( :class="'assessment__download'" src="../../assets/images/download-big-b.png")
                span(v-if="!row.lqa1 == ''" )
                  .assessment__upload
                      .assessment__load-file(@click="openForm('isLqa2',index)")

            template(slot="lqa3" slot-scope="{ row, index }")
                div(v-if="!row.lqa3 == ''" :class="'assessment__grade'") {{ row.lqa3.grade }}
                  a(:href="domain + row.lqa3.path")
                    img( :class="'assessment__download'" src="../../assets/images/download-big-b.png")
                span(v-if="!row.lqa2 == ''" )
                  .assessment__upload
                      .assessment__load-file(@click="openForm('isLqa3',index)")


</template>

<script>
import SettingsTable from "./SettingsTable";
import VendorLqaForm from "../reports/upcomingLqas/VendorLqaForm";
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
      vendorData: {},
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
    async saveVendorLqa({ vendorData }) {
      let formData = new FormData();
      formData.append("vendorId", this.currentVendor._id);
      formData.append("index", this.currentIndex);
      formData.append("assessment", JSON.stringify(vendorData));
      formData.append("assessmentFile", vendorData.file);

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
      }
      this.closeForm();
    },
    closeErrors() {
      this.areErrors = false;
    },
    closeForm(field) {
      this.isForm = false;
    },
    openForm(field, index) {
      this.isForm = true;
      this.currentIndex = index;
      this.vendorData = {
        vendor: {
          name: this.currentVendor.firstName + ' ' + this.currentVendor.surname,
          language: {
            lang: " "
          }
        },
        industry: this.assessmentData[index].industry.name,
        industryId: this.assessmentData[index].industry._id,
        [field]: true
      };
    },

  },
  components: {
    SettingsTable,
    VendorLqaForm
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
  width: 960px;
  box-shadow: 0 0 15px #67573e9d;

  &__subtitle {
    font-size: 14px;
    padding-bottom: 4px;
    font-weight: 600;
  }
  &__data {
    padding: 8.5px 5px;
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
    height: 20px;
    width: 20px;
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
    padding: 8.5px 5px;
  }
}
</style>
