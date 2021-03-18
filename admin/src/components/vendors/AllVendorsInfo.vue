<template lang="pug">
.all-vendors
    .all-vendors__table
        VendorFilters(
            :industryFilter="industryFilter"
            :leadFilter="leadFilter"
            :sourceLangs="sourceFilter"
            :targetLangs="targetFilter"
            :step="stepFilter.title"
            @setNameFilter="(option) => setFilter(option, 'nameFilter')"
            @setStatusFilter="(option) => setFilter(option, 'statusFilter')"
            @setLeadFilter="(option) => setFilter(option, 'leadFilter')"
            @setIndustryFilter="(option) => setFilter(option, 'industryFilter')"
            @removeLangFilter="removeLangFilter"
            @addLangFilter="addLangFilter"
            @setAllLangs="setAllLangs"
            @setStepFilter="setStepFilter"
        )
        .all-vendors__new-vendor
            input.all-vendors__add-vendor(type="submit" value="Add vendor" @click="addVendor")
        VendorsTable(
            :nameFilter="nameFilter"
            :industryFilter="industryFilter"
            :sourceFilter="sourceFilter"
            :targetFilter="targetFilter"
            :statusFilter="statusFilter"
            :stepFilter="stepFilter"
            @bottomScrolled="bottomScrolled"
            @update="update"
        )
</template>

<script>
import VendorsTable from "./VendorsTable";
import VendorFilters from "./VendorFilters";
import { mapActions, mapGetters } from "vuex";

export default {
    props: {
        statusFilter: {
            type: String
        }
    },
    data() {
        return {
            industryFilter: {name: "All"},
            sourceLangs: [{symbol: "All"}],
            targetLangs: [{symbol: "All"}],
            stepFilter: {title: "All"},
            nameFilter: "",
            isDataRemain: true,
            lastId: ""
        }
    },
    methods: {
        ...mapActions(["setFilteredVendors", "alertToggle"]),
        scrollBodyToTop() {
            let tbody = document.querySelector(".vendors-table__body");
            tbody.scrollTop = 0;
        },
        async bottomScrolled() {
            if(this.isDataRemain) {
                const result = await this.$http.post('/vendorsapi/filtered-vendors', {filters: this.filters});
                this.setFilteredVendors([...this.vendors, ...result.body]);
                this.isDataRemain = result.body.length === 25;
                this.lastId = result.body && result.body.length ? result.body[result.body.length - 1]._id : "";
            }
        },
        async update({status}) {
            if(this.statusFilter !== status) {
                await this.getVendors();
            }
        },
        addVendor() {
            this.$router.push("/vendors/new-vendor");
        },
        async setFilter({option}, prop) {
            this[prop] = option;
            await this.getVendors();
        },
        async setStepFilter({step}) {
            this.stepFilter = step;
            await this.getVendors();
        },
        async setAllLangs({prop}) {
            this[prop] = [{symbol: "All"}];
            await this.getVendors();
        },
        async removeLangFilter({prop, position}) {
            this[prop].splice(position, 1);
            if(this[prop].length === 0) {
                this[prop] = [{symbol: "All"}];
            }
            await this.getVendors();
        },
        async addLangFilter({prop, lang}) {
            const currentProp = prop === 'sourceLangs' ? 'sourceFilter' : 'targetFilter'
            if(this[currentProp].indexOf('All') !== -1) {
                this[prop] = [];
            }
            this[prop].push(lang);
            await this.getVendors();
        },
        async getVendors() {
            this.lastId = "";
            this.isDataRemain = true;
            try {
                const result = await this.$http.post('/vendorsapi/filtered-vendors', {filters: this.filters});
                this.setFilteredVendors(result.body);
                this.lastId = result.body && result.body.length ? result.body[result.body.length - 1]._id : "";
                this.scrollBodyToTop();
            } catch(err) {
                this.alertToggle({message: "Error on getting vendors", isShow: true, type: "error"});
            }
        },
    },
    computed: {
        ...mapGetters({
            vendors: "getFilteredVendors"
        }),
        filters() {
            return {
                nameFilter: this.nameFilter,
                stepFilter: this.stepFilter,
                statusFilter: this.statusFilter,
                sourceFilter: this.sourceLangs.map(item => item._id),
                targetFilter: this.targetLangs.map(item => item._id),
                industryFilter: this.industryFilter,
                lastId: this.lastId
            }
        },
        sourceFilter() {
            return this.sourceLangs.map(item => item.symbol);
        },
        targetFilter() {
            return this.targetLangs.map(item => item.symbol);
        }
    },
    components: {
        VendorsTable,
        VendorFilters
    },
    created() {
        this.getVendors();
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.all-vendors {
  position: relative;
  width: 100%;
    &__table {
        padding: 20px;
        box-sizing: border-box;
        min-height: 150px;
        box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
    }
    &__new-vendor {
        display: flex;
        margin-bottom: 20px;
    }
      &__add-vendor {
        min-width: 120px;
        padding: 0 24px 0 24px;
        height: 34px;
        color: $white;
        font-size: 14px;
        border-radius: 7px;
        background-color: $orange;
        border: none;
        transition: .1s ease;
        outline: none;
        letter-spacing: 0.2px;

        &:hover {
          cursor: pointer;
          box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15);
        }

        &:active {
          transform: scale(.98);
        }
    }
}
</style>
