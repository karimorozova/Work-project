<template lang="pug">
.education
    SettingsTable(
        :fields="fields"
        :tableData="educationData"
        :errors="errors"
        :areErrors="areErrors" 
        :isApproveModal="isDeleting"
        :bodyClass="'vendor__education-body'"
        :headerClass="'vendor__education-header'"
        @closeErrors="closeErrors"
        @approve="deleteData"
        @notApprove="setDefaults"
        @closeModal="setDefaults"
    )
    
        template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
            .education__head-title {{ field.label }}

        template(slot="duration" slot-scope="{ row, index }")
            .education__data(v-if="currentActive !== index") {{ row.duration }}
            .education__editing-data(v-else) 
                input.education__input(type="text" readonly v-model="dateRange")
                div(v-click-outside="closePickers")
                  img.education__calendar(src="../../assets/images/calendar.png" @click="openPickers")
                  .education__datepickers(v-if="isDatepickers")
                      .education__pickers
                          DatePickers(
                              title="From"
                              @setTodaysDate="(e) => setDate(e, 'fromDate')"
                              @setNextDate="(e) => setDate(e, 'fromDate')"
                              @setPrevDate="(e) => setDate(e, 'fromDate')"
                              @setDate="(e) => setDate(e, 'fromDate')"
                              @removeAnytime="(e) => removeAnytime(e, 'fromDate')"
                              @setAnytime="(e) => setAnytime(e, 'fromDate')"
                              :date="fromDate")
                          DatePickers(
                              title="To"
                              @setTodaysDate="(e) => setDate(e, 'toDate')"
                              @setNextDate="(e) => setDate(e, 'toDate')"
                              @setPrevDate="(e) => setDate(e, 'toDate')"
                              @setDate="(e) => setDate(e, 'toDate')"
                              @removeAnytime="(e) => removeAnytime(e, 'toDate')"
                              @setAnytime="(e) => setAnytime(e, 'toDate')" 
                              :date="toDate")
                      .education__button
                          Button(value="Assign" @clicked="setDateRange")
        
        template(slot="education" slot-scope="{ row, index }")
            .education__data(v-if="currentActive !== index") {{ row.education }}
            .education__editing-data(v-else) 
                input.education__input(type="text" v-model="currentEducation")
        
        template(slot="department" slot-scope="{ row, index }")
            .education__data(v-if="currentActive !== index") {{ row.department }}
            .education__editing-data(v-else) 
                input.education__input(type="text" v-model="currentDepartment")

        template(slot="degree" slot-scope="{ row, index }")
              .education__data(v-if="currentActive !== index") {{ row.degree }}
              .education__editing-data(v-else) 
                  input.education__input(type="text" v-model="currentDegree")

        template(slot="grade" slot-scope="{ row, index }")
              .education__data(v-if="currentActive !== index") {{ row.grade }}
              .education__editing-data(v-else) 
                  input.education__input(type="text" v-model="currentGrade")

        template(slot="document" slot-scope="{ row, index }")
              .education__no-file.education__data(v-if="!row.document && currentActive !== index") No file loaded
              .education__data(v-if="row.document.length && currentActive !== index")
                a(:href="row.fileLink") {{row.document}}
              .education__upload(v-if="currentActive === index")
                  input.education__load-file(type="file" id="file" ref="file" @change="uploadDocument(index)")

        template(slot="icons" slot-scope="{ row, index }")
            .education__icons
                img.education__icon(v-for="(icon, key) in icons" :src="icon.icon" @click="makeAction(index, key)" :class="{'education_opacity': isActive(key, index)}")
    
    Add(@add="addData")
</template>

<script>
import DatePickers from "../reports/DatePickers";
import Button from "../Button";
import SettingsTable from "./SettingsTable";
import Add from "../Add";
import crudIcons from "@/mixins/crudIcons";
import moment from "moment";
import ClickOutside from "vue-click-outside";
import { mapGetters, mapActions } from "vuex";

