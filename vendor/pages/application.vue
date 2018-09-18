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
                @uploadCvFiles="uploadingCvFiles"
                @setOtherChoice="setOtherChoice"
            )
        .application__section.education
            Education
        .application__section.translation-experience
            TranslationExp
        .application__section.competence
            TechnicalCompetence(
                @setOtherChoice="setOtherChoice"
            )
        .application__section.domain-experience
            DomainExp(
                @setOtherChoice="setOtherChoice"
            )
        .application__section.other
            Other
        .application__agree-submit
            AgreeAndSubmit(
                @sumbitForm="sumbitForm"
            )
    Footer
    .popUp(v-if="otherChoiceVisibile")
        OtherChoice(
            :label="otherChoicelabel"
            @cancelChanges="cancelOtherChoice"
            @saveChanges="saveOtherChoice"
        )
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
            console.log(this.langPairs);
            this.person.languagePairs = this.langPairs
        },
        uploadingCvFiles({files}) {
            this.person.cvFiles = files;
        },
        setOtherChoice({refersTo}) {
            this.otherChoiceVisibile = true;
            let defaultText = "Please specify ";
            switch (refersTo) {
                case "position":
                    this.otherChoicelabel = defaultText + "position title";
                    break;
                case "cat":
                    this.otherChoicelabel = defaultText + "CAT tool";
                    break;
                case "dtp":
                    this.otherChoicelabel = defaultText + "DTP software";
                    break;
                case "software":
                    this.otherChoicelabel = defaultText + "software";
                    break;
                case "industries":
                    this.otherChoicelabel = defaultText + "industries";
                    break
            }
        },
        cancelOtherChoice() {
            this.otherChoiceVisibile = false;
        },
        saveOtherChoice({choice}) {
            this.otherChoiceVisibile = false;
        },
        sumbitForm() {
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

.popUp {
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
