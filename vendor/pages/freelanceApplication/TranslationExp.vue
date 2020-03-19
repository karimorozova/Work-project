<template lang="pug">
.translation-exp
    .translation-exp__main-title TRANSLATION EXPERIENCE
        span.translation-exp__asterisk *
    span.translation-exp__comment Do you have any translation experience? Please select one of the following:
    .translation-exp__options
        span.translation-exp__label Years of experience:
        SelectSingle(
            :selectedOption="selectedExperience"
            :options="experiences"
            @chooseOption="chooseExperience"
        )
</template>

<script>
import SelectSingle from "../../components/dropdowns/SelectSingle";

export default {
    data() {
        return {
            selectedExperience: "",
            experiences: ["No professional experience", "2-4 years", "5+ years"]
        }
    },
    methods: {
        chooseExperience({option}) {
            this.selectedExperience = option;
            this.$emit("setValue", {property: 'experienceYears', value: option})
        }
    },
    components: {
        SelectSingle
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
            @media (max-width: 320px) {
                font-size: 24px;
            }
        }
        @media (max-width: 320px) {
            font-size: 20px;
        }
    }
    &__asterisk {
        position: absolute;
        padding-left: 6px;
        top: -2px;
        font-size: 16px;
        color: red;
    }
    &__options {
        margin-top: 20px;
        display: flex;
        flex-direction: column;
        position: relative;
    }
    &__comment, &__label {
        font-size: 12px;
    }
}

</style>
