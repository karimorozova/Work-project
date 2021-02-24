<template lang="pug">
.terms-agree
    .terms-agree__term
        .terms-agree__checkbox(@click="(e) => toggleTermsAgree('isConfirm')")
            .terms-agree__check(:class="{checked: isConfirm}")
        span.terms-agree__text.terms-agree_justified I confirm that the information given in this form is true, complete and accurate and 
            | I agree to provide evidence and/or references for the aforementioned expertise and qualifications
            | if required.
    .terms-agree__term.terms-agree_align-start
        .terms-agree__checkbox(@click="(e) => toggleTermsAgree('isAgree')")
            .terms-agree__check(:class="{checked: isAgree}")
        span.terms-agree__text I have read and accept the 
            a.terms-agree__link(href="https://www.pangea.global/employment-candidate-privacy-notice" target="_blank") Employment Candidate Privacy Notice
    .terms-agree__captcha
        span.terms-agree__captcha-comment Please, confirm that you are not a robot   
        .terms-agree__google
            .g-recaptcha(data-sitekey="6LfMCXEUAAAAAPVdf_Ej5r0E744vsX3r-TxOc7Ed"
            style= {"transform": "scale(0.77)",
                "-webkit-transform": "scale(0.77)",
                "transform-origin": "150px 0",
                "-webkit-transform-origin": "150px 0" })
    input.terms-agree__submit(type="button" value="Submit" @click="checkForm" :disabled="!isAgree || !isConfirm" :class="{'terms-agree_disabled': !isAgree || !isConfirm}")
    script(src='https://www.google.com/recaptcha/api.js', defer=true, async=true)
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
    props: {
        person: {
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
        ...mapActions(["alertToggle"]),
        toggleTermsAgree(prop) {
            this[prop] = !this[prop];
        },
        validateEmail() {
            const emailValidRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
            const email = this.person.email.toLowerCase();
            return emailValidRegex.test(email);
        },
        async checkEmailErrors() {
            try {
                if(!this.person.email || !this.validateEmail()) {
                    this.errors.push("Please enter your valid email.");
                    return
                }
                const result = await this.$axios.get(`/vendors/application/unique-email?email=${this.person.email}`);
                const isUnique = !result.data;
                isUnique ? "" : this.errors.push("The email you've entered is already used in our system!");
            } catch(err) {

            }
        },
        getFilesSummarizedSize(files) {
            return files.reduce((prev, cur) => {
                return prev + cur.size/1000000;
            }, 0)
        },
        areCvFilesTooBig(files) {
            const sum = this.getFilesSummarizedSize(files); 
            return sum > 20;
        },
        areCoverLetterFilesTooBig(files) {
            const sum = this.getFilesSummarizedSize(files); 
            return sum > 2;
        },
        async checkForm() {
            this.errors = [];
            try {
                if(!this.person.firstName) this.errors.push("Please enter your name.");
                if(!this.person.surname) this.errors.push("Please enter your surname.");
                await this.checkEmailErrors();
                if(!this.person.phone) this.errors.push("Please enter your phone number.");
                if(!this.person.native) this.errors.push("Please select your mother tongue.");
                if(!this.person.timezone) this.errors.push("Please select your timezone.");
                if(!this.person.languagePairs || (this.person.languagePairs && !this.person.languagePairs.length)) this.errors.push("Please set at least one language pair.");
                if(!this.person.cvFiles || (this.person.cvFiles && !this.person.cvFiles.length)) this.errors.push("Please upload CV file.");
                if(this.person.cvFiles && this.person.cvFiles.length && this.areCvFilesTooBig(this.person.cvFiles)) this.errors.push("All CV files should have summarized size not more than 20Mb");
                if(this.person.coverLetterFiles && this.person.coverLetterFiles.length && this.areCoverLetterFilesTooBig(this.person.coverLetterFiles)) {
                    this.errors.push("All Cover Letter files should have summarized size not more than 2Mb");
                }
                if(!this.person.positions) this.errors.push("Please select position(s).");
                if(!this.person.experienceYears) this.errors.push("Please select years of experience.");
                if((this.person.technicalComp && !this.person.technicalComp.internet) || !this.person.technicalComp) this.errors.push("Please select internet access.");
                if(!this.person.industries) this.errors.push("Please select industries.");
                if(!this.person.availability) this.errors.push("Please select availability.");
                if(!this.person.testAgree) this.errors.push("Please answer the question about the test.");
                let captchaValidation = await grecaptcha.getResponse();
                if(captchaValidation.length === 0) this.errors.push("Please confirm that you are not a robot.");
                if(this.errors.length) {
                    this.$emit("formValidationFail", {errors: this.errors})
                } else {
                    this.$emit("sumbitForm", {confirmed: this.isAgree})
                }
            } catch(err) {
                this.alertToggle({message: "An errors occured. Please try again later.", isShow: true, type: "error"});
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
    width: 80%;
    &__term {
      display: flex;
      margin-bottom: 10px;

    }
    &__text {
        font-size: 14px;
        margin-left: 3px;
    }
    &__link {
        color: #67573E;
        font-weight: 600;
    }
    &__checkbox {
        margin: 3px 3px 0 5px;
        width: 18px;
        height: 18px;
        border: 1px solid #67573E;
        .checked {
            width: 100%;
            height: 100%;
            position: relative;
            &::before {
                content: '';
                position: absolute;
                width: 7px;
                height: 2px;
                background-color: #67573E;
                border: 1px solid #67573E;
                top: 9px;
                left: 2px;
                transform: rotate(45deg);
            }
            &::after {
                content: '';
                position: absolute;
                width: 12px;
                height: 2px;
                background-color: #67573E;
                border: 1px solid #67573E;
                top: 7px;
                left: 5px;
                transform: rotate(-65deg);
            }
        }
    }
    &__captcha {
        margin-top: 30px;
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
      min-width: 120px;
      padding: 0 24px 0 24px;
      height: 34px;
      color: #fff;
      font-size: 14px;
      border-radius: 7px;
      background-color: #d15f45;
      border: none;
      transition: .1s ease;
      outline: none;
      letter-spacing: 0.2px;

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
