<template lang="pug">
.duo-rates
    .filters
        RatesFilters(
            :sourceSelect="sourceSelect"
            :targetSelect="targetSelect"
            :serviceSelect="serviceSelect"
            :industryFilter="industryFilter"
            @setSourceFilter="setSourceFilter"
            @setTargetFilter="setTargetFilter"
            @setIndustryFilter="setIndustryFilter"
            @setServiceFilter="setServiceFilter"
        )
    .add-button
        input(type="button" @click="addSevLangs" value="Add several languages")
    .duo-rates__action(v-if="isAnyChecked")
        SelectSingle(:options="actions" :selectedOption="selectedAction" placeholder="Select action" @chooseOption="setAction")
    DuoRateTable(
        origin="vendor"
        :entity="vendor"
        :fullInfo="fullInfo"
        :sourceSelect="sourceSelect"
        :targetSelect="targetSelect"
        :industryFilter="industryFilter"
        :filterIndustry="filterIndustry"
        :serviceSelect="serviceSelect"
        :isErrors="isAnyError"
        @showEditingError="showEditingError"
        @showValidationErrors="showValidationErrors"
        @showNotUniqueWarning="showNotUniqueWarning"
        @addNewRow="addNewRow"
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
    .unique-message(v-if="isNotUnique")
        .message
            p The combination you want to add already exists!
            .message__info-list
                li Source: 
                    span.info-item {{ uniqueComb.source }}
                li Target: 
                    span.info-item {{ uniqueComb.target }}
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
import RatesFilters from "../../finance/RatesFilters";
import DuoRateTable from "../../finance/DuoRateTable";
import SelectSingle from "../../SelectSingle";
import ApproveModal from "../../ApproveModal";
import { mapGetters, mapActions } from "vuex";

export default {
    props: {
        vendor: {
            type: Object
        },
        sevLangs: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            isAllChecked: false,
            sourceSelect: ["EN-GB"],
            targetSelect: ["All"],
            industryFilter: [{name: "All"}],
            industrySelected: [{name: 'All'}],
            serviceSelect: [{}],
            heads: [
                { title: "Source Language" },
                { title: "Target Language" },
                { title: "Industry" },
                { title: "" }
            ],
            actions: ["Delete"],
            selectedAction: "",
            isNotUnique: false,
            isEditing: false,
            uniqueComb: {source: "", target: ""},
            showValidError: false,
            validErrors: [],
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
            try {
                for(let info of this.fullInfo) {
                    if(info.check) {
                        await this.deleteRate(info);
                    } 
                }
                await this.getDuoCombinations();
                this.alertToggle({message: 'Rates deleted.', isShow: true, type: 'success'});
            } catch(err) {
                this.alertToggle({message: 'Internal serer error. Cannot delete rates.', isShow: true, type: 'error'});
            }
        },
        async deleteRate(info) {
            const deletedRate = {
                servicesIds: this.servicesIds,
                industries: [info.industry],
                languageForm: "Duo"
            }
            try {
                await this.deleteCheckedRate({ id: info.id, deletedRate });
            } catch(err) {
                this.alertToggle({message: 'Internal serer error. Cannot delete rates.', isShow: true, type: 'error'});
            }
        },
        addSevLangs() {
            this.$emit('addSevLangs', this.fullInfo);
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
        setSourceFilter({lang}) {
            if(this.sourceSelect[0] == 'All') {
                this.sourceSelect = [];
                this.sourceSelect.push(lang.symbol)
            } else {
                let index = this.sourceSelect.indexOf(lang.symbol);
                if(index != -1) {
                    this.sourceSelect.splice(index, 1);
                } else {
                    this.sourceSelect.push(lang.symbol)
                }
            }
            if(lang.lang == 'All' || !this.sourceSelect.length) {
                this.sourceSelect = ['All'];
            }
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
            this.sourceSelect = ["All"];
            this.targetSelect = ["All"];
            this.industryFilter = [{name: "All"}];
            this.fullInfo.push({
                sourceLanguage: "", 
                targetLanguage: "", 
                industry: {name: "All", rates: {...this.defaultRates()}},
            });
        },
        async getAllCombinations() {
            try {
                await this.getDuoCombinations();
            } catch(err) {
                this.alertToggle({message: 'Internal server error. Cannot get rates.', isShow: true, type: 'error'});
            }
        },
        defaultRates() {
            const duoServices = this.vuexServices.sort((a, b) => { 
                if(a.sortIndex < b.sortIndex) return -1; 
                if(a.sortIndex > b.sortIndex) return 1;
            }).filter(item => item.languageForm === "Duo");
            return duoServices.reduce((init, cur) => {
                const key = cur._id;
                init[key] = {value: 0, active: false};
                return {...init}
            }, {});
        },
        async defaultService() {
            try {
                if(!this.vuexServices.length) {
                    await this.getServices();
                }
            } catch(err) { }
            let defaultServ = this.vuexServices.find(item => item.symbol === 'tr');
            this.serviceSelect = [defaultServ];
        },
        ...mapActions({
            alertToggle: "alertToggle",
            getDuoCombinations: "getVendorDuoCombinations",
            storeVendor: "storeVendor",
            storeDuoRates: "storeVendorDuoRates",
            deleteCheckedRate: "deleteVendorsCheckedRate",
            getServices: "getServices"
        })
    },
    computed: {
        ...mapGetters({
            vuexServices: "getVuexServices",
            fullInfo: "getVendorDuoCombs"
        }),
        servicesIds() {
            return this.serviceSelect.length ? this.serviceSelect.map(item => item._id) : [];
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
        },
        isAnyError() {
            return this.isEditing || this.isNotUnique || this.showValidError;
        }
    },
    components: {
        RatesFilters,
        DuoRateTable,
        SelectSingle,
        ApproveModal
    },
    directives: {
        ClickOutside
    },
    created() {
        this.defaultService();
        this.getAllCombinations();
    },
    beforeDestroy() {
        this.storeDuoRates([]);
    }
};
</script>

<style lang="scss" scoped>
.duo-rates {
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
