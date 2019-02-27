<template lang="pug">
.rates-filters
    .rates-filters__item(v-if="form !== 'Mono'")
        label.rates-filters__title Source Language
        .rates-filters__drop-menu
            SelectMulti(:selectedOptions="sourceSelect" :addAll="true" @chooseOptions="setSourceFilter")
    .rates-filters__item
        label.rates-filters__title(v-if="form !== 'Mono'") Target Language
        label.rates-filters__title(v-else) Language
        .rates-filters__drop-menu
            SelectMulti(:selectedOptions="targetSelect" :addAll="true" @chooseOptions="setTargetFilter")
    .rates-filters__item
        label.rates-filters__title Industry
        .rates-filters__drop-menu
            MultiVendorIndustrySelect(:selectedInd="industryFilter" @chosenInd="setIndustryFilter")
    .rates-filters__item
        label.rates-filters__title Service
        .rates-filters__drop-menu
            SelectMulti(:form="form" :selectedOptions="serviceSelect" @chooseOptions="setServiceFilter")
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
        targetSelect: {
            type: Array,
            default: () => []
        },
        industryFilter: {
            type: Array,
            default: () => []
        },
        serviceSelect: {
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
            console.log(option);
        },
        setTargetFilter({option}) {
            console.log(option);
        },
        setIndustryFilter({industry}) {
            console.log(industry);           
        },
        setServiceFilter({option}) {
            console.log(option);
        }
    },
    computed: {
        filteredServices() {
            return this.serviceSelect.map(item => item.title);
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
}
</style>