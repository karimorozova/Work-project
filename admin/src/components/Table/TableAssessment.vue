<template lang="pug">
.assessment 
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
                .assessment__data(v-if="currentActive !== index") {{ row.industry }}
                .assessment__editing-data(v-else) 
                    input.assessment__input(type="text" readonly )
            
            template(slot="tqi" slot-scope="{ row, index }")
                .assessment__data(v-if="currentActive !== index") {{ row.tqi }}
                .assessment__editing-data(v-else) 
                    input.assessment__input(type="text" readonly )

            template(slot="lqa1" slot-scope="{ row, index }")
                  .assessment__data(v-if="currentActive !== index") {{ row.lqa1 }}
                  .assessment__editing-data(v-else) 
                      input.assessment__input(type="text" readonly)

            template(slot="lqa2" slot-scope="{ row, index }")
                  .assessment__data(v-if="currentActive !== index") {{ row.lqa2 }}
                  .assessment__editing-data(v-else) 
                      input.assessment__input(type="text" readonly )

            template(slot="lqa3" slot-scope="{ row, index }")
                  .assessment__upload
                     .assessment__load-file(@click="openForm")
                    
    Add(@add="addData")

    .assessment__form(v-if="isForm")
        VendorLqaForm(:vendorData="vendorData" :uploadForm="true" @closeForm="closeForm"  @saveVendorLqa="saveVendorLqa")
            


</template>

<script>
import SettingsTable from "./SettingsTable";
import DataTable from "../DataTable";
import Add from "../Add";
import VendorLqaForm from "../reports/upcomingLqas/VendorLqaForm";
import { mapGetters, mapActions } from "vuex";

export default {
  props: {
    assessmentData: {
      type: Array
    }
  },
  data() {
    return {
      fields: [
        {
          label: "Industry",
          headerKey: "headerIndustry",
          key: "industry",
          width: "26%",
          padding: "0"
        },
        {
          label: "TQI",
          headerKey: "headerTQI",
          key: "tqi",
          width: "26%",
          padding: "0"
        },
        {
          label: "LQA 1",
          headerKey: "headerLQA1",
          key: "lqa1",
          width: "16%",
          padding: "0"
        },
        {
          label: "LQA 2",
          headerKey: "headerLQA2",
          key: "lqa2",
          width: "16%",
          padding: "0"
        },
        {
          label: "LQA 3",
          headerKey: "headerLQA3",
          key: "lqa3",
          width: "16%",
          padding: "0"
        }
      ],

      vendorData: {
        _id: "5ddd02be798ffa2a528740bc",
        wordcounts: {
          steps: "Translator, Revisor",
          Finance: 788524.1499999999,
          General: 5408.65,
          iGaming: 999.9,
          Legal: 0,
          Pharma: 0,
          "Sport-Betting": 0,
          "eLearning ": 0,
          Law: 0,
          Medicine: 0,
          "Video Games": 0,
          eLearning: 0
        },

        updatedAt: "2019-11-26T10:39:20.549Z",

        vendor: {
          _id: "5ddd02be798ffa2a528740bb",
          name: "TEST vendor",
          basicPrice: "0.05",
          tqi: "100",
          lqa1: "100",
          lqa2: "100",
          lqa3: "",
          steps: ["Translator", "Revisor"],
          type: "Pangea",
          wordcount: "",
          language: {
            _id: "5dd6aaa318239889b8cc17fa",
            lang: "Arabic [grouped]"
          },

          __v: 0,
          tqis: { Finance: "100", iGaming: "100" },
          lqa1s: { Finance: "100", iGaming: "100" },
          lqa2s: { Finance: "100", iGaming: "100" },
          lqa3s: { Finance: "", iGaming: "" },
          basicPrices: { Finance: "0.05", iGaming: "0.05" }
        },

        __v: 0,
        tier: 1,
        industry: "Finance",
        isLqa1: false,
        isLqa2: false,
        isLqa3: true
      },

      isForm: false,

      currentActive: -1,
      areErrors: false,
      errors: [],
      isDeleting: false,
      deleteIndex: -1
    };
  },
  methods: {
    closeErrors() {
      this.areErrors = false;
    },
    addData() {
      if (this.currentActive !== -1) {
        return this.isEditing();
      }
      this.assessmentData.push({});
      this.currentActive = this.assessmentData.length - 1;
    },
    closeForm() {
      this.isForm = false;
    },
    openForm() {
      this.isForm = true;
    },
  },
  components: {
    SettingsTable,
    DataTable,
    Add,
    VendorLqaForm
  },

  mounted() {}
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
    @extend %table-data;
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
    width: 16px;
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
}
</style>
