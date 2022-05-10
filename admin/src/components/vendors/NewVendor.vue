<template lang="pug">
  .container
    .vendor-info__radio
      RadioButton.radio(name="Agency" :selected="vendor.vendorType" @toggleRadio="toggleRadio")
      RadioButton.radio(name="Individual" :selected="vendor.vendorType" @toggleRadio="toggleRadio")
    .general-wrapper

      .left-side
        .gen-info
          ValidationErrors(
            v-if="areErrorsExist"
            :errors="errors"
            :isAbsolute="true"
            @closeErrors="closeErrors"
          )
          .vendorInformation
            .vendorInformation__line1
              .row
                .row__key
                  span First Name:
                  span.require *
                .row__value
                  input.input(
                    type="text"
                    placeholder="Value"
                    :value="vendor.firstName"
                    @change="(e) => updateProp(e,'firstName')"
                  )
              .row
                .row__key
                  span Surname:
                  span.require *
                .row__value
                  input.input(
                    type="text"
                    placeholder="Value"
                    :value="vendor.surname"
                    @change="(e) => updateProp(e,'surname')"
                  )
              .row
                .row__key
                  span Email:
                  span.require *
                .row__value
                  input.input(
                    type="text"
                    placeholder="Value"
                    :value="vendor.email"
                    @change="(e) => updateProp(e,'email')"
                  )

            .vendorInformation__line2
              .vendorInformation__photo
                .photo-wrap(v-if="!vendor.photo")
                  input.photo-file(type="file" @change="previewPhoto")
                  .photo-text(v-if="!isImageExist")
                    p.photo-text__message(v-if="!isFileError") Upload File
                      br
                      span.photo-extensions *.jpg/jpeg/png
                      span.photo-size <= 3MB
                  img.photo-image(v-if="isImageExist")
                  p.photo-text__error-message(v-if="isFileError") Incorrect file type or size
                .photo-wrap(v-if="vendor.photo")
                  input.photo-file(type="file" @change="previewPhoto")
                  img.photo-image(:src="contact.photo")
              .vendorInformation__description
                .row.mbRow
                  .row__key Phone:
                  .row__value
                    input.input( type="text" placeholder="Value" :value="vendor.phone" @input="setPhone" ref="phone")
                .row.mbRow
                  .row__key Time Zone:
                  .row__value
                    SelectSingle(
                      :hasSearch="true"
                      placeholder="Option"
                      :options="timezones",
                      :selectedOption="vendor.timezone",
                      @chooseOption="setTimezone"
                    )
                .row.mbRow
                  .row__key Native Language:
                  .row__value
                    SelectSingle(
                      :selectedOption="vendor.native ? vendor.native.lang: ''",
                      :options="filteredLanguages.map(({lang}) => lang)",
                      :hasSearch="true"
                      placeholder="Option"
                      @chooseOption="setNative"
                    )

                .row
                  .row__key Gender:
                  .row__value
                    SelectSingle(
                      :options="genders"
                      :selectedOption="vendor.gender"
                      placeholder="Option"
                      @chooseOption="updateGender"
                    )
                .row
                  .row__key Currency:
                  .row__value
                    SelectSingle(
                      :options="currencyList"
                      :selectedOption="vendor.currency"
                      placeholder="Option"
                      @chooseOption="updateCurrency"
                    )
                .row
                  .row__key CAT experience:
                    .row__value
                      SelectMulti(
                        :selectedOptions="vendor.catExperience"
                        :isTableDropMenu="true"
                        placeholder="Options"
                        :hasSearch="false"
                        :options="catExperienceList"
                        @chooseOptions="chooseCatExperienceOptions"
                      )
                .row.mtRow.company(v-if="isAgency === 'Agency'" )
                  .row__key Company Name:
                    .row__value
                      input.input(type="text" placeholder="Value" :value="vendor.companyName" @change="(e) => updateProp(e,'companyName')")
                .row.mtRow.website(v-if="isAgency === 'Agency'" )
                  .row__key Website:
                    .row__value
                      input.input(type="text" placeholder="Value" :value="vendor.website" @change="(e) => updateProp(e,'website')")

        .saveButtons
          Button(value="Save" @clicked="checkForErrors")
          Button(value="Cancel" :outline="true" @clicked="cancel")


      VendorSubDetails(
        :vendor="vendor"
        @setVendorProp="setVendorProp"
      )

</template>

<script>
import ClickOutside from "vue-click-outside"
import ValidationErrors from "../ValidationErrors"
import SelectSingle from "../SelectSingle"
import Asterisk from "../Asterisk"
import { mapActions, mapGetters } from "vuex"
import photoPreview from "../../mixins/photoPreview"
import SelectMulti from "../SelectMulti"
import CheckBox from "../CheckBox"
import VendorSubDetails from "./VendorSubDetails"
import Button from "../Button"
import moment from "moment-timezone";
import RadioButton from "../RadioButton"

