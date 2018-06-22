<template lang="pug">
.languageFormWrapper
  .info
    span Mono
    .arr(@click="showDD")
      img(src="../../../assets/images/Other/open arrow.png")
  .drop(v-if="dropdownVisible")
    .b-conf Duo
</template>

<script>
export default {
  data() {
    return {
      dropdownVisible: false
    };
  },
  methods: {
    showDD() {
      this.dropdownVisible = !this.dropdownVisible;
    }
  },

  computed: {}
};
</script>

<style lang="scss" scoped>
.languageFormWrapper {
  display: flex;
  // justify-content: center;
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
      border: 1px solid #68573e;
      width: 121px;
      background-color: #fff;
      padding: 10px 0 10px 10px;
      // &:last-child {
      //   border-top: 0;
      // }
    }
  }
}
</style>