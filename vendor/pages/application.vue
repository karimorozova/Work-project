<template lang="pug">
  .application
    Header(
      headerText="Application Form"
    )
    form.application__form
      hr
      .application__header
        span.title FREELANCE APPLICATION
        p.comment If you have any queries regarding the completion of this form, please contact vendor@pangea.global.
      .application__row-flex
        .application__inputs
          TextInput.application__mb-10(
            label="Name"
            name="firstName"
            @setValue="setInfoValue"
          )

          TextInput.application__mb-10(
            label="Email"
            name="email"
            example="example@example.com"
            @setValue="setInfoValue"
          )

          .application__availability Availability:
            //span.availavility__asterisk *
            SelectSingle(
              :selectedOption="availability"
              :options="availabilityOptions"
              @chooseOption="chooseOption"
            )

        .application__inputs
          TextInput.application__mb-10(
            label="Surname"
            name="surname"
            @setValue="setInfoValue"
          )
          .application__select-relative
            SelectLanguage(
              label="Mother tongue"
              placeholder="Select"
              :selectedLang="selectedTongue"
              @chooseLang="setMotherTongue"
            )
      .application__row-flex
        .application__inputs
          p Do you work with CAT tools?
        .application__inputs
          input( type="radio" id="contactChoice1"
            v-model="secondInfo.CAT" :value="true")
          label( for="contactChoice1") Yes

          input( type="radio" id="contactChoice2"
            v-model="secondInfo.CAT" :value="false")
          label( for="contactChoice2") No

      .application__row-flex(v-if="secondInfo.CAT === true")
        .application__inputs
          p Please select the software you currently use or have previous experience.
        .application__inputs
          .application__software
            SelectMulti(
              :isTableDropMenu="true"
              placeholder="Select"
              :hasSearch="false"
              :options="softwaresOptions"
              :selectedOptions="softwares"
              :allOptionsButtons="true"
              @chooseOptions="chooseOptions"
            )

      .application__row-flex
        .application__test2
          UploadFileButton.application__mb-10(
            label="CV:"
            @uploadedFile="(e) => uploadCvFile('cv', e)"
          )
        .application__test1
          .application__cover
            .application__text-area-label Cover Letter:
            textarea.application__text-area(rows=4 v-model="coverLetter" @change="setCoverLetter")
          .application__label
            .application__files
              UploadFileButton.application__mb-10(
                btn-text="and/or Upload file(s)"
                @uploadedFile="(e) => uploadCvFile('cover', e)"
              )

          //.application__files-list
              .application__part CV files:
                FilesList(v-if="files.cv.length"
                  :files="files.cv"
                )
              .application__part Cover files:
                FilesList(v-if="files.cover.length"
                  :files="files.cover"
                )
      .application__row
        .text To be able to join our team, you are required you are preform a separate test for each language pair and industry you are applying for.
          p The test is short 300 word text
      .application__row
        AgreeAndSubmit(
            :person="person"
            :secondInfo="secondInfo"
            @formValidationFail="formValidationFail"
            @sumbitForm="submitForm"
          )
    Footer
    .application__other-choice(v-if="otherChoiceVisibile")
    ErrorsAlert(
      v-if="errorsExist"
      :errors="errors"
      @closeErrors="closeErrors"
    )

</template>

<script>
import Header from "../components/Header"
import Footer from "../components/Footer"
import TextInput from "../components/TextInput"
import SelectSingle from "../components/dropdowns/SelectSingle"
import SelectMulti from "../components/dropdowns/SelectMulti"
import SelectLanguage from "./freelanceApplication/personInfo/SelectLanguage"
import UploadFileButton from "../components/buttons/UploadFileButton"
import AgreeAndSubmit from "./freelanceApplication/AgreeAndSubmit"
import FilesList from "../components/FilesList"
import ErrorsAlert from "../components/ErrorsAlert"