export default {
  mixins: [crudIcons],
  props: {
    educationData: {
      type: Array
    },
    vendorId: {
      type: String
    }
  },
  data() {
    return {
      fields: [
        {
          label: "Duration",
          headerKey: "headerDuration",
          key: "duration",
          width: "20%",
          padding: "0"
        },
        {
          label: "Institute / School",
          headerKey: "headerEducation",
          key: "education",
          width: "13%",
          padding: "0"
        },
        {
          label: "Major / Department",
          headerKey: "headerDepartment",
          key: "department",
          width: "14%",
          padding: "0"
        },
        {
          label: "Degree",
          headerKey: "headerDegree",
          key: "degree",
          width: "13%",
          padding: "0"
        },

        {
          label: "Grade",
          headerKey: "headerGrade",
          key: "grade",
          width: "6%",
          padding: "0"
        },

        {
          label: "Document",
          headerKey: "headerDocument",
          key: "document",
          width: "20%",
          padding: "0"
        },

        {
          label: "",
          headerKey: "headerIcons",
          key: "icons",
          width: "14%",
          padding: "0"
        }
      ],

      currentActive: -1,

      currentDegree: "",
      currentEducation: "",
      currentDepartment: "",
      currentGrade: "",
      dateRange: "",
      currentFile: "",
      currentDocument: "",
      currentFileName: [],
      areErrors: false,
      errors: [],
      isDeleting: false,
      deleteIndex: -1,

      isDatepickers: false,
      fromDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      toDate: new Date()
    };
  },
  computed: {
    ...mapGetters({
      currentVendorEducations: "getCurrentVendorEducations"
    })
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle",
      storeEducation: "storeCurrentVendorEducation",
      deleteEducation: "deleteCurrentVendorEducation"
    }),

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
    uploadDocument(id) {
      this.currentFileName.push({
        fileName: event.target.files[0].name,
        id: id
      });
      this.currentFile = this.$refs.file.files[0];
    },
    requiredFields() {
      if (this.currentActive === -1) return;
      this.errors = [];
      if (!this.dateRange) this.errors.push("Duration should not be empty!");
      if (!this.currentEducation)
        this.errors.push("Institute / School should not be empty!");
      if (!this.currentDepartment)
        this.errors.push("Major / Department should not be empty!");
      if (!this.currentDegree) this.errors.push("Degree should not be empty!");
      if (this.fromDate > this.toDate)
        this.errors.push("Start date must be earlier than end date");
      if (this.errors.length) {
        this.areErrors = true;
        return;
      }
    },
    async manageSaveClick(index) {
      this.requiredFields();
      this.validationIsNumber(this.currentGrade, "Grade");
      let file = this.currentFileName.filter(value => value.id === index);

      if (this.currentActive == index) {
        if (!this.areErrors) {
          const obj = {
            _id: index,
            duration: this.dateRange,
            education: this.currentEducation,
            department: this.currentDepartment,
            degree: this.currentDegree,
            grade: this.currentGrade,
            document: this.currentDocument,
            fileLink: this.fileLink,
            vendorId: this.vendorId
          };

          let formData = new FormData();
          formData.append("education", JSON.stringify(obj));
          if (file[file.length - 1]) formData.append("educationFile", this.currentFile);

          try {
            const result = await this.storeEducation(formData);
            this.alertToggle({
              message: "Education saved",
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
          this.setDefaults();
          this.getEducation();
        }
      }
    },
    manageCancelEdition(index) {
      if (this.educationData[index]._id == undefined) {
        this.educationData.splice(index, 1);
      }
      this.setDefaults();
    },
    async manageDeleteClick(index) {
      if (this.educationData[index]._id == undefined) {
        this.educationData.splice(index, 1);
        return this.setDefaults();
      }
      this.deleteIndex = index;
      this.isDeleting = true;
    },
    async deleteData() {
      const id = this.educationData[this.deleteIndex]._id;
      try {
        await this.deleteEducation(id);
        this.alertToggle({
          message: "Education removed",
          isShow: true,
          type: "success"
        });
      } catch (err) {
        this.alertToggle({ message: err.message, isShow: true, type: "error" });
      }
      this.setDefaults();
      this.getEducation();
    },
    setEditingData(index) {
      this.currentActive = index;
      this.dateRange = this.educationData[index].duration;
      this.currentEducation = this.educationData[index].education;
      this.currentDegree = this.educationData[index].degree;
      this.currentDepartment = this.educationData[index].department;
      this.currentGrade = this.educationData[index].grade;
    },
    setDefaults() {
      this.currentActive = -1;
      this.isDeleting = false;
      this.currentDegree = "";
      this.currentEducation = "";
      this.currentDepartment = "";
      this.currentGrade = "";
      this.dateRange = "";
    },
    addData() {
      if (this.currentActive !== -1) {
        return this.isEditing();
      }
      this.educationData.push({
        education: "",
        degree: "",
        grade: "",
        document: "",
        duration: "",
        department: ""
      });
      this.setEditingData(this.educationData.length - 1);
    },
    getEducation() {
      this.educationData = this.currentVendorEducations;
    },
    closePickers() {
      this.isDatepickers = false;
    },
    openPickers() {
      this.isDatepickers = true;
    },
    setDate({ date }, prop) {
      this[prop] = new Date(date);
    },
    setAnytime(e, prop) {
      this[prop] = prop === "fromDate" ? new Date("2019-01-01") : new Date();
    },
    removeAnytime(e, prop) {
      const today = new Date();
      this[prop] =
        prop === "fromDate"
          ? new Date(today.getFullYear(), today.getMonth(), 1)
          : today;
    },
    setDateRange() {
      this.$emit("getFilteredReports", {
        fromDate: this.fromDate,
        toDate: this.toDate
      });
      this.dateRange =
        moment(this.fromDate).format("DD-MM-YYYY") +
        " / " +
        moment(this.toDate).format("DD-MM-YYYY");
      this.closePickers();
    },
    closeErrors() {
      this.areErrors = false;
    },
    validationIsNumber(field, fieldName) {
      if (/([a-zA-Z])/.exec(field) !== null) {
        if (!this.errors.includes(fieldName + " field must be a number")) {
          this.errors.push(fieldName + " field must be a number");
        }
        if (this.errors.length) {
          return (this.areErrors = true);
        }
      }
    }
  },

  components: {
    DatePickers,
    Button,
    SettingsTable,
    Add
  },
  directives: {
    ClickOutside
  },
  mounted() {}
};
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";
@import "../../assets/styles/settingsTable";

.education {
  @extend %setting-table;
  margin: 20px 10px 40px;
  width: 960px;
  box-shadow: 0 0 15px #67573e9d;

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
    justify-content: flex-end;
  }
  &__icon {
    @extend %table-icon;
  }
  &_opacity {
    opacity: 1;
  }
  &__calendar {
    cursor: pointer;
    width: 18px;
  }
  &__datepickers {
    z-index: 50;
    background-color: $white;
    position: absolute;
    width: 472px;
    padding: 20px;
    box-sizing: border-box;
    box-shadow: 0 0 10px $brown-shadow;
  }
  &__pickers {
    display: flex;
    justify-content: space-between;
  }
  &__button {
    margin-top: 10px;
    text-align: right;
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
