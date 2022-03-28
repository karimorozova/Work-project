const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CompanySchema = new Schema({
	logo: {
		type: String,
		trim: true,
		required: true
	},
	companyName: {
		type: String,
		trim: true,
		required: true
	},
	officialCompanyName: {
		type: String,
		trim: true,
		required: true
	},
	financeEmail: {
		type: String,
		required: true
	},
	website: {
		type: String,
	},
	phone: {
		type: String,
	},
	timeZone: {
		type: String,
	},
	mainCurrency: {
		type: String,
		enum: [ 'USD', 'EUR', 'GBP', 'Invoice on-hold', 'Invoice Ready', 'Partially Paid', 'Paid' ],
	},
	companyId: {
		type: String,
	},
	taxId: {
		type: String,
	},
	isActive: {
		type: Boolean,
		default: true
	},
	isDefault: {
		type: Boolean,
		default: true
	},

	country: {
		type: String,
		trim: true,
		required: true
	},

	city: {
		type: String,
		trim: true,
		required: true
	},
	state: {
		type: String,
		trim: true,
		required: true
	},
	address: {
		type: String,
		trim: true,
		required: true
	},
	postCode: {
		type: String,
		trim: true,
		required: true
	},
	vat: {
		type: String,
	},
	paymentMethods: {
		name: {
			type: String,
			trim: true,
			required: true
		},
		paymentType: {
			type: Schema.Types.ObjectId,
			ref: 'PaymentMethods'
		},
		otherStatement: {
			type: Object,
			default: {}
		}
	}
});

const Company = mongoose.model('Company', CompanySchema);

module.exports = Company;
