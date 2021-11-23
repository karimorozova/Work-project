export default {
	methods: {
		checkCombinations(first, second, third, value = { first: 10, second: 10, third: 10 }) {
			return (first <= value.first) && (second <= value.second) && (third <= value.third)
		}
	}
}