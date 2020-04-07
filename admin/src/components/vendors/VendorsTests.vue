<template lang="pug">
.vendorTests
    .vendorTests__table
        SettingsTable(
          :fields="fields"
          :tableData="vendorTests"
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
              .vendorTests__no-file.vendorTests__data(v-if="!row.fileName && currentActive !== index") No file loaded
              .vendorTests__data(v-if="row.fileName && currentActive !== index")
                a(:href="domain + row.path") {{row.fileName}}
              .vendorTests__upload(v-if="currentActive === index")
                  input.vendorTests__load-file(type="file" id="file" ref="file" @change="uploadDocument")
          
          template(slot="uploaded" slot-scope="{ row, index }")
            .vendorTests__data {{ getFormattedDate(row.uploadDate) }}

          template(slot="source" slot-scope="{ row, index }")
            .vendorTests__data(v-if="currentActive !== index") {{ presentSource(row.source) }}
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
            .vendorTests__data(v-if="currentActive !== index") {{ presentTargets(row.targets) }}
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
import moment from "moment";
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
          width: "161px",
          padding: "0"
        },
        {
          label: "Uploaded",
          headerKey: "headerUploaded",
          key: "uploaded",
          width: "161px",
          padding: "0"
        },
        {
          label: "Source",
          headerKey: "headerSource",
          key: "source",
          width: "161px",
          padding: "0"
        },
        {
          label: "Target",
          headerKey: "headerTarget",
          key: "targets",
          width: "191px",
          padding: "0"
        },
        {
          label: "Industry",
          headerKey: "headerIndustry",
          key: "industry",
          width: "161px",
          padding: "0"
        },
        {
          label: "Step",
          headerKey: "headerStep",
          key: "step",
          width: "161px",
          padding: "0"
        },
        {
          label: "",
          headerKey: "headerIcons",
          key: "icons",
          width: "164px",
          padding: "0"
        }
      ],

      vendorTests: [],
      currentActive: -1,
      currentFile: "",
      currentSource: "",
      currentIndustry: "",
      currentStep: "",
      currentTargets: [],

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
    ...mapActions([
        "saveLangTest",
        "removeLangTest",
        "alertToggle"
    ]),
    presentSource(source) {
        return source ? source.lang : "NA";
    },
    presentTargets(targets) {
        if(!targets.length) return "";
        if(targets.length === this.targets.filter(item => item.lang !== "All").length) return "All";
        return targets.reduce((acc, cur) => acc + `${cur.lang}; `, "");
    },
    getFormattedDate(date) {
        if(!date) return "";
        return moment(date).format("DD-MM-YYYY");
    },
    setTargets({ option }) {
      const position = this.selectedTargets.indexOf(option);
      this.currentTargets = this.currentTargets.filter(item => item.lang !== 'All');
      if (position !== -1) {
        this.currentTargets.splice(position, 1);
      } else {
        const lang = this.targets.find(item => item.lang === option);
        this.currentTargets.push(lang);
      }
      if (option === "All" || !this.selectedTargets.length) {
        this.currentTargets = [{lang: "All"}];
      }
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
          this.manageCancelEdition();
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
      this.currentSource = this.vendorTests[index].source || {lang: "NA"};
      this.currentTargets = Array.from(this.vendorTests[index].targets);
      this.currentIndustry = this.vendorTests[index].industry;
      this.currentStep = this.vendorTests[index].step;
    },
    manageCancelEdition() {
        this.vendorTests = this.vendorTests.filter(item => item._id);
        this.setDefaults();
        this.isDeleting = false;
    },
    setDefaults() {
      this.currentActive = -1;
      this.isDeleting = false;
      this.currentFile = "";
      this.currentSource = "";
      this.currentIndustry = "";
      this.currentStep = "";
      this.currentTargets = [];
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
        const targets = this.currentTargets[0].lang === 'All' ? 
            this.targets.filter(item => item.lang !== "All") 
            : this.currentTargets;
        let testData = {
            targets,
            industry: this.currentIndustry,
            step: this.currentStep,
            index,
            oldPath: this.vendorTests[index].path || "",
            _id: this.vendorTests[index]._id || ""
        }
        if(this.currentSource.lang !== 'NA') {
            testData.source = this.currentSource
        }
        try {
            await this.saveLangTest({testData, file: this.currentFile});
            await this.getTests();
        } catch(err) {
        } finally {
            this.setDefaults();
        }
    },

    async manageDeleteClick(index) {
        if(!this.vendorTests[index]._id) {
           this.vendorTests.splice(index, 1);
           return this.setDefaults();
        }
        this.deleteIndex = index;
        this.isDeleting = true;
    },
    async deveteVendorsTest() {
        const { _id, path } = this.vendorTests[this.deleteIndex];
        try {
            await this.removeLangTest({_id, path});
            await this.getTests();
        } catch (err) {
        } finally {
            this.manageCancelEdition();
        }
    },

    addData() {
      if (this.currentActive !== -1) {
        return this.isEditing();
      }
      this.vendorTests.push({
        fileName: "",
        path: "",
        uploadDate: "",
        source: "",
        targets: [],
        industry: "",
        step: ""
      });
      this.setEditingData(this.vendorTests.length - 1);
    },

    async getLangs() {
      try {
        const result = await this.$http.get("/api/languages");
        this.sources = Array.from(result.body);
        this.targets = Array.from(result.body);
        this.sources.unshift({ lang: "NA" });
        this.targets.unshift({ lang: "All" });
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
    uploadDocument(e) {
      this.currentFile = this.$refs.file.files[0];
    },
    async getTests() {
        try {
            const result = await this.$http.get("/vendorsapi/lang-tests");
            this.vendorTests = result.body;
        } catch(err) {
            this.alertToggle({message: "Error on getting tests", isShow: true});
        }
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
    },
    selectedTargets() {
        return this.currentTargets.length ?
            this.currentTargets.map(item => item.lang)
            : []
    }
  },
  created() {
        this.getTests();
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
    justify-content: center;
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
