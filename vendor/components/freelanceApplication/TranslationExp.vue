<template lang="pug">
.translation-exp
    .translation-exp__main-title TRANSLATION EXPERIENCE
    span.comment Do you have any translation experience? Please select one of the following:
    .translation-exp__options
        SelectTransExp(
            :selectedExperience="selectedExperience"
            @chooseExperience="chooseExperience"
        )
</template>

<script>
import SelectTransExp from "./translationExp/SelectTransExp";

export default {
    data() {
        return {
            selectedExperience: ""
        }
    },
    methods: {
        chooseExperience({exp}) {
            this.selectedExperience = exp;
        }
    },
    components: {
        SelectTransExp
    }
}
</script>

<style lang="scss" scoped>

.translation-exp {
    width: 100%;
    display: flex;
    flex-direction: column;
    &__main-title {
        font-size: 24px;
        position: relative;
        margin-bottom: 20px;
        &:before {
            content: "3";
            position: absolute;
            left: -20px;
            bottom: -2px;
            font-size: 28px;
        }
        &:after {
            content: "*";
            position: absolute;
            top: -3px;
            right: 230px;
            color: red;
            font-size: 18px;
        }
    }
    &__options {
        margin-top: 20px;
        display: flex;
        flex-direction: column;
        position: relative;
    }
    .comment, &__label {
        font-size: 12px;
    }
}

</style>
