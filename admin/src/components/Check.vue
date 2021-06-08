<template lang="pug">
  .check-line
    i.check-line__icon.fa.fa-check-circle(@click="click" :class="[{'check-line_green': isApproved}, {'disabled': isDisabled}]")
</template>

<script>
	export default {
		props: {
			isApproved: {
				type: Boolean
			},
			isDisabled: {
				type: Boolean,
				default: false
			}
		},
		methods: {
			click() {
				this.$emit('click', !this.isApproved)
			}
		}
	}
</script>

<style lang="scss" scoped>
  @import "../assets/scss/colors.scss";

  .disabled {
    cursor: default !important;
    color: transparent !important;
  }

  .check-line {
    display: flex;
    align-items: center;

    &__icon {
      color: $light-brown;
      font-size: 16px;
      cursor: pointer;
      transition: ease 0.1s;
    }

    &_green {
      color: $green-approve;
      transform: rotateY(360deg);
    }
  }

</style>
