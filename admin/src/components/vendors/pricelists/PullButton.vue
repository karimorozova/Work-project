<template lang="pug">
  .pull
    Button(value="Update information from Setting / Pricelist" @clicked="setInformation")

</template>

<script>
	import { mapActions } from "vuex"
	import Button from "../../Button"

	export default {
		components: { Button  },
		methods: {
			...mapActions({
				setUpClientProp: "setUpClientProp",
				alertToggle: "alertToggle",
				storeCurrentVendor: "storeCurrentVendor",


			}),
			async setInformation() {
				try {
					const updatedClient = await this.$http.post('/vendorsapi/updated-retest-from-settings', { vendorId: this.$route.params.id })
					await this.storeCurrentVendor(updatedClient.data)
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