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
              .application__select-relative
                SelectLanguage.application__mb-10(
                  label="Mother tongue:"
                  placeholder="Select"
                  :selectedLang="selectedTongue"
                  @chooseLang="setMotherTongue"
                )

          p.application__step-title Professional Information

          .application__row-flex
            .application__col50
              .application__availability.application__mb-10
                .available__title Availability:
                SelectSingle(
                  :selectedOption="availability"
                  :options="availabilityOptions"
                  @chooseOption="chooseOption"
                )
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

          .application__row-flex(v-if="secondInfo.CAT === true")
            .application__col50
              .available__title.application__mb-10 Please select the software you currently use or have previous experience:
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
            .application__col50

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
                //textarea.application__text-area(rows=4 v-model="coverLetter" @change="setCoverLetter")
                //.splitter and / or
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
				files: { cv: [], cover: [] },
				availabilityOptions: [ "Full-time", "Part-time", "Limited" ],
				availability: "",
				softwaresOptions: [ "XTM", "MemoQ", "Trados" ],
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
			uploadCvFile(field, { files }) {
				this.files[field] = files
				this.person[field] = files
			},
			setCoverLetter() {
				this.person['coverLetter'] = this.coverLetter
			},
			closeErrors() {
				this.errorsExist = false
			},
			chooseOption({ option }) {
				this.availability = option
				this.person.availability = option
			},
			chooseOptions({ option }) {
				const position = this.softwares.indexOf(option)
				if (position !== -1) {
					this.softwares.splice(position, 1)
				} else {
					const title = this.softwaresOptions.find((item) => item === option)
					this.softwares.push(title)
				}
				this.person.softwares = this.softwares
			},
			setMotherTongue({ lang }) {
				this.selectedTongue = lang
				this.person.native = lang._id
				this.person.lang = lang.lang
			}
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

    &__content {
      max-width: 650px;
      box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
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
      @media all and (orientation: portrait) and (max-width: 767px) {
        padding: 20px;
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
        /*@media all and (orientation: landscape) and (max-width: 1000px) {*/
        /*  padding: 0px 40px 0px 0px;*/
        /*}*/
      }
    }


    &__step-title {
      font-size: 18px;
      text-transform: uppercase;
      margin-top: 40px;
      letter-spacing: -0.2px;
      border-bottom: 1px solid #dad6d0;
      margin-right: 40px;
      padding-bottom: 4px;
      margin-bottom: 10px;

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
      margin-top: 8px;
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
      border-radius: 10px;
      color: #66563D;
      outline: none;

      &-label {
        margin-bottom: 4px;
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

  .text {
    margin-top: 25px;
  }

  .description {
    margin-top: 20px;
    margin-bottom: 4px;
    font-family: Myriad600;
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
    background: #d15f45;
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
  .text{
    margin-top: 40px;
    padding-right: 40px;
    font-family: 'Myriad600';
  }

  .hidden {
    display: none;
  }

</style>
