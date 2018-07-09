<template lang="pug">
.languageFormWrapper
  .info(v-if="isActiveUpload" v-click-outside="outClick")
    span {{ formOption }}
    .arr(@click="showDDLangForm")
      img(src="../../../assets/images/Other/open arrow.png")
  .drop(v-if="dropdownVisible")
    span.optionForm(@click="makeChooseMono") Mono
    span.optionForm(@click="makeChooseDuo") Duo
</template>

<script>
import ClickOutside from "vue-click-outside";

export default {
  props: {
    isActiveUpload: {
      type: Boolean,
      default: false
    },
    formOption: {
      type: String
    },
    index: {
      type: Number
    }
  },
  data() {
    return {
      
      dropdownVisible: false,
      languageMode: {
        mono: "Mono",
        duo: "Duo"
      }
    };
  },
  methods: {
    showDDLangForm() {
      this.dropdownVisible = !this.dropdownVisible;
    },
    outClick() {
      this.dropdownVisible = false;
    },
    makeChooseMono() {
      this.dropdownVisible = false;
      this.$emit('sendToParentM', {form: this.languageMode.mono, index: this.index});
    },
    makeChooseDuo() {
      this.dropdownVisible = false;
      this.$emit('sendToParentDuo', {form: this.languageMode.duo, index: this.index});
    }
  },
  directives: {
    ClickOutside
  },
  computed: {
    
  },
  watch: {
    isActiveUpload() {
      this.chooseLangBlock = this.isActiveUpload;
    }
  }
};
</script>

<style lang="scss" scoped>
.languageFormWrapper {
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