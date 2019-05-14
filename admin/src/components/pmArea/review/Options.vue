<template lang="pug">
    .options
        .options__item(:class="{'options_brown': isDeliver}" @click="(e) => toggleDelivery(e, true)") Deliver to Client
        .options__item(:class="{'options_brown': !isDeliver}" @click="(e) => toggleDelivery(e, false)") Notify Client
</template>

<script>
export default {
    props: {
        isDeliver: {type: Boolean},
    },
    methods: {
        toggleDelivery(e, bool) {
            this.$emit("toggleDelivery", { bool })
        }
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.options {
    display: flex;
    align-items: center;
    border: 1px solid $main-color;
    border-radius: 8px;
    box-sizing: border-box;
    width: 260px;
    font-size: 14px;
    overflow: hidden;
    &__item {
        width: 50%;
        padding: 5px 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: $main-color;
        font-weight: 600;
        &:first-child {
            border-right: 1px solid $main-color;
        }
    }
    &_brown {
        background-color: $main-color;
        color: $white;
        &:first-child {
            border-right: 1px solid $white;
        }
    }
}

</style>
