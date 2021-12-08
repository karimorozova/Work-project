<template lang="pug">
  .wrapperAcc(v-if="user._id")
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
            img.photo__image(:src="domain+user.photo")
          .fake-photo(v-else-if="!user.photo && !imageExist" :style="{'--bgColor': getBgColor(user._id)[0], '--color':getBgColor(user._id)[1]  }")
            .fake-photo__name {{ user.firstName[0].toUpperCase() }}

          .photo(v-else-if="user.photo && !imageExist")
            img.photo__image(:src="domain+user.photo")
          .upload-button
            input.upload-button__input(type="file" @change="previewPhoto")
            i.fas.fa-pencil-alt
        .tip.tip-info
          div Maximum size should be 2Mb
          div (only png/jpg/jpeg types)
        .tip.tip-error(v-if="isFileError") Incorrect file type or size

      .Rside
        .Rside__title Profile Information
        .Rside__row
          .Rside__col
            label First Name:
            input(type="text" :value="getActualField('firstName')" placeholder="Value" @change="(e) => setValue(e.target.value, 'firstName')")
          .Rside__col
            label Last Name:
            input(type="text" :value="getActualField('surname')" placeholder="Value" @change="(e) => setValue(e.target.value, 'surname')")

        .Rside__row
          .Rside__col
            label Email:
            input(type="text" :value="getActualField('email')" disabled="true" readonly="true" placeholder="Value" @change="(e) => setValue(e.target.value, 'email')")
          .Rside__col
            label Phone:
            input(type="text" :value="getActualField('phone')" placeholder="Your Phone" @change="(e) => setValue(e.target.value, 'phone')")

        .Rside__row
          .Rside__col
            label Country:
            .drop
              SelectSingle(
                :options="countries"
                :selectedOption="getActualField('country')"
                placeholder="Your Country"
                @chooseOption="({option}) => setValue(option, 'country')"
              )

          .Rside__col
            label Time Zone:
            .drop
              SelectSingle(
                :options="timezones"
                :selectedOption="getActualField('timezone')"
                placeholder="Your Timezone"
                @chooseOption="({option}) => setValue(option, 'timezone')"
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

        .Rside__title(style="margin-top: 25px;") Security
        .Rside__row
          .Rside__col
            label Password:
            input(:type="passType1" placeholder="New Password"  v-model="newData.password" )
            span.showPass(v-if="newData.hasOwnProperty('password') && newData.password.length" @mousemove="passType1 = 'text'" @mouseleave="passType1 = 'password'")
              i.far.fa-eye

          .Rside__col
            label Retype password:
            input(:type="confirmPassType2" placeholder="Confirm New Password" v-model="confirmPassword")
            span.showPass(v-if="confirmPassword.length" @mousemove="confirmPassType2 = 'text'" @mouseleave="confirmPassType2 = 'password'")
              i.far.fa-eye

    .save
      .buttons
        Button(value="Save" @clicked="checkErrors" :isDisabled="!isShowSaveButton")
        //Button(value="Cancel" :outline="true" @clicked="setDefault")

</template>

<script>
import Button from "../../../../components/pangea/Button"
import ValidationErrors from "../../../../components/pangea/ValidationErrors"
import { mapActions, mapGetters } from "vuex"
import SelectSingle from "../../../../components/pangea/SelectSingle"
import getBgColor from "../../../../mixins/getBgColor"

export default {
  mixins: [ getBgColor ],
  data() {
    return {
      passType1: "password",
      confirmPassType2: "password",
      genders: [ 'Female', 'Male', 'Other' ],
      errors: [],
      areErrors: false,
      readonly: false,
      photoFile: [],
      countries: [],
      timezones: [],
      password: "",
      newData: {},
      confirmPassword: "",
      imageExist: false,
      isFileError: false,
      domain: ""
    }
  },
  methods: {
    ...mapActions([
      "alertToggle",
      "saveAccountDetails"
    ]),
    async getCountries() {
      try {
        const result = await this.$axios.get('/api/countries')
        this.countries = result.data
      } catch (err) {
        console.log(err)
      }
    },
    async getTimezones() {
      try {
        const result = await this.$axios.get('/api/timezones')
        this.timezones = result.data.map(({ zone }) => zone)
      } catch (err) {
        console.log(err)
      }
    },
    getActualField(name) {
      return this.newData[name] !== undefined
          ? this.newData[name]
          : this.user[name]
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
        return types.indexOf(type.toLowerCase()) !== -1 && files[0].size <= 2000000
      }
      return false
    },
    setDefault() {
      this.newData = {}
      this.password = ''
      this.confirmPassword = ""

      if (document.getElementsByClassName('photo__image').length > 0) document.getElementsByClassName('photo__image')[0].src = this.domain + this.user.photo
      this.closeErrors()
    },
    setValue(value, prop) {
      this.$set(this.newData, prop, value)
    },
    closeErrors() {
      this.areErrors = false
    },
    async checkErrors() {
      this.errors = []
      const phoneReg = /^[1-9][0-9]*$/
      const namesReg = /^[-\sA-z]+$/
      if (this.newData.hasOwnProperty("firstName") && (this.newData.firstName.length < 4 || !namesReg.test(this.newData.firstName))) this.errors.push("Enter a valid first name")
      if (this.newData.hasOwnProperty("surname") && (this.newData.surname.length < 4 || !namesReg.test(this.newData.surname))) this.errors.push("Enter a valid surname")
      if (this.newData.phone && !phoneReg.test(this.newData.phone)) this.errors.push("Only number are allowed in Phone number field")
      if (this.newData.password && !this.areEqualPasswords()) this.errors.push("The password and confirm password fields do not match")
      await this.checkEmail()
      if (this.errors.length) {
        return this.areErrors = true
      }
      await this.saveInfo()
    },
    async checkEmail() {
      const emailReg = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
      if (!this.user.email || !emailReg.test(this.user.email)) this.errors.push("Enter a valid email")
      try {
        const existingUser = await this.$axios.get(`/portal/unique-email?email=${ this.email }`)
        if (this.email !== this.user.email && existingUser.data === "exist") this.errors.push("The entered email is already used in our system.")
      } catch (err) {
        this.alertToggle({ message: "Error on checking email uniqueness", isShow: true, type: "error" })
      }
    },
    areEqualPasswords() {
      return this.newData.password.trim() === this.confirmPassword.trim()
    },
    async saveInfo() {
      try {
        this.newData.photo = this.photoFile[0]
        await this.saveAccountDetails(this.newData)
        this.setDefault()
        this.alertToggle({ message: "Updated", isShow: true, type: "success" })
      } catch (err) {
        console.log(err)
        this.alertToggle({ message: "Error on saving changes", isShow: true, type: "error" })
      }
    }
  },
  computed: {
    ...mapGetters({
      user: "getUserInfo"
    }),
    isShowSaveButton() {
      const keys = [
        'country',
        'email',
        'firstName',
        'gender',
        'phone',
        'surname',
        'timezone'
      ]

      for (const key of keys) {
        if (this.newData.hasOwnProperty(key)) {
          if (this.newData[key].toString() !== this.user[key].toString) return true
        }
      }
      if (!!this.confirmPassword && (this.newData.hasOwnProperty('password') && this.newData.password.length)) return true
      if (this.photoFile.length) return true

      return false
    }
  },
  watch: {
    photoFile() {
      this.newData.photo = this.photoFile[0]
    }
  },
  components: {
    SelectSingle,
    Button,
    ValidationErrors
  },
  mounted() {
    this.domain = process.env.domain
    this.getCountries()
    this.getTimezones()
  },
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
  //background-color: rebeccapurple;
  margin-left: 25px;
  padding-left: 25px;
  border-left: 1px solid $light-border;

  &__title {
    font-family: Myriad600;
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
  font-family: 'Myriad400';
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

//---------------------------------------------------
//---------------------------------------------------
//---------------------------------------------------
//---------------------------------------------------

//
//.select_wrapper {
//  position: relative;
//  width: 191px;
//}
//
//
//.account {
//  width: 100%;
//  display: flex;
//  align-items: flex-start;
//  margin: 0 auto;
//  color: #67573e;
//
//  &__title {
//    display: flex;
//    align-items: end;
//    justify-content: space-between;
//    margin: 30px 0 10px;
//    font-family: Myriad400;
//    font-size: 20px;
//  }
//
//  &__body {
//    width: 1000px;
//    box-shadow: rgba(103, 87, 62, .3) 0px 2px 5px, rgba(103, 87, 62, .15) 0px 2px 6px 2px;
//    padding: 20px;
//  }
//
//  &__buttons {
//    display: flex;
//    justify-content: center;
//    margin-top: 50px;
//  }
//
//  &__button {
//    margin: 0 20px;
//  }
//}
//
//.contact-details {
//  display: flex;
//  color: #67573e;
//
//
//  &__title {
//    font-size: 16px;
//    padding-top: 20px;
//    padding-bottom: 10px;
//    text-transform: uppercase;
//    font-family: 'Myriad900';
//  }
//
//  &__part {
//    padding: 20px 10px;
//    border: 2px solid #f4f2f1;
//    border-radius: 4px;
//    position: relative;
//  }
//
//  &__row {
//    display: flex;
//  }
//
//  &__items {
//    display: flex;
//    flex-wrap: wrap;
//    gap: 10px 90px;
//  }
//
//  &__item {
//    display: flex;
//    flex-direction: column;
//
//    &-title {
//      margin-bottom: 3px;
//    }
//
//    &-field {
//      box-sizing: border-box;
//      color: $main-color;
//      width: 191px;
//      height: 30px !important;
//      padding-left: 5px;
//      border: 1px solid $main-color;
//      border-radius: 4px;
//      outline: none;
//      font-size: 14px;
//    }
//  }
//
//  &__password {
//    display: flex;
//    flex-direction: column;
//    position: relative;
//
//    &-title {
//      margin-bottom: 3px;
//    }
//
//    &-field {
//      box-sizing: border-box;
//      color: $main-color;
//      width: 191px;
//      height: 30px !important;
//      padding-left: 5px;
//      padding-right: 28px;
//      border: 1px solid $main-color;
//      border-radius: 4px;
//      outline: none;
//      font-size: 14px;
//    }
//  }
//}


</style>
