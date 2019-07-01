<template lang="pug">
.filters
    .filters__item
        label.filters__filter-title Name
        input.filters__input-field(type="text" placeholder="Vendor Name" v-model="nameFilter" @input="filterByName")
    .filters__item
        label.filters__filter-title Industry
        .filters__drop-menu
            VendorIndustrySelect(:isAllExist="isAllForIndustryExist" :selectedInd="industryFilter" @chosenInd="chosenIndustry")
    .filters__item(v-if="statusExcluded !== 'Potential'")
        label.filters__filter-title Status
        .filters__drop-menu
            VendorStatusSelect(:selectedStatus="statusFilter" isAllExist="yes" @chosenStatus="chosenStatus")
    .filters__item
        label.filters__filter-title Lead Source
        .filters__drop-menu
            VendorLeadsourceSelect(:selectedLeadsource="leadFilter" @chosenLeadsource="chosenLead")
</template>

<script>
import VendorIndustrySelect from "./VendorIndustrySelect";
import VendorLeadsourceSelect from "./VendorLeadsourceSelect";
import VendorStatusSelect from "./VendorStatusSelect";

export default {
    props: {
        statusFilter: {
            type: String
        },
        industryFilter: {
            type: [Object, String]
        },
        leadFilter: {
            type: String
        },
        statusExcluded: {
            type: String
        },
        statuses: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            nameFilter: "",
            isAllForIndustryExist: true,
        }
    },
    methods: {
        filterByName() {
            this.$emit("setNameFilter", { option: this.nameFilter })
        },
        chosenStatus({option}) {
            this.$emit("setStatusFilter", { option })
        },
        chosenLead({option}) {
            this.$emit("setLeadFilter", { option });
        },
        chosenIndustry({industry}) {
            this.$emit("setIndustryFilter", { option: industry });
        }
    },
    components: {
        VendorIndustrySelect,
        VendorLeadsourceSelect,
        VendorStatusSelect
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.filters {
    width: 100%;
    margin-bottom: 20px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    @media (max-width: 1300px) {
        margin-bottom: 0;
    }
    &__filter-title {
        margin-bottom: 0;
        margin-right: 10px;
        font-size: 14px;
    }
    &__item {
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: center;
        ::-webkit-input-placeholder {
            opacity: 0.5;
        }
        @media (max-width: 1300px) {
            margin-bottom: 20px;
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
        z-index: 1;
    }
}

</style>
