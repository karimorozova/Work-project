<template lang="pug">
    .col__table.shadow
      DatapickerWrapper(btnText="Accept" @updateFilter="updateData")
        Datepicker(
          :value="startDate"
          @selected="(e) => setDate(e, 'startDate')"
          calendarClass="vendor__calendar-custom"
          :inline="true"
          monday-first=true
        )
        Datepicker(
          :value="endDate"
          @selected="(e) => setDate(e, 'endDate')"
          calendarClass="vendor__calendar-custom"
          :inline="true"
          monday-first=true
        )
      TableMargin(:tableData="tableMarginInfo")
      TableClientReceivables(:tableData="tableClientReceivablesInfo")
</template>
<script>
import TableMargin from "./TableMargin"
import TableClientReceivables from "./TableClientReceivables"
import PieChart from "./PieChart"
import Datepicker from "../../Datepicker"
import DatapickerWrapper from "../../DatapickerWrapper"
import moment from "moment"

export default {
  props: {
    title: String,
    startDateSet: moment(),
    endDateSet: moment(),
  },
  data() {
    return {
      startDate: null,
      endDate: null,
      isDatepickers: false,
      tableMarginInfo: [],
      tableClientReceivablesInfo: [],
    }
  },
  methods: {
    updateData() {
      this.getFinanceData()
    },
    async getFinanceData() {
      const result = await this.$http.post('/dashboard-api/finance-view', { startDate: this.startDate, endDate: this.endDate })
      const { marginInfo, clientsInfo } = result.body
      this.tableMarginInfo = [ marginInfo ]
      this.tableClientReceivablesInfo = clientsInfo
    },
    setDate(e, prop) {
      this[prop] = new Date(e)
    }

  },
  created() {
    this.startDate = this.startDateSet
    this.endDate = this.endDateSet
    this.getFinanceData()
  },
  components: {
    DatapickerWrapper,
    TableMargin,
    TableClientReceivables,
    PieChart,
    Datepicker
  }
}
</script>
<style lang="scss" scoped>
  @import "../../../assets/scss/colors";
  .col {
    &__table {
      margin-top: 50px;
      padding: 10px 20px;
    }
  }

  .shadow {
    box-shadow: $box-shadow;
  }
</style>