<template lang="pug">
    .vendors-data
        .vendors-data__title All Vendors
        AllVendorsInfo(v-if="isAllVendorsShow"
            statusExcluded="any"
            :statuses="statuses"
            :isVendorAddExist="isVendorAddExist"
        )
</template>

<script>
import AllVendorsInfo from "./AllVendorsInfo";
import { mapGetters, mapActions } from "vuex";

export default {
    data() {
        return {
            isAllVendorsShow: true,
            isVendorAddExist: true,
            statuses: ["All", "Active", "Inactive"],
            vendors: [],
            vendorData: false,
        }
    },
    methods: {
        ...mapActions({
            alertToggle: "alertToggle",
            vendorsSetting: "vendorsSetting",
            setCurrentVendor: "setCurrentVendor"
        })
    },
    components: {
        AllVendorsInfo
    },
    computed: {
        ...mapGetters({
            vuexVendors: "getVendors",
            currentVendor: "getCurrentVendor"
        })
    }
}
</script>

<style lang="scss" scoped>

.vendors-data {
    position: relative;
    margin-left: 40px;
    margin-top: 40px;
    &__title {
        font-size: 22px;
        margin-bottom: 20px;
    }
}

</style>