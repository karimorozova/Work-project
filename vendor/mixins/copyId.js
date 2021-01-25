export default {
	methods: {
		async copyId(elementId) {
			let id = document.getElementById(elementId)
			let elementText = id.textContent
			await navigator.clipboard.writeText(elementText)
			try {
				document.execCommand('copy')
				this.alertToggle({
					message: "ID copied successfully",
					isShow: true,
					type: "success"
				})
			} catch (err) {
				this.alertToggle({
					message: "Text not copied",
					isShow: true,
					type: "error"
				})
			}
		}
	}
}