<template lang="pug">
.addSeveral-wrap(v-click-outside="closeSeveral")
    .add-several
        .add-several__language
            .title
                span Source language
            .languages
                .list
                    .list__item(v-for="(language, i) in source.all" @click="sourceTo(i)" :class="{chosen: language.check}") {{ language.lang }}
            .arrows
                .arrows__right
                    img(src="../../assets/images/right.png" @click="toChosenSource")
                .arrows__left
                    img(src="../../assets/images/left.png" @click="toAllSource") 
            .languages
                .list
                    .list__item(v-for="(language, i) in source.chosen" @click="sourceBack(i)" :class="{chosen: language.check}") {{ language.lang }}
        .add-several__language
            .title
                span.title-target Target language
            .languages
                .list
                    .list__item(v-for="(language, i) in target.all" @click="targetTo(i)" :class="{chosen: language.check}") {{ language.lang }}
            .arrows
                .arrows__right
                    img(src="../../assets/images/right.png" @click="toChosenTarget")
                .arrows__left
                    img(src="../../assets/images/left.png" @click="toAllTarget")
            .languages    
                .list
                    .list__item(v-for="(language, i) in target.chosen" @click="targetBack(i)" :class="{chosen: language.check}") {{ language.lang }}
        .add-several__service-industry                 
            .services
                span.services__title Service
                .services__innerComponent
                    ServiceMultiDuoSelect(:selectedServ="selectedServ" :filteredServices="checkedServices" @chosenServ="changeService")
            .industries
                span Industry
                .industries__innerComponent
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
import ServiceMultiDuoSelect from "../ServiceMultiDuoSelect";
import IndustrySelect from "../IndustrySelect";

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
            errors: []
        }
    },
    methods: {
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
            console.log(this.errors);
            if(this.errors.length) {
                return true;
            } else {
                this.langsAddition();
            }
        },
        langsAddition() {
            let languageCombinations = [];
            for(let sourLang of this.source.chosen) {
                for(let targLang of this.target.chosen) {
                    if(sourLang.lang != targLang.lang) {
                        for(let serv of this.selectedServ) {
                            let indus = JSON.stringify(this.selectedInd);
                            indus = JSON.parse(indus);
                            for(let ind in indus) {
                                indus[ind].rate = +serv.rate;
                            }
                            languageCombinations.push({
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
            if(this.origin == 'rates') {
                this.$http.post('../service/several-langs', JSON.stringify(languageCombinations))
                .then(res => {
                    console.log(res)
                })
                .catch(err => {
                    console.log(err)
                })
            }
            if(this.origin == 'vendor') {
                let id = this.who._id;
                this.$http.post('../vendorsapi/several-langs', {langs: JSON.stringify(languageCombinations), vendor: id})
                .then(res => {
                    console.log(res)
                })
                .catch(err => {
                    console.log(err)
                })
            }
            this.$emit('refreshServices');
            this.closeSeveral();
        },
        closeSeveral() {
            this.$emit('closeSeveral')
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
            this.source.chosen.sort((a, b) => {
                if(a.lang < b.lang) return -1;
                if(a.lang > b.lang) return 1;
            })
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
        changeService(data) {
            if(this.selectedServ[0].title == 'Select' || this.selectedServ[0].title == 'All') {
                this.selectedServ.splice(0, 1, data.service)
            } else {
                let hasService = false;
                for(let i in this.selectedServ) {
                if(this.selectedServ[i].title == data.service.title) {
                    this.selectedServ.splice(i, 1);
                    hasService = true;
                }
                }
                if(!hasService) {
                this.selectedServ.push(data.service);
                }
            }
            if(!this.selectedServ.length || data.service.title == 'All') {
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
        }
    },
    components: {
        ServiceMultiDuoSelect,
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
}

.title-target {
    padding-right: 3px; 
}

.services, .industries {
    display: flex;
    align-items: center;
    width: 50%;
    margin-bottom: 30px;
    &__innerComponent {
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
            background-color: #DFD7CD;
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
        background-color: #ff876c;
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
