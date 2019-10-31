<template lang="pug">
    .details(v-click-outside="cancel")
        .details__icons(v-if="areIcons")
            img.details__icon(v-for="(icon, key) in icons" :src="icon.src" :class="{'details_opacity-06': isActive(key)}" @click="makeAction(key)")
        .details__row
            .details__col
                .details__item
                    LabelVal(text="Rate:" customClass="finance-details")
                        span.details__data.details_opacity-06(v-if="!isEditing") {{ financeData.rateValue }} &euro;
                        input.details__input(v-else type="text" size="6" v-model="currentData.rateValue")
                .details__item
                    LabelVal(text="Quantity[Relative]:" customClass="finance-details")
                        span.details__data.details_opacity-06(v-if="!isQuantityEditable") {{ financeData.quantityRelative }}
                        input.details__input(v-else type="text" size="6" v-model="currentData.quantityRelative")
                .details__item
                    LabelVal(text="Subtotal:" customClass="finance-details")
                        span.details__data.details_opacity-06 {{ financeData.subtotal }} &euro;
            .details__col
                .details__item
                    LabelVal(text="Minimum charge:" customClass="finance-details")
                        span.details__data.details_opacity-06(v-if="!isEditing") {{ financeData.minimum }} &euro;
                        input.details__input(v-else type="text" size="6" v-model="currentData.minimum")
                .details__item
                    LabelVal(text="Quantity [Total]:" customClass="finance-details")
                        span.details__data.details_opacity-06(v-if="!isQuantityEditable") {{ financeData.quantityTotal }}
                        input.details__input(v-else type="text" size="6" v-model="currentData.quantityTotal")
                .details__item
                    LabelVal(text="Discounts/Surcharges:" customClass="finance-details")
                        span.details__data.details_opacity-06(v-if="!isEditing") {{ financeData.discount }} %
                        input.details__input(v-else type="text" size="6" v-model="currentData.discount")
        .details__row.details_border-top
            .details__col.details_margin-top
                .details__item.details_no-margin-bottom
                    LabelVal(text="Total:" customClass="finance-details")
                        span.details__data(type="text" :value="total" :class="{'details_opacity-06': !isEditing}") {{ total }} &euro;
        ValidationErrors(v-if="areErrorsExist" :errors="errors" @closeErrors="closeErrorsBlock" :isAbsolute="isEditing")
</template>

<script>
import LabelVal from "@/components/LabelVal";
import ValidationErrors from "../../../ValidationErrors";
import ClickOutside from "vue-click-outside";
import { mapGetters } from "vuex";

export default {
    props: {
        financeData: {type: Object}
    },
    data() {
        return {
            icons: {
                save: {src: require('../../../../assets/images/Other/save-icon-qa-form.png')},
                edit: {src: require('../../../../assets/images/Other/edit-icon-qa.png')}
            },
            isEditing: false,
            currentData: "",
            areErrorsExist: false,
            floatRegex: /^[+-]?\d+(\.\d+)?$/,
            integerRegex: /^[1-9]\d*$/
        }
    },
    methods: {
        isActive(key) {
            return key === 'edit' ? this.isEditing : !this.isEditing;
        },
        makeAction(key) {
            if(key === 'edit' && this.isEditing) return;
            if(key === 'edit') {
                this.isEditing = true;
                this.currentData = Object.keys(this.financeData).reduce((prev, cur) => {
                    prev[cur] = this.financeData[cur];
                    return {...prev};
                }, {});
            } else {
                if(!this.isEditing) return;
                this.checkForErrors();
            }
        },
        checkForErrors() {
            this.errors = [];
            if(!this.currentData.rateValue || !this.floatRegex.test(this.currentData.rateValue)) this.errors.push("Set valid Rate value (integer/float)");
            if(this.currentData.minimum && !this.floatRegex.test(this.currentData.minimum)) this.errors.push("Set valid Minimum Charge value (integer/float)");
            if(this.currentData.discount && !this.floatRegex.test(this.currentData.discount)) this.errors.push("Set valid Discount value (integer/float)");
            if(!this.currentData.quantityRelative || !this.integerRegex.test(this.currentData.quantityRelative)) this.errors.push("Set valid Quantity[Relative] value(integer)");
            if(!this.currentData.quantityTotal || !this.integerRegex.test(this.currentData.quantityTotal)) this.errors.push("Set valid Quantity[Total] value(integer)");
            if (this.errors.length) {
                return this.areErrorsExist = true;
            }
            this.$emit("save", this.currentData);
            this.cancel();
        },
        closeErrorsBlock() {
            this.areErrorsExist = false;
        },
        cancel() {
            this.isEditing = false;
            this.currentData = "";
            this.closeErrorsBlock();
        }
    },
    computed: {
        ...mapGetters({
            userGroup: "getUserGroup"
        }),
        total() {
            let result = (+this.financeData.subtotal - +(this.financeData.subtotal*this.financeData.discount/100)).toFixed(2);
            if(this.isEditing) {
                result = (+this.currentData.subtotal - +(this.currentData.subtotal*this.currentData.discount/100)).toFixed(2);
            }
            return result;
        },
        isQuantityEditable() {
            const groups = ["Administrators", "Developers"];
            return this.isEditing && groups.indexOf(this.userGroup.name) !== -1;
        },
        areIcons() {
            let forbidden = ["Cancelled", "Cancelled Halfway", "Completed"];
            const groups = ["Administrators", "Developers"];
            if(groups.indexOf(this.userGroup.name) !== -1) {
                return forbidden.indexOf(this.financeData.stepStatus) === -1;
            }
            return [...forbidden, "Started"].indexOf(this.financeData.stepStatus) === -1;
        }
    },
    components: {
        LabelVal,
        ValidationErrors
    },
    directives: {
        ClickOutside
    }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors";

.details {
    box-sizing: border-box;
    padding: 20px;
    box-shadow: 0 0 5px $brown-shadow;
    position: relative;
    &__icons {
        width: 100%;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        margin-bottom: 20px;
    }
    &__icon {
        margin-left: 10px;
        cursor: pointer;
    }
    &__row {
        width: 100%;
        box-sizing: border-box;
        padding: 15px;
        display: flex;
    }
    &__col {
        width: 50%;
    }
    &__item {
        margin-bottom: 25px;
    }
    &__data {
        display: inline-block;
        height: 20px;
    }
    &__input {
        max-width: fit-content;
        box-sizing: border-box;
        border: 1px solid $light-brown;
        padding: 0 5px;
        border-radius: 5px;
        outline: none;
        color: $main-color;
    }
    &_opacity-06 {
        opacity: 0.6;
    }
    &_border-top {
        border-top: 2px solid $light-brown;
    }
    &_no-margin-bottom {
        margin-bottom: 0;
    }
    &_margin-top {
        margin-top: 20px;
    }
}

</style>
