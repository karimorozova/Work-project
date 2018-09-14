<template lang="pug">
.domain
    .domain__main-title DOMAIN EXPERIENCE
    span.domain__comment Do you have experience in the following industries (not necessarily as a translator)? <br> Check all that apply.
    .domain__options
        SelectMulti(
            :selectedOptions="selectedDomains"
            :options="industries"
            @chooseOptions="chooseIndustries"
        )
</template>

<script>
import SelectMulti from "./dropdowns/SelectMulti";

export default {
    data() {
        return {
            selectedDomains: [],
            industries: [
                "Finance (Forex/Trading/Binary Options/Cryptocurrency)",
                "Poker",
                "iGaming (Casino, Slot games, Gambling, etc.)",
                "Sports Betting",
                "Video Games",
                "Other"
            ]
        }
    },
    methods: {
        chooseIndustries({option}) {
            const elementPosition = this.selectedDomains.indexOf(option);
            if(elementPosition != -1) {
                return this.selectedDomains.splice(elementPosition, 1)
            }
            this.selectedDomains.push(option);
        }
    },
    components: {
        SelectMulti
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
