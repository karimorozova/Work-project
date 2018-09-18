<template lang="pug">
.application-wrap
    Header(
        headerText="Application Form"
    )
    form.application
        .application__header 
            span.title FREELANCE APPLICATION
            span.comment If you have any queries regarding the completion of this form, please contact vendor@pangea.global.
        .application__section.personal-info
            PersonalInfo(
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
                @setValue="setPersonInfo"
                @showOtherChoice="showOtherChoice"
                @closeOtherChoice="closeOtherChoice"
            )
        .application__section.domain-experience
            DomainExp(
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
                @sumbitForm="sumbitForm"
            )
    Footer
    .other-choice(v-if="otherChoiceVisibile")
</template>

<script>
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
import { mapActions } from "vuex";

export default {
    data() {
        return {
            otherChoiceVisibile: false,
            otherChoicelabel: "",
            otherChoiceRef: "",
            person: {},
            langPairs: []
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
        showOtherChoice() {
            this.otherChoiceVisibile = true;
        },
        closeOtherChoice() {
            this.otherChoiceVisibile = false;
        },
        sumbitForm({confirmed}) {
            this.person.confirmed = confirmed;
            this.saveForm(this.person);
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
        Footer
    }
}
</script>

<style lang="scss" scoped>

.application-wrap {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-family: MyriadPro;
    color: #67573E;
    position: relative;
}
.application {
    margin-top: 40px;
    margin-bottom: 40px;
    width: 27%;
    padding: 30px 50px;
    border: 1px solid #67573E;
    display: flex;
    flex-direction: column;
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
}

.other-choice {
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

.translation-experience {
    margin-bottom: 50px;
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
