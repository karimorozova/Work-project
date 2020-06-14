<template lang="pug">
.vendor-wrap
    .vendor-info
        .buttons
            input.button(type="button" value="Save" @click="checkForErrors")
            input.button(type="button" value="Cancel" @click="cancel")
            input.button(type="button" value="Delete" @click="deleteVendor")
        .title General Information
        .vendor-details
            .gen-info
                .gen-info__block
                    .photo-wrap(v-if="!currentVendor.photo")
                        input.photo-file(type="file" @change="previewPhoto")
                        .photo-text(v-if="!imageExist")
                            p.photo-text__message(v-if="!isFileError") upload your photo
                                span.photo-extensions *.jpg/jpeg/png
                                span.photo-size <= 2MB
                        img.photo-image(v-if="imageExist")
                        p.photo-text__error-message(v-if="isFileError") Incorrect file type or size
                    .photo-wrap(v-if="currentVendor.photo")
                        input.photo-file(type="file" @change="previewPhoto")                       
                        img.photo-image(:src="currentVendor.photo")
                    label.job-title Job title
                .gen-info__block
                    .block-item
                        label.block-item__label.block-item_relative First Name:
                            Asterisk(:customStyle="asteriskStyle")
                        input.block-item__input-filed(:class="{'block-item_error-shadow': !currentVendor.firstName && isSaveClicked}" type="text" placeholder="First Name" :value="currentVendor.firstName" @change="(e) => updateProp(e,'firstName')")
                    .block-item
                        label Surname:
                        input.block-item__input-filed(type="text" placeholder="Surname" :value="currentVendor.surname" @change="(e) => updateProp(e,'surname')")
                    .block-item
                        label.block-item__label.block-item_relative Email:
                            Asterisk(:customStyle="asteriskStyle")
                        input.block-item__input-filed(:class="{'block-item_error-shadow': validateEmail() && isSaveClicked}" type="text" placeholder="Email" :value="currentVendor.email" @change="(e) => updateProp(e,'email')")
                    .block-item
                        label Phone:
                        input.block-item__input-filed(type="text" placeholder="Phone" :value="currentVendor.phone" @input="setPhone" ref="phone")
                    .block-item
                        label Time Zone:
                        .block-item__drop-menu.block-item_high-index
                            TimezoneSelect(:timezoneSelected="currentVendor.timezone" @chosenZone="setTimezone")
                    .block-item
                        label.block-item__label.block-item_relative Native Language:
                        .block-item__drop-menu.block-item_medium-index(:class="{'block-item_error-shadow': !currentVendor.native && isSaveClicked}")
                            NativeLanguageSelect(:selectedLang="currentVendor.native" @chosenLang="setNative")
                    .block-item
                        label Gender:
                        .block-item__drop-menu
                            SelectSingle(
                                :options="genders"
                                :selectedOption="currentVendor.gender"
                                placeholder="Gender"
                                @chooseOption="updateGender"
                            )
                    .block-item
                        label Test:
                        .block-item__check-item.checkbox
                          input(type="checkbox" id="test" :checked="currentVendor.isTest" @change="setTest")
                          label(for="test")
                .gen-info__block
                    .block-item
                        label Company Name:
                        input.block-item__input-filed(type="text" placeholder="Company Name" :value="currentVendor.companyName" @change="(e) => updateProp(e,'companyName')")
                    .block-item
                        label Website:
                        input.block-item__input-filed(type="text" placeholder="Website" :value="currentVendor.website" @change="(e) => updateProp(e,'website')")
                    .block-item
                        label Skype:
                        input.block-item__input-filed(type="text" placeholder="Skype" :value="currentVendor.skype" @change="(e) => updateProp(e,'skype')")
                    .block-item
                        label Linkedin:
                        input.block-item__input-filed(type="text" placeholder="Linkedin" :value="currentVendor.linkedin" @change="(e) => updateProp(e,'linkedin')")
                    .block-item
                        label WhatsApp:
                        input.block-item__input-filed(type="text" placeholder="WhatsApp" :value="currentVendor.whatsapp" @change="(e) => updateProp(e,'whatsapp')")
                    .block-item
                        label.block-item__label.block-item_relative Vendor Status:
                            Asterisk(:customStyle="asteriskStyle")
                        .block-item__drop-menu.block-item_high-index(:class="{'block-item_error-shadow': isSaveClicked && !currentVendor.status}")
                            VendorStatusSelect(isAllExist="no" :selectedStatus="currentVendor.status" @chosenStatus="chosenStatus")
                    .block-item
                        label Industries:
                        .block-item__drop-menu(:class="{'block-item_error-shadow': isSaveClicked && !currentVendor.industries.length}")
                            MultiVendorIndustrySelect(:selectedInd="currentVendor.industries || []" :filteredIndustries="selectedIndNames" @chosenInd="chosenInd")
            
            .right-informational-block
                VendorCandidate(:candidateData='currentVendor' v-if="currentVendor.status === 'Potential'")
                VendorAction(@openPreview="openPreview")

        .vendor-info__preview(v-if="isEditAndSend")
            VendorPreview(@closePreview="closePreview" :message="'<p>Message...</p>'" @send="sendQuote")
         
        .title Qualifications
            TableQualifications(:qualificationData="qualificationData" :assessmentData="assessmentData" :currentVendor="currentVendor" :vendorIndustries="currentVendor.industries" @refreshQualifications="setDetailsTablesData")

        .title Documents
            TableDocuments(:documentsData="documentsData" :vendorId="vendorId" @refreshDocuments="setDetailsTablesData")

        .title Assessment
            TableAssessment(:assessmentData="assessmentData" :currentVendor="currentVendor" @refreshAssessment="setDetailsTablesData")
        
        .title Professional experience
            TableProfessionalExperience(:professionalExperienceData="professionalExperienceData" :vendorId="vendorId" @refreshProfExperiences="setDetailsTablesData")

        .title Education 
            TableEducation(:educationData="educationData" :vendorId="vendorId" @refreshEducations="setDetailsTablesData")

        .title(v-if="currentVendor._id") Rates    
        .rates(v-if="currentVendor._id")
            VendorRates(:vendor="currentVendor"
                @updateVendor="updateVendor")
        .delete-approve(v-if="isApproveModal")
            p Are you sure you want to delete?
            input.button.approve-block(type="button" value="Cancel" @click="cancelApprove")
            input.button(type="button" value="Delete" @click="approveVendorDelete")

    ValidationErrors(v-if="areErrorsExist"
        :errors="errors"
        @closeErrors="closeErrors"
    )
