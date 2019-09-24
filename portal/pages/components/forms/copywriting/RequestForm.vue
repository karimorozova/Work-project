<template lang="pug">
    .copywriting-form
        form.form
            .form__block
                .form__name
                    ProjectName
                .form__deadline
                    Deadline
            .form__block
                .form__language
                    Language
</template>

<script>
import ProjectName from "../ProjectName";
import Deadline from "../Deadline";
import Language from "./Language";

export default {
    data() {
        return {
            langs: [{lang: 'dfsdfs', symbol: 'sdfsdf'}]
        }
    },
    components: {
        ProjectName,
        Deadline,
        Language
    }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors.scss";

.form {
    &__block {
        display: flex;
        justify-content: space-between;
        margin-bottom: 40px;
        box-sizing: border-box;
        &:last-child {
            margin-bottom: 20px;
        }
    }
    &__name {
        width: 247px;
    }
    &__deadline {
        width: fit-content;
    }
    &__language {
        width: 100%;
    }
    &_centered {
        justify-content: center;
    }
}

</style>
