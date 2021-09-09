<template lang="pug">
  .wrapper
    ValidationErrors(
      v-if="areErrorsExist"
      :errors="errors"
      @closeErrors="closeErrorsBlock"
      :isAbsolute="true"
    )
    .contact__photo-n-info
      .contact__photo
        .photo-wrap(v-if="!contact.photo")
          input.photo-file(type="file" @change="previewPhoto")
          .photo-text(v-if="!isImageExist")
            p.photo-text__message(v-if="!isFileError") Upload File
              span.photo-extensions *.jpg/jpeg/png
              span.photo-size <= 2MB
          img.photo-image(v-if="isImageExist")
          p.photo-text__error-message(v-if="isFileError") Incorrect file type or size
        .photo-wrap(v-if="contact.photo")
          input.photo-file(type="file" @change="previewPhoto")
          img.photo-image(:src="contact.photo")
      .contact__info
        .info__firstName
          .input__title Name:
            span.mandatory *
          input.input__main(type="text" placeholder="Value" v-model="contact.firstName")
        .info__surname
          .input__title Surname:
          input.input__main(type="text" placeholder="Value" v-model="contact.surname")

    .contact__subInfo
      .cols
        .col
          .col__row
            .input__title Position:
              span.mandatory *
            input.input__main(type="text" placeholder="Value" v-model="contact.position")
          .col__row
            .input__title Phone:
            input.input__main(type="text" placeholder="Number" :value="contact.phone" @input="setPhone" ref="phone")
          .col__row
            .input__title Country:
            .input__drop
              SelectSingle(
                :hasSearch="true"
                :options="countries",
                placeholder="Country",
                :selectedOption="contact.country",
                @chooseOption="setCountry"
              )

        .col
          .col__row
            .input__title Email:
              span.mandatory *
            input.input__main(type="text" placeholder="Value" v-model="contact.email")
          .col__row
            .input__title Gender:
            .input__drop
              SelectSingle(
                :options="['Male','Female']"
                :selectedOption="contact.gender"
                placeholder="Option"
                @chooseOption="setGender"
              )
          .col__row
            .input__title Time zone:
            .input__drop
              SelectSingle(
                :hasSearch="true"
                :options="timezones.map(item => item.zone)",
                placeholder="Timezone",
                :selectedOption="contact.timezone",
                @chooseOption="setZone"
              )
      .notes
        .input__title Notes:
        textarea(type="text" v-model="contact.notes")

    .contact__buttons
      Button(value="Save" @clicked="checkErrors" :isDisabled="!contact.firstName || !contact.position || !contact.email")
      Button(value="Cancel", :outline="true" @clicked="closeModal")

</template>

