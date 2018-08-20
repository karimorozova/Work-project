<template lang="pug">
    .vendors-wrap
        .title(v-if="!vendorData") All Vendors
        .vendors-table(v-if="!vendorData")
            .filters
                .filters__block
                    .filters-item
                        label Name
                        input.filter-field(type="text" placeholder="Vendor Name" v-model="filterName")
                    .filters-item
                        label Industry
                        VendorIndustrySelect(:selectedInd="filterIndustry" @chosenInd="chosenInd")
                    .filters-item
                        label Status
                        VendorStatusSelect(:selectedStatus="filterStatus" @chosenStatus="chosenStatus")
                    .filters-item
                        label Lead Source
                        VendorLeadsourceSelect(:selectedLeadsource="filterLeadsource" @chosenLeadsource="chosenLeadsource")
                .filters__block
                    input.add-button(type="submit" value="Add vendor" @click="addVendor")            
            table
                thead
                    tr
                        th 
                            .head-title
                                span Vendor Name
                        th
                            .head-title
                                span Status
                        th
                            .head-title
                                span Language combination
                        th
                            .head-title
                                span Native Language
                        th
                            .head-title
                                span Industry
                        th
                            .head-title
                                span Basic Rate
                        th
                            .head-title
                                span TQI                  
                        th
                tbody
                    tr(v-for="(vendor, ind) in allVendors")  
                        td(@click="vendorDetails(ind)") 
                            span.vendorName {{ vendor.name }}
                        td(:class="{editing: !vendor.icons[1].active}" @click="vendorDetails(ind)") 
                            input.contact-info(type="text" :readonly="vendor.icons[1].active" v-model="vendor.status")
                        td(:class="{editing: !vendor.icons[1].active}" @click="vendorDetails(ind)") 
                            input.langs-info(type="text" :readonly="vendor.icons[1].active" v-model="vendor.languageCombination")
                        td(:class="{editing: !vendor.icons[1].active}" @click="vendorDetails(ind)") 
                            input.langs-info(type="text" :readonly="vendor.icons[1].active" v-model="vendor.native")
                        td.dropOption(@click="vendorDetails(ind)")              
                            span(v-if="!vendor.industry.icon") {{ vendor.industry.name }}
                            .dropOption__image
                                img(v-if="vendor.industry.icon" :src="vendor.industry.icon")
                                span.titleTooltip {{ vendor.industry.name }} 
                            .innerComponent(v-if="!vendor.icons[1].active")
                                VendorIndustrySelect(:selectedInd="industrySelected" :parentInd="ind" @chosenInd="changeIndustry")
                        td(:class="{editing: !vendor.icons[1].active}" @click="vendorDetails(ind)") 
                            input.vendorRates-info(type="text" :readonly="vendor.icons[1].active" v-model="vendor.basicRate")
                        td(:class="{editing: !vendor.icons[1].active}" @click="vendorDetails(ind)") 
                            input.vendorRates-info(type="text" :readonly="vendor.icons[1].active" v-model="vendor.tqi")                        
                        td
                            .crud-icons
                                img(v-for="(but, i) in vendor.icons" :src='but.icon' :class="{'not-active': !but.active}" @click="action(ind, i)")
</template>

