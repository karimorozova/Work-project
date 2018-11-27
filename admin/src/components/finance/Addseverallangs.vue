<template lang="pug">
.addSeveral-wrap(v-click-outside="closeSeveral")
    .add-several
        .add-several__close
            span.add-several__close-icon(@click="closeSeveral") +
        .add-several__language
            .title
                span Source language        
            .add-several__clear-all(v-if="hasCheckedAllSource" @click="clearAllChecks('source')") Clear
            span.add-several__all-search-value(v-model="langSearchValue" v-if="isSourceSearch && langSearchValue") {{ langSearchValue }}
            .languages
                .list(tabindex="0" @keydown="(e) => findLanguage(e, 'source', 'all')" @blur="clearSearchValue('source', 'all')")
                    .list__item(v-for="(language, i) in source.all" @mousedown="(e)=>preventShift(e)" @mouseup="(e) => selectAllMultiTo(e, i, 'source', 'all')" @dblclick="forceMoveTo(i, 'source')" :class="{chosen: language.check}") {{ language.lang }}
            .arrows
                .arrows__right
                    img(src="../../assets/images/right.png" @click="toChosenSource")
                .arrows__left
                    img(src="../../assets/images/left.png" @click="toAllSource")
            .add-several__clear-chosen(v-if="hasCheckedChosenSource" @click="clearChosenChecks('source')") Clear
            .languages
                .list
                    .list__item(v-for="(language, i) in source.chosen" @mousedown="(e)=>preventShift(e)" @mouseup="(e) => selectAllMultiBack(e, i, 'source', 'chosen')" @dblclick="forceMoveFrom(i, 'source')" :class="{chosen: language.check}") {{ language.lang }}
        .add-several__language
            .title
                span.title-target Target language
            .add-several__clear-all(v-if="hasCheckedAllTarget" @click="clearAllChecks('target')") Clear
            span.add-several__all-search-value(v-model="langSearchValue" v-if="!isSourceSearch && langSearchValue") {{ langSearchValue }}
            .languages
                .list(tabindex="3" @keydown="(e) => findLanguage(e, 'target', 'all')" @blur="clearSearchValue('target', 'all')")
                    .list__item(v-for="(language, i) in target.all" @mousedown="(e)=>preventShift(e)" @mouseup="(e) => selectAllMultiTo(e, i, 'target', 'all')" @dblclick="forceMoveTo(i, 'target')" :class="{chosen: language.check}") {{ language.lang }}
            .arrows
                .arrows__right
                    img(src="../../assets/images/right.png" @click="toChosenTarget")
                .arrows__left
                    img(src="../../assets/images/left.png" @click="toAllTarget")
            .add-several__clear-chosen(v-if="hasCheckedChosenTarget" @click="clearChosenChecks('target')") Clear
            .languages    
                .list
                    .list__item(v-for="(language, i) in target.chosen" @mousedown="(e)=>preventShift(e)" @mouseup="(e) => selectAllMultiBack(e, i, 'target', 'chosen')" @dblclick="forceMoveFrom(i, 'target')" :class="{chosen: language.check}") {{ language.lang }}
        .add-several__service-industry                 
            .services
                span.services__title Service
                .services__inner-component
                    ServiceMultiSelect(:selectedServ="selectedServ" :filteredServices="checkedServices" @chosenServ="changeService")
            .industries
                span Industry
                .industries__inner-component
                    IndustrySelect(:selectedInd="selectedInd" :filteredIndustries="checkedIndustries" @chosenInd="changeIndustry" :who="who")
        .add-several__service-rates(v-if="selectedServ[0].title != 'Select' && selectedServ[0].title != 'All'")
            .chosen-services(v-for="serv in selectedServ")
                span.chosen-services__title {{ serv.title }}:
                input.chosen-services__rate(type="text" v-model="serv.rate") 
        .submit-button
            input.submit-button__button(type="button" @click="checkErrors" value="Submit")
</template>

<script>
import ClickOutside from "vue-click-outside";
import ServiceMultiSelect from "../ServiceMultiSelect";
import IndustrySelect from "../IndustrySelect";
import { mapGetters, mapActions } from "vuex";

