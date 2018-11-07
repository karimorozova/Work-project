<template lang="pug">
    .vendor-wrap
        .vendor-info(v-if="vendorShow")
            .buttons
                input.button(type="button" value="Save" @click="updateVendor")
                input.button(type="button" value="Cancel" @click="cancel")
                input.button(type="button" value="Delete" @click="deleteVendor")
            .title General Information
            .gen-info
                .gen-info__block
                    .photo-wrap(v-if="!vendor.photo")
                        input.photo-file(type="file" @change="previewPhoto")
                        .photo-text(v-if="!imageExist")
                            p upload your photo                          
                        img.photo-image(v-if="imageExist")
                    .photo-wrap(v-if="vendor.photo")
                        input.photo-file(type="file" @change="previewPhoto")                       
                        img.photo-image(:src="vendor.photo")
                    label.job-title Job title
                .gen-info__block
                    .block-item
                        label First Name:
                        input(type="text" placeholder="First Name" :value="vendor.firstName" @change="(e) => updateProp(e,'firstName')")
                    .block-item
                        label Surname:
                        input(type="text" placeholder="Surname" :value="vendor.surname" @change="(e) => updateProp(e,'surname')")
                    .block-item
                        label Email:
                        input(type="text" placeholder="Email" :value="vendor.email" @change="(e) => updateProp(e,'email')")
                    .block-item
                        label Phone:
                        input(type="text" placeholder="Phone" :value="vendor.phone" @change="(e) => updateProp(e,'phone')")
                    .block-item
                        label Time Zone:
                        TimezoneSelect(:timezoneSelected="vendor.timezone" :timezones="timezones" @chosenZone="setTimezone")
                    .block-item
                        label Native Language:
                        NativeLanguageSelect(:selectedLang="vendor.native" @chosenLang="setNative")
                    .block-item
                        label Gender:
                        .drop-select(v-click-outside="outGenders")
                            .select
                                template(v-if="vendor.gender")
                                    .selected
                                        span {{ vendor.gender }}
                                template(v-if="!vendor.gender")
                                    span.selected.no-gender Gender
                                .arrow-button(@click="toggleGenders")
                                    img(src="../../assets/images/open-close-arrow-brown.png" :class="{reverseIcon: genderDropped}")
                            .drop(v-if="genderDropped")
                                .drop__item(@click="updateGender('Male')")
                                    span Male
                                .drop__item(@click="updateGender('Female')")
                                    span Female
                .gen-info__block
                    .block-item
                        label Company Name:
                        input(type="text" placeholder="Company Name" :value="vendor.companyName" @change="(e) => updateProp(e,'companyName')")
                    .block-item
                        label Website:
                        input(type="text" placeholder="Website" :value="vendor.website" @change="(e) => updateProp(e,'website')")
                    .block-item
                        label Skype:
                        input(type="text" placeholder="Skype" :value="vendor.skype" @change="(e) => updateProp(e,'skype')")
                    .block-item
                        label Linkedin:
                        input(type="text" placeholder="Linkedin" :value="vendor.linkedin" @change="(e) => updateProp(e,'linkedin')")
                    .block-item
                        label WhatsApp:
                        input(type="text" placeholder="WhatsApp" :value="vendor.whatsapp" @change="(e) => updateProp(e,'whatsapp')")
                    .block-item
                        label Vendor Status:
                        VendorStatusSelect(isAllExist="no" :selectedStatus="vendor.status" @chosenStatus="chosenStatus")
                    .block-item
                        label Industries:
                        MultiVendorIndustrySelect(:selectedInd="vendor.industry" :filteredIndustries="selectedIndNames" @chosenInd="chosenInd")
            .title(v-if="vendor._id") Rates    
            .rates(v-if="vendor._id")
                VendorRates(:vendor="vendor" 
                    @ratesUpdate="ratesUpdate"
                    @addSevLangs="addSevLangs")
            .delete-approve(v-if="approveShow")
                p Are you sure you want to delete?
                input.button.approve-block(type="button" value="Cancel" @click="cancelApprove")
                input.button(type="button" value="Delete" @click="approveVendorDelete")
