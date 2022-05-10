<template lang="pug">
  .terms-agree
    .terms-agree__term.terms-agree_align-start
      .terms-agree__checkbox(@click="(e) => toggleTermsAgree('isAgree')")
        .terms-agree__check(:class="{checked: isAgree}")
      span.terms-agree__text I agree to get a test
    .terms-agree__captcha
      .terms-agree__google
        .g-recaptcha(data-sitekey="6LfMCXEUAAAAAPVdf_Ej5r0E744vsX3r-TxOc7Ed"
          style={
            "transform": "scale(0.87)",
            "-webkit-transform": "scale(0.87)",
            "transform-origin": "150px 0",
            "-webkit-transform-origin": "150px 0"
          })
    input.terms-agree__submit(type="button" value="Submit Application" @click="checkForm")
    script(src='https://www.google.com/recaptcha/api.js', defer=true, async=true)
</template>

<script>
import { mapGetters, mapActions } from "vuex"

export default {
  props: {
    person: {
      type: Object
    },
    secondInfo: {
      type: Object
    }
  },
  data() {
    return {
      isConfirm: false,
      isAgree: false,
      errors: []
    }
  },
  methods: {
    ...mapActions([ "alertToggle" ]),
    toggleTermsAgree(prop) {
      this[prop] = !this[prop]
    },
    validateEmail() {
      const emailValidRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
      const email = this.person.email.toLowerCase()
      return emailValidRegex.test(email)
    },
    async checkEmailErrors() {
      try {
        if (!this.person.email || !this.validateEmail()) {
          this.errors.push("Please enter your valid email.")
          return
        }
        const result = await this.$axios.get(`/vendors/application/unique-email?email=${ this.person.email }`)
        const isUnique = !result.data
        isUnique ? "" : this.errors.push("The email you've entered is already used in our system!")
      } catch (err) {

      }
    },
    getFilesSummarizedSize(files) {
      return files.reduce((prev, cur) => {
        return prev + cur.size / 1000000
      }, 0)
    },
    areCvFilesTooBig(files) {
      const sum = this.getFilesSummarizedSize(files)
      return sum > 20
    },
    areCoverLetterFilesTooBig(files) {
      const sum = this.getFilesSummarizedSize(files)
      return sum > 2
    },
    async checkForm() {

      this.errors = []
      try {
        if (!this.person.firstName) this.errors.push("Please enter your name.")
        if (!this.person.phone) this.errors.push("Please enter your phone.")
        if (!this.person.surname) this.errors.push("Please enter your surname.")
        await this.checkEmailErrors()
        if (!this.person.native) this.errors.push("Please select your mother tongue.")
        if (!this.person.industries) this.errors.push("Please select the industries.")
        if (this.secondInfo.CAT !== true) this.errors.push("Unfortunately, you must have experience in CAT Tools to be able to join Pangea.")
        if (this.secondInfo.CAT === true && !this.person.catExperience) this.errors.push("Please select the CAT Tools you use.")
        if (!this.person.cv || (this.person.cv && !this.person.cv.length)) this.errors.push("Please upload CV file.")
        if (this.person.cv && this.person.cv.length && this.areCvFilesTooBig(this.person.cv)) this.errors.push("All CV files should have summarized size not more than 20Mb")
        if (this.person.hasOwnProperty('cv') && this.person.hasOwnProperty('cover')) {
          for (let fileName of this.person.cv.map(item => item.name)) {
            if (this.person.cover.map(item => item.name).includes(fileName)) {
              this.errors.push("File names must be different.")
            }
          }
        }
        if (!this.person.availability) this.errors.push("Please select availability.")
        if (!this.isAgree) this.errors.push("To be able to join our team, you must complete a short test of 300 words. Please confirm that you agree to take a test.")
        let captchaValidation = await grecaptcha.getResponse()
        if (captchaValidation.length === 0) this.errors.push("Please confirm that you are not a robot.")
        if (this.errors.length) {
          this.$emit("formValidationFail", { errors: this.errors })
        } else {
          this.$emit("sumbitForm", { confirmed: this.isAgree })
        }
      } catch (err) {
        this.alertToggle({ message: "An errors occured. Please try again later.", isShow: true, type: "error" })
      }
    }
  }
}
</script>

<style lang="scss" scoped>

.terms-agree {
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;

  &__term {
    display: flex;
    margin-bottom: 10px;

  }

  &__text {
    font-size: 14px;
    margin-left: 7px;
    font-family: Roboto600;
  }

  &__link {
    color: #333;
    font-weight: 600;
  }

  &__checkbox {
    width: 16px;
    height: 16px;
    border: 1px solid #333;

    .checked {
      width: 100%;
      height: 100%;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        width: 10px;
        height: 3px;
        background-color: #333;
        top: 9px;
        left: 1px;
        -webkit-transform: rotate(45deg);
        transform: rotate(45deg);
      }

      &::after {
        content: '';
        position: absolute;
        width: 12px;
        height: 3px;
        background-color: #333;
        top: 7px;
        left: 5px;
        -webkit-transform: rotate(-65deg);
        transform: rotate(-65deg);
      }
    }
  }

  &__captcha {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  &__captcha-comment {
    font-size: 14px;
    margin-bottom: 3px;
    position: relative;

    &:after {
      content: "*";
      position: absolute;
      top: -2px;;
      right: -7px;
      color: red;
    }
  }

  &__submit {
    margin-top: 10px;
    width: calc(50% - 40px);
    height: 38px;
    color: #fff;
    font-size: 14px;
    border-radius: 4px;
    background-color: #d66f58;
    border: none;
    transition: .1s ease;
    outline: none;
    letter-spacing: 0.2px;

    @media all and (orientation: portrait) and (max-width: 767px) {
      width: 100%;
    }
    @media all and (orientation: landscape) and (max-width: 1000px) {
      /*padding: 20px;*/
    }

    &:hover {
      cursor: pointer;
      box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15);
    }

    &:active {
      transform: scale(.98);
    }
  }

  &_disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;

    &:hover, &:active {
      box-shadow: none;
    }
  }

  &_justified {
    text-align: justify;
    width: 90%;
    @media (max-width: 450px) {
      width: 87%;
    }
  }

  &_align-start {
    align-self: flex-start;
    align-items: center;
  }
}

</style>
