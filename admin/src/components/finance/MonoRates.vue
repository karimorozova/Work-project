<template lang="pug">
.mono-rates
    .filters
        RatesFilters(
            form="Mono"
            :targetSelect="targetSelect"
            :serviceSelect="serviceSelect"
            :industryFilter="industryFilter"
            @setTargetFilter="setTargetFilter"
            @setIndustryFilter="setIndustryFilter"
            @setServiceFilter="setServiceFilter"
        )
    .mono-rates__action(v-if="isAnyChecked")
        SelectSingle(:options="actions" :selectedOption="selectedAction" placeholder="Select action" @chooseOption="setAction")
    MonoRateTable(
        origin="global"
        :fullInfo="fullInfo"
        :targetSelect="targetSelect"
        :industryFilter="industryFilter"
        :filterIndustry="filterIndustry"
        :serviceSelect="serviceSelect"
        @showEditingError="showEditingError"
        @showValidationErrors="showValidationErrors"
        @showNotUniqueWarning="showNotUniqueWarning"
        @addNewRow="addNewRow"
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
            span.close(@click="closeUnique") +
    .edition-message(v-if="editing")
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
import MonoRateTable from "./MonoRateTable";
import SelectSingle from "../SelectSingle";
import ApproveModal from "../ApproveModal";
import LanguagesSelect from "../LanguagesSelect";
import Toggler from "../Toggler";
import IndustrySelect from "../IndustrySelect";
import { mapGetters, mapActions } from "vuex";

export default {
    props: {
        
    },
    data() {
        return {
            isAllChecked: false,
            targetSelect: ["All"],
            industryFilter: [{name: "All"}],
            industrySelected: [{name: 'All'}],
            serviceSelect: [{}],
            heads: [
                { title: "Language" },
                { title: "Package" },
                { title: "Industry" },
                { title: "" }
            ],
            actions: ["Delete"],
            selectedAction: "",
            isNotUnique: false,
            editing: false,
            uniqueComb: {source: "", target: ""},
            showValidError: false,
            validErrors: [],
            isIndustryActive: true,
            icons: {
                save: {image: require("../../assets/images/Other/save-icon-qa-form.png"), active: true}, 
                edit: {image: require("../../assets/images/Other/edit-icon-qa.png"), active: false},
                cancel: {image: require("../../assets/images/cancel_icon.jpg"), active: false},
                delete: {image: require("../../assets/images/Other/delete-icon-qa-form.png"), active: true}
            }
        }
    },
    methods: {
        setAction({option}) {
            this.selectedAction = option;
        },
        closeModal() {
            this.selectedAction = "";
        },
        approveAction() {
            console.log("Approve action");
            this.closeModal();
        },
        closeErrorMessage() {
            this.showValidError = false;
        },
        closeUnique() {
            this.isNotUnique = false;
        },
        closeEditionMessage() {
            this.editing = false
        },
        changeRate(e, servKey) {
            this.changedRate[servKey].value = +event.target.value
        },
        toggleActive(index, key) {
            this.changedRate[key].active = !this.changedRate[key].active;
        },
        setServiceFilter({service}) {
            const index = this.serviceSelect.findIndex(item => item._id === service._id);
            if(index !== -1) {
                this.serviceSelect.splice(index, 1);
            } else {
                this.serviceSelect.push(service);
            }
            if(!this.serviceSelect.length) {
                this.defaultService();
            }
            this.serviceSelect.sort((a, b) => {return a.sortIndex - b.sortIndex});
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
        showEditingError() {
            this.editing = true;
        },
        showValidationErrors({validErrors}) {
            this.validErrors = [...validErrors];
            this.showValidError = true;
        },
        showNotUniqueWarning({source, target}) {
            this.uniqueComb = {source, target}; 
            this.isNotUnique = true;    
        },
        setDefaultValues() {
            this.currentActive = -1;
            this.industrySelected = [{name: 'All'}];
            this.currentTarget = {};
        },
        addNewRow() {
            this.targetSelect = ["All"];
            this.industryFilter = [{name: "All"}];
            this.fullInfo.push({
                targetLanguage: "", 
                industry: {name: "All", rates: {...this.defaultRates()}},
            });
        },
        async getAllCombinations() {
            try {
                await this.getMonoCombinations();
            } catch(err) {
                this.alertToggle({message: 'Internal server error. Cannot get rates.', isShow: true, type: 'error'});
            }
        },
        defaultService() {
            let defaultServ = this.vuexServices.find(item => {
                return item.symbol === 'co';
            });
            this.serviceSelect = [defaultServ];
        },
        defaultRates() {
            const duoServices = this.vuexServices.filter(item => item.languageForm === "Mono");
            return duoServices.reduce((init, cur) => {
                const key = cur._id;
                init[key] = {value: 0, package: 0, active: false};
                return {...init}
            }, {});
        },
        ...mapActions({
            alertToggle: "alertToggle",
            getMonoCombinations: "getMonoCombinations",
            storeMonoRates: "storeMonoRates",
            deleteServiceRate: "deleteServiceRate"
        })
    },
    computed: {
        ...mapGetters({
            vuexServices: "getVuexServices",
            fullInfo: "getMonoRates"
        }),
        servicesIds() {
            return this.serviceSelect.map(item => item._id);
        },
        infoIndustries() {
            let result = [];
            if(this.industrySelected.length) {
                for(let elem of this.industrySelected) {
                result.push(elem.name);
                }
            }
            return result;
        },
        tableHeader() {
            let result = [];
            for(let i = 0; i < 4; i++) {
                result.push(this.heads[i])
            }
            if(this.serviceSelect.length) {
                this.serviceSelect.sort((a, b) => { return a.sortIndex - b.sortIndex});
                result.splice(-1, 0, ...this.serviceSelect)
            }
            return result;
        },
        tableWidth() {
            let result = 870;
            let cols = this.tableHeader.length;
            if(cols > 5) {
                let count = cols - 5;
                result += 164*count;
            }
            result += 'px';
            return result;
        },
        isAnyChecked() {
            let result = false;
            for(let info of this.fullInfo) {
                if(info.check) {
                    result = true;
                    return result;
                }
            }
            return result;
        }
    },
    components: {
        RatesFilters,
        MonoRateTable,
        SelectSingle,
        ApproveModal,
        LanguagesSelect,
        IndustrySelect,
        Toggler
    },
    directives: {
        ClickOutside
    },
    created() {
        this.defaultService();
        this.getAllCombinations();
    },
    beforeDestroy() {
        this.storeMonoRates([]);
    }
};
</script>

<style lang="scss" scoped>
.mono-rates {
    position: relative;
    font-family: MyriadPro;
    width: 872px;
    &__action {
        position: relative;
        height: 28px;
        width: 20%;
        margin-bottom: 15px;
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
    border: 1px solid #D15F45;
    background-color: #FFF;
    box-shadow: 0 0 15px #D15F45;
    width: 300px;
    top: 50%;
    left: 50%;
    margin-left: -150px;
    padding: 0 15px;
    z-index: 50;
    display: flex;
    align-items: center;
    .close {
        position: absolute;
        font-size: 24px;
        font-weight: 700;
        top: -2px;
        right: -9px;
        transform: rotate(45deg);
        cursor: pointer;
    }
    .message {
        position: relative;
        width: 100%;
        height: 100%;
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

.unique-message, .error-message {
    height: 150px;
    margin-top: -75px; 
}

.edition-message {
    height: 70px;
    margin-top: -35px;
}

</style>
