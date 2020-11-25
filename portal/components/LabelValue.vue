<template lang="pug">
    .pair(:class="customClass")
        label.pair__label(:class="labelClass") {{ title }}
            span.pair__colon(v-if="isColon") :
        span.pair__value(:class="valueClass") {{ value }}
            slot
</template>

<script>
export default {
    props: {
        title: {type: String},
        value: {type: [String, Number]},
        customClass: {type: String},
        labelClass: {type: String},
        valueClass: {type: String},
        isColon: {tyep: Boolean}
    }
}
</script>

<style lang="scss" scoped>
@import "../assets/scss/colors.scss";

.pair {
    display: flex;
    font-size: 16px;
    align-items: center;
    justify-content: flex-start;
    &__label {
        margin-right: 10px;
    }
}

.pair_column-flex {
    flex-direction: column;
    .pair__label {
        margin-right: 0;
    }
}

.order-confirm {
    flex-direction: column;
    align-items: flex-start;
    &__label {
        font-size: 22px;
        margin-right: 0;
    }
    &__value {
        color: $orange;
        font-weight: 400;
    }
}

.quote-item {
    align-items: flex-start;
    .pair__label {
        font-size: 12px;
    }
    .pair__value {
        width: 100%;
    }
}

.label_required {
    position: relative;
    &:after {
        content: "*";
        position: absolute;
        top: -3px;
        right: -5px;
        color: $red;
    }
}

.align-centered {
    text-align: center;
}

</style>
