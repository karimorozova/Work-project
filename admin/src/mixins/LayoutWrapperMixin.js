import moment from "moment"

export default {
	methods: {
		dateFormat(date) {
			return moment(date).format('MMM D, HH:mm')
		},
		async replaceRoute(id, value) {
			let query = this.$route.query
			delete query[id]
			await this.$router.replace({ path: this.$route.path, query: { ...query, [id]: value } })
		},
		async removeQuery(id) {
			await this.replaceRoute(id, '')
		},
		async setSimpleValue(id, value) {
			await this.replaceRoute(id, value)
		},
		getSimpleValue(id) {
			return this.$route.query[id] || ''
		}
	}
}