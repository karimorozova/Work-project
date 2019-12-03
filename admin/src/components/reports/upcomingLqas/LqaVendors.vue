<template lang="pug">
    .lqa-vendors
        .lqa-vendors__filters
            Filters(
                :isAddVendor="false"
                :isTarget="false"
                :languages="allXtrfLangs"
                :industryFilter="industryFilter"
                :tierFilter="tierFilter"
                :lqaFilter="lqaFilter"
                :nameFilter="nameFilter"
                @setNameFilter="(e) => setFilter(e, 'nameFilter')"
                @setIndustryFilter="(e) => setFilter(e, 'industryFilter')"
                @setTierFilter="(e) => setFilter(e, 'tierFilter')"
                @setLqaFilter="(e) => setFilter(e, 'lqaFilter')"
            )
        .lqa-vendors__table
            Table(:vendorsData="allVendors" @selectVendor="selectVendor")
        .lqa-vendors__form(v-if="isForm")
            VendorLqaForm(:vendorData="selectedVendor" @closeForm="closeForm"  @saveVendorLqa="saveVendorLqa")
</template>

<script>
import Filters from "../Filters";
import Table from "./Table";
import VendorLqaForm from "./VendorLqaForm";
import { mapActions } from "vuex";

export default {
    props: {
        allXtrfLangs: {type: Array, default: () => []}
    },
    data() {
        return {
            reportData: [],
            nameFilter: "",
            industryFilter: "All",
            tierFilter: "All",
            lqaFilter: "All",
            isForm: false,
            selectedVendor: null
        }
    },
    methods: {
        ...mapActions(["alertToggle"]),
        async getReport() {
            try {
                const result = await this.$http.post("/reportsapi/xtrf-lqa-report", { filters: this.filters });
                this.reportData = result.body;
            } catch(err) {
                this.alertToggle({message: "Error on getting LQA report", isShow: true, type: "error"});
            }
        },
        async setFilter({value}, prop) {
            this[prop] = value;
            await this.getReport();
        },
        selectVendor({vendor}) {
            this.selectedVendor = vendor;
            this.isForm = true;
        },
        closeForm() {
            this.isForm = false;
        },
        async saveVendorLqa({vendorData}) {
            try {
                await this.$http.post("/reportsapi/xtrf-vendor-lqa", { vendorData });
                await this.getReport();
            } catch(err) {
                this.alertToggle({message: "Error on updating Vendor's LQA", isShow: true, type: "error"});
            } finally {
                this.closeForm();
            }
        }
    },
    computed: {
        allVendors() {
            let result = [];
            if(this.reportData.length) {
                for(let report of this.reportData) {
                    let vendors = [...report.financeVendors, ...report.gamingVendors];
                    vendors = vendors.filter(item => item.isLqa1 || item.isLqa2 || item.isLqa3);
                    result.push(...vendors);
                }
            }
            return result;
        },
        filters() {
            let result = {nameFilter: this.nameFilter};
            if(this.industryFilter !== 'All') {
                result.industryFilter = this.industryFilter;
            }
            if(this.tierFilter !== 'All') {
                result.tierFilter = +this.tierFilter;
            }
            if(this.lqaFilter !== 'All') {
                result.lqaFilter = this.lqaFilter;
            }
            return result;
        }
    },
    components: {
        Filters,
        Table,
        VendorLqaForm
    },
    mounted() {
        this.getReport();
    }
}
</script>

<style lang="scss" scoped>

.lqa-vendors {
    box-sizing: border-box;
    padding: 40px 40px 0 40px;
    position: relative;
    &__form {
        width: 70%;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }
}

</style>
