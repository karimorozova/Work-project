<template lang="pug">
    .detail-pair
        LabelValue(
            :title="title" 
            :value="value"
            customClass="order-confirm" 
            labelClass="order-confirm__label" 
            valueClass="order-confirm__value"
        )
</template>

<script>
import LabelValue from "~/components/LabelValue";

export default {
    props: {
        title: {type: String},
        value: {type: String},
    },
    components: {
        LabelValue
    }
}
</script>

<style lang="scss" scoped>

</style>
