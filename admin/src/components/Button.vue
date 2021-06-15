<template lang="pug">
  .buttons
    .button(v-if="outline")
      .action-buttonOutline(:class="[customClass, {disabled: isDisabled}]")
        input.action-buttonOutline__button(type="button" :value="value" @click="clicked" :disabled="isDisabled")
    .button(v-else)
      .action-button(:class="[customClass, {disabled: isDisabled}]")
        input.action-button__button(type="button" :value="value" @click="clicked" :disabled="isDisabled" :style="{'background-color': color}")
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
      border: 2px solid #d15f45;
      min-width: 120px;
      padding: 0 24px 0 24px;
      height: 32px;
      color: #d15f45;
      font-size: 14px;
      border-radius: 4px;
      background-color: white;
      outline: none;
      letter-spacing: 0.2px;

      &:hover {
        cursor: pointer;
        background: #f4f2f1;
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
      min-width: 120px;
      padding: 0 24px 0 24px;
      height: 32px;
      color: $white;
      font-size: 14px;
      border-radius: 4px;
      background-color: $orange;
      border: none;
      transition: .1s ease;
      outline: none;
      letter-spacing: 0.2px;

      &:hover {
        cursor: pointer;
        box-shadow: rgba(81, 68, 48, 0.3) 0px 1px 2px 0px, rgba(81, 68, 48, 0.15) 0px 1px 3px 1px;
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

  .main-nav_button {
    .action-button__button {
      min-width: 120px;
      padding: 0 24px 0 24px;
      height: 32px;
      color: $white;
      font-size: 14px;
      border-radius: 4px;
      background-color: $orange;
      border: none;
      transition: .1s ease;
      outline: none;
      letter-spacing: 0.2px;

      &:hover {
        cursor: pointer;
        box-shadow: rgba(81, 68, 48, 0.3) 0px 1px 2px 0px, rgba(81, 68, 48, 0.15) 0px 1px 3px 1px;
      }

      &:active {
        transform: scale(.98);
      }
    }
  }

  .disabled {
    .action-button__button {
      opacity: 0.4;
      min-width: 120px;
      padding: 0 24px 0 24px;
      height: 32px;
      color: $white;
      font-size: 14px;
      border-radius: 4px;
      background-color: $orange!important;
      border: none;
      transition: .1s ease;
      outline: none;
      letter-spacing: 0.2px;
      cursor: default;

      &:hover {
        box-shadow: none;
      }

      &:active {
        box-shadow: none;
      }
    }
  }

  .width-191 {
    .action-button__button {
      width: 200px;
    }
  }
  .width-140 {
    .action-button__button {
      width: 140px;
    }
  }

  .middle {
    text-align: center;
  }

</style>
