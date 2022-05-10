<template lang="pug">
  .application
    Header(headerText="Application Form")
    .application__body
      .application__content
        form.application__form
          .application__header
            p.title FREELANCE APPLICATION
            p.comment If you have any queries regarding the completion of this form, please contact vendor@pangea.global

          p.application__step-title PERSONAL INFORMATION

          .application__row-flex
            .application__col50
              TextInput.application__mb-10(
                label="Name"
                name="firstName"
                @setValue="setInfoValue"
              )
              TextInput.application__mb-10(
                label="Phone"
                name="phone"
                :type="'number'"
                @setValue="setInfoValue"
              )
              TextInput.application__mb-10(
                label="Email"
                name="email"
                example="example@example.com"
                @setValue="setInfoValue"
              )
            .application__col50
              .application__col50
                TextInput.application__mb-10(
                  label="Surname"
                  name="surname"
                  @setValue="setInfoValue"
                )
              .application__col50
                .available__title.application__mb-10 Mother tongue:
                  .drop
                    SelectSingle(
                      :selectedOption="selectedTongue.lang || ''"
                      :options="languages.map(item => item.lang)"
                      :hasSearch="true"
                      placeholder="Option"
                      @chooseOption="setMotherTongue"
                    )

          p.application__step-title Professional Information
            .application__row-flex
              .application__col50
                .available__title.application__mb-10 Source Language:
                .application__software
                  .drop
                    SelectSingle(
                      :selectedOption="selectedSourceLanguage.lang"
                      :options="languages.map(item => item.lang)"
                      :hasSearch="true"
                      placeholder="Option"
                      @chooseOption="setSourceLanguage"
                    )

              .application__col50
                .available__title.application__mb-10 Target Language:
                .application__software
                  .drop
                    SelectMulti(
                      placeholder="Options"
                      :hasSearch="true"
                      :options="languages.map(item => item.lang)"
                      :selectedOptions="selectedTargetsLanguages.map(item => item.lang)"
                      @chooseOptions="setTargetLanguage"
                    )

          .application__row-flex
            .application__col50
              .available__title.application__mb-10 Industries:
              .application__software
                .drop
                  SelectMulti(
                    :isTableDropMenu="true"
                    placeholder="Options"
                    :hasSearch="true"
                    :options="industries.map(item => item.name)"
                    :selectedOptions="selectedIndustries.map(item => item.name)"
                    @chooseOptions="chooseIndustries"
                  )
            .application__col50
              .available__title.application__mb-10 Step:
              .application__software
                .drop
                  SelectSingle(
                    placeholder="Option"
                    :selectedOption="selectedStep.title"
                    :options="steps.map(({title})=> title)"
                    @chooseOption="setStep"
                  )

          .application__row-flex
            .application__col50
              TextInput.application__mb-10(
                :label="`Rate (${selectedRate})`"
                name="selectedRate"
                :type="'number'"
                :selectWhenClicked="true"
                @setValue="setRate"
              )
            .application__col50
              .application__availability.application__mb-10
                .available__title Availability:
                .drop
                  SelectSingle(
                    placeholder="Option"
                    :selectedOption="availability"
                    :options="availabilityOptions"
                    @chooseOption="chooseOption"
                  )

          .application__row-flex
            .application__col50
              .application__mb-10
                p Do you work with CAT tools?
                .application__radio-group
                  .application__radio
                    label.radio(for='opt1')
                      input#opt1.hidden(type='radio' v-model="secondInfo.CAT" :value="true")
                      span.label
                      | Yes
                  .application__radio
                    label.radio(for='opt2')
                      input#opt2.hidden(type='radio' v-model="secondInfo.CAT" :value="false")
                      span.label
                      | No
            .application__col50
              div(v-if="secondInfo.CAT === true")
                .available__title.application__mb-10 Previous software experience:
                .application__software
                  .drop
                    SelectMulti(
                      :isTableDropMenu="true"
                      placeholder="Select"
                      :hasSearch="false"
                      :options="catExperienceOptions"
                      :selectedOptions="catExperience"
                      @chooseOptions="chooseOptions"
                    )

          p.application__step-title FILES

          .application__row-flex
            .application__col50
              UploadFileButton.application__mb-10(
                label="CV (English version):"
                @uploadedFile="(e) => uploadCvFile('cv', e)"
              )
              .application__part.application__mb-10(v-if="files.cv.length") CV files:
                FilesList(
                  v-if="files.cv.length"
                  :files="files.cv"
                )
            .application__col50
              .application__cover.application__mb-10
                .application__text-area-label Cover Letter:
              .application__label
                .application__files
                  UploadFileButton(
                    btn-text="Upload file(s)"
                    @uploadedFile="(e) => uploadCvFile('cover', e)"
                  )
                .application__part.application__mb-10(v-if="files.cover.length") Cover files:
                  FilesList(
                    v-if="files.cover.length"
                    :files="files.cover"
                  )

          .application__row
            .text To be able to join our team, you are required you are preform a separate test for each language pair and industry you are applying for.
            .description The test is short 300 word text
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
import Header from "../components/application/Header"
import Footer from "../components/application/Footer"
import TextInput from "../components/application/TextInput"
import SelectSingle from "../components/general/SelectSingle"
import SelectMulti from "../components/general/SelectMulti"
import UploadFileButton from "../components/application/UploadFileButton"
import AgreeAndSubmit from "../components/application/AgreeAndSubmit"
import FilesList from "../components/application/FilesList"
import ErrorsAlert from "../components/application/ErrorsAlert"
import {mapActions} from "vuex";

