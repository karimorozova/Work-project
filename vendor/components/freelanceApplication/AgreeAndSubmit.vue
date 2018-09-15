<template lang="pug">
.terms-agree
    .terms-agree__term
        .terms-agree__checkbox(@click="toggleTermsAgree")
            .terms-agree__check(:class="{checked: isAgree}")
        .terms-agree__text I confirm that the information given in this form is true, complete and accurate and I agree <br>
            | to provide evidence and/or references for the aforementioned expertise and qualifications <br>
            | if required.
    .terms-agree__captcha
        span.terms-agree__captcha-comment Please, confirm that you are not a robot   
        .terms-agree__google
            .g-recaptcha(data-sitekey="6LfHMFEUAAAAAJrIpd_0BOsfWqS04aLnEaT3NVOZ"
            style= {"transform": "scale(0.77)",
                "-webkit-transform": "scale(0.77)",
                "transform-origin": "150px 0",
                "-webkit-transform-origin": "150px 0" })
    input.terms-agree__submit(type="button" value="Submit" @click="checkForm")
    script(src='https://www.google.com/recaptcha/api.js', defer=true, async=true)
</template>

<script>
export default {
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
            let captchaValidation = await grecaptcha.getResponse();
            if(captchaValidation.length === 0) this.errors.push("captcha required");
        }
    }
}
</script>

<style lang="scss" scoped>

.terms-agree {
    display: flex;
    flex-direction: column;
    align-items: center;
    &__term {
        display: flex;
    }
    &__text {
        font-size: 12px;
        margin-left: 3px;
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
        width: 80px;
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
