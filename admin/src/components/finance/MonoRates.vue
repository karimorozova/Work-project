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

export default {
    mixins: [ratesFilters],
    props: {
        
    },
    data() {
        return {
            isAllChecked: false,
            targetSelect: ["All"],
            packageFilter: ["All"],
            industryFilter: [{name: "All"}],
            industrySelected: [{name: 'All'}],
            selectedSteps: [{}],
            defaultStep: {},
            industries: [],
            packages: [],
            actions: ["Delete"],
            selectedAction: "",
            isImportRates: false
        }
    },
    methods: {
        setAction({option}) {
            this.selectedAction = option;
        },
        closeModal() {
            this.selectedAction = "";
        },
        showImportRates() {
            this.isImportRates = true;
        },
        closeImportRates() {
            this.isImportRates = false;
        },
        async approveAction() {
            if(this.selectedAction === "Delete") {
                try {
                    await this.deleteChecked();
                } catch(err) {
                    this.alertToggle({message: 'Internal serer error. Cannot delete rates.', isShow: true, type: 'error'});
                }
            }
            this.closeModal();
        },
        async deleteChecked() {
            const checked = this.fullInfo.filter(item => item.isChecked);
            if(!checked.length) return;
            const checkedIds = checked.map(item => item._id);
            try {
                await this.deletePriceRates({checkedIds, prop: 'monoRates'});
                this.refreshRates();
            } catch(err) {
                this.alertToggle({message: 'Internal server error. Cannot delete rates.', isShow: true, type: 'error'});
            }
        },
        setStepsFilter({option}) {        
            const index = this.selectedSteps.findIndex(item => item.title === option);
            const step = this.vuexSteps.find(item => item.title === option);
            this.changeFilter({index, mainProp: 'selectedSteps', option: step});
            if(!this.selectedSteps.length) {
                return this.selectedSteps = [this.defaultStep];
            }
            this.selectedSteps.sort((a, b) => {
                if(a.title > b.title) return 1;
                if(a.title < b.title) return -1;
            });
        },
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
        refreshRates() {
            this.targetSelect = ["All"];
            this.packageFilter = ["All"];
            this.industryFilter = [{name: "All"}];
            this.storeMonoRates(this.currentPrice.monoRates);
            this.setAllSteps();
        },
        async setDefaultStep() {
            try {
                if(!this.vuexSteps.length) {
                    await this.getSteps();
                }
            } catch(err) { }
            this.defaultStep = this.vuexSteps.find(item => {
                return item.symbol === 'copywriting';
            });
            this.selectedSteps = [this.defaultStep];
            this.setAllSteps();
        },
        setAllSteps() {
            const stepIds = this.vuexSteps.filter(item => item.calculationUnit === "Packages").map(item => item._id);
            this.setAllMonoStepsForRates(stepIds);
        },
        defaultRates() {
            const packageSteps = this.vuexSteps.filter(item => item.calculationUnit === "Packages");
            return packageSteps.reduce((prev, cur) => {
                prev[cur._id] = {value: 0, min: 5, active: false};
                return {...prev}
            }, {});
        },
        async getIndustries() {
            try {
                const result = await this.$http.get("/api/industries");
                this.industries = result.body.map(item => item._id).sort();
            } catch(err) {
                this.alertToggle({message: "Erorr on getting Industries", isShow: true, type: "error"});    
            }
        },
        async getPackages() {
            try {
                const result = await this.$http.get("/api/packages");
                this.packages = result.body.map(item => item.size);
                this.packages.unshift("All");
            } catch(err) {

            }
        },
        ...mapActions({
            alertToggle: "alertToggle",
            addSeveralMonoRates: "addSeveralMonoRates",
            storeMonoRates: "storeMonoRates",
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
        }),
        stepsIds() {
            return this.selectedSteps.map(item => item._id);
        },
        isAnyChecked() {
            return this.fullInfo.find(item => item.isChecked);
        },
        filteredSteps() {
            return this.vuexSteps.filter(item => item.calculationUnit === 'Packages').map(item => item.title);
        }
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
        this.setDefaultStep();
        this.getIndustries();
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

.unique-message, .edition-message, .error-message {
    position: absolute;
    background-color: transparent;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    padding: 0 15px;
    z-index: 50;
    display: flex;
    justify-content: center;
    align-items: center;
    .close {
        position: absolute;
        font-size: 24px;
        font-weight: 700;
        top: 0;
        right: 7px;
        transform: rotate(45deg);
        cursor: pointer;
    }
    .message {
        position: relative;
        width: 40%;
        padding: 10px 20px;
        border: 1px solid #D15F45;
        box-shadow: 0 0 15px #D15F45;
        background-color: #FFF;
        &__info-list {
            li {
                list-style: none;
                .info-item {
                    color: #D15F45;
                    font-weight: 500;
                    font-size: 16px;
                }
            }
        }
    }
    p {
        font-size: 18px;
        font-weight: 700;
    }
}

</style>
