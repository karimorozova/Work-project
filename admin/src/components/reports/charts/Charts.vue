<template lang="pug">
    .line-chart
        .labels
            .labels__item New Leads
            .labels__item Calls
            .labels__item Comm
            .labels__item Meetings
        .line-bars
            LineBars(
                :leads="leads"
                :calls="calls"
                :communications="communications"
                :meetings="meetings"
            )
        //- .radial-bar
        //-     Radial
</template>

<script>
import LineBars from "./LineBars";
import Radial from "./Radial";

export default {
    props: {
        leads: {type: [String, Number]},
        calls: {type: [String, Number]},
        communications: {type: [String, Number]},
        meetings: {type: [String, Number]},
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
    padding: 20px 15px 20px 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    border-right: 1px solid $light-brown;
    box-shadow: 22px 0 20px -25px $brown-shadow;
    &__item {
        font-weight: 600;
        font-size: 14px;
        height: 14px;
    }
}

</style>
