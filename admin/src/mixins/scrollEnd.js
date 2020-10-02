export default {
	methods: {
		scrollToEnd() {
			const element = this.$el.querySelector('.table__tbody')
			element.scrollTop = element.scrollHeight
		},
	},
}