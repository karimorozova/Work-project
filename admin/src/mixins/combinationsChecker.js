export default {
	methods: {
		checkCombinations(first, second, third, value = {first: 5, second: 5, third: 5 }) {
			return (first <= value.first) && (second <= value.second) && (third <= value.third)
		},
	},
}