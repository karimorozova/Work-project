<template lang="pug">
.duo-rates
    .filters
        RatesFilters(
            :sourceSelect="sourceSelect"
            :targetSelect="targetSelect"
            :selectedSteps="selectedSteps"
            :industryFilter="industryFilter"
            :steps="filteredSteps"
            @setSourceFilter="setSourceFilter"
            @setTargetFilter="setTargetFilter"
            @setIndustryFilter="setIndustryFilter"
            @setStepsFilter="setStepsFilter"
        )
    .duo-rates__action
        .duo-rates__drop-menu
            SelectSingle(v-if="isAnyChecked" :options="actions" :selectedOption="selectedAction" placeholder="Select action" @chooseOption="setAction")
        .duo-rates__button
            Button(value="Import rates" @clicked="showImportRates")
    DuoTable(
        :rateForm="rateForm"
        :defaultStepSymbol="defaultStepSymbol"
        :fullInfo="fullInfo"
        :industries="industries"
        :selectedSteps="selectedSteps"
        @addNewRow="addNewRow"
        @refreshRates="refreshRates"
    )
    .duo-rates__approve-action(v-if="selectedAction" v-click-outside="closeModal")
        ApproveModal(
            text="Are you sure?"
            approveValue="Yes"
            notApproveValue="Cancel"
            @approve="approveAction"
            @notApprove="closeModal"
            @close="closeModal"
        )
    Addseverallangs(v-if="isImportRates"
        :ratesName="rateForm"
        :steps="filteredSteps"
        :packages="packages"
        @addSeveralRates="addSeveralRates"
        @closeSeveral="closeImportRates")
</template>

<script>
import ClickOutside from "vue-click-outside";
import RatesFilters from "./RatesFilters";
import DuoTable from "./ratesTables/DuoTable";
import SelectSingle from "../SelectSingle";
import Button from "../Button";
import Addseverallangs from "./Addseverallangs";
import ApproveModal from "../ApproveModal";
import ratesFilters from "@/mixins/ratesFilters";
import genericRates from "@/mixins/genericRates";
import { mapGetters, mapActions } from "vuex";

export default {
    mixins: [ratesFilters, genericRates],
    data() {
        return {
            defaultStepSymbol: "translation",
            rateForm: "wordsRates",
            calcUnit: "Words"
        }
    },
    methods: {
        addNewRow() {
            this.fullInfo.push({
                source: {}, 
                target: {}, 
                industries: [{name: "All"}],
                rates: {...this.defaultRates()},
            });
        },
        ...mapActions([
            "alertToggle",
            "storePriceRates",
            "sortRates",
            "deletePriceRates",
            "getSteps",
            "setAllStepsForRates",
            "importRatesToPrice"
        ])
    },
    computed: {
        ...mapGetters({
            vuexSteps: "getVuexSteps",
            fullInfo: "getWordsRates",
            currentPrice: "getCurrentPrice"
        })
    },
    components: {
        RatesFilters,
        DuoTable,
        SelectSingle,
        ApproveModal,
        Button,
        Addseverallangs
    },
    directives: {
        ClickOutside
    }
};
</script>

<style lang="scss" scoped>
.duo-rates {
    font-family: Myriad400;
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
