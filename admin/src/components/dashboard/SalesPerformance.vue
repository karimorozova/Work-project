<template lang="pug">
.activities
  .activities__title Chosen range Avg: {{ rangeAverages.percent }}% {{ rangeAverages.grade }}
  .activities__bars
    Charts(
      :rangeLeads="rangeAverages.leads",
      :rangeCalls="rangeAverages.calls",
      :rangeCommunications="rangeAverages.communications",
      :rangeMeetings="rangeAverages.meetings",
      :todaysLeads="todaysData.leads",
      :todaysCalls="todaysData.calls",
      :todaysCommunications="todaysData.communications",
      :todaysMeetings="todaysData.meetings"
    )

  .activities__date-range
    DateRange(@getFilteredReports="getFilteredReports")

  .activities__table
    DataTable(:fields="fields", :tableData="tableData", bodyClass="reports__table")

      span.activities__header(slot="headerDate", slot-scope="{ field }")
      span.activities__header(slot="headerLeads", slot-scope="{ field }") New Leads
        span.activities__standard {{ standard.leads }}
      span.activities__header(slot="headerCalls", slot-scope="{ field }") Calls
        span.activities__standard {{ standard.calls }}
      span.activities__header(slot="headerComm", slot-scope="{ field }") Comm
        span.activities__standard {{ standard.communications }}
      span.activities__header(slot="headerMeeting", slot-scope="{ field }") Meeting Setup
        span.activities__standard {{ standard.meetings }}
      span.activities__header.activities_flex-end(slot="headerNotes", slot-scope="{ field }") Notes
      span.activities__header(slot="headerEdit", slot-scope="{ field }")


      .activities__data.activities_space-around(slot="date", slot-scope="{ row, index }") 
        span.activities__data-item {{ formattedDate(row.date) }}
        .activities__toggler(v-if="currentActive === index")
          Toggler(:isActive="isWorkingDay", :isDisabled="false", @toggle="excludeDate")
        span.activities__data-item.activities_orange(v-if="currentActive !== index") {{ row.grade }}
        span.activities__data-item.activities_orange(v-if="currentActive !== index") {{ row.percent }}
          span.activities__percent(v-if="row.percent") %
      .activities__data(slot="leads", slot-scope="{ row }") {{ row.leads }}
      .activities__data(slot="calls", slot-scope="{ row }") {{ row.calls }}
      .activities__data(slot="comm", slot-scope="{ row }") {{ row.communications }}
      .activities__data(slot="meeting", slot-scope="{ row, index }") {{ row.meetings }}
      .activities__data(slot="notes", slot-scope="{ row, index }")
        .activities__notes(v-if="currentActive !== index") {{ row.notes }}
        input.activities__text(v-else, type="text", v-model="currentNote")

      .activities__icons(slot="edit", slot-scope="{ row, index }")
        img.activities__icon(
          v-for="(icon, key) in icons",
          :src="icon.icon",
          @click="makeAction(index, key)",
          :class="{ 'activities_opacity-1': isActive(key, index) }"
        )

  //- .activities__tokens
  //-   .activities__item
  //-     .activities__button
  //-       Button(v-if="isTokenExpired", value="Generate tokens", @clicked="generateTokens")
  //-       Button(v-else, value="Get latest data", @clicked="getZohoCrmData")
