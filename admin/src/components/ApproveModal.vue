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
          span Partial Payment
        .approve-modal__checkbox
          label.switch
            input(type='checkbox' :checked="isPay" v-model="isPay")
            span.slider.round

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
	import Button from "./Button";
	import SelectSingle from "./SelectSingle";

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
			};
		},
		methods: {
			approve() {
				this.$emit("approve");
			},
			returnData() {
				this.approve();
				this.$emit("returnData", { reason: this.selectedReason, isPay: this.isPay });
			},
			notApprove() {
				this.$emit("notApprove");
			},
			close() {
				this.$emit("close");
			},
			setReason({ option }) {
				this.selectedReason = option;
			},
			onKeyDown(e) {
				e.keyCode === 27 && this.notApprove();
				e.keyCode === 13 && this.approve();
			},
		},
		components: {
			Button,
			SelectSingle
		},
		beforeDestroy() {
			document.removeEventListener('keydown', this.onKeyDown)
		},
		async created() {
			const reasons = await this.$http.get("/api/reasons");
			for (let key in reasons.data) this.reasons.push(reasons.data[key].reason);
			document.addEventListener('keydown', this.onKeyDown)
		}
	};
</script>

<style lang="scss">
  @import "../assets/scss/colors.scss";

  .approve-modal {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    box-shadow: 0 0 10px #67573e9d;
    background-color: $white;
    max-width: 300px;
    font-size: 16px;

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
      width: 191px;
      height: 28px;
      position: relative;
      margin-bottom: 20px;
      margin-top: 20px;
    }

    &__payment {
      margin-bottom: 10px;

      &-span {
        vertical-align: sub;
        display: inline-block;
        font-size: 18px;
      }
    }

    &__extra-choice {
      display: contents;
    }

    &__checkbox {
      display: inline-flex;

      .switch {
        position: relative;
        display: inline-block;
        width: 60px;
        height: 28px;
        margin-left: 28px;

        input {
          opacity: 0;
          width: 0;
          height: 0;
        }
      }

      .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ebebe4;
        -webkit-transition: 0.4s;
        transition: 0.4s;

        &:before {
          position: absolute;
          content: "";
          height: 19px;
          width: 19px;
          left: 7px;
          bottom: 5px;
          background-color: #fff;
          transition: 0.4s;
        }
      }

      input {
        &:checked {
          + {
            .slider {
              background-color: #67573e;

              &:before {
                -webkit-transform: translateX(26px);
                -ms-transform: translateX(26px);
                transform: translateX(26px);
              }
            }
          }
        }
      }

      .slider.round {
        border-radius: 28px;

        &:before {
          border-radius: 50%;
        }
      }
    }
  }
</style>
