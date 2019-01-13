<template lang="pug">
.all-vendors
    .all-vendors__table
        VendorFilters(
            :statusExcluded="statusExcluded"
            :statusFilter="statusFilter"
            :statuses="statuses"
            :industryFilter="industryFilter"
            :leadFilter="leadFilter"
            @setNameFilter="(option) => setFilter(option, 'nameFilter')"
            @setStatusFilter="(option) => setFilter(option, 'statusFilter')"
            @setLeadFilter="(option) => setFilter(option, 'leadFilter')"
            @setIndustryFilter="(option) => setFilter(option, 'industryFilter')"
        )
        .all-vendors__new-vendor(v-if="isVendorAddExist")
            input.all-vendors__add-vendor(type="submit" value="Add vendor" @click="addVendor")
        VendorsTable(
            :nameFilter="nameFilter"
            :industryFilter="industryFilter"
            :leadFilter="leadFilter"
            :statusFilter="statusFilter"
            :statusExcluded="statusExcluded"
            @showVendorDetails="showVendorDetails"
        )
</template>

<script>
import VendorsTable from "./VendorsTable";
import Vendordetails from "./Vendordetails";
import VendorFilters from "./VendorFilters";
import { mapGetters, mapActions } from "vuex";

export default {
    props: {
        statusExcluded: {
            type: String
        },
        statuses: {
            type: Array
        },
        isVendorAddExist: {
            type: Boolean
        }
    },
    data() {
        return {
            statusFilter: "",
            industryFilter: "",
            leadFilter: "",
            nameFilter: ""
        }
    },
    methods: {
        showVendorDetails({vendor}) {
            this.isVendorDetails = true;
            this.storeCurrentVendor(vendor);
        },
        addVendor() {
            this.$router.push("/new-vendor");
        },
        closeVendorDetails() {
            this.isVendorDetails = false;
            this.storeCurrentVendor({});
        },
        setFilter({option}, prop) {
            this[prop] = option;
        },
        ...mapActions({
            storeCurrentVendor: "storeCurrentVendor"
        })
    },
    computed: {
        ...mapGetters({
            currentVendor: "getCurrentVendor"
        })
    },
    components: {
        VendorsTable,
        Vendordetails,
        VendorFilters
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.all-vendors {
  position: relative;
  margin: 40px 40px 40px 0;
    &__table {
        padding: 20px;
        width: 1100px;
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
