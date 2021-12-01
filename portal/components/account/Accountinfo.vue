<template lang="pug">
  .account
    .account__item
      .account__title
        span Profile
        .account__buttons
          Button(value="Save" class="account__button" @clicked="checkErrors")
          Button(value="Cancel" @clicked="setDefault")
      .account__body
        ValidationErrors(
          v-if="areErrors"
          :errors="errors"
          :isAbsolute="true"
          @closeErrors="closeErrors"
        )
        .contact-details
          .content__form
            .contact-details__title general info
            .contact-details__part
              .contact-details__row
                .contact-details__photo
                  .photo(v-if="!user.photo")
                    img.photo__image(v-if="imageExist")
                  .photo(v-else)
                    img.photo__image(:src="domain+user.photo")
                  //.upload-button(v-if="!readonly")
                  .upload-button(v-if="true")
                    input.upload-button__input(type="file" @change="previewPhoto")
                    img.upload-button__icon(src="../../assets/images/edit-brown.png")
                  .tip(v-if="!isFileError && !readonly") Maximum file size should be 2Mb (only png/jpg/jpeg types)
                  .file-error(v-if="isFileError && !readonly") Incorrect file type or size


                .contact-details__items
                  .contact-details__item
                    label.contact-details__item-title Name:
                    input.contact-details__item-field(type="text" :value="getActualField('firstName')" placeholder="Your Name" @change="(e) => setValue(e.target.value, 'firstName')")
                  .contact-details__item
                    label.contact-details__item-title Surname:
                    input.contact-details__item-field(type="text" :value="getActualField('surname')" placeholder="Your Surname" @change="(e) => setValue(e.target.value, 'surname')")
                  .contact-details__item
                    label.contact-details__item-title Email:
                    input.contact-details__item-field(type="text" :value="getActualField('email')" placeholder="Your E-mail" @change="(e) => setValue(e.target.value, 'email')")
                  .contact-details__item
                    label.contact-details__item-title Gender:
                    .select_wrapper
                      SelectSingle(
                        :options="genders"
                        :selectedOption="getActualField('gender')"
                        placeholder="Your Gender"
                        @chooseOption="({option}) => setValue(option, 'gender')"
                      )
                  .contact-details__item
                    label.contact-details__item-title Phone:
                    input.contact-details__item-field(type="text" :value="getActualField('phone')" placeholder="Your Phone" @change="(e) => setValue(e.target.value, 'phone')")
                  .contact-details__item
                    label.contact-details__item-title Skype:
                    input.contact-details__item-field(type="text" :value="getActualField('skype')" placeholder="Your Skype" @change="(e) => setValue(e.target.value, 'skype')")
                  .contact-details__item
                    label.contact-details__item-title LinkedIn:
                    input.contact-details__item-field(type="text" :value="getActualField('linkedIn')" placeholder="Your LinkedIn" @change="(e) => setValue(e.target.value, 'linkedIn')")
                  .contact-details__item
                    label.contact-details__item-title Country:
                    .select_wrapper
                      SelectSingle(
                        :options="countries"
                        :selectedOption="getActualField('country')"
                        placeholder="Your Country"
                        @chooseOption="({option}) => setValue(option, 'country')"
                      )
                  .contact-details__item
                    label.contact-details__item-title Time Zone:
                    .select_wrapper
                      SelectSingle(
                        :options="timezones"
                        :selectedOption="getActualField('timezone')"
                        placeholder="Your Timezone"
                        @chooseOption="({option}) => setValue(option, 'timezone')"
                      )
        .content__form
          .contact-details__title security
          .contact-details__part
            .contact-details__row
              .contact-details__items
                .contact-details__password
                  label.contact-details__password-title Password:
                  input.contact-details__password-field(:type="passType1" placeholder="New Password"  v-model="newData.password" )
                  span.showPass(@mousedown.stop="passType1 = 'text'" @mouseup="passType1 = 'password'" @mouseleave="passType1 = 'password'")
                    i.fa.fa-eye

                .contact-details__password
                  label.contact-details__password-title Retype password:
                  input.contact-details__password-field(:type="confirmPassType2" placeholder="Confirm Password" v-model="confirmPassword")
                  span.showPass(@mousedown.stop="confirmPassType2 = 'text'" @mouseup="confirmPassType2 = 'password'" @mouseleave="confirmPassType2 = 'password'")
                    i.fa.fa-eye
</template>

<script>
import Button from "../buttons/Button";
import ValidationErrors from "../ValidationErrors";
import { mapActions, mapGetters } from "vuex"
import SelectSingle from "../pangea/SelectSingle";

