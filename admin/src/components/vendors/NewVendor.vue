<template lang="pug">
  .vendor-wrap
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
              p.photo-text__message(v-if="!isFileError") upload your photo
                span.photo-extensions *.jpg/jpeg/png
                span.photo-size <= 2MB
            img.photo-image(v-if="imageExist")
            p.photo-text__error-message(v-if="isFileError") Incorrect file type or size
          .photo-wrap(v-if="vendor.photo")
            input.photo-file(type="file" @change="previewPhoto")
            img.photo-image(:src="vendor.photo")
        .gen-info__block
          .block-item
            label.block-item__label.block-item_relative First Name:
              Asterisk(:customStyle="asteriskStyle")
            input.block-item__input-field(:class="{'block-item_error-shadow': errors.includes('Please, enter valid first name.') && isSaveClicked}" type="text" placeholder="First Name" :value="vendor.firstName" @change="(e) => updateProp(e,'firstName')")
          .block-item
            label Surname:
            input.block-item__input-field(type="text" placeholder="Surname" :value="vendor.surname" @change="(e) => updateProp(e,'surname')")
          .block-item
            label.block-item__label.block-item_relative Email:
              Asterisk(:customStyle="asteriskStyle")
            input.block-item__input-field(:class="{'block-item_error-shadow': checkEmail() && isSaveClicked}" type="text" placeholder="Email" :value="vendor.email" @change="(e) => updateProp(e,'email')")
          .block-item
            label Phone:
            input.block-item__input-field(type="text" placeholder="Phone" :value="vendor.phone" @input="setPhone" ref="phone")
          .block-item
            label Time Zone:
            .block-item__drop-menu.block-item_high-index
              SelectSingle(
                :hasSearch="true"
                :options="timezones.map(item => item.zone)",
                :selectedOption="vendor.timezone",
                @chooseOption="setTimezone"
              )
          .block-item
            label.block-item__label Native Language:
            .block-item__drop-menu.block-item_medium-index
              SelectSingle(
                :selectedOption="vendor.native && vendor.native.lang ",
                :options="filteredLanguages.map(({lang}) => lang)",
                :hasSearch="true"
                placeholder="Native Language"
                @chooseOption="setNative"
              )
          .block-item.no-margin
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
            label.block-item__label.block-item_relative Industries:
              Asterisk(:customStyle="asteriskStyle")
            .block-item__drop-menu(:class="{'block-item_error-shadow': !vendor.industries.length && isSaveClicked}")
              SelectMulti(
                :hasSearch="true"
                :allOptionsButtons="true"
                placeholder="Select"
                :selectedOptions="vendor.industries.length ? vendor.industries.map(i => i.name) : []"
                :options="getAllIndustries.map(i => i.name)"
                @chooseOptions="setIndustries"
              )
      .delete-approve(v-if="approveShow")
        p Are you sure you want to delete?
        input.button.approve-block(type="button" value="Cancel" @click="cancelApprove")
        input.button(type="button" value="Delete" @click="approveVendorDelete")

    .vendor-subinfo
      .vendor-subinfo__general
        .block-item-subinfo
          label.block-item-subinfo__label Vendor Status:
            span.require *
          .block-item-subinfo__drop.block-item-subinfo_maxhigh-index(:class="{'block-item_error-shadow': isSaveClicked && !vendor.status}")
            SelectSingle(
              :options="statuses"
              :selectedOption="vendorStatus"
              @chooseOption="chosenStatus"
              placeholder="Vendor Status"
            )
        .block-item-subinfo
          label.block-item-subinfo__label Professional level:
          .block-item-subinfo__drop.block-item-subinfo_high-index
            SelectSingle(
              :options="['level1','level2']"
              placeholder="Level"
              :selectedOption="vendor.professionalLevel"
              @chooseOption="chooseProfessionalLevel"
            )
        .block-item-subinfo
          label.block-item-subinfo__label Test:
          .block-item-subinfo__check-item.checkbox
            input(type="checkbox" id="test" :checked="vendor.isTest" @change="setTest")
            label(for="test")

    ValidationErrors(v-if="areErrorsExist"
      :errors="errors"
      @closeErrors="closeErrors"
    )
</template>

<script>
import ClickOutside from "vue-click-outside"
import ValidationErrors from "../ValidationErrors"
import SelectSingle from "../SelectSingle"
import Asterisk from "../Asterisk"
import { mapGetters, mapActions } from "vuex"
import photoPreview from "@/mixins/photoPreview"
import SelectMulti from "../SelectMulti"