</template>

<script>
import VendorPreview from "./VendorPreview";
import VendorAction from "./VendorAction";
import VendorCandidate from "./VendorCandidate";
import TableQualifications from "./TableQualifications";
import TableProfessionalExperience from "./TableProfessionalExperience";
import TableEducation from "./TableEducation";
import TableDocuments from "./TableDocuments";
import TableAssessment from "./TableAssessment";
import ClickOutside from "vue-click-outside";
import VendorStatusSelect from "./VendorStatusSelect";
import VendorLeadsourceSelect from "./VendorLeadsourceSelect";
import MultiVendorIndustrySelect from "./MultiVendorIndustrySelect";
import NativeLanguageSelect from "./NativeLanguageSelect";
import TimezoneSelect from "../clients/TimezoneSelect";
import ValidationErrors from "../ValidationErrors";
import SelectSingle from "../SelectSingle";
import Asterisk from "../Asterisk";
import VendorRates from "./VendorRates";
import Addseverallangs from "../finance/Addseverallangs";
import AvailablePairs from "../finance/pricelists/AvailablePairs";
import { mapGetters, mapActions } from "vuex";
import photoPreview from "@/mixins/photoPreview";

export default {
  mixins: [photoPreview],
  data() {
    return {
      vendorId: "",
      educationData: [],
      professionalExperienceData: [],
      qualificationData: [],
      documentsData: [],
      assessmentData: [],
      areErrorsExist: false,
      isSaveClicked: false,
      vendorShow: true,
      imageExist: false,
      isApproveModal: false,
      asteriskStyle: { top: "-4px" },
      photoFile: [],
      genders: ["Male", "Female"],
      errors: [],
      langPairs: [],
      addSeveralPriceId: "",
      oldEmail: "",
      isFileError: false,
      isEditAndSend: false
    };
  },
  methods: {
    async setTest(){
      const vendor = {
          id: this.currentVendor._id,
          isTest: event.target.checked
      };
      try {
          await this.updateVendorStatus(vendor);
          this.alertToggle({message: "Vendor status updated", isShow: true, type: "success"});
        } catch (err) {
          this.alertToggle({
              message: "Server error / Cannot update Vendor status",
              isShow: true,
              type: "error"
          });
        }
    },
    closePreview() {
      this.isEditAndSend = false;
    },
    openPreview() {
      this.isEditAndSend = true;
    },
    async sendQuote(message) {
      try {
        console.log(message);
      } catch (err) {
        this.alertToggle({ message: err.message, isShow: true, type: "error" });
      }
      this.closePreview();
    },
    closeLangPairs() {
      this.isAvailablePairs = false;
    },
    deleteVendor() {
      this.isApproveModal = true;
    },
    cancelApprove() {
      this.isApproveModal = false;
    },
    closeErrors() {
      this.areErrorsExist = false;
    },
    validateEmail() {
      const emailValidRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
      return (
        !this.currentVendor.email ||
        !emailValidRegex.test(this.currentVendor.email.toLowerCase())
      );
    },
    setPhone(e) {
      const { value } = e.target;
      const regex = /^[0-9]+$/;
      const characters = value.split("").filter(item => regex.test(item));
      const clearedValue = characters.join("");
      const phoneValue =
        clearedValue.length > 19 ? clearedValue.slice(0, 19) : clearedValue;
      this.$refs.phone.value = phoneValue;
      this.updateVendorProp({ prop: "phone", value: phoneValue });
    },
    async checkEmail() {
      if (this.validateEmail()) {
        return this.errors.push("Please provide a valid email.");
      }
      if (
        this.oldEmail.toLowerCase() !== this.currentVendor.email.toLowerCase()
      ) {
        try {
          const result = await this.$http.get(
            `/vendors/application/unique-email?email=${this.currentVendor.email}`
          );
          const isUnique = !result.data;
          isUnique
            ? ""
            : this.errors.push(
                "The email you've entered is already used in our system!"
              );
        } catch (err) {
          this.alertToggle({
            message: "Error on email uniqueness checking",
            isShow: true,
            type: "error"
          });
        }
      }
    },
    async checkForErrors() {
      const textReg = /^[-\sa-zA-Z]+$/;
      try {
        this.errors = [];
        if (
          !this.currentVendor.firstName ||
          !textReg.test(this.currentVendor.firstName)
        )
          this.errors.push("Please, enter valid first name.");
        if (
          this.currentVendor.surname &&
          !textReg.test(this.currentVendor.surname)
        )
          this.errors.push("Please, enter valid surname.");
        if (!this.currentVendor.industries.length)
          this.errors.push("Please, choose at least one industry.");
        if (!this.currentVendor.status)
          this.errors.push("Please, choose status.");
        await this.checkEmail();
        if (this.errors.length) {
          this.areErrorsExist = true;
          this.isSaveClicked = true;
          return;
        }
        await this.updateVendor();
      } catch (err) {}
    },
    async updateVendor() {
      let sendData = new FormData();
      sendData.append("vendor", JSON.stringify(this.currentVendor));
      sendData.append("photo", this.photoFile[0]);
      try {
        await this.updateCurrentVendor(sendData);
        this.oldEmail = this.currentVendor.email;
        this.alertToggle({
          message: "Vendor info updated",
          isShow: true,
          type: "success"
        });
      } catch (err) {
        this.alertToggle({
          message: "Server error / Cannot update Vendor info",
          isShow: true,
          type: "error"
        });
      }
    },
    updateProp(e, prop) {
      const value = e.target.value;
      this.updateVendorProp({ prop, value });
    },
    updateGender({ option }) {
      this.updateVendorProp({ prop: "gender", value: option });
    },
    setTimezone(data) {
      this.updateVendorProp({ prop: "timezone", value: data });
    },
    setNative({ lang }) {
      this.updateVendorProp({ prop: "native", value: lang });
    },
    chosenStatus({ option }) {
      this.updateVendorProp({ prop: "status", value: option });
    },
    cancel() {
      this.$router.go(-1);
    },
    async approveVendorDelete() {
      this.isApproveModal = false;
      if (!this.currentVendor._id) {
        return this.cancel();
      }
      try {
        const isAssigned = await this.$http.get(
          `/vendorsapi/any-step?id=${this.currentVendor._id}`
        );
        if (isAssigned.body) {
          return this.alertToggle({
            message: "The vendor was assigned to a step and cannot be deleted.",
            isShow: true,
            type: "error"
          });
        }
        await this.deleteCurrentVendor({ id: this.currentVendor._id });
        this.alertToggle({
          message: "Vendor removed",
          isShow: true,
          type: "success"
        });
        this.$router.go(-1);
      } catch (err) {
        this.alertToggle({
          message: "Server error / Cannot delete the Vendor",
          isShow: true,
          type: "error"
        });
      }
    },
    chosenInd({ industry }) {
      this.updateIndustry(industry);
    },
    setDetailsTablesData() {
      this.educationData = Array.from(this.currentVendor.educations);
      this.professionalExperienceData = Array.from(
        this.currentVendor.profExperiences
      );
      this.qualificationData = Array.from(this.currentVendor.qualifications);
      this.documentsData = Array.from(this.currentVendor.documents);
      this.assessmentData = Array.from(this.currentVendor.assessments);
    },
    async getVendor() {
      this.vendorId = this.$route.params.id;
      const id = this.$route.params.id;
      try {
        if (!this.currentVendor._id) {
          const vendor = await this.$http.get(`/vendorsapi/vendor?id=${id}`);
          await this.storeCurrentVendor(vendor.body);
          this.oldEmail = this.currentVendor.email;
        }
        this.setDetailsTablesData();
      } catch (err) {
        this.alertToggle({
          message: "Error on getting Vendor's info",
          isShow: true,
          type: "error"
        });
      }
    },
    ...mapActions({
      alertToggle: "alertToggle",
      updateVendorProp: "updateVendorProp",
      updateCurrentVendor: "updateCurrentVendor",
      deleteCurrentVendor: "deleteCurrentVendor",
      storeCurrentVendor: "storeCurrentVendor",
      updateIndustry: "updateIndustry",
      getDuoCombinations: "getVendorDuoCombinations",
      updateVendorStatus: "updateVendorStatus"

    })
  },
  beforeDestroy() {
    this.storeCurrentVendor({});
  },
  computed: {
    ...mapGetters({
      currentVendor: "getCurrentVendor"
    }),
    selectedIndNames() {
      let result = [];
      if (
        this.currentVendor.industries &&
        this.currentVendor.industries.length
      ) {
        for (let ind of this.currentVendor.industries) {
          result.push(ind.name);
        }
      }
      return result;
    }
  },
  components: {
    VendorPreview,
    VendorCandidate,
    VendorAction,
    TableQualifications,
    TableAssessment,
    TableDocuments,
    TableEducation,
    TableProfessionalExperience,
    VendorLeadsourceSelect,
    VendorStatusSelect,
    MultiVendorIndustrySelect,
    NativeLanguageSelect,
    TimezoneSelect,
    ValidationErrors,
    VendorRates,
    Asterisk,
    Addseverallangs,
    AvailablePairs,
    SelectSingle
  },
  directives: {
    ClickOutside
  },
  created() {
    this.getVendor();
  },
  mounted() {
    this.oldEmail = this.currentVendor.email;
  }
};
</script>


