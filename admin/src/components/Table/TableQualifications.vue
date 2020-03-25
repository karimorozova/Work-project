<template lang="pug">
.qualifications
  .qualifications__form(v-if="isForm")
        VendorLqaForm(:vendorData="lqaData" :uploadForm="true" @closeForm="closeForm"  @saveVendorLqa="saveVendorLqa")
  .qualifications__table
      SettingsTable(
          :fields="fields"
          :tableData="qualificationData"
          :errors="errors"
          :areErrors="areErrors"
          :isApproveModal="isDeleting" 
          @closeErrors="closeErrors"
          @approve="deleteData"
          @notApprove="setDefaults"
          @closeModal="setDefaults"
      )

          template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
              .qualifications__head-title {{ field.label }}

          template(slot="source" slot-scope="{ row, index }")
              .qualifications__data(v-if="currentActive !== index")
                span.qualifications__source(v-if="row.source") {{ row.source.lang }}
              .qualifications__drop-menu(v-else)
                  SelectSingle(
                      :isTableDropMenu="isTableDropMenu"
                      placeholder="Select"
                      :hasSearch="true"
                      :selectedOption="currentSource.lang"
                      :options="sourceData"
                      @chooseOption="setSource"
                      @scrollDrop="scrollDrop"
                  )

          template(slot="target" slot-scope="{ row, index }")
            .qualifications__data(v-if="currentActive !== index") {{ row.target.lang }}
            .qualifications__drop-menu(v-else)
                SelectSingle(
                    :isTableDropMenu="isTableDropMenu"
                    placeholder="Select"
                    :hasSearch="true"
                    :selectedOption="currentTarget.lang"
                    :options="targetData"
                    @chooseOption="setTarget"
                    @scrollDrop="scrollDrop"
                )

          template(slot="industry" slot-scope="{ row, index }")
            .qualifications__data(v-if="currentActive !== index") {{ row.industry.name }}
            .qualifications__drop-menu(v-else)
                SelectSingle(
                    :isTableDropMenu="isTableDropMenu"
                    placeholder="Select"
                    :hasSearch="true"
                    :selectedOption="currentIndustry.name"
                    :options="industryData"
                    @chooseOption="setIndustry"
                    @scrollDrop="scrollDrop"
                )

          template(slot="step" slot-scope="{ row, index }")
            .qualifications__data(v-if="currentActive !== index") {{ row.step.title }}
            .qualifications__drop-menu(v-else)
                SelectSingle(
                    :isTableDropMenu="isTableDropMenu"
                    placeholder="Select"
                    :hasSearch="true"
                    :selectedOption="currentStep.title"
                    :options="stepsData"
                    @chooseOption="setStep"
                    @scrollDrop="scrollDrop"
                )

          template(slot="status" slot-scope="{ row, index }")
            .qualifications__data(v-if="currentActive !== index") {{ row.status }}
            .qualifications__drop-menu(v-else)
                SelectSingle(
                    :isTableDropMenu="isTableDropMenu"
                    placeholder="Select"
                    :hasSearch="true"
                    :selectedOption="currentStatus"
                    :options="statuses"
                    @chooseOption="setStatus"
                    @scrollDrop="scrollDrop"
                )

          template(slot="icons" slot-scope="{ row, index }")
              .qualifications__icons
                  img.qualifications__icon(v-for="(icon, key) in icons" :src="icon.icon" @click="makeAction(index, key)" :class="{'qualifications_opacity': isActive(key, index)}")
  
  Add(@add="addData")
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import SettingsTable from "./SettingsTable";
import SelectSingle from "../SelectSingle";
import Add from "../Add";
import scrollDrop from "@/mixins/scrollDrop";
import crudIcons from "@/mixins/crudIcons";
import VendorLqaForm from "../reports/upcomingLqas/VendorLqaForm";

