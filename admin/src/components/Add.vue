<template lang="pug">
  .add-button(:class="{'mt10': isDefaultMargin}" @click="click")
    .add-button__icon
      i.fas.fa-plus
</template>

<script>
	export default {
    props: {
      isDefaultMargin: {
        type: Boolean,
        default: true
      }
    },
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
    transition: .2s ease-out;
    display: flex;
    justify-content: center;
    align-items: center;

    &.mt10 {
      margin-top: 10px;
    }

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
