export default {
	methods: {
		currencyIconDetected(currencyStingCode) {
			switch (currencyStingCode) {
				case "EUR":
					return "&euro;"
				case "USD":
					return "&#36;"
				case "GBP":
					return "&pound;"
				default:
					return "&euro;"
			}
		}
	}
}
