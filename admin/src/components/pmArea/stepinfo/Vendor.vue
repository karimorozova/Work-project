<template lang="pug">
.step-vendor
    .step-vendor__title Vendor:
    .step-vendor__info
        .step-vendor__drop-menu(v-if="isVendorSelect")
            PersonSelect(
                :selectedPerson="currentVendorName(vendor)"
                :persons="extendedVendors(-1)"
                :isExtended="isAllShow"
                :isAdditionalShow="true"
                @setPerson="setVendor"
                @togglePersonsData="toggleVendors"
            )
        .step-vendor__current-vendor(v-else) {{ currentVendorName(vendor) }}
            span.step-vendor__no-vendor(v-if="!vendor") No Vendor
        .step-vendor__contacts
            .step-vendor__icon(@click="gotToVendorInfo")
                i.fa.fa-info-circle
            .step-vendor__icon(@click="sendEmail")
                i.fa.fa-envelope
            .step-vendor__icon
                i.fa.fa-slack
    .step-vendor__options(v-if="isVendorSelect")
        .step-vendor__check
            CustomRadio(:isChecked="isAfterRejectCheck" @toggleRadio="(e) => toggleRadio(e,'isAfterRejectCheck')")
            .step-vendor__text Send next vendor after rejection
        .step-vendor__check
            CustomRadio(:isChecked="isAfterTimeCheck" @toggleRadio="(e) => toggleRadio(e,'isAfterTimeCheck')")
            .step-vendor__text Send next vendor after
            .step-vendor__time(:class="{'step-vendor_gap': isTimeDouble}")
                input.step-vendor__time-select(type="number" v-model="nextSendTime" min="1" max="24")
</template>

<script>
import PersonSelect from "../PersonSelect";
import SelectSingle from "../../SelectSingle";
import CustomRadio from "../../CustomRadio";
import { mapGetters, mapActions } from 'vuex';
import stepVendor from "@/mixins/stepVendor";

export default {
    mixins: [stepVendor],
    props: {
        vendor: {
            type: [Object, String]
        },
        step: {
            type: Object
        }
    },
    data() {
        return {
            isAfterRejectCheck: false,
            isAfterTimeCheck: false,
            nextSendTime: 1,
            isAllShow: false
        }
    },
    methods: {
        currentVendorName(vendor) {
            return vendor ? vendor.firstName + ' ' + vendor.surname : "";
        },
        async setVendor({person}) {
            if(this.vendor && this.vendor._id && person._id === this.vendor._id) return;
            const index = this.currentProject.steps.findIndex(item => item._id === this.step._id);
            try {
                await this.setStepVendor({vendor: person, index});
            } catch(err) {}
        },
        toggleRadio(e, key) {
            this[key] = !this[key];
        },
        toggleVendors({isAll}) {
            this.isAllShow = isAll;
        },
        async sendEmail() {
            try {
                if(!this.step.vendor) return;
                await this.$http.post("/vendorsapi/step-email", {projectId: this.currentProject._id, step : this.step});
                this.alertToggle({message: "Email hase been sent", isShow: true, type: "success"});
            } catch(err) {
                this.alertToggle({message: "Internal server error / Cannot send email to vendor", isShow: true, type: "error"});
            }
        },
        gotToVendorInfo() {
            this.$router.push(`/vendors/details/${this.vendor._id}`);
        },
        ...mapActions({
            alertToggle: "alertToggle",
            setStepVendor: "setStepVendor"
        })
    },
    computed: {
        ...mapGetters({
            vendors: "getVendors",
            currentProject: "getCurrentProject",
            userGroup: "getUserGroup"
        }),
        isTimeDouble() {
            return this.nextSendTime.length === 2;
        },
        isVendorSelect() {
            const statuses = ['Started', 'Cancelled', 'Cancelled Halfway', 'Completed'];
            return statuses.indexOf(this.step.status) === -1;
        }
    },
    components: {
        SelectSingle,
        PersonSelect,
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
    &__no-vendor {
        opacity: 0.7;
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
        align-items: center;
        width: 50%;
    }
    &__text {
        margin-left: 10px;
        display: flex;
    }
    &__time {
        position: relative;
        &:after {
            content: "h";
            position: absolute;
            top: 3px;
            left: 27px;
        }
    }
    &_gap {
        &:after {
            left: 34px
        }
    }
    &__time-select {
        margin-left: 10px;
        border-radius: 5px;
        border: 1px solid $light-brown;
        overflow: hidden;
        color: $main-color;
        outline: none;
        padding-left: 5px;
        padding-top: 2px;
        &::-webkit-inner-spin-button,
        &::-webkit-outer-spin-button {
            opacity: 1;
        }
    }
}
</style>
