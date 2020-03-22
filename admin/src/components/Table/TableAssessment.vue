<template lang="pug">
.assessment

    .assessment__form(v-if="isFormLqa1")
        VendorLqaForm(:vendorData="vendorDataLqa1" :uploadForm="true" @closeForm="closeForm('lqa1')"  @saveVendorLqa="saveVendorLqa")
    .assessment__form(v-if="isFormLqa2")
        VendorLqaForm(:vendorData="vendorDataLqa2" :uploadForm="true" @closeForm="closeForm('lqa2')"  @saveVendorLqa="saveVendorLqa")
    .assessment__form(v-if="isFormLqa3")
        VendorLqaForm(:vendorData="vendorDataLqa3" :uploadForm="true" @closeForm="closeForm('lqa3')"  @saveVendorLqa="saveVendorLqa")

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
                .assessment__data(v-if="row.industry") {{ row.industry }}
            
            template(slot="tqi" slot-scope="{ row, index }")
                div(v-if="row.tqi.grade" :class="'assessment__grade'") {{ row.tqi.grade }}
                  a(:href="domain + row.tqi.filePath")
                    img(v-if="!row.fileName" :class="'assessment__download'" src="../../assets/images/download-big-b.png")

            template(slot="lqa1" slot-scope="{ row, index }")
                div(v-if="row.lqa1.grade" :class="'assessment__grade'") {{ row.lqa1.grade }}
                  a(:href="domain + row.lqa1.filePath")
                    img(v-if="!row.fileName" :class="'assessment__download'" src="../../assets/images/download-big-b.png")
                .assessment__upload(v-if="row.tqi.grade > 50 && !row.lqa1.grade")
                    .assessment__load-file(@click="openForm('lqa1')")

            template(slot="lqa2" slot-scope="{ row, index }")
                div(v-if="row.lqa2.grade" :class="'assessment__grade'") {{ row.lqa2.grade }}
                  a(:href="domain + row.lqa2.filePath")
                    img(v-if="!row.fileName" :class="'assessment__download'" src="../../assets/images/download-big-b.png")
                .assessment__upload(v-if="row.lqa1.grade > 50 && !row.lqa2.grade")
                    .assessment__load-file(@click="openForm('lqa2')")

            template(slot="lqa3" slot-scope="{ row, index }") 
                div(v-if="row.lqa3.grade" :class="'assessment__grade'") {{ row.lqa3.grade }}
                  a(:href="domain + row.lqa3.filePath")
                    img(v-if="!row.fileName" :class="'assessment__download'" src="../../assets/images/download-big-b.png")
                .assessment__upload(v-if="row.lqa2.grade > 50 && !row.lqa3.grade")
                    .assessment__load-file(@click="openForm('lqa3')")
</template>

<script>
import SettingsTable from "./SettingsTable";
import VendorLqaForm from "../reports/upcomingLqas/VendorLqaForm";
import { mapGetters, mapActions } from "vuex";

export default {
  props: {
    vendorId: {
      type: String
    },
    assessmentData: {
      type: Array,
      default: () => []
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

      vendorDataLqa1: {
        vendor: {
          name: "TEST1",
          language: {
            lang: "TEST"
          }
        },
        industry: "TEST",
        isLqa1: true,
        isLqa2: false,
        isLqa3: false
      },
      vendorDataLqa2: {
        vendor: {
          name: "TEST2",
          language: {
            lang: "TEST"
          }
        },
        industry: "TEST",
        isLqa1: false,
        isLqa2: true,
        isLqa3: false
      },
      vendorDataLqa3: {
        vendor: {
          name: "TEST3",
          language: {
            lang: "TEST"
          }
        },
        industry: "TEST",
        isLqa1: false,
        isLqa2: false,
        isLqa3: true
      },

      isFormLqa1: false,
      isFormLqa2: false,
      isFormLqa3: false,

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
      formData.append("assessment", vendorData);
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
      }
      this.closeAllForms();
    },
    closeAllForms() {
      this.isFormLqa1 = false;
      this.isFormLqa2 = false;
      this.isFormLqa3 = false;
    },
    closeErrors() {
      this.areErrors = false;
    },
    closeForm(field) {
      field == "lqa1"
        ? (this.isFormLqa1 = false)
        : field == "lqa2"
        ? (this.isFormLqa2 = false)
        : field == "lqa3"
        ? (this.isFormLqa3 = false)
        : false;
    },
    openForm(field) {
      field == "lqa1"
        ? (this.isFormLqa1 = true)
        : field == "lqa2"
        ? (this.isFormLqa2 = true)
        : field == "lqa3"
        ? (this.isFormLqa3 = true)
        : false;
    }
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
    background: url("../../assets/images/Other/upload-icon.png");
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
    height: 16px;
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
  &__grade{
    padding: 4px 5px;
  }
}
</style>
