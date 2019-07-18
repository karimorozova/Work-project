<template lang="pug">
.duorates-table(v-click-outside="outClick")
    .duorates-table__table-data
        table.duorates-table__duo-finance(:style="{width: tableWidth}")
            thead
                tr
                    th.duorates-table__check
                        input.duorates-table__check-input(type="checkbox" v-model="isAllChecked" @change="toggleAllCheck")
                    th(v-for="head in tableHeader")
                        .table__head-title {{ head.title }}
            tbody.duorates-table__tbody
                template(v-for="(info, index) in fullInfo" v-if="isSourceFilter(info) && isTargetFilter(info)")
                    tr(v-if="isIndustryFilter(info) && isCurrentServiceRateZero(info, index)")
                        td.duorates-table__check
                            input.duorates-table__check-input(type="checkbox" v-model="info.check")
                        td.duorates-table__drop-option 
                            template(v-if='currentActive !== index && isSourceFilter(info)') {{ info.sourceLanguage.lang }}
                            .inner-component(v-if="currentActive === index")
                                LanguagesSelect(:parentIndex="index" :addAll="false" :selectedLangs="[currentSource.symbol]" @chosenLang="changeSource" @scrollDrop="scrollDrop")
                        td.duorates-table__drop-option 
                            template(v-if='currentActive !== index && isSourceFilter(info) || targetSelect[0] == "All"') {{ info.targetLanguage.lang }}
                            .inner-component(v-if="currentActive === index")
                                LanguagesSelect(:parentIndex="index" :addAll="false" :selectedLangs="[currentTarget.symbol]" @chosenLang="changeTarget" @scrollDrop="scrollDrop")
                        td.duorates-table__drop-option              
                            span(v-if="!info.industry.icon && currentActive !== index") {{ info.industry.name }}
                            .duorates-table__image
                                img(v-if="info.industry.icon && currentActive !== index" :src="info.industry.icon")
                                span.title-tooltip {{ info.industry.name }}
                            .inner-component(v-if="currentActive === index")
                                IndustrySelect(:parentIndex="index" :who="entity" :selectedInd="industrySelected" :filteredIndustries="infoIndustries" @chosenInd="changeIndustry" @scrollDrop="scrollDrop")
                        template(v-for="(service, servKey) in info.industry.rates")
                            td(v-if="servIndex(servKey) !== -1")
                                .duorates-table__rates-column
                                    input.duorates-table__rates(v-if="!service.value" type="text" :value="zeroValue(index, servKey)"  @input="(e) => changeRate(e, servKey)" :readonly="currentActive !== index")
                                    input.duorates-table__rates(v-else type="text" :value="service.value"  @input="(e) => changeRate(e, servKey)" :readonly="currentActive !== index")
                                    Toggler(:isActive="service.active" @toggle="toggleActive(index, servKey)" :isDisabled="currentActive !== index" :class="{'duorates-table_transparent': currentActive !== index}")
                        td.duorates-table__icons-field
                            template(v-for="(icon, key) in icons")
                                img.duorates-table__crud-icon(:src="icon.image" @click="action(index, key)" :class="{'active-icon': isActive(key, index)}") 
    .add-row
        .add-row__plus(@click="addNewRow")
            span +
</template>

<script>
import ClickOutside from "vue-click-outside";
import LanguagesSelect from "../LanguagesSelect";
import Toggler from "../Toggler";
import IndustrySelect from "../IndustrySelect";
import scrollDrop from "@/mixins/scrollDrop";
import { mapGetters, mapActions } from "vuex";

