<template lang="pug">
    .client-rates
        .client-rates__block(:class="{'client-rates_straight-angle': isMonoRates}")
            .client-rates__open 
                .client-rates__select(@click="(e) => toggleRates(e, 'isMonoRates')")
                    span.client-rates__label Package
                    img.client-rates__icon(src="../../assets/images/Other/open.png" :class="{'client-rates_reverse': isMonoRates}") 
                .client-rates__drop(v-if="isMonoRates")
                    MonoRates(:entity="client" :isClient="true")
        .client-rates__block(:class="{'client-rates_straight-angle': isWordsRates}")
            .client-rates__open
                .client-rates__select(@click="(e) => toggleRates(e, 'isWordsRates')")
                    span.client-rates__label Wordcount
                    img.client-rates__icon(src="../../assets/images/Other/open.png" :class="{'client-rates_reverse': isWordsRates}") 
                .client-rates__drop(v-if="isWordsRates")
                    DuoRatesWords(:entity="client" :isClient="true")
        .client-rates__block(:class="{'client-rates_straight-angle': isHoursRates}")
            .client-rates__open
                .client-rates__select(@click="(e) => toggleRates(e, 'isHoursRates')")
                    span.client-rates__label Hours
                    img.client-rates__icon(src="../../assets/images/Other/open.png" :class="{'client-rates_reverse': isHoursRates}") 
                .client-rates__drop(v-if="isHoursRates")
                    DuoRatesHours(:entity="client" :isClient="true")
        .client-rates__block(:class="{'client-rates_straight-angle': isMatrixShow}")
            .client-rates__open
                .client-rates__select(@click="matrixToggler")
                    span.client-rates__label Discount Chart
                    img.client-rates__icon(src="../../assets/images/Other/open.png" :class="{'client-rates_reverse': isMatrixShow}") 
                .client-rates__drop(v-if="isMatrixShow")
                    FinanceMatrix(:entity="client" @setMatrixData="setMatrixData")
</template>

<script>
import MonoRates from "../finance/clientsAndVendorsRates/MonoRates";
import DuoRatesWords from "../finance/clientsAndVendorsRates/DuoRatesWords";
import DuoRatesHours from "../finance/clientsAndVendorsRates/DuoRatesHours";
import FinanceMatrix from "../FinanceMatrix";
import { mapActions } from "vuex";

export default {
    props: {
        client: {
            type: Object
        }
    },
    data() {
        return {
            isMonoRates: false,
            isWordsRates: false,
            isHoursRates: false,
            isMatrixShow: false
        }
    },
    methods: {
        ...mapActions([
            "storePriceRates",
            "sortRates",
            "getSteps"
        ]), 
        toggleRates(e, prop) {
            this[prop] = !this[prop];
        },
        matrixToggler() {
            this.isMatrixShow = !this.isMatrixShow;
        },
        setMatrixData({value, key}) {
            this.$emit("setMatrixData", {value, key});
        }
    },
    components: {
        DuoRatesWords,
        DuoRatesHours,
        MonoRates,
        FinanceMatrix
    },
    created() {
        this.getSteps();
    },
    mounted() {
        this.storePriceRates({prop: 'monoRates', value: this.client.monoRates})
        this.storePriceRates({prop: 'wordsRates', value: this.client.wordsRates})
        this.storePriceRates({prop: 'hoursRates', value: this.client.hoursRates})
        this.sortRates('monoRates')
        this.sortRates('wordsRates')
        this.sortRates('hoursRates')
    }
}
</script>


<style lang="scss" scoped>

.client-rates {
    display: flex;
    flex-direction: column;
    position: relative;
    &__block {
        width: 100%;
        max-height: 500px;
        display: flex;
        flex-direction: column;
        box-shadow: 0 0 10px rgba(103, 87, 62, 0.7);
        border-radius: 4px;
        padding: 0 2px;
        margin-bottom: 60px;
        box-sizing: border-box;
        &:last-child {
            margin-bottom: 0;
        }
    }
    &_straight-angle {
        border-radius: 0;
    }
    &__select {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 7px;
        cursor: pointer;
    }
    &__icon {
        opacity: 0.5;
    }
    &_reverse {
        transform: rotate(180deg); 
    }
    &__drop {
        padding: 5px 2px 15px 2px;
        border-top: 1px solid rgba(103, 87, 62, 0.5);
        max-height: 450px;
    }
}

</style>