export default {
  data() {
    return {
      selectedTongue: {},
      selectedAvailability: "",
      otherChoiceVisibile: [],
      person: {},
      errors: [],
      errorsExist: false,
      softwares: [],
      coverLetter: "",
      files: {cv: [], cover: []},
      availabilityOptions: ["Full-time", "Part-time", "Limited"],
      availability: "",
      softwaresOptions: ["XTM", "MemoQ", "Trados"],
      secondInfo: { CAT: false }
    }
  },
  methods: {
    setInfoValue({ property, value }) {
      this.person[property] = value
    },
    async submitForm({ confirmed }) {
      this.person.confirmed = confirmed

      const sendData = new FormData()

      for (let file of this.person.cv) {
        sendData.append('cvFile', file)
      }

      if (this.person.cover) {
        for (let file of this.person.cover) {
          sendData.append('coverLetterFile', file)
        }

      }

      for (let key in this.person) {
        if (typeof this.person[key] === "string") {
          sendData.append(key, this.person[key])
        } else {
          sendData.append(`parsing-${ key }`, JSON.stringify(this.person[key]))
        }
      }
      try {
        await this.$axios.post("/vendors/application/send-form", sendData)
        window.top.location.href = "https://www.pangea.global/thank-you-vendor"
      } catch (err) {
        console.log(err)
        this.alertToggle({ message: "Error on submitting the form", isShow: true, type: "error" })
      }
    },
    formValidationFail({ errors }) {
      this.errors = errors
      return this.errorsExist = this.errors.length ? true : false
    },
    uploadCvFile( field, {files}) {
      this.files[field] = files;
      this.person[field] = files
    },
    setCoverLetter() {
      this.person['coverLetter'] = this.coverLetter
    },
    closeErrors() {
      this.errorsExist = false
    },
    chooseOption({option}) {
      this.availability = option;
      this.person.availability = option
    },
    chooseOptions({ option }) {
      const position = this.softwares.indexOf(option);
      if (position !== -1) {
        this.softwares.splice(position, 1);
      } else {
        const title = this.softwaresOptions.find((item) => item === option);
        this.softwares.push(title);
      }
      this.person.softwares = this.softwares
    },
    setMotherTongue({lang}) {
      this.selectedTongue = lang;
      this.person.native = lang._id
      this.person.lang = lang.lang
    },
  },
  components: {
    Header,
    Footer,
    TextInput,
    UploadFileButton,
    AgreeAndSubmit,
    FilesList,
    SelectLanguage,
    SelectSingle,
    SelectMulti,
    ErrorsAlert
  }
}
</script>

<style lang="scss" scoped>

  .application {
    font-family: Myriad400;
    color: #67573E;
    position: relative;
    p{
      margin: 0;
    }

    &__form {
      width: 33.5%;
      padding: 30px 50px;
      box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
      border-radius: 7px;
      margin: 40px auto;
      @media (max-width: 1440px) {
        width: 40%;
      }
      @media (max-width: 1440px) {
        width: 50%;
      }
      @media (max-width: 1024px) {
        width: 60%;
      }
      @media (max-width: 768px) {
        width: 80%;
      }
      @media (max-width: 480px) {
        padding: 30px;
        margin: 10px 0;
      }
    }

    &__row{
      margin-bottom: 15px;
      &-flex{
        display: flex;
        margin-bottom: 15px;
      }
    }

    &__test1 {
      margin: 0 20px;
      width: 70%;
    }
    &__test2 {
      margin: 0 20px;
      display: flex;
      align-items: center;
      width: 30%;

    }

    &__availability, &__software {
    }
    &__select-relative{
      position: relative;
      height: 63px;
    }
    &__inputs, &__btn{
      margin: 0 20px;
      width: 50%;
    }
    &__part{
      width: 50%;
    }
    &__mb-10{
      margin-bottom: 10px;
    }

    &__letter-text{
    }
    &__cover-text {
      text-align: center;
      margin: 5px auto;
    }
    &__files-list{
      display: flex;
    }
    &__cover {
      display: flex;
      flex-direction: column;
    }
    &__text-area {
      padding: 12px;
      resize: none;
      border: 1px solid #66563D;
      border-radius: 7px;
      color: #66563D;
      outline: none;
      &-label {
        margin-bottom: 4px;
      }
    }


    &__header {
      text-align: center;
      margin-bottom: 15px;

      .title {
        font-size: 22px;
        font-family: Myriad900;
      }

      .comment {
        font-size: 14px;
      }
    }
  }
  @font-face {
    font-family: 'Myriad300';
    font-style: normal;
    font-weight: normal;
    src: url('../assets/fonts/MYRIADPRO-LIGHT.woff') format('woff');
  }

  @font-face {
    font-family: 'Myriad400';
    font-style: normal;
    font-weight: normal;
    src: url('../assets/fonts/MYRIADPRO-REGULAR.woff') format('woff');
  }

  @font-face {
    font-family: 'Myriad600';
    font-style: normal;
    font-weight: normal;
    src: url('../assets/fonts/MYRIADPRO-SEMIBOLD.woff') format('woff');
  }


  @font-face {
    font-family: 'Myriad900';
    font-style: normal;
    font-weight: normal;
    src: url('../assets/fonts/MYRIADPRO-BOLD.woff') format('woff');
  }
</style>
