<template lang="pug">
  .check-line
    i.check-line__icon.fa.fa-check-circle(@click="click" :class="{'check-line_green': isApproved}")
</template>

<script>
	export default {
		props: {
			isApproved: {
				type: Boolean
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
