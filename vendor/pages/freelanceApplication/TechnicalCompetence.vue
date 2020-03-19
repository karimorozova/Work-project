<template lang="pug">
.technical
    .technical__main-title TECHNICAL COMPETENCE
    span.technical__comment Are you willing to translate online?
        span.technical__asterisk *
    .technical__options
        span.technical__label Internet access:
        SelectSingle(
            :selectedOption="selectedCompetence.internet"
            :options="competences.internet"
            @chooseOption="(e) => chooseCompetence(e, 'internet')"
        )
    span.technical__comment Do you have any CAT experience?
    .technical__options
        span.technical__label Computer-Assisted Translation experience:
        SelectSingle(
            :selectedOption="selectedCompetence.cat"
            :options="competences.cat"
            @chooseOption="(e) => chooseCompetence(e, 'cat')"
        )
    span.technical__comment Do you have experience with any of the below? Check all that apply.
    .technical__options
        span.technical__label Software experience
        SelectMulti(
            :selectedOptions="selectedCompetence.softwares"
            :otherSoftwareChoice="otherSoftwareChoice"
            :otherDtpChoice="otherDtpChoice"
            :options="competences.softwares"
            @chooseOptions="(e) => chooseCompetence(e, 'softwares')"
        )
    OtherChoice(
        v-if="otherChoiceVisibile"
        :label="otherChoicelabel"
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
                softwares: []
            },
            competences: {
                internet: ["Yes", "No", "Limited online availability"],
                cat: ["Yes", "No", "Very little"],
                softwares: ["HTML", "Microsoft Excel", "DTP software", "Other software"]
            },
            otherDtpChoice: "",
            otherSoftwareChoice: "",
            otherChoicelabel: "",
            otherChoiceRef: ""
        }
    },
    methods: {
        chooseCompetence({option}, prop) {
            if(prop !== "softwares") {
                if(option === "Yes" && prop === "cat") {
                    this.otherChoiceRef = "cat"
                    this.otherChoicelabel = "Please specify CAT tool"
                    this.$emit("showOtherChoice", {variable: 'otherTechVisibile'})
                    return
                }
                this.selectedCompetence[prop] = option;
            } else {
                this.otherChoiceRef = "softwares"
                if(option === "DTP software") {
                    this.specifySoftware(option, "dtp", 'otherDtpChoice');
                    return
                }
                if(option === "Other software") {
                    this.specifySoftware(option.split(' ')[1], "softwares", 'otherSoftwareChoice');
                    return
                }
                const elementPosition = this.selectedCompetence.softwares.indexOf(option);
                if(elementPosition != -1) {
                    this.selectedCompetence.softwares.splice(elementPosition, 1)
                } else {
                    this.selectedCompetence.softwares.push(option);
                }
            }
            this.$emit("setValue", {property: 'technicalComp', value: this.selectedCompetence})
        },
        specifySoftware(opt, ref, choice) {
            const position = this.selectedCompetence.softwares.indexOf(this[choice]);
            if(position === -1) {
                this.otherChoiceRef = ref;
                this.otherChoicelabel = "Please specify " + opt;
                this.$emit("showOtherChoice", {variable: 'otherTechVisibile'});
            } else {
                const pos = this.selectedCompetence.softwares.indexOf(this[choice]);
                this.selectedCompetence.softwares.splice(pos, 1);
                this[choice] = "";
            }
        },
        cancelOtherChoice() {
            this.$emit("closeOtherChoice", {variable: 'otherTechVisibile'});
        },
        saveOtherChoice({choice}) {
            if(this.otherChoiceRef === "cat") {
                this.selectedCompetence.cat = "Yes - " + choice;
            } else {
                let otherChoice = "";
                if(this.otherChoiceRef === "dtp") {
                    this.otherDtpChoice = "DTP software - " + choice;
                    otherChoice = this.otherDtpChoice;
                } else {
                    this.otherSoftwareChoice = "Other software - " + choice;
                    otherChoice = this.otherSoftwareChoice;
                }
                this.selectedCompetence.softwares.push(otherChoice);
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
