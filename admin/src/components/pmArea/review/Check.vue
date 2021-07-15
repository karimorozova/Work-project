<template lang="pug">
  .check-line(:class="{'cursorDisable': isDisabled}")
    i.check-line__icon.fa.fa-check-circle(@click="toggleApproval" :class="{'check-line_green': isApproved}")
</template>

<script>
	export default {
		props: {
			isApproved: {
				type: Boolean
			},
			instruction: {
				type: Object
			},
			type: {
				type: String
			},
			isDisabled: {
				type: Boolean,
				default: false
			}
		},
		methods: {
			toggleApproval() {
				if (this.isDisabled) return

				this.$emit('toggleApproval', {
					type: this.type,
					instruction: this.instruction
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

  .cursorDisable {
    cursor: default !important;
  }

  .check-line {
    display: flex;
    align-items: center;
    cursor: pointer;

    &__icon {
      color: $border;
      font-size: 16px;
      transition: ease 0.1s;
    }

    &_green {
      color: $green-approve;
      transform: rotateY(360deg);
    }
  }

</style>
