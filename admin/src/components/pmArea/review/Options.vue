<template lang="pug">
    .options
        .options__item(:class="{'options_green': isDeliver}" @click="toggleDelivery") Deliver to Client
        .options__item(:class="{'options_green': isNotify}" @click="toggleNotify") Notify Client
</template>

<script>
export default {
    props: {
        isDeliver: {type: Boolean}, 
        isNotify: {type: Boolean}, 
    },
    methods: {
        toggleDelivery() {
            this.$emit("toggleDelivery")
        },
        toggleNotify() {
            this.$emit("toggleNotify")
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
    box-sizing: border-box;
    width: 240px;
    font-size: 14px;
    &__item {
        width: 50%;
        padding: 5px 10px;
        display: flex;
        align-items: center;
        cursor: pointer;
        &:first-child {
            border-right: 1px solid $main-color;
        }
    }
    &_green {
        background-color: $green;
        color: $white;
    }
}

</style>
