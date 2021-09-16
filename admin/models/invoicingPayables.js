const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InvoicingPayablesSchema = new mongoose.Schema({
	reportId: {
		type: String,
		default: '',
		trim: true
	},
	vendor: {
		type: Schema.Types.ObjectId,
		ref: 'Vendors'
	},
	status: {
		type: String,
		default: '',
		trim: true
	},
	steps: [{
		type: Schema.Types.ObjectId,
		ref: 'Projects.steps'
	}],
	firstPaymentDate: {
		type: Date,
		default: new Date()
	},
	lastPaymentDate: {
		type: Date,
		default: new Date()
	},
	paymentDetails: {
		paymentMethod: {
			type: String,
			default: ''
		},
		file: {
			type: Object,
			default: () => ({})
		},
		expectedPaymentDate: {
			type: Date
		},
	},
	paymentInformation: [{
		paidAmount: {
			type: Number,
		},
		unpaidAmount: {
			type: Number
		},
		paymentMethod: {
			type: String,
		},
		paymentDate: {
			type: Date,
			default: ''
		},
		notes: {
			type: String,
			default: ""
		}
	}],
	createdBy: {
		type: Schema.Types.ObjectId, ref: 'user'
	},
	updatedBy: {
		type: Schema.Types.ObjectId, ref: 'user'
	},
	createAt: {
		type: Date,
		default: new Date()
	},
	updatedAt: {
		type: Date,
		default: new Date()
	}
});

const InvoicingPayables = mongoose.model('InvoicingPayables', InvoicingPayablesSchema);

module.exports = InvoicingPayables;