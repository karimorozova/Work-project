<template lang="pug">
.rates-filters
    .rates-filters__item(v-if="form !== 'mono'")
        label.rates-filters__title Source Language
        .rates-filters__drop-menu
            SelectMulti(:selectedOptions="sourceSelect" :options="sourceLanguages" @chooseOptions="setSourceFilter" customClass="filters")
    .rates-filters__item
        label.rates-filters__title(v-if="form !== 'mono'") Target Language
        label.rates-filters__title(v-else) Language
        .rates-filters__drop-menu
            SelectMulti(:selectedOptions="targetSelect" :options="targetLanguages" @chooseOptions="setTargetFilter" customClass="filters")
    .rates-filters__item(v-if="form === 'mono'")
        label.rates-filters__title Packages
        .rates-filters__drop-menu
            SelectMulti(:selectedOptions="packageSelect" :options="packages" @chooseOptions="setPackageFilter" customClass="filters")
    .rates-filters__item
        label.rates-filters__title Industry
        .rates-filters__drop-menu
            MultiVendorIndustrySelect(:selectedInd="industriesSelect" :filteredIndustries="industryFilter" :parentIndustries="industriesList" @chosenInd="setIndustryFilter")
    .rates-filters__item.rates-filters_no-display
        label.rates-filters__title Service
        .rates-filters__drop-menu
            SelectMulti(:selectedOptions="selectedSteps" :options="steps" @chooseOptions="setStepsFilter" customClass="filters")
</template>

<script>
import SelectSingle from "@/components/dropdowns/SelectSingle";
import MultiVendorIndustrySelect from "@/components/dropdowns/MultiVendorIndustrySelect";
import SelectMulti from "@/components/dropdowns/SelectMulti";

export default {
    props: {
        form: {
            type: String
        },
        sourceSelect: {
            type: Array,
            default: () => []
        },
        sourceLanguages: {
            type: Array,
            default: () => []
        },
        targetSelect: {
            type: Array,
            default: () => []
        },
        targetLanguages: {
            type: Array,
            default: () => []
        },
        industriesSelect: {
            type: Array,
            default: () => []
        },
        industryFilter: {
            type: Array,
            default: () => []
        },
        industriesList: {
            type: Array,
            default: () => []
        },
        selectedSteps: {
            type: Array,
            default: () => []
        },
        steps: {
            type: Array,
            default: () => []
        },
        packageSelect: {
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

        }
    },
    methods: {
        setSourceFilter({option}) {
            this.$emit("setSourceFilter", { option });
        },
        setTargetFilter({option}) {
            this.$emit("setTargetFilter", { option });
        },
        setIndustryFilter({industry}) {
            this.$emit("setIndustryFilter", { industry} );           
        },
        setStepsFilter({option}) {
            this.$emit("setStepsFilter", { option });
        },
        setPackageFilter({option}) {
            this.$emit("setPackageFilter", { option });
        }
    },
    computed: {
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
        SelectSingle,
        MultiVendorIndustrySelect,
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
    }
    &_no-display {
        display: none;
    }
}
</style>