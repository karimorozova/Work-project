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
        .application__section.other
</template>

<script>
import PersonalInfo from "../components/freelanceApplication/PersonalInfo";
import Education from "../components/freelanceApplication/Education";
import TranslationExp from "../components/freelanceApplication/TranslationExp";
import TechnicalCompetence from "../components/freelanceApplication/TechnicalCompetence";

export default {
    data() {
        return {

        }
    },
    methods: {

    },
    components: {
        PersonalInfo,
        Education,
        TranslationExp,
        TechnicalCompetence
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