</template>

<script>
import ClickOutside from "vue-click-outside";
import VendorStatusSelect from "./VendorStatusSelect";
import VendorLeadsourceSelect from "./VendorLeadsourceSelect";
import MultiVendorIndustrySelect from "./MultiVendorIndustrySelect";
import NativeLanguageSelect from "./NativeLanguageSelect";
import TimezoneSelect from "../clients/TimezoneSelect";
import VendorRates from "./VendorRates";
import { mapGetters, mapActions } from "vuex";

export default {
    props: {
        vendor: {
            type: Object
        }
    },
    data() {
        return {
            vendorShow: true,
            imageExist: false,
            timezones: [],
            genderDropped: false,
            approveShow: false,
            photoFile: []
        }
    },
    methods: {
        addSevLangs(data) {
            this.$emit('addSevLangs')
        },
        deleteVendor() {
            this.approveShow = true;
        },
        cancelApprove() {
            this.approveShow = false;
        },
        previewPhoto() {
            let input = document.getElementsByClassName('photo-file')[0];
            if(input.files && input.files[0]) {
                this.photoFile = input.files;
                this.imageExist = true;
                let reader = new FileReader();
                reader.onload = (e) => {
                    document.getElementsByClassName('photo-image')[0].src = e.target.result;
                }
                reader.readAsDataURL(input.files[0]);
            }
        },
        async updateVendor() {
            let sendData = new FormData();
            sendData.append('vendor', JSON.stringify(this.vendor));
            sendData.append('photo', this.photoFile[0]);
            try {
                if(!this.vendor._id) {
                    const saveResult = await this.$http.post("/vendorsapi/new-vendor", sendData);
                    const { vendorId, vendors } = saveResult.data;
                    const updatedVendor = vendors.find(item => item._id === vendorId);
                    await this.storeCurrentVendor({updatedVendor});
                    await this.storeVendors(vendors);
                    this.alertToggle({message: "New Vendor saved", isShow: true, type: "success"});
                } else {
                    const updatedVendors = await this.$http.post("/vendorsapi/update-vendor", sendData);
                    const vendors = updatedVendors.data;
                    const updatedVendor = vendors.find(item => item._id === this.vendor._id);
                    await this.storeVendors(vendors);
                    await this.storeCurrentVendor(updatedVendor);
                    this.alertToggle({message: "Vendor info updated", isShow: true, type: "success"});
                }
            } catch(err) {
                this.alertToggle({message: "Server error / Cannot update Vendor info", isShow: true, type: "error"})
            }
        },
        updateProp(e, prop) {
            const value = e.target.value;
            this.updateVendorProp({prop, value});
        },
        updateGender(value) {
            this.updateVendorProp({prop: 'gender', value})
        },
        setTimezone(data) {
            this.updateVendorProp({prop: "timezone", value: data})
        },
        setNative({lang}) {
            this.updateVendorProp({prop: "native", value: lang})
        },
        chosenStatus({option}) {
            this.updateVendorProp({prop: "status", value: option})
        },
        ratesUpdate(data) {
            this.$emit('ratesUpdate');
        },
        cancel() {
            this.$emit('cancelVendor')
        },
        approveVendorDelete() {
            this.approveShow = false;
            this.$emit('vendorDelete')
        },
        toggleGenders() {
            this.genderDropped = !this.genderDropped;
        },
        outGenders() {
            this.genderDropped = false;
        },
        chosenInd({industry}) {
            this.updateIndustry(industry);
            // this.$emit('changeInd', {industry: data.industry, filter: this.selectedIndNames})
        },
        async getTimezones() {
            try {
                const timezones = await this.$http.get('/api/timezones');
                this.timezones = tmezones.body;
            } catch(err) {
                this.alertToggle({message: "Server error / Cannot get timezones", isSHow: true, type: "error"})
            }
        },
        ...mapActions({
            alertToggle: "alertToggle",
            updateVendorProp: "updateVendorProp",
            storeVendors: "vendorsSetting",
            storeCurrentVendor: "storeCurrentVendor",
            updateIndustry: "updateIndustry"
        })
    },
    mounted() {
        this.getTimezones();
    },
    computed: {
        selectedIndNames() {
            let result = [];
            if(this.vendor.industry.length) {
                for(let ind of this.vendor.industry) {
                    result.push(ind.name);
                }
            }
            return result;
        },
    },
    components: {
        VendorLeadsourceSelect,
        VendorStatusSelect,
        MultiVendorIndustrySelect,
        NativeLanguageSelect,
        TimezoneSelect,
        VendorRates
    },
    directives: {
        ClickOutside
    },
}
</script>


