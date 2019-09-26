<template lang="pug">
    .copywriting-form
        form.form
            .form__block
                .form__item.name
                    ProjectName
                .form__item.deadline
                    Deadline
            .form__block
                .form__item
                    Language
            .form__block
                .form__item
                    Package
            .form__block
                .form__item
                    Type
            .form__block
                .form__item
                    GeneralBrief
            .form__block
                .form__item
                    Structure
            .form__block
                .form__item
                    Style
            .form__block
                .form__item
                    ToneOfVoice
</template>

<script>
import ProjectName from "../ProjectName";
import Deadline from "../Deadline";
import Language from "./Language";
import Package from "./Package";
import Type from "./Type";
import GeneralBrief from "./GeneralBrief";
import Structure from "./Structure";
import Style from "./Style";
import ToneOfVoice from "./ToneOfVoice";

export default {
    data() {
        return {
            langs: [{lang: 'dfsdfs', symbol: 'sdfsdf'}]
        }
    },
    components: {
        ProjectName,
        Deadline,
        Language,
        Package,
        Type,
        GeneralBrief,
        Structure,
        Style,
        ToneOfVoice
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
    &__item {
        width: 100%;
        box-sizing: border-box;
    }
    .name {
        width: 247px;
    }
    .deadline {
        width: 42%;
    }
    &_centered {
        justify-content: center;
    }
}

</style>
