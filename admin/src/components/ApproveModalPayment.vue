<template lang="pug">
  .approve-modal
    .approve-modal__text {{ text }}
    .approve-modal__extra-choice(v-if="isCheckbox")
      .approve-modal__drop-menu
        SelectSingle(
          :selectedOption="selectedReason"
          :options="reasons"
          placeholder="Select Reason"
          @chooseOption="setReason"
        )
      .approve-modal__payment
        .approve-modal__payment-span
          span Partial Payment:
        .approve-modal__checkbox
          Toggler(
            :isDisabled="false"
            :isActive="isPay"
            @toggle="isPay = !isPay"
          )

      .approve-modal__buttons
        .approve-modal__button(@click="returnData")
          Button(:value="approveValue")
        .approve-modal__button(@click.stop="notApprove")
          Button(:value="notApproveValue")
      span.approve-modal__close(@click.stop="close") +

    .approve-modal__buttons(v-if="!isCheckbox")
      .approve-modal__button(@click.stop="approve")
        Button(:value="approveValue")
      .approve-modal__button(@click.stop="notApprove")
        Button(:value="notApproveValue")
    span.approve-modal__close(@click.stop="close") +
</template>

<script>
	import Button from "./Button"
	import SelectSingle from "./SelectSingle"
	import Toggler from "./Toggler"

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
			isCheckbox: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				reasons: [],
				selectedReason: "",
				isPay: false
			}
		},
		methods: {
			approve() {
				this.$emit("approve")
			},
			returnData() {
				this.approve()
				this.$emit("returnData", { reason: this.selectedReason, isPay: this.isPay })
			},
			notApprove() {
				this.$emit("notApprove")
			},
			close() {
				this.$emit("close")
			},
			setReason({ option }) {
				this.selectedReason = option
			},
			onKeyDown(e) {
				e.keyCode === 27 && this.notApprove()
				e.keyCode === 13 && this.approve()
			}
		},
		components: {
			Toggler,
			Button,
			SelectSingle
		},
		beforeDestroy() {
			document.removeEventListener('keydown', this.onKeyDown)
		},
		async created() {
			const reasons = await this.$http.get("/api/reasons")
			for (let key in reasons.data) this.reasons.push(reasons.data[key].reason)
			document.addEventListener('keydown', this.onKeyDown)
		}
	}
</script>

<style lang="scss" scoped>
  @import "../assets/scss/colors.scss";

  .approve-modal {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;
    background-color: $white;
    max-width: 300px;
    font-size: 14px;

    &__buttons {
      margin-top: 10px;
      display: flex;
    }

    &__button {
      margin: 5px;
    }

    &__close {
      position: absolute;
      top: 2px;
      right: 8px;
      transform: rotate(45deg);
      cursor: pointer;
      font-size: 22px;
      font-weight: bold;
    }

    &__drop-menu {
      width: 220px;
      height: 32px;
      position: relative;
      margin-bottom: 20px;
      margin-top: 20px;
    }

    &__payment {
      margin-bottom: 10px;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: start;

      &-span {
        font-size: 14px;
      }
    }

    &__extra-choice {
    }

    &__checkbox {
      margin-left: 15px;
    }
  }
</style>
