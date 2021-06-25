export default {
	methods: {
		scrollToEnd() {
			const element = this.$el.querySelector('tbody')
			element.scrollTop = element.scrollHeight
		},
	},
}