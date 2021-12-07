<template lang="pug">
  .button(:class="{disabled: isDisable}" @click.stop="click")
    .button__icon
      slot
</template>

<script>
export default {
  props: {
    isDisable: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    click() {
      if (this.isDisable) return
      this.$emit("clicked")
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/scss/colors';

.button {
  min-width: 25px;
  height: 25px;
  border: 1px solid $border;
  border-radius: 4px;
  transition: .2s ease-out;
  display: flex;
  justify-content: center;
  align-items: center;

  &:not(.disabled):hover {
    .button__icon {
      color: $text;
    }
  }

  &__icon {
    font-size: 15px;
    color: $dark-border;
    margin-top: 1px;
  }

}
.button:not(.disabled) {
  cursor: pointer;
}

</style>
