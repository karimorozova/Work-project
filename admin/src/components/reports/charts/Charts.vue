<template lang="pug">
    .line-chart
        .labels
            .labels__item New Leads
            .labels__item Calls
            .labels__item Comm
            .labels__item Meetings
        .line-bars
            LineBars(
                :leads="rangeLeads"
                :calls="rangeCalls"
                :communications="rangeCommunications"
                :meetings="rangeMeetings"
            )
        .radial-bar
            .radial-bar__item
                Radial(:currentVal="todaysLeads" recordName="New Leads")
            .radial-bar__item
                Radial(:currentVal="todaysCalls" recordName="Calls")
            .radial-bar__item
                Radial(total="50" :currentVal="todaysCommunications" recordName="Comm")
            .radial-bar__item
                Radial(total="1" :currentVal="todaysMeetings" recordName=" Meetings")
</template>

<script>
import LineBars from "./LineBars";
import Radial from "./Radial";

export default {
    props: {
        rangeLeads: {type: [String, Number]},
        rangeCalls: {type: [String, Number]},
        rangeCommunications: {type: [String, Number]},
        rangeMeetings: {type: [String, Number]},
        todaysLeads: {type: [String, Number]},
        todaysCalls: {type: [String, Number]},
        todaysCommunications: {type: [String, Number]},
        todaysMeetings: {type: [String, Number]}
    },
    components: {
        LineBars,
        Radial
    }    
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.line-chart {
    display: flex;
}

.labels {
    padding: 40px 15px 40px 0;
    box-sizing: border-box;
    border-right: 1px solid $light-brown;
    box-shadow: 22px 0 20px -25px $brown-shadow;
    max-height: 250px;
    box-sizing: border-box;
    &__item {
        font-weight: 600;
        font-size: 14px;
        height: 14px;
        margin-bottom: 40px;
    }
}

.radial-bar {
    margin-left: 60px;
    display: flex;
    justify-content: space-between;
    width: 450px;
    max-height: 300px;
    flex-wrap: wrap;
    &__item {
        width: 50%;
        display: flex;
        justify-content: center;
    }
}

</style>
