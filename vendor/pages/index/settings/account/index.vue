<template lang="pug">
  .wrapperAcc(v-if="vendor._id")
    ValidationErrors(
      v-if="areErrors"
      :errors="errors"
      :isAbsolute="true"
      @closeErrors="closeErrors"
    )

    .main
      .Lside
        .photo__body
          .photo(v-if="imageExist" )
            img.photo__image(:src="domain+vendor.photo")
          .fake-photo(v-else-if="!vendor.photo && !imageExist" :style="{'--bgColor': getBgColor(vendor._id)[0], '--color':getBgColor(vendor._id)[1]  }")
            .fake-photo__name {{ vendor.firstName[0].toUpperCase() }}

          .photo(v-else-if="vendor.photo && !imageExist")
            img.photo__image(:src="domain+vendor.photo")
          .upload-button
            input.upload-button__input(type="file" @change="previewPhoto")
            i.fas.fa-pencil-alt
        .tip.tip-info
          div Maximum size should be 3Mb
          div (only png/jpg/jpeg types)
        .tip.tip-error(v-if="isFileError") Incorrect file type or size

      .Rside
        .Rside__title Profile Information
        .Rside__row
          .Rside__col
            label First Name:
            input(type="text" autocomplete="off" :value="getActualField('firstName')" placeholder="Value" @change="(e) => setValue(e.target.value, 'firstName')")
          .Rside__col
            label Last Name:
            input(type="text" autocomplete="off" :value="getActualField('surname')" placeholder="Value" @change="(e) => setValue(e.target.value, 'surname')")

        .Rside__row
          .Rside__col
            label Email:
            input(type="text" autocomplete="off" :value="getActualField('email')" disabled="true" readonly="true" placeholder="Value" @change="(e) => setValue(e.target.value, 'email')")
          .Rside__col
            label Phone:
            input(type="text" autocomplete="off" :value="getActualField('phone')" placeholder="Your Phone" @change="(e) => setValue(e.target.value, 'phone')")

        .Rside__row
          .Rside__col
            label Time Zone:
            .drop
              SelectSingle(
                :hasSearch="true"
                :options="timezones"
                :selectedOption="getActualField('timezone')"
                placeholder="Your Timezone"
                @chooseOption="({option}) => setValue(option, 'timezone')"
              )
          .Rside__col
            label Native Language:
            .drop
              SelectSingle(
                :hasSearch="true"
                :options="languages.map(i =>i.lang)"
                :selectedOption="this.vendor.native ? this.vendor.native.lang : ''"
                placeholder="Option"
                @chooseOption="({option}) => setNative(option, 'native')"
              )
        .Rside__row
          .Rside__col
            label Gender:
            .drop
              SelectSingle(
                :options="genders"
                :selectedOption="getActualField('gender')"
                placeholder="Your Gender"
                @chooseOption="({option}) => setValue(option, 'gender')"
              )
          .Rside__col
            label Currency:
            .drop
              SelectSingle(
                :options="currencyList"
                :selectedOption="getActualField('currency')"
                placeholder="Option"
                @chooseOption="({option}) => setValue(option, 'currency')"
              )

        .Rside__row
          .Rside__col
            label CAT experience:
            .drop
              SelectMulti(
                :selectedOptions="getActualField('catExperience')"
                :isTableDropMenu="true"
                placeholder="Options"
                :hasSearch="false"
                :options="catExperienceList"
                @chooseOptions="chooseCatExperienceOptions"
              )

        .Rside__title(style="margin-top: 25px;") Social Media & Communication
        p.descr Please enter any other platform of communication, so we can reach you, in case we need
        p.descr.descr--bottom It can be extra email, extra phone number etc.
        SocialMediaRow(
          :social-media="getActualField('socialMedia')"
          @changeItemPosition="changeItemPosition"
          @add="addSocialMedia"
          @remove="removeSocialMedia"
          @update="updateVendorSocialMediaValue"
        )

        .Rside__title(style="margin-top: 25px;") Security
        .Rside__row
          .Rside__col
            label Password:
            input(type="text" autocomplete="off" placeholder="New Password"  v-model="password" )
            span.showPass(v-if="password.length" @mousemove="passType1 = 'text'" @mouseleave="passType1 = 'password'")
              i.far.fa-eye

          .Rside__col
            label Retype password:
            input(type="text" autocomplete="off" placeholder="Confirm New Password" v-model="confirmPassword")
            span.showPass(v-if="confirmPassword.length" @mousemove="confirmPassType2 = 'text'" @mouseleave="confirmPassType2 = 'password'")
              i.far.fa-eye

    .save
      .buttons
        Button(value="Save" @clicked="checkErrors")

