<template lang="pug">
  .overallView
    .overallView__col
      .col__title Today
      ProjectFinanceStats
    .overallView__spaceLine
      .overallView__spaceLine-line
    .overallView__col
      .col__title Month
      ProjectFinanceStats(:startDateSet="startDateMonth")

</template>
<script>
import ProjectFinanceStats from "./OverallViewChildrens/ProjectFinanceStats"
import moment from "moment"

export default {
  data() {
    return {
      startDateMonth:  moment({hour: 0, minute: 0, second: 0}).subtract(30, 'days').toDate(),
    }
  },
  components: {
    ProjectFinanceStats,
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
      font-family: Myriad600;
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
    box-shadow: rgba(81, 68, 48, 0.3) 0px 1px 2px 0px, rgba(81, 68, 48, 0.15) 0px 1px 3px 1px;
  }

}
</style>