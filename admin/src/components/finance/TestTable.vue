<template lang="pug">
.duo-wrap
  .filters
    .filters__item
      label Source Language
      LanguagesSelect(:selectedLang="sourceSelect" :addAll="true" @chosenLang="setSourceFilter")
    .filters__item
      label Target Language
      LanguagesSelect(:selectedLang="targetSelect" :addAll="true" @chosenLang="setTargetFilter")
    .filters__item
      label Industry
      IndustrySelect(:selectedInd="industryFilter" :filteredIndustries="filterIndustry" @chosenInd="setIndustryFilter")
    .filters__item
      label Service
      ServiceSingleSelect(:selectedServ="serviceSelect[0]" langForm="Duo" @chosenServ="setServiceFilter")
  .add-button
    input(type="button" @click="addSevLangs" value="Add several languages")
  .table-data
    table.duo-finance(:style="{width: tableWidth}")
      thead
        tr
          th(v-for="head in tableHeader")
            .table__head-title {{ head.title }}
      tbody.duo-tbody
        template(v-for="(info, index) in fullInfo" v-if="isSourceFilter(info) && isTargetFilter(info)")
          tr(v-if="isIndustryFilter(info) && isAllRatesZero(info) && isCurrentServiceRateZero(info)")
            td.drop-option 
              template(v-if='currentActive !== index && isSourceFilter(info)') {{ info.sourceLanguage.lang }}
              .inner-component(v-if="currentActive === index")
                LanguagesSelect(:parentIndex="index" :addAll="false" :selectedLang="[currentSource.symbol]" @chosenLang="changeSource" @scrollDrop="scrollDrop")
            td.drop-option 
              template(v-if='currentActive !== index && isSourceFilter(info) || targetSelect[0] == "All"') {{ info.targetLanguage.lang }}
              .inner-component(v-if="currentActive === index")
                LanguagesSelect(:parentIndex="index" :addAll="false" :selectedLang="[currentTarget.symbol]" @chosenLang="changeTarget" @scrollDrop="scrollDrop")
            td.drop-option              
              span(v-if="!info.industry.icon && currentActive !== index") {{ info.industry.name }}
              .drop-option__image
                img(v-if="info.industry.icon && currentActive !== index" :src="info.industry.icon")
                span.title-tooltip {{ info.industry.name }}
              .inner-component(v-if="currentActive === index")
                IndustrySelect(:parentIndex="index" :selectedInd="industrySelected" :filteredIndustries="infoIndustries" @chosenInd="changeIndustry" @scrollDrop="scrollDrop")
            template(v-for="(service, servKey) in info.industry.rates")
                td(v-if="servicesIds.indexOf(servKey) !== -1" :class="{'add-shadow': currentActive === index}")
                    .rates-column
                        input.rates(:value="service.value" @input="(e) => changeRate(e, servKey)" :readonly="currentActive !== index")
                        Toggler(:isActive="service.active" @toggle="toggleActive(index, servKey)" :isDisabled="currentActive !== index")
            td.icons-field
              template(v-for="(icon, key) in icons")
                img.crud-icon(:src="icon.image" @click="action(index, key)" :class="{'active-icon': isActive(key, index)}") 
  .add-row
    .add-row__plus(@click="addNewRow")
      span +
  .unique-message(v-if="notUnique")
    .message
      p The combination you want to add already exists!
      .message__info-list
        li Source: 
          span.info-item {{ uniqueComb.source }}
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
        li(v-for="error in validError")
          span.info-item {{ error }}
      span.close(@click="closeErrorMessage") +
</template>

<script>
import LanguagesSelect from "../LanguagesSelect";
import Toggler from "../Toggler";
import IndustrySelect from "../IndustrySelect";
import ServiceSingleSelect from "../ServiceSingleSelect";
import { mapGetters, mapActions } from "vuex";

