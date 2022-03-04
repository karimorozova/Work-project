export default {
	data() {
		return {
			isFilterActive: false
		}
	},
	methods: {
		clearFilters() {
			this.$router.replace({ 'query': null }).catch((err) => err)
			this.defaultSetter()
		},
		toggleFilters() {
			this.isFilterActive = !this.isFilterActive
		}
	}
}