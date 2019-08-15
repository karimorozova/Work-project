<template lang="pug">
.rates-filters
    .rates-filters__item(v-if="form !== 'Mono'")
        label.rates-filters__title Source Language
        .rates-filters__drop-menu
            LanguagesSelect(:selectedLangs="sourceSelect" :addAll="true" @chosenLang="setSourceFilter")
    .rates-filters__item
        label.rates-filters__title(v-if="form !== 'Mono'") Target Language
        label.rates-filters__title(v-else) Language
        .rates-filters__drop-menu
            LanguagesSelect(:selectedLangs="targetSelect" :addAll="true" @chosenLang="setTargetFilter")
    .rates-filters__item(v-if="form === 'Mono'")
        label.rates-filters__title Package
        .rates-filters__drop-menu
            SelectMulti(:options="packages" :selectedOptions="packageFilter" @chooseOptions="setPackageFilter")
    .rates-filters__item
        label.rates-filters__title Industry
        .rates-filters__drop-menu
            IndustrySelect(:entity="entity" :selectedInd="industryFilter" :filteredIndustries="filterIndustry" @chosenInd="setIndustryFilter")
    .rates-filters__item
        label.rates-filters__title Steps
        .rates-filters__drop-menu
            SelectMulti(:options="steps" :selectedOptions="selectedStepsTitles" @chooseOptions="setStepsFilter")
</template>

<script>
import LanguagesSelect from "../LanguagesSelect";
import IndustrySelect from "../IndustrySelect";
import SelectMulti from "../SelectMulti";

export default {
    props: {
        entity: {
            type: Object
        },
        form: {
            type: String
        },
        sourceSelect: {
            type: Array
        },
        targetSelect: {
            type: Array
        },
        industryFilter: {
            type: Array
        },
        selectedSteps: {
            type: Array
        },
        packageFilter: {
            type: Array
        },
        steps: {
            type: Array
        },
        packages: {
            type: Array
        }
    },
    methods: {
        setSourceFilter({lang}) {
            this.$emit('setSourceFilter', {lang});
        },
        setTargetFilter({lang}) {
            this.$emit('setTargetFilter', {lang});
        },
        setIndustryFilter({industry}) {
            this.$emit('setIndustryFilter', {industry});
        },
        setStepsFilter({option}) {
            this.$emit('setStepsFilter', {option});
        },
        setPackageFilter({option}) {
            this.$emit('setPackageFilter', {option});
        }
    },
    computed: {
        selectedStepsTitles() {
            return this.selectedSteps.length ? this.selectedSteps.map(item => item.title) : [];
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
    },
    components: {
        LanguagesSelect,
        IndustrySelect,
        SelectMulti
    }
}
</script>

<style lang="scss" scoped>
.rates-filters {
    width: 100%;
    display: flex;
    justify-content: space-between;
    &__item {
        width: 23%;
        height: 50px;
        display: flex;
        flex-direction: column;
    }
    &__title {
        font-size: 12px;
        margin-bottom: 0;
    }
    &__drop-menu {
        position: relative;
        width: 100%;
        z-index: 10;
    }
}
</style>
