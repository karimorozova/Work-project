<template lang="pug">
.domain
    .domain__main-title DOMAIN EXPERIENCE
    span.domain__comment Do you have experience in the following industries (not necessarily as a translator)? <br> Check all that apply.
    .domain__options
        span.domain__label Industries:
        SelectMulti(
            :selectedOptions="selectedIndustries"
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
            otherChoiceVisibile: false,
            otherChoicelabel: "",
        }
    },
    methods: {
        chooseIndustries({option}) {
            if(option === "Other") {
                this.otherChoiceVisibile = true;
                this.otherChoicelabel = "Please specify industries"
                this.$emit("showOtherChoice")
            }
            const elementPosition = this.selectedIndustries.indexOf(option);
            if(elementPosition != -1) {
                return this.selectedIndustries.splice(elementPosition, 1)
            }
            this.selectedIndustries.push(option);
            this.$emit("setValue", {property: 'industries', value: this.selectedIndustries})
        },
        cancelOtherChoice() {
            this.otherChoiceVisibile = false;
            this.$emit("closeOtherChoice")
        },
        saveOtherChoice({referTo, choice}) {
            const position = this.selectedIndustries.indexOf("Other");
            this.selectedIndustries.splice(position, 1, choice);
            this.$emit("setValue", {property: 'industries', value: this.selectedIndustries})
            this.otherChoiceVisibile = false;
            this.$emit("closeOtherChoice")
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
        &:after {
            content: "*";
            position: absolute;
            top: -3px;
            right: 283px;
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
    &__comment, &__label {
        font-size: 12px;
    }
}

</style>
