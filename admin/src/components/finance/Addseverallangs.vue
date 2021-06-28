<template lang="pug">
.add-several
    .add-several__main
        .add-several__close
            span.add-several__close-icon(@click="closeSeveral") +
        .add-several__prices
            span.add-several__title.add-several_width-22 Pricelist
            .add-several_width-78
                .add-several__drop-menu
                    SelectSingle(placeholder="Select" :options="pricelists" :selectedOption="selectedPrice.name" @chooseOption="setPrice")
        LangsManage(
            title="Source languages"
            :all="source.all" 
            :chosen="source.chosen" 
            @toChosen="(e) => toChosen(e, 'source')" 
            @toAll="(e) => toAll(e, 'source')"
            @forceMoveTo="(e) => forceMoveTo(e, 'source')"
            @forceMoveBack="(e) => forceMoveBack(e, 'source')"
            @sortBySearch="(e) => sortBySearch(e, 'source')"
            @sortLangs="(e) => sortLangs(e, 'source')")
        LangsManage(
            title="Target languages"
            :all="target.all" 
            :chosen="target.chosen" 
            @toChosen="(e) => toChosen(e, 'target')" 
            @toAll="(e) => toAll(e, 'target')"
            @forceMoveTo="(e) => forceMoveTo(e, 'target')"
            @forceMoveBack="(e) => forceMoveBack(e, 'target')"
            @sortBySearch="(e) => sortBySearch(e, 'target')"
            @sortLangs="(e) => sortLangs(e, 'target')")
        .add-several__service-industry
            span.add-several__title.add-several_width-22 Steps
            .add-several_width-78
                .add-several__select-block
                    .add-several__drop-menu
                        SelectMulti(:options="steps" :selectedOptions="selectedStepsTitles" @chooseOptions="setSteps" placeholder="Select" :allOptionsButtons="true")
                .add-several__select-block
                    span.add-several__title Industries
                    .add-several__drop-menu
                        IndustrySelect(:selectedInd="selectedInd" :filteredIndustries="checkedIndustries" @chosenInd="setIndustry" :entity="entity")
        .add-several__submit
            input.add-several__button(type="button" @click="checkErrors" value="Submit")
    ValidationErrors(v-if="areErrors" isAbsolute :errors="errors" @closeErrors="closeErrors")
</template>

<script>
import SelectMulti from "../SelectMulti";
import IndustrySelect from "../IndustrySelect";
import SelectSingle from "../SelectSingle";
import LangsManage from "./langs/LangsManage";
import ValidationErrors from "../ValidationErrors";
import { mapGetters, mapActions } from "vuex";

