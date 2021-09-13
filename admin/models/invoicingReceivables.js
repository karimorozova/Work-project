const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InvoicingReceivablesSchema = new mongoose.Schema({
	reportId: {
		type: String,
		default: '',
		trim: true
	},
	invoiceId: {
		type: String,
		default: '',
		trim: true
	},
	clientId: {
		type: Schema.Types.ObjectId,
		ref: 'Clients'
	},
	status: {
		type: String,
		default: '',
		trim: true
	},
	tasks: [{
		type: Schema.Types.ObjectId,
		ref: 'Projects.tasks'
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
		// file: {
		// 	type: Object,
		// 	default: () => ({})
		// },
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
			default: new Date()
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

const InvoicingReceivables = mongoose.model('InvoicingReceivables', InvoicingReceivablesSchema);

module.exports = InvoicingReceivables;