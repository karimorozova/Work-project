<template lang="pug">
.vendorTests
    .vendorTests__table
        SettingsTable(
          :fields="fields"
          :tableData="vendorTest"
          :errors="errors"
          :areErrors="areErrors"
          :isApproveModal="isDeleting"
          @closeErrors="closeErrors"
          @approve="deveteVendorsTest"
          @notApprove="setDefaults" 
          @closeModal="setDefaults"
        )

          template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
            .vendorTests__head-title {{ field.label }}

          template(slot="file" slot-scope="{ row, index }")
              .vendorTests__no-file.vendorTests__data(v-if="!row.file && currentActive !== index") No file loaded
              .vendorTests__data(v-if="row.file && currentActive !== index")
                a(:href="domain + row.file.path") {{row.file.name}}
              .vendorTests__upload(v-if="currentActive === index")
                  input.vendorTests__load-file(type="file" id="file" ref="file" @change="uploadDocument")
          
          template(slot="uploaded" slot-scope="{ row, index }")
            .vendorTests__data(v-if="currentActive !== index") {{ row.uploaded }}
            .vendorTests__data(v-else)
                input.vendorTests__input(:value="currentUploaded" readonly)

          template(slot="source" slot-scope="{ row, index }")
            .vendorTests__data(v-if="currentActive !== index") {{ row.source.lang }}
            .vendorTests__drop-menu(v-else)
                SelectSingle(
                    :isTableDropMenu="isTableDropMenu"
                    placeholder="Select"
                    :hasSearch="true"
                    :selectedOption="currentSource.lang"
                    :options="sourceData"
                    @chooseOption="setSource"
                    @scrollDrop="scrollDrop"
                )

          template(slot="targets" slot-scope="{ row, index }")
            .vendorTests__data(v-if="currentActive !== index")
                span(v-for="item in row.targets") {{ item.lang }}; 
            .vendorTests__drop-menu(v-else)
                SelectMulti(
                  :isTableDropMenu="isTableDropMenu"
                  placeholder="Select"
                  :hasSearch="true"
                  :options="targetData" 
                  :selectedOptions="selectedTargets" 
                  @chooseOptions="setTargets"   
                )

          template(slot="industry" slot-scope="{ row, index }")
            .vendorTests__data(v-if="currentActive !== index") {{ row.industry.name }}
            .vendorTests__drop-menu(v-else)
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
            .vendorTests__data(v-if="currentActive !== index") {{ row.step.title }}
            .vendorTests__drop-menu(v-else)
                SelectSingle(
                    :isTableDropMenu="isTableDropMenu"
                    placeholder="Select"
                    :hasSearch="true"
                    :selectedOption="currentStep.title"
                    :options="stepsData"
                    @chooseOption="setStep"
                    @scrollDrop="scrollDrop"
                )

          template(slot="icons" slot-scope="{ row, index }")
            .vendorTests__icons
              img.vendorTests__icon(v-for="(icon, key) in icons" :src="icon.icon" @click="makeAction(index, key)" :class="{'vendorTests_opacity': isActive(key, index)}")

    Add(@add="addData")

</template>

<script>
import { mapGetters, mapActions } from "vuex";
import Add from "../Add";
import SelectSingle from "../SelectSingle";
import SelectMulti from "../SelectMulti";
import SettingsTable from "../Table/SettingsTable";
import crudIcons from "@/mixins/crudIcons";
import scrollDrop from "@/mixins/scrollDrop";

