<template lang="pug">
.rates
    .rates__block(:class="{'rates_straight-angle': isMonoRatesShow}")
        .rates__open 
            .rates__select(@click="monoRatesToggler")
                span.rates__label Mono
                img.rates__icon(src="../../../assets/images/Other/open.png" :class="{'rates_reverse': isMonoRatesShow}") 
            .rates__drop(v-if="isMonoRatesShow")
                MonoRates(:vendor="vendor" :services="monoServices")
    .rates__block(:class="{'rates_straight-angle': isDuoRatesShow}")
        .rates__open
            .rates__select(@click="duoRatesToggler")
                span.rates__label Duo
                img.rates__icon(src="../../../assets/images/Other/open.png" :class="{'rates_reverse': isDuoRatesShow}") 
            .rates__drop(v-if="isDuoRatesShow")
                DuoRates(:vendor="vendor" :services="duoServices")
    .rates__block(:class="{'rates_straight-angle': isMatrixShow}")
            .rates____open
                .rates__select(@click="matrixToggler")
                    span.rates__label Matrix
                    img.rates__icon(src="../../../assets/images/Other/open.png" :class="{'rates_reverse': isMatrixShow}") 
                .rates__drop(v-if="isMatrixShow")
                    FinanceMatrix(:entity="vendor" @setMatrixData="setMatrixData")
</template>

<script>
import DuoRates from "./rates/DuoRates";
import MonoRates from "./rates/MonoRates";
import FinanceMatrix from "./rates/FinanceMatrix";
import { mapActions, mapGetters } from "vuex";

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
            isMatrixShow: false,
            services: [],
            duoServicesFilter: ["Translation", "Proofing", "QA and Testing"]
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
        async setMatrixData({value, key}) {
            try {
                await this.setVendorsMatrixData({value, key});
                this.alertToggle({message: "Matrix data updated", isShow: true, type: "success"})
            } catch(err) {
                this.alertToggle({message: "Error on setting matrix data", isShow: true, type: "error"})
            }
        },
        async getServices() {
            try {
                const result = await this.$axios.get("/api/services");
                this.services = result.data;
            } catch(err) {

            }
        },
        ...mapActions({
            alertToggle: "alertToggle"
        })
    },
    computed: {
        monoServices() {
            let result = [];
            if(this.services.length) {
                result = this.services.filter(item => item.languageForm === "Mono")
                .map(item => item.title);
            }
            return result;
        },
        duoServices() {
            let result = [];
            if(this.services.length) {
                result = this.services.filter(item => item.languageForm === "Duo" && this.duoServicesFilter.indexOf(item.title) !== -1)
                .map(item => item.title);
            }
            return result;
        }
    },
    components: {
        DuoRates,
        MonoRates,
        FinanceMatrix
    },
    mounted() {
        this.getServices();
    }
}

</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.rates {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    width: 900px;
    position: relative;
    margin: 20px 0  0 10px;
    padding: 10px;
    box-shadow: 0 0 15px $brown-shadow;
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