<style lang="scss" scoped>

.vendor-wrap {
    position: relative;
}

.title {
    font-size: 22px;
}
.gen-info, .rates {
    margin: 20px 10px 40px 10px;
    padding: 20px;
    box-shadow: 0 0 15px #67573e9d;
    width: 860px;
}

.gen-info {
    display: flex;
    justify-content: space-between;
    &__block {
        width: 35%;
        &:first-child {
            width: 22%;
            text-align: center;
        }
    }
    
}
.block-item {
    font-size: 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    label {
        margin-bottom: 0;
    }
    input {
        font-size: 14px;
        color: #67573e;
        border: 1px solid #67573e;
        border-radius: 5px;
        padding: 0 3px;
        outline: none;
        width: 185px;
        height: 28px;
    }
    ::-webkit-input-placeholder {
        padding: 10px 5px;
        opacity: 0.5;
    }
}

.drop-select {
    width: 191px;
    position: relative;
    .drop {
        position: absolute;
        width: 100%;
        border: 1px solid #BFB09D;
        max-height: 150px;
        overflow-y: auto;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        background-color: white;
        z-index: 6;
        &__item {
            padding: 5px 2px;
            border-bottom: .5px solid #BFB09D;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.4s;
            &:last-child {
                border: none;
            }
            &:hover {
                background-color: rgba(191, 176, 157, 0.5);
            }
        }
        .chosen {
            background-color: rgba(191, 176, 157, 0.5);
        }
    }
    .select {
        border: 1px solid #67573E;
        border-radius: 5px;
        width: 191px;
        height: 28px;
        display: flex;
        justify-content: space-between;
        overflow: hidden;
        .selected {
            border-right: 1px solid #BFB09D;
            width: 84%;
            padding: 0 5px;
            font-size: 14px;
            max-height: 28px;
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            overflow: auto;
            position: relative;
        }
        .no-gender {
            opacity: 0.5;
        }
        .arrow-button {
            width: 18%;
            display: flex;
            justify-content: center;
            align-items: center;
            img {
                padding-right: 2px;
            }
            .reverseIcon {
                transform: rotate(180deg);
            }
        }
    }
}

.buttons {
  width: 99%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.button {
    margin-left: 30px;
    width: 138px;
    height: 33px;
    color: white;
    font-size: 14px;
    border-radius: 10px;
    -webkit-box-shadow: 0 3px 5px rgba(0,0,0,.4);
    box-shadow: 0 3px 5px rgba(0,0,0,.4);
    background-color: #D15F45;
    border: 1px solid #D15F45;
    cursor: pointer;
    outline: none;
    .delete-approve & {
        margin-left: 0;
    }
}

.photo-wrap {
    width: 180px;
    height: 157px;
    border: 1px solid #67573E;
    position: relative;
    overflow: hidden;
    margin-bottom: 20px;
    .photo-image {
        max-width: 100%;
        max-height: 100%;
    }
}

.photo-file {
    position: absolute;
    top: -25px;
    left: -100px;
    height: 180px;
    background-color: transparent;
    outline: none;
    border: none;
    z-index: 5;
}

.photo-text {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    p {
        font-size: 18px;
        opacity: 0.5;
        width: 50%;
        text-align: center;
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


</style>
