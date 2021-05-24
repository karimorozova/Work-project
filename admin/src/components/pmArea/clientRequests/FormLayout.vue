<template lang="pug">
  .form-layout
    | FORM
</template>

<script>
	import { mapGetters, mapActions } from "vuex"

	export default {
		data() {
			return {
				clientRequest: {}
			}
		},
		computed: {
			...mapGetters({
				currentClientRequest: "getCurrentClientRequest"
			})
		},
		components: {}
	}
</script>

<style scoped lang="scss"></style>
