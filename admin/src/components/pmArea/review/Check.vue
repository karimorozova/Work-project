<template lang="pug">
  .check-line
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
			}
		},
		methods: {
			toggleApproval() {
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

  .check-line {
    display: flex;
    align-items: center;

    &__icon {
      color: $light-brown;
      font-size: 18px;
      cursor: pointer;
      transition: ease 0.1s;
    }

    &_green {
      color: $green-approve;
      transform: rotateY(360deg);
    }
  }

</style>
