<template lang="pug">
.all-vendors
    .all-vendors__table
        VendorFilters(
            :industryFilter="industryFilter"
            :leadFilter="leadFilter"
            @setNameFilter="(option) => setFilter(option, 'nameFilter')"
            @setStatusFilter="(option) => setFilter(option, 'statusFilter')"
            @setLeadFilter="(option) => setFilter(option, 'leadFilter')"
            @setIndustryFilter="(option) => setFilter(option, 'industryFilter')"
        )
        .all-vendors__new-vendor
            input.all-vendors__add-vendor(type="submit" value="Add vendor" @click="addVendor")
        VendorsTable(
            :nameFilter="nameFilter"
            :industryFilter="industryFilter"
            :leadFilter="leadFilter"
            :statusFilter="statusFilter"
        )
</template>

<script>
import VendorsTable from "./VendorsTable";
import VendorFilters from "./VendorFilters";

export default {
    props: {
        statusFilter: {
            type: String
        }
    },
    data() {
        return {
            industryFilter: {name: "All"},
            leadFilter: "All",
            nameFilter: ""
        }
    },
    methods: {
        addVendor() {
            this.$router.push("/vendors/new-vendor");
        },
        setFilter({option}, prop) {
            this[prop] = option;
        }
    },
    components: {
        VendorsTable,
        VendorFilters
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.all-vendors {
  position: relative;
  margin-top: 40px;
  width: 100%;
    &__table {
        padding: 20px;
        box-sizing: border-box;
        max-width: 1200px;
        width: calc(100% - 80px);
        min-height: 150px;
        box-shadow: 0 0 10px $brown-shadow;
    }
    &__new-vendor {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 20px;
    }
    &__add-vendor {
        width: 190px;
        height: 26px;
        color: $white;
        font-size: 14px;
        border-radius: 10px;
        -webkit-box-shadow: 0 3px 5px $brown-shadow;
        box-shadow: 0 3px 5px $brown-shadow;
        background-color: $orange;
        border: 1px solid $orange;
        cursor: pointer;
        &:hover {
            box-shadow: 0 0 10px $brown-shadow;
        }
    }
}
</style>
