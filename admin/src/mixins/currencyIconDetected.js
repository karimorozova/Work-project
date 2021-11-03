export default {
	methods: {
		returnIconCurrencyByStringCode(currencyStingCode) {
			switch (currencyStingCode) {
				case "EUR":
					return "<span>&euro;</span>";
				case "USD":
					return "<span>&#36;</span>";
				case "GBP":
					return "<span>&pound;</span>";
				default:
					return "<span>&euro;</span>";
			}
		}
	}
};
