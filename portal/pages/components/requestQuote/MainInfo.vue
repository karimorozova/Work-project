<template lang="pug">
    .main-info
        .main-info__container
            Form(@checkData="checkData")
            .main-info__details-slide-button(@click="toggleDetails" :class="{'main-info_rotate-0': isDetails}") Your Order
            .main-info__help-slide-button(@click="toggleHelp" :class="{'main-info_rotate-0': isHelpInfo}") Need Help?
        .main-info__order-details
            .main-info_sticky
                OrderDetails(:isDetails="isDetails")
                HelpInfo(:isHelpInfo="isHelpInfo")
</template>

<script>
import Form from "./mainInfo/Form";
import OrderDetails from "./OrderDetails";
import HelpInfo from "./HelpInfo";
import { mapGetters } from "vuex";

export default {
    data() {
        return {
            errors: [],
            isDetails: false,
            isHelpInfo: false
        }
    },
    methods: {
        async checkData() {
            this.errors = [];
            if(!this.requestDetails.service) this.errors.push("Select service type");
            if(this.requestDetails.service && !this.checkSource()) this.errors.push("Select source language");
            if(!this.requestDetails.targetLanguages || !this.requestDetails.targetLanguages.length) this.errors.push("Select target language(s)");
            if(!this.requestDetails.industry) this.errors.push("Select industry");
            if(!this.requestDetails.contactName) this.errors.push("Please, enter contact name");
            if(!this.checkEmail()) this.errors.push("Please, enter valid email address");
            if(!this.requestDetails.phone) this.errors.push("Please, enter contact phone number");
            if(!this.requestDetails.companyName) this.errors.push("Please, enter company name");
            await this.checkCaptcha();
            if(this.errors.length) {
                return this.$emit("showErrors", {errors: this.errors});
            }
            this.$emit("sendForm");
        },
        checkEmail() {
            const { contactEmail } = this.requestDetails;
            const regex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
            return contactEmail && regex.test(contactEmail);
        },
        checkSource() {
            if(this.requestDetails.service.languageForm === 'Duo') {
                return this.requestDetails.sourceLanguage && this.requestDetails.sourceLanguage.lang !== 'Select'
            }
            return false;
        },
        async checkCaptcha() {
            let captchaValidation = await grecaptcha.getResponse();
            if(captchaValidation.length === 0) {
                this.errors.push("Captcha is required");
            }
        },
        toggleDetails() {
            this.isDetails = !this.isDetails;
            this.isHelpInfo = false;
        },
        toggleHelp() {
            this.isHelpInfo = !this.isHelpInfo;
            this.isDetails = false;
        }
    },
    components: {
        Form,
        OrderDetails,
        HelpInfo
    },
    computed: {
        ...mapGetters({
            requestDetails: "getRequestQuoteDetails"
        })
    }    
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.main-info {
    max-width: 1320px;
    margin: 0 auto;
    display: flex;
    @media (max-width: 1024px) {
        justify-content: center;
    }
    &__container {
        margin-left: 20%;
        @media (max-width: 1280px) {
            margin-left: 10px;
        }
    }
    &__order-details {
        margin-left: 20px;
        @media (max-width: 1280px) {
            margin-left: 10px;
        }
    }
    &_sticky {
        position: sticky;
        top: 7px;
        z-index: 50;
    }
    &__details-slide-button, &__help-slide-button {
        display: none;
        @media (max-width: 1024px) {
            display: block;
            position: fixed;
            transform: rotate(-90deg);
            background-color: $orange;
            color: $white;
            font-weight: bold;
            padding: 5px;
            border: 1px solid $orange;
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
            z-index: 10;
            transition: all 0.2s;
            right: -27px;
        }
    }
    &__details-slide-button {
        top: 40px; 
    }
    &__help-slide-button {
        top: 140px;
        right: -30px;
    }
    &_rotate-0 {
        transform: rotate(0);
        right: 0;
    }
}

</style>
