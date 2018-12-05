<template lang="pug">
.vendor-wrap
    .vendor-wrap__sidebar
        Sidebar(title="VENDORS" :links="sidebarLinks" linkClass="vendor-details")
    .vendor-info
        .buttons
            input.button(type="button" value="Save" @click="checkForErrors")
            input.button(type="button" value="Cancel" @click="cancel")
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
                    label.block-item__label.block-item_relative First Name:
                        Asterisk(:customStyle="asteriskStyle")
                    input.block-item__input-field(:class="{'block-item_error-shadow': !vendor.firstName && isSaveClicked}" type="text" placeholder="First Name" :value="vendor.firstName" @change="(e) => updateProp(e,'firstName')")
                .block-item
                    label Surname:
                    input.block-item__input-field(type="text" placeholder="Surname" :value="vendor.surname" @change="(e) => updateProp(e,'surname')")
                .block-item
                    label.block-item__label.block-item_relative Email:
                        Asterisk(:customStyle="asteriskStyle")
                    input.block-item__input-field(:class="{'block-item_error-shadow': checkEmail && isSaveClicked}" type="text" placeholder="Email" :value="vendor.email" @change="(e) => updateProp(e,'email')")
                .block-item
                    label Phone:
                    input.block-item__input-field(type="text" placeholder="Phone" :value="vendor.phone" @change="(e) => updateProp(e,'phone')")
                .block-item
                    label Time Zone:
                    .block-item__drop-menu.block-item_high-index
                        TimezoneSelect(:timezoneSelected="vendor.timezone" :timezones="timezones" @chosenZone="setTimezone")
                .block-item
                    label.block-item__label.block-item_relative Native Language:
                        Asterisk(:customStyle="asteriskStyle")
                    .block-item__drop-menu.block-item_medium-index(:class="{'block-item_error-shadow': !vendor.native && isSaveClicked}")
                        NativeLanguageSelect(:selectedLang="vendor.native" @chosenLang="setNative")
                .block-item
                    label Gender:
                    .block-item__drop-menu
                        SelectSingle(
                            :options="genders"
                            :selectedOption="vendor.gender"
                            placeholder="Gender"
                            @chooseOption="updateGender"
                        )
            .gen-info__block
                .block-item
                    label Company Name:
                    input.block-item__input-field(type="text" placeholder="Company Name" :value="vendor.companyName" @change="(e) => updateProp(e,'companyName')")
                .block-item
                    label Website:
                    input.block-item__input-field(type="text" placeholder="Website" :value="vendor.website" @change="(e) => updateProp(e,'website')")
                .block-item
                    label Skype:
                    input.block-item__input-field(type="text" placeholder="Skype" :value="vendor.skype" @change="(e) => updateProp(e,'skype')")
                .block-item
                    label Linkedin:
                    input.block-item__input-field(type="text" placeholder="Linkedin" :value="vendor.linkedin" @change="(e) => updateProp(e,'linkedin')")
                .block-item
                    label WhatsApp:
                    input.block-item__input-field(type="text" placeholder="WhatsApp" :value="vendor.whatsapp" @change="(e) => updateProp(e,'whatsapp')")
                .block-item
                    label.block-item__label.block-item_relative Vendor Status:
                        Asterisk(:customStyle="asteriskStyle")
                    .block-item__drop-menu.block-item_high-index(:class="{'block-item_error-shadow': !vendor.status && isSaveClicked}")
                        VendorStatusSelect(isAllExist="no" :selectedStatus="vendor.status" @chosenStatus="chosenStatus")
                .block-item
                    label.block-item__label.block-item_relative Industries:
                        Asterisk(:customStyle="asteriskStyle")
                    .block-item__drop-menu(:class="{'block-item_error-shadow': !vendor.industries.length && isSaveClicked}")
                        MultiVendorIndustrySelect(:selectedInd="vendor.industries" :filteredIndustries="selectedIndNames" @chosenInd="chosenInd")
        .delete-approve(v-if="approveShow")
            p Are you sure you want to delete?
            input.button.approve-block(type="button" value="Cancel" @click="cancelApprove")
            input.button(type="button" value="Delete" @click="approveVendorDelete")
    ValidationErrors(v-if="areErrorsExist"
        :errors="errors"
        @closeErrors="closeErrors"
    )
</template>

<script>
import ClickOutside from "vue-click-outside";
import VendorStatusSelect from "./VendorStatusSelect";
import VendorLeadsourceSelect from "./VendorLeadsourceSelect";
import MultiVendorIndustrySelect from "./MultiVendorIndustrySelect";
import NativeLanguageSelect from "./NativeLanguageSelect";
import ValidationErrors from "../ValidationErrors";
import SelectSingle from "../SelectSingle";
import Asterisk from "../Asterisk";
import Sidebar from "../Sidebar";
import TimezoneSelect from "../clients/TimezoneSelect";
import { mapGetters, mapActions } from "vuex";

