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
        .lqa-vendors__table(v-if="this.reportData.length")
          Table(:vendorsData="allVendors" @selectVendor="selectVendor")
        .lqa-vendors__form(v-if="isForm")
          VendorLqa(
                :vendorData="selectedVendor"
                :languages="languages"
                @closeForm="closeForm"
                @saveVendorLqa="saveVendorLqa"
                :uploadForm="true"
            )
</template>

<script>
import Filters from "../Filters";
import Table from "./Table";
import VendorLqa from "../../vendors/VendorLqa";
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
            selectedVendor: null,
            languages: null,
        }
    },
    methods: {
        ...mapActions(["alertToggle"]),
        async getReport() {
            try {
                const result = await this.$http.post("/reportsapi/xtrf-upcoming-lqa-report", { filters: this.filters });
                if(this.filters.tierFilter){
                     this.reportData = {
                       financeReports: Object.values(result.body.financeReports)
                         .filter(item => item.tier === this.filters.tierFilter),
                       gamingReports : Object.values(result.body.gamingReports)
                         .filter(item => item.tier === this.filters.tierFilter)
                     };
                }else{
                    this.reportData = result.body
                }
            } catch(err) {
                this.alertToggle({message: "Error on getting LQA report", isShow: true, type: "error"});
            }
        },
        async getLanguages(){
            try {
                const languages = await this.$http.get("/api/languages");
                this.languages = languages.data;
            } catch (error) {
                this.alertToggle({message: "Error on getting Languages", isShow: true, type: "error"});
            }
        },
        async setFilter({value}, prop) {
            this[prop] = value;
            await this.getReport();
        },
      selectVendor ({ vendor }) {
        this.selectedVendor = {vendor};
        this.isForm = true;
      },
        closeForm() {
            this.isForm = false;
        },
        async saveVendorLqa({vendorData}) {
            try {
                console.log(vendorData);
                // await this.$http.post("/reportsapi/xtrf-vendor-lqa", { vendorData });
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
          // let financeObj = this.reportData.financeReports;
          // let gamingObj = this.reportData.gamingReports
          // changeObject(financeObj, 'Finance');
          // changeObject(gamingObj, 'IGaming');
          // joinArrays(financeObj);
          // joinArrays(gamingObj);

          return this.reportData;

          function changeObject (obj, industry) {
            for (let key in obj) {
              obj[key].industry = industry;
            }
          }

          function joinArrays (obj) {
            for (let key in obj) {
                    result.push(obj[key])
                }
            }
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
      VendorLqa
    },
    mounted() {
        this.getReport();
        this.getLanguages();
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
