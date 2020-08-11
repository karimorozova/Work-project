<template lang="pug">
.qualifications
  .qualifications__preview(v-if="isEditAndSend")
    VendorPreview(@closePreview="closePreview", :message="previewMessage", @send="sendMessage")
  .qualifications__form(v-if="isForm")
    VendorLqa(:vendorData="lqaData", @closeForm="closeForm", @saveVendorLqa="saveVendorLqa")
  .qualifications__table
    SettingsTable(
      :fields="fields",
      :tableData="qualificationData",
      :errors="errors",
      :areErrors="areErrors",
      :isApproveModal="isDeleting",
      @closeErrors="closeErrors",
      @approve="deleteData",
      @notApprove="setDefaults",
      @closeModal="setDefaults"
    )
      template(v-for="field in fields", :slot="field.headerKey", slot-scope="{ field }")
        .qualifications__head-title {{ field.label }}

      template(slot="source", slot-scope="{ row, index }")
        .qualifications__data {{ row.source.lang }}
      template(slot="target", slot-scope="{ row, index }")
        .qualifications__data {{ row.target.lang }}
      template(slot="industry", slot-scope="{ row, index }")
        .qualifications__data {{ row.industry.name }}
      template(slot="step", slot-scope="{ row, index }")
        .qualifications__data {{ presentArrays(row.steps, 'title') }}

      template(slot="status", slot-scope="{ row, index }")
        .qualifications__data(v-if="currentActive !== index") {{ row.status }}
        .qualifications__drop-menu(v-else)
          .drop-type(v-if="row.testType === 'Test'")
            SelectSingle(
              :isTableDropMenu="isTableDropMenu",
              placeholder="Select",
              :selectedOption="currentStatus",
              :options="TestWorkflowStatusesTest",
              @chooseOption="setStatus"
            )
          .drop-type(v-else)
            SelectSingle(
              :isTableDropMenu="isTableDropMenu",
              placeholder="Select",
              :selectedOption="currentStatus",
              :options="TestWorkflowStatusesSample",
              @chooseOption="setStatus"
            )

      template(slot="progress", slot-scope="{ row, index }")
        .progress-line
          .progress-line__body(v-for="stage in 5")
            .progress-line__bar(v-if="stage <= setStatusStage(row.status)", :style="{ background: '#2cb42c' }")
            .progress-line__bar(v-else)

      template(slot="tqi", slot-scope="{ row, index }")
        .qualifications__data {{ row.tqi }}

      template(slot="icons", slot-scope="{ row, index }")
        .qualifications__icons
          img.qualifications__icon(
            v-for="(icon, key) in icons",
            :src="icon.icon",
            @click="makeAction(index, key)",
            :class="{ qualifications_opacity: isActive(key, index) }"
          )
</template>

<script>
import VendorPreview from "./VendorPreview";
import { mapGetters, mapActions } from "vuex";
import SettingsTable from "../Table/SettingsTable";
import SelectSingle from "../SelectSingle";
import scrollDrop from "@/mixins/scrollDrop";
import crudIcons from "@/mixins/crudIcons";
import VendorLqa from "./VendorLqa";

