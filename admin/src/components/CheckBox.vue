<template lang="pug">
  .checkbox(:class="customClass")
    .checkbox__brown
      img.checkbox__image(v-if="!isChecked" src="../assets/images/latest-version/checkbox-brown-0.png" @click.stop="check")
      img.checkbox__image(v-else src="../assets/images/latest-version/checkbox-brown-1.png" @click.stop="uncheck")
</template>

<script>
	export default {
		props: {
			isChecked: { type: Boolean },
			customClass: { type: String },
			isWhite: { type: Boolean, default: false }
		},
		methods: {
			check() {
				this.$emit('check')
			},
			uncheck() {
				this.$emit('uncheck')
			}
		}
	}
</script>

<style lang="scss" scoped>

  .checkbox {
    height: 19px;
    width: 19px;
  }

</style>
