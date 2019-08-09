<template lang="pug">
.mono-rates
    .filters
        RatesFilters(
            form="Mono"
            :targetSelect="targetSelect"
            :selectedSteps="selectedSteps"
            :industryFilter="industryFilter"
            :packageFilter="packageFilter"
            :steps="filteredSteps"
            :packages="packages"
            @setTargetFilter="setTargetFilter"
            @setIndustryFilter="setIndustryFilter"
            @setPackageFilter="setPackageFilter"
            @setStepsFilter="setStepsFilter"
        )
    .mono-rates__action
        .mono-rates__drop-menu
            SelectSingle(v-if="isAnyChecked" :options="actions" :selectedOption="selectedAction" placeholder="Select action" @chooseOption="setAction")
        .mono-rates__button
            Button(value="Import rates" @clicked="showImportRates")
    MonoTable(
        :industries="industries"
        :packages="packages"
        :selectedSteps="selectedSteps"
        :fullInfo="fullInfo"
        @addNewRow="addNewRow"
        @refreshRates="refreshRates"
        )
    .mono-rates__approve-action(v-if="selectedAction" v-click-outside="closeModal")
        ApproveModal(
            text="Are you sure?"
            approveValue="Yes"
            notApproveValue="Cancel"
            @approve="approveAction"
            @notApprove="closeModal"
            @close="closeModal"
        )
    AddseveralMono(v-if="isImportRates" 
        :steps="filteredSteps"
        :isDuo="false"
        :packages="packages"
        @addSeveralRates="addSeveralRates"
        @closeSeveral="closeImportRates")
</template>

<script>
import ClickOutside from "vue-click-outside";
import RatesFilters from "./RatesFilters";
import MonoTable from "./ratesTables/MonoTable";
import SelectSingle from "../SelectSingle";
import ApproveModal from "../ApproveModal";
import Button from "../Button";
import AddseveralMono from "./AddseveralMono";
import { mapGetters, mapActions } from "vuex";
import ratesFilters from "@/mixins/ratesFilters";
import genericRates from "@/mixins/genericRates";

export default {
    mixins: [ratesFilters, genericRates],
    props: {
        
    },
    data() {
        return {
            defaultStepSymbol: "copywriting",
            rateForm: "monoRates",
            calcUnit: "Packages"
        }
    },
    methods: {
        addNewRow() {
            this.fullInfo.push({
                target: {},
                packageSize: "",
                industries: [{name: "All"}],
                rates: {...this.defaultRates()},
            });
        },
        async addSeveralRates({ratesData}) {
            try {
                await this.addSeveralMonoRates({ratesData});
                this.refreshRates();
                this.isImportRates = false;
            } catch(err) { }
        },
        ...mapActions({
            alertToggle: "alertToggle",
            addSeveralMonoRates: "addSeveralMonoRates",
            storePriceRates: "storePriceRates",
            deletePriceRates: "deletePriceRates",
            getSteps: "getSteps",
            setAllMonoStepsForRates: "setAllMonoStepsForRates"
        })
    },
    computed: {
        ...mapGetters({
            vuexSteps: "getVuexSteps",
            fullInfo: "getMonoRates",
            currentPrice: "getCurrentPrice"
        })
    },
    components: {
        RatesFilters,
        MonoTable,
        SelectSingle,
        ApproveModal,
        Button,
        AddseveralMono
    },
    directives: {
        ClickOutside
    },
    created() {
        this.getPackages();
    }
};
</script>

<style lang="scss" scoped>
.mono-rates {
    position: relative;
    font-family: MyriadPro;
    width: 972px;
    &__action {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 28px;
        width: 100%;
        margin-bottom: 15px;
    }
    &__drop-menu {
        position: relative;
        height: 28px;
        width: 20%;
    }
    &__approve-action {
        position: absolute;
        top: 30%;
        left: 50%;
        margin-left: -150px;
        background-color: #FFF;
        z-index: 30;
    }
}

.filters {
    margin-bottom: 20px;
    margin-top: 10px;
    padding-bottom: 20px;
    border-bottom: 1px solid #67573E;
}

.add-button {
    width: 100%;
    text-align: right;
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 1px solid #67573E;
    input {
        color: white;
        font-size: 14px;
        width: 180px;
        padding: 5px 10px;
        border-radius: 10px;
        -webkit-box-shadow: 0 3px 5px rgba(0,0,0,.4);
        box-shadow: 0 3px 5px rgba(0,0,0,.4);
        background-color: #D15F45;
        border: 1px solid #D15F45;
        cursor: pointer;
    }
}

</style>
