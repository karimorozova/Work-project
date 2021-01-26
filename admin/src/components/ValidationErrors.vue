<template lang="pug">
  .validation(:class="{'validation_absolute': isAbsolute}")
    div(:class='errorsClass' :style="customStyles")
      .validation__messages
        .validation__errors-title Errors:
        li.validation__error(v-for="error in errors") {{ error }}
        span.validation__close(@click="closeErrors") +
</template>

<script>
	export default {
		props: {
			errors: {
				type: Array
			},
			customStyles: {
				type: Object
			},
			isAbsolute: {
				type: Boolean,
				default: false
			},
			errorsClass: {
				type: String,
				default: 'validation__errors'
			}
		},
		methods: {
			closeErrors() {
				this.$emit("closeErrors")
			}
		}
	}
</script>

<style lang="scss" scoped>
  @import "../assets/scss/colors.scss";

  .validation {
    &__errors {
      position: fixed;
      top: 40%;
      left: 650px;
      width: 400px;
      padding: 20px;
      box-shadow: 0 2px 4px 0 rgba(103, 87, 62, .3), 0 2px 16px 0 rgba(103, 87, 62, .2);
      background-color: #fff;
      z-index: 50;
    }

    &__errors-title {
      font-size: 18px;
      color: $orange;
      font-family: Myriad600;
      text-align: center;
      margin-bottom: 10px;
    }

    &__messages {
      position: relative;
    }

    &__error {
      font-size: 16px;
    }

    &__close {
      transform: rotate(45deg);
      position: absolute;
      top: -15px;
      right: -5px;
      font-size: 28px;
      cursor: pointer;
    }
  }

  .validation__errors-client-services {
    position: relative;
    margin-top: 15px;
    border-radius: 15px;
    width: 320px;
    padding: 20px;
    border: 1px solid #bfb09d;
    background-color: #fff;
    box-sizing: border-box;
    z-index: 50;
  }

  .validation_absolute {
    .validation__errors {
      position: absolute;
      background: transparent;
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: none;
      width: 100%;
      margin-left: 0;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      background-color: transparent;
      z-index: 50;
    }

    .validation__messages {
      box-shadow: 0 0 5px $red;
      background-color: white;
      padding: 20px;
    }

    .validation__close {
      transform: rotate(45deg);
      position: absolute;
      top: 0;
      right: 8px;
      font-size: 24px;
      font-weight: 700;
      cursor: pointer;
    }
  }
</style>
