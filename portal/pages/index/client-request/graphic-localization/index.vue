<template lang="pug">
    .localization
        FormWrapper
            form.form
                .form__block
                    .form__name
                        ProjectName
                    .form__deadline
                        Deadline
                .form__block
                    Languages
                .form__block
                    ProjectDetails

                    
                    


</template>

<script>
import Languages from "../../../components/forms/translation/Languages";
import ProjectDetails from "../../../components/forms/translation/ProjectDetails";
import FormWrapper from "../../../components/forms/FormWrapper";
import ProjectName from "../../../components/forms/ProjectName";
import Deadline from "../../../components/forms/Deadline";

export default {
    components: {
        FormWrapper,
        ProjectName,
        Deadline,
        Languages,
        ProjectDetails
    }    
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors.scss";

.localization {
    width: 100%;
    display: flex;
    justify-content: center;
}

.form {
    &__block {
        display: flex;
        justify-content: space-between;
        margin-bottom: 40px; 
    }
    &__name {
        width: 48%;
    }
    &__deadline {
        width: fit-content;
    }
}

</style>
