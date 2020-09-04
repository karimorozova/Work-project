<template lang="pug">
.pieChart
  .pieChart__titleRow
    .titleRow__col
      .titleRow__col-colorBlock(:style="{ background: pieChartTitles[0].color }")
      .titleRow__col-title {{ pieChartTitles[0].title }}
    .titleRow__col
      .titleRow__col-colorBlock(:style="{ background: pieChartTitles[1].color }")
      .titleRow__col-title {{ pieChartTitles[1].title }}

  .pieChart__chart
    chartist(type="Pie", :data="pieChartParams.chartData", :options="pieChartParams.chartOptions")
</template>
<script>
export default {
  props: {
    pieChartTitles: {
      type: Array,
    },
    pieChartParams: {
      type: Object,
    }
  },
};
</script>

<style lang="scss">
.pieChart {
  &__titleRow {
    display: flex;
    justify-content: center;
    margin-bottom: 25px;
  }
  .titleRow__col {
    width: 125px;
    display: flex;
    margin: 0 15px;
    &-colorBlock {
      height: 18px;
      width: 18px;
      margin-right: 5px;
    }
  }
}
.ct-square {
  display: flex;
  justify-content: center;
}
.ct-series-a {
  fill: #d15f45;
  stroke: #d15f45;
}
.ct-series-b {
  fill: #ff8376;
  stroke: #ff8376;
}
.ct-label {
  fill: white;
}
</style>