export default {
    props: {
        origin: {
            type: String
        },
        who: {
            type: Object
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
            selectedInd: [{name: 'Select'}],
            selectedServ: [{title: 'Select'}],
            errors: [],
            langSearchValue: "",
            isSourceSearch: true
        }
    },
    methods: {
        ...mapActions({
            alertToggle: "alertToggle",
            storeVendors: "vendorsSetting",
            storeCurrentVendor: "storeCurrentVendor",
            storeClient: "storeClient"
        }),
        clearSearchValue(prop, subProp) {
            this.langSearchValue = "";
            this.sortLangArray(this[prop][subProp]);
        },
        sortBySearch({val, prop, subProp}) {
            const value = val.toLowerCase();
            for(let index in this[prop][subProp]) {
                const n = value.length;
                if(this[prop][subProp][index].lang.toLowerCase().slice(0, n) === value) {
                    let replaceLang = this[prop][subProp].splice(index, 1);
                    this[prop][subProp].unshift(replaceLang[0]);
                }
            }
        },
        findLanguage(e, prop, subProp) {
            this.isSourceSearch = true;
            if(prop === "target") {
                this.isSourceSearch = false;
            }
            if(e.keyCode === 27) {
                this.clearAllChecks(prop);
            } 
            if(e.keyCode <= 90 && e.keyCode >= 65) {
                this.langSearchValue += e.key;
            }
            if(e.keyCode === 8) {
                this.langSearchValue = this.langSearchValue.slice(0, -1);
            }
            if(this.langSearchValue) {
                this.sortBySearch({val: this.langSearchValue, prop, subProp});
            } else {
                this.sortLangArray(this[prop][subProp]);
            }
        },
        preventShift(e) {
            if(e.shiftKey) e.preventDefault();
        },
        clearAllChecks(prop) {
            this[prop].all.forEach(item => item.check = false);
        },
        clearChosenChecks(prop) {
            this[prop].chosen.forEach(item => item.check = false);
        },
        checkAllBefore({prop, subProp, index, i}) {
            for(let j = index; j < i; j++ ) {
                this[prop][subProp][j].check = true;   
            };
        },
        checkAllAfter({prop, subProp, index, i}) {
            for(let j = index; j > i; j-- ) {
                this[prop][subProp][j].check = true;   
            };
        },
        selectMany({e, i, prop, subProp}) {
            if(e.shiftKey) {
                e.preventDefault();
                for(let index in this[prop][subProp]) {
                    if(this[prop][subProp][index].check && index < i) {
                        return this.checkAllBefore({prop, subProp, index, i});
                    }
                    if(this[prop][subProp][index].check && index > i) {
                        return this.checkAllAfter({prop, subProp, index, i});
                    }
                }
            }
        },
        selectAllMultiTo(e, i, prop, subProp) {
            if(prop === 'source') {
                this.sourceTo(i);
            } else {
                this.targetTo(i);
            }
            this.selectMany({e, i, prop, subProp})
        },
        selectAllMultiBack(e, i, prop, subProp) {
            if(prop === 'source') {
                this.sourceBack(i);
            } else {
                this.targetBack(i);
            }
            this.selectMany({e, i, prop, subProp})
        },
        checkErrors() {
            this.errors = [];
            if(this.selectedInd[0].name == 'Select') this.errors.push('Choose industry');
            if(this.selectedServ[0].title == 'Select') this.errors.push('Choose service');
            if(!this.source.chosen.length) this.errors.push('Choose source languages');
            if(!this.target.chosen.length) this.errors.push('Choose target languages');
            if(this.selectedServ.length) {
                for(let serv of this.selectedServ) {
                    if(+serv.rate <= 0 || !serv.rate) {
                        this.errors.push(`Enter correct rate value for service ${serv.title}`)
                    }
                }
            }
            if(this.errors.length) {
                return true;
            } else {
                this.langsAddition();
            }
        },
        collectCombinations() {
            let combinations = [];
            for(let sourLang of this.source.chosen) {
                for(let targLang of this.target.chosen) {
                    if(sourLang.lang !== targLang.lang) {
                        for(let serv of this.selectedServ) {
                            let indus = JSON.stringify(this.selectedInd);
                            indus = JSON.parse(indus);
                            for(let ind in indus) {
                                indus[ind].rate = +serv.rate;
                            }
                            combinations.push({
                                source: sourLang,
                                target: targLang,
                                service: serv,
                                industry: indus,
                                active:true
                            })
                        }
                    }
                }
            }
            return combinations;
        },
        async langsAddition() {
            let languageCombinations = this.collectCombinations();
            try {
                if(this.origin == 'rates') {
                    const result = await this.$http.post('/service/several-langs', JSON.stringify(languageCombinations));
                }
                if(this.origin == 'vendor') {
                    const id = this.who._id;
                    const updatedVendors = await this.$http.post('/vendorsapi/several-langs', {langs: JSON.stringify(languageCombinations), vendor: id});
                    await this.storeVendors(updatedVendors.body);
                    const updatedVendor = updatedVendors.body.find(item => item._id === this.who._id);
                    await this.storeCurrentVendor(updatedVendor);
                }
                if(this.origin == 'client') {
                    const id = this.who._id;
                    const clientResult = await this.$http.post('/clientsapi/several-langs', {langs: JSON.stringify(languageCombinations), client: id});
                    const updatedClient = {...clientResult.body};
                    await this.storeClient(updatedClient);
                }
                this.$emit('severalLangsResult', {message: 'Several language combinations added.', isShow: true, type: 'success'})
            } catch(err) {
                this.alertToggle({message: 'Internal server error. Cannot add several languages.', isShow: true, type: 'error'});
            }
            this.closeSeveral();
        },
        closeSeveral() {
            this.selectedInd = [{name: 'Select'}];
            this.selectedServ = [{title: 'Select'}];
            this.$emit('closeSeveral')
        },
        sortLangArray(arr) {
            arr.sort((a, b) => {
                if(a.lang < b.lang) return -1;
                if(a.lang > b.lang) return 1;
            })
        },
        forceMoveTo(i, prop) {
            const language = this[prop].all.splice(i, 1);
            this[prop].chosen.push(language[0]);
            this[prop].chosen.forEach(item => {
                item.check = false
            })
            this.sortLangArray(this[prop].chosen);
        },
        forceMoveFrom(i, prop) {
            const language = this[prop].chosen.splice(i, 1);
            this[prop].all.push(language[0]);
            this[prop].all.forEach(item => {
                item.check = false
            })
            this.sortLangArray(this[prop].all);
        },
        toChosenSource() {
            for(let lang of this.source.all) {
                if(lang.check) {
                    this.source.chosen.push(lang)
                }
            }
            this.source.all = this.source.all.filter(item => {
                return !item.check;
            })
            this.source.chosen.forEach(item => {
                item.check = false
            })
            this.sortLangArray(this.source.chosen);
        },
        toAllSource() {
            for(let lang of this.source.chosen) {
                if(lang.check) {
                    this.source.all.push(lang)
                }
            }
            this.source.chosen = this.source.chosen.filter(item => {
                return !item.check;
            })
            this.source.all.forEach(item => {
                item.check = false
            })
            this.source.all.sort((a, b) => {
                if(a.lang < b.lang) return -1;
                if(a.lang > b.lang) return 1;
            })
        },
        toChosenTarget() {
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
            this.target.chosen.sort((a, b) => {
                if(a.lang < b.lang) return -1;
                if(a.lang > b.lang) return 1;
            })
        },
        toAllTarget() {
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
            this.target.all.sort((a, b) => {
                if(a.lang < b.lang) return -1;
                if(a.lang > b.lang) return 1;
            })
        },
        sourceTo(i) {
            if(this.source.all.length) {
                this.source.all[i].check = !this.source.all[i].check;
            }
        },
        sourceBack(i) {
            if(this.source.chosen.length) {
                this.source.chosen[i].check = !this.source.chosen[i].check;
            }
        },
        targetTo(i) {
            if(this.target.all.length) {
                this.target.all[i].check = !this.target.all[i].check;
            }
        },
        targetBack(i) {
            if(this.target.chosen.length) {
                this.target.chosen[i].check = !this.target.chosen[i].check;
            }
        },
        changeIndustry(data) {
            if(this.selectedInd[0].name == 'Select' || this.selectedInd[0].name == 'All') {
                this.selectedInd.splice(0, 1, data.industry)
            } else {
                let hasIndustry = false;
                for(let i in this.selectedInd) {
                if(this.selectedInd[i].name == data.industry.name) {
                    this.selectedInd.splice(i, 1);
                    hasIndustry = true;
                }
                }
                if(!hasIndustry) {
                this.selectedInd.push(data.industry);
                }
            }
            if(!this.selectedInd.length || data.industry.name == 'All') {
                this.selectedInd = [];
                this.selectedInd.push({
                crud: true,
                name: 'All'
                })
            }
        },
        changeService({service}) {
            if(this.selectedServ[0].title == 'Select' || this.selectedServ[0].title == 'All') {
                this.selectedServ.splice(0, 1, {...service})
            } else {
                let hasService = false;
                for(let i in this.selectedServ) {
                if(this.selectedServ[i].title == service.title) {
                    this.selectedServ.splice(i, 1);
                    hasService = true;
                }
                }
                if(!hasService) {
                this.selectedServ.push({...service});
                }
            }
            if(!this.selectedServ.length || service.title == 'All') {
                this.selectedServ = [];
                this.selectedServ.push({
                crud: true,
                title: 'Select'
                })
            }
        },
        getLanguages() {
            this.$http.get('../api/languages')
            .then(res => {
                this.languages = res.data.sort( (a, b) => {
                    if(a.lang < b.lang) return -1;
                    if(a.lang > b.lang) return 1;
                });
                for(let lang of this.languages) {
                    lang.check = false;
                }
                let langs = JSON.stringify(this.languages);
                this.source.all = JSON.parse(langs);
                this.target.all = JSON.parse(langs);
            })
        }
    },
    computed: {
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
        },
        hasCheckedAllSource() {
            return this.source.all.find(item => item.check);
        },
        hasCheckedChosenSource() {
            return this.source.chosen.find(item => item.check);

        },
        hasCheckedAllTarget() {
            return this.target.all.find(item => item.check);
        },
        hasCheckedChosenTarget() {
            return this.target.chosen.find(item => item.check);

        }
    },
    components: {
        ServiceMultiSelect,
        IndustrySelect
    },
    directives: {
        ClickOutside
    },
    mounted() {
        this.getLanguages();
    }
}
</script>

