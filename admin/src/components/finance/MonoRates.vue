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
            @setTargetFilter="setTargetFilter"
            @setIndustryFilter="setIndustryFilter"
            @setPackageFilter="setPackageFilter"
            @setStepsFilter="setStepsFilter"
        )
    .mono-rates__action
        .mono-rates__drop-menu
            SelectSingle(v-if="isAnyChecked" :options="actions" :selectedOption="selectedAction" placeholder="Select action" @chooseOption="setAction")
        .mono-rates__button
            Button(value="Import rates")
    MonoTable(
        :industries="industries"
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
    .unique-message(v-if="isNotUnique")
        .message
            p The combination you want to add already exists!
            .message__info-list
                li Target: 
                    span.info-item {{ uniqueComb.target }}
                li Package: 
                    span.info-item {{ uniqueComb.packageSize }}
            span.close(@click="closeUnique") +
    .edition-message(v-if="isEditing")
        .message
            p Please finish the current edition first!
            span.close(@click="closeEditionMessage") +
    .error-message(v-if="showValidError")
        .message
            p Please finish the current edition first!
            .message__info-list
                li(v-for="error in validErrors")
                    span.info-item {{ error }}
            span.close(@click="closeErrorMessage") +
</template>

<script>
import ClickOutside from "vue-click-outside";
import RatesFilters from "./RatesFilters";
import MonoTable from "./ratesTables/MonoTable";
import SelectSingle from "../SelectSingle";
import ApproveModal from "../ApproveModal";
import Button from "../Button";
import { mapGetters, mapActions } from "vuex";

export default {
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
            heads: [
                { title: "Language" },
                { title: "Package" },
                { title: "Industry" },
                { title: "" }
            ],
            actions: ["Delete"],
            selectedAction: "",
            isNotUnique: false,
            isEditing: false,
            uniqueComb: {source: "", packageSize: ""},
            showValidError: false,
            validErrors: []
        }
    },
    methods: {
        setAction({option}) {
            this.selectedAction = option;
        },
        closeModal() {
            this.selectedAction = "";
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
        async deleteRate(info) {
            const deletedRate = {
                stepsIds: this.stepsIds,
                industries: [info.industry],
                languageForm: "Mono"
            }
            try {
                await this.deleteCheckedRate({ id: info.id, priceId: this.currentPrice._id, deletedRate });
            } catch(err) {
                this.alertToggle({message: 'Internal serer error. Cannot delete rates.', isShow: true, type: 'error'});
            }
        },
        closeErrorMessage() {
            this.showValidError = false;
        },
        closeUnique() {
            this.isNotUnique = false;
        },
        closeEditionMessage() {
            this.isEditing = false
        },
        changeRate(e, servKey) {
            this.changedRate[servKey].value = +event.target.value
        },
        toggleActive(index, key) {
            this.changedRate[key].active = !this.changedRate[key].active;
        },
        setStepsFilter({option}) {        
            const index = this.selectedSteps.findIndex(item => {
                return item.title === option
            });
            if(index !== -1) {
                this.selectedSteps.splice(index, 1);
            } else {
                const step = this.vuexSteps.find(item => item.title === option);
                this.selectedSteps.push(step);
            }
            if(!this.selectedSteps.length) {
                return this.selectedSteps = [this.defaultStep];
            }
            this.selectedSteps.sort((a, b) => {
                if(a.title > b.title) return 1;
                if(a.title < b.title) return -1;
            });
        },
        setTargetFilter({lang}) {
            if(this.targetSelect[0] == 'All') {
                this.targetSelect = [];
                this.targetSelect.push(lang.symbol)
            } else {
                let index = this.targetSelect.indexOf(lang.symbol);
                if(index != -1) {
                    this.targetSelect.splice(index, 1);
                } else {
                    this.targetSelect.push(lang.symbol)
                }
            }
            if(lang.lang == 'All' || !this.targetSelect.length) {
                this.targetSelect = ['All'];
            }
        },
        setIndustryFilter({industry}) {
            if(this.industryFilter[0].name == 'All') {
                this.industryFilter.splice(0, 1, industry);
            } else {
                let hasIndustry = false;
                for(let i in this.industryFilter) {
                if(this.industryFilter[i].name == industry.name) {
                    this.industryFilter.splice(i, 1);
                    hasIndustry = true;
                }
                }
                if(!hasIndustry) {
                this.industryFilter.push(industry);
                }
            }
            if(!this.industryFilter.length || industry.name == 'All') {
                this.industryFilter = [];
                this.industryFilter.push({
                name: 'All'
                })
            }
        },
        setPackageFilter({option}) {
            const position = this.packageFilter.indexOf(option);
            this.packageFilter = this.packageFilter.filter(item => item !== 'All');
            if(position !== -1) {
                this.packageFilter.splice(position, 1);
            } else {
                this.packageFilter.push(option);
            }
            if(option === 'All' || !this.packageFilter.length) {
                return this.packageFilter = ['All']
            }
        },
        showEditingError() {
            this.isEditing = true;
        },
        showValidationErrors({validErrors}) {
            this.validErrors = [...validErrors];
            this.showValidError = true;
        },
        showNotUniqueWarning({source, target}) {
            this.uniqueComb = {source, target}; 
            this.isNotUnique = true;    
        },
        addNewRow() {
            this.targetSelect = ["All"];
            this.industryFilter = [{name: "All"}];
            this.fullInfo.push({
                target: {},
                packageSize: "",
                industries: [{name: "All"}],
                rates: {...this.defaultRates()},
            });
        },
        refreshRates() {
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
        ...mapActions({
            alertToggle: "alertToggle",
            getMonoCombinations: "getMonoCombinations",
            storeMonoRates: "storeMonoRates",
            deleteServiceRate: "deleteServiceRate",
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
        isAnyError() {
            return this.isEditing || this.isNotUnique || this.showValidError;
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
        Button
    },
    directives: {
        ClickOutside
    },
    created() {
        this.setDefaultStep();
        this.getIndustries();
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