<script>
import VendorStatusSelect from "./VendorStatusSelect";
import VendorLeadsourceSelect from "./VendorLeadsourceSelect";
import VendorIndustrySelect from "./VendorIndustrySelect";
export default {
    data() {
        return {
            vendors: [
                {
                    name: 'sdfsdfsd', status: "Active", languageCombination: "EN-GB >> ES", native: "Spanish", industry: {name: 'Casino, Poker & Igaming', rate: 0, icon: '/static/industries/casino-poker-igaming.png', "crud": false, download: '/static/Download-icon.png', generic: '/static/example.xlsx', active: true},
                    basicRate: 0.1, tqi: "0-100", leadSource: "Internet", icons: [{name: "save", active: false, icon: require("../../assets/images/Other/save-icon-qa-form.png")}, {name: 'edit', active: true, icon: require('../../assets/images/Other/edit-icon-qa.png')},
                    {name: 'delete', active: true, icon: require('../../assets/images/Other/delete-icon-qa-form.png')}]
                },
                {
                    name: 'bfgbfgd', status: "Active", languageCombination: "EN-GB >> ES", native: "Spanish", industry: {name: 'Casino, Poker & Igaming', rate: 0, icon: '/static/industries/casino-poker-igaming.png', "crud": false, download: '/static/Download-icon.png', generic: '/static/example.xlsx', active: true},
                    basicRate: 0.1, tqi: "0-100", leadSource: "Website", icons: [{name: "save", active: false, icon: require("../../assets/images/Other/save-icon-qa-form.png")}, {name: 'edit', active: true, icon: require('../../assets/images/Other/edit-icon-qa.png')},
                    {name: 'delete', active: true, icon: require('../../assets/images/Other/delete-icon-qa-form.png')}]
                },
                {
                    name: 'nerteberb', status: "Active", languageCombination: "EN-GB >> ES", native: "Spanish", industry: {name: 'Casino, Poker & Igaming', rate: 0, icon: '/static/industries/casino-poker-igaming.png', "crud": false, download: '/static/Download-icon.png', generic: '/static/example.xlsx', active: true},
                    basicRate: 0.1, tqi: "0-100", leadSource: "Internet", icons: [{name: "save", active: false, icon: require("../../assets/images/Other/save-icon-qa-form.png")}, {name: 'edit', active: true, icon: require('../../assets/images/Other/edit-icon-qa.png')},
                    {name: 'delete', active: true, icon: require('../../assets/images/Other/delete-icon-qa-form.png')}]
                }
            ],
            filterName: "",
            filterStatus: "",
            filterIndustry: {},
            filterLeadsource: "",
            industrySelected: {}
        }
    },
    methods: {
        chosenLeadsource(data) {
            this.filterLeadsource = data;
        },
        chosenStatus(data) {
            this.filterStatus = data;
        },
        chosenInd(data) {
            this.filterIndustry = data.industry;
        },
        changeIndustry(data) {
            this.industrySelected = data.industry;
            let vendor = this.allVendors[data.index];
            for(let ven of this.vendors) {
                if(vendor.name == ven.name) {
                    ven.industry = data.industry
                }
            }
        },
        vendorDetails(ind) {
            console.log(this.allVendors[ind])
        },
        action(ind, i) {
            if(i == 1) {
                for(let vendor of this.allVendors) {
                    vendor.icons[0].active = false;
                    vendor.icons[1].active = true;
                }
                this.allVendors[ind].icons[0].active = true;
                this.allVendors[ind].icons[1].active = false;
            }
            if(i == 2) {
                this.allVendors.splice(ind, 1);
            }
        },
        addVendor() {
            console.log('Adding a new vendor...')
        }
    },
    components: {
        VendorLeadsourceSelect,
        VendorStatusSelect,
        VendorIndustrySelect
    },
    computed: {
        allVendors() {
            let result = this.vendors;
            if(this.filterName) {
                result = result.filter(item => {
                    return item.name.toLowerCase().indexOf(this.filterName.toLowerCase()) != -1;
                })
            }
            if(this.filterStatus) {
                result = result.filter(item => {
                    return item.status == this.filterStatus;
                })
            }
            if(this.filterIndustry.name) {
                result = result.filter(item => {
                    return item.industry.name == this.filterIndustry.name;
                })
            }
            if(this.filterLeadsource) {
                result = result.filter(item => {
                    return item.leadSource == this.filterLeadsource;
                })
            }
            return result;
        }
    }
}
</script>

<style lang="scss" scoped>

.vendors-wrap {
    margin-left: 20px;
    margin-top: 20px;
}

