<template lang="pug">
.qualifications
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
              .qualifications__data(v-if="currentActive !== index") {{ row.source }}
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
            .qualifications__data(v-if="currentActive !== index") {{ row.target }}
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
            .qualifications__data(v-if="currentActive !== index") {{ row.industry }}
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

          template(slot="task" slot-scope="{ row, index }")
            .qualifications__data(v-if="currentActive !== index") {{ row.task }}
            .qualifications__drop-menu(v-else)
                SelectSingle(
                    :isTableDropMenu="isTableDropMenu"
                    placeholder="Select"
                    :hasSearch="true"
                    :selectedOption="currentTask.title"
                    :options="taskData"
                    @chooseOption="setTask"
                    @scrollDrop="scrollDrop"
                )

          template(slot="status" slot-scope="{ row, index }")
            .qualifications__data(v-if="currentActive !== index") {{ row.status }}
            .qualifications__drop-menu(v-else)
                SelectSingle(
                    :isTableDropMenu="isTableDropMenu"
                    placeholder="Select"
                    :hasSearch="true"
                    :selectedOption="currentStatus.status"
                    :options="statusData"
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

export default {
  mixins: [scrollDrop, crudIcons],
  props: {
    qualificationData: {
      type: Array, default: () => []
    },
    vendorIndustries: {
      type: Array, default: () => []
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
          label: "Targer",
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
          label: "Task",
          headerKey: "headerTask",
          key: "task",
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

      currentSource: "",
      currentTarget: "",
      currentIndustry: "",
      currentTask: "",
      currentStatus: "",

      areErrors: false,
      errors: [],
      isDeleting: false,
      deleteIndex: -1,
      isTableDropMenu: true,
      currentActive: -1
    };
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle",
      storeQualification: "storeCurrentVendorQualifications",
      deleteQualification: "deleteCurrentVendorQualifications"
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
        case "save":
          await this.manageSaveClick(index);
          break;
        default:
          await this.checkErrors(index);
      }
    },
    setEditingData(index) {
      this.currentActive = index;
      this.currentSource = {
        lang: this.qualificationData[index].source
      };
      this.currentTarget = {
        lang: this.qualificationData[index].target
      };
      this.currentIndustry = {
        name: this.qualificationData[index].industry
      };
      this.currentStatus = {
        status: this.qualificationData[index].status
      };
      this.currentTask = {
        title: this.qualificationData[index].task
      };
    },
    manageCancelEdition(index) {
      if (this.qualificationData[index]._id == undefined) {
        this.qualificationData.splice(index, 1);
      }
      this.setDefaults();
    },
    setDefaults() {
      this.currentActive = -1;
      this.isDeleting = false;
      this.currentSource = "";
      this.currentTarget = "";
      this.currentIndustry = "";
      this.currentStatus = "";
      this.currentTask = "";
    },
    requiredFields() {
      if (this.currentActive === -1) return;
      this.errors = [];
      if (!this.currentSource.lang)
        this.errors.push("Source should not be empty!");
      if (!this.currentTarget.lang)
        this.errors.push("Target should not be empty!");
      if (!this.currentIndustry.name)
        this.errors.push("Industry should not be empty!");
      if (!this.currentStatus.status)
        this.errors.push("Task status should not be empty!");
      if (!this.currentTask.title)
        this.errors.push("Task should not be empty!");
      if (this.errors.length) {
        this.areErrors = true;
        return;
      }
    },

    async manageSaveClick(index) {
      this.requiredFields();
      if (this.currentActive == index) {
        if (!this.areErrors) {
          const obj = {
            _id: index,
            source: this.currentSource.lang,
            target: this.currentTarget.lang,
            industry: this.currentIndustry.name,
            task: this.currentTask.title,
            status: this.currentStatus.status
          };
          try {
            const result = await this.storeQualification(obj);
            this.alertToggle({
              message: "Qualification saved",
              isShow: true,
              type: "success"
            });
          } catch (err) {
            this.alertToggle({
              message: err.message,
              isShow: true,
              type: "error"
            });
          }
          this.getQualifications();
          this.setDefaults();
        }
      }
    },

    async manageDeleteClick(index) {
      if (this.qualificationData[index]._id == undefined) {
        this.qualificationData.splice(index, 1);
        return this.setDefaults();
      }
      this.deleteIndex = index;
      this.isDeleting = true;
    },

    async deleteData() {
      const id = this.qualificationData[this.deleteIndex]._id;
      try {
        await this.deleteQualification(id);
        this.alertToggle({
          message: "Qualification removed",
          isShow: true,
          type: "success"
        });
      } catch (err) {
        this.alertToggle({ message: err.message, isShow: true, type: "error" });
      }
      this.getQualifications();
      this.setDefaults();
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
        task: ""
      });
      this.setEditingData(this.qualificationData.length - 1);
    },

    async getSource() {
      try {
        const result = await this.$http.get("/api/languages");
        let newResult = result.body;
        newResult.unshift({ lang: "NA" });
        this.sources = newResult;
      } catch (err) {
        this.alertToggle({ message: err.message, isShow: true, type: "error" });
      }
    },
    async getTarget() {
      try {
        const result = await this.$http.get("/api/languages");
        this.target = result.body;
      } catch (err) {
        this.alertToggle({ message: err.message, isShow: true, type: "error" });
      }
    },

    async getTask() {
      try {
        const result = await this.$http.get("/api/services");
        this.task = result.body;
      } catch (err) {
        this.alertToggle({ message: err.message, isShow: true, type: "error" });
      }
    },
    getStatus() {
      this.status = [
        { status: "NA" },
        { status: "Sample Requested" },
        { status: "Test Sent" },
        { status: "Received" },
        { status: "Passed" },
        { status: "Not Passed" }
      ];
    },

    setSource({ option }) {
      this.currentSource = this.sources.find(item => item.lang === option);
    },
    setTarget({ option }) {
      this.currentTarget = this.target.find(item => item.lang === option);
    },
    setIndustry({ option }) {
      this.currentIndustry = this.vendorIndustries.find(item => item.name === option);
    },
    setStatus({ option }) {
      this.currentStatus = this.status.find(item => item.status === option);
    },
    setTask({ option }) {
      this.currentTask = this.task.find(item => item.title === option);
    },
    closeErrors() {
      this.areErrors = false;
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
      return this.target.map(item => item.lang);
    },
    industryData() {
      return this.vendorIndustries.map(item => item.name);
    },
    statusData() {
      return this.status.map(item => item.status);
    },
    taskData() {
      return this.task.map(item => item.title);
    },
  },
  components: {
    SettingsTable,
    SelectSingle,
    Add
  },

  mounted() {
    this.getSource();
    this.getTarget();
    this.getStatus();
    this.getTask();
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
}
</style>
