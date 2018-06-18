<template lang="pug">
  .b-iso1
    span {{ titlesp3 }}
    img.b-iso1__tool(:src="icon1" @click='handleISO2')
    span.tooltip(:class="{toolTipShown: toolTipVisible}") {{ titlesp4 }}
</template>

<script>
export default {
  props: {
    icon1: {
      type: String,
      default: require("../../../assets/images/info-icon-white.png")
    },
    titlesp3: {
        type: String,
        default: ''
    },
    titlesp4: {
        type: String,
        default: ''
    }
  },
  data() {
    return {
        toolTipVisible: false
    };
  },
  methods: {
    handleISO2() {
      this.toolTipVisible = !this.toolTipVisible;
    }
  },

  computed: {},
  components: {}
};
</script>

<style lang="scss" scoped>
.b-iso1 {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  position: relative;
  &__tool {
    opacity: 1;
  }
  .tooltip {
    position: absolute;
    background-color: #fff;
    color: rgb(214, 69, 69);
    font-size: 14px;
    top: -19px;
    left: 3px;
    opacity: 1;
    visibility: hidden;
  }
  .toolTipShown {
      visibility: visible;
  }
}
</style>