export default {
  data() {
    return {
      selectedTongue: {},
      selectedAvailability: "",
      otherChoiceVisibile: [],
      person: {},
      errors: [],
      errorsExist: false,
      catExperience: [],
      coverLetter: "",
      files: { cv: [], cover: [] },
      availabilityOptions: [ "Full-time", "Part-time", "Limited" ],
      availability: "",
      catExperienceOptions: [ "XTM", "MemoQ", "Trados" ],
      secondInfo: { CAT: false },
      industries: [],
      selectedIndustries: [],
      languages: [],
      selectedSourceLanguage: '',
      selectedTargetsLanguages: [],
      showStep: [ 'Translation', 'Copywriting' ],
      steps: [],
      selectedStep: {},
      selectedRate: (0).toFixed(4),
      filesExtensions: [
        'doc', 'docx', 'pdf', 'mp3', 'mp4', 'avi', 'wmv',
        'png', 'gif', 'jpg', 'svg', 'txt', 'xlsx', 'txt'
      ]

    }
  },
  methods: {
    ...mapActions([ "alertToggle" ]),
    setInfoValue({ property, value }) {
      this.person[property] = value
    },
    hasErrorPendingInfo() {
      this.errors = []
      if (this.selectedSourceLanguage === "") {
        this.errors.push('Please select the Source Language')
      }
      if (!this.selectedTargetsLanguages.length) {
        this.errors.push('Please select the Target Language')
      }
      if (this.selectedRate <= 0) {
        this.errors.push('Please select the Rate')
      }
      if (!this.selectedStep.hasOwnProperty('title')) {
        this.errors.push('Please select the Step')
      }
      return !!this.errors.length
    },
    async submitForm({ confirmed }) {
      if (this.hasErrorPendingInfo()) {
        this.errorsExist = true
        return
      }

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

      let pendingCompetencies = []
      for (let targetLanguage of this.selectedTargetsLanguages) {
        for (let industry of this.selectedIndustries) {
          pendingCompetencies.push({
            descriptions: {
              industry: 'Api',
              targetLanguage: 'Api'
            },
            sourceLanguage: this.selectedSourceLanguage,
            targetLanguage: targetLanguage,
            industry: industry,
            step: this.selectedStep,
            rate: this.selectedRate
          })
        }
      }

      const infoForMail = {
        sourceLanguage: this.selectedSourceLanguage,
        targetLanguages: this.selectedTargetsLanguages,
        step: this.selectedStep,
        rate: this.selectedRate
      }

      sendData.append("pendingCompetencies", JSON.stringify(pendingCompetencies))
      sendData.append("infoForMail", JSON.stringify(infoForMail))
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
    setRate({ value }) {
      this.selectedRate = value
    },
    setStep({ option }) {
      const step = this.steps.find(({ title }) => title === option)
      this.selectedStep = step
    },
    setSourceLanguage({ option }) {
      const lang = this.languages.find(({ lang }) => lang === option)
      this.selectedSourceLanguage = lang
    },
    setTargetLanguage({ option }) {
      const position = this.selectedTargetsLanguages.findIndex(({ lang }) => lang === option)
      if (position !== -1) {
        this.selectedTargetsLanguages.splice(position, 1)
      } else {
        if (this.selectedTargetsLanguages.length >= 5) {
          this.errors = [ 'You can select only 5 Target languages' ]
          this.errorsExist = true
          return
        }
        const lang = this.languages.find(({ lang }) => lang === option)
        this.selectedTargetsLanguages.push(lang)
      }
    },
    formValidationFail({ errors }) {
      this.errors = errors
      return this.errorsExist = this.errors.length ? true : false
    },
    uploadCvFile(field, { files }) {
      files = Array.from(files).filter(file =>
          this.filesExtensions.includes(file.name.split('.').pop().toString())
          && file.size < 10000000
      )

      this.files[field] = files
      this.person[field] = files
    },
    closeErrors() {
      this.errorsExist = false
    },
    chooseOption({ option }) {
      this.availability = option
      this.person.availability = option
    },
    chooseOptions({ option }) {
      const position = this.catExperience.indexOf(option)
      if (position !== -1) {
        this.catExperience.splice(position, 1)
      } else {
        const title = this.catExperienceOptions.find((item) => item === option)
        this.catExperience.push(title)
      }
      this.person.catExperience = this.catExperience
    },
    chooseIndustries({ option }) {
      const position = this.selectedIndustries.findIndex(item => item.name === option)
      if (position !== -1) {
        this.selectedIndustries.splice(position, 1)
      } else {
        if (this.selectedIndustries.length >= 5) {
          this.errors = [ 'You can select only 5 industries' ]
          this.errorsExist = true
          return
        }
        const industry = this.industries.find(item => item.name === option)
        this.selectedIndustries.push(industry)
      }
      this.person.industries = this.selectedIndustries
    },
    setMotherTongue({ option }) {
      const lang = this.languages.find(i => i.lang === option)
      this.selectedTongue = lang
      this.person.native = lang._id
      this.person.lang = lang.lang
    },
    async getAllIndustries() {
      try {
        let result = await this.$axios.$get("/api/industries")
        result.sort((a, b) => a.name.localeCompare(b.name))
        this.industries = result
      } catch (err) {
      }
    },
    removeEnglishLang(languages) {
      return languages.filter(({ lang }) => lang.search("English") === -1 || lang === "English (United Kingdom)")
    },
    async getAllLanguages() {
      try {
        let result = await this.$axios.$get("/api/languages")
        result.sort((a, b) => a.lang.localeCompare(b.lang))
        this.languages = this.removeEnglishLang(result)
      } catch (err) {
      }
    },
    async getAllSteps() {
      try {
        let result = await this.$axios.$get("/api/steps")
        this.steps = result.filter((step) => this.showStep.includes(step.title))

      } catch (err) {
      }
    }
  },
  watch: {
    selectedRate(value) {
      const regex = /[^0-9\.,]/g
      value = parseFloat(value.replace(regex, '').replace(',', '.')) || 0
      this.selectedRate = (+value).toFixed(4)
    }
  },
  created() {
    this.getAllIndustries()
    this.getAllLanguages()
    this.getAllSteps()
  },
  components: {
    Header,
    Footer,
    TextInput,
    UploadFileButton,
    AgreeAndSubmit,
    FilesList,
    SelectSingle,
    SelectMulti,
    ErrorsAlert
  }
}
</script>

<style lang="scss" scoped>
@import "../assets/scss/colors";


.application {
  font-family: Roboto400;
  position: relative;

  &__content {
    max-width: 620px;
    box-shadow: $box-shadow;
    @media all and (orientation: portrait) and (max-width: 767px) {
      box-shadow: none;
    }
    @media all and (orientation: landscape) and (max-width: 1000px) {
      max-width: 100%;
      box-shadow: none;
    }
  }

  &__body {
    display: flex;
    justify-content: center;
    margin: 50px 0;
    @media all and (orientation: portrait) and (max-width: 767px) {
      margin: 10px 0;
    }
    @media all and (orientation: landscape) and (max-width: 1000px) {
      margin: 20px 0;
    }
  }

  &__col50 {
    width: 100%;
    position: relative;
    padding-right: 40px;
    @media all and (orientation: portrait) and (max-width: 767px) {
      padding-right: 0px;
    }
  }

  &__form {
    padding: 40px 0 40px 40px;
    background-color: white;
    border-radius: 4px;
    @media all and (orientation: portrait) and (max-width: 767px) {
      padding: 25px;
    }
    @media all and (orientation: landscape) and (max-width: 1000px) {
      padding: 0px 0px 0px 40px;
    }
  }

  &__radio-group {
    display: flex;
    margin-top: 13px;
  }

  &__radio {
    margin-right: 30px;
  }

  &__header {
    text-align: center;

    .title {
      font-size: 20px;
      letter-spacing: -0.2px;
    }

    .comment {
      font-size: 14px;
      opacity: 0.6;
      padding-right: 40px;
      @media all and (orientation: portrait) and (max-width: 767px) {
        padding: 0px;
      }
    }
  }


  &__step-title {
    font-size: 16px;
    text-transform: uppercase;
    margin-top: 40px;
    letter-spacing: -0.2px;
    border-bottom: 1px solid $light-border;
    margin-right: 40px;
    padding-bottom: 4px;
    margin-bottom: 10px;
    font-family: Roboto600;

    @media all and (orientation: portrait) and (max-width: 767px) {
      padding-bottom: 0px;
      margin-bottom: 5px;
      border-bottom: 0;
      margin-right: 0px;
    }

  }

  &__row {
    &-flex {
      display: flex;

      @media all and (orientation: portrait) and (max-width: 767px) {
        flex-direction: column;
      }
      @media all and (orientation: landscape) and (max-width: 1000px) {
        /*flex-direction: row;*/
      }
    }
  }

  .available__title {
    margin-bottom: 4px;
  }

  &__select-relative {
    position: relative;
    width: 100%;
  }


  &__mb-10 {
    margin-top: 10px;
  }

  &__letter-text {
  }

  &__cover-text {
    text-align: center;
    margin: 5px auto;
  }

  &__files-list {
    display: flex;
  }

  &__cover {
    display: flex;
    flex-direction: column;
  }

  &__text-area {
    padding: 10px;
    resize: none;
    border: 1px solid #c3c5c5;
    border-radius: 4px;
    color: #66563D;
    outline: none;

    &-label {
      margin-bottom: 4px;
    }
  }
}

@font-face {
  font-family: 'Roboto300';
  font-style: normal;
  font-weight: normal;
  src: url('../assets/fonts/Roboto300.woff2') format('woff2');
}

@font-face {
  font-family: 'Roboto400';
  font-style: normal;
  font-weight: normal;
  src: url('../assets/fonts/Roboto400.woff2') format('woff2');
}

@font-face {
  font-family: 'Roboto600';
  font-style: normal;
  font-weight: normal;
  src: url('../assets/fonts/Roboto600.woff2') format('woff2');
}


@font-face {
  font-family: 'Roboto900';
  font-style: normal;
  font-weight: normal;
  src: url('../assets/fonts/Roboto900.woff2') format('woff2');
}

.text {
  margin-top: 25px;
}

.description {
  margin-top: 20px;
  margin-bottom: 4px;
  font-family: Roboto600;
}

p {
  margin: 0;
}

.splitter {
  font-size: 14px;
  opacity: 0.6;
  margin-top: 4px;
}

.radio {
  position: relative;
  cursor: pointer;
  line-height: 20px;
  font-size: 14px;
}

.radio .label {
  position: relative;
  display: block;
  float: left;
  margin-right: 10px;
  width: 18px;
  height: 18px;
  border: 1px solid #c3c5c5;
  border-radius: 100%;
  -webkit-tap-highlight-color: transparent;
}

.radio .label:after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 12px;
  height: 12px;
  border-radius: 100%;
  background: #d66f58;
  opacity: 0;
  pointer-events: none;
}

input[type="radio"]:checked + .label {
  border-color: #c3c5c5;
}

input[type="radio"]:checked + .label:after {
  opacity: 1;
}

.cntr {
  position: absolute;
  top: calc(50% - 10px);
  left: 0;
  width: 100%;
  text-align: center;
}

.text {
  margin-top: 40px;
  padding-right: 40px;
  font-family: 'Roboto600';
}

.hidden {
  display: none;
}

.drop {
  width: 220px;
  height: 32px;
  border-radius: 4px;
  position: relative;
}

</style>
