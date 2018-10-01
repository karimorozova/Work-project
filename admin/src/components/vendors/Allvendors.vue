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
                        VendorIndustrySelect(:selectedInd="industryFilter" @chosenInd="chosenInd")
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
                    tr(v-for="(vend, ind) in allVendors")  
                        td(@click="vendorDetails(ind)")
                            span.vendorName {{ vend.firstName }} {{ vend.surname }}
                        td.dropOption(:class="{editing: !vend.icons[1].active}" @click="vendorDetails(ind)")
                            span(v-if="vend.icons[1].active") {{ vend.status }}
                            .innerComponent(v-if="!vend.icons[1].active")
                                VendorStatusSelect(:selectedStatus="vend.status" :parentInd="ind" @chosenStatus="changeStatus")
                        td(@click="vendorDetails(ind)")
                            .lang-combs
                                span.langs-info(v-for="langs in vend.languageCombinations") {{ langs.source.symbol }} >> {{ langs.target.symbol }}, 
                            //- input.langs-info(type="text" :readonly="vend.icons[1].active" v-model="vend.languageCombination")
                        td.dropOption(:class="{editing: !vend.icons[1].active}" @click="vendorDetails(ind)") 
                            span(v-if="vend.icons[1].active") {{ vend.native }}
                            .innerComponent(v-if="!vend.icons[1].active")
                                NativeLanguageSelect(:selectedLang="[vend.native]" :parentIndex="ind" @chosenLang="changeLang")
                        td.dropOption(@click="vendorDetails(ind)")              
                            //- span(v-if="!indus.icon") {{ indus.name }}
                            .dropOption__image
                                img(v-for="indus in vend.industry" :src="indus.icon")
                            //-     span.titleTooltip {{ vend.industry.name }} 
                            .innerComponent(v-if="!vend.icons[1].active")
                                MultiVendorIndustrySelect(:selectedInd="industrySelected" :filteredIndustries="selectedIndNames" :parentInd="ind" @chosenInd="changeIndustry")
                        td(@click="vendorDetails(ind)") 
                            input.vendorRates-info(type="text" :readonly="vend.icons[1].active" v-model="vend.basicRate")
                        td(@click="vendorDetails(ind)") 
                            input.vendorRates-info(type="text" :readonly="vend.icons[1].active" v-model="vend.tqi")                        
                        td
                            .crud-icons
                                img(v-for="(but, i) in vend.icons" :src='but.icon' :class="{'not-active': !but.active}" @click="action(ind, i)")
        .vendor-data(v-if="vendorData")
            Vendordetails(:vendor="vendor" 
                :newVendorId="newVendorId"
                @cancelVendor="cancelVendor" 
                @vendorDelete="vendorDelete"
                @changeLang="changeLang"
                @changeZone="changeZone"
                @changeStatus="changeStatus"
                @changeInd="changeIndustry"
                @saveVendor="saveVendor"
                @ratesUpdate="ratesUpdate"
                @addSevLangs="addSevLangs"
                )
            .save-success(v-if="saveSuccess")
                p Information saved
        Addseverallangs(v-if="addSeveral"
            :origin="'vendor'" 
            :who="vendor" 
            @closeSeveral="closeSevLangs"
            @refreshServices="ratesUpdate")
        .edit-error(v-if="editError")
            p.edit-message Please, finish current editing first!
                span.close-error(@click="closeEditError") +
        .delete-approve(v-if="deleteMessageShow")
            p Are you sure you want to delete?
            input.button.approve-block(type="button" value="Cancel" @click="cancelDelete")
            input.button(type="button" value="Delete" @click="approveDelete(currentActive)")
</template>

<script>
import ClickOutside from "vue-click-outside";
import VendorStatusSelect from "./VendorStatusSelect";
import VendorLeadsourceSelect from "./VendorLeadsourceSelect";
import VendorIndustrySelect from "./VendorIndustrySelect";
import MultiVendorIndustrySelect from "./MultiVendorIndustrySelect";
import NativeLanguageSelect from "./NativeLanguageSelect";
import Vendordetails from "./Vendordetails";
import Addseverallangs from "../finance/Addseverallangs";
import { mapGetters, mapActions } from "vuex";

