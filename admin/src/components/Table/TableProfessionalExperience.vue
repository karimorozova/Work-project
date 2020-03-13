<template lang="pug">
  .experience
    SettingsTable(
      :fields="fields"
      :tableData="professionalExperienceData"
      :errors="errors"
      :areErrors="areErrors"
      :isApproveModal="isDeleting"
      :bodyClass="'vendor__experience-body'"
      :headerClass="'vendor__experience-header'"
      @closeErrors="closeErrors"
      @approve="deleteSource"
      @notApprove="setDefaults"
      @closeModal="setDefaults"
    )

      template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
        .experience__head-title {{ field.label }}

      template(slot="duration" slot-scope="{ row, index }")
        .experience__data(v-if="currentActive !== index") {{ row.duration }}
        .experience__editing-data(v-else)
          input.experience__input(type="text" readonly v-model="dateRange")
          div(v-click-outside="closePickers")
            img.experience__calendar(src="../../assets/images/calendar.png" @click="openPickers")
            .experience__datepickers(v-if="isDatepickers")
              .experience__pickers
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
              .experience__button
                Button(value="Assign" @clicked="setDateRange")

      template(slot="occupation" slot-scope="{ row, index }")
        .experience__data(v-if="currentActive !== index") {{ row.occupation }}
        .experience__editing-data(v-else)
          input.experience__input(type="text" v-model="currentOccupation")

      template(slot="company" slot-scope="{ row, index }")
        .experience__data(v-if="currentActive !== index") {{ row.company }}
        .experience__editing-data(v-else)
          input.experience__input(type="text" v-model="currentCompany")

      template(slot="summary" slot-scope="{ row, index }")
        .experience__data(v-if="currentActive !== index") {{ row.summary }}
        .experience__editing-data(v-else)
          input.experience__input(type="text" v-model="currentSummary")

      template(slot="icons" slot-scope="{ row, index }")
        .experience__icons
          img.experience__icon(v-for="(icon, key) in icons" :src="icon.icon" @click="makeAction(index, key)" :class="{'experience_opacity': isActive(key, index)}")

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
    professionalExperienceData: {
      type: Array
    }
  },
  data() {
    return {
      fields: [
        {
          label: "Duration",
          headerKey: "headerDuration",
          key: "duration",
          width: "21.5%",
          padding: "0"
        },
        {
          label: "Occupation / Title",
          headerKey: "headerOccupation",
          key: "occupation",
          width: "21.5%",
          padding: "0"
        },
        {
          label: "Company",
          headerKey: "headerCompany",
          key: "company",
          width: "21.5%",
          padding: "0"
        },
        {
          label: "Notes",
          headerKey: "headerSummary",
          key: "summary",
          width: "21.5%",
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
      currentSummary: "",
      currentCompany: "",
      currentOccupation: "",
      dateRange: "",

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
      currentProfessionalExperience: "getCurrentVendorProfessionalExperience"
    })
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle",
      storeProfessionalExperience: "storeCurrentVendorProfessionalExperience",
      deleteProfessionalExperience: "deleteCurrentVendorProfessionalExperience"
    }),
    getProfessionalExperience() {
      this.professionalExperienceData = this.currentProfessionalExperience;
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
      this.currentSummary = this.professionalExperienceData[index].summary;
      this.currentCompany = this.professionalExperienceData[index].company;
      this.currentOccupation = this.professionalExperienceData[
        index
      ].occupation;
      this.dateRange = this.professionalExperienceData[index].duration;
    },
    manageCancelEdition(index) {
      if (this.professionalExperienceData[index]._id == undefined) {
        this.professionalExperienceData.splice(index, 1);
      }
      this.setDefaults();
    },
    setDefaults() {
      this.currentActive = -1;
      this.isDeleting = false;
      this.currentSummary = "";
      this.currentCompany = "";
      this.currentOccupation = "";
      this.dateRange = "";
    },

    requiredFields() {
      if (this.currentActive === -1) return;
      this.errors = [];
      if (!this.dateRange) this.errors.push("Duration should not be empty!");
      if (!this.currentOccupation)
        this.errors.push("Occupation / Title should not be empty!");
      if (!this.currentCompany)
        this.errors.push("Company should not be empty!");
      if (this.fromDate > this.toDate)
        this.errors.push("Start date must be earlier than end date");
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
            duration: this.dateRange,
            summary: this.currentSummary,
            company: this.currentCompany,
            occupation: this.currentOccupation
          };
          try {
            const result = await this.storeProfessionalExperience(obj);
            this.alertToggle({
              message: "Professional Experience saved",
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
          this.getProfessionalExperience();
        }
      }
    },
    async manageDeleteClick(index) {
      if (this.professionalExperienceData[index]._id == undefined) {
        this.professionalExperienceData.splice(index, 1);
        return this.setDefaults();
      }
      this.deleteIndex = index;
      this.isDeleting = true;
    },

    async deleteSource() {
      const id = this.professionalExperienceData[this.deleteIndex]._id;
      try {
        await this.deleteProfessionalExperience(id);
        this.alertToggle({
          message: "Professional Experience removed",
          isShow: true,
          type: "success"
        });
      } catch (err) {
        this.alertToggle({ message: err.message, isShow: true, type: "error" });
      }
      this.setDefaults();
      this.getProfessionalExperience();
    },

    addData() {
      if (this.currentActive !== -1) {
        return this.isEditing();
      }
      this.professionalExperienceData.push({
        summary: "",
        company: "",
        occupation: "",
        duration: ""
      });
      this.setEditingData(this.professionalExperienceData.length - 1);
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
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";
@import "../../assets/styles/settingsTable";

.experience {
  @extend %setting-table;
  width: 960px;
  margin: 20px 10px 40px;
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
}
</style>
