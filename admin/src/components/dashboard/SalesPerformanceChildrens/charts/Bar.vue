<template lang="pug">
.bar
  .bar__filler(:style="{ width: width + '%' }")
  .bar__current-value {{ currentValue }}
  .bar__total-value {{ totalValue }}
</template>

<script>
export default {
  props: {
    currentValue: { type: [Number, String] },
    totalValue: { type: [Number, String] },
  },
  computed: {
    width() {
      let result = 0;
      if (this.currentValue) {
        let value = Math.round((this.currentValue / this.totalValue) * 100);
        result = value < 100 ? value : 100;
      }
      return result;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors.scss";

.bar {
  width: 100%;
  height: 14px;
  background-color: #e5e5e5;
  border-radius: 4px;
  position: relative;
  &__filler {
    background-color: $orange;
    height: 100%;
    position: relative;
    transition: all 1s;
    &::before {
      content: "";
      position: absolute;
      height: 30px;
      width: 30px;
      border-radius: 50%;
      background-color: $orange;
      top: -10px;
      right: -15px;
    }
    &::after {
      content: "";
      position: absolute;
      height: 18px;
      width: 18px;
      border-radius: 50%;
      background-color: $white;
      top: -4px;
      right: -9px;
      box-shadow: -1px 0px 3px rgba(104, 87, 62, 0.03), -1px 1px 3px rgba(104, 87, 62, 0.03),
        -2px 1px 3px rgba(104, 87, 62, 0.03), -2px 2px 3px rgba(104, 87, 62, 0.03), -3px 2px 3px rgba(104, 87, 62, 0.03),
        -3px 3px 3px rgba(104, 87, 62, 0.03), -4px 3px 3px rgba(104, 87, 62, 0.03), -4px 4px 3px rgba(104, 87, 62, 0.03),
        -5px 4px 3px rgba(104, 87, 62, 0.03), -5px 5px 3px rgba(104, 87, 62, 0.03), -6px 5px 3px rgba(104, 87, 62, 0.03),
        -6px 6px 3px rgba(104, 87, 62, 0.03), -7px 6px 3px rgba(104, 87, 62, 0.03), -7px 7px 3px rgba(104, 87, 62, 0.03),
        -8px 7px 3px rgba(104, 87, 62, 0.03), -8px 8px 3px rgba(104, 87, 62, 0.03), -9px 8px 3px rgba(104, 87, 62, 0.03),
        -9px 9px 3px rgba(104, 87, 62, 0.03), -10px 9px 3px rgba(104, 87, 62, 0.03),
        -10px 10px 3px rgba(104, 87, 62, 0.03), -11px 10px 3px rgba(104, 87, 62, 0.03),
        -11px 11px 3px rgba(104, 87, 62, 0.03), -12px 11px 3px rgba(104, 87, 62, 0.03),
        -12px 12px 3px rgba(104, 87, 62, 0.03), -13px 12px 3px rgba(104, 87, 62, 0.03),
        -13px 13px 3px rgba(104, 87, 62, 0.03);
    }
  }
  &__current-value {
    font-size: 18px;
    position: absolute;
    top: -25px;
    left: 20px;
    color: $orange;
  }
  &__total-value {
    font-size: 18px;
    position: absolute;
    right: -35px;
    top: -2px;
    opacity: 0.4;
  }
}
</style>
