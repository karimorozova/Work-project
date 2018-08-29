<template lang="pug">
.finance-settings
  .adminNavbar__slider
    span FINANCE
    .slider-inner
        .slider-col Rates
  .rates-block
    .title Rates
    .rates
      .quotesComponent
        .monoRates(:class="{straightAngle: monoDrop}")
          .monoRates__open 
            .select(@click="openMono")
              span Mono
              img(src="../../assets/images/Other/open.png" :class="{reverse: monoDrop}") 
            .rates-drop(v-if="monoDrop")
              RatesMono(:services="services" @refreshServices="refreshServices")
        .duoRates(:class="{straightAngle: duoDrop}")
          .duoRates__open
            .select(@click="openDuo")
              span Duo
              img(src="../../assets/images/Other/open.png" :class="{reverse: duoDrop}") 
            .rates-drop(v-if="duoDrop")
              RatesDuo(:services="services" @refreshServices="refreshServices" @addSevLangs="addSevLangs")
      Addseverallangs(v-if="addSeveral" @closeSeveral="closeSevLangs")
</template>

<script>
import RatesDuo from "../finance/RatesDuo";
import RatesMono from "../finance/RatesMono";
import Addseverallangs from "../finance/Addseverallangs";

import { mapGetters, mapActions } from "vuex";

export default {
  props: {
  },
  data() {
    return {
      monoDrop: false,
      duoDrop: false,
      addSeveral: false,
      fullInfo: []
    };
  },
  methods: {
    refreshServices(data) {
      this.$emit('refreshServices', data);
    },
    addSevLangs(data) {
      this.addSeveral = true;
      this.fullInfo = data;
    },
    closeSevLangs(data) {
      this.addSeveral = false;
    },
    openMono() {
      this.monoDrop = !this.monoDrop;
    },
    openDuo() {
      this.duoDrop = !this.duoDrop;
    }
  },
  computed: {
    ...mapGetters({
      services: "getVeuxServices"
    }) 
  },
  components: {
    RatesMono,
    RatesDuo,
    Addseverallangs
  },
  mounted() {
  }
};
</script>

<style lang="scss" scoped>

.finance-settings {
  position: relative;
  display: flex;
  min-height: 94vh;
}

.rates-block {
  margin: 20px;
  .title {
    font-size: 24px;
  }
}

.rates {
  margin: 20px 10px;
  padding: 20px 10px;
  box-shadow: 0 0 15px #67573e9d;
  width: 886px;
  position: relative;
}

.quotesComponent {
    width: 880px;
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

.adminNavbar {
  position: relative;
  display: flex;
  min-height: 94vh;
  &__slider {
    background-color: #fff;
    width: 175px;
    box-shadow: 7px 1px 10px rgba(103, 87, 62, 0.4);
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
      .slider-col {
        display: flex;
        justify-content: center;
        background-color: #c4beb6;
        border-top: 1px solid #c4beb6;
        border-bottom: 1px solid #c4beb6;
        padding: 5px 30px;
      }
    }
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
