<template lang="pug">
.v-filters
    .v-filters__col.v-filters_width-21
        .v-filters__item.v-filters_margin-bottom-20
            label.v-filters__filter-title Name
            input.v-filters__input-field(type="text" placeholder="Vendor Name" v-model="nameFilter" @keyup="filterByName")
        .v-filters__item
            label.v-filters__filter-title Step
            .v-filters__drop-menu
                SelectSingle(:selectedOption="step" :options="stepNames" @chooseOption="setStepFilter")
    .v-filters__col.v-filters_width-25
        .v-filters__item.v-filters_margin-bottom-20
            label.v-filters__filter-title Source Language
            .v-filters__drop-menu.v-filters_index-20
                LanguagesSelect(:selectedLangs="sourceLangs" @chosenLang="({lang}) => addLang({lang}, 'sourceFilter')" customClass="vendors-filter" :addAll="true")
        .v-filters__item
            label.v-filters__filter-title Target Language
            .v-filters__drop-menu
                LanguagesSelect(:selectedLangs="targetLangs" @chosenLang="({lang}) => addLang({lang}, 'targetFilter')" customClass="vendors-filter" :addAll="true")
    .v-filters__col.v-filters_width-22
        .v-filters__item
            label.v-filters__filter-title Industry
            .v-filters__drop-menu
                VendorIndustrySelect(:isAllExist="isAllForIndustryExist" :selectedInd="industryFilter" @chosenInd="chosenIndustry")
        
</template>

<script>
import VendorIndustrySelect from "./VendorIndustrySelect";
import LanguagesSelect from "@/components/LanguagesSelect";
import SelectSingle from "@/components/SelectSingle";
import { mapActions } from "vuex";

export default {
    props: {
        statusFilter: {
            type: String
        },
        industryFilter: {
            type: [Object, String]
        },
        sourceLangs: {
            type: Array,
            default: () => []
        },
        targetLangs: {
            type: Array,
            default: () => []
        },
        statuses: {
            type: Array,
            default: () => []
        },
        step: {
            type: String
        }
    },
    data() {
        return {
            nameFilter: "",
            isAllForIndustryExist: true,
            steps: [],
            typingTimer: "",
            doneTypingInterval: 800
        }
    },
    methods: {
        ...mapActions({
            alertToggle: "alertToggle"
        }),
        setStepFilter({option}) {
            if(option === 'All') {
                return this.$emit("setStepFilter", { step: {title: 'All'} });    
            }
            const step = this.steps.find(item => item.title === option);
            this.$emit("setStepFilter", { step });
        },
        addLang({lang}, filter) {
            const prop = (filter === 'sourceFilter') ? 'sourceLangs' : 'targetLangs';
            if(lang.symbol === 'All') {
                return this.$emit('setAllLangs', { prop });
            }
            const position = this[prop].indexOf(lang.symbol);
            if(position != -1) {
                this.$emit('removeLangFilter', {prop, position})
            } else {
                this.$emit('addLangFilter', {prop, lang})
            }
        },
        chosenIndustry({industry}) {
            this.$emit("setIndustryFilter", { option: industry });
        },
        async getSteps() {
            try {
                const result = await this.$http.get("/api/steps");
                this.steps = result.body.filter(item => item.isActive);
            } catch(err) {
                this.alertToggle({message: "Error on getting steps", isShow: true, type: "error"});
            }
        },
        filterByName(e) {
            const { value } = e.target;
            clearTimeout(this.typingTimer);
            this.typingTimer = setTimeout(doneTyping, this.doneTypingInterval);
            const vm = this;
            function doneTyping () {
                vm.$emit("setNameFilter", { option: value })
            }
        }
    },
    computed: {
        stepNames() {
            let result = this.steps.map(item => item.title);
            result.unshift("All");
            return result;
        }
    },
    components: {
        VendorIndustrySelect,
        LanguagesSelect,
        SelectSingle
    },
    created() {
        this.getSteps();
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.v-filters {
    width: 100%;
    display: flex;
    justify-content: space-between;
    &__col {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        margin-bottom: 20px;
    }
    &__filter-title {
        margin-bottom: 0;
        margin-right: 10px;
        font-size: 14px;
    }
    &__item {
        width: 100%;
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: center;
        ::-webkit-input-placeholder {
            opacity: 0.5;
        }
    }
    &__input-field {
        box-sizing: border-box;
        color: $main-color;
        width: 191px;
        height: 30px;
        padding-left: 5px;
        border: 1px solid $main-color;
        border-radius: 5px;
        outline: none;
        font-size: 14px;
    }
    &__drop-menu {
        position: relative;
        width: 191px;
        height: 31px;
        box-sizing: border-box;
        z-index: 10;
    }
    &_index-20 {
        z-index: 20;
    }
    &_width-21 {
        width: 21%;
        min-width: 240px;
    }
    &_width-25 {
        width: 25%;
        min-width: 308px;
    }
    &_width-22 {
        width: 22%;
        min-width: 255px;
    }
    &_margin-bottom-20 {
        margin-bottom: 20px;
    }
}

</style>
