<template lang="pug">
.line-chart
  .labels
    .labels__item New Leads
    .labels__item Calls
    .labels__item Comm
    .labels__item Meetings
  .line-bars
    LineBars(
      :leads="rangeLeads",
      :calls="rangeCalls",
      :communications="rangeCommunications",
      :meetings="rangeMeetings"
    )
  .radial-bar
    .radial-bar__item
      Radial(:currentVal="todaysLeads", recordName="New Leads")
    .radial-bar__item
      Radial(:currentVal="todaysCalls", recordName="Calls")
    .radial-bar__item
      Radial(total="50", :currentVal="todaysCommunications", recordName="Comm")
    .radial-bar__item
      Radial(total="1", :currentVal="todaysMeetings", recordName=" Meetings")
</template>

<script>
import LineBars from "./LineBars";
import Radial from "./Radial";

export default {
  props: {
    rangeLeads: { type: [String, Number] },
    rangeCalls: { type: [String, Number] },
    rangeCommunications: { type: [String, Number] },
    rangeMeetings: { type: [String, Number] },
    todaysLeads: { type: [String, Number] },
    todaysCalls: { type: [String, Number] },
    todaysCommunications: { type: [String, Number] },
    todaysMeetings: { type: [String, Number] },
  },
  components: {
    LineBars,
    Radial,
  },
};
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors.scss";

.line-chart {
  display: flex;
}

.labels {
  padding: 47px 30px 20px 0;
  border-right: 1px solid #dbd3c9;
  box-shadow: rgba(81, 68, 48, 0.3) 0px 1px 2px 0px, rgba(81, 68, 48, 0.15) 0px 1px 3px 1px;
  max-height: 280px;
  width: 115px;
  box-sizing: border-box;
  &__item {
    font-weight: bold;
    height: 14px;
    margin-bottom: 40px;
  }
}

.radial-bar {
  margin-left: 110px;
  display: flex;
  justify-content: space-between;
  width: 450px;
  flex-wrap: wrap;
  &__item {
    width: 50%;
    display: flex;
    justify-content: center;
  }
}
</style>
