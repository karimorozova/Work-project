<template lang="pug">
.validation__errors(:style="customStyles")
    .validation__messages
        .validation__errors-title Errors:
        li.validation__error(v-for="error in errors") {{ error }}
        span.validation__close(@click="closeErrors") +
</template>

<script>
export default {
    props: {
        errors: {
            type: Array
        },
        customStyles: {
            type: Object
        }
    },
    methods: {
        closeErrors() {
            this.$emit("closeErrors");
        }
    }
}
</script>

<style lang="scss" scoped>
@import "../assets/scss/colors.scss";

.validation {
    &__errors {
        position: fixed;
        top: 45%;
        left: 50%;
        margin-left: -300px;
        width: 300px;
        padding: 15px;
        box-shadow: 0 0 10px $brown-shadow;
        background-color: $white;
        z-index: 50;
    }
    &__errors-title {
        font-size: 18px;
        text-align: center;
        margin-bottom: 10px; 
    }
    &__messages {
        position: relative;
    }
    &__error {
        color: $orange;
        font-size: 16px;
        font-weight: 600;
    }
    &__close {
        transform: rotate(45deg);
        position: absolute;
        top: -12px;
        right: -8px;
        font-size: 24px;
        font-weight: 700;
        cursor: pointer;
    }
}
</style>
