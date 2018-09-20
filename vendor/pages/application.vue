<template lang="pug">
.application
    Header(
        headerText="Application Form"
    )
    form.application__form
        .application__header 
            span.title FREELANCE APPLICATION
            span.comment If you have any queries regarding the completion of this form, please contact vendor@pangea.global.
        .application__section.personal-info
            PersonalInfo(
                :otherChoiceVisibile="otherPositionVisibile"
                @setValue="setPersonInfo"
                @setLangPair="setLangPair"
                @uploadCvFiles="uploadingFiles"
                @showOtherChoice="showOtherChoice"
                @closeOtherChoice="closeOtherChoice"
            )
        .application__section.education
            Education(
                @setValue="setPersonInfo"
            )
        .application__section.translation-experience
            TranslationExp(
                @setValue="setPersonInfo"
            )
        .application__section.competence
            TechnicalCompetence(
                :otherChoiceVisibile="otherTechVisibile"
                @setValue="setPersonInfo"
                @showOtherChoice="showOtherChoice"
                @closeOtherChoice="closeOtherChoice"
            )
        .application__section.domain-experience
            DomainExp(
                :otherChoiceVisibile="otherIndustryVisibile"
                @setValue="setPersonInfo"
                @showOtherChoice="showOtherChoice"
                @closeOtherChoice="closeOtherChoice"
            )
        .application__section.other
            Other(
                @setValue="setPersonInfo"
                @uploadCoverLetter="uploadingFiles"
            )
        .application__agree-submit
            AgreeAndSubmit(
                :person="person"
                @formValidationFail="formValidationFail"
                @sumbitForm="sumbitForm"
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
import axios from "axios";
import Header from "@/components/Header";
import PersonalInfo from "./freelanceApplication/PersonalInfo";
import Education from "./freelanceApplication/Education";
import TranslationExp from "./freelanceApplication/TranslationExp";
import TechnicalCompetence from "./freelanceApplication/TechnicalCompetence";
import DomainExp from "./freelanceApplication/DomainExp";
import Other from "./freelanceApplication/Other";
import AgreeAndSubmit from "./freelanceApplication/AgreeAndSubmit";
import OtherChoice from "./freelanceApplication/OtherChoice";
import Footer from "@/components/Footer";
import ErrorsAlert from "@/components/ErrorsAlert";
import { mapActions } from "vuex";

export default {
    data() {
        return {
            otherChoiceVisibile: false,
            otherIndustryVisibile: false,
            otherTechVisibile: false,
            otherPositionVisibile: false,
            otherChoiceRef: "",
            person: {},
            langPairs: [],
            errorsExist: false
        }
    },
    methods: {
        setPersonInfo({property, value}) {
            this.person[property] = value;
        },
        setLangPair({langPairs}) {
            this.langPairs = langPairs.filter((obj, pos, arr) => {
                return arr.map(mapObj => mapObj.source + mapObj.target).indexOf(obj.source+obj.target) === pos
            })
            this.person.languagePairs = this.langPairs
        },
        uploadingFiles({property, files}) {
            this.person[property] = files;
        },
        showOtherChoice({variable}) {
            this[variable] = true;
            this.otherChoiceVisibile = true;
        },
        closeOtherChoice({variable}) {
            this[variable] = false;
            this.otherChoiceVisibile = false;
        },
        formValidationFail({errors}) {
            this.errors = errors;
            return this.errorsExist = this.errors.length ? true: false
        },
        closeErrors() {
            this.errorsExist = false;
        },
        async sumbitForm({confirmed}) {
            this.person.confirmed = confirmed;
            this.saveForm(this.person);
            await this.$axios.post("/vendors/application/send-form", this.person);
            window.top.location.href = "https://www.pangea.global/thank-you";
        },
        ...mapActions({
            saveForm: 'setApplicationForm'
        })
    },
    components: {
        Header,
        PersonalInfo,
        Education,
        TranslationExp,
        TechnicalCompetence,
        DomainExp,
        Other,
        AgreeAndSubmit,
        OtherChoice,
        Footer,
        ErrorsAlert
    }
}
</script>

<style lang="scss" scoped>

.application {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-family: MyriadPro;
    color: #67573E;
    position: relative;
    &__form {
        margin-top: 40px;
        margin-bottom: 40px;
        width: 33.5%;
        padding: 30px 50px;
        border: 1px solid #67573E;
        border-radius: 15px;
        display: flex;
        flex-direction: column;
    }
    &__header {
        display: flex;
        flex-direction: column;
        align-items: center;
        .title {
            font-size: 22px;
            margin-bottom: 15px;
        }
        .comment {
            font-size: 12px;
        }
    }
    &__section {
        display: flex;
        margin-top: 40px;
    }
    .education, .other {
        margin-top: 10px;
    }
    .translation-experience {
        margin-bottom: 50px;
    }
}
.application__other-choice {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(255, 255, 255, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
}

@font-face {
    font-family: MyriadPro;
    src: url('../assets/fonts/MyriadPro-Regular.otf');
}

@font-face {
    font-family: MyriadBold;
    src: url('../assets/fonts/MyriadPro-Bold.otf')
}
</style>
