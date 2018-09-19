<template lang="pug">
.technical
    .technical__main-title TECHNICAL COMPETENCE
    span.technical__comment Are you willing to translate online?
        span.technical__asterisk *
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
    OtherChoice(
        v-if="otherChoiceVisibile"
        :label="otherChoicelabel"
        :refersTo="otherChoiceRef"
        @cancelChanges="cancelOtherChoice"
        @saveChanges="saveOtherChoice"
    )
</template>

<script>
import SelectSingle from "../../components/dropdowns/SelectSingle";
import SelectMulti from "../../components/dropdowns/SelectMulti";
import OtherChoice from "./OtherChoice";

export default {
    props: {
        otherChoiceVisibile: {
            type: Boolean,
            default: false
        }
    },
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
            },
            otherChoicelabel: "",
            otherChoiceRef: ""
        }
    },
    methods: {
        chooseCompetence({option, refersTo}) {
            if(refersTo != "software") {
                if(option === "Yes" && refersTo === "cat") {
                    this.otherChoiceRef = "cat"
                    this.otherChoicelabel = "Please specify CAT tool"
                    this.$emit("showOtherChoice", {variable: 'otherTechVisibile'})
                }
                this.selectedCompetence[refersTo] = option;
            } else {
                if(option === "DTP software" && this.selectedCompetence.software.indexOf("DTP software") === -1) {
                    this.otherChoiceRef = "dtp"
                    this.otherChoicelabel = "Please specify DTP software"
                    this.$emit("showOtherChoice", {variable: 'otherTechVisibile'})
                }
                if(option === "Other software" && this.selectedCompetence.software.indexOf("Other software") === -1) {
                    this.otherChoiceRef = "software"
                    this.otherChoicelabel = "Please specify software"
                    this.$emit("showOtherChoice", {variable: 'otherTechVisibile'})
                }
                const elementPosition = this.selectedCompetence.software.indexOf(option);
                if(elementPosition != -1) {
                    this.selectedCompetence.software.splice(elementPosition, 1)
                } else {
                    this.selectedCompetence.software.push(option);
                }
            }
            this.$emit("setValue", {property: 'technicalComp', value: this.selectedCompetence})
        },
        cancelOtherChoice() {
            this.$emit("closeOtherChoice", {variable: 'otherTechVisibile'})
        },
        saveOtherChoice({refersTo, choice}) {
            if(refersTo === "cat") {
                this.selectedCompetence.cat = choice;
            } else {
                let position = (refersTo === "dtp") ? this.selectedCompetence.software.indexOf("DTP software"): this.selectedCompetence.software.indexOf("Other software") 
                this.selectedCompetence.software.splice(position, 1, choice);
            }
            this.$emit("setValue", {property: 'technicalComp', value: this.selectedCompetence});
            this.$emit("closeOtherChoice", {variable: 'otherTechVisibile'});
        },
    },
    components: {
        SelectSingle,
        SelectMulti,
        OtherChoice
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
    &__asterisk {
        position: absolute;
        padding-left: 4px;
        top: -2px;
        font-size: 12px;
        color: red;
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
    &__comment {
        position: relative;
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
