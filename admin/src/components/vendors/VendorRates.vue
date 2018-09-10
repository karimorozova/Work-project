<template lang="pug">
.quotesComponent
    .monoRates(:class="{straightAngle: monoDrop}")
        .monoRates__open 
            .select(@click="openMono")
                span Mono
                img(src="../../assets/images/Other/open.png" :class="{reverse: monoDrop}") 
            .rates-drop(v-if="monoDrop")
                MonoVendorRates(:vendor="vendor")
    .duoRates(:class="{straightAngle: duoDrop}")
        .duoRates__open
            .select(@click="openDuo")
                span Duo
                img(src="../../assets/images/Other/open.png" :class="{reverse: duoDrop}") 
            .rates-drop(v-if="duoDrop")
                DuoVendorRates(:vendor="vendor" 
                    @ratesUpdate="ratesUpdate"
                    @addSevLangs="addSevLangs")
</template>

<script>
import DuoVendorRates from "./DuoVendorRates";
import MonoVendorRates from "./MonoVendorRates";

export default {
    props: {
        vendor: {
            type: Object
        }
    },
    data() {
        return {
            monoDrop: false,
            duoDrop: false
        }
    },
    methods: {
        addSevLangs(data) {
            this.$emit('addSevLangs')
        },
        openMono() {
            this.monoDrop = !this.monoDrop;
        },
        openDuo() {
            this.duoDrop = !this.duoDrop;
        },
        ratesUpdate(data) {
            this.$emit("ratesUpdate")
        }
    },
    components: {
        DuoVendorRates,
        MonoVendorRates
    }
}

</script>

<style lang="scss" scoped>

.quotesComponent {
    width: 856px;
    display: flex;
    flex-direction: column;
}

.monoRates, .duoRates {
    width: 100%;
    max-height: 450px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 0 10px rgba(103, 87, 62, 0.7);
    border-radius: 10px;
    padding: 0 3px;
}

.monoRates {
    margin-bottom: 60px;
}

.straightAngle {
    border-radius: 0;
}

.select {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 7px;
    .reverse {
        transform: rotate(180deg); 
    }
    img {
        opacity: 0.5;
    }
}

.rates-drop {
    height: 400px;
    padding: 5px 2px;
    border-top: 1px solid rgba(103, 87, 62, 0.5);
}

</style>
