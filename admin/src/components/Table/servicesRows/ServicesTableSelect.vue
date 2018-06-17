<template lang="pug">
.selectWrapper
  .info
    span Option
    .arr(@click="showDD")
      img(src="../../../assets/images/Other/open arrow.png")
  .drop(v-if="dropdownVisible")
    .b-conf YES
    .b-conf NO
</template>

<script>
export default {

  data() {
    return {
      dropdownVisible: false
    };
  },
  methods: {
    showDD(){
      this.dropdownVisible = !this.dropdownVisible;
    }
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
          padding: 7px 0px 15px 9px;
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

        .b-conf {
          display: flex;
          justify-content: flex-start;
          border: 1px solid #68573e;
          width: 188px;
          background-color: #fff;
          padding: 10px 0 10px 10px;
            &:last-child {
              border-top: 0;
            }
        }
    }
}
</style>