export default {
    props: {
        entity: {
            type: Object
        },
        isAvailablePairs: {
            type: Boolean
        },
        steps: {
            type: Array,
            default: () => []
        },
        ratesName: { type: String }
    },
    data() {
        return {
            languages: [],
            source: {
                all: [], chosen: []
            },
            target: {
                all: [], chosen: []
            },
            selectedInd: [],
            selectedSteps: [],
            areErrors: false,
            errors: [],
            selectedPrice: {name: ""}
        }
    },
    methods: {
        ...mapActions({
            alertToggle: "alertToggle",
            storePricelists: "storePricelists"
        }),
        sortBySearch({value, prop }, mainProp) {
            if(!value) return this.sortLangArray(this[mainProp][prop]);
            const val = value.toLowerCase();
            for(let index in this[mainProp][prop]) {
                const n = val.length;
                if(this[mainProp][prop][index].lang.toLowerCase().slice(0, n) === val) {
                    let replaceLang = this[mainProp][prop].splice(index, 1);
                    this[mainProp][prop].unshift(replaceLang[0]);
                }
            }
        },
        checkErrors() {
            this.errors = [];
            if(!this.selectedPrice._id) {
                this.errors.push('Please, select pricelist');
                return this.areErrors = true;
            } else {
                if(!this.source.chosen.length) this.errors.push('Please, select source languages');
                if(!this.target.chosen.length) this.errors.push('Please, select target languages');
                if(!this.selectedSteps.length) this.errors.push('Please, select steps');
                if(!this.selectedInd.length) this.errors.push('Please, select industries');
                if(this.errors.length) {
                    return this.areErrors = true;
                }
            }
            this.addLangCombinations();
        },
        closeErrors() {
            this.areErrors = false;
        },
        setPrice({option}) {
            this.selectedPrice = option;
            this.setPriceLangs();
            this.sortLangArray(this.source.all);
            this.sortLangArray(this.target.all);
        },
        setPriceLangs() {
            const allCombs = this.selectedPrice[this.ratesName];
            const notUniqueSource = allCombs.map(item => item.source);
            const notUniqueTarget = allCombs.map(item => item.target);
            this.source.all = notUniqueSource.filter((obj, index, self) => self.map(item => item.lang).indexOf(obj.lang) === index);            
            this.target.all = notUniqueTarget.filter((obj, index, self) => self.map(item => item.lang).indexOf(obj.lang) === index);
            this.source.chosen = [];            
            this.target.chosen = [];            
        },
        collectData() {
            const industries = this.selectedInd[0].name === 'All' ? ['All'] : this.selectedInd.map(item => item._id);
            const stepsIds = this.selectedSteps.map(item => item._id);
            return {
                copyRates: this.selectedPrice[this.ratesName],
                sources: this.source.chosen,
                targets: this.target.chosen,
                industries, 
                stepsIds
            }
        },
        addLangCombinations() {
            const ratesData = this.collectData();
            this.$emit("addSeveralRates", { ratesData });
        },
        closeSeveral() {
            if(this.isAvailablePairs) return;
            this.selectedInd = [];
            this.selectedSteps = [];
            this.$emit('closeSeveral')
        },
        sortLangs({ prop }, mainProp) {
            this.sortLangArray(this[mainProp][prop]);
        },
        sortLangArray(arr) {
            arr.sort((a, b) => {
                if(a.lang < b.lang) return -1;
                if(a.lang > b.lang) return 1;
            })
        },
        forceMoveTo({ index }, prop) {
            const language = this[prop].all.splice(index, 1);
            this[prop].chosen.push(language[0]);
            this[prop].chosen.forEach(item => {
                item.check = false
            })
            this.sortLangArray(this[prop].chosen);
        },
        forceMoveBack({ index }, prop) {
            const language = this[prop].chosen.splice(index, 1);
            this[prop].all.push(language[0]);
            this[prop].all.forEach(item => {
                item.check = false
            })
            this.sortLangArray(this[prop].all);
        },
        toChosen(e, mainProp) {
            for(let lang of this[mainProp].all) {
                if(lang.check) {
                    this[mainProp].chosen.push(lang)
                }
            }
            this[mainProp].all = this[mainProp].all.filter(item => {
                return !item.check;
            })
            this[mainProp].chosen.forEach(item => {
                item.check = false
            })
            this.sortLangArray(this[mainProp].chosen);
        },
        toAll(e, mainProp) {
            for(let lang of this[mainProp].chosen) {
                if(lang.check) {
                    this[mainProp].all.push(lang)
                }
            }
            this[mainProp].chosen = this[mainProp].chosen.filter(item => {
                return !item.check;
            })
            this[mainProp].all.forEach(item => {
                item.check = false
            })
            this.sortLangArray(this[mainProp].all);
        },
        setIndustry({industry}) {
            if(industry.name === "All") {
                return this.selectedInd = [{name: 'All'}];
            }
            const position = this.selectedInd.findIndex(item => item.name === industry.name);
            if(position !== -1) {
                 return this.selectedInd.splice(position, 1);
            }
            if(this.selectedInd.length && this.selectedInd[0].name === "All") {
                this.selectedInd = []
            };
            this.selectedInd.push(industry);
        },
        setSteps({option}) {
            const step = this.vuexSteps.find(item => item.title === option);
            const position = this.selectedStepsTitles.indexOf(option);
            if(position !== -1) {
                 return this.selectedSteps.splice(position, 1);
            }
            this.selectedSteps.push(step);
        },
        async getAllPricelists() {
            try {
                const result = await this.$http.get("/prices/pricelists");
                await this.storePricelists(result.body);
            } catch(err) {
                this.alertToggle({message: "Error on getting pricelists.", isShow: true, type: "error"});
            }
        },
    },
    computed: {
        ...mapGetters({
            vuexPricelists: "getPricelists",
            vuexSteps: "getVuexSteps",
            currentPrice: "getCurrentPrice"
        }),
        pricelists() {
            return this.entity ? this.vuexPricelists 
                : this.vuexPricelists.filter(item => item._id !== this.currentPrice._id);
        },
        checkedIndustries() {
            let result = [];
            if(this.selectedInd.length) {
                for(let elem of this.selectedInd) {
                    result.push(elem.name);
                }
            }
            return result;
        },
        selectedStepsTitles() {
            return this.selectedSteps.length ? this.selectedSteps.map(item => item.title) : [];
        },
    },
    components: {
        SelectMulti,
        IndustrySelect,
        SelectSingle,
        ValidationErrors,
        LangsManage
    },
    created() {
        this.getAllPricelists();
    }
}
</script>