export default {
    mixins: [scrollDrop],
    props: {
        entity: {
            type: Object
        },
        origin: {
            type: String
        },
        fullInfo: {
            type: Array
        },
        sourceSelect: {
            type: Array
        },
        targetSelect: {
            type: Array
        },
        industryFilter: {
            type: Array
        },
        filterIndustry: {
            type: Array
        },
        serviceSelect: {
            type: Array
        },
        isErrors: {
            type: Boolean
        }
    },
    data() {
        return {
            isAllChecked: false,
            industrySelected: [{name: 'All'}],
            heads: [
                { title: "Source Language" },
                { title: "Target Language" },
                { title: "Industry" },
                { title: "" }
            ],
            changedRate: '',
            currentSource: {},
            currentTarget: {},
            currentActive: -1,
            icons: {
                save: {image: require("../../assets/images/Other/save-icon-qa-form.png"), active: true}, 
                edit: {image: require("../../assets/images/Other/edit-icon-qa.png"), active: false},
                cancel: {image: require("../../assets/images/cancel_icon.jpg"), active: false},
                delete: {image: require("../../assets/images/Other/delete-icon-qa-form.png"), active: true}
            },
            bodyClass: '.duorates-table__tbody'
        }
    },
    methods: {
        servIndex(servKey) {
            return this.servicesIds.indexOf(servKey);
        },
        zeroValue(index, servKey) {
            if(this.currentActive !== index) {
                return "-"
            }
            return this.changedRate[servKey].value;
        },
        isActive(key, index) {
            if(this.currentActive === index) {
                return key !== "edit";
            }
            if(this.currentActive !== index) {
                return key === "edit" || key === "delete";
            }
        },
        isCurrentServiceRateZero(info, index) {
            for(let key in info.industry.rates) {
                if(this.servicesIds.indexOf(key) !== -1 && info.industry.rates[key].value) {
                    return true
                }
                if(!info.industry.rates[key].value && this.currentActive === index) {
                    return true
                }
            }
            return false;
        },
        isSourceFilter(info) {
            return (this.sourceSelect.indexOf(info.sourceLanguage.symbol) !== -1 || this.sourceSelect[0] === 'All');
        },
        isTargetFilter(info) {
            return (this.targetSelect.indexOf(info.targetLanguage.symbol) !== -1 || this.targetSelect[0] === 'All');
        },
        isIndustryFilter(info) {
            let industriesNames = this.industryFilter.map(item => item.name);
            return (industriesNames.indexOf(info.industry.name) !== -1 || this.industryFilter[0].name === 'All');
        },
        isAllFiters(info, index) {
            return this.isIndustryFilter(info) && this.isCurrentServiceRateZero(info, index)
                && this.isSourceFilter(info) && this.isTargetFilter(info) 
                && this.isIndustryFilter(info)
        },
        toggleAllCheck() {
            for(let index in this.fullInfo) {
                let info = this.fullInfo[index];
                if(this.isAllFiters(info, index)) {
                    this.fullInfo[index].check = this.isAllChecked;
                }
            }
        },
        uncheckAll() {
            this.isAllChecked = false;
            for(let info of this.fullInfo) {
                info.check = false;
            }
            if(this.currentActive !== -1 && !this.fullInfo[this.currentActive].id) {
                return
            }
            this.setDefaultValues();
        },
        outClick() {
            if(!this.isErrors) {
                this.setDefaultValues();
            }
        },
        changeRate(e, servKey) {
            const value = +event.target.value;
            this.changedRate[servKey].value = value;
        },
        toggleActive(index, key) {
            this.changedRate[key].active = !this.changedRate[key].active;
        },
        handleScroll() {
            let element = document.querySelector('.duorates-table__tbody');
            element.scrollTop = element.scrollHeight;
        },
        changeSource({lang, index}) {
            this.currentSource = lang;
        },
        changeTarget({lang, index}) {
            this.currentTarget = lang;
        },
        changeIndustry({industry}) {
            if(this.industrySelected[0].name == 'All') {
                this.industrySelected.splice(0, 1, industry)
            } else {
                 const index = this.industrySelected.findIndex(item => item._id === industry._id);
                if(index !== -1) {
                    this.industrySelected.splice(index, 1);
                } else {
                    this.industrySelected.push(industry);
                }
            }
            if(!this.industrySelected.length || industry.name === 'All') {
                this.industrySelected = [];
                this.industrySelected.push({name: 'All'})
            }
        },
        async action(index, key) {
            if(this.currentActive !== -1) {
                if(index !== this.currentActive) {
                    return this.$emit("showEditingError");
                }
            }
            if(key === 'save') {
                if(this.currentActive !== index) {
                return
                }
                return await this.checkErrors(index);
            }

            if(key === 'edit') {
                return this.editRate(index);
            }

            if(key === 'cancel') {
                return this.setDefaultValues();
            }

            if(key === 'delete') {
                return await this.deleteRate(index);
            }
        },
        isAllRatesZero() {
            return Object.keys(this.changedRate).filter(item => {
                return this.servicesIds.indexOf(item) !== -1
            }).reduce((init, cur) => {
                return init + this.changedRate[cur].value;
            }, 0);
        },
        checkRatesValidation() {
            const rateRegex = /^\d{0,2}(\.\d{0,4})?/;
            for(let key of Object.keys(this.changedRate)) {
                if(!rateRegex.test(this.changedRate[key].value)) {
                    return false;
                }
            }
            return this.isAllRatesZero();
        },
        async checkErrors(index) {
            let validErrors = [];
            if(!this.currentSource._id) validErrors.push("Please, choose the source language!");
            if(!this.currentTarget._id) validErrors.push("Please, choose the target language!");
            if(!this.checkRatesValidation()) validErrors.push("Please set the correct rate values!");
            if(validErrors.length) {
                this.$emit('showValidationErrors', { validErrors });
                this.changedRate = this.fullInfo[index].industry.rates;
                return validErrors.length;;
            }
            await this.saveRates(index);
        },
        uniqueCheck(index) {
            let isExist = false;
            for(let ind in this.fullInfo) {
                if(ind !== index && !this.fullInfo[index].id) {
                    if(this.currentSource._id === this.fullInfo[ind].sourceLanguage._id &&
                        this.currentTarget._id === this.fullInfo[ind].targetLanguage._id) {
                        isExist = true;
                        break;
                    }
                }
                if(isExist) break;
            }
            return isExist;     
        },
        async saveRates(index) {
            if(!this.uniqueCheck(index)) {
                let info = {
                    id: this.fullInfo[index].id,
                    sourceLanguage: this.currentSource,
                    targetLanguage: this.currentTarget,
                    industries: [],
                    languageForm: "Duo"
                };
                for(let elem of this.industrySelected) {
                    elem.rates = this.changedRate;
                    info.industries.push(elem)
                };
                try {
                    if(this.origin === "global") {
                        await this.saveGlobalRates(info);
                    }
                    if(this.origin === "client") {
                        await this.saveClientRates(info);
                    }
                    if(this.origin === "vendor") {
                        await this.saveVendorRates(info);
                        this.$emit('updateVendor');
                    }
                    this.alertToggle({message: 'The rate has been saved.', isShow: true, type: 'success'});
                } catch(err) {
                    this.alertToggle({message: 'Internal serer error. Cannot save the rate.', isShow: true, type: 'error'});
                }
                this.setDefaultValues();
            } else {
                this.$emit('showNotUniqueWarning', {source: this.currentSource.lang, target: this.currentTarget.lang});
            }
        },
        editRate(index) {
            this.currentActive = index;
            this.currentSource = this.fullInfo[index].sourceLanguage;
            this.currentTarget = this.fullInfo[index].targetLanguage;
            this.industrySelected = [this.fullInfo[index].industry];
            this.changedRate = {...this.fullInfo[index].industry.rates};
        },
        async deleteRate(index) {
            const industries = this.currentActive === index ? this.industrySelected : [this.fullInfo[index].industry];
            const id = this.fullInfo[index].id;
            if(!id) {
                return this.setDefaultValues();
            } else {
                try {
                    const deletedRate = {
                        servicesIds: this.servicesIds,
                        industries,
                        languageForm: "Duo"
                    }
                    if(this.origin === "global") {
                        await this.deleteServiceRate({ id, deletedRate });
                    }
                    if(this.origin === "client") {
                        await this.deleteClientRate({ id, deletedRate });
                    }
                    if(this.origin === "vendor") {
                        await this.deleteVendorRate({ id, deletedRate });
                    }
                    this.alertToggle({message: 'The rate has been deleted.', isShow: true, type: 'success'});
                } catch(err) {
                    this.alertToggle({message: 'Internal serer error. Cannot delete the rate.', isShow: true, type: 'error'});
                }
            }
            this.setDefaultValues();
        },
        setDefaultValues() {
            if(this.currentActive !== -1 && !this.fullInfo[this.currentActive].id) {
                this.fullInfo.splice(this.currentActive, 1);
            }
            this.currentActive = -1;
            this.industrySelected = [{name: 'All'}];
            this.currentSource = {};
            this.currentTarget = {};
            this.changedRate = "";
        },
        addNewRow() {
            if(this.currentActive !== -1) {
                return this.$emit("showEditingError");
            }
            this.$emit("addNewRow");
            this.editRate(this.fullInfo.length-1);
            setTimeout( () => {
                this.handleScroll();
            }, 0);
        },
        ...mapActions({
            alertToggle: "alertToggle",
            saveGlobalRates: "saveGlobalRates",
            saveClientRates: "saveClientRates",
            saveVendorRates: "saveVendorRates",
            deleteServiceRate: "deleteServiceRate",
            deleteClientRate: "deleteClientRate",
            deleteVendorRate: "deleteVendorRate",
        })
    },
    watch: {
        sourceSelect: function(val) { this.uncheckAll() },
        targetSelect: function(val) { this.uncheckAll() },
        industryFilter: function(val) { this.uncheckAll() },
        isNoChecked: function(val) {
            this.isAllChecked = !val;
        }
    },
    computed: {
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
        isNoChecked() {
            for(let index in this.fullInfo) {
                let info = this.fullInfo[index];
                if(this.isAllFiters(info, index) && !info.check) {
                    return true;
                }
            }
            return false;
        }
    },
    components: {
        LanguagesSelect,
        IndustrySelect,
        Toggler
    },
    directives: {
        ClickOutside
    }
};
</script>

