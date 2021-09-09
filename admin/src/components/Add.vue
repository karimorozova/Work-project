<template lang="pug">
  .add-button(@click="click")
    .add-button__icon
      i.fas.fa-plus
</template>

<script>
	export default {
		methods: {
			click() {
				this.$emit("add")
			}
		}
	}
</script>

<style lang="scss" scoped>
  @import '../assets/scss/colors';

  .add-button {
    width: 25px;
    height: 25px;
    border: 1px solid $border;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 10px;
    transition: .2s ease-out;
    display: flex;
    justify-content: center;
    align-items: center;

    &:hover {
      .add-button__icon {
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
