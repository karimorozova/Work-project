<template lang="pug">
  .custom-radio(@click.stop="toggle")
    .custom-radio__inside-circle(:class="{'custom-radio_checked': isChecked}")
</template>

<script>
	export default {
		props: {
			isChecked: {
				type: Boolean,
				default: false
			}
		},
		methods: {
			toggle() {
				this.$emit('toggleRadio')
			}
		}
	}
</script>

<style lang="scss" scoped>
  @import "../assets/scss/colors.scss";

  .custom-radio {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 1px solid $border;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    background-color: white;

    &__inside-circle {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    &_checked {
      background-color: $border-focus;
    }
  }

</style>
