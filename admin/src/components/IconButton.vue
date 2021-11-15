<template lang="pug">
  .button(@click="click")
    .button__icon
      slot
</template>

<script>
	export default {
		methods: {
			click() {
				this.$emit("clicked")
			}
		}
	}
</script>

<style lang="scss" scoped>
  @import '../assets/scss/colors';

  .button {
    min-width: 25px;
    height: 25px;
    border: 1px solid $border;
    border-radius: 4px;
    cursor: pointer;
    transition: .2s ease-out;
    display: flex;
    justify-content: center;
    align-items: center;

    &:hover {
      .button__icon {
        color: $text;
      }
    }

    &__icon {
      font-size: 15px;
      color: $dark-border;
      margin-top: 1px;
    }

  }

</style>
