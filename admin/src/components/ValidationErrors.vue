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
        width: 260px;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 9999;
        box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;
        background-color: white;
        border-radius: 4px;
        border-left: 4px solid $red;
      }

      &__errors-title {
        font-size: 16px;
        font-family: Myriad600;
        margin-bottom: 10px;
      }

      &__messages {
        background-color: white;
        padding: 20px;
        border-radius: 4px;
      }

      &__error {
        font-size: 14px;
        padding: 1px 0;
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
        width: 260px;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 9999;
        box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;
        background-color: white;
        border-radius: 4px;
        border-left: 4px solid $red;
      }

      &__errors-title {
        font-size: 16px;
        font-family: Myriad600;
        margin-bottom: 10px;
      }

      &__messages {
        background-color: white;
        padding: 20px;
        border-radius: 4px;
      }

      &__error {
        font-size: 14px;
        padding: 1px 0;
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
