<template lang="pug">
  .pull
    Button(value="Update information from Setting / Pricelist" @clicked="setInformation")

</template>

<script>
	import Button from "../../Button"
	import { mapActions } from "vuex"

	export default {
		components: { Button },
		methods: {
			...mapActions({
				setUpClientProp: "setUpClientProp",
				alertToggle: "alertToggle",

			}),
			async setInformation() {
				try {
					const updatedClient = await this.$http.post('/clientsapi/updated-retest-from-settings', { clientId: this.$route.params.id })
					this.setUpClientProp({ _id: this.$route.params.id, key: 'rates', value: updatedClient.data.rates })
					this.$emit("refreshResultTable")
					this.alertToggle({ message: "Rates Updated!", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Rates not Updated!", isShow: true, type: "error" })
				}
			}
		}
	}
</script>

<style lang="scss" scoped>

</style>