<style lang="scss" scoped>

.duorates-table__table-data {
    max-width: 872px;
    overflow-x: auto;
}
.duorates-table__duo-finance {
    border-collapse: collapse;
    width: 868px;
    thead, tbody {
        border: 1px solid #BFB09D;
        display: block;
        width: 100%;
    }
    tbody {
    height: 184px;
        overflow-y: scroll;
        transition: all 0.3s;
    }
}
tr {
    display: block;
}
th, td {
    box-sizing: border-box;
    padding: 5px;
    padding-right: 0;
    font-size: 14px;
    font-weight: normal;
    white-space: nowrap;
    width: 164px;
    &:nth-of-type(2), &:nth-of-type(3) {
        width: 172px;
    }
    &:last-child {
        width: 145px;
    }
    &:nth-of-type(4) {
        width: 178px;
    }
}
th {
    background-color: #988C7E;
    color: white;
    border-right: 1px solid #FFF;
    &:last-child {
        border-right: none;
        width: 161px;
    }
}
td {
    border-right: 1px solid #BFB09D;
    border-bottom: 1px solid #BFB09D;
}
.duorates-table__check {
    width: 10px;
    padding: 5px 5px 0;
}
.duorates-table__check-input {
    cursor: pointer;
}
.duorates-table__icons-field{
    text-align: center;
}
.duorates-table__crud-icon {
    margin: 0 5px;
    opacity: .5;
    cursor: pointer;
}
.active-icon {
    opacity: 1;
}
.filters {
    margin-bottom: 20px;
}
.duorates-table__rates-column {
    width: 100%;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-right: 5px;
    .duorates-table_transparent {
        opacity: 0.5;
    }
}
.add-row {
    margin: 10px 0 10px 25px; 
    &__plus {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        border: 1px solid #BFB09D;
        span {
            font-size: 28px;
            color: #BFB09D;
            opacity: .7;
        }
    }
}
.duorates-table__rates {
    border: none;
    outline: none;
    width: 65%;
    color: #67573E;
}
.duorates-table__drop-option {
    position: relative;
    .inner-component {
        position: absolute;
        background-color: #fff;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        z-index: 3;
    }
    .duorates-table__image {
        max-height: 21px;
        width: 30px;
        .title-tooltip {
            position: absolute;
            display: none;
            color: #D15F45;
            font-size: 12px;
            top: 8px;
            left: 35px;
            white-space: normal
        }
        &:hover {
            .title-tooltip {
                display: block;
            }
        }
        img {
            max-width: 21px;
        }
    }
}
.add-shadow {
    box-shadow: inset 0 0 8px rgba(191, 176, 157, 1);
}

</style>
