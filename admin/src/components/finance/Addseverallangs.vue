<template lang="pug">
.add-several(v-click-outside="closeSeveral")
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
            span.add-several__title.add-several_width-22 Services
            .add-several_width-78
                .add-several__select-block
                    .add-several__drop-menu
                        ServiceMultiSelect(:selectedServ="selectedServ" :filteredServices="checkedServices" @chosenServ="changeService")
                .add-several__select-block
                    span.add-several__title Industries
                    .add-several__drop-menu
                        IndustrySelect(:selectedInd="selectedInd" :filteredIndustries="checkedIndustries" @chosenInd="changeIndustry" :who="who")
        .add-several__submit
            input.add-several__button(type="button" @click="checkErrors" value="Submit")
    ValidationErrors(v-if="areErrors" isAbsolute :errors="errors" @closeErrors="closeErrors")
</template>

<script>
import ClickOutside from "vue-click-outside";
import ServiceMultiSelect from "../ServiceMultiSelect";
import IndustrySelect from "../IndustrySelect";
import SelectSingle from "../SelectSingle";
import LangsManage from "./langs/LangsManage";
import ValidationErrors from "../ValidationErrors";
import { mapGetters, mapActions } from "vuex";

export default {
    props: {
        origin: {
            type: String
        },
        who: {
            type: Object
        },
        isAvailablePairs: {
            type: Boolean
        }
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
            selectedServ: [],
            areErrors: false,
            errors: [],
            langSearchValue: "",
            isSourceSearch: true,
            selectedPrice: {name: ""}
        }
    },
    methods: {
        ...mapActions({
            alertToggle: "alertToggle",
            addSeveralVendorRates: "addSeveralVendorRates",
            storeClient: "storeClient",
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
            if(!this.selectedPrice._id) this.errors.push('Please, select pricelist');
            if(!this.source.chosen.length) this.errors.push('Choose source languages');
            if(!this.target.chosen.length) this.errors.push('Choose target languages');
            if(!this.selectedServ.length) this.errors.push('Please, select services');
            if(!this.selectedInd.length) this.errors.push('Please, select industries');
            if(this.errors.length) {
                return this.areErrors = true;
            } else {
                this.addLangCombinations();
            }
        },
        closeErrors() {
            this.areErrors = false;
        },
        setPrice({option}) {
            this.selectedPrice = option;
            this.priceLangs();
            this.sortLangArray(this.source.all);
            this.sortLangArray(this.target.all);
        },
        priceLangs() {
            const allCombs = this.selectedPrice.combinations.filter(item => item.source);
            const notUniqueSource = allCombs.map(item => {
                return item.source;
            });
            const notUniqueTarget = allCombs.map(item => {
                return item.target;
            });
            this.source.all = notUniqueSource.filter((obj, index, self) => self.map(item => item.lang).indexOf(obj.lang) === index);            
            this.target.all = notUniqueTarget.filter((obj, index, self) => self.map(item => item.lang).indexOf(obj.lang) === index);
            this.source.chosen = [];            
            this.target.chosen = [];            
        },
        collectCombinations() {
            let combinations = [];
            const industries = this.selectedInd[0].name === 'All' ? ['All'] : this.selectedInd.map(item => item._id);
            const services = this.selectedServ.map(item => item._id);
            for(let source of this.source.chosen) {
                for(let target of this.target.chosen) {
                    if(source._id !== target._id) {
                        combinations.push({
                            source,
                            target,
                            industries,
                            services
                        })
                    }
                }
            }
            return combinations;
        },
        async addLangCombinations() {
            const combinations = this.collectCombinations();
            const priceId = this.selectedPrice._id;
            this.$emit("checkCombinations", { priceId, combinations });
        },
        // async addLangCombinations() {
            // const combinations = this.collectCombinations();
            // const priceId = this.selectedPrice._id;
            // try {
            //     if(this.origin === 'global') {
            //         const result = await this.$http.post('/service/several-langs', { combinations });
            //     }
            //     if(this.origin === 'vendor') {
            //         const id = this.who._id;
            //         await this.addSeveralVendorRates({priceId, combinations, vendorId: id});
            //     }
            //     if(this.origin === 'client') {
            //         const id = this.who._id;
            //         const clientResult = await this.$http.post('/clientsapi/several-langs', {priceId, combinations, clientId: id});
            //         const updatedClient = {...clientResult.body};
            //         await this.storeClient(updatedClient);
            //     }
            //     this.$emit('severalLangsResult', {message: 'Several language combinations added.', isShow: true, type: 'success'})
            // } catch(err) {
            //     this.alertToggle({message: 'Internal server error. Cannot add several languages.', isShow: true, type: 'error'});
            // }
            // this.closeSeveral();
        // },
        closeSeveral() {
            if(this.isAvailablePairs) return;
            this.selectedInd = [];
            this.selectedServ = [];
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
        changeIndustry({industry}) {
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
        changeService({service}) {
            const position = this.selectedServ.findIndex(item => item.title === service.title);
            if(position !== -1) {
                 return this.selectedServ.splice(position, 1);
            }
            this.selectedServ.push(service);
        },
        async getPricelists() {
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
            vuexServices: "getVuexServices",
            vuexPricelists: "getPricelists",
            currentPrice: "getCurrentPrice"
        }),
        pricelists() {
            return this.origin !== "global" ? this.vuexPricelists 
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
        checkedServices() {
            let result = [];
            if(this.selectedServ.length) {
                for(let elem of this.selectedServ) {
                    result.push(elem.title);
                }
            }
            return result;
        }
    },
    components: {
        ServiceMultiSelect,
        IndustrySelect,
        SelectSingle,
        ValidationErrors,
        LangsManage
    },
    directives: {
        ClickOutside
    },
    mounted() {
        this.getPricelists();
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
        border-radius: 3px;
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
        border-radius: 8px;
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
        border-radius: 10px;
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
