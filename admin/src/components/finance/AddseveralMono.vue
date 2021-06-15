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
            title="Languages"
            :all="target.all" 
            :chosen="target.chosen" 
            @toChosen="toChosen" 
            @toAll="toAll"
            @forceMoveTo="forceMoveTo"
            @forceMoveBack="forceMoveBack"
            @sortBySearch="sortBySearch"
            @sortLangs="sortLangs")
        .add-several__prices
            span.add-several__title.add-several_width-22 Packages
            .add-several_width-78
                .add-several__drop-menu
                    SelectMulti(placeholder="Select" :options="packages" :selectedOptions="selectedPackages" @chooseOptions="setPackage" :allOptionsButtons="true")
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
    ValidationErrors(v-if="areErrors" :isAbsolute="true" :errors="errors" @closeErrors="closeErrors")
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
        packages: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            languages: [],
            target: {
                all: [], chosen: []
            },
            selectedInd: [],
            selectedSteps: [],
            areErrors: false,
            errors: [],
            selectedPrice: {name: ""},
            selectedPackages: []
        }
    },
    methods: {
        ...mapActions({
            alertToggle: "alertToggle",
            storePricelists: "storePricelists"
        }),
        sortBySearch({value, prop }) {
            if(!value) return this.sortLangArray(this.target[prop]);
            const val = value.toLowerCase();
            for(let index in this.target[prop]) {
                if(this.target[prop][index].lang.toLowerCase().slice(0, val.length) === val) {
                    let replaceLang = this.target[prop].splice(index, 1);
                    this.target[prop].unshift(replaceLang[0]);
                }
            }
        },
        checkErrors() {
            this.errors = [];
            if(!this.selectedPrice._id) {
                this.errors.push('Please, select pricelist');
                return this.areErrors = true;
            } else {
                if(!this.target.chosen.length) this.errors.push('Please, select target languages');
                if(!this.selectedPackages.length) this.errors.push('Please, select packages');
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
            this.sortLangArray(this.target.all);
        },
        setPriceLangs() {
            const notUniqueTargets =  this.selectedPrice.monoRates.map(item => item.target);
            this.target.all = notUniqueTargets.filter((obj, index, self) => self.map(item => item.lang).indexOf(obj.lang) === index);
            this.target.chosen = [];            
        },
        collectData() {
            const industries = this.selectedInd[0].name === 'All' ? ['All'] : this.selectedInd.map(item => item._id);
            const packages = this.selectedPackages[0] === 'All' ? this.packages.filter(item => item !== 'All') : this.selectedPackages;
            const stepsIds = this.selectedSteps.map(item => item._id);
            return {
                copyRates: this.selectedPrice.monoRates,
                industries, 
                stepsIds, 
                packages,                  
                targets: this.target.chosen
            };
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
        sortLangs({ prop }) {
            this.sortLangArray(this.target[prop]);
        },
        sortLangArray(arr) {
            arr.sort((a, b) => {
                if(a.lang < b.lang) return -1;
                if(a.lang > b.lang) return 1;
            })
        },
        forceMoveTo({ index }) {
            const language = this.target.all.splice(index, 1);
            this.target.chosen.push(language[0]);
            this.target.chosen.forEach(item => {
                item.check = false
            })
            this.sortLangArray(this.target.chosen);
        },
        forceMoveBack({ index }) {
            const language = this.target.chosen.splice(index, 1);
            this.target.all.push(language[0]);
            this.target.all.forEach(item => {
                item.check = false
            })
            this.sortLangArray(this[prop].all);
        },
        toChosen() {
            for(let lang of this.target.all) {
                if(lang.check) {
                    this.target.chosen.push(lang)
                }
            }
            this.target.all = this.target.all.filter(item => {
                return !item.check;
            })
            this.target.chosen.forEach(item => {
                item.check = false
            })
            this.sortLangArray(this.target.chosen);
        },
        toAll() {
            for(let lang of this.target.chosen) {
                if(lang.check) {
                    this.target.all.push(lang)
                }
            }
            this.target.chosen = this.target.chosen.filter(item => {
                return !item.check;
            })
            this.target.all.forEach(item => {
                item.check = false
            })
            this.sortLangArray(this.target.all);
        },
        setElements({position, mainProp, prop, option}) {
            if(position !== -1) {
                 return this[mainProp].splice(position, 1);
            }
            if(this[mainProp].length && (this[mainProp][0]  === "All" || this[mainProp][0][prop] === "All")) {
                this[mainProp] = []
            }
            this[mainProp].push(option);
        },
        setIndustry({industry}) {
            if(industry.name === "All") {
                return this.selectedInd = [{name: 'All'}];
            }
            const position = this.selectedInd.findIndex(item => item.name === industry.name);
            this.setElements({position, mainProp: 'selectedInd', prop: 'name', option: industry});
        },
        setSteps({option}) {
            const step = this.vuexSteps.find(item => item.title === option);
            const position = this.selectedStepsTitles.indexOf(option);
            if(position !== -1) {
                 return this.selectedSteps.splice(position, 1);
            }
            this.selectedSteps.push(step);
        },
        setPackage({option}) {
            if(option === 'All') {
                return this.selectedPackages = ['All'];
            }
            const position = this.selectedPackages.indexOf(option);
            this.setElements({position, mainProp: 'selectedPackages', option});
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
            return this.selectedInd.length ? this.selectedInd.map(item => item.name) : [];
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
        box-shadow: 0 5px 15px rgba(85, 55, 0, 0.5);
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
        border-top:1px solid #67573E;
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
        border: 1px solid #67573E;
        border-radius: 4px;
        transition: all 0.2s;
        &:hover {
            background-color: #67573E;
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
        width: 191px;
        height: 34px;
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
        box-shadow: 0 5px 10px rgba(103, 87, 62, 0.6);
        margin-bottom: 25px;
        cursor: pointer;
        &:active {
            box-shadow: 0 0 5px rgba(103, 87, 62, 0.6);
        }
    }
}

</style>
