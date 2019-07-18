<template lang="pug">
.vendors-table
    DataTable(
        :fields="fields"
        :tableData="filteredVendors"
        :bodyClass="['vendors-table__body',{'tbody_visible-overflow': filteredVendors.length < 36}]"
        bodyRowClass="vendors-table_height-28"
        @onRowClicked="onRowClicked"
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
            .vendors-table__data {{ getFullName(row) }}
        template(slot="status" slot-scope="{ row, index }")
            .vendors-table__drop-menu(v-if="currentEditingIndex === index")
                VendorStatusSelect(
                    isAllExist="no"
                    :selectedStatus="selectedStatus"
                    :parentInd="index"
                    @chosenStatus="setStatus"
                    @scrollDrop="scrollDrop"
                )
            .vendors-table__no-drop(v-else) {{ row.status }}
        template(slot="languageCombination" slot-scope="{ row }")
            .vendors-table__combinations {{ getLanguageCombs(row) }}
        template(slot="native" slot-scope="{ row, index }")
            .vendors-table__drop-menu(v-if="currentEditingIndex === index")
                NativeLanguageSelect(
                    :selectedLang="selectedNative"
                    :parentIndex="index"
                    @chosenLang="setNative"
                    @scrollDrop="scrollDrop"
                )
            .vendors-table__no-drop(v-if="row.native && currentEditingIndex !== index") {{ row.native.lang }}
        template(slot="industry" slot-scope="{ row, index }")
            .vendors-table__drop-menu(v-if="currentEditingIndex === index")
                MultiVendorIndustrySelect(
                    :selectedInd="industrySelected"
                    :filteredIndustries="selectedIndNames" 
                    :parentInd="index" 
                    @chosenInd="setIndustry"
                    @scrollDrop="scrollDrop"
                )
            .vendors-table__no-drop(v-else)
                img.vendors-table__industry-icon(v-for="industry in row.industries" :src="industry.icon") 
        template(slot="basicRate" slot-scope="{ row, index }")
            .vendors-table__active(v-if="currentEditingIndex === index")
                input.vendors-table__input(type="text" v-model="currentBasicRate" @click.stop="stopPropagation")
            .vendors-table__no-drop(v-else)
                span.vendors-table__data {{ row.basicRate }}                
        template(slot="tqi" slot-scope="{ row, index }")
            .vendors-table__active(v-if="currentEditingIndex === index")
                input.vendors-table__input(type="text" v-model="currentTqi" @click.stop="stopPropagation")
            .vendors-table__no-drop(v-else)
                span.vendors-table__data {{ row.tqi }}
        template(slot="icons" slot-scope="{ row, index }")
            span.vendors-table__icons
                img.vendors-table__icon(@click.stop="makeAction(index, key)" v-for="(icon, key) in icons" :src="icon.icon" :class="{'vendors-table_opacity': isIconClass(index, key)}")
    .vendors-table__error(v-if="isErrorShow")
        .vendors-table__error-message
            p Please finish the current edition first!
            span.vendors-table__close(@click="closeErrorMessage") +
    .vendors-table__delete-approve(v-if="isDeleteMessageShow")
            p Are you sure you want to delete?
            Button.vendors-table__button(value="Cancel" @clicked="cancelDelete")
            Button.vendors-table__button(value="Delete" @clicked="approveDelete")
</template>

<script>
import DataTable from "../DataTable";
import VendorStatusSelect from "./VendorStatusSelect";
import VendorLeadsourceSelect from "./VendorLeadsourceSelect";
import NativeLanguageSelect from "./NativeLanguageSelect";
import MultiVendorIndustrySelect from "./MultiVendorIndustrySelect";
import Button from "../Button";
import scrollDrop from "@/mixins/scrollDrop";
import { mapGetters, mapActions } from "vuex";

export default {
    mixins: [scrollDrop],
    props: {
        nameFilter: {
            type: String
        },
        statusFilter: {
            type: String
        },
        industryFilter: {
            type: [String, Object],
            default: ""
        },
        leadFilter: {
            type: String
        }
    },
    data() {
        return {
            fields: [
                {label: "Vendor Name", headerKey: "headerVendorName", key: "vendorName", width: "13%", padding: "0"},
                {label: "Status", headerKey: "headerStatus", key: "status", width: "10%", padding: "0"},
                {label: "Language Combination", headerKey: "headerLanguageCombination", key: "languageCombination", width: "18%", cellClass: "vendors-table_scroll-y"},
                {label: "Native Language", headerKey: "headerNative", key: "native", width: "16%", padding: "0"},
                {label: "Industry", headerKey: "headerIndustry", key: "industry", width: "15%", padding: "0"},
                {label: "Basic Rate", headerKey: "headerBasicRate", key: "basicRate", width: "8%", padding: "0"},
                {label: "TQI", headerKey: "headerTqi", key: "tqi", width: "8%", padding: "0"},
                {label: "", headerKey: "headerIcons", key: "icons", width: "12%", padding: "3px"},        
            ],
            icons: {
                save: {icon: require('../../assets/images/Other/save-icon-qa-form.png')},
                edit: {icon: require('../../assets/images/Other/edit-icon-qa.png')},
                cancel: {icon: require('../../assets/images/cancel-icon.png')},
                delete: {icon: require('../../assets/images/Other/delete-icon-qa-form.png')}
            },
            currentEditingIndex: -1,
            deletingVendorIndex: -1,
            currentBasicRate: "",
            currentTqi: "",
            industrySelected: [],
            selectedNative: {},
            selectedStatus: "",
            isErrorShow: false,
            isDeleteMessageShow: false
        }
    },
    methods: {
        ...mapActions({
            alertToggle: "alertToggle",
            updateVendorProp: "updateVendorProp",
            storeVendors: "vendorsSetting",
            updateCurrentVendor: "updateCurrentVendor",
            storeCurrentVendor: "storeCurrentVendor",
            updateIndustry: "updateIndustry",
            deleteCurrentVendor: "deleteCurrentVendor"
        }),
        isScrollDrop(drop, elem) {
            return drop && elem.clientHeight >= 600;
        },
        stopPropagation() {
            return
        },
        getFullName(vendor) {
            return vendor.firstName + " " + vendor.surname;
        },
        getLanguageCombs(vendor) {
            return vendor.languagePairs.map(item => {
                return item.source.symbol + " >> " + item.target.symbol + "; "
            }).reduce((init, cur) => init + cur, "")
        },
        isIconClass(index, key) {
            if(this.currentEditingIndex !== index) {
                return key === 'save' || key === 'cancel';
            }
            if(this.currentEditingIndex === index) {
                return key === 'edit'
            }
        },
        closeErrorMessage() {
            this.isErrorShow = false;
        },
        setCurrentEditionValues(index) {
            this.currentEditingIndex = index;
            this.currentBasicRate = this.filteredVendors[index].basicRate;
            this.currentTqi = this.filteredVendors[index].tqi;
            this.industrySelected = this.filteredVendors[index].industries;
            this.selectedStatus = this.filteredVendors[index].status;
            this.selectedNative = this.filteredVendors[index].native;
        },
        setCurrentDefaults() {
            this.currentEditingIndex = -1;
            this.currentBasicRate = "";
            this.currentTqi = "";
            this.industrySelected = [];
            this.selectedStatus = "";
            this.selectedNative = {};
            const tbody = document.querySelector('.table__tbody');
            tbody.style.minHeight = this.currentTableHeight + 'px';
        },
        async updateVendor(index) {
            let sendData = new FormData();
            const updatingVendor = {
                ...this.filteredVendors[index],
                basicRate: this.currentBasicRate,
                tqi: this.currentTqi,
                industries: this.industrySelected,
                status: this.selectedStatus,
                native: this.selectedNative
            }
            sendData.append('vendor', JSON.stringify(updatingVendor));
            try {
                await this.updateCurrentVendor(sendData);
                this.alertToggle({message: "Vendor info updated", isShow: true, type: "success"}); 
            } catch(err) {
                this.alertToggle({message: "Server error / Cannot update Vendor info", isShow: true, type: "error"})
            }
        },
        async makeAction(index, key) {
            if(this.currentEditingIndex !== -1 && this.currentEditingIndex !== index) {
                return this.isErrorShow = true;
            }
            if(key === 'edit') {
                this.setCurrentEditionValues(index);
            }
            if(key === 'save') {
                await this.updateVendor(index);
                this.setCurrentDefaults();
            }
            if(key === 'cancel') {
                this.setCurrentDefaults();
            }
            if(key === 'delete') {
                this.deletingVendorIndex = index;
                this.isDeleteMessageShow = true;
            }
        },
        async approveDelete() {
            this.isDeleteMessageShow = false;
            this.currentEditingIndex = -1;
            const vendor = this.filteredVendors[this.deletingVendorIndex];
            try {
                const isAssigned = await this.$http.get(`/vendorsapi/any-step?id=${vendor._id}`);
                if(isAssigned.body) {
                    return this.alertToggle({message: "The vendor was assigned to a step and cannot be deleted.", isShow: true, type: "error"});
                }
                await this.deleteCurrentVendor({id: vendor._id});
                this.alertToggle({message: "Vendor removed", isShow: true, type: "success"});
            } catch(err) {
                this.alertToggle({message: "Server error / Cannot delete the Vendor", isShow: true, type: "error"});
            }
        },
        cancelDelete() {
            this.deletingVendorIndex = -1;
            this.isDeleteMessageShow = false;
        },
        setStatus({option}) {
            this.selectedStatus = option
        },
        setNative({lang}) {
            this.selectedNative = lang;
        },
        setIndustry({industry, index}) {
            const position = this.industrySelected.findIndex(item => {
                return item._id === industry._id
            })
            if(position !== -1) {
                return this.industrySelected.splice(position, 1);
            }
            this.industrySelected.push(industry);
        },
        async getVendors() {
            if(!this.vuexVendors.length) {
                const result = await this.$http.get('/all-vendors');
                this.storeVendors(result.body);
            }
        },
        onRowClicked({index}) {
            if(this.currentEditingIndex === index || this.currentEditingIndex !== -1 && this.currentEditingIndex !== index) {
                return
            }
            const vendor = this.filteredVendors[index];
            this.storeCurrentVendor(vendor);
            this.$router.push(`/vendors/details/${vendor._id}`);
        }
    },
    computed: {
        ...mapGetters({
            vuexVendors: "getVendors",
        }),
        filteredVendors() {
            let result = this.vuexVendors;
            if(this.nameFilter) {
                result = result.filter(item => {
                    const name = item.firstName + " " + item.surname;
                    return name.toLowerCase().indexOf(this.nameFilter.toLowerCase()) != -1;
                })
            }
            if(this.statusFilter && this.statusFilter !== 'All') {
                result = result.filter(item => {
                    return item.status == this.statusFilter;
                })
            }
            if(this.industryFilter && this.industryFilter.name !== 'All') {
                result = result.filter(item => {
                    const industryIds = item.industries.map(indus => indus._id);
                    return industryIds.indexOf(this.industryFilter._id) !== -1;
                })
            }
            if(this.leadFilter && this.leadFilter !== 'All') {
                result = result.filter(item => {
                    return item.leadSource == this.leadFilter;
                })
            }
            return result;
        },
        selectedIndNames() {
            let result = [];
            for(let ind of this.industrySelected) {
                result.push(ind.name);
            }
            return result;
        }
    },
    components: {
        DataTable,
        VendorLeadsourceSelect,
        VendorStatusSelect,
        MultiVendorIndustrySelect,
        NativeLanguageSelect,
        Button
    },
    created() {
        this.getVendors();
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.vendors-table {
    position: relative;
    &__combinations {
        padding: 4px;
        height: 22px;
    }
    &__industry-icon {
        width: 20px;
        height: 20px;
        margin-right: 3px;
    }
    &__no-drop, &__data {
        padding-left: 5px;
        display: flex;
        align-items: center;
        height: 30px;
        overflow-y: overlay;
        box-sizing: border-box;
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
    &__active {
        padding: 5px;
        box-shadow: inset 0 0 5px $brown-shadow; 
    }
    &__input {
        border: none;
        outline: none;
        color: $main-color;
        padding: 2px;
        background-color: transparent;
    }
    &__error {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        background: transparent;
        padding: 0 15px;
        z-index: 50;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    &__error-message {
        position: relative;
        width: 300px;
        padding: 0 20px;
        border: 1px solid $orange;
        box-shadow: 0 0 5px $orange;
        background-color: $white;
        font-weight: bolder;
        font-size: 14px;
    }
    &__close {
        position: absolute;
        font-size: 24px;
        font-weight: 700;
        top: -2px;
        right: 5px;
        transform: rotate(45deg);
        cursor: pointer;
    }
    &__delete-approve {
        position: absolute;
        width: 332px;
        height: 270px;
        top: 10%;
        left: 50%;
        margin-left: -166px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        box-shadow: 0 0 10px $main-color;
        background-color: $white;
        z-index: 20;
        p {
            font-size: 21px;
            width: 50%;
            text-align: center;
        }
        .approve-block {
            margin-bottom: 15px;
        }
    }
    &__button {
        margin-bottom: 5px;
    }
}
</style>
