<template lang="pug">
  .account
    .account__item
      .account__title Profile
      .account__body
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
                    input.contact-details__item-field(type="text" v-model="user.firstName" placeholder="Vendor Name"  @keyup="filterByName")
                  .contact-details__item
                    label.contact-details__item-title Surname:
                    input.contact-details__item-field(type="text" v-model="user.surname" placeholder="Vendor Name"  @keyup="filterByName")
                  .contact-details__item
                    label.contact-details__item-title Email:
                    input.contact-details__item-field(type="text" v-model="user.email" placeholder="Vendor Name"  @keyup="filterByName")
                  .contact-details__item
                    label.contact-details__item-title Gender:
                    .select_wrapper
                      SelectSingle(
                        :options="genders"
                        :selectedOption="user.gender"
                        placeholder="Gender"
                        @chooseOption="setGender"
                      )
                  .contact-details__item
                    label.contact-details__item-title Phone:
                    input.contact-details__item-field(type="text" v-model="user.phone" placeholder="Vendor Name"  @keyup="filterByName")
                  .contact-details__item
                    label.contact-details__item-title Skype:
                    input.contact-details__item-field(type="text" v-model="user.skype" placeholder="Vendor Name"  @keyup="filterByName")
                  .contact-details__item
                    label.contact-details__item-title LinkedIn:
                    input.contact-details__item-field(type="text" v-model="user.linkedIn" placeholder="Vendor Name"  @keyup="filterByName")
                  .contact-details__item
                    label.contact-details__item-title Country:
                    .select_wrapper
                      SelectSingle(
                        :options="countries"
                        :selectedOption="user.gender"
                        placeholder="Gender"
                        @chooseOption="setGender"
                      )
                  .contact-details__item
                    label.contact-details__item-title Time Zone:
                    .select_wrapper
                      SelectSingle(
                        :options="genders"
                        :selectedOption="user.gender"
                        placeholder="Gender"
                        @chooseOption="setGender"
                      )
        .content__form
          .contact-details__title security
          .contact-details__part
            .contact-details__row
              .contact-details__items
                .contact-details__item
                  label.contact-details__item-title Password:
                  input.contact-details__item-field(:type="passType" placeholder="Vendor Name"  @keyup="filterByName")
                .contact-details__item
                  label.contact-details__item-title Retype password:
                  input.contact-details__item-field(:type="passType" placeholder="Vendor Name"  @keyup="filterByName")

                span(@mousedown="passType = 'text'" @mouseup="passType = 'password'") show pass

    //.account
    //    .account__main
            //.contact-details
                .title Contact Details
                    img.title__icon(src="../../assets/images/edit-brown.png" @click="editCred")
                .contact-details__info
                    .contact-details__photo
                        .photo(v-if="!user.photo")
                            img.photo__image(v-if="imageExist")
                        .photo(v-else)
                            img.photo__image(:src="domain+user.photo")
                        .upload-button(v-if="!readonly")
                            input.upload-button__input(type="file" @change="previewPhoto")
                            img.upload-button__icon(src="../../assets/images/edit-brown.png")
                        .tip(v-if="!isFileError && !readonly") Maximum file size should be 2Mb (only png/jpg/jpeg types)
                        .file-error(v-if="isFileError && !readonly") Incorrect file type or size
                    .contact-details__data
                        .contact-details__data-item
                            .contact-details__name
                                DetailItem(label="First Name" :value="user.firstName" :isBorder="!readonly" @setValue="(e) => setValue(e, 'firstName')" :isShort="true")
                                DetailItem(label="Surname" :value="user.surname" :isBorder="!readonly" @setValue="(e) => setValue(e, 'surname')" :isShort="true")
                            DetailItem(label="Password" :value="password" :isBorder="!readonly" :isPassword="true" @setPassword="(e) => setValue(e, 'password')")
                            DetailItem(label="Confirm your Password" :value="confirmPassword" :isBorder="!readonly" :isPassword="true" @setPassword="(e) => setValue(e, 'confirmPassword')")
                        .contact-details__data-item
                            DetailItem(label="Email" :value="user.email" :isBorder="!readonly" @setValue="(e) => setValue(e, 'email')")
                            DetailItem(label="Phone Number" :value="user.phone" :isBorder="!readonly" @setValue="(e) => setValue(e, 'phone')")
                            DetailItem(label="Skype Name" :value="user.skype" :isBorder="!readonly" @setValue="(e) => setValue(e, 'skype')")
                .contact-details__buttons(v-if="!readonly")
                    .contact-details__button
                        Button(value="Save" @makeAction="checkErrors")
                    .contact-details__button
                        Button(value="Cancel" @makeAction="cancelEdit")
                ValidationErrors(v-if="areErrors" :errors="errors" @closeErrors="closeErrors" :isAbsolute="true")
