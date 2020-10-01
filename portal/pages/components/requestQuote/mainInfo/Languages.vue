<template lang="pug">
    .quote-languages
        SectionTitle(text="SELECT LANGUAGES" number="2" isAsterisk)
        .quote-languages__source(v-if="isSource")
            .quote-languages__title Source Language
            LangsMenu(:languages="sourceLanguages" :selectedLanguages="[selectedSource]" @setLanguages="setSource")
        .quote-languages__targets
            .quote-languages__title Target Language(s)
            LangsMenu(:languages="targetLanguages" :selectedLanguages="selectedTargets" @setLanguages="setTargets")
</template>

<script>
import SectionTitle from "./SectionTitle";
import LangsMenu from "./LangsMenu";
import { mapGetters, mapActions } from "vuex";

export default {
    data() {
        return {
            allLanguages: [],
            allLangsWithDialects: []
        }
    },
    methods: {
        ...mapActions({
            setDetail: "setRequestQuoteDetail"
        }),
        setSource({language}) {
            this.setDetail({prop: 'sourceLanguage', value: language});
            this.setDetail({prop: 'targetLanguages', value: []});
        },
        setTargets({language}) {
            let targets = this.selectedTargets.map(item => {return {...item}});
            const position = targets.findIndex(item => item.lang === language.lang);
            if(position !== -1) {
                targets.splice(position, 1);
            } else {
                targets.push(language);
            }
            this.setDetail({prop: 'targetLanguages', value: targets});
        },
        async getLanguages() {
            try {
                const result = await this.$axios.$get('/api/languages');
                const langs = result.filter(item => item.active);
                this.allLanguages = langs.map(item => {return {...item}});
                const langsWithDialects = this.getLangsWithDialects(langs);
                this.allLangsWithDialects = langsWithDialects.sort((a, b) => {
                    if(a.lang > b.lang) return 1;
                    if(a.lang < b.lang) return -1;
                })
            } catch(err) {
                console.log(err);
            }
        },
        getLangsWithDialects(langs) {
            let langsWithDialects = [...langs]
            for(let lang of langsWithDialects) {
                if(lang.children) {
                    lang.dialects = langsWithDialects.filter(item => {
                        if(item.symbol !== lang.symbol) {
                            return item.parent === lang.symbol
                        }
                    })
                }
            }
            return langsWithDialects.filter(item => !item.parent);
        },
        selLangsForService(serviceProp) {
            return this.allLanguages.filter(item => {
                const { service } = this.requestDetails;
                if(service.languages[0][serviceProp].indexOf(item.symbol) !== -1) {
                    return item;
                }
            })
        },
        getTargetLanguages(langs) {
            const engSymbols = ["EN", "EN-GB", "EN-US"];
            if(engSymbols.indexOf(this.selectedSource.symbol) !== -1) {
                return langs;
            }
            return langs.filter(item => engSymbols.indexOf(item.symbol) !== -1);
        }
    },
    computed: {
        ...mapGetters({
            requestDetails: "getRequestQuoteDetails"
        }),
        isSource() {
            return this.requestDetails.service && this.requestDetails.service.languageForm === 'Duo'
                || !this.requestDetails.service;
        },
        sourceLanguages() {
            let result = this.allLangsWithDialects;
            if(this.requestDetails.service) {
                result = this.selLangsForService('source');
            }
            return result;
        },
        targetLanguages() {
            let result = this.allLangsWithDialects;
            if(this.requestDetails.service) {
                result = this.selLangsForService('target');
                if(this.selectedSource.lang !== 'Select') {
                    result = this.getTargetLanguages(result);
                }
            }
            return result;
        },
        selectedSource() {
            return this.requestDetails.sourceLanguage || {lang: "Select"};
        },
        selectedTargets() {
            return this.requestDetails.targetLanguages || [];
        }
    },
    components: {
        SectionTitle,
        LangsMenu
    },
    created() {
        this.getLanguages();
    }
}
</script>

<style lang="scss" scoped>

.quote-languages {
    margin-bottom: 30px;
    &__source {
        margin-bottom: 30px;
    }
    &__title {
        font-size: 12px;
        margin-bottom: 5px;
    }
}

</style>
