export default {
	methods: {
		async vatChecker({ newClient }) {
			const entity = newClient ? this.client : this.currentClient
			if (entity.billingInfo.vat) {
				// if (!entity.billingInfo.vatId) {
				// 	this.errors.push("Please, add VAT ID.")
				// 	this.billErrors.push("vatId")
				// } else {
				try {
					let result = await this.$http.get("/clientsapi/clients-every")
					const clientVatIds = result.data
							.filter(({ _id }) => _id.toString() !== (this.$route.params.id).toString())
							.map(({ billingInfo }) => billingInfo.vatId
							)
					if (clientVatIds.includes(entity.billingInfo.vatId)) {
						this.errors.push("Please, add unique VAT ID.")
						this.billErrors.push("vatId")
					}
				} catch (err) {
					this.alertToggle({
						message: "Error on all Clients info",
						isShow: true,
						type: "error"
					})
				}
				// }
			}
		}
	}
}