export default {
  mixins: [ photoPreview ],
  data() {
    return {
      areErrorsExist: false,
      isSaveClicked: false,
      vendorShow: true,
      imageExist: false,
      timezones: [],
      approveShow: false,
      photoFile: [],
      genders: [ "Male", "Female", "Other" ],
      asteriskStyle: { top: "0px" },
      errors: [],
      vendor: {
        basicRate: "",
        companyName: "",
        email: "",
        firstName: "",
        surname: "",
        gender: "",
        linkedin: "",
        native: null,
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
        position: [],
        isTest: false,
        professionalLevel: "",
        isCreatedByManager: true
      },
      isFileError: false,
      onlySpaces: /^\s+$/,
      searchLang: '',
      statuses: [ "Active", "Inactive", "Potential" ]
    }
  },
  methods: {
    setTest() {
      this.vendor.isTest = event.target.checked
    },
    closeErrors() {
      this.areErrorsExist = false
    },
    checkEmail() {
      const emailValidRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
      return (
          !this.vendor.email ||
          !emailValidRegex.test(this.vendor.email.toLowerCase())
      )
    },
    setPhone(e) {
      const { value } = e.target
      const regex = /^[0-9]+$/
      const characters = value.split("").filter(item => regex.test(item))
      const clearedValue = characters.join("")
      this.vendor.phone =
          clearedValue.length > 19 ? clearedValue.slice(0, 19) : clearedValue
      this.$refs.phone.value = this.vendor.phone
    },
    async checkUniqueEmailInVendors() {
      let isExists = false
      try {
        const result = await this.$http.get(`/vendors/application/unique-email?email=${ this.vendor.email }`)
        isExists = !!result.data
      } catch (err) {
        this.alertToggle({
          message: "Error on email uniqueness checking",
          isShow: true,
          type: "error"
        })
      }
      return isExists
    },
    async checkForErrors() {
      const textReg = /^[-\sa-zA-Z]+$/
      this.errors = []
      if (!this.vendor.firstName || !textReg.test(this.vendor.firstName))
        this.errors.push("Please, enter valid first name.")
      if (this.onlySpaces.exec(this.vendor.firstName)) {
        this.errors.push("Please, enter valid first name.")
      }
      if (this.vendor.surname && !textReg.test(this.vendor.surname))
        this.errors.push("Please, enter valid surname.")
      if (!this.vendor.industries.length)
        this.errors.push("Please, choose at least one industry.")
      if (!this.vendor.status) this.errors.push("Please, choose status.")
      if (this.checkEmail()) {
        this.errors.push("Please provide a valid email.")
      }
      if (await this.checkUniqueEmailInVendors()) {
        this.errors.push("The email you've entered is already used in our system!")
      }
      if (this.errors.length) {
        this.areErrorsExist = true
        this.isSaveClicked = true
        return
      }
      await this.saveVendor()
    },
    async saveVendor() {
      let sendData = new FormData()
      sendData.append("vendor", JSON.stringify(this.vendor))
      sendData.append("photo", this.photoFile[0])
      try {
        await this.saveNewVendor(sendData)
        this.alertToggle({ message: "New Vendor saved", isShow: true, type: "success" })
        this.$router.push(`/pangea-vendors/all/details/${ this.currentVendor._id }`)
      } catch (err) {
        this.alertToggle({ message: "Server error / Cannot update Vendor info", isShow: true, type: "error" })
      }
    },
    updateProp(e, prop) {
      const value = e.target.value
      this.vendor[prop] = value
    },
    updateGender({ option }) {
      this.vendor.gender = option
    },
    setTimezone({ option }) {
      this.vendor.timezone = option
    },
    setNative(value) {
      const { _id, lang } = this.filteredLanguages.find(({ lang }) => lang === value.option)
      this.vendor.native = { _id, lang }
    },
    setIndustries({ option }) {
      let industries = this.vendor.industries
      const position = industries.findIndex(item => item.name === option)
      if (position !== -1) industries.splice(position, 1)
      else industries.push(this.getAllIndustries.find(item => item.name === option))
    },
    async getTimezones() {
      try {
        const result = await this.$http.get('/api/timezones')
        this.timezones = result.data
      } catch (err) {
        console.log(err)
      }
    },
    chooseProfessionalLevel({ option }) {
      this.vendor.professionalLevel = option
    },
    chosenStatus(value) {
      this.vendor.status = value.option
    },
    cancel() {
      this.$router.go(-1)
    },
    chosenInd({ industry }) {
      const index = this.vendor.industries.findIndex(
          item => item._id === industry._id
      )
      if (index !== -1) {
        return this.vendor.industries.splice(index, 1)
      }
      this.vendor.industries.push(industry)
    },
    ...mapActions({
      alertToggle: "alertToggle",
      saveNewVendor: "saveNewVendor"
    })
  },
  computed: {
    ...mapGetters({
      currentVendor: "getCurrentVendor",
      languages: "getAllLanguages",
      getAllIndustries: "getAllIndustries"
    }),
    filteredLanguages() {
      let result = this.languages
      if (this.addAll) {
        result.unshift({ lang: "All", symbol: "All" })
      }
      result = result.filter(item => {
        if (item.lang.toLowerCase().indexOf(this.searchLang.toLowerCase()) != -1) {
          return item
        }
      })
      return result
    },
    vendorStatus() {
      if (!this.vendor.status) {
        this.vendor.status = 'Potential'
      }
      return this.vendor.status
    },
    selectedIndNames() {
      let result = []
      if (this.vendor.industries.length) {
        for (let ind of this.vendor.industries) {
          result.push(ind.name)
        }
      }
      return result
    }
  },
  created() {
    this.getTimezones()
  },
  components: {
    SelectMulti,
    ValidationErrors,
    SelectSingle,
    Asterisk
  },
  directives: {
    ClickOutside
  }
}
</script>


