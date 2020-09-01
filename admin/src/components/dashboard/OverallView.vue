<template lang="pug">
.overallView
  .overallView__col
    .col__title Today
    .col__table
      TableMargin(:tableData="tableMarginToday")
    .col__chart
      PieChart(:pieChartTitles="pieChartTitles", :pieChartParams="pieChartToday")
    .col__table
      TableClientReceivables(:tableData="tableClientReceivablesToday")
  .overallView__spaceLine
    .overallView__spaceLine-line

  .overallView__col
    .col__title This Month
    .col__table
      TableMargin(:tableData="tableMarginMonth")
    .col__chart
      PieChart(:pieChartTitles="pieChartTitles", :pieChartParams="pieChartMonth")
    .col__table
      TableClientReceivables(:tableData="tableClientReceivablesMonth")
</template>
<script>
import TableMargin from "./OverallViewChildrens/TableMargin";
import TableClientReceivables from "./OverallViewChildrens/TableClientReceivables";
import PieChart from "./OverallViewChildrens/PieChart";

export default {
  data() {
    return {
      pieChartTitles: [
        {
          title: "Current Clients",
          color: "#d15f45",
        },
        {
          title: "New Business",
          color: "#ff8376",
        },
      ],
      tableMarginToday: [
        {
          receivables: 123,
          payable: 123,
          margin: 123,
        },
      ],
      tableMarginMonth: [
        {
          receivables: 234,
          payable: 234,
          margin: 234,
        },
      ],
      tableClientReceivablesToday: [
        {
          client: "UFX.com",
          receivables: 123,
        },
        {
          client: "Playtika",
          receivables: 123,
        },
        {
          client: "Bestmart",
          receivables: 123,
        },
      ],
      tableClientReceivablesMonth: [
        {
          client: "UFX.com",
          receivables: 345,
        },
        {
          client: "Playtika",
          receivables: 345,
        },
        {
          client: "Bestmart",
          receivables: 345,
        },
      ],
      pieChartToday: {
        chartData: {
          labels: ["800", "200"],
          series: [80, 20],
        },
        chartOptions: {
          showLabel: true,
          width: 250,
          height: 250,
        },
      },
      pieChartMonth: {
        chartData: {
          labels: ["600", "400"],
          series: [60, 40],
        },
        chartOptions: {
          showLabel: true,
          width: 250,
          height: 250,
        },
      },
    };
  },
  components: {
    TableMargin,
    TableClientReceivables,
    PieChart,
  },
};
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
    }
    &__chart {
      margin-top: 50px;
    }
  }
}
</style>