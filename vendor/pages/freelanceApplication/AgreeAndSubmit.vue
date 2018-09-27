<template lang="pug">
.terms-agree
    .terms-agree__term
        .terms-agree__checkbox(@click="toggleTermsAgree")
            .terms-agree__check(:class="{checked: isAgree}")
        span.terms-agree__text I confirm that the information given in this form is true, complete and accurate and 
            | I agree to provide evidence and/or references for the aforementioned expertise and qualifications
            | if required.
    .terms-agree__captcha
        span.terms-agree__captcha-comment Please, confirm that you are not a robot   
        .terms-agree__google
            .g-recaptcha(data-sitekey="6LfMCXEUAAAAAPVdf_Ej5r0E744vsX3r-TxOc7Ed"
            style= {"transform": "scale(0.77)",
                "-webkit-transform": "scale(0.77)",
                "transform-origin": "150px 0",
                "-webkit-transform-origin": "150px 0" })
    input.terms-agree__submit(type="button" value="Submit" @click="checkForm")
    script(src='https://www.google.com/recaptcha/api.js', defer=true, async=true)
</template>

<script>
export default {
    props: {
        person: {
            type: Object
        }
    },
    data() {
        return {
            isAgree: false,
            errors: []
        }
    },
    methods: {
        toggleTermsAgree() {
            this.isAgree = !this.isAgree;
        },
        async checkForm() {
            this.errors = [];
            if(!this.person.firstName) this.errors.push("Please enter your name.");
            if(!this.person.surname) this.errors.push("Please enter your surname.");
            if(!this.person.email) this.errors.push("Please enter your email.");
            if(!this.person.phone) this.errors.push("Please enter your phone number.");
            if(!this.person.native) this.errors.push("Please select your mother tongue.");
            if(!this.person.timezone) this.errors.push("Please select your timezone.");
            if(this.person.languagePairs && !this.person.languagePairs.length) this.errors.push("Please set at least one language pair.");
            if(this.person.cvFiles && !this.person.cvFiles.length) this.errors.push("Please upload CV file.");
            if(!this.person.position) this.errors.push("Please select position(s).");
            if(!this.person.translationExp) this.errors.push("Please select years of experience.");
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
    }
    &__text {
        font-size: 12px;
        margin-left: 3px;
        width: 90%;
        text-align: justify;
        @media (max-width: 450px) {
            width: 87%;
        }
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
        font-size: 12px;
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
        color: #FFF;
        font-size: 14px;
        background-color: #FF876C;
        border: none;
        outline: none;
        height: 40px;
        width: 170px;
        border-radius: 10px;
        box-shadow: 0 3px 8px rgba(103, 87, 62, 0.5);
        cursor: pointer;
        &:hover {
            box-shadow: 0 0 7px rgba(103, 87, 62, 0.8);
        }
        &:active {
            box-shadow: 0 0px 15px rgba(103, 87, 62, 1);
        }
    }
}

</style>