</template>
<script>
import DataTable from "../DataTable";
import Toggler from "../Toggler";
import DateRange from "./SalesPerformanceChildrens/DateRange";
import Charts from "./SalesPerformanceChildrens/charts/Charts";
import Button from "../Button";
import moment from "moment";
import { mapActions } from "vuex";
export default {
  data() {
    return {
      fields: [
        { label: "", headerKey: "headerDate", key: "date", width: "18%", padding: "0" },
        { label: "", headerKey: "headerLeads", key: "leads", width: "12%", padding: "0" },
        { label: "", headerKey: "headerCalls", key: "calls", width: "12%", padding: "0" },
        { label: "", headerKey: "headerComm", key: "comm", width: "12%", padding: "0" },
        { label: "", headerKey: "headerMeeting", key: "meeting", width: "12%", padding: "0" },
        { label: "", headerKey: "headerNotes", key: "notes", width: "24%", padding: "0" },
        { label: "", headerKey: "headerEdit", key: "edit", width: "10%", padding: "0" },
      ],
      tableData: [],
      todaysData: { leads: 0, calls: 0, communications: 0, meetings: 0 },
      today: new Date(),
      standard: { leads: 30, calls: 30, communications: 50, meetings: 1 },
      code: "",
      isInputVisible: false,
      grades: {
        F: { min: 0, max: 59 },
        D: { min: 60, max: 69 },
        C: { min: 70, max: 76 },
        "C+": { min: 77, max: 79 },
        "B-": { min: 80, max: 82 },
        B: { min: 83, max: 86 },
        "B+": { min: 87, max: 89 },
        "A-": { min: 90, max: 92 },
        A: { min: 93, max: 96 },
        "A+": { min: 97, max: 100 },
      },
      isTokenExpired: false,
      currentActive: -1,
      currentNote: "",
      isWorkingDay: true,
      // icons: {
      //   save: { icon: require("../../assets/images/Other/save-icon-qa-form.png") },
      //   edit: { icon: require("../../assets/images/Other/edit-icon-qa.png") },
      //   cancel: { icon: require("../../assets/images/cancel-icon.png") },
      // },
    };
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle",
      updateReport: "updateReport",
    }),
    isActive(key, index) {
      if (this.currentActive === index) {
        return key !== "edit";
      }
      if (this.currentActive !== index) {
        return key !== "save" && key !== "cancel";
      }
    },
    async makeAction(index, key) {
      if (this.currentActive !== -1 && this.currentActive !== index) return;
      if (key === "edit") {
        this.currentActive = index;
        this.currentNote = this.tableData[index].notes;
      }
      if (key === "cancel") {
        this.setDefault();
      }
      if (key === "save") {
        await this.saveChanges(index);
      }
    },
    async saveChanges(index) {
      const report = this.tableData[index];
      try {
        await this.updateReport({
          id: report._id,
          notes: this.currentNote,
          isWorkingDay: this.isWorkingDay,
        });
        await this.getReports(this.reportRefreshDates.from, this.reportRefreshDates.to);
      } catch (err) {
        this.alertToggle({ message: err.data, isShow: true, type: "error" });
      } finally {
        this.setDefault();
      }
    },
    setDefault() {
      this.currentNote = "";
      this.currentActive = -1;
      this.isWorkingDay = true;
    },
    excludeDate() {
      this.isWorkingDay = !this.isWorkingDay;
    },
    async getFilteredReports({ fromDate, toDate }) {
      try {
        await this.getReports(fromDate, toDate);
      } catch (err) {}
    },
    async getReports(fromDate, toDate) {
      const from = fromDate ? fromDate : this.reportRefreshDates.from;
      const to = toDate ? toDate : this.reportRefreshDates.to;
      try {
        const result = await this.$http.get(`/zoho/zoho-reports?from=${from}&to=${to}`);
        this.tableData = result.data;
        const currentDate = moment(this.today).hours(0);
        const lastDayData = this.tableData.find((item) => new Date(item.date) >= currentDate);
        this.todaysData = lastDayData ? lastDayData : this.todaysData;
      } catch (err) {
        this.alertToggle({ message: err.data, isShow: true, type: "error" });
      }
    },
    async generateTokens() {
      try {
        const creds = await this.$http.get("/zoho/creds");
        const { client_id, redirect_uri } = creds.body;
        window.location = `https://accounts.zoho.com/oauth/v2/auth?scope=ZohoCRM.modules.ALL&client_id=${client_id}&response_type=code&access_type=offline&redirect_uri=${redirect_uri}`;
        // window.open(`https://accounts.zoho.com/oauth/v2/auth?scope=ZohoCRM.modules.ALL&client_id=${client_id}&response_type=code&access_type=offline&redirect_uri=${redirect_uri}`, '_blank')
        this.isInputVisible = true;
      } catch (err) {
        this.alertToggle({ message: err.data, isShow: true, type: "error" });
      }
    },
    // async getZohoCrmData() {
    //   try {
    //     const result = await this.$http.get("/zoho/crm-records?user=Sakis%20Kyriakou");
    //   } catch (err) {
    //     if (err.status === 401) this.isTokenExpired = true;
    //     this.alertToggle({ message: err.data, isShow: true, type: "error" });
    //   } finally {
    //     await this.getReports(this.reportRefreshDates.from, this.reportRefreshDates.to);
    //   }
    // },
    getCurrentMonth() {
      return moment(this.today).format("MMMM");
    },
    formattedDate(date) {
      return moment(date).format("DD-MM-YYYY");
    },
    gradeLetter(percent) {
      let result = "F";
      Object.keys(this.grades).forEach((key) => {
        if (Math.round(percent) >= this.grades[key].min && Math.round(percent) <= this.grades[key].max) {
          result = key;
        }
      });
      if (percent > 100) {
        result = "A+";
      }
      return result;
    },
  },
  computed: {
    rangeAverages() {
      let result = { grade: "", percent: 0, leads: 0, calls: 0, communications: 0, meetings: 0 };
      if (this.tableData.length) {
        for (let row of this.tableData) {
          result.percent += +row.percent;
          result.leads += +row.leads;
          result.calls += +row.calls;
          result.communications += +row.communications;
          result.meetings += +row.meetings;
        }
        result.leads = Math.round(result.leads / this.tableData.length);
        result.calls = Math.round(result.calls / this.tableData.length);
        result.communications = Math.round(result.communications / this.tableData.length);
        result.meetings = Math.round(result.meetings / this.tableData.length);
        result.percent = Math.round(result.percent / this.tableData.length);
        result.grade = this.gradeLetter(result.percent);
      }
      return result;
    },
    reportRefreshDates() {
      let result = { from: "", to: "" };
      if (this.tableData.length) {
        const fromDate = new Date(this.tableData[0].date);
        fromDate.setHours(2);
        const toDate = new Date(this.tableData[this.tableData.length - 1].date);
        result = { from: fromDate, to: toDate };
      }
      return result;
    },
  },
  components: {
    DataTable,
    Button,
    DateRange,
    Charts,
    Toggler,
  },
  mounted() {
    this.getReports();
  },
};
</script>
<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.activities {
  width: 1040px;
  margin: 50px;
  &__title {
    font-size: 22px;
    font-weight: bold;
    margin-bottom: 50px;
  }
  &__bars {
    margin-bottom: 40px;
  }
  &__table {
    padding: 20px;
    margin-top: 20px;
    box-sizing: border-box;
    box-shadow: 0 0 10px #66563d9d;
  }
  &__header,
  &__data,
  &__icons {
    height: 31px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  &__header {
    height: 40px;
    flex-direction: column;
    justify-content: space-between;
  }
  &__data-item {
    display: flex;
    justify-content: center;
    width: 20%;
    &:first-child {
      width: 45%;
    }
  }
  &__tokens {
    margin-top: 10px;
  }
  &__item {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
  }
  &__button {
    margin-right: 10px;
  }
  &__notes {
    max-height: 100%;
    overflow-y: auto;
  }
  &__input {
    border: 1px solid $light-brown;
    border-radius: 2px;
    box-sizing: border-box;
    padding: 2px 5px;
    width: 400px;
    outline: none;
    color: $main-color;
  }
  &__icons {
    padding: 0 10px;
    box-sizing: border-box;
    justify-content: space-around;
  }
  &__icon {
    opacity: 0.5;
  }
  &__text {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding: 5px;
    box-shadow: inset 0 0 5px $brown-shadow;
    border: none;
    background: none;
    color: $main-color;
  }
  &_flex-end {
    justify-content: flex-end;
  }
  &_space-around {
    justify-content: space-around;
  }
  &_orange {
    color: $orange;
  }
  &_opacity-1 {
    opacity: 1;
  }
}
</style>