<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.vendor-wrap {
  display: flex;
}

.vendor-subinfo {
  &__general {
    padding: 20px;
    margin-top: 145px;
    width: 350px;
    box-shadow: rgba(81, 68, 48, 0.3) 0px 1px 2px 0px, rgba(81, 68, 48, 0.15) 0px 1px 3px 1px;
    margin-left: 40px;
    background: white;
    border-radius: 4px;
  }
}

.block-item-subinfo {
  display: flex;
  height: 50px;

  &__error-shadow {
    height: 30px;
  }

  &__check-item {
    width: 220px;
  }

  &__last {
    height: 30px;
  }

  &_maxhigh-index {
    z-index: 12;
  }

  &_high-index {
    z-index: 10;
  }

  &__label {
    width: 160px;
    padding-top: 6px;
  }

  &__drop {
    position: relative;
    width: 220px;
  }
}

.block-item-subinfo:last-child {
  height: 30px;
}

.vendor-wrap {
  position: relative;
  width: 100%;
  display: flex;
  min-height: 94vh;
}

.vendor-info {
  box-sizing: border-box;
  width: 1000px;
  margin: 50px 0 50px 50px;
}

.title {
  font-size: 21px;
  padding: 30px 0 10px;
  width: 1000px;
}

.gen-info,
.rates {
  box-sizing: border-box;
  padding: 20px;
  box-shadow: rgba(81, 68, 48, 0.3) 0px 1px 2px 0px, rgba(81, 68, 48, 0.15) 0px 1px 3px 1px;
  width: 1000px;
  border-radius: 4px;
  background-color: white;
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

.rates {
  padding: 10px;
}

.require {
  font-size: 14px;
  color: red;
  margin-left: 2px;
}

.block-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  &__check-item {
    width: 220px;
  }

  &__label {
    margin-bottom: 0;
  }

  &_relative {
    position: relative;
  }

  &__drop-menu {
    position: relative;
    width: 210px;
    height: 30px;
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
    color: $text;
    border: 1px solid $border;
    border-radius: 4px;
    box-sizing: border-box;
    padding: 0 7px;
    outline: none;
    width: 210px;
    height: 32px;
    transition: .1s ease-out;

    &:focus {
      border: 1px solid $border-focus;
    }
  }

  ::-webkit-input-placeholder {
    opacity: 0.5;
  }

  &_error-shadow {
    box-shadow: 0 0 5px red;
    border-radius: 4px;
    height: 31px;
  }
}

#test {
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
      border: 1px solid #c1bbb1;
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

.buttons {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-left: 10px;
  width: 1000px;
}

.button {
  min-width: 120px;
  padding: 0 24px 0 24px;
  margin: 0 10px;
  height: 32px;
  color: $white;
  font-size: 14px;
  border-radius: 4px;
  background-color: $orange;
  border: none;
  transition: .1s ease;
  outline: none;
  letter-spacing: 0.2px;

  &:hover {
    cursor: pointer;
    box-shadow: rgba(81, 68, 48, 0.3) 0px 1px 2px 0px, rgba(81, 68, 48, 0.15) 0px 1px 3px 1px;
  }

  &:active {
    transform: scale(.98);
  }

  .delete-approve & {
    margin-left: 0;
  }
}

.photo-wrap {
  width: 195px;
  height: 160px;
  border: 1px solid #c1bbb1;
  position: relative;
  overflow: hidden;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;

  .photo-image {
    max-width: 100%;
    max-height: 100%;
  }
}

.photo-file {
  position: absolute;
  top: -25px;
  left: 0px;
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
  box-shadow: rgba(81, 68, 48, 0.3) 0px 1px 2px 0px, rgba(81, 68, 48, 0.15) 0px 1px 3px 1px;
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

.no-margin {
  margin-bottom: 0;
}
</style>
