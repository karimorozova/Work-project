<template lang="pug">
  .button-wrapper
    PopUp(
      :backgroundColor="backgroundColor"
      :color="color"
      :text="popupText"
      :side="popupSide"
      :isDisabled="!popupText"
    )
      .button(:class="{disabled: isDisabled}" @click.stop="click")
        .button__icon
          slot

</template>

<script>
import PopUp from "./PopUp"

export default {
  components: {
    PopUp
  },
  props: {
    isDisabled: {
      type: Boolean,
      default: false
    },
    backgroundColor: {
      type: String
    },
    color: {
      type: String
    },
    popupText: {
      type: String
    },
    popupSide: {
      type: String
    }
  },
  methods: {
    click() {
      if (this.isDisabled) return
      this.$emit("clicked")
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../assets/scss/colors';

.button-wrapper {
  position: relative;
  width: fit-content;
}

.button {
  height: 30px;
  width: 30px;
  box-sizing: border-box;
  border: 1px solid $border;
  border-radius: 2px;
  transition: .2s ease-out;
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;

  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  &:not(.disabled):hover {
    .button__icon {
      color: $border-focus;
    }
  }

  &__icon {
    color: $dark-border;
    margin-top: 2px;
  }
}

.button:not(.disabled) {
  cursor: pointer;
}

.disabled {
  opacity: 0.5;
}

</style>
