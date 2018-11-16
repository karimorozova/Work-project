<template lang="pug">
    .client-rates
        .client-rates__block(:class="{'client-rates_straight-angle': isMonoRatesShow}")
            .client-rates__open 
                .client-rates__select(@click="monoRatesToggler")
                    span.client-rates__label Mono
                    img.client-rates__icon(src="../../assets/images/Other/open.png" :class="{'client-rates_reverse': isMonoRatesShow}") 
                .client-rates__drop(v-if="isMonoRatesShow")
                    MonoClientRates(:client="client")
        .client-rates__block(:class="{'client-rates_straight-angle': isDuoRatesShow}")
            .client-rates__open
                .client-rates__select(@click="duoRatesToggler")
                    span.client-rates__label Duo
                    img.client-rates__icon(src="../../assets/images/Other/open.png" :class="{'client-rates_reverse': isDuoRatesShow}") 
                .client-rates__drop(v-if="isDuoRatesShow")
                    DuoClientRates(
                        :entity="client" 
                        @addSevLangs="addSevLangs")
        .client-rates__block(:class="{'client-rates_straight-angle': isMatrixShow}")
            .client-rates__open
                .client-rates__select(@click="matrixToggler")
                    span.client-rates__label Matrix
                    img.client-rates__icon(src="../../assets/images/Other/open.png" :class="{'client-rates_reverse': isMatrixShow}") 
                .client-rates__drop(v-if="isMatrixShow")
                    FinanceMatrix(:entity="client" @setMatrixData="setMatrixData")
</template>

<script>
import DuoClientRates from "./DuoClientRates";
import MonoClientRates from "./MonoClientRates";
import FinanceMatrix from "../FinanceMatrix";

export default {
    props: {
        client: {
            type: Object
        }
    },
    data() {
        return {
            isMonoRatesShow: false,
            isDuoRatesShow: false,
            isMatrixShow: false
        }
    },
    methods: {
        addSevLangs({serviceTitle}) {
            this.$emit('addSevLangs', {serviceTitle})
        },  
        monoRatesToggler() {
            this.isMonoRatesShow = !this.isMonoRatesShow;
        },
        duoRatesToggler() {
            this.isDuoRatesShow = !this.isDuoRatesShow;
        },
        matrixToggler() {
            this.isMatrixShow = !this.isMatrixShow;
        },
        ratesUpdate(data) {
            this.$emit('ratesUpdate', data);
        },
        setMatrixData({value, key}) {
            this.$emit("setMatrixData", {value, key});
        }
    },
    components: {
        DuoClientRates,
        MonoClientRates,
        FinanceMatrix
    }
}
</script>


<style lang="scss" scoped>

.client-rates {
    width: 856px;
    display: flex;
    flex-direction: column;
    &__block {
        width: 100%;
        max-height: 450px;
        display: flex;
        flex-direction: column;
        box-shadow: 0 0 10px rgba(103, 87, 62, 0.7);
        border-radius: 10px;
        padding: 0 3px;
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
