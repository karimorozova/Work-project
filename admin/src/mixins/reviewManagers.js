export default {
	methods: {
		async getManagers() {
			try {
				const groups = [ "Project Managers", "Account Managers", 'Administrators' ]
				const result = await this.$http.get("/users")
				this.managers = result.body.filter(item => groups.indexOf(item.group.name) !== -1)
			} catch (err) {
				this.alertToggle({ message: "Error on getting managers", isShow: true, type: "error" })
			}
		}
	},
	computed: {
		managersNames() {
			let result = []
			if (this.managers.length) {
				result = this.managers.map(item => {
					const position = item.group.name === "Account Managers" ? "[AM]" : item.group.name === "Project Managers" ? "[PM]" : "[ADMIN]"
					return `${ item.firstName } ${ item.lastName } ${ position }`
				})
			}
			return result
		}
	}
}