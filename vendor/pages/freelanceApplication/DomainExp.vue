<template lang="pug">
.domain
    .domain__main-title DOMAIN EXPERIENCE
        span.domain__asterisk *
    span.domain__comment Do you have experience in the following industries (not necessarily as a translator)? <br> Check all that apply.
    .domain__options
        span.domain__label Industries:
        SelectMulti(
            :selectedOptions="selectedIndustries"
            :otherChoice="otherChoice"
            :options="industries"
            @chooseOptions="chooseIndustries"
        )
    OtherChoice(
        v-if="otherChoiceVisibile"
        :label="otherChoicelabel"
        @cancelChanges="cancelOtherChoice"
        @saveChanges="saveOtherChoice"
    )
</template>

<script>
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
            selectedIndustries: [],
            industries: [
                "Finance (Forex/Trading/Binary Options/Cryptocurrency)",
                "Poker",
                "iGaming (Casino, Slot games, Gambling, etc.)",
                "Sports Betting",
                "Video Games",
                "Other"
            ],
            otherChoice: "",
            otherChoicelabel: "",
        }
    },
    methods: {
        chooseIndustries({option}) {
            if(option === "Other") {
                if(this.selectedIndustries.indexOf(this.otherChoice) === -1) {
                    this.otherChoicelabel = "Please specify industries"
                    this.$emit("showOtherChoice", {variable: 'otherIndustryVisibile'})
                } else {
                    const pos = this.selectedIndustries.indexOf(this.otherChoice);
                    this.selectedIndustries.splice(pos, 1);
                    this.otherChoice = "";
                }
                return
            }
            if(option === "Other" && this.selectedIndustries.indexOf("Other") === -1) {
                this.otherChoicelabel = "Please specify industries"
                this.$emit("showOtherChoice", {variable: 'otherIndustryVisibile'})
            }
            const elementPosition = this.selectedIndustries.indexOf(option);
            if(elementPosition != -1) {
                return this.selectedIndustries.splice(elementPosition, 1)
            }
            this.selectedIndustries.push(option);
            this.$emit("setValue", {property: 'industries', value: this.selectedIndustries})
        },
        cancelOtherChoice() {
            this.$emit("closeOtherChoice", {variable: 'otherIndustryVisibile'})
        },
        saveOtherChoice({referTo, choice}) {
            this.otherChoice = "Other - " + choice;
            this.selectedIndustries.push(this.otherChoice);
            this.$emit("setValue", {property: 'industries', value: this.selectedIndustries})
            this.$emit("closeOtherChoice", {variable: 'otherIndustryVisibile'})
        }
    },
    components: {
        SelectMulti,
        OtherChoice
    }
}
</script>

<style lang="scss" scoped>

.domain {
    width: 100%;
    display: flex;
    flex-direction: column;
    &__main-title {
        font-size: 24px;
        position: relative;
        margin-bottom: 20px;
        &:before {
            content: "5";
            position: absolute;
            left: -20px;
            bottom: -2px;
            font-size: 28px;
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
        margin-bottom: 80px;
        display: flex;
        flex-direction: column;
        position: relative;
    }
    &__comment, &__label {
        font-size: 12px;
    }
}

</style>
