<template lang="pug">
.step-vendor
    .step-vendor__title Vendor:
    .step-vendor__info
        .step-vendor__drop-menu
            SelectSingle(
                :selectedOption="vendorName(vendor)"
                :options="vendorNames"
                placeholder="Select"
                @chosenOption="setVendor"
            )
        .step-vendor__contacts
            .step-vendor__icon
                i.fa.fa-info-circle
            .step-vendor__icon
                i.fa.fa-envelope
            .step-vendor__icon
                i.fa.fa-slack
    .step-vendor__options
        .step-vendor__check
            CustomRadio(:isChecked="isAfterRejectCheck" @toggleRadio="(e) => toggleRadio(e,'isAfterRejectCheck')")
            .step-vendor__text Send next vendor after rejection
        .step-vendor__check
            CustomRadio(:isChecked="isAfterTimeCheck" @toggleRadio="(e) => toggleRadio(e,'isAfterTimeCheck')")
            .step-vendor__text Send next vendor after
                .step-vendor__time 12h
</template>

<script>
import SelectSingle from "../../SelectSingle";
import CustomRadio from "../../CustomRadio";

export default {
    props: {
        vendor: {
            type: Object
        },
        vendors: {
            type: Array
        }
    },
    data() {
        return {
            isAfterRejectCheck: false,
            isAfterTimeCheck: false
        }
    },
    methods: {
        vendorName(vendor) {
            return vendor ? vendor.firstName + ' ' + vendor.surname : "";
        },
        setVendor({option}) {
            const vendor = this.vendors.find(item => { 
                return item.firstName + " " + item.surname === option
            })
            this.$emit('setStepVendor', { vendor });
        },
        toggleRadio(e, key) {
            this[key] = !this[key];
        }
    },
    computed: {
        vendorNames() {
            return this.vendors.map(item => {
                return item.firstName + ' ' + item.surname
            })
        }
    },
    components: {
        SelectSingle,
        CustomRadio
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.step-vendor {
    box-shadow: 0 0 5px $brown-shadow;
    padding: 10px;
    &__title {
        margin-bottom: 15px;
        font-size: 18px;
    }
    &__info {
        display: flex;
        align-items: flex-end;
        margin-bottom: 40px;
    }
    &__drop-menu {
        position: relative;
        width: 191px;
        height: 28px;
    }
    &__contacts {
        max-height: 28px;
        display: flex;
    }
    &__icon {
        margin-left: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 28px;
        i {
            font-size: 24px;
            cursor: pointer;
        }
        .fa-slack {
            border: 1px solid $light-brown;
            border-radius: 5px;
        }
    }
    &__options {
        display: flex;
        width: 80%;
        justify-content: space-between;
        align-items: center;
    }
    &__check {
        display: flex;
        width: 50%;
    }
    &__text {
        margin-left: 10px;
        display: flex;
    }
}
</style>