export default {
  mixins: [ photoPreview ],
  data() {
    return {
      areErrorsExist: false,
      isSaveClicked: false,
      isImageExist: false,
      timezones: [],
      approveShow: false,
      photoFile: [],
      genders: [ "Male", "Female", "Other" ],
      errors: [],
      currencyList: [ 'EUR' ],
      catExperienceList: [ 'XTM', 'MemoQ', 'Trados' ],
      isAgency: false,


      vendor: {
        email: "",
        firstName: "",
        surname: "",
        gender: "",
        native: null,
        phone: "",
        photo: "",
        skype: "",
        status: "Active",
        timezone: "",
        isTest: false,
        isCreatedByManager: true,
        catExperience: [],
        currency: '',
        vendorType: 'Individual',
        website: '',
        companyName: '',
      },

      isFileError: false,
      onlySpaces: /^\s+$/,
      searchLang: ''
    }
  },
  methods: {
    setVendorProp({ prop, value }) {
      this.vendor[prop] = value
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
      if (!this.vendor.firstName || !textReg.test(this.vendor.firstName)) this.errors.push("Please, enter valid first name.")
      if (this.onlySpaces.exec(this.vendor.firstName)) this.errors.push("Please, enter valid first name.")
      if (!this.vendor.surname || !textReg.test(this.vendor.surname)) this.errors.push("Please, enter valid surname.")
      if (this.checkEmail()) this.errors.push("Please provide a valid email.")
      if (await this.checkUniqueEmailInVendors()) this.errors.push("The email you've entered is already used in our system!")

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
      this.vendor[prop] = e.target.value
    },
    updateGender({ option }) {
      this.vendor.gender = option
    },
    updateCurrency({ option }) {
      this.vendor.currency = option
    },
    setTimezone({ option }) {
      // this.updateCurrentVendorGeneralData({ key: 'timezone', value: option })
      // this.timezone = this.currentVendor.timezone
      this.vendor.timezone = option
    },
    setNative(value) {
      const { _id, lang } = this.filteredLanguages.find(({ lang }) => lang === value.option)
      this.vendor.native = { _id, lang }
    },
    chooseCatExperienceOptions({ option }) {
      const cat = [ ...this.vendor.catExperience ]
      const position = cat.indexOf(option)
      if (position !== -1) {
        cat.splice(position, 1)
      } else {
        cat.push(this.catExperienceList.find((item) => item === option))
      }
      this.vendor.catExperience = cat
    },
    async toggleRadio({ value }) {


      this.vendor.vendorType = value
      // await this.updateCurrentVendor({ vendor: JSON.stringify(vendor) })
      // this.alertToggle({ message: "Updated", isShow: true, type: "success" })
      this.isAgency = this.vendor.vendorType

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
      languages: "getAllLanguages"
    }),
    filteredLanguages() {
      let result = this.languages
      if (this.addAll) {
        result.unshift({ lang: "All", symbol: "All" })
      }
      result = result.filter(item => {
        if (item.lang.toLowerCase().indexOf(this.searchLang.toLowerCase()) !== -1) {
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
    this.timezones = moment.tz.names()
  },
  components: {
    Button,
    VendorSubDetails,
    CheckBox,
    SelectMulti,
    ValidationErrors,
    SelectSingle,
    Asterisk,
    RadioButton
  },
  directives: {
    ClickOutside
  }
}
</script>


<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";
.container {
  padding: 50px 0 50px 50px;
}
.general-wrapper {
  display: flex;

}

.vendorInformation {
  width: 100%;

  &__photo {
    width: 210px;
    margin-top: -60px;
    margin-left: 60px;
  }

  &__line2 {
    display: flex;
  }

  &__line1 {
    background-color: $light-background;
    padding: 25px;
    display: flex;
    justify-content: space-between;
    padding-left: 270px;
  }

  &__description {
    box-sizing: border-box;
    padding: 25px 25px 25px 0;
    width: 770px;
    display: flex;
    justify-content: space-between;
    box-sizing: border-box;
    flex-wrap: wrap;
  }
}

.gen-info {
  box-sizing: border-box;
  box-shadow: $box-shadow;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 1040px;
  width: 1040px;
  border-radius: 2px;
  background: white;
  height: fit-content;
  position: relative;
}

.require {
  color: $red;
}

.row {
  &__key {
    margin-bottom: 3px;
  }

  &__value {
    width: 220px;
    background-color: powderbluer;
    position: relative;
    height: 32px;
  }
}

.input {
  font-size: 14px;
  color: $text;
  border: 1px solid $border;
  border-radius: 2px;
  box-sizing: border-box;
  padding: 0 7px;
  outline: none;
  width: 220px;
  height: 32px;
  transition: .1s ease-out;

  &:focus {
    border: 1px solid $border-focus;
  }
}

.saveButtons {
  display: flex;
  justify-content: center;
  margin-top: 25px;
  gap: 20px;
}

.mbRow {
  margin-bottom: 15px;
}
.mtRow {
  margin-top: 15px;
}
.website {
  margin-right: auto;
}
.company {
  margin-right: 43.5px;
}

//Photo
.photo-text {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;

  &__message {
    opacity: .4;
    text-align: center;
  }

  &__error-message {
    position: absolute;
    z-index: 12;
    background-color: white;
    color: $red;
    height: 150px;
    width: 150px;
    display: flex;
    align-items: center;
    padding: 10px;
    box-sizing: border-box;
    font-size: 14px;
    text-align: center;
  }
}

.photo-wrap {
  width: 150px;
  height: 150px;
  border: 2px solid $light-border;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8%;
  background-color: white;

  .photo-image {
    object-fit: cover;
    height: 150px;
    width: 150px;
  }
}

.photo-file {
  position: absolute;
  top: -24px;
  height: 172px;
  width: 150px;
  background-color: transparent;
  outline: none;
  border: none;
  z-index: 5;
  cursor: pointer;
  border-radius: 8%;
}
.vendor-info__radio {
  display: flex;
  padding-bottom: 20px;
}

.radio {
  margin-right: 15px;
}
</style>
