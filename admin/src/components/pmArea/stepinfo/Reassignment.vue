<template lang="pug">
    .reassignment
        span.reassignment__close(@click="close") +
        .reassignment__title Reassignment of the Step
        .reassignment__main
            .reassignment__row
                LabelVal(text="Reason to reassign")
                    .reassignment__drop
                        PersonSelect(customClass="bordered arrow-20")
            .reassignment__row
                LabelVal(text="New Vendor")
                    .reassignment__drop
                        SelectSingle
            .reassignment__row
                LabelVal(text="Should new Vendor start from the beggining?" customClass="column")
                    .reassignment__check
                        CheckBox
                        .reassignment__check-label Yes
                    .reassignment__check
                        CheckBox
                        .reassignment__check-label No
            .reassignment__row
                LabelVal(text="Should old Vendor be paid for this part?" customClass="column")
                    .reassignment__check
                        CheckBox
                        .reassignment__check-label Yes
                    .reassignment__check
                        CheckBox
                        .reassignment__check-label No
                    .reassignment__work
                        input.reassignment__percent(type="text")
                        span.reassignment__text %  is done
        .reassignment__buttons
            .reassignment__button
                Button(value="Save")
            .reassignment__button
                Button(value="Cancel" @clicked="close")
</template>

<script>
import LabelVal from "@/components/LabelVal";
import PersonSelect from "../PersonSelect";
import Button from "@/components/Button";
import SelectSingle from "@/components/SelectSingle";
import CheckBox from "@/components/CheckBox";

export default {
    props: {
        step: {type: Object}
    },
    methods: {
        close() {
            this.$emit('close');
        }
    },
    components: {
        LabelVal,
        SelectSingle,
        PersonSelect,
        CheckBox,
        Button
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.reassignment {
    background-color: $white;
    box-shadow: 0 0 5px $brown-shadow;
    padding: 20px;
    width: 400px;
    box-sizing: border-box;
    margin: 0 auto;
    position: relative;
    &__title {
        text-align: center;
        font-size: 22px;
        font-weight: 600;
        margin-bottom: 20px;
    }
    &__row {
        margin-bottom: 20px;
    }
    &__drop {
        position: relative;
        height: 28px;
        width: 191px;
    }
    &__check {
        display: flex;
        align-items: center;
        margin: 5px 20px 0 0;
    }
    &__check-label {
        margin-left: 5px;
    }
    &__percent {
        width: 30px;
        margin: 5px 5px 0 0;
        padding: 0 5px;
        box-sizing: border-box;
        border: 1px solid $main-color;
        outline: none;
        color: $main-color;
        transition: all 0.2s;
        &:focus {
            box-shadow: 0 0 5px $light-brown;
        }
    }
    &__buttons {
        display: flex;
        justify-content: center;
    }
    &__button {
        margin: 0 10px;
    }
    &__close {
        position: absolute;
        transform: rotate(45deg);
        top: 5px;
        right: 10px;
        font-weight: bold;
        font-size: 24px;
        cursor: pointer;
    }
}

</style>