<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.vendor-details {
  .right-informational-block {
    position: absolute;
    top: 118px;
    left: 1070px;
  }
}

.vendor-wrap {
  position: relative;
  width: 100%;
  display: flex;
}

.vendor-info {
  padding: 40px;
  position: relative;
  width: 1020px;

  &__preview {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 100;
  }
}

.title {
  font-size: 22px;
}
.gen-info,
.rates {
  box-sizing: border-box;
  margin: 20px 10px 40px 10px;
  padding: 20px;
  box-shadow: 0 0 15px #67573e9d;
}

.gen-info {
  display: flex;
  justify-content: space-between;
  &__block {
    width: 32%;
    &:first-child {
      width: 20%;
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
  &__check-item{
    width: 190px;
  }
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
  &__input-filed {
    font-size: 14px;
    color: #67573e;
    border: 1px solid #67573e;
    border-radius: 5px;
    padding: 0 5px;
    outline: none;
    width: 191px;
    height: 30px;
    box-sizing: border-box;
  }
  ::-webkit-input-placeholder {
    opacity: 0.5;
  }
  &_error-shadow {
    box-shadow: 0 0 5px red;
    border-radius: 5px;
  }
  #test{
    width: 0;
  }
  .checkbox {
        display: flex;
        height: 28px;
        input[type="checkbox"] {
        opacity: 0;
        + {
            label {
            &::after {
                content: none;
            }
            }
        }
        &:checked {
            + {
            label {
                &::after {
                content: "";
                }
            }
            }
        }
        }
        label {
        position: relative;
        display: inline-block;
        padding-left: 22px;
        padding-top: 4px;
        &::before {
            position: absolute;
            content: "";
            display: inline-block;
            height: 16px;
            width: 16px;
            border: 1px solid;
            left: 0px;
            top: 3px;
        }
        &::after {
            position: absolute;
            content: "";
            display: inline-block;
            height: 5px;
            width: 9px;
            border-left: 2px solid;
            border-bottom: 2px solid;
            transform: rotate(-45deg);
            left: 4px;
            top: 7px;
        }
      }
    }
}

.buttons {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 10px;
  box-sizing: border-box;
  width: 1020px;
}

.button {
  margin-left: 30px;
  width: 138px;
  height: 33px;
  color: white;
  font-size: 14px;
  border-radius: 10px;
  -webkit-box-shadow: 0 3px 5px rgba(0, 0, 0, 0.4);
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.4);
  background-color: #d15f45;
  border: 1px solid #d15f45;
  cursor: pointer;
  outline: none;
  .delete-approve & {
    margin-left: 0;
  }
}

.photo-wrap {
  width: 180px;
  height: 157px;
  border: 1px solid #67573e;
  position: relative;
  overflow: hidden;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
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
  cursor: pointer;
}

.photo-text {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  &__message {
    font-size: 18px;
    opacity: 0.5;
    width: 50%;
    text-align: center;
  }
  &__error-message {
    position: absolute;
    bottom: 30%;
    z-index: 10;
    background-color: $white;
    padding: 3px;
    box-sizing: border-box;
    color: $orange;
  }
}

.photo-extensions,
.photo-size {
  display: block;
  font-size: 12px;
  margin-top: 10px;
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
  box-shadow: 0 0 10px #67573e;
  background-color: #fff;
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
