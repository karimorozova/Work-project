<template lang="pug">
.technical
    .technical__main-title TECHNICAl COMPETENCE
    span.comment Are you willing to translate online?
    .technical__options
        SelectSingleComp(
            label="Internet access"
            refersTo="internet"
            :selectedCompetence="selectedCompetence.internet"
            :competences="competences.internet"
            @chooseCompetence="chooseCompetence"
        )
    span.comment Do you have any CAT experience?
    .technical__options
        SelectSingleComp(
            label="Computer-Assisted Translation experience"
            refersTo="cat"
            :selectedCompetence="selectedCompetence.cat"
            :competences="competences.cat"
            @chooseCompetence="chooseCompetence"
        )
    span.comment Do you have experience with any of the below? Check all that apply.
    .technical__options
        SelectMultiComp(
            label="Software experience"
            refersTo="software"
            :selectedCompetence="selectedCompetence.software"
            :competences="competences.software"
            @chooseCompetence="chooseCompetence"
        )
</template>

<script>
import SelectSingleComp from "./technicalComp/SelectSingleComp";
import SelectMultiComp from "./technicalComp/SelectMultiComp";

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
        chooseCompetence({comp, refersTo}) {
            if(refersTo != "software") {
                this.selectedCompetence[refersTo] = comp;
            } else {
                const elementPosition = this.selectedCompetence.software.indexOf(comp);
                if(elementPosition != -1) {
                    return this.selectedCompetence.software.splice(elementPosition, 1)
                }
                this.selectedCompetence.software.push(comp)
            }
        }
    },
    components: {
        SelectSingleComp,
        SelectMultiComp
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
        margin-bottom: 80px;
        display: flex;
        flex-direction: column;
        position: relative;
    }
    .comment, &__label {
        font-size: 12px;
    }
}

</style>