<script>
	import Button from "../Button"
	import photoPreview from '@/mixins/photoPreview'
	import SelectSingle from "../SelectSingle"
	import ValidationErrors from "../ValidationErrors"

	export default {
		mixins: [ photoPreview ],
		name: "ContactsManageModal",
		components: { ValidationErrors, SelectSingle, Button },
		props: {
			contact: {
				type: Object
			}
		},
		data() {
			return {
				isImageExist: false,
				isFileError: false,
				areErrorsExist: false,
				previousEmail: { ...this.contact }.email,
				photoFile: [],
				countries: [],
				timezones: [],
				errors: []
			}
		},
		methods: {

			async checkErrors() {
				this.errors = []
				const emailValidReg = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
				const textReg = /^[-\sa-zA-Z]+$/
				if (!this.contact.firstName || !textReg.test(this.contact.firstName)) this.errors.push("Please, enter valid contact's first name.")
				if (!this.contact.position || !textReg.test(this.contact.position)) this.errors.push("Please, enter valid contact's position.")
				if (this.contact.surname && !textReg.test(this.contact.surname)) this.errors.push("Please, enter valid contact's surname.")

				if (!this.previousEmail || this.previousEmail !== this.contact.email) {
					if (!this.contact.email || !emailValidReg.test(this.contact.email)) this.errors.push("Please, enter valid e-mail address.")
					if (this.contact.email && emailValidReg.test(this.contact.email)) await this.checkEmailUniq()
				}

				if (/^\s+$/.exec(this.contact.firstName) || /^\s+$/.exec(this.contact.firstName)) this.errors.push("Please, enter valid contact's first name or e-mail address.")

				if (this.errors.length) {
					this.areErrorsExist = true
					return
				}
				this.contactSave()
				this.closeModal()
			},
			contactSave() {
				this.$emit('contactSave', { contact: this.contact, file: this.photoFile[0] })
			},
			closeModal() {
				this.$emit('closeModal')
			},
			setPhone(e) {
				const { value } = e.target
				const regex = /^[0-9]+$/
				const characters = value.split("").filter(item => regex.test(item))
				const clearedValue = characters.join("")
				this.contact.phone = clearedValue.length > 19 ? clearedValue.slice(0, 19) : clearedValue
				this.$refs.phone.value = this.contact.phone
			},
			setCountry({ option }) {
				this.contact.country = option
			},
			setZone({ option }) {
				this.contact.timezone = option
			},
			setGender({ option }) {
				this.contact.gender = option
			},
			closeErrorsBlock() {
				this.areErrorsExist = false
			},
			async getCountries() {
				try {
					const result = await this.$http.get('/api/countries')
					this.countries = result.data
				} catch (err) {
					console.log(err)
				}
			},
			async getTimezones() {
				try {
					const result = await this.$http.get('/api/timezones')
					this.timezones = result.data
				} catch (err) {
					console.log(err)
				}
			},
			async checkEmailUniq() {
				try {
					const result = await this.$http.get(`/clientsapi/unique-email?email=${ this.contact.email }`)
					if (result.body === "exist") this.errors.push("The email you entered is already used in our system.")
				} catch (err) {
					console.log(err)
				}
			}
		},
		created() {
			this.getTimezones()
			this.getCountries()
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors";

  .wrapper {
    box-shadow: $box-shadow;
    background-color: white;
    border-radius: 4px;
    width: 510px;
  }

  .cols {
    display: flex;
    justify-content: space-between;
  }

  .col {
    &__row {
      margin-bottom: 15px;
    }
  }

  .contact {
    &__photo-n-info {
      display: flex;
      justify-content: space-between;
      padding: 25px;
      background-color: $table-list;
    }

    &__photo {
      margin-left: 40px;
    }

    &__subInfo {
      border-top: 1px solid $light-border;
      border-bottom: 1px solid $light-border;
      padding: 25px;
    }

    &__buttons {
      display: flex;
      justify-content: center;
      gap: 25px;
      padding: 25px;
    }
  }

  .info {
    &__firstName {
      margin: 10px 0 12px 0;
    }
  }

  .photo-wrap {
    width: 130px;
    height: 130px;
    border: 1px solid $border;
    position: relative;
    overflow: hidden;
    display: flex;
    justify-content: center;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background-color: white;

    .photo-image {
      object-fit: cover;
      height: 130px;
      width: 130px;
    }
  }

  .photo-file {
    position: absolute;
    top: -22px;
    height: 152px;
    width: 130px;
    background-color: transparent;
    outline: none;
    border: none;
    z-index: 5;
    cursor: pointer;
    border-radius: 42%;
  }

  .photo-text {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;

    &__message {
      font-size: 16px;
      opacity: .5;
      text-align: center;
      font-family: 'Myriad600';
    }

    &__error-message {
      position: absolute;
      z-index: 12;
      background-color: white;
      color: $red;
      height: 130px;
      width: 130px;
      display: flex;
      align-items: center;
      padding: 10px;
      box-sizing: border-box;
      font-size: 14px;
      text-align: center;
    }
  }

  .photo-extensions {
    margin-top: 5px;
  }

  .photo-extensions,
  .photo-size {
    display: block;
    font-size: 12px;
    font-family: 'Myriad400';
  }

  .input {
    &__main {
      font-size: 14px;
      color: $text;
      border: 1px solid $border;
      border-radius: 4px;
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

    &__drop {
      position: relative;
      width: 220px;
      background: white;
      border-radius: 4px;
      height: 32px;
    }

    &__title {
      display: block;
      margin-bottom: 3px;
    }
  }

  textarea {
    color: $text;
    height: 50px;
    width: 450px;
    border: 1px solid $border;
    border-radius: 4px;
    outline: none;
    transition: .1s ease-out;
    padding: 7px;
    background-color: white;

    &:focus {
      border: 1px solid $border-focus;
    }
  }

  .mandatory {
    color: $red;
    padding-left: 2px;
  }
</style>