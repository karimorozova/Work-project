<template lang="pug">
.technical
    .technical__main-title TECHNICAL COMPETENCE
    span.technical__comment.asterisk Are you willing to translate online?
    .technical__options
        span.technical__label Internet access:
        SelectSingle(
            refersTo="internet"
            :selectedOption="selectedCompetence.internet"
            :options="competences.internet"
            @chooseOption="chooseCompetence"
        )
    span.technical__comment Do you have any CAT experience?
    .technical__options
        span.technical__label Computer-Assisted Translation experience:
        SelectSingle(
            refersTo="cat"
            :selectedOption="selectedCompetence.cat"
            :options="competences.cat"
            @chooseOption="chooseCompetence"
        )
    span.technical__comment Do you have experience with any of the below? Check all that apply.
    .technical__options
        span.technical__label Software experience
        SelectMulti(
            refersTo="software"
            :selectedOptions="selectedCompetence.software"
            :options="competences.software"
            @chooseOptions="chooseCompetence"
        )
</template>

<script>
import SelectSingle from "../../components/dropdowns/SelectSingle";
import SelectMulti from "../../components/dropdowns/SelectMulti";

export default {
    data() {
        return {
            selectedCompetence: {
                internet: "",
                cat: "",
                software: []
            },
            competences: {
                internet: ["Yes", "No", "Limited online availability"],
                cat: ["Yes", "No", "Very little"],
                software: ["HTML", "Microsoft Excel", "DTP software", "Other software"]
            }
        }
    },
    methods: {
        chooseCompetence({option, refersTo}) {
            if(refersTo != "software") {
                this.selectedCompetence[refersTo] = option;
            } else {
                const elementPosition = this.selectedCompetence.software.indexOf(option);
                if(elementPosition != -1) {
                    return this.selectedCompetence.software.splice(elementPosition, 1)
                }
                this.selectedCompetence.software.push(option)
            }
        }
    },
    components: {
        SelectSingle,
        SelectMulti
    }
}
</script>

<style lang="scss" scoped>

.technical {
    width: 100%;
    display: flex;
    flex-direction: column;
    &__main-title {
        font-size: 24px;
        position: relative;
        margin-bottom: 20px;
        &:before {
            content: "4";
            position: absolute;
            left: -20px;
            bottom: -2px;
            font-size: 28px;
        }
    }
    &__options {
        margin-top: 20px;
        margin-bottom: 80px;
        display: flex;
        flex-direction: column;
        position: relative;
        &:last-child {
            margin-bottom: 50px;
        }
    }
    &__comment, &__label {
        font-size: 12px;
    }
}

.asterisk {
    position: relative;
    &:after {
        content: "*";
        position: absolute;
        top: -2px;
        left: 34%;
        color: red;
        font-size: 12px;
    }
}

</style>
