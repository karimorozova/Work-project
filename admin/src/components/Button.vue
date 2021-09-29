<template lang="pug">
  .buttons
    .button(v-if="outline")
      .action-buttonOutline(:class="[customClass, {fullWidthButton: isFullWidth}]")
        input.action-buttonOutline__button(:class="[{disabled: isDisabled}]" type="button" :value="value" @click="clicked" :disabled="isDisabled" :style="{'color': color, 'border': `2px solid ${color}`}")
    .button(v-else)
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
				default: "#d15f45"
			},
			isFullWidth: {
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
      height: 32px;
      font-size: 14px;
      border-radius: 3px;
      background-color: white;
      outline: none;
      letter-spacing: 0.2px;
      cursor: pointer;

      &:hover {
        box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;
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
      height: 32px;
      color: $white;
      font-size: 14px;
      border-radius: 3px;
      background-color: $red;
      border: none;
      transition: .2s ease-out;
      outline: none;
      letter-spacing: 0.2px;
      cursor: pointer;

      &:hover {
        box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;
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

  /*  .action-button {
      &__button {
        min-width: 110px;
        padding: 0 24px 0 24px;
        height: 32px;
        border-radius: 2px;
        color: $white;
        transition: background .2s, transform .2s, box-shadow .2s;
        will-change: transform;
        font-size: 14px;
        border: none;
        outline: none;
        letter-spacing: 0.2px;
        cursor: pointer;

        &:hover {
          !*background: darken(#d15f45, 10%) !important;*!
          transform: translate3d(0, -1px, 0);
          box-shadow:rgba(0, 0, 0, 0.2) 0px -3px 0px inset;
        }

        &:active {
          box-shadow: none;
          transform: translate3d(0, 0px, 0);
        }
      }
    }*/

  .disabled {
    opacity: 0.5;
    cursor: default;
  }

  .middle {
    text-align: center;
  }

  .fullWidthButton {
    input {
      width: 100%;
    }
  }

</style>