export default {
    props: {
        // services: {
        //   type: Array,
        //   default: []
        // }
    },
    data() {
        return {
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
            changedRate: '',
            currentSource: {},
            currentTarget: {},
            currentActive: -1,
            notUnique: false,
            editing: false,
            uniqueComb: {source: "", target: ""},
            showValidError: false,
            validError: [],
            isIndustryActive: true,
            icons: {
                save: {image: require("../../assets/images/Other/save-icon-qa-form.png"), active: true}, 
                edit: {image: require("../../assets/images/Other/edit-icon-qa.png"), active: false}, 
                delete: {image: require("../../assets/images/Other/delete-icon-qa-form.png"), active: true}
            }
        }
    },
    methods: {
        isActive(key, index) {
            if(this.currentActive === index) {
                return key === "save" || key === "delete";
            }
            if(this.currentActive !== index) {
                return key === "edit" || key === "delete";
            }
        },
        isAllRatesZero(info) {
            const { rates } = info.industry;
            return Object.keys(rates).reduce((init, cur) => {
                return init + rates[cur].value;
            }, 0)
        },
        isCurrentServiceRateZero(info) {
            for(let key in info.industry.rates) {
                if(this.servicesIds.indexOf(key) !== -1 && info.industry.rates[key].value) {
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
            return (this.filterIndustry.indexOf(info.industry.name) !== -1 || this.industryFilter[0].name === 'All');
        },
        addSevLangs() {
        //   this.storeServiceWhenAddSeveral(this.serviceSelect.title);
            this.$emit('addSevLangs', this.fullInfo);
        },
        closeErrorMessage() {
            this.showValidError = false;
        },
        closeUnique() {
            this.notUnique = false;
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
        handleScroll() {
            let element = document.querySelector('.duo-tbody');
            element.scrollTop = element.scrollHeight;
        },
        scrollDrop(data) {
            if(data.drop) {
                let tbody = document.querySelector('.duo-tbody');
                setTimeout(() => {
                const offsetBottom = data.offsetTop + data.offsetHeight*2;
                const scrollBottom = tbody.scrollTop + tbody.offsetHeight;
                if (offsetBottom > scrollBottom) {
                    tbody.scrollTop = offsetBottom + data.offsetHeight*2 - tbody.offsetHeight;
                }
                }, 100)
            }
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
                let hasIndustry = false;
                for(let ind in this.industrySelected) {
                if(this.industrySelected[ind].name == industry.name) {
                    this.industrySelected.splice(ind, 1);
                    hasIndustry = true;
                }
                }
                if(!hasIndustry) {
                this.industrySelected.push(industry);
                }
            }
            if(!this.industrySelected.length || industry.name == 'All') {
                this.industrySelected = [];
                this.industrySelected.push({
                crud: true,
                name: 'All',
                rate: 0.1
                })
            }
        },
        setServiceFilter(data) {
            const index = this.serviceSelect.findIndex(item => item._id === data._id);
            if(index !== -1) {
                this.serviceSelect.splice(index, 1);
            } else {
                this.serviceSelect.push(data);
            }
            if(!this.serviceSelect.length) {
                this.defaultService();
            }
            this.serviceSelect.sort((a, b) => {return a.sortIndex - b.sortIndex});
        },
        setSourceFilter(data) {
            if(this.sourceSelect[0] == 'All') {
                this.sourceSelect = [];
                this.sourceSelect.push(data.lang.symbol)
            } else {
                let index = this.sourceSelect.indexOf(data.lang.symbol);
                if(index != -1) {
                    this.sourceSelect.splice(index, 1);
                } else {
                    this.sourceSelect.push(data.lang.symbol)
                }
            }
            if(data.lang.lang == 'All' || !this.sourceSelect.length) {
                this.sourceSelect = ['All'];
            }
        },
        setTargetFilter(data) {
            if(this.targetSelect[0] == 'All') {
                this.targetSelect = [];
                this.targetSelect.push(data.lang.symbol)
            } else {
                let index = this.targetSelect.indexOf(data.lang.symbol);
                if(index != -1) {
                    this.targetSelect.splice(index, 1);
                } else {
                    this.targetSelect.push(data.lang.symbol)
                }
            }
            if(data.lang.lang == 'All' || !this.targetSelect.length) {
                this.targetSelect = ['All'];
            }
        },
        setIndustryFilter(data) {
            if(this.industryFilter[0].name == 'All') {
                this.industryFilter.splice(0, 1, data.industry);
            } else {
                let hasIndustry = false;
                for(let i in this.industryFilter) {
                if(this.industryFilter[i].name == data.industry.name) {
                    this.industryFilter.splice(i, 1);
                    hasIndustry = true;
                }
                }
                if(!hasIndustry) {
                this.industryFilter.push(data.industry);
                }
            }
            if(!this.industryFilter.length || data.industry.name == 'All') {
                this.industryFilter = [];
                this.industryFilter.push({
                name: 'All'
                })
            }
        },
        async action(index, key) {
            if(this.currentActive !== -1) {
                if(index !== this.currentActive) {
                return this.editing = true;
                }
            }
            if(key === 'save') {
                if(this.currentActive !== index) {
                return
                }
                return await this.checkErrors(index);
            }

            if(key === 'edit') {
                this.currentSource = this.fullInfo[index].sourceLanguage;
                this.currentTarget = this.fullInfo[index].targetLanguage;
                return this.editRate(index);
            }

            if(key === 'delete') {
                return this.deleteRate(index);
            }
        },
        checkRatesValidation() {
            const rateRegex = /^\d{0,2}(\.\d{0,4})?/;
            for(let elem of this.changedRate) {
                if(!rateRegex.test(elem.value)) {
                    return false;
                }
            }
            return true;
        },
        async checkErrors(index) {
            this.validError = [];
            if(!this.currentSource) this.validError.push("Please, choose the source language!");
            if(!this.currentTarget) this.validError.push("Please, choose the target language!");
            if(!this.checkRatesValidation) this.validError.push("Please set the correct rate values!");
            if(this.validError.length) {
            this.showValidError = true;
            this.changedRate = this.fullInfo[index].industry[0].rates;
            return true;
            }
            await this.saveRates(index);
        },
        uniqueCheck(index) {
            let exist = false;
            for(let ind in this.fullInfo) {
                if(ind !== index && !this.fullInfo[ind].id) {
                if(this.currentSource.lang == this.fullInfo[ind].sourceLanguage.lang &&
                    this.currentTarget.lang == this.fullInfo[ind].targetLanguage.lang) {
                    exist = true;
                    this.uniqueComb = {
                        source: this.currentSource.lang,
                        target: this.currentTarget.lang
                    }
                    break;
                    }
                }
                if(exist) break;
            }
            return exist;     
        },
        async saveRates(index) {
            if(!this.uniqueCheck(index)) {
                let info = {
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
                    await this.$http.post('/service/rates', { info });
                    await this.getDuoCombinations();
                    this.alertToggle({message: 'The rate has been saved.', isShow: true, type: 'success'});
                } catch(err) {
                    this.alertToggle({message: 'Internal serer error. Cannot save the rate.', isShow: true, type: 'error'});
                }
                this.currentActive = -1;
            } else {
                this.notUnique = true;
            }
        },
        editRate(index) {
            this.currentActive = index;
            this.industrySelected = [this.fullInfo[index].industry];
            this.changedRate = this.fullInfo[index].industry.rates;  
        },
        async deleteRate(index) {
            const industries = this.currentActive === index ? this.industrySelected : [this.fullInfo[index].industry];
            try {
                const deletedRate = {
                    servicesIds: this.servicesIds,
                    industries
                }
                await this.deleteServiceRate({ id: this.fullInfo[index].id, deletedRate });
                await this.getDuoCombinations();
                this.alertToggle({message: 'The rate has been deleted.', isShow: true, type: 'success'});
            } catch(err) {
                this.alertToggle({message: 'Internal serer error. Cannot delete the rate.', isShow: true, type: 'error'});
            }
                this.currentActive = -1;
        },
        async addNewRow() {
            this.sourceSelect = ["All"];
            this.targetSelect = ["All"];
            this.industryFilter = [{name: "All"}];
            this.changedRate = await {...this.defaultRates()};
            this.fullInfo.push({
                sourceLanguage: "", 
                targetLanguage: "", 
                industry: {name: "All", rates: this.changedRate},
            });
            this.currentActive = this.fullInfo.length-1;
            setTimeout(() => {
                this.handleScroll();
            }, 0)
        },
        async getAllCombinations() {
            try {
                await this.getDuoCombinations();
            } catch(err) {
                this.alertToggle({message: 'Internal server error. Cannot get rates.', isShow: true, type: 'error'});
            }
        },
        defaultService() {
            let defaultServ = this.vuexServices.find(item => {
                return item.symbol === 'tr';
            });
            this.serviceSelect = [defaultServ];
        },
        defaultRates() {
            const duoServices = this.vuexServices.filter(item => item.languageForm === "Duo");
            const serviceSelectIds = this.serviceSelect.map(item => item._id);
            return duoServices.reduce((init, cur) => {
                let rate = serviceSelectIds.indexOf(cur._id) !== -1 ? 0.01 : 0;
                const key = cur._id;
                init[key] = {value: rate, active: true};
                return {...init}
            }, {});
        },
        ...mapActions({
            alertToggle: "alertToggle",
            getDuoCombinations: "getDuoCombinations",
            storeDuoRates: "storeDuoRates",
            storeServiceWhenAddSeveral: "storeServiceWhenAddSeveral",
            deleteServiceRate: "deleteServiceRate"
        })
    },
    computed: {
        ...mapGetters({
            vuexServices: "getVuexServices",
            fullInfo: "getDuoRates"
        }),
        servicesIds() {
            return this.serviceSelect.map(item => item._id);
        },
        filterIndustry() {
            let result = [];
            if(this.industryFilter.length) {
                for(let elem of this.industryFilter) {
                result.push(elem.name)
                }
            }
            return result;
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
        }
    },
    components: {
        LanguagesSelect,
        IndustrySelect,
        ServiceSingleSelect,
        Toggler
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
.duo-wrap {
    position: relative;
    font-family: MyriadPro;
    min-width: 872px; 
}
.table-data {
    max-width: 872px;
    overflow-x: scroll;
}
.duo-finance {
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
    &:first-child, &:nth-of-type(2) {
        width: 175px;
    }
    &:last-child {
        width: 145px;
    }
    &:nth-of-type(3) {
        width: 195px;
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
.icons-field{
    text-align: center;
}
.crud-icon {
    margin: 0 5px;
    opacity: .5;
    cursor: pointer;
}
.active-icon {
    opacity: 1;
}
.filters {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    &__item {
        width: 23%;
        display: flex;
        flex-direction: column;
        label {
            font-size: 12px;
            margin-bottom: 0;
        }
    }
}
.rates-column {
    width: 100%;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-right: 5px;
}
.add-button {
    width: 100%;
    text-align: right;
    margin-bottom: 15px;
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
.add-row {
    margin-top: 10px;
    margin-left: 25px; 
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
.rates {
    border: none;
    outline: none;
    width: 50px;
}
.drop-option {
    position: relative;
    .inner-component {
        position: absolute;
        background-color: #fff;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        z-index: 5;
    }
    &__image {
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
