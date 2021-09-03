const mongoose = require('mongoose')

const terms = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true
	},
	value: {
		type: Number,
		required: true
	},
	isActive: {
		type: Boolean,
		required: true
	}
})

module.exports = mongoose.model('PaymentTerms', terms)
