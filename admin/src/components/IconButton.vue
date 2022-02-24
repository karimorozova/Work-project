<template lang="pug">
  .button-wrapper
    PopUp(
      :backgroundColor="popupBg"
      :color="popupTextColor"
      :text="popupText"
      :side="popupSide"
      :isDisabled="!hasPopup"
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
    hasPopup: {
      type: Boolean,
      default: false
    },
    popupBg: {
      type: String,
      default: '#ffffff'
    },
    popupTextColor: {
      type: String,
      default: '#666666'
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
  height: 32px;
  width: 32px;
  box-sizing: border-box;
  border: 1px solid $border;
  border-radius: 4px;
  transition: .2s ease-out;
  display: flex;
  justify-content: center;
  align-items: center;

  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

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

  &:active {
    transform: scale(.96);
  }
}

.button:not(.disabled) {
  cursor: pointer;
}

</style>