</template>

<script>
import Button from "../../../../components/general/Button"
import ValidationErrors from "../../../../components/general/ValidationErrors"
import SocialMediaRow from './subcomponents/SocialMediaRow'
import { mapActions, mapGetters } from "vuex"
import SelectSingle from "../../../../components/general/SelectSingle"
import SelectMulti from "../../../../components/general/SelectMulti"
import getBgColor from "../../../../mixins/getBgColor"
import moment from "moment-timezone";

export default {
  mixins: [ getBgColor ],
  data() {
    return {
      passType1: "password",
      confirmPassType2: "password",
      genders: [ 'Female', 'Male', 'Other' ],
      errors: [],
      areErrors: false,
      photoFile: [],
      countries: [],
      timezones: [],
      newData: {},
      password: "",
      confirmPassword: "",
      imageExist: false,
      isFileError: false,
      domain: "",
      currencyList: [ 'EUR' ],
      catExperienceList: ['XTM', 'MemoQ', 'Trados'],
      catExperience: []
    }
  },
  methods: {
    ...mapActions([
      "alertToggle",
      "setCurrentVendor"
    ]),
    chooseCatExperienceOptions({ option }) {
      const cat = [ ...this.vendor.catExperience ]
      const position = cat.indexOf(option)
      if (position !== -1) {
        cat.splice(position, 1)
      } else {
        cat.push(this.catExperienceList.find((item) => item === option))
      }
      this.setValue(cat, 'catExperience')
    },
    changeItemPosition(sortedArr) {
      this.vendor.socialMedia = sortedArr
    },
    addSocialMedia(item) {
      this.vendor.socialMedia.push(item)
    },
    removeSocialMedia(index) {
      this.vendor.socialMedia.splice(index, 1)
    },
    updateVendorSocialMediaValue({ value, prop, index }) {
      this.vendor.socialMedia[index][prop] = value
    },
    getActualField(name) {
      return this.vendor[name]

    },
    previewPhoto() {
      if (document.getElementsByClassName('upload-button__input').length < 1) return
      let input = document.getElementsByClassName('upload-button__input')[0]
      if (this.checkFile(input.files)) {
        this.showPhoto(input)
      } else {
        this.showFileError(input)
      }
    },
    showPhoto(input) {
      if (document.getElementsByClassName('upload-button__input').length < 1) return
      this.photoFile = input.files
      this.imageExist = true
      let reader = new FileReader()
      reader.onload = (e) => {
        document.getElementsByClassName('photo__image')[0].src = e.target.result
      }
      reader.readAsDataURL(input.files[0])
    },
    showFileError(input) {
      this.isFileError = true
      input.value = ""
      setTimeout(() => {
        this.isFileError = false
      }, 3000)
    },
    checkFile(files) {
      if (files && files[0]) {
        const types = [ 'jpg', 'jpeg', 'png' ]
        const type = files[0].name.split('.').pop()
        return types.indexOf(type.toLowerCase()) !== -1 && files[0].size <= 3200000
      }
      return false
    },
    setDefault() {
      this.password = ''
      this.confirmPassword = ""
    },
    setValue(value, prop) {
      this.$set(this.vendor, prop, value)
    },
    setNative(value, prop) {
      this.$set(this.vendor, prop, this.languages.find(item => item.lang === value))
    },
    closeErrors() {
      this.areErrors = false
    },
    async checkErrors() {
      this.errors = []
      if (!this.vendor.firstName.trim()) this.errors.push("Please, enter you first name.")
      if (!this.vendor.surname.trim()) this.errors.push("Please, enter you last name.")
      if (this.checkEmail()) this.errors.push('Please provide a valid email.')
      if (this.password.trim() && this.password !== this.confirmPassword) this.errors.push("Use the same password in both fields.")
      if (this.errors.length) {
        this.areErrors = true
        return
      }
      await this.saveInfo()
    },
    checkEmail() {
      const emailValidRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
      return !this.vendor.email || !emailValidRegex.test(this.vendor.email.toLowerCase())
    },
    async saveInfo() {
      try {
        const fieldForSave = {
          firstName: this.vendor.firstName,
          surname: this.vendor.surname,
          phone: this.vendor.phone,
          timezone: this.vendor.timezone,
          native: this.vendor.native,
          gender: this.vendor.gender,
          skype: this.vendor.skype,
          socialMedia: this.vendor.socialMedia,
          catExperience: this.vendor.catExperience,
        }
        let formData = new FormData()
        formData.append("id", this.vendor._id)
        formData.append("info", JSON.stringify(fieldForSave))
        if (this.password) formData.append("password", this.password)
        if (this.photoFile.length) formData.append("photo", this.photoFile[0])
        const result = await this.$axios.post(`/vendor/info`, formData)
        this.setCurrentVendor(result.data)
        this.setDefault()
        this.alertToggle({ message: "Saved", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Cannot save info", isShow: true, type: "error" })
      }
    }
  },
  computed: {
    ...mapGetters({
      vendor: "getVendor",
      languages: "getAllLanguages"
    })
  },
  components: {
    ValidationErrors,
    Button,
    SelectSingle,
    SelectMulti,
    SocialMediaRow
  },
  mounted() {
    this.domain = process.env.domain
  },
  created() {
    this.timezones = moment.tz.names()
  }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors";

label {
  margin-bottom: 2px;
}

.save {
  margin-top: 20px;
  margin-left: 430px;
}

.buttons {
  display: flex;
  gap: 25px;
}

.Lside {
  width: 200px;
}

.Rside {
  margin-left: 20px;
  padding-left: 30px;
  border-left: 1px solid $light-border;

  &__title {
    font-family: Roboto600;
    font-size: 16px;
    margin-bottom: 25px;
  }

  &__row {
    display: flex;
    gap: 25px;
    margin-bottom: 15px;
  }

  &__col {
    display: flex;
    flex-direction: column;
    position: relative;
  }
}

.main {
  display: flex;
}

.wrapperAcc {
  padding: 25px;
  border-radius: 4px;
  background-color: white;
  box-shadow: $box-shadow;
  width: fit-content;
  position: relative;
  height: fit-content;
}

.photo {
  &__body {
    display: flex;
    align-items: center;
    position: relative;
    width: 200px;
    justify-content: center;
  }
}

.fake-photo {
  position: relative;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  box-shadow: $box-shadow;
  overflow: hidden;
  background-color: var(--bgColor);

  &__name {
    font-size: 80px;
    color: var(--color);
    display: flex;
    align-items: center;
    justify-content: center;
    height: 140px;
    width: 140px;
  }
}

.photo {
  position: relative;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  box-shadow: $box-shadow;
  overflow: hidden;

  &__image {
    height: 100%;
    object-fit: cover;
    width: 100%;
  }
}

.upload-button {
  display: flex;
  width: 30px;
  height: 30px;
  justify-content: center;
  align-items: center;
  position: absolute;
  bottom: 5px;
  right: 35px;
  border: 1px solid $border;
  border-radius: 50%;
  background-color: white;
  cursor: pointer;
  transition: .2s ease-out;

  &:hover {
    border: 1px solid $border-focus;
  }

  &__input {
    font-size: 0;
    opacity: 0;
    z-index: 10;
    height: 30px;
    position: absolute;
    cursor: pointer;
    width: 30px;
  }
}

.tip {
  text-align: center;

  &-info {
    color: #3333;
    margin-top: 15px;
  }

  &-error {
    color: $red;
    margin-top: 15px;
  }
}

input {
  font-size: 14px;
  color: $text;
  border: 1px solid $border;
  border-radius: 4px;
  box-sizing: border-box;
  padding: 0 7px;
  outline: none;
  height: 32px;
  width: 220px;
  font-family: 'Roboto400';
  transition: .1s ease-out;

  &:focus {
    border: 1px solid $border-focus;
  }
}

.drop {
  position: relative;
  width: 220px;
  height: 32px;
  background-color: white;
}

.showPass {
  position: absolute;
  font-size: 15px;
  right: 6px;
  bottom: 5px;
  cursor: help;
  color: $dark-border;
}
.descr {
  padding: 0;
  margin: 0;
  margin-bottom: 5px;
  font-family: 'Roboto400';
  font-size: 14px;
    &--bottom {
      margin-bottom: 25px;
    }
}
</style>