export default {
  mixins: [scrollDrop, crudIcons],
  data() {
    return {
      fields: [
        {
          label: "File Name",
          headerKey: "headerFile",
          key: "file",
          width: "14.2%",
          padding: "0"
        },
        {
          label: "Uploaded",
          headerKey: "headerUploaded",
          key: "uploaded",
          width: "14.2%",
          padding: "0"
        },
        {
          label: "Source",
          headerKey: "headerSource",
          key: "source",
          width: "14.2%",
          padding: "0"
        },
        {
          label: "Target",
          headerKey: "headerTarget",
          key: "targets",
          width: "193px",
          padding: "0"
        },
        {
          label: "Industry",
          headerKey: "headerIndustry",
          key: "industry",
          width: "14.2%",
          padding: "0"
        },
        {
          label: "Step",
          headerKey: "headerStep",
          key: "step",
          width: "14.2%",
          padding: "0"
        },
        {
          label: "",
          headerKey: "headerIcons",
          key: "icons",
          width: "14.2%",
          padding: "0"
        }
      ],

      vendorTest: [
        {
          file: { name: "test.pdf", path: "/path" },
          uploaded: "20-05-2026",
          source: { lang: "Danish" },
          targets: [{ lang: "Afrikaans" }, { lang: "Arabic (Egypt)" }],
          industry: { name: "CFDs & Online Trading" },
          step: { title: "Translation" }
        }
      ],
      currentActive: -1,
      currentUploaded: "",
      currentFile: "",
      currentSource: "",
      currentIndustry: "",
      currentStep: "",
      selectedTargets: [],

      industries: [],
      sources: [],
      targets: [],
      steps: [],


      areErrors: false,
      errors: [],
      isDeleting: false,
      deleteIndex: -1,
      isTableDropMenu: true,
      domain: "http://localhost:3001"
    };
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle"
    }),
    setTargets({ option }) {
      if (option === "ALL") {
        return (this.selectedTargets = ["ALL"]);
      }
      const position = this.selectedTargets.indexOf(option);
      this.setElements({ position, mainProp: "selectedTargets", option });
    },
    setElements({ position, mainProp, prop, option }) {
      if (position !== -1) {
        return this[mainProp].splice(position, 1);
      }
      if (
        this[mainProp].length &&
        (this[mainProp][0] === "ALL" || this[mainProp][0][prop] === "ALL")
      ) {
        this[mainProp] = [];
      }
      this[mainProp].push(option);
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
      this.currentUploaded = this.vendorTest[index].uploaded;
      this.currentSource = this.vendorTest[index].source;
      this.selectedTargets = this.vendorTest[index].targets.map(
        item => item.lang
      );
      this.currentIndustry = this.vendorTest[index].industry;
      this.currentStep = this.vendorTest[index].step;
    },
    manageCancelEdition(index) {
      if (!this.vendorTest[index].uploaded) {
        this.vendorTest.pop();
      }
      // this.$emit("refreshVendorTests");
      this.setDefaults();
    },
    setDefaults() {
      this.currentActive = -1;
      this.isDeleting = false;
      this.currentUploaded = "";
      this.currentFile = "";
      this.currentSource = "";
      this.currentIndustry = "";
      this.currentStep = "";
      this.selectedTargets = [];
    },

    async checkErrors(index) {
      this.errors = [];
      if(!this.currentSource) this.errors.push("Source should not be empty!")
      if(this.selectedTargets.length == 0) this.errors.push("Target should not be empty!")
      if(!this.currentIndustry) this.errors.push("Industry should not be empty!")
      if(!this.currentStep) this.errors.push("Step should not be empty!")
      if(!this.currentFile) this.errors.push("File should not be empty!")
      
      if (this.errors.length) {
        this.areErrors = true;
        return;
      }
      await this.manageSaveClick(index);
    },

    async manageSaveClick(index) {
      if (this.currentActive === -1) return;

      let deleteIndex = index;
      if (deleteIndex == 0) {
        deleteIndex = 1;
      }

      const uploaded = `${withZero(new Date().getDate()) +
        "-" +
        withZero(new Date().getMonth()) +
        "-" +
        new Date().getFullYear()}`;

      function withZero(number) {
        number < 10 ? (number = "0" + number) : number;
        return number;
      }

      this.vendorTest.splice(index, deleteIndex, {
        file: this.currentFile,
        uploaded: uploaded,
        source: this.currentSource,
        targets: this.selectedTargets.map(function(item) {
          return { lang: item };
        }),
        industry: this.currentIndustry,
        step: this.currentStep
      });

      this.setDefaults();
    },

    async manageDeleteClick(index) {
      this.deleteIndex = index;
      this.isDeleting = true;
      this.vendorTest.splice(index, 1);
    },
    async deveteVendorsTest() {
      try {
        this.alertToggle({
          message: "Vendor test removed",
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
      this.vendorTest.push({
        file: "",
        uploaded: "",
        source: "",
        targets: [],
        industry: "",
        step: ""
      });
      this.setEditingData(this.vendorTest.length - 1);
    },

    async getLangs() {
      try {
        const result = await this.$http.get("/api/languages");
        this.sources = Array.from(result.body);
        this.targets = Array.from(result.body);
        this.sources.unshift({ lang: "NA" });
        this.targets.unshift({ lang: "ALL" });
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
    async getIndustries() {
      try {
        const result = await this.$http.get("/api/industries");
        this.industries = result.body;
      } catch (err) {
        this.alertToggle({ message: err.message, isShow: true, type: "error" });
      }
    },
    closeErrors() {
      this.areErrors = false;
    },
    setSource({ option }) {
      this.currentSource = this.sources.find(item => item.lang === option);
    },
    setIndustry({ option }) {
      this.currentIndustry = this.industries.find(item => item.name === option);
    },
    setStep({ option }) {
      this.currentStep = this.steps.find(item => item.title === option);
    },
    uploadDocument() {
      this.currentFile = this.$refs.file.files[0];
    }
  },
  computed: {
    sourceData() {
      return this.sources.map(item => item.lang);
    },
    targetData() {
      return this.targets.map(item => item.lang);
    },
    industryData() {
      return this.industries.map(item => item.name);
    },
    stepsData() {
      return this.steps.map(item => item.title);
    }
  },
  mounted() {
    this.getLangs();
    this.getSteps();
    this.getIndustries();
  },
  components: {
    SelectSingle,
    SettingsTable,
    SelectMulti,
    Add
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/scss/style.scss";
@import "../../assets/styles/settingsTable.scss";

.vendorTests {
  @extend %setting-table;
  width: 1160px;
  margin: 60px 20px 40px 20px;
  box-shadow: 0 0 10px $brown-shadow;
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
  &__input {
    @extend %table-text-input;
  }
  &__no-file {
    opacity: 0.5;
  }
  &__download {
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  &__upload {
    position: relative;
    background: url("../../assets/images/Other/upload-icon.png");
    background-position: center;
    background-repeat: no-repeat;
    height: 100%;
    overflow: hidden;
  }
  &__load-file {
    width: 100%;
    height: 22px;
    border: none;
    outline: none;
    opacity: 0;
    z-index: 2;
    position: absolute;
    left: 6px;
    cursor: pointer;
    font-size: 0;
  }
}
</style>
