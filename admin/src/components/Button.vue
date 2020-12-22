<template lang="pug">
  .action-button(:class="[customClass, {disabled: isDisabled}]")
    input.action-button__button(type="button" :value="value" @click="clicked" :disabled="isDisabled")
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

  .action-button {
    &__button {
      width: 140px;
      height: 34px;
      color: $white;
      font-size: 14px;
      border-radius: 8px;
      box-shadow: 0 2px 2px 0 rgba(0, 0, 0, .14), 0 3px 1px -2px rgba(0, 0, 0, .12), 0 1px 5px 0 rgba(0, 0, 0, .2);
      background-color: $orange;
      border: none;
      transition: .1s ease;
      outline: none;

      &:hover {
        cursor: pointer;
        box-shadow: 0 3px 3px 0 rgba(0, 0, 0, 0.14), 0 1px 7px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -1px rgba(0, 0, 0, 0.2);
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
      width: 140px;
      height: 34px;
      color: $white;
      font-size: 14px;
      border-radius: 8px;
      box-shadow: 0 2px 2px 0 rgba(0, 0, 0, .14), 0 3px 1px -2px rgba(0, 0, 0, .12), 0 1px 5px 0 rgba(0, 0, 0, .2);
      background-color: $orange;
      border: none;
      transition: .1s ease;
      outline: none;

      &:hover {
        cursor: pointer;
        box-shadow: 0 3px 3px 0 rgba(0, 0, 0, 0.14), 0 1px 7px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -1px rgba(0, 0, 0, 0.2);
      }

      &:active {
        transform: scale(.98);
      }
    }
  }

  .disabled {
    .action-button__button {
      opacity: 0.5;
      width: 140px;
      height: 34px;
      color: $white;
      font-size: 14px;
      border-radius: 8px;
      box-shadow: 0 2px 2px 0 rgba(0, 0, 0, .14), 0 3px 1px -2px rgba(0, 0, 0, .12), 0 1px 5px 0 rgba(0, 0, 0, .2);
      background-color: $orange;
      border: none;
      transition: .1s ease;
      outline: none;

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
      width: 191px;
    }
  }

</style>
