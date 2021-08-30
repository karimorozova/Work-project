<template lang="pug">
  .toggler(:class="customClass")
    label.switch
      input.toggler__input(type="checkbox" :checked="isActive" :disabled="isDisabled" @change="toggle")
      span.slider
</template>

<script>
	export default {
		props: {
			isActive: {
				type: Boolean,
				default: false
			},
			isDisabled: {
				type: Boolean,
				default: true
			},
			customClass: {
				type: [ String, Object ]
			}
		},
		methods: {
			toggle() {
				this.$emit("toggle")
			}
		}
	}
</script>

<style scoped lang="scss">
  @import "../assets/scss/colors";

  .switch {
    position: relative;
    display: inline-block;
    width: 30px;
    height: 16px;
  }

  .switch .toggler__input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #3333;
    border-radius: 32px;
    transition: 0.2s ease-out;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 10px;
    width: 10px;
    left: 2px;
    bottom: 3px;
    background-color: white;
    border-radius: 50%;
    transition: 0.2s ease-out;
  }

  input.toggler__input:checked + .slider {
    background-color: $text;
  }

  input.toggler__input:checked + .slider:before {
    transform: translateX(16px);
  }

</style>
