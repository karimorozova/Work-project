<template lang="pug">
  .validation(:class="[{'validationAbsolute': isAbsolute}, {'validationCustom': !isAbsolute}]")
    div(:class='errorsClass' :style="customStyles")
      .validation__messages
        .validation__errors-title Errors:
        li.validation__error(v-for="error in errors") {{ error }}
        span.validation__close(@click="closeErrors") &#215;


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

  .validationCustom {

    .validation {

      &__errors {
        position: fixed;
        width: 320px;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 9999;
        box-shadow: rgba(81, 68, 48, 0.3) 0px 1px 2px 0px, rgba(81, 68, 48, 0.15) 0px 1px 3px 1px;
        background-color: #fff;
      }

      &__errors-title {
        font-size: 18px;
        color: $orange;
        font-family: Myriad600;
        text-align: center;
        margin-bottom: 10px;
      }

      &__messages {
        box-shadow: rgba(81, 68, 48, 0.3) 0px 1px 2px 0px, rgba(81, 68, 48, 0.15) 0px 1px 3px 1px;
        background-color: white;
        padding: 20px;
        border: 2px solid $orange;
      }

      &__error {
        font-size: 15px;
      }

      &__close {
        position: absolute;
        top: 5px;
        right: 7px;
        font-size: 22px;
        cursor: pointer;
        height: 22px;
        width: 22px;
        justify-content: center;
        display: flex;
        align-items: center;
        font-family: Myriad900;
        opacity: 0.8;
        transition: ease 0.2s;

        &:hover {
          opacity: 1
        }
      }
    }

  }


  .validationAbsolute {

    .validation {

      &__errors {
        position: absolute;
        width: 320px;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 9999;
        box-shadow: rgba(81, 68, 48, 0.3) 0px 1px 2px 0px, rgba(81, 68, 48, 0.15) 0px 1px 3px 1px;
        background-color: #fff;
      }

      &__errors-title {
        font-size: 18px;
        color: $orange;
        font-family: Myriad600;
        text-align: center;
        margin-bottom: 10px;
      }

      &__messages {
        box-shadow: rgba(81, 68, 48, 0.3) 0px 1px 2px 0px, rgba(81, 68, 48, 0.15) 0px 1px 3px 1px;
        background-color: white;
        padding: 20px;
        border: 2px solid $orange;
      }

      &__error {
        font-size: 15px;
      }

      &__close {
        position: absolute;
        top: 5px;
        right: 7px;
        font-size: 22px;
        cursor: pointer;
        height: 22px;
        width: 22px;
        justify-content: center;
        display: flex;
        align-items: center;
        font-family: Myriad900;
        opacity: 0.8;
        transition: ease 0.2s;

        &:hover {
          opacity: 1
        }
      }
    }
  }


</style>
