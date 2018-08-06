<template lang="pug">
.finance-settings
  .adminNavbar__slider.slider
    span FINANCE
    .slider-inner
        .slider-col(@click="showRatesMono" :class="{activeBack: monoActive}") Rates Mono
        .slider-col(@click="showRatesDuo" :class="{activeBack: duoActive}") Rates Duo
  .mono-rates(v-if="monoActive") 
    .quotesComponent
      RatesMono 
  .duo-rates(v-if="duoActive")
    .quotesComponent
      RatesDuo
</template>

<script>
import RatesDuo from "../finance/RatesDuo";
import RatesMono from "../finance/RatesMono";

export default {
  props: {
    sliderBool: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      duoActive: true,
      monoActive: false,
      ratesmonoSettingsVisible: false,
      ratesmonoBgBool: false,
      ratesduoSettingsVisible: false,
      ratesduoBgBool: false,
      slidebarVisible: this.sliderBool,
      openQuotes: true,
    };
  },
  methods: {
    showRatesDuo() {
      this.duoActive = true;
      this.monoActive = false;
    },
    showRatesMono() {
      this.duoActive = false;
      this.monoActive = true;
    }
  },
  components: {
    RatesMono,
    RatesDuo
  },
  watch: {
    sliderBool(){
      this.slidebarVisible = this.sliderBool;
    }
  }
};
</script>

<style lang="scss" scoped>

.finance-settings {
  position: relative;
  display: flex;
  min-height: 94vh;
}

.duo-rates, .mono-rates {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px;
}

.quotesComponent {
  background-color: #fff;
  padding: 20px;
  box-shadow: 0 0 15px #67573e9d;
}

.adminNavbar {
  position: relative;
  display: flex;
  min-height: 94vh;
  &__slider {
    // transform: translate(-100%);
    background-color: #fff;
    width: 175px;
    box-shadow: 7px 1px 10px rgba(103, 87, 62, 0.4);
    display: flex;
    flex-direction: column;
    font-family: MyriadPro;
    color: #67573e;
    font-size: 22px;
    transition: all 1s;
    span {
      display: flex;
      justify-content: center;
      padding: 44px 0;
      font-weight: 700;
    }

    .slider-inner {
      display: flex;
      flex-direction: column;

      .slider-col {
        display: flex;
        justify-content: center;
        border-top: 1px solid #c4beb6;
        border-bottom: 1px solid #c4beb6;
        padding: 5px 30px;
        white-space: nowrap;
        cursor: pointer;
        &:nth-child(2) {
          border-bottom: 1px solid #c4beb6;
        }
      }
      .activeBack {
        background-color: #c4beb6;
      }
    }
  }
  .slider {
    background-color: #fff;
  }
}

.borderAngle {
  border-radius: 0;
  border: none;
  margin-bottom: 0;
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
