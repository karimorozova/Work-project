<template lang="pug">
  .buttons
    .buttons__button
      Button(value="Save" @clicked="save")
    .buttons__button
      Button(value="Cancel" @clicked="cancel")
</template>

<script>
	import Button from "../../../components/overall/Button"

	export default {
		data() {
			return {}
		},
		methods: {
			save() {
				this.$emit("save")
			},
			cancel() {
				this.$router.push('/dashboard')
			}
		},
		components: {
			Button
		}
	}
</script>

<style lang="scss" scoped>
  .buttons {
    display: flex;

    &__button {
      margin-left: 20px;
    }
  }
</style>