export default {
  mixins: [scrollDrop, crudIcons],
  props: {
    qualificationData: {
      type: Array,
      default: () => [],
    },
    assessmentData: {
      type: Array,
      default: () => [],
    },
    currentVendor: {
      type: Object,
    },
    refresh: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      fields: [
        {
          label: "Source",
          headerKey: "headerSource",
          key: "source",
          width: "14%",
          padding: "0",
        },
        {
          label: "Target",
          headerKey: "headerTarget",
          key: "target",
          width: "14%",
          padding: "0",
        },
        {
          label: "Industry",
          headerKey: "headerIndustry",
          key: "industry",
          width: "14%",
          padding: "0",
        },
        {
          label: "Step",
          headerKey: "headerStep",
          key: "step",
          width: "14%",
          padding: "0",
        },
        {
          label: "Test Status",
          headerKey: "headerStatus",
          key: "status",
          width: "14%",
          padding: "0",
        },
        {
          label: "Progress",
          headerKey: "headerProgress",
          key: "progress",
          width: "14%",
          padding: "0",
        },
        {
          label: "TQI",
          headerKey: "headerTQI",
          key: "tqi",
          width: "4%",
          padding: "0",
        },
        {
          label: "",
          headerKey: "headerIcons",
          key: "icons",
          width: "13%",
          padding: "0",
        },
      ],
      lqaData: {
        isTqi: true,
      },
      targets: [],
      vendorTests: [],

      currentSource: "",
      currentTarget: "",
      currentIndustry: "",
      currentSteps: [],
      currentStatus: "",
      currentIndex: "",
      currentTqi: null,

      previewMessage: "",

      areErrors: false,
      errors: [],
      isDeleting: false,
      deleteIndex: -1,
      isTableDropMenu: true,
      currentActive: -1,
      isForm: false,
      isEditAndSend: false,
      statusStage: -1,
    };
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle",
      storeQualification: "storeCurrentVendorQualification",
      deleteQualification: "deleteCurrentVendorQualification",
      storeAssessment: "storeCurrentVendorAssessment",
    }),
    presentArrays(Arr, key) {
      if (!Arr.length) return "";
      return Arr.reduce((acc, cur) => acc + `${cur[key]}; `, "");
    },

    closePreview() {
      this.isEditAndSend = false;
    },
    openPreview() {
      this.isEditAndSend = true;
    },
    async sendMessage(message) {
      try {
        await this.manageSaveClick(this.currentActive, message);
      } catch (err) {
        this.alertToggle({ message: err.message, isShow: true, type: "error" });
      }
      this.closePreview();
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
      this.currentSteps = this.qualificationData[index].steps;
      this.currentTqi = this.qualificationData[index].tqi;
    },
    manageCancelEdition(index) {
      this.$emit("refreshQualifications");
      this.setDefaults();
    },
    setDefaults() {
      this.currentActive = -1;
      this.isDeleting = false;
      this.currentSource = [];
      this.currentTarget = "";
      this.currentIndustry = "";
      this.currentStatus = "";
      this.currentTqi = null;
      this.currentSteps = [];
    },

    async checkErrors(index) {
      if (this.currentActive === -1) return;
      this.errors = [];
      if (!this.currentStatus) this.errors.push("Status should not be empty!");

      // if (!this.errors.length && !this.getAvailableTest())
      // this.errors.push("There is no test available for such data!");

      if (this.errors.length) {
        this.areErrors = true;
        return;
      }

      if (this.currentStatus === "Passed") {
        if (this.checkSuchData()) {
          this.handleLqa();
        } else {
          return;
        }
      } else if (this.currentStatus === "Test Sent") {
        const template = await this.$http.post(`/vendorsapi/get-message`, {
          ...this.currentVendor,
          industry: this.currentIndustry,
          target: this.currentTarget,
          source: this.currentSource,
        });
        this.previewMessage = template.body.message;
        this.openPreview();
      } else {
        await this.manageSaveClick(index);
      }
    },

    getAvailableTest() {
      if (!this.vendorTests.length) return null;
      const currentTest = this.vendorTests.find(
        (test) =>
          test.source._id.toString() == this.currentSource._id.toString() &&
          test.targets.map((target) => target._id.toString()).includes(this.currentTarget._id.toString()) &&
          test.industries.map((industry) => industry._id.toString()).includes(this.currentIndustry._id.toString())
      );
      return currentTest;
    },

    handleLqa() {
      this.lqaData = {
        vendor: {
          name: `${this.currentVendor.firstName} ${this.currentVendor.surname}`,
          industry: this.currentIndustry.name,
          sourceLang: this.currentSource.lang,
          targetLang: this.currentTarget.lang,
          step: this.presentArrays(this.currentSteps, "title"),
        },
      };
      this.openForm();
    },

    checkSuchData() {
      return true;
      // if (this.assessmentData.length == 0) {
      //   return true;
      // } else {
      //   const getStep = this.assessmentData.find(
      //     value => value.step._id == this.currentStep._id
      //   );
      //   if (getStep) {
      //     const getTarget = getStep.langsData.find(
      //       value => value.target._id == this.currentTarget._id
      //     );
      //     const getSource = getStep.langsData.find(
      //       value => value.source._id == this.currentSource._id
      //     );
      //     if (getTarget && getSource) {
      //       const getIndustry = getSource.industries.find(
      //         value => value.industry._id == this.currentIndustry._id
      //       );
      //       if (getIndustry) {
      //         this.errors.push("Such information already exists!");
      //         this.areErrors = true;
      //         return false;
      //       } else {
      //         return true;
      //       }
      //     } else {
      //       return true;
      //     }
      //   } else {
      //     return true;
      //   }
      // }
    },

    async saveVendorLqa({ vendorData }) {
      const { file, grade } = vendorData;
      let assessment = {
        step: this.currentSteps[0],
        target: this.currentTarget,
        industry: this.currentIndustry,
        source: this.currentSource,
        tqi: { fileName: "", path: "", grade },
        lqa1: {},
        lqa2: {},
        lqa3: {},
      };

      let formData = new FormData();
      formData.append("vendorId", this.currentVendor._id);
      formData.append("assessment", JSON.stringify(assessment));
      formData.append("assessmentFile", file);

      this.currentTqi = vendorData.grade;

      try {
        await this.storeAssessment(formData);
        await this.manageSaveClick(this.currentActive);
      } catch (err) {
      } finally {
        this.closeForm();
      }
    },

    async manageSaveClick(index, message) {
      const tqi =
        this.qualificationData[index].status === "Not Passed" || this.currentStatus === "Not Passed"
          ? 0
          : this.currentTqi;

      let qualification = {
        target: this.currentTarget,
        industry: this.currentIndustry,
        steps: this.currentSteps,
        status: this.currentStatus,
        source: this.currentSource,
        tqi: tqi,
      };

      const test = this.getAvailableTest();
      try {
        await this.storeQualification({
          vendor: this.currentVendor,
          index,
          qualification,
          testPath: test ? test.path : "",
          message: message ? message : "",
        });
        this.alertToggle({
          message: "Qualification saved",
          isShow: true,
          type: "success",
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
          index: this.deleteIndex,
        });
        this.alertToggle({
          message: "Qualification removed",
          isShow: true,
          type: "success",
        });
      } catch (err) {
      } finally {
        this.manageCancelEdition();
      }
    },

    setStatus({ option }) {
      this.currentStatus = option;
    },
    closeErrors() {
      this.areErrors = false;
    },
    closeForm() {
      this.isForm = false;
    },
    openForm() {
      this.isForm = true;
    },
    async getTests() {
      try {
        const result = await this.$http.get("/vendorsapi/lang-tests");
        this.vendorTests = result.body;
      } catch (err) {
        this.alertToggle({ message: "Error on getting tests", isShow: true });
      }
    },
    setStatusStage(status) {
      switch (status) {
        case "Test Sent":
        case "Sample Requested":
          return 2;
          break;
        case "Test Received":
        case "Sample Received":
          return 3;
          break;
        case "Test In Review":
        case "Sample In Review":
          return 4;
          break;
        case "Passed":
        case "Not Passed":
          return 5;
          break;
        default:
          return 1;
      }
    },
  },
  watch: {
    async refresh() {
      if (this.refresh) {
        this.$emit("refreshQualifications");
      }
    },
  },
  computed: {
    ...mapGetters({
      currentVendorQualifications: "getCurrentVendorQualifications",
    }),
    TestWorkflowStatusesSample() {
      let result = [];
      switch (this.qualificationData[this.currentActive].status) {
        case "Created":
        case "Re-Test":
          result.push("Sample Requested");
          break;
        case "Sample Requested":
          result.push("Sample Received");
          break;
        case "Sample Received":
          result.push("Sample In Review");
          break;
        case "Sample In Review":
          result.push("Passed", "Not Passed");
          break;
        case "Passed":
          result.push("Not Passed");
          break;
        case "Not Passed":
          result.push("Re-Test");
          break;
      }
      return result;
    },
    TestWorkflowStatusesTest() {
      let result = [];
      switch (this.qualificationData[this.currentActive].status) {
        case "Created":
        case "Re-Test":
          result.push("Test Sent");
          break;
        case "Test Sent":
          result.push("Test Received");
          break;
        case "Test Received":
          result.push("Test In Review");
          break;
        case "Test In Review":
          result.push("Passed", "Not Passed");
          break;
        case "Passed":
          result.push("Not Passed");
          break;
        case "Not Passed":
          result.push("Re-Test");
          break;
      }
      return result;
    },
  },
  components: {
    VendorPreview,
    SettingsTable,
    SelectSingle,
    VendorLqa,
  },
  created() {
    this.getTests();
  },
  mounted() {},
};
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";
@import "../../assets/styles/settingsTable";

.qualifications {
  @extend %setting-table;
  margin: 20px 10px 40px;
  width: 920px;
  box-shadow: 0 0 10px #67573e9d;
  padding: 40px;

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
.progress-line {
  display: flex;
  height: 32px;
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
