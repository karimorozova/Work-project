<template lang="pug">
.step-vendor
    .step-vendor__title Vendor:
    .step-vendor__info
        .step-vendor__drop-menu(v-if="step.status === 'Created'")
            PersonSelect(
                :selectedPerson="currentVendorName(vendor)"
                :persons="filteredVendors"
                :isExtended="isAllShow"
                :isAdditionalShow="isAdditionalShow"
                @setPerson="setVendor"
                @togglePersonsData="toggleVendors"
            )
        .step-vendor__current-vendor(v-else) {{ currentVendorName(vendor) }}
            span.step-vendor__no-vendor(v-if="!vendor") No Vendor
        .step-vendor__contacts
            .step-vendor__icon
                i.fa.fa-info-circle
            .step-vendor__icon(@click="sendEmail")
                i.fa.fa-envelope
            .step-vendor__icon
                i.fa.fa-slack
    .step-vendor__options(v-if="!isVendorApproved")
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

export default {
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
            isAllShow: false,
            isAdditionalShow: true
        }
    },
    methods: {
        currentVendorName(vendor) {
            return vendor ? vendor.firstName + ' ' + vendor.surname : "";
        },
        setVendor({person}) {
            this.$emit('setStepVendor', { person })
        },
        toggleRadio(e, key) {
            this[key] = !this[key];
        },
        checkForLanguages(vendor) {
            const service = this.services.find(item => {
                return this.step.name === "translate1" ? item.symbol === "tr" : item.symbol === "pr";
            });
            return vendor.languageCombinations.find(item => {
                if(item.source && item.source.symbol === this.step.source && 
                    item.target.symbol === this.step.target) {
                        return this.hasRateValue({
                                service: service._id, 
                                vendorIndustries: item.industries, 
                                stepIndustry: this.currentProject.industry._id
                            });
                }
            })
        },
        hasRateValue({service, vendorIndustries, stepIndustry}) {
            const industry = vendorIndustries.find(item => item.industry._id === stepIndustry);
            return industry ? industry.rates[service].value : false;
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
        ...mapActions({
            alertToggle: "alertToggle"
        })
    },
    computed: {
        ...mapGetters({
            vendors: "getVendors",
            currentProject: "getCurrentProject",
            services: "getVuexServices"
        }),
        filteredVendors() {
            if(this.isAllShow) {
                return this.vendors.filter(item => item.status === 'Active');
            }
            const result = this.vendors.filter(item => this.checkForLanguages(item));
            return result;
        },
        isTimeDouble() {
            return this.nextSendTime.length === 2;
        },
        isVendorApproved() {
            const statuses= ["Request Sent", "Created", "Rejected"]
            return this.step.vendor && statuses.indexOf(this.step.status) === -1;
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
