<template lang="pug">
.calculationWrapper
  .info(v-if="isActiveUpload" v-click-outside="hideDropMenu")
    span {{ unitOption }}
    .arr(@click="showDDCalculation")
      img(src="../../../assets/images/Other/open arrow.png")
  .drop(v-if="dropdownVisible")
    span.optionForm(@click="makeChooseWords") Words
    span.optionForm(@click="makeChooseHours") Hours
    span.optionForm(@click="makeChoosePackages") Packages
</template>

<script>
import ClickOutside from "vue-click-outside";

export default {
  props: {
    isActiveUpload: {
      type: Boolean,
      default: false
    },
    unitOption: {
      type: String
    },
    index: {
      type: Number
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
      hideAgainOptions2: false
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
      this.dropdownVisible = false;
      this.$emit('calcSendFirst', {unit: this.calculationUnit.words, index: this.index});
    },
    makeChooseHours() {
      this.hideAgainOptions = false;
      this.hideAgainOptions1 = true;
      this.hideAgainOptions2 = false;
      this.$emit('calcSendSecond', {unit: this.calculationUnit.hours, index: this.index});
    },
    makeChoosePackages() {
      this.chooseBetweenThird = false;
      this.hideAgainOptions = false;
      this.hideAgainOptions1 = false;
      this.hideAgainOptions2 = true;
      this.$emit('calcSendThird', {unit: this.calculationUnit.packages, index: this.index});
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
  border: 1px solid #9a8f80;
  height: 100%;
  .info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    span {
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
    width: 100%;
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 43px;
    left: -1px;
    z-index: 3;
    box-shadow: 1px 1px 6px #000;

    .optionForm {
      display: flex;
      justify-content: flex-start;
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