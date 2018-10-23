<template lang="pug">
.vendor-rates
    .vendor-rates__block(:class="{'vendor-rates_straight-angle': isMonoRatesShow}")
        .vendor-rates__open 
            .vendor-rates__select(@click="monoRatesToggler")
                span.vendor-rates__label Mono
                img.vendor-rates__icon(src="../../assets/images/Other/open.png" :class="{'vendor-rates_reverse': isMonoRatesShow}") 
            .vendor-rates__drop(v-if="isMonoRatesShow")
                MonoVendorRates(:vendor="vendor")
    .vendor-rates__block(:class="{'vendor-rates_straight-angle': isDuoRatesShow}")
        .vendor-rates__open
            .vendor-rates__select(@click="duoRatesToggler")
                span.vendor-rates__label Duo
                img.vendor-rates__icon(src="../../assets/images/Other/open.png" :class="{'vendor-rates_reverse': isDuoRatesShow}") 
            .vendor-rates__drop(v-if="isDuoRatesShow")
                DuoVendorRates(:vendor="vendor" 
                    @ratesUpdate="ratesUpdate"
                    @addSevLangs="addSevLangs")
    .vendor-rates__block(:class="{'vendor-rates_straight-angle': isMatrixShow}")
            .vendor-rates____open
                .vendor-rates__select(@click="matrixToggler")
                    span.vendor-rates__label Matrix
                    img.vendor-rates__icon(src="../../assets/images/Other/open.png" :class="{'vendor-rates_reverse': isMatrixShow}") 
                .vendor-rates__drop(v-if="isMatrixShow")
                    FinanceMatrix(:entity="vendor")
</template>

<script>
import DuoVendorRates from "./DuoVendorRates";
import MonoVendorRates from "./MonoVendorRates";
import FinanceMatrix from "../FinanceMatrix";

export default {
    props: {
        vendor: {
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
        addSevLangs(data) {
            this.$emit('addSevLangs')
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
            this.$emit("ratesUpdate")
        }
    },
    components: {
        DuoVendorRates,
        MonoVendorRates,
        FinanceMatrix
    }
}

</script>

<style lang="scss" scoped>

.vendor-rates {
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
