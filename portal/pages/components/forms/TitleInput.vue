<template lang="pug">
    .pair-block(:class="customClass")
        .pair-block__title {{ title }}
            span.pair-block__asterisk(v-if="isAsterisk") *
        .pair-block__input
            slot
</template>

<script>
export default {
    props: {
        title: { type: String },
        customClass: { type: String },
        isAsterisk: { type: Boolean }
    },
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.pair-block {
    display: flex;
    flex-direction: column;
    color: $main-color;
    &__title {
        position: relative;
        font-size: 22px;
    }
    &__asterisk {
        position: absolute;
        font-size: 16px;
        color: red;
        margin-left: 3px;
        top: -3px;
    }
    &_flex-end {
        align-items: flex-end;
    }
}

</style>
