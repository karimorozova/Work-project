<template lang="pug">
.domain
    .domain__main-title DOMAIN EXPERIENCE
        span.domain__asterisk *
    span.domain__comment Do you have experience in the following industries (not necessarily as a translator)? <br> Check all that apply.
    .domain__options
        span.domain__label Industries:
        SelectMulti(
            :selectedOptions="selectedIndustriesNames"
            :otherChoice="otherChoice"
            :options="industriesNames"
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
            industries: [],
            otherChoice: "",
            otherChoicelabel: "",
        }
    },
    methods: {
        chooseIndustries({option}) {
            const position = this.selectedIndustriesNames.indexOf(option);
            if(position === -1) {
                const industry = this.industries.find(item => item.name === option);
                this.selectedIndustries.push(industry);
            } else {
                this.selectedIndustries.splice(position, 1);
            }
            this.$emit("setValue", {property: 'industries', value: this.selectedIndustries});
        },
        cancelOtherChoice() {
            this.$emit("closeOtherChoice", {variable: 'otherIndustryVisibile'})
        },
        saveOtherChoice({referTo, choice}) {
            this.otherChoice = "Other - " + choice;
            this.selectedIndustries.push(this.otherChoice);
            this.$emit("setValue", {property: 'industries', value: this.selectedIndustries})
            this.$emit("closeOtherChoice", {variable: 'otherIndustryVisibile'})
        },
        async getIndustries() {
            try {
                const result = await this.$axios.$get("/api/industries");
                this.industries = result;
            } catch(err) {
                console.log(err);
            }
        }
    },
    components: {
        SelectMulti,
        OtherChoice
    },
    computed: {
        industriesNames() {
            return this.industries.map(item => item.name);
        },
        selectedIndustriesNames() {
            return this.selectedIndustries.map(item => item.name);
        }
    },
    mounted() {
        this.getIndustries();
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
