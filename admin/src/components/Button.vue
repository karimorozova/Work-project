<template lang="pug">
  .buttons
    .button(v-if="outline" :class="{fullWidth: isFullMainClass}")
      .action-buttonOutline(:class="[customClass, {fullWidthButton: isFullWidth}]")
        input.action-buttonOutline__button(:class="[{disabled: isDisabled}]" type="button" :value="value" @click="clicked" :disabled="isDisabled" :style="{'color': color, 'border': `1px solid ${color}`}")
    .button(v-else :class="{fullWidth: isFullMainClass}")
      .action-button(:class="[customClass, {disabled: isDisabled}, {fullWidthButton: isFullWidth}]")
        input.action-button__button(:class="[{disabled: isDisabled}]" type="button" :value="value" @click="clicked" :disabled="isDisabled" :style="{'background-color': color}")
</template>

<script>
export default {
  props: {
    value: {
      type: String
    },
    isDisabled: {
      type: Boolean
    },
    customClass: {
      type: String
    },
    outline: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: "#d66f58"
    },
    isFullWidth: {
      type: Boolean,
      default: false
    },
    isFullMainClass: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    clicked() {
      this.$emit('clicked', { value: this.value })
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../assets/scss/colors.scss";

.action-buttonOutline {

  &__button {
    transition: .2s ease-out;
    text-align: center;
    min-width: 110px;
    padding: 0 24px 0 24px;
    height: 30px;
    font-size: 14px;
    border-radius: 2px;
    background-color: white;
    outline: none;
    letter-spacing: 0.2px;
    cursor: pointer;

    &:hover {
      box-shadow: $box-shadow;
    }

    &:active {
      transform: scale(.98);
    }
  }

  .other-choice & {
    margin: 7px;
    @media (max-width: 450px) {
      margin: 5px;
    }
  }
}

.action-button {

  &__button {
    min-width: 110px;
    padding: 0 24px 0 24px;
    height: 30px;
    color: $white;
    font-size: 14px;
    border-radius: 2px;
    background-color: $red;
    border: none;
    transition: .2s ease-out;
    outline: none;
    letter-spacing: 0.2px;
    cursor: pointer;

    &:hover {
      box-shadow: $box-shadow;
    }

    &:active {
      transform: scale(.97);
    }
  }

  .other-choice & {
    margin: 7px;
    @media (max-width: 450px) {
      margin: 5px;
    }
  }
}

.disabled {
  opacity: 0.5;
  cursor: default;
}

.middle {
  text-align: center;
}

.fullWidth {
  width: 100%;

  input {
    width: 100%;
  }
}

.fullWidthButton {
  input {
    width: 100%;
  }
}

</style>
