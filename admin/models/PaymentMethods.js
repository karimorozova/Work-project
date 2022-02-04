const mongoose = require('mongoose');
const { Schema } = require("mongoose")

const PaymentMethodsSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	minimumAmount: {
		type: Number,
		required: true
	},
	isActive: {
		type: Boolean,
		default: false
	},
	keys: [{
		type: Schema.Types.ObjectId,
		ref: 'PaymentMethodsKey',
		default: null
	}]

});

const PaymentMethods = mongoose.model('PaymentMethods', PaymentMethodsSchema);

module.exports = PaymentMethods;
