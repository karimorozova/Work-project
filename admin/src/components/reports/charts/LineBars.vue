<template lang="pug">
    .bars
        .bars__item
            Bar(:currentValue="leads" totalValue="30")
        .bars__item
            Bar(:currentValue="calls" totalValue="30")
        .bars__item
            Bar(:currentValue="communications" totalValue="50")
        .bars__item
            Bar(:currentValue="meetings" totalValue="1")
</template>

<script>
import Bar from "./Bar"
export default {
    props: {
        leads: {type: [String, Number]},
        calls: {type: [String, Number]},
        communications: {type: [String, Number]},
        meetings: {type: [String, Number]},
    },
    components: {
        Bar
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.bars {
    width: 380px;
    display: flex;
    flex-direction: column;
    padding: 20px 0;
    &__item {
        margin-bottom: 40px;
        &:last-child {
            margin-bottom: 0;
        }
    }
}

</style>