</template>

<script>
import Button from "../buttons/Button";
import ValidationErrors from "../ValidationErrors";
import CompanyDetails from "./CompanyDetails";
import DetailItem from "./DetailItem";
import {mapActions} from "vuex";
import SocialIcons from "../SocialIcons";
import SelectSingle from "../dropdowns/SelectSingle";

export default {
  props: {
    // client: {
    //   type: Object
    // },
    user: {
      type: Object
    }
  },
  data() {
    return {
      passType: "password",
      genders: ['Female', 'Male'],
      countries: [],
      errors: [],
      areErrors: false,
      photoFile: [],
      readonly: true,
      password: "",
      confirmPassword: "",
      email: "",
      firstName: "",
      phone: "",
      skype: "",
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
        const result = await this.$http.get('/api/countries');
        this.countries = result.body;
      } catch(err) {
        console.log(err)
      }
    },
    filterByName() {

    },
    previewPhoto() {
      let input = document.getElementsByClassName('upload-button__input')[0];
      if (this.checkFile(input.files)) {
        this.showPhoto(input);
      } else {
        this.showFileError(input);
      }
    },
    showPhoto(input) {
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
    editCred() {
      this.readonly = false;
      this.firstName = this.user.firstName;
      this.surname = this.user.surname;
      this.email = this.user.email;
      this.phone = this.user.phone;
      this.skype = this.user.skype;
    },
    cancelEdit() {
      this.readonly = true;
      this.photoFile = [];
      this.password = "";
      this.confirmPassword = "";
      this.email = "";
      this.firstName = "";
      this.surname = "";
      this.phone = "";
      this.skype = "";
      this.closeErrors();
    },
    setValue({value}, prop) {
      this[prop] = value;
    },
    closeErrors() {
      this.areErrors = false;
    },
    async checkErrors() {
      this.errors = [];
      const phoneReg = /^[1-9][0-9]*$/;
      const namesReg = /^[-\sa-zA-Z]+$/;
      if (!this.firstName || !namesReg.test(this.firstName)) this.errors.push("Enter a valid first name");
      if (this.surname && !namesReg.test(this.surname)) this.errors.push("Enter a valid surname");
      if (this.phone && !phoneReg.test(this.phone)) this.errors.push("Only number are allowed in Phone number field");
      if (this.password && !this.areEqualPasswords()) this.errors.push("The password and confirm password fields do not match");
      await this.checkEmail();
      if (this.errors.length) {
        return this.areErrors = true;
      }
      await this.saveInfo();
    },
    async checkEmail() {
      const emailReg = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
      if (!this.email || !emailReg.test(this.email)) this.errors.push("Enter a valid email");
      try {
        const existingUser = await this.$axios.get(`/portal/unique-email?email=${this.email}`);
        if (this.email !== this.user.email && existingUser.data === "exist") this.errors.push("The entered email is already used in our system.")
      } catch (err) {
        this.alertToggle({message: "Error on checking email uniqueness", isShow: true, type: "error"});
      }
    },
    areEqualPasswords() {
      return this.password.trim() === this.confirmPassword.trim();
    },
    async saveInfo() {
      const data = {
        password: this.password,
        email: this.email,
        firstName: this.firstName,
        surname: this.surname,
        phone: this.phone,
        skype: this.skype,
        photo: this.photoFile[0]
      }
      await this.saveAccountDetails(data);
      this.cancelEdit();
    }
  },
  components: {
    SelectSingle,
    SocialIcons,
    Button,
    CompanyDetails,
    DetailItem,
    ValidationErrors
  },
  mounted() {
    this.domain = process.env.domain;
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";
.select_wrapper {
  position: relative;
  width: 191px;
}

.account {
  width: 100%;
  display: flex;
  align-items: flex-start;
  margin: 0 auto;
  color: #67573e;

  &__title {
    margin: 30px 0 10px;
    font-family: Myriad400;
    font-size: 20px;
  }

  &__body {
    width: 1000px;
    box-shadow: rgba(103, 87, 62, .3) 0px 2px 5px, rgba(103, 87, 62, .15) 0px 2px 6px 2px;
    padding: 20px;
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
    border-radius: 10px;
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
      border-radius: 5px;
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
