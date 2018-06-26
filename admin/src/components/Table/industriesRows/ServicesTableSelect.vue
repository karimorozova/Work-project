<template lang="pug">
.selectWrapper
  .info(v-if="!chooseSelect")
    input.first(v-if="hideSelect" v-model="activeStatus.yes" type="text" :readonly="true")
    input.second(v-else v-model="activeStatus.no" type="text" :readonly="true")
  .info(v-if="chooseSelect" v-click-outside="hideDropMenuSelect")
    span Option
    .arr(@click="showDDSelect")
      img(src="../../../assets/images/Other/open arrow.png")
  .drop(v-if="dropdownVisible")
    input.b-conf(@click="makeChooseYes" v-model="activeStatus.yes" type="text" :readonly="true")
    input.b-conf(@click="makeChooseNo" v-model="activeStatus.no" type="text" :readonly="true")
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
      activeStatus: {
        yes: "Yes",
        no: "No"
      },
      hideSelect: true,
      chooseSelect: this.isActiveUpload
    };
  },
  methods: {
    showDDSelect() {
      this.dropdownVisible = !this.dropdownVisible;
    },
    hideDropMenuSelect() {
      this.dropdownVisible = false;
    },
    makeChooseYes() {
      this.hideSelect = true;
      this.chooseSelect = false;
      this.dropdownVisible = false;
      this.$emit('sendActiveStatusY', this.activeStatus.yes);
    },
    makeChooseNo() {
      this.hideSelect = false;
      this.chooseSelect = false;
      this.dropdownVisible = false;
      this.$emit('sendActiveStatusN', this.activeStatus.no);
    }
  },
  directives: {
    ClickOutside
  },
  computed: {},
  watch: {
    isActiveUpload() {
      this.chooseSelect = this.isActiveUpload;
    }
  }
};
</script>

<style lang="scss" scoped>
.selectWrapper {
  display: flex;
  position: relative;
  width: 34%;
  flex-basis: 20.7%;
  border: 1px solid #9a8f80;
  .info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    span {
      padding-left: 10px;
    }
    .first,
    .second {
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