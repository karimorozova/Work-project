<template lang="pug">
  .b-iso1
    span {{ titlesp1 }}
    img.b-iso1__tool(:src="icon1" @click='handleISO1')
    span.tooltip(:class="{toolTipShown: toolTipVisible}") (two letters)
</template>

<script>
export default {
  props: {
    icon1: {
      type: String,
      default: require("../../../assets/images/info-icon-white.png")
    },
    titlesp1: {
        type: String,
        default: ''
    },
    titlesp2: {
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
    handleISO1() {
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