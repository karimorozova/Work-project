export default {
	data() {
		return {
			icons: {
				save: { icon: require("../assets/images/latest-version/i-save.png") },
				edit: { icon: require("../assets/images/latest-version/i-edit.png") },
				cancel: { icon: require("../assets/images/latest-version/i-cancel.png") },
				delete: { icon: require("../assets/images/latest-version/i-delete.png") }
			}
		}
	},
	methods: {
		isActive(key, index) {
			if (this.currentActive === index) {
				return key !== "edit"
			}
			if (this.currentActive !== index) {
				return key !== "save" && key !== "cancel"
			}
		},
		isEditing() {
			this.errors = [ "Please, finish current edition first." ]
			this.areErrors = true
		}
	}
}