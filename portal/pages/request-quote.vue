<template lang="pug">
    .request-form
        noscript
            iframe(src="https://www.googletagmanager.com/ns.html?id=GTM-KM2S59F" height="0" width="0" style="display:none;visibility:hidden")
        script(type="text/javascript" id="hs-script-loader" async defer src="//js.hs-scripts.com/7518623.js")
        Header
        MainInfo(@showErrors="showErrors" @sendForm="sendForm")
        Footer
        ValidationErrors(v-if="areErrors" :errors="errors" @closeErrors="closeErrors" customClass="request-quote__errors")
        script(src='https://www.google.com/recaptcha/api.js', defer=true, async=true)
</template>

<script>
import Header from "./components/requestQuote/Header";
import MainInfo from "./components/requestQuote/MainInfo";
import Footer from "@/components/Footer";
import ValidationErrors from "@/components/ValidationErrors";
import { mapGetters, mapActions } from "vuex";

export default {
    data() {
        return {
            errors: [],
            areErrors: false
        }
    },
    methods: {
        showErrors({errors}) {
            this.errors = [];
            this.errors = [...errors];
            this.areErrors = true;
        },
        closeErrors() {
            this.areErrors = false;
        },
        async sendForm() {
            const detailFiles = this.requestDetails.detailFiles || [];
            const refFiles = this.requestDetails.refFiles || [];
            let sendForm = new FormData();

            sendForm.append("date", this.requestDetails.deadline);
            sendForm.append("contactName", this.requestDetails.contactName);
            sendForm.append("contactEmail", this.requestDetails.contactEmail);
            sendForm.append("service", JSON.stringify(this.requestDetails.service));
            sendForm.append("industry", JSON.stringify(this.requestDetails.industry)); 
            sendForm.append("status", "New");
            sendForm.append("sourceLanguage", JSON.stringify(this.requestDetails.sourceLanguage));
            sendForm.append("targetLanguages", JSON.stringify(this.requestDetails.targetLanguages)); 
            sendForm.append("web", this.requestDetails.web);
            sendForm.append("skype", this.requestDetails.skype);
            sendForm.append("phone", this.requestDetails.phone);
            sendForm.append("companyName", this.requestDetails.companyName);
            sendForm.append("accountManager", "None selected");
            sendForm.append("brief", this.requestDetails.brief);
            sendForm.append("createdAt", new Date());
            for(var i = 0; i < detailFiles.length; i++){
            sendForm.append("detailFiles", detailFiles[i]);
            }
            sendForm.append("refFiles", refFiles[0]);
            try {
                const result = await this.$axios.$post('/api/request', sendForm);
                window.location.href = "https://www.pangea.global/thank-you";
            } catch(err) {
                const errors = [err.message];
                this.showErrors({errors})
                console.log(err);
            }
        },
    },
    computed: {
        ...mapGetters({
            requestDetails: "getRequestQuoteDetails"
        })
    },
    components: {
        Header,
        MainInfo,
        Footer,
        ValidationErrors
    }    
}
</script>

<style lang="scss">
    // div#hs-eu-cookie-confirmation{
    //     display: none!important;
    // }
</style>
