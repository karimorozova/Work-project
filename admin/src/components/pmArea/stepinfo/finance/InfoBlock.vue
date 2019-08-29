<template lang="pug">
    .finance-info
        Tabs(:tabs="tabs" :selectedTab="selectedTab" @setTab="setTab")
        Details(:financeData="financeData" @save="checkRateChange")
        .finance-info__modal(v-if="isModal")
            ApproveModal(
                :text="'Do you want to save rate in ' + rateOwner + ' language combinations?'"
                approveValue="Yes"
                notApproveValue="No"
                @approve="approveAction"
                @notApprove="save"
                @close="save"
            )
</template>

<script>
import ValidationErrors from "../../../ValidationErrors";
import ApproveModal from "../../../ApproveModal";
import Tabs from "@/components/Tabs";
import LabelVal from "@/components/LabelVal";
import Details from "./Details";
import { mapActions } from "vuex";

export default {
    props: {
        step: {type: Object}
    },
    data() {
        return {
            tabs: ['Receivables', 'Payables'],
            selectedTab: "Receivables",
            icons: {
                save: {icon: require('../../../../assets/images/Other/save-icon-qa-form.png')},
                edit: {icon: require('../../../../assets/images/Other/edit-icon-qa.png')}
            },
            errors: [],
            areErrorsExist: false,
            isModal: false,
            changedData: ""
        }
    },
    methods: {
        ...mapActions({
            updateStepFinance: "updateStepFinance",
            updateClientRate: "updateClientRate",
            updateVendorRate: "updateVendorRate"
        }),
        setTab({index}) {
            this.selectedTab = this.tabs[index];
        },
        closeErrorsBlock() {
            this.areErrorsExist = false;
            this.errors = [];
        },
        async checkRateChange(data) {
            const { rate } = data;
            const { clientRate, vendorRate } = this.step;
            if(this.selectedTab === 'Receivables' && rate !== clientRate 
                || this.selectedTab === 'Payables' && rate !== vendorRate) {
                    this.isModal = true;
                    this.changedData = data;
            } else {
                await this.save();
            }

        },
        async approveAction() {
            await this.save();
            const {rateValue, minimum} = this.changedData;
            if(this.selectedTab === 'Receivables') {
                return await this.updateClientRate({step: this.step, rate: {...this.step.clientRate, value: +rateValue, min: +minimum}});
            }
            if(this.step.vendor) {
                return await this.updateVendorRate({step: this.step, rate: {...this.step.vendorRate, value: +rateValue, min: +minimum}});
            }
        },
        async save() {
            const { Price, Wordcount } = this.collectData(this.changedData);
            const rateProp = this.selectedTab === 'Receivables' ? 'clientRate' : 'vendorRate';
            const discountProp = this.selectedTab === 'Receivables' ? 'clientDiscount' : 'vendorDiscount';
            try {
                const changedStep = {
                    ...this.step,
                    finance: { Price, Wordcount },
                    [rateProp]: {value: +this.changedData.rateValue, min: +this.changedData.minimum},
                    [discountProp]: +this.changedData.discount
                }
                this.isModal = false;
                await this.updateStepFinance(changedStep);
            } catch(err) { }
        },
        collectData(data) {
            const { subtotal, quantityTotal, quantityRelative } = data;
            const Wordcount = {receivables: +quantityTotal, payables: +quantityRelative};
            let Price = Object.keys(this.step.finance.Price).reduce((prev, cur) => {
                prev[cur] = this.step.finance.Price[cur];
                return prev;
            }, {});
            this.selectedTab === "Receivables" ? Price.receivables = +subtotal : Price.payables = +subtotal;
            return { Price, Wordcount };
        }
    },
    computed: {
        financeData() {
            const stepRate = this.selectedTab === "Receivables" ? this.step.clientRate : this.step.vendorRate;
            const rateValue = stepRate ? stepRate.value : 0;
            const rateMin = stepRate ? stepRate.min : 0;
            const stepDiscount = this.selectedTab === "Receivables" ? this.step.clientDiscount : this.step.vendorDiscount;
            const subtotal = this.selectedTab === "Receivables" ? +this.step.finance.Price.receivables : +this.step.finance.Price.payables;
            return {
                rateValue,
                quantityRelative: +this.step.finance.Wordcount.payables,
                quantityTotal: +this.step.finance.Wordcount.receivables,
                subtotal,
                minimum: rateMin,
                discount: stepDiscount || 0
            }
        },
        rateOwner() {
            return this.selectedTab === "Receivables" ? "Client's" : "Vendor's";
        }
    },
    components: {
        ValidationErrors,
        ApproveModal,
        Tabs,
        Details
    }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors";

.finance-info {
    position: relative;
    &__modal {
        position: absolute;
        top: 50px;
        left: 30%;
    }
}

</style>