.title {
    font-size: 22px;
}

label {
    margin-bottom: 0;
    margin-right: 10px;
}

.filters {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-bottom: 20px;
    &__block {
        display: flex;
        justify-content: space-between;
        align-items: center;
        &:last-child {
            width: 100%;
            margin-top: 20px;
            justify-content: flex-end;
        }
    }
}

.filters-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    ::-webkit-input-placeholder {
        opacity: 0.5;
    }
}

.add-button {
    width: 190px;
    height: 26px;
    color: white;
    font-size: 14px;
    border-radius: 10px;
    -webkit-box-shadow: 0 3px 5px rgba(0,0,0,.4);
    box-shadow: 0 3px 5px rgba(0,0,0,.4);
    background-color: #ff876c;
    border: 1px solid #ff876c;
    cursor: pointer;
}

.filter-field {
    width: 188px;
    height: 28px;
    padding-left: 3px;
    border: 1px solid #67573E;
    border-radius: 5px;
    outline: none;
}

.vendors-table {
    width: 1100px;
    margin: 40px;
    padding: 20px 10px;
    font-size: 14px;
    font-weight: normal;
    box-shadow: 0 0 10px rgba(103, 87, 62, 0.5);
    table {
        width: 100%;
        border: 1px solid #67573E;
        border-collapse: collapse;
        thead {
            background-color: #968A7E;
            color: #FFF;
        }
    }
}
thead, tbody {
    width: 100%;
    display: block;
}
tbody {
    overflow-y: scroll;
}
th, td {
    width: 130px;
    &:nth-of-type(3), &:nth-of-type(4), &:nth-of-type(5) {
        width: 172px;
    }
    &:nth-of-type(6), &:nth-of-type(7) {
        width: 90px;
    }
}
th {
    border-right: 1px solid #FFF;
    padding: 5px 1px;
    &:last-child {
        border-right: none;
        width: 120px
    }
    &:first-child {
        padding-left: 0;
    }
}
td {
    border-right: 1px solid #67573E;
    border-bottom: 1px solid #67573E;
    &:last-child {
        width: 105px;
        border-right: none;
    }
    &:first-child {
        padding-right: 0;
    }
    input {
        color: #67573E;
    }
}
.dropOption {
  position: relative;
  .innerComponent {
    position: absolute;
    background-color: #fff;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 5;
  }
  &__image {
    max-height: 21px;
    width: 30px;
    .titleTooltip {
      position: absolute;
      display: none;
      color: #ff876c;
      font-size: 12px;
      top: 8px;
      left: 35px;
    }
    &:hover {
      .titleTooltip {
        display: block;
      }
    }
  }
}
tr {
    cursor: pointer;
}
.head-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 5px;
}

.vendorName {
    padding: 0 3px;
}

.contact-info {
    border: none;
    outline: none;
    width: 100px;
    margin: 2px;
    padding: 3px 0 3px 5px;
}

.langs-info {
    border: none;
    outline: none;
    width: 163px;
    margin: 2px;
    padding: 3px 0 3px 5px;
}

.vendorRates-info {
    border: none;
    outline: none;
    width: 80px;
    margin: 2px;
    padding: 3px 0 3px 5px;
}

.editing {
    box-shadow: inset 0 0 8px rgba(103, 87, 62, 0.75);
}

.outer-check {
    margin: 0 auto;
    width: 14px;
    height: 14px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    border: 1px solid #67573E;
    cursor: pointer;
    .inner-check {
        width: 68%;
        height: 68%;
        border-radius: 50%;
        background-color: #FFF;
    }
    .checked {
        background-color: #67573E;
    }
}

.crud-icons {
    display: flex;
    align-items: center;
    justify-content: space-around;
    img {
        cursor: pointer;
    }
}

.not-active {
    opacity: 0.5;
}

input {
    color: #67573E;
}

</style>
