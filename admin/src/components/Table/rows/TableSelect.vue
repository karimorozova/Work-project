<template lang="pug">
.selectWrapper
  .info(v-if="!isActiveUpload")
    span(v-if="chooseYesOrNo") YES
    span(v-else) NO
  .info(v-else="isActiveUpload" v-click-outside="hideDropMenu")
    span Option
    .arr(@click="showDD")
      img(src="../../../assets/images/Other/open arrow.png")
  .drop(v-if="dropdownVisible")
    .b-conf(@click="makeChooseYes") YES
    .b-conf(@click="makeChooseNo") NO
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
      hideAgainOptions: true,
      chooseYesOrNo: true

    };
  },
  methods: {
    showDD() {
      this.dropdownVisible = !this.dropdownVisible;
    },
    hideDropMenu(){
      this.hideAgainOptions = false;
      this.dropdownVisible = false;
      this.isActiveUpload = false;
    },
    makeChooseYes(){
      this.isActiveUpload = false;
    },
    makeChooseNo(){
      this.chooseYesOrNo = false;
      this.isActiveUpload = false;
    },
  },
  directives: {
    ClickOutside
  },
  computed: {}
};
</script>

<style lang="scss" scoped>
.selectWrapper {
  display: flex;
  justify-content: center;
  position: relative;
  width: 100%;
  .info {
    display: flex;
    justify-content: space-between;
    width: 100%;
    span {
      padding-top: 8px;
    }
    .arr {
      border: 1px solid #68573e;
      padding: 5px 5px 13px 0;
      border-right: 0;
      border-top: 0;
      border-bottom: 0;
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
    left: -11px;
    z-index: 3;
    box-shadow: 1px 1px 8px rgba(0, 0, 0, 0.5);

    .b-conf {
      display: flex;
      justify-content: flex-start;
      border: 1px solid #68573e;
      width: 108px;
      background-color: #fff;
      padding: 10px 0 10px 10px;
      cursor: pointer;
      &:last-child {
        border-top: 0;
      }
    }
  }
}
</style>