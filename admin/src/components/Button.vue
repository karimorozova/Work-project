<template lang="pug">
.action-button(:class="[customClass, {disabled: isDisabled}]")
    input.action-button__button(type="button" :value="value" @click="clicked" :disabled="isDisabled")    
</template>

<script>
export default {
    props: {
        value: {
            type: String
        },
        isDisabled: {
            type: Boolean
        },
        customClass: {
            type: String
        }
    },
    methods: {
        clicked() {
            this.$emit('clicked', {value: this.value})
        }
    }
}
</script>

<style lang="scss" scoped>
@import "../assets/scss/colors.scss";

.action-button {
    &__button {
        width: 138px;
        height: 33px;
        color: $white;
        font-size: 14px;
        font-weight: 700;
        border-radius: 10px;
        box-shadow: 0 3px 5px rgba(103, 87, 62, 0.5);
        background-color: $orange;
        border: 1px solid $orange;
        cursor: pointer;
        outline: none;
        &:hover {
            box-shadow: 0 0 7px rgba(103, 87, 62, 0.8);     
        }
        &:active {
            box-shadow: 0 0px 15px rgba(103, 87, 62, 1);
        }
    }
    .other-choice & {
        margin: 7px;
        @media (max-width: 450px) {
            margin: 5px;
        }
    }
}

.main-nav_button {
    .action-button__button {
        width: 168px;
        box-shadow: 0 0px 5px rgba(0, 0, 0, 0.7);
        &:hover {
            box-shadow: 0 0 12px rgba(0, 0, 0, 0.7);     
        }
        &:active {
            transform: scale(0.98);
        }
    }
}

.disabled {
    .action-button__button {
        opacity: 0.5;
        box-shadow: none;
        background-color: $orange;
        border: 1px solid $orange;
        cursor: default;
        outline: none;
        &:hover {
            box-shadow: none;     
        }
        &:active {
            box-shadow: none;
        }
    }
}

</style>
