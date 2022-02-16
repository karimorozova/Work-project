export default {
	methods: {
		currencyIconDetected(currencyStingCode) {
			switch (currencyStingCode) {
				case "EUR":
					return "&nbsp;&euro;&nbsp;";
				case "USD":
					return "&nbsp;&#36;&nbsp;";
				case "GBP":
					return "&nbsp;&pound;&nbsp;";
				default:
					return "&nbsp;&euro;&nbsp;";
			}
		}
	}
};
