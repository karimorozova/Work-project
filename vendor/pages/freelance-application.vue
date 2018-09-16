<template lang="pug">
.application-wrap
    form.application
        .application__header 
            span.title FREELANCE APPLICATION
            span.comment If you have any queries regarding the completion of this form, please contact vendor@pangea.global.
        .application__section.personal-info
            PersonalInfo
        .application__section.education
            Education
        .application__section.translation-experience
            TranslationExp
        .application__section.competence
            TechnicalCompetence
        .application__section.domain-experience
            DomainExp
        .application__section.other
            Other
        .application__agree-submit
            AgreeAndSubmit
    .popUp
        OtherChoice(
            :label="label"
        )
</template>

<script>
import PersonalInfo from "./freelanceApplication/PersonalInfo";
import Education from "./freelanceApplication/Education";
import TranslationExp from "./freelanceApplication/TranslationExp";
import TechnicalCompetence from "./freelanceApplication/TechnicalCompetence";
import DomainExp from "./freelanceApplication/DomainExp";
import Other from "./freelanceApplication/Other";
import AgreeAndSubmit from "./freelanceApplication/AgreeAndSubmit";
import OtherChoice from "./freelanceApplication/OtherChoice";

export default {
    data() {
        return {
            otherChoiceVisibile: false,
            label: "Please specify"
        }
    },
    methods: {

    },
    components: {
        PersonalInfo,
        Education,
        TranslationExp,
        TechnicalCompetence,
        DomainExp,
        Other,
        AgreeAndSubmit,
        OtherChoice
    }
}
</script>

<style lang="scss" scoped>
.application-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: MyriadPro;
    color: #67573E;
    position: relative;
}
.application {
    width: 510px;
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
