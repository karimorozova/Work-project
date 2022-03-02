const mongoose = require('mongoose')
const Schema = mongoose.Schema

const InvoiceSchema = new mongoose.Schema({
	customer: {
		type: Schema.Types.ObjectId,
		ref: 'Clients',
		default: null,
	},
	clientBillingInfo: {
		type: Schema.Types.ObjectId,
		default: null,
	},
	status: {
		type: String,
		enum: [ 'Draft', 'Ready', 'Sent', 'Paid', 'Partially Paid', 'Overdue', 'Void' ],
		default: 'Draft'
	},
	// reports: [{
	// 	type: Schema.Types.ObjectId,
	// 	ref: 'Reports'
	// }],
	items: [{
		title: {
			type: String,
		},
		amount: {
			type: Number,
		},

		type:{
			type: String,
			enum: [ 'Report', 'Custom' ],
		},
		reportId: {
			type: Schema.Types.ObjectId,
			default: null,
		}

		// quantity: {
		// 	type: Number,
		// },
		// rate: {
		// 	type: Number,
		// },
		// tax: {
		// 	type: Number,
		// },
	}]
})

const Invoice = mongoose.model('Invoice', InvoiceSchema)

module.exports = Invoice