<template lang="pug">
.calculationWrapper
  .info(v-if="!chooseBetweenThird")
    input.first(v-if="hideAgainOptions" v-model="calculationUnit.words" type="text" :readonly="true")
    input.second(v-if="hideAgainOptions1" v-model="calculationUnit.hours" type="text" :readonly="true")
    input.third(v-if="hideAgainOptions2" v-model="calculationUnit.packages" type="text" :readonly="true")
  .info(v-if="chooseBetweenThird" v-click-outside="hideDropMenu")
    span Option
    .arr(@click="showDDCalculation")
      img(src="../../../assets/images/Other/open arrow.png")
  .drop(v-if="dropdownVisible")
    input.b-conf(@click="makeChooseWords" v-model="calculationUnit.words" type="text" :readonly="true")
    input.b-conf(@click="makeChooseHours" v-model="calculationUnit.hours" type="text" :readonly="true")
    input.b-conf(@click="makeChoosePackages" v-model="calculationUnit.packages" type="text" :readonly="true")
</template>

<script>
import ClickOutside from "vue-click-outside";

export default {
  props: {
    isActiveUpload: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dropdownVisible: false,
      calculationUnit: {
        words: 'Words',
        hours: 'Hours',
        packages: 'Packages'
      },
      hideAgainOptions: true,
      hideAgainOptions1: false,
      hideAgainOptions2: false,
      chooseBetweenThird: this.isActiveUpload
    };
  },
  methods: {
    showDDCalculation() {
      this.dropdownVisible = !this.dropdownVisible;
    },
    hideDropMenu() {
      this.dropdownVisible = false;
    },
    makeChooseWords() {
      this.hideAgainOptions = true;
      this.hideAgainOptions1 = false;
      this.chooseBetweenThird = false;
      this.dropdownVisible = false;
      this.$emit('calcSendFirst', this.calculationUnit.words);
    },
    makeChooseHours() {
      this.chooseBetweenThird = false;
      this.hideAgainOptions = false;
      this.hideAgainOptions1 = true;
      this.hideAgainOptions2 = false;
      this.$emit('calcSendSecond', this.calculationUnit.hours);
    },
    makeChoosePackages() {
      this.chooseBetweenThird = false;
      this.hideAgainOptions = false;
      this.hideAgainOptions1 = false;
      this.hideAgainOptions2 = true;
      this.$emit('calcSendThird', this.calculationUnit.words);
    }
  },
  directives: {
    ClickOutside
  },
  computed: {},
  watch: {
    isActiveUpload() {
      this.chooseBetweenThird = this.isActiveUpload;
    }
  }
};
</script>

<style lang="scss" scoped>
.calculationWrapper {
  display: flex;
  position: relative;
  width: 34%;
  flex-basis: 16%;
  border: 1px solid #9a8f80;
  .info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    span {
      padding-left: 10px;
    }
    .first, .second, .third {
      outline: none;
      border: none;
      width: 85px;
      font-size: 14px;
      color: #67573e;
      padding-left: 10px;
    }
    .arr {
      border: 1px solid #68573e;
      border-right: 0;
      border-top: 0;
      border-bottom: 0;
      border-left-width: 2px;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      cursor: pointer;
      img {
        width: 20px;
      }
    }
  }

  .drop {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 43px;
    left: -1px;
    z-index: 3;
    box-shadow: 1px 1px 6px #000;

    .b-conf {
      display: flex;
      justify-content: flex-start;
      width: 115px;
      background-color: #fff;
      padding: 10px 0 10px 10px;
      cursor: pointer;
      outline: none;
      border: none;
      font-size: 14px;
      color: #67573e;
      padding-left: 10px;
      border: 1px solid #68573e;
    }
  }
}
</style>