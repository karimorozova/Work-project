<template lang="pug">
  .overallView
    h3 only for AM PM ADMIN
    //.overallView__col
      .col__title Today
      ProjectFinanceStats
    //.overallView__spaceLine
      .overallView__spaceLine-line
    //.overallView__col
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
  .overallView{
    padding: 20px;
    box-shadow: rgba(81, 68, 48, 0.3) 0px 1px 2px 0px, rgba(81, 68, 48, 0.15) 0px 1px 3px 1px;
    box-sizing: border-box;
    width: 1400px;
    margin: 50px;
  }
</style>