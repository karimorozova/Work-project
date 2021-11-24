export default {
	methods: {
		getBgColor(_id) {
			const num = _id
					.split('')
					.reverse()
					.find(i => Number.parseInt(i))
					.toString()

			switch (num) {
				case '1':
				case '2':
					return 'black'
				case '3':
				case '4':
					return 'blue'
				case '5':
				case '6':
					return 'red'
				case '7':
				case '8':
					return 'green'
				case '9':
				case '0':
					return 'orange'
				default:
					return 'orange'
			}
		}
	}
}