<style lang="scss" scoped>

.add-several {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    z-index: 50;
    &__main {
        padding: 40px 40px 20px 30px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        box-shadow: rgba(81, 68, 48, 0.3) 0px 1px 2px 0px, rgba(81, 68, 48, 0.15) 0px 1px 3px 1px;
        border-radius: 4px;
        background-color: #FFF;
        width: 690px;
    }
    &__language {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 30px;
        position: relative;
    }
    &__service-industry, &__prices {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 30px;
    }
    &__service-rates {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        padding-left: 70px;
        padding-top: 30px;
        margin-left: 10px;
        border-top:1px solid #c1bbb1;
    }
    &__close {
        position: relative;
        width: 100%;
    }
    &__close-icon {
        position: absolute;
        transform: rotate(45deg);
        font-weight: 600;
        top: -36px;
        right: -26px;
        font-size: 28px;
        cursor: pointer;
    }
    &__clear-all, &__clear-chosen {
        position: absolute;
        top: -5px;
        cursor: pointer;
        padding: 1px 5px;
        border: 1px solid #c1bbb1;
        border-radius: 4px;
        transition: all 0.2s;
        &:hover {
            background-color: #66563d;
            color: #FFF;
        }
    }
    &__clear-all {
        left: 105px;
    }
    &__clear-chosen {
        right: 200px;
    }
    &__all-search-value {
        position: absolute;
        top: -17px;
        left: 55%;
        background: #FFF;
        z-index: 20;
    }
    &__select-block {
        display: flex;
        align-items: center;
        align-self: flex-start;
        justify-content: flex-start;
        width: 45%;
        &:last-child, &:first-child {
            justify-content: space-between;
        }
         &:last-child {
             width: 55%;
         }
    }
    &_width-22 {
        width: 22%;
        box-sizing: border-box;
        display: flex;
        justify-content: center;
    }
    &_width-78 {
        width: 78%;
        display: flex;
        justify-content: space-between;
    }
    &__drop-menu {
        position: relative;
        width: 200px;
        height: 32px;
    }
    &__button {
        background-color: #D15F45;
        color: white;
        font-size: 16px;
        width: 164px;
        height: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 4px;
        border: none;
        outline: none;
      box-shadow: rgba(81, 68, 48, 0.3) 0px 1px 2px 0px, rgba(81, 68, 48, 0.15) 0px 1px 3px 1px;
        margin-bottom: 25px;
        cursor: pointer;
        &:active {
          box-shadow: rgba(81, 68, 48, 0.3) 0px 1px 2px 0px, rgba(81, 68, 48, 0.15) 0px 1px 3px 1px;
        }
    }
}

</style>
