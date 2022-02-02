const mongoose = require('mongoose')

const CancelReasonSchema = new mongoose.Schema({
	value: {
		type: Number,
		required: [ true, "Please enter amount" ],
		default: 0
	}
})

module.exports = mongoose.model('VendorPaymentBenchmark', CancelReasonSchema)