export default {
    data() {
        return {
            vendors: [],
            vendor: {},
            isNew: false,
            filterName: "",
            filterStatus: "",
            industryFilter: [{name: "All"}],
            filterLeadsource: "",
            currentActive: "none",
            editError: false,
            vendorData: false,
            industrySelected: [],
            deleteMessageShow: false,
            saveSuccess: false,
            addSeveral: false
        }
    },
    methods: {
        addSevLangs(data) {
            this.addSeveral = true;
        },
        closeSevLangs(data) {
            this.addSeveral = false
        },
        chosenLeadsource(data) {
            this.filterLeadsource = data;
        },
        chosenStatus(data) {
            this.filterStatus = data.status;
        },
        chosenInd(data) {
            this.industryFilter = [data.industry];
        },
        changeStatus(data) {
            if(!this.vendorData) {
            let vendor = this.allVendors[data.index];
                for(let ven of this.vendors) {
                    if(vendor.firstName == ven.firstName && vendor.surname == ven.surname) {
                        ven.status = data.status
                    }
                }
            } else {
                this.vendor.status = data.status;
            }
            
        },
        changeIndustry(data) {
            if(!this.vendorData) {
                let exist = false;
                for(let ind in this.industrySelected) {
                    if(this.industrySelected[ind].name == data.industry.name) {
                        this.industrySelected.splice(ind, 1);
                        exist = true;
                    }
                }
                if(!exist) {
                    this.industrySelected.push(data.industry);
                }
                let vendor = this.allVendors[data.index];
                for(let ven of this.vendors) {
                    if(vendor._id == ven._id && !ven.icons[1].active) {
                        ven.industry = this.industrySelected;
                    }
                }
            } else {
                let exist = false;
                for(let ind in this.vendor.industry) {
                    if(this.vendor.industry[ind].name == data.industry.name) {
                        this.vendor.industry.splice(ind, 1);
                        exist = true;
                    }
                }
                if(!exist) {
                    this.vendor.industry.push(data.industry);
                }
            }
        },
        changeLang(data) {
            this.langSelected = data.lang;
            if(!this.vendorData) {
                let vendor = this.allVendors[data.index];
                for(let ven of this.vendors) {
                    if(vendor.firstName == ven.firstName && vendor.surname == ven.surname) {
                        ven.native = data.lang.lang
                    }
                }
            } else {
                this.vendor.native = data.lang.lang;
            }
        },
        changeZone(data) {
            if(!this.vendorData) {
                let vendor = this.allVendors[data.index];
                for(let ven of this.vendors) {
                    if(vendor.firstName == ven.firstName && vendor.surname == ven.surname) {
                        ven.timezone = data.zone
                    }
                }
            } else {
                this.vendor.timezone = data.zone;
            }
        },
        async ratesUpdate(data) {
            await this.getVendors();
            for(let ven of this.allVendors) {
                if(ven._id == this.vendor._id) {
                    this.vendor = ven;
                }
            }
        },
        saveVendor(data) {
            if(this.isNew) {
                let sendData = new FormData();
                sendData.append('vendor', JSON.stringify(this.vendor));
                sendData.append('photo', data.file);
                this.$http.post("../vendorsapi/new-vendor", sendData)
                .then(async res => {
                    this.saveSuccess = true;
                    setTimeout(() => {
                        this.saveSuccess = false;
                    }, 2000);
                    let id = res.data.id;
                    await this.getVendors();
                    for(let ven of this.allVendors) {
                        if(ven._id == id) {
                            this.vendor = ven;
                        }
                    }
                    this.isNew = false;
                })
                .catch(err => {
                    console.log(err)
                })
            } else {
                let sendData = new FormData();
                sendData.append('vendor', JSON.stringify(this.vendor));
                sendData.append('photo', data.file)
                this.$http.post("../vendorsapi/update-vendor", sendData)
                .then(res => {
                    console.log(res);
                    this.saveSuccess = true;
                    setTimeout(() => {
                        this.saveSuccess = false;
                    }, 2000);
                    this.getVendors();
                })
                .catch(err => {
                    console.log(err)
                })
            }
        },
        async vendorDelete(data) {
            this.vendorData = false;
            let id = this.vendor._id;
            for(let ind in this.vendors) {
                if(this.vendor.firstName == this.vendors[ind].firstName
                    && this.vendor.surname == this.vendors[ind].surname) {
                    this.vendors.splice(ind, 1)
                }
            }
            await this.venDel(id);
            this.$emit('cancelVendor');
            this.vendor = {};
        },
        async approveDelete(ind) {
            let vendorDel = this.allVendors.splice(ind, 1);
            let id = vendorDel[0]._id;
            this.currentActive = "none";
            await this.venDel(id);
            this.deleteMessageShow = false;
        },
        venDel(id) {
            this.$http.post("../vendorsapi/deletevendor", {"id": id})
            .then(res => {
                console.log(res)
            })
            .catch(err => {
                console.log(err)
            })
        },
        cancelDelete() {
            this.deleteMessageShow = false;
        }, 
        vendorDetails(ind) {
            if(this.currentActive != "none") {
                if(this.currentActive != ind) {
                    this.editError = true;
                }
            } else {
                this.isNew = false;
                this.vendor = JSON.stringify(this.allVendors[ind]);
                this.vendor = JSON.parse(this.vendor);
                this.vendorData = true;
                this.filterName = "";
                this.filterStatus = "";
                this.industryFilter = [{name: 'All'}];
                this.filterLeadsource = "";
                this.$emit('vendorDetails');
            }
        },
        cancelVendor(data) {
            this.vendorData = false;
            this.$emit('cancelVendor');
            this.vendor = {};
        },
        action(ind, i) {
            if(this.currentActive != 'none' && this.currentActive != ind) {
                this.editError = true;
                return true;
            }
            if(i == 0) {
                let vendor = this.allVendors[ind];
                for(let ven of this.vendors) {
                    if(vendor.firstName == ven.firstName && vendor.surname == ven.surname) {
                        ven = vendor
                    }
                }
                this.allVendors[ind].icons[0].active = false;
                this.allVendors[ind].icons[1].active = true;
                this.currentActive = "none";
                if(vendor._id) {
                    let sendData = new FormData();
                    sendData.append('vendor', JSON.stringify(vendor));
                    this.$http.post('../vendorsapi/update-vendor', sendData)
                    .then(res => {
                        console.log(res);
                    })
                    .catch(err => {
                        console.log(err)
                    })
                } else {
                    let sendData = new FormData();
                    sendData.append('vendor', JSON.stringify(vendor));
                    this.$http.post('../vendorsapi/new-vendor', sendData)
                    .then(res => {
                        console.log(res);
                    })
                    .catch(err => {
                        console.log(err)
                    })
                }
            }
            if(i == 1) {
                this.currentActive = ind;
                for(let vendor of this.allVendors) {
                    vendor.icons[0].active = false;
                    vendor.icons[1].active = true;
                }
                this.allVendors[ind].icons[0].active = true;
                this.allVendors[ind].icons[1].active = false;
                this.industrySelected = this.allVendors[ind].industry;
            }
            if(i == 2) {
                this.currentActive = ind;
                this.deleteMessageShow = true;
            }
        },
        addVendor() {
            if(this.currentActive != "none") {
                this.editError = true;
            } else {
                this.vendor = {
                    basicRate: "",
                    companyName: "",
                    email: "",
                    firstName: "",
                    surname: "",
                    gender: "",
                    linkedin: "",
                    native: "",
                    phone: "",
                    photo: "",
                    skype: "",
                    status: "",
                    timezone: "",
                    tqi: "",
                    website: "",
                    whatsapp: "",
                    languageCombinations: [],
                    industry: [],
                    icons: [{name: 'save', active: false, icon: require('../../assets/images/Other/save-icon-qa-form.png')},
                            {name: 'edit', active: true, icon: require('../../assets/images/Other/edit-icon-qa.png')},
                            {name: 'delete', active: true, icon: require('../../assets/images/Other/delete-icon-qa-form.png')}
                        ]
                }
                this.isNew = true;
                this.vendorData = true;
                this.filterName = "";
                this.filterStatus = "";
                this.industryFilter = [{name: 'All'}];
                this.filterLeadsource = "";
                this.$emit('vendorDetails');
            }
        },
        closeEditError() {
            this.editError = false;
        },
        async getVendors() {
            this.vendors = [];
            let result = await this.$http.get('/all-vendors');
            for(let vendor of result.body) {
                vendor.icons = [{name: "save", active: false, icon: require("../../assets/images/Other/save-icon-qa-form.png")}, {name: 'edit', active: true, icon: require('../../assets/images/Other/edit-icon-qa.png')},
                    {name: 'delete', active: true, icon: require('../../assets/images/Other/delete-icon-qa-form.png')}];
                this.vendors.push(vendor);
            }
            this.loadingToggle(false);
        },
        ...mapActions({
            loadingToggle: "loadingToggle"
        })
    },
    components: {
        VendorLeadsourceSelect,
        VendorStatusSelect,
        VendorIndustrySelect,
        MultiVendorIndustrySelect,
        NativeLanguageSelect,
        Vendordetails,
        Addseverallangs
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
            if(this.industryFilter[0].name != 'All') {
                result = result.filter(item => {
                    let exist = false;
                    for(let indus of item.industry) {
                        if(indus.name == this.industryFilter[0].name) {
                            exist = true;
                            break;
                        }
                    }
                    if(exist) {
                        return item
                    }
                })
            }
            if(this.filterLeadsource) {
                result = result.filter(item => {
                    return item.leadSource == this.filterLeadsource;
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
        },
        oldNew() {
            let result = false;
            if(this.vendorData) {
                if(this.isNew) {
                    result = true
                }
            }
            return result;
        }
    },
    mounted() {
        this.getVendors()
    },
    directives: {
        ClickOutside
    }
}
</script>

<style lang="scss" scoped>

.vendors-wrap {
    position: relative;
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

.lang-combs {
    max-height: 26px;
    overflow-y: auto;
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
    display: flex;
    align-items: center;
    max-height: 21px;
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
    img {
        max-width: 21px;
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

.save-success {
    position: absolute;
    width: 270px;
    height: 50px;
    padding: 10px;
    top: 50%;
    left: 50%;
    margin-left: -135px;
    background-color: #DFF0D8;
    color: #41763D;
    font-weight: 600;
    border: 1px solid #41763D;
    border-radius: 5px;
}

.edit-error {
    font-weight: 700;
    position: absolute;
    padding: 10px;
    top: 50%;
    left: 50%;
    margin-left: -130px;
    border: 1px solid red;
    width: 260px;
    background-color: #FFF;
    z-index: 20;
    .edit-message {
        position: relative;
        font-size: 18px;
        .close-error {
            position: absolute;
            top: -28px;
            right: -4px;
            transform: rotate(45deg);
            font-size: 22px;
            cursor: pointer;
        }
    }
}

.delete-approve {
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
    box-shadow: 0 0 10px #67573E;
    background-color: #FFF;
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

.button {
    width: 138px;
    height: 33px;
    color: white;
    font-size: 14px;
    border-radius: 10px;
    -webkit-box-shadow: 0 3px 5px rgba(0,0,0,.4);
    box-shadow: 0 3px 5px rgba(0,0,0,.4);
    background-color: #ff876c;
    border: 1px solid #ff876c;
    cursor: pointer;
    outline: none;
}

</style>