export default {
  data() {
    return {
      passType1: "password",
      confirmPassType2: "password",
      genders: ['Female', 'Male'],
      errors: [],
      areErrors: false,
      readonly: true,
      photoFile: [],
      countries: [],
      timezones: [],


      password: "",

      newData: {},

      confirmPassword: "",

      imageExist: false,
      isFileError: false,
      domain: "",
    }
  },
  methods: {
    ...mapActions([
      "alertToggle",
      "saveAccountDetails"
    ]),
    async getCountries() {
      try {
        const result = await this.$axios.get('/api/countries');
        this.countries = result.data;
      } catch(err) {
        console.log(err)
      }
    },
    async getTimezones() {
      try {
        const result = await this.$axios.get('/api/timezones')
        this.timezones = result.data.map(({zone}) => zone );
      } catch(err) {
        console.log(err)
      }
    },
    getActualField(name) {
      return this.newData[name] !== undefined
          ? this.newData[name]
          : this.user[name]
    },
    previewPhoto() {
      // if (document.getElementsByClassName('upload-button__input').length < 1) return
      let input = document.getElementsByClassName('upload-button__input')[0];
      if (this.checkFile(input.files)) {
        this.showPhoto(input);
      } else {
        this.showFileError(input);
      }
    },
    showPhoto(input) {
      // if (document.getElementsByClassName('upload-button__input').length < 1) return
      this.photoFile = input.files;
      this.imageExist = true;
      let reader = new FileReader();
      reader.onload = (e) => {
        document.getElementsByClassName('photo__image')[0].src = e.target.result;
      }
      reader.readAsDataURL(input.files[0]);
    },
    showFileError(input) {
      this.isFileError = true;
      input.value = "";
      setTimeout(() => {
        this.isFileError = false;
      }, 5000)
    },
    checkFile(files) {
      if (files && files[0]) {
        const types = ['jpg', 'jpeg', 'png'];
        const type = files[0].name.split('.').pop();
        return types.indexOf(type.toLowerCase()) !== -1 && files[0].size <= 2000000;
      }
      return false;
    },
    setDefault() {
      this.newData = {}
      this.password = ''
      this.confirmPassword = ""

      if (document.getElementsByClassName('photo__image').length > 0)
        document.getElementsByClassName('photo__image')[0].src = this.domain + this.user.photo
      this.closeErrors();
    },
    setValue(value, prop) {
      this.$set(this.newData, prop, value)
    },
    closeErrors() {
      this.areErrors = false;
    },
    async checkErrors() {
      this.errors = [];
      const phoneReg = /^[1-9][0-9]*$/;
      const namesReg = /^[-\sA-z]+$/;
      if (this.newData.hasOwnProperty("firstName") && (this.newData.firstName.length < 4 || !namesReg.test(this.newData.firstName))) this.errors.push("Enter a valid first name");
      if (this.newData.hasOwnProperty("surname") && (this.newData.surname.length < 4 || !namesReg.test(this.newData.surname))) this.errors.push("Enter a valid surname");
      if (this.newData.phone && !phoneReg.test(this.newData.phone)) this.errors.push("Only number are allowed in Phone number field");
      if (this.newData.password && !this.areEqualPasswords()) this.errors.push("The password and confirm password fields do not match");
      await this.checkEmail();
      if (this.errors.length) {
        return this.areErrors = true;
      }
      await this.saveInfo();
    },
    async checkEmail() {
      const emailReg = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
      if (!this.user.email || !emailReg.test(this.user.email)) this.errors.push("Enter a valid email");
      try {
        const existingUser = await this.$axios.get(`/portal/unique-email?email=${this.email}`);
        if (this.email !== this.user.email && existingUser.data === "exist") this.errors.push("The entered email is already used in our system.")
      } catch (err) {
        this.alertToggle({message: "Error on checking email uniqueness", isShow: true, type: "error"});
      }
    },
    areEqualPasswords() {
      return this.newData.password.trim() === this.confirmPassword.trim();
    },
    async saveInfo() {
      try {
        this.newData.photo = this.photoFile[0]
        await this.saveAccountDetails(this.newData);
        this.setDefault();
        this.alertToggle({message: "Updated", isShow: true, type: "success"});
      }catch (err) {
        console.log(err)
        this.alertToggle({message: "Error on saving changes", isShow: true, type: "error"});
      }
    }
  },
  computed: {
    ...mapGetters({
      user: "getUserInfo"
    })
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
    this.domain = process.env.domain;
  },
  created() {
    this.getCountries()
    this.getTimezones()
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";
.select_wrapper {
  position: relative;
  width: 191px;
}
.showPass {
  position: absolute;
  font-size: 18px;
  right: 5px;
  bottom: 4px;
}
.account {
  width: 100%;
  display: flex;
  align-items: flex-start;
  margin: 0 auto;
  color: #67573e;

  &__title {
    display: flex;
    align-items: end;
    justify-content: space-between;
    margin: 30px 0 10px;
    font-family: Myriad400;
    font-size: 20px;
  }

  &__body {
    width: 1000px;
    box-shadow: rgba(103, 87, 62, .3) 0px 2px 5px, rgba(103, 87, 62, .15) 0px 2px 6px 2px;
    padding: 20px;
  }

  &__buttons {
      display: flex;
      justify-content: center;
      margin-top: 50px;
  }

  &__button {
      margin: 0 20px;
  }
}

//.account {
//    //position: relative;
//    //width: 80%;
//    //color: #67573e;
//
//
//    width: 960px;
//    padding: 20px;
//    box-shadow: 0 2px 5px rgba(103,87,62,.3),0 2px 6px 2px rgba(103,87,62,.15);
//    position: relative;
//    &__main {
//        //padding: 20px 40px;
//        //display: flex;
//        //flex-direction: column;
//        //max-width: 100%;
//    }
//}

.contact-details {
  //position: relative;
  //&__info {
  //    display: flex;
  //    flex-direction: column;
  //    padding-top: 30px;
  //    padding-right: 20px;
  //}
  display: flex;
  color: #67573e;

  &__photo {
    display: flex;
    align-items: center;
    margin-bottom: 30px;
    position: relative;
    width: 200px;
    margin-right: 40px;
  }

  &__title {
    font-size: 16px;
    padding-top: 20px;
    padding-bottom: 10px;
    text-transform: uppercase;
    font-family: 'Myriad900';
  }

  &__part {
    padding: 20px 10px;
    border: 2px solid #f4f2f1;
    border-radius: 4px;
    position: relative;
  }

  &__row {
    display: flex;
  }

  &__items {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 90px;
  }

  &__item {
    display: flex;
    flex-direction: column;

    &-title {
      margin-bottom: 3px;
    }

    &-field {
      box-sizing: border-box;
      color: $main-color;
      width: 191px;
      height: 30px !important;
      padding-left: 5px;
      border: 1px solid $main-color;
      border-radius: 4px;
      outline: none;
      font-size: 14px;
    }
  }

  &__password {
    display: flex;
    flex-direction: column;
    position: relative;

    &-title {
      margin-bottom: 3px;
    }

    &-field {
      box-sizing: border-box;
      color: $main-color;
      width: 191px;
      height: 30px !important;
      padding-left: 5px;
      padding-right: 28px;
      border: 1px solid $main-color;
      border-radius: 4px;
      outline: none;
      font-size: 14px;
    }
  }

  //&__data {
  //    padding-left: 20px;
  //    margin-bottom: 40px;
  //    width: 100%;
  //    max-height: 250px;
  //    display: flex;
  //    justify-content: space-around;
  //}
  //&__data-item {
  //    width: 270px;
  //}
  //&__name {
  //    display: flex;
  //    justify-content: space-between;
  //    width: 100%;
  //    box-sizing: border-box;
  //}
  //&__buttons {
  //    display: flex;
  //    justify-content: center;
  //    margin-top: 50px;
  //}
  //&__button {
  //    margin: 0 20px;
  //}
}

.photo {
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  box-shadow: rgba(103, 87, 62, .3) 0px 2px 5px, rgba(103, 87, 62, .15) 0px 2px 6px 2px;
  overflow: hidden;
  //display: flex;
  //align-items: center;
  //justify-content: center;
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
  right: 5px;
  border: 0.5px solid rgba(153, 142, 126, 0.8);
  border-radius: 50%;
  background-color: white;
  cursor: pointer;

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

//.title {
//    box-sizing: border-box;
//    padding: 0 20px;
//    font-size: 20px;
//    border-bottom: 2px solid rgba(153, 142, 126, 0.5);
//    padding-bottom: 10px;
//    display: flex;
//    justify-content: space-between;
//    align-items: center;
//    &__icon {
//        cursor: pointer;
//    }
//}
//
//.tip, .file-error {
//    position: absolute;
//    left: 100px;
//    width: 200px;
//    font-size: 14px;
//}
//
//.file-error {
//    color: $red;
//}

</style>
