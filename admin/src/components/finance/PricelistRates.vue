<template lang="pug">
.finance-rates
    .finance-rates__price-info 
        .finance-rates__title {{ currentPrice.name }}
        .finance-rates__return
            Button(value="Back" @clicked="goBack")
    .finance-rates__rates
        .finance-rates__drop-menus
            .finance-rates__block(:class="{'finance-rates_straight-angle': isMonoDrop}")
                .finance-rates__open-rates 
                    .finance-rates__select(@click="(e) => toggleRates(e, 'isMonoDrop')")
                        span Packages
                        img.finance-rates__image(src="../../assets/images/Other/open.png" :class="{'finance-rates_reverse': isMonoDrop}") 
                    .finance-rates__rates-drop(v-if="isMonoDrop")
                        MonoRates
            .finance-rates__block(:class="{'finance-rates_straight-angle': isWordcountDrop}")
                .finance-rates__open-rates
                    .finance-rates__select(@click="(e) => toggleRates(e, 'isWordcountDrop')")
                        span Wordcount
                        img.finance-rates__image(src="../../assets/images/Other/open.png" :class="{'finance-rates_reverse': isWordcountDrop}") 
                    .finance-rates__rates-drop(v-if="isWordcountDrop")
                        DuoRatesWords
            .finance-rates__block(:class="{'finance-rates_straight-angle': isHoursDrop}")
                .finance-rates__open-rates
                    .finance-rates__select(@click="(e) => toggleRates(e, 'isHoursDrop')")
                        span Hours
                        img.finance-rates__image(src="../../assets/images/Other/open.png" :class="{'finance-rates_reverse': isHoursDrop}") 
                    .finance-rates__rates-drop(v-if="isHoursDrop")
                        DuoRatesHours
</template>

<script>
import DuoRatesWords from "./DuoRatesWords";
import DuoRatesHours from "./DuoRatesHours";
import MonoRates from "./MonoRates";
import Button from "../Button";
import { mapGetters, mapActions } from "vuex";

export default {
    props: {
    
    },
    data() {
        return {
            isMonoDrop: false,
            isWordcountDrop: false,
            isHoursDrop: false
        };
    },
    methods: {
        toggleRates(e, prop) {
            this[prop] = !this[prop];
        },
        goBack() {
            this.$router.go(-1);
        },
        ...mapActions({
            getSteps: "getSteps"
        })
    },
    computed: {
        ...mapGetters({
            currentPrice: "getCurrentPrice"
        }) 
    },
    components: {
        MonoRates,
        DuoRatesWords,
        DuoRatesHours,
        Button
    },
    created() {
        this.getSteps();
    }
};
</script>

<style lang="scss" scoped>

.finance-rates {
    margin: 20px;
    margin-left: 0;
    &__price-info {
        display: flex;
        justify-content: space-between;
        width: 1006px;
    }
    &__title {
        font-size: 24px;
    }
    &__rates {
        margin: 20px 0;
        padding: 20px 10px;
        box-shadow: 0 0 15px #67573e9d;
        width: 1006px;
        box-sizing: border-box;
        position: relative;
    }
    &__drop-menus {
        width: 980px;
        display: flex;
        flex-direction: column;
    }
    &__block {
        width: 100%;
        max-height: 500px;
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
    &__image {
        opacity: 0.5;
    }
    &_reverse {
        transform: rotate(180deg); 
    }
    &__rates-drop {
        max-height: 450px;
        padding: 5px 2px;
        border-top: 1px solid rgba(103, 87, 62, 0.5);
    }
}

@font-face {
  font-family: MyriadPro;
  src: url("../../assets/fonts/MyriadPro-Regular.otf");
}
@font-face {
  font-family: MyriadBold;
  src: url("../../assets/fonts/MyriadPro-Bold.otf");
}

</style>
