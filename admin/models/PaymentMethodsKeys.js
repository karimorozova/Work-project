const mongoose = require('mongoose');

const PaymentMethodsKeySchema = new mongoose.Schema({
	key: {
		type: String,
		required: true,
		// unique: true,
	},
});

const PaymentMethodsKeys = mongoose.model('PaymentMethodsKey', PaymentMethodsKeySchema);

module.exports = PaymentMethodsKeys;
