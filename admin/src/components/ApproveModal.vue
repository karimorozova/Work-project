<template lang="pug">
  .approve-modal
    .approve-modal__text {{ text }}
    .approve-modal__buttons
      .approve-modal__button(@click.stop="approve")
        Button(:value="approveValue")
      .approve-modal__button(@click.stop="notApprove")
        Button(:value="notApproveValue")
    span.approve-modal__close(v-if="!optionWithoutClosing" @click.stop="close") &#215;
</template>

<script>
	import Button from "./Button"
	import SelectSingle from "./SelectSingle"

	export default {
		props: {
			text: {
				type: String
			},
			approveValue: {
				type: String
			},
			notApproveValue: {
				type: String
			},
      optionWithoutClosing: {
				type: Boolean,
        default: false
      }
		},
		data() {
			return {}
		},
		methods: {
			approve() {
				this.$emit("approve")
			},
			notApprove() {
				this.$emit("notApprove")
			},
			close() {
				this.$emit("close")
			},
			onKeyDown(e) {
				e.keyCode === 27 && this.notApprove()
				e.keyCode === 13 && this.approve()
			}
		},
		components: {
			Button,
			SelectSingle
		},
		beforeDestroy() {
			document.removeEventListener('keydown', this.onKeyDown)
		},
		async created() {
			document.addEventListener('keydown', this.onKeyDown)
		}
	}
</script>

<style lang="scss">
  @import "../assets/scss/colors.scss";

  .approve-modal {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    box-shadow: rgba(81, 68, 48, 0.3) 0px 1px 2px 0px, rgba(81, 68, 48, 0.15) 0px 1px 3px 1px;
    background-color: $white;
    max-width: 300px;
    font-size: 14px;

    &__text{
      text-align: center;
      margin-top: 10px;
    }

    &__buttons {
      margin-top: 10px;
      display: flex;
    }

    &__button {
      margin: 5px;
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
</style>
