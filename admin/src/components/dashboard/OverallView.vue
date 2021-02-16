<template lang="pug">
  .overallView
    .overallView__col
      .col__title Today
      .col__table.shadow
        DatapickerWrapper(btnText="Accept" @updateFilter="updateData")
          Datepicker(
            :dateMinutes="0"
            :dateHours="0"
            @selected="(e) => setDate(e, 'startDateDay')"
            calendarClass="vendor__calendar-custom"
            :inline="true"
            monday-first=true
          )
          Datepicker(
            :dateMinutes="23"
            :dateHours="59"
            @selected="(e) => setDate(e, 'endDateDay')"
            calendarClass="vendor__calendar-custom"
            :inline="true"
            monday-first=true
          )
        TableMargin(:tableData="tableMarginToday")
        TableClientReceivables(:tableData="tableClientReceivablesToday")
    .overallView__spaceLine
      .overallView__spaceLine-line
    .overallView__col
      .col__title Month
      .col__table.shadow
        DatapickerWrapper(btnText="Accept" @updateFilter="updateData")
          Datepicker(
            @selected="(e) => setDate(e, 'startDateMonth')"
            calendarClass="vendor__calendar-custom"
            :inline="true"
            monday-first=true
          )
          Datepicker(
            @selected="(e) => setDate(e, 'endDateMonth')"
            calendarClass="vendor__calendar-custom"
            :inline="true"
            monday-first=true
          )

        TableMargin(:tableData="tableMarginMonth")
        TableClientReceivables(:tableData="tableClientReceivablesMonth")

</template>
<script>
import TableMargin from "./OverallViewChildrens/TableMargin"
import TableClientReceivables from "./OverallViewChildrens/TableClientReceivables"
import PieChart from "./OverallViewChildrens/PieChart"
import Datepicker from "../Datepicker"
import DatapickerWrapper from "../DatapickerWrapper"

export default {
  data() {
    return {
      startDateDay: null,
      startDateMonth: null,
      endDateDay: null,
      endDateMonth: null,
      isDatepickers: false,
      tableMarginToday: [],
      tableMarginMonth: [],
      tableClientReceivablesToday: [],
      tableClientReceivablesMonth: []
    }
  },
  methods: {
    updateData() {
      this.getFinanceData()
    },
    async getFinanceData() {
      const result = await this.$http.post('/dashboard/finance-view', { startDateDay: this.startDateDay, endDateDay: this.endDateDay , startDateMonth: this.startDateMonth , endDateMonth: this.endDateMonth })
      const { dayStats, monthStats } = result.body
      const { marginInfo: marginInfoDay, clientsInfo: clientsInfoDay } = dayStats
      const { marginInfo: marginInfoMonth, clientsInfo: clientsInfoMonth } = monthStats
      this.tableMarginToday = [ marginInfoDay ]
      this.tableClientReceivablesToday = clientsInfoDay
      this.tableMarginMonth = [ marginInfoMonth ]
      this.tableClientReceivablesMonth = clientsInfoMonth
    },
    setDate(e, prop) {
      this[prop] = new Date(e)
    }

  },
  created() {
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
.overallView {
  width: 1000px;
  margin: 40px;
  display: flex;

  &__spaceLine {
    width: 100px;
    display: flex;
    margin-top: 75px;
    justify-content: center;

    &-line {
      width: 1px;
      height: auto;
      background: #dbd3c9;
    }
  }

  &__col {
    width: 450px;
  }

  .col {
    &__title {
      text-align: center;
      font-size: 22px;
      font-weight: bold;
    }

    &__table {
      margin-top: 50px;
      padding: 10px 20px;
    }

    &__chart {
      margin-top: 50px;
    }
  }

  .shadow {
    box-shadow: 0 2px 4px 0 rgba(103, 87, 62, .3), 0 2px 16px 0 rgba(103, 87, 62, .2);
  }

}
</style>