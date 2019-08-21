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
    .tasks-langs__item
        .tasks-langs__title Quantity:
            Asterisk(:customStyle="asteriskStyle")
        .tasks-langs__input
            input.tasks-langs__quantity(type="number" min="1" max="1000" @change="setQuantity" @input="setLimit")
</template>

<script>
import LanguagesSelect from "@/components/LanguagesSelect";
import Asterisk from "@/components/Asterisk";
import SelectSingle from "@/components/SelectSingle";
import { mapGetters, mapActions } from "vuex";

export default {
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
            storeProject: "storeProject",
            setDataValue: "setTasksDataValue",
            alertToggle: "alertToggle"
        }),
        setLanguage({lang}) {
            this.selectedLang = lang;
            this.setDataValue({prop: "target", value: lang});
            this.setPackage({option: ""});
            this.setPossiblePairPackages(lang.symbol);
        },
        setPackage({option}) {
            this.selectedPackage = option;
            this.setDataValue({prop: "packageSize", value: option});
        },
        setQuantity(e) {
            this.setDataValue({prop: "qantity", value: e.target.value});
        },
        setLimit(e) {
            if(e.target.value.length > 4) {
                e.target.value = e.target.value.slice(0,4);
            }
        },
        async getAvailableLanguages() {
            try {
                const langPairs = await this.$http.get(`/pm-manage/language-pairs?customerId=${this.currentProject.customer._id}`);;
                this.setLanguages(langPairs.data.monoRates);
            } catch(err) {
                this.alertToggle({message: "Error on getting customer language pairs", isShow: true, type: "error"});
            }
        },
        setLanguages(langPairs) {
            this.languagePairs = langPairs.filter((item, index, self) => {
                return self.map(elem => elem.target.lang + elem.packageSize).indexOf(item.target.lang + item.packageSize) === index;
            });
            const englishPair = this.languagePairs.find(item => item.target.symbol === 'EN-GB');
            this.targets = this.languagePairs.map(item => item.target);
            if(this.targets.length === 1) {
                this.setLanguage({lang: this.targets[0]});
            }
            this.setDefaultPackages(englishPair);
        },
        setDefaultPackages(eng) {
            if(!eng) {
                this.packages = this.languagePairs.map(pair => pair.packageSize).filter((item, index, self) => {
                    return self.indexOf(item) === index;
                });
                if(this.packages.length === 1) {
                    this.setPackage({option: this.packages[0]});
                }
            } else {
                this.setPossiblePairPackages(eng.symbol);
            }
        },
        setPossiblePairPackages(symbol) {
            this.packages = this.languagePairs.filter(item => item.target.symbol === symbol).map(pair => pair.packageSize);
            if(this.packages.length === 1) {
                this.setPackage({option: this.packages[0]});
            }
        }
    },
    computed: {
        ...mapGetters({
            currentProject: "getCurrentProject",
            tasksData: "getTasksData"
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
@import "../../../assets/scss/colors.scss";

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
    &__input {
        width: 191px;
    }
    &__quantity {
        height: 28px;
        box-sizing: border-box;
        padding: 0 5px;
        outline: none;
        color: $main-color;
        border: 1px solid $main-color;
        border-radius: 5px; 
        &::-webkit-inner-spin-button,
        &::-webkit-outer-spin-button {
            -webkit-appearance: none; 
            margin: 0;
        }
    }
}

</style>
