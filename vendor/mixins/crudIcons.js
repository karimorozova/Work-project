export default {
	data() {
		return {
			icons: {
				save: {icon: require("../assets/images/Other/save-icon-qa-form.png")},
				edit: {icon: require("../assets/images/Other/edit-icon-qa.png")},
				cancel: {icon: require("../assets/images/cancel-icon.png")},
				delete: {icon: require("../assets/images/Other/delete-icon-qa-form.png")}
			},
		}
	},
	methods: {
		isActive(key, index) {
			if(this.currentActive === index) {
				return key !== "edit";
			}
			if(this.currentActive !== index) {
				return key !== "save" && key !== "cancel";
			}
		},
		isEditing() {
			this.errors = ["Please, finish current edition first."];
			this.areErrors = true;
		}
	}
}