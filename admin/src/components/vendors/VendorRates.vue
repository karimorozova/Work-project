<template lang="pug">
.vendor-rates
    .vendor-rates__block(:class="{'vendor-rates_straight-angle': isMonoRates}")
        .vendor-rates__open 
            .vendor-rates__select(@click="(e) => toggleRates(e, 'isMonoRates')")
                span.vendor-rates__label Package
                img.vendor-rates__icon(src="../../assets/images/Other/open.png" :class="{'vendor-rates_reverse': isMonoRates}") 
            .vendor-rates__drop(v-if="isMonoRates")
                MonoRates(:entity="vendor" :isClient="false")
    .vendor-rates__block(:class="{'vendor-rates_straight-angle': isWordsRates}")
        .vendor-rates__open
            .vendor-rates__select(@click="(e) => toggleRates(e, 'isWordsRates')")
                span.vendor-rates__label Wordcount
                img.vendor-rates__icon(src="../../assets/images/Other/open.png" :class="{'vendor-rates_reverse': isWordsRates}") 
            .vendor-rates__drop(v-if="isWordsRates")
                DuoRatesWords(:entity="vendor" :isClient="false")
    .vendor-rates__block(:class="{'vendor-rates_straight-angle': isHoursRates}")
        .vendor-rates__open
            .vendor-rates__select(@click="(e) => toggleRates(e, 'isHoursRates')")
                span.vendor-rates__label Hours
                img.vendor-rates__icon(src="../../assets/images/Other/open.png" :class="{'vendor-rates_reverse': isHoursRates}") 
            .vendor-rates__drop(v-if="isHoursRates")
                DuoRatesHours(:entity="vendor" :isClient="false")
    .vendor-rates__block(:class="{'vendor-rates_straight-angle': isMatrixShow}")
            .vendor-rates____open
                .vendor-rates__select(@click="matrixToggler")
                    span.vendor-rates__label Discount Chart
                    img.vendor-rates__icon(src="../../assets/images/Other/open.png" :class="{'vendor-rates_reverse': isMatrixShow}") 
                .vendor-rates__drop(v-if="isMatrixShow")
                    FinanceMatrix(:entity="vendor" @setMatrixData="setMatrixData")
</template>

<script>
import MonoRates from "../finance/clientsAndVendorsRates/MonoRates";
import DuoRatesWords from "../finance/clientsAndVendorsRates/DuoRatesWords";
import DuoRatesHours from "../finance/clientsAndVendorsRates/DuoRatesHours";
import FinanceMatrix from "../FinanceMatrix";
import { mapActions } from "vuex";

export default {
    props: {
        vendor: {
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
            "getSteps",
            "alertToggle",
            "setVendorsMatrixData",
        ]), 
        toggleRates(e, prop) {
            this[prop] = !this[prop];
        },
        matrixToggler() {
            this.isMatrixShow = !this.isMatrixShow;
        },
        async setMatrixData({value, key}) {
            try {
                await this.setVendorsMatrixData({value, key});
                this.alertToggle({message: "Matrix data updated", isShow: true, type: "success"})
            } catch(err) {
                this.alertToggle({message: "Error on setting matrix data", isShow: true, type: "error"})
            }
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
        this.storePriceRates({prop: 'monoRates', value: this.vendor.monoRates})
        this.storePriceRates({prop: 'wordsRates', value: this.vendor.wordsRates})
        this.storePriceRates({prop: 'hoursRates', value: this.vendor.hoursRates})
        this.sortRates('monoRates')
        this.sortRates('wordsRates')
        this.sortRates('hoursRates')
    }
}

</script>

<style lang="scss" scoped>

.vendor-rates {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    &__block {
        box-sizing: border-box;
        width: 100%;
        max-height: 500px;
        display: flex;
        flex-direction: column;
        box-shadow: 0 0 10px rgba(103, 87, 62, 0.7);
        border-radius: 10px;
        padding: 0 2px;
        margin-bottom: 60px;
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
    }
}

</style>
