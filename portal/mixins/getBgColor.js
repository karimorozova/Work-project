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
					return [ '#eceff1', '#cfd8dc' ]
				case '3':
				case '4':
					return [ '#e8f5e9', '#c8e6c9' ]
				case '5':
				case '6':
					return [ '#fbe9e7', '#ffccbc' ]
				case '7':
				case '8':
					return [ '#fff8e1', '#ffe082' ]
				case '9':
				case '0':
					return [ '#efebe9', '#d7ccc8' ]
				default:
					return [ '#efebe9', '#d7ccc8' ]
			}
		}
	}
}