export default {
    props: {
        
    },
    data() {
        return {
            areErrorsExist: false,
            isSaveClicked: false,
            vendorShow: true,
            imageExist: false,
            timezones: [],
            approveShow: false,
            photoFile: [],
            genders: ["Male", "Female"],
            sidebarLinks: ["General Information"],
            asteriskStyle: {"top": "-4px"},
            errors: [],
            vendor: {
                basicRate: "",
                companyName: "",
                email: "",
                firstName: "",
                surname: "",
                gender: "",
                linkedin: "",
                native: {},
                phone: "",
                photo: "",
                skype: "",
                status: "",
                timezone: "",
                tqi: "",
                website: "",
                whatsapp: "",
                languageCombinations: [],
                languagePairs: [],
                industries: [],
                test: false,
                position: []
            }
        }
    },
    methods: {
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
        closeErrors() {
            this.areErrorsExist = false;
        },
        checkEmail() {
            const emailValidRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;            
            return !this.vendor.email || !emailValidRegex.test(this.vendor.email.toLowerCase())
        },
        async checkForErrors() {
            this.errors = [];
            if(!this.vendor.firstName) this.errors.push('Company name cannot be empty.');
            if(!this.vendor.industries.length) this.errors.push('Please, choose at least one industry.');
            if(!this.vendor.status) this.errors.push('Please, choose status.');
            if(this.checkEmail()) {
                this.errors.push('Please provide a valid email.');
            }
            if(this.errors.length) {
                this.areErrorsExist = true;
                this.isSaveClicked = true;
                return
            }
            await this.updateVendor();
        }, 
        async updateVendor() {
            let sendData = new FormData();
            sendData.append('vendor', JSON.stringify(this.vendor));
            sendData.append('photo', this.photoFile[0]);
            try {
                const saveResult = await this.$http.post("/vendorsapi/new-vendor", sendData);
                const { vendorId, vendors } = saveResult.data;
                const updatedVendor = vendors.find(item => item._id === vendorId);
                await this.storeVendors(vendors);
                await this.storeCurrentVendor(updatedVendor);
                this.alertToggle({message: "New Vendor saved", isShow: true, type: "success"});
            } catch(err) {
                this.alertToggle({message: "Server error / Cannot update Vendor info", isShow: true, type: "error"})
            }
        },
        updateProp(e, prop) {
            const value = e.target.value;
            this.vendor[prop] = value;
        },
        updateGender({option}) {
            this.vendor.gender = option;
        },
        setTimezone(data) {
            this.vendor.timezone = data;
        },
        setNative({lang}) {
            this.vendor.native = lang;
        },
        chosenStatus({option}) {
            this.vendor.status = option;
        },
        cancel() {
            this.$router.go(-1);
        },
        chosenInd({industry}) {
            const index = this.vendor.industries.findIndex(item => item._id === industry._id);
            if(index !== -1) {
                return this.vendor.industries.splice(index, 1);
            }
            this.vendor.industries.push(industry);
        },
        ...mapActions({
            alertToggle: "alertToggle",
        })
    },
    computed: {
        selectedIndNames() {
            let result = [];
            if(this.vendor.industries.length) {
                for(let ind of this.vendor.industries) {
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
        ValidationErrors,
        SelectSingle,
        Sidebar,
        Asterisk
    },
    directives: {
        ClickOutside
    },
}
</script>


<style lang="scss" scoped>

.vendor-wrap {
    position: relative;
    width: 100%;
    display: flex;
}

.vendor-info {
    padding: 40px;
    box-sizing: border-box;
}

.title {
    font-size: 22px;
}
.gen-info, .rates {
    box-sizing: border-box;
    margin: 20px 10px 40px 10px;
    padding: 20px;
    box-shadow: 0 0 15px #67573e9d;
    width: 900px;
}

.gen-info {
    display: flex;
    justify-content: space-between;
    &__block {
        width: 36%;
        &:first-child {
            width: 22%;
            text-align: center;
        }
    }
    
}

.rates {
    padding: 10px;
}

.block-item {
    font-size: 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    &__label {
        margin-bottom: 0;
    }
    &_relative {
        position: relative;
    }
    &__drop-menu {
        position: relative;
        width: 191px;
        height: 28px;
        box-sizing: border-box;
    }
    &_high-index {
        z-index: 10;
    }
    &_medium-index {
        z-index: 8;
    }
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
    &_error-shadow {
        box-shadow: 0 0 5px red;
        border-radius: 5px;
    }
}

.buttons {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-left: 10px;
    width: 900px;
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