export default {
  mixins: [scrollDrop, crudIcons],
  props: {
    qualificationData: {
      type: Array,
      default: () => []
    },
    assessmentData: {
      type: Array,
      default: () => []
    },
    currentVendor: {
      type: Object
    },
    vendorIndustries: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      fields: [
        {
          label: "Source",
          headerKey: "headerSource",
          key: "source",
          width: "17%",
          padding: "0"
        },
        {
          label: "Target",
          headerKey: "headerTarget",
          key: "target",
          width: "17%",
          padding: "0"
        },
        {
          label: "Industry",
          headerKey: "headerIndustry",
          key: "industry",
          width: "17%",
          padding: "0"
        },
        {
          label: "Step",
          headerKey: "headerStep",
          key: "step",
          width: "17%",
          padding: "0"
        },
        {
          label: "Test Status",
          headerKey: "headerStatus",
          key: "status",
          width: "17%",
          padding: "0"
        },
        {
          label: "",
          headerKey: "headerIcons",
          key: "icons",
          width: "15%",
          padding: "0"
        }
      ],

      lqaData: {
        isTqi: true
      },

      statuses: [
        "NA",
        "Sample Requested",
        "Test Sent",
        "Received",
        "Passed",
        "Not Passed"
      ],
      sources: [],
      targets: [],
      steps: [],
      currentSource: "",
      currentTarget: "",
      currentIndustry: "",
      currentStep: "",
      currentStatus: "",
      currentIndex: "",

      areErrors: false,
      errors: [],
      isDeleting: false,
      deleteIndex: -1,
      isTableDropMenu: true,
      currentActive: -1,
      isForm: false
    };
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle",
      storeQualification: "storeCurrentVendorQualification",
      deleteQualification: "deleteCurrentVendorQualification",
      storeAssessment: "storeCurrentVendorAssessment"
    }),
    getQualifications() {
      this.qualificationData = this.currentVendorQualifications;
    },
    async makeAction(index, key) {
      if (this.currentActive !== -1 && this.currentActive !== index) {
        return this.isEditing();
      }
      switch (key) {
        case "edit":
          this.setEditingData(index);
          break;
        case "cancel":
          this.manageCancelEdition(index);
          break;
        case "delete":
          this.manageDeleteClick(index);
          break;
        default:
          await this.checkErrors(index);
      }
    },
    setEditingData(index) {
      this.currentActive = index;
      this.currentSource = this.qualificationData[index].source;
      this.currentTarget = this.qualificationData[index].target;
      this.currentIndustry = this.qualificationData[index].industry;
      this.currentStatus = this.qualificationData[index].status;
      this.currentStep = this.qualificationData[index].step;
    },
    manageCancelEdition(index) {
      this.$emit("refreshQualifications");
      this.setDefaults();
    },
    setDefaults() {
      this.currentActive = -1;
      this.isDeleting = false;
      this.currentSource = "";
      this.currentTarget = "";
      this.currentIndustry = "";
      this.currentStatus = "";
      this.currentStep = "";
    },
    async checkErrors(index) {
      if (this.currentActive === -1) return;
      this.errors = [];
      if (!this.currentSource) this.errors.push("Source should not be empty!");
      if (!this.currentTarget) this.errors.push("Target should not be empty!");
      if (!this.currentIndustry) this.errors.push("Industry should not be empty!");
      if (!this.currentStatus) this.errors.push("Step status should not be empty!");
      if (!this.currentStep) this.errors.push("Step should not be empty!");
      if (this.errors.length) {
        this.areErrors = true;
        return;
      }
      if (this.currentStatus === "Passed") {
        this.handleLqa();
      } else {
        await this.manageSaveClick(index);
      }
    },
    handleLqa() {
        this.lqaData.industry = this.currentIndustry.name;
        this.lqaData.vendor = {
            name: `${this.currentVendor.firstName} ${this.currentVendor.surname}`,
            language: this.currentTarget
            };
        this.openForm();
    },
    async saveVendorLqa({vendorData}) {
      const { file, grade } = vendorData;
      const assessment = {
          industry: this.currentIndustry,
          tqi: {fileName: "", path: "", grade},
          lqa1: {},
          lqa2: {},
          lqa3: {}
      }
      let formData = new FormData();
      formData.append("vendorId", this.currentVendor._id);
      formData.append("index", this.assessmentData.length);
      formData.append("assessment", JSON.stringify(assessment));
      formData.append("assessmentFile", file);
      
      try {
        await this.storeAssessment(formData);
        await this.manageSaveClick(this.currentActive);
      } catch (err) {
      } finally {
        this.closeForm();
      }
    },

    async manageSaveClick(index) {
      let qualification = {
        target: this.currentTarget,
        industry: this.currentIndustry,
        step: this.currentStep,
        status: this.currentStatus
      };
      if (this.currentSource.lang !== "NA") {
        qualification.source = this.currentSource;
      }
      try {
        await this.storeQualification({
          vendorId: this.currentVendor._id,
          index,
          qualification
        });
        this.alertToggle({
          message: "Qualification saved",
          isShow: true,
          type: "success"
        });
      } catch (err) {
      } finally {
        this.manageCancelEdition();
      }
    },

    async manageDeleteClick(index) {
      this.deleteIndex = index;
      this.isDeleting = true;
    },

    async deleteData() {
      try {
        await this.deleteQualification({
          vendorId: this.currentVendor._id,
          index: this.deleteIndex
        });
        this.alertToggle({
          message: "Qualification removed",
          isShow: true,
          type: "success"
        });
      } catch (err) {
      } finally {
        this.manageCancelEdition();
      }
    },

    addData() {
      if (this.currentActive !== -1) {
        return this.isEditing();
      }
      this.qualificationData.push({
        source: "",
        target: "",
        industry: "",
        status: "NA",
        step: ""
      });
      this.setEditingData(this.qualificationData.length - 1);
    },

    async getLangs() {
      try {
        const result = await this.$http.get("/api/languages");
        this.sources = Array.from(result.body);
        this.targets = Array.from(result.body);
        this.sources.unshift({ lang: "NA" });
      } catch (err) {
        this.alertToggle({ message: err.message, isShow: true, type: "error" });
      }
    },

    async getSteps() {
      try {
        const result = await this.$http.get("/api/steps");
        this.steps = result.body;
      } catch (err) {
        this.alertToggle({ message: err.message, isShow: true, type: "error" });
      }
    },
    setSource({ option }) {
      this.currentSource = this.sources.find(item => item.lang === option);
    },
    setTarget({ option }) {
      this.currentTarget = this.targets.find(item => item.lang === option);
    },
    setIndustry({ option }) {
      this.currentIndustry = this.vendorIndustries.find(
        item => item.name === option
      );
    },
    setStatus({ option }) {
      this.currentStatus = option;
    },
    setStep({ option }) {
      this.currentStep = this.steps.find(item => item.title === option);
    },
    closeErrors() {
      this.areErrors = false;
    },
    closeForm() {
      this.isForm = false;
    },
    openForm() {
      this.isForm = true;
    }
  },
  computed: {
    ...mapGetters({
      currentVendorQualifications: "getCurrentVendorQualifications"
    }),
    sourceData() {
      return this.sources.map(item => item.lang);
    },
    targetData() {
      return this.targets.map(item => item.lang);
    },
    industryData() {
      return this.vendorIndustries.map(item => item.name);
    },
    stepsData() {
      return this.steps.map(item => item.title);
    }
  },
  components: {
    SettingsTable,
    SelectSingle,
    VendorLqaForm,
    Add
  },

  mounted() {
    this.getLangs();
    this.getSteps();
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";
@import "../../assets/styles/settingsTable";

.qualifications {
  @extend %setting-table;
  margin: 20px 10px 40px;
  width: 960px;
  box-shadow: 0 0 15px #67573e9d;

  &__data {
    @extend %table-data;
    overflow-x: hidden;
  }
  &__editing-data {
    @extend %table-data;
    box-shadow: inset 0 0 7px $brown-shadow;
  }
  &__data-input {
    @extend %table-text-input;
  }
  &__icons {
    @extend %table-icons;
    height: 32px;
    justify-content: flex-end;
  }
  &__icon {
    @extend %table-icon;
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
</style>