<style lang="scss" scoped>

.addSeveral-wrap {
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
}

.add-several {
    padding: 40px 40px 20px 30px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-shadow: 0 5px 15px rgba(85, 55, 0, 0.5);
    border-radius: 3px;
    background-color: #FFF;
    width: 690px;
    &__language {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 30px;
        position: relative;
    }
    &__service-industry {
        width: 100%;
        display: flex;
        justify-content: space-between;
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
}

.title-target {
    padding-right: 3px; 
}

.services, .industries {
    display: flex;
    align-items: center;
    width: 50%;
    margin-bottom: 30px;
    &__inner-component {
        width: 192px;
        margin-left: 20px;
    }
}

.chosen-services {
    width: 45%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    &__rate {
        margin-right: 5px;
        width: 181px;
        height: 29px;
        border-radius: 5px;
        border: 1px solid #67573E;
        outline: none;
        padding: 0 5px;
    }
}

.services {
    justify-content: space-between;
    &__title {
        margin-left: 40px;
    }
}

.industries {
    justify-content: flex-end;
}

.languages {
    height: 187px;
    width: 191px;
    border: 1px solid #67573E;
    border-radius: 10px;
    overflow: hidden;
}

.list {
    width: 100%;
    height: 95%;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    padding: 5px 0;
    &__item {
        font-size: 14px;
        padding: 3px 10px;
        cursor: pointer;
        transition: all 0.3s;
        &:hover {
            background-color: rgb(245, 238, 229);
        }
    }
    .chosen {
        background-color: #DFD7CD;
    }
    // ::-webkit-scrollbar {
    //     width: 16px;
    // }
    // ::-webkit-scrollbar-thumb {
    //     background-color: #67573E;
    //     border: 4px solid transparent;
    //     border-radius: 15px;
    //     background-clip: content-box;
    // }
}

.arrows {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    height: 80px;
    &__left, &__right {
        img {
            cursor: pointer;
            border-radius: 50%;
            &:active {
                background-color: #DFD7CD;
            }
        }
    }
}

.drop-menu {
    width: 191px;
    height: 22px;
    border-radius: 4px;
    border: 1px solid #67573E;
}

.submit-button {
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
        margin-top: 15px;
        cursor: pointer;
        &:active {
            box-shadow: 0 0 5px rgba(103, 87, 62, 0.6);
        }
    }
}

</style>
