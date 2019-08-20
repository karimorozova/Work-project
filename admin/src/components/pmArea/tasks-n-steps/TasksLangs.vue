<template lang="pug">
.tasks-langs
    .tasks-langs__item
        .tasks-langs__title Language:
            Asterisk(:customStyle="asteriskStyle")
        .tasks-langs__drop-menu
            LanguagesSelect(
                placeholder="Language"
                :externalLanguages="targets"
                :single='true'
                :selectedLangs="selectedLang ? [selectedLang.symbol] : []"
                @chosenLang="setLanguage"
            )
    .tasks-langs__item
        .tasks-langs__title Package:
            Asterisk(:customStyle="asteriskStyle")
        .tasks-langs__drop-menu
            SelectSingle(
                placeholder="Package"
                :options="packages"
                :selectedOption="selectedPackage"
                @chooseOption="setPackage"
            )
            
</template>

<script>
import LanguagesSelect from "@/components/LanguagesSelect";
import Asterisk from "@/components/Asterisk";
import SelectSingle from "@/components/SelectSingle";
import { mapGetters, mapActions } from "vuex";

export default {
    props: {

    },
    data() {
        return {
            targets: [],
            packages: [],
            selectedLang: null,
            selectedPackage: "",
            languagePairs: [],
            asteriskStyle: {top: '-4px'},
        }
    },
    methods: {
        ...mapActions({
            storeProject: "storeProject"
        }),
        setLanguage({lang}) {
            this.selectedLang = lang;
            this.selectedPackage = "";
            this.setPossiblePairPackages(lang.symbol);
        },
        setPackage({option}) {
            this.selectedPackage = option;
        },
        async getAvailableLanguages() {
            try {
                const langPairs = await this.$http.get(`/pm-manage/language-pairs?customerId=${this.currentProject.customer._id}`);;
                this.setLanguages(langPairs.data.monoRates);
            } catch(err) {

            }
        },
        setLanguages(langPairs) {
            this.languagePairs = langPairs.filter((item, index, self) => {
                return self.map(elem => elem.target.lang + elem.packageSize).indexOf(item.target.lang + item.packageSize) === index;
            });
            const englishPair = this.languagePairs.find(item => item.target.symbol === 'EN-GB');
            const symbol = englishPair ? englishPair.source.symbol : "";
            this.targets = this.languagePairs.map(item => item.target);
            this.$emit('setMonoLanguage', { symbol });
            this.setDefaultPackages(englishPair);
        },
        setDefaultPackages(eng) {
            if(!eng) {
                this.packages = this.languagePairs.map(pair => pair.packageSize).filter((item, index, self) => {
                    return self.indexOf(item) === index;
                });
                if(this.packages.length === 1) {
                    this.selectedPackage = this.packages[0];
                }
            } else {
                this.setPossiblePairPackages(eng.symbol);
            }
        },
        setPossiblePairPackages(symbol) {
            this.packages = this.languagePairs.filter(item => item.target.symbol === symbol).map(pair => pair.packageSize);
            if(this.packages.length === 1) {
                this.selectedPackage = this.packages[0];
            }
        }
    },
    computed: {
        ...mapGetters({
            currentProject: "getCurrentProject"
        })
    },
    created() {
        this.getAvailableLanguages();
    },
    components: {
        LanguagesSelect,
        SelectSingle,
        Asterisk
    }
}
</script>

<style lang="scss" scoped>

.tasks-langs {
    margin-bottom: 20px;
    &__title {
        position: relative;
        font-size: 14px;
    }
    &__item {
        width: 55%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
    }
    &__drop-menu {
        position: relative;
        width: 191px;
        height: 28px;
    }
}

</style>
