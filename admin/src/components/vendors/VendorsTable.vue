<template lang="pug">
.vendors-table
    DataTable(
        :fields="fields"
        :tableData="filteredVendors"
        bodyClass="vendors-table__body"
        bodyRowClass="vendors-table_height-28"
    )
        template(slot="headerVendorName" slot-scope="{ field }")
            span.vendors-table__header-label {{ field.label }}
        template(slot="headerStatus" slot-scope="{ field }")
            span.vendors-table__header-label {{ field.label }}
        template(slot="headerLanguageCombination" slot-scope="{ field }")
            span.vendors-table__header-label {{ field.label }}
        template(slot="headerNative" slot-scope="{ field }")
            span.vendors-table__header-label {{ field.label }}
        template(slot="headerIndustry" slot-scope="{ field }")
            span.vendors-table__header-label {{ field.label }}
        template(slot="headerBasicRate" slot-scope="{ field }")
            span.vendors-table__header-label {{ field.label }}
        template(slot="headerTqi" slot-scope="{ field }")
            span.vendors-table__header-label {{ field.label }}
        template(slot="headerIcons" slot-scope="{ field }")
            span.vendors-table__header-label {{ field.label }}
        template(slot="vendorName" slot-scope="{ row }")
            span.vendors-table__data {{ getFullName(row) }}
        template(slot="status" slot-scope="{ row, index }")
            .vendors-table__drop-menu(v-if="currentEditingIndex === index")
                VendorStatusSelect(
                    :selectedStatus="row.status"
                    :parentInd="index"
                    @chosenStatus="changeStatus"
                )
            .vendors-table__status(v-else) {{ row.status }}
        template(slot="languageCombination" slot-scope="{ row }")
            span.vendors-table__data {{ getLanguageCombs(row) }}
        template(slot="native" slot-scope="{ row }")
            span.vendors-table__data {{ row.native.lang }}
        template(slot="industry" slot-scope="{ row }")
            img.vendors-table__industry-icon(v-for="industry in row.industry" :src="industry.icon") 
        template(slot="basicRate" slot-scope="{ row }")
            span.vendors-table__data {{ row.basicRate }}
        template(slot="tqi" slot-scope="{ row }")
            span.vendors-table__data {{ row.tqi }}
        template(slot="icons" slot-scope="{ row, index }")
            span.vendors-table__icons
                img.vendors-table__icon(@click="makeAction(index, key)" v-for="(icon, key) in icons" :src="icon.icon" :class="{'vendors-table_opacity': isIconClass(index, key)}")
</template>

<script>
import DataTable from "../DataTable";
import VendorStatusSelect from "./VendorStatusSelect";
import VendorLeadsourceSelect from "./VendorLeadsourceSelect";
import MultiVendorIndustrySelect from "./MultiVendorIndustrySelect";
import { mapGetters, mapActions } from "vuex";

export default {
    props: {
        filterName: {
            type: String
        },
        filterStatus: {
            type: String
        },
        industryFilter: {
            type: Array,
            default: () => ["All"]
        },
        filterLeadsource: {
            type: String
        }
    },
    data() {
        return {
            fields: [
                {label: "Vendor Name", headerKey: "headerVendorName", key: "vendorName", width: "13%"},
                {label: "Status", headerKey: "headerStatus", key: "status", width: "10%", padding: "0"},
                {label: "Language Combination", headerKey: "headerLanguageCombination", key: "languageCombination", width: "18%", cellClass: "vendors-table_scroll-y"},
                {label: "Native Language", headerKey: "headerNative", key: "native", width: "16%"},
                {label: "Industry", headerKey: "headerIndustry", key: "industry", width: "15%"},
                {label: "Basic Rate", headerKey: "headerBasicRate", key: "basicRate", width: "8%"},
                {label: "TQI", headerKey: "headerTqi", key: "tqi", width: "8%"},
                {label: "", headerKey: "headerIcons", key: "icons", width: "12%"},        
            ],
            icons: {
                save: {name: 'save', active: false, icon: require('../../assets/images/Other/save-icon-qa-form.png')},
                edit: {name: 'edit', active: true, icon: require('../../assets/images/Other/edit-icon-qa.png')},
                delete: {name: 'delete', active: true, icon: require('../../assets/images/Other/delete-icon-qa-form.png')}
            },
            currentEditingIndex: -1
        }
    },
    methods: {
        ...mapActions({
            alertToggle: "alertToggle",
            vendorsSetting: "vendorsSetting"
        }),
        getFullName(vendor) {
            return vendor.firstName + " " + vendor.surname;
        },
        getLanguageCombs(vendor) {
            return vendor.languageCombinations.map(item => {
                return item.source.symbol + " >> " + item.target.symbol + "; "
            }).filter((item, index, arr) => {
                return arr.indexOf(item) === index
            }).reduce((init, cur) => init + cur, "")
        },
        isIconClass(index, key) {
            if(this.currentEditingIndex !== index) {
                return key === 'save';
            }
            if(this.currentEditingIndex === index) {
                return key === 'edit'
            }
        },
        makeAction(index, key) {
            if(key === 'edit') {
                this.currentEditingIndex = index;
            }
            if(key === 'save') {
                this.currentEditingIndex = -1;
            }
        },
        changeStatus({status, index}) {
            console.log(stetus, index);
        },
        async getVendors() {
            if(!this.vuexVendors.length) {
                const result = await this.$http.get('/all-vendors');
                this.vendorsSetting(result.body);
            }
        },
    },
    computed: {
        ...mapGetters({
            vuexVendors: "getVendors"
        }),
        filteredVendors() {
            let result = this.vuexVendors;
            // if(this.filterName) {
            //     result = result.filter(item => {
            //         return item.name.toLowerCase().indexOf(this.filterName.toLowerCase()) != -1;
            //     })
            // }
            if(this.filterStatus) {
                result = result.filter(item => {
                    return item.status == this.filterStatus;
                })
            }
            // if(this.industryFilter[0].name != 'All') {
            //     result = result.filter(item => {
            //         let exist = false;
            //         for(let indus of item.industry) {
            //             if(indus.name == this.industryFilter[0].name) {
            //                 exist = true;
            //                 break;
            //             }
            //         }
            //         if(exist) {
            //             return item
            //         }
            //     })
            // }
            if(this.filterLeadsource) {
                result = result.filter(item => {
                    return item.leadSource == this.filterLeadsource;
                })
            }
            return result;
        }
    },
    components: {
        DataTable,
        VendorLeadsourceSelect,
        VendorStatusSelect,
        MultiVendorIndustrySelect,
    },
    mounted() {
        this.getVendors()
    },
}
</script>

<style lang="scss" scoped>
.vendors-table {
    &__industry-icon {
        width: 22px;
        height: 22px;
    }
    &__status {
        padding: 7px 5px 5px 6px;
    }
    &__icons {
        margin-right: 16px;
        display: flex;
        justify-content: space-around;
        align-items: center;
    }
    &__icon {
        cursor: pointer;
    }
    &_opacity {
        opacity: 0.5;
    }
    &__drop-menu {
        position: relative;
    }
}
</style>
