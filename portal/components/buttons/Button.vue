<template lang="pug">
.action-button(:class="{'action-button_disabled': isDisabled}")
    input.action-button__button(type="button" :value="value" @click="makeAction" :class="buttonClass")    
</template>

<script>
export default {
    props: {
        value: {
            type: String
        },
        isDisabled: {
            type: Boolean,
            default: false
        },
        buttonClass: {
            type: String
        }
    },
    methods: {
        makeAction() {
            this.$emit('makeAction', {value: this.value})
        }
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.action-button {
    &__button {
        width: 138px;
        height: 33px;
        color: $white;
        font-size: 14px;
        border-radius: 10px;
        box-shadow: 0 3px 5px $brown-shadow;
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
    .tasks-approve {
        background-color: $green;
        border-color: $green;
    }
}

.action-button_disabled {
    .action-button__button {
        box-shadow: none;
        cursor: default;
        &:hover {
            box-shadow: none;
        }
        &:active {
            box-shadow: none;
        }
    }
}

.white-back {
    background-color: $white;
    color: $main-color;
    border: 1px solid $main-color;
}

</style>
