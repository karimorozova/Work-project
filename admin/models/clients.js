const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const contacts = {
	password: {
		type: String,
	},
	photo: {
		type: String,
	},
	firstName: {
		type: String,
		trim: true
	},
	surname: {
		type: String,
		trim: true
	},
	email: {
		type: String,
		trim: true
	},
	gender: {
		type: String,
		trim: true
	},
	position: {
		type: String,
		trim: true
	},
	phone: {
		type: String,
		trim: true
	},
	country: {
		type: String,
		trim: true
	},
	timezone: {
		type: String,
		default: ''
	},
	notes: {
		type: String,
	},
	leadContact: {
		type: Boolean,
		default: false
	}
}

const billingContacts = {}
for (let key in contacts) billingContacts[key] = contacts[key];

delete billingContacts.password
delete billingContacts.photo

const ClientSchema = new mongoose.Schema({
	name: {
		type: String,
		default: '',
		trim: true
	},
	officialCompanyName: {
		type: String,
		default: '',
		trim: true
	},
	clientType: {
		type: String,
		default: 'Company',
		trim: true
	},
	email: {
		type: String,
		trim: true
	},
	// aliases: {
	// 	type: Array,
	// 	default: []
	// },
	nativeLanguage: {
		type: Schema.Types.ObjectId, ref: 'Language',
	},
	defaultPricelist: {
		type: Schema.Types.ObjectId, ref: 'Pricelist',
	},
	currency: {
		type: String,
		default: 'EUR',
		trim: true,
	},
	minPrice: {
		type: Number,
		default: 0,
	},
	ignoreMinPrice: {
		type: Boolean,
		default: false
	},
	website: {
		type: String,
		default: '',
		trim: true
	},
	status: {
		type: String,
		default: '',
		trim: true
	},
	timeZone: {
		type: Schema.Types.ObjectId, ref: 'Timezones',
	},
	documents: {
		type: Array,
		default: []
	},
	accountManager: {
		type: Object,
		default: {}
	},
	salesManager: {
		type: Object,
		default: {}
	},
	projectManager: {
		type: Object,
		default: {}
	},
	leadSource: {
		type: String,
		default: '',
		trim: true
	},
	leadGeneration: {
		type: String,
		default: '',
		trim: true
	},
	salesStage: {
		type: String,
		default: '',
		trim: true
	},
	salesComission: {
		type: String,
		default: '',
		trim: true
	},
	isTest: {
		type: Boolean,
		default: false
	},
	paymentType: {
		type: String,
		trim: true,
	},
	billingInfo: [{
		officialName: {
			type: String,
			trim: true
		},
		paymentTerms: {
			type: Object,
			default: {}
		},
		address: {
			country: {
				type: String,
				trim: true,
			},
			street1: {
				type: String,
				trim: true,
			},
			street2: {
				type: String,
				trim: true,
			},
			city: {
				type: String,
				trim: true,
			},
			state: {
				type: String,
				trim: true,
			},
			zipCode: {
				type: String,
				trim: true,
			},
			vat: {
				type: String,
				default: ''
			},
		},
		notes: {
			type: String,
			trim: true,
		},
		reports: {
			type: Array,
			default: []
		},
		contacts: [billingContacts]
	}],
	// sourceLanguages: [{
	// 	type: Schema.Types.ObjectId, ref: 'Language'
	// }],
	// targetLanguages: [{
	// 	type: Schema.Types.ObjectId, ref: 'Language'
	// }],
	// industries: [
	// 	{ type: Schema.Types.ObjectId, ref: 'Industries' }
	// ],
	services: [{
		sourceLanguage: {
			type: Schema.Types.ObjectId, ref: 'Language',
		},
		targetLanguages: [
			{ type: Schema.Types.ObjectId, ref: 'Language', }
		],
		services: [
			{ type: Schema.Types.ObjectId, ref: 'Services', }
		],
		industries: [
			{ type: Schema.Types.ObjectId, ref: 'Industries', }
		]
	}],
	rates: {
		basicPricesTable: [{
			type: {
				type: String,
				trim: true
			},
			sourceLanguage: {
				type: Schema.Types.ObjectId, ref: 'Language',
			},
			targetLanguage: {
				type: Schema.Types.ObjectId, ref: 'Language',
			},
			basicPrice: {
				type: Number,
				default: 1,
			},
			altered: {
				type: Boolean,
				default: false,
			},
			notification: {
				type: String,
				default: '',
				trim: true
			},
			isActive: {
				type: Boolean,
				default: true,
			}
		}],
		stepMultipliersTable: [{
			step: {
				type: Schema.Types.ObjectId, ref: 'Step',
			},
			unit: {
				type: Schema.Types.ObjectId, ref: 'Units',
			},
			size: {
				type: Number,
			},
			multiplier: {
				type: Number,
				default: 100,
			},
			defaultSize: {
				type: Boolean,
				default: false
			},
			altered: {
				type: Boolean,
				default: false,
			},
			notification: {
				type: String,
				default: '',
				trim: true
			},
			isActive: {
				type: Boolean,
				default: true,
			}
		}],
		industryMultipliersTable: [{
			industry: {
				type: Schema.Types.ObjectId, ref: 'Industries',
			},
			multiplier: {
				type: Number,
				default: 100,
			},
			altered: {
				type: Boolean,
				default: false,
			},
			notification: {
				type: String,
				default: '',
				trim: true
			},
			isActive: {
				type: Boolean,
				default: true,
			}
		}],
		pricelistTable: [{
			sourceLanguage: {
				type: Schema.Types.ObjectId, ref: 'Language',
			},
			targetLanguage: {
				type: Schema.Types.ObjectId, ref: 'Language',
			},
			step: {
				type: Schema.Types.ObjectId, ref: 'Step',
			},
			unit: {
				type: Schema.Types.ObjectId, ref: 'Units',
			},
			size: {
				type: Number,
			},
			industry: {
				type: Schema.Types.ObjectId, ref: 'Industries',
			},
			price: {
				type: Number,
				default: 1
			},
			altered: {
				type: Boolean,
				default: false,
			},
			notification: {
				type: String,
				default: '',
				trim: true
			},
			isActive: {
				type: Boolean,
				default: true,
			}
		}]
	},
	contacts: [contacts],
	discounts: [{
		type: Schema.Types.ObjectId, ref: 'Discounts',
	}],
	matrix: {
		type: Object,
		default: {
			xTranslated: {
				text: 'X translated',
				rate: 10,
				altered: false,
				notification: ''
			},
			repeat: {
				text: "Repetition",
				rate: 20,
				altered: false,
				notification: ''
			},
			contextMatch: {
				text: "Context match",
				rate: 20,
				altered: false,
				notification: ''
			},
			repeat100: {
				text: "100%",
				rate: 20,
				altered: false,
				notification: ''
			},
			repeat50: {
				text: "50-74%",
				rate: 100,
				altered: false,
				notification: ''
			},
			repeat75: {
				text: "75-84%",
				rate: 80,
				altered: false,
				notification: ''
			},
			repeat85: {
				text: "85-94%",
				rate: 60,
				altered: false,
				notification: ''
			},
			repeat95: {
				text: "95-99%",
				rate: 25,
				altered: false,
				notification: ''
			},
			noMatch: {
				text: "No match",
				rate: 100,
				altered: false,
				notification: ''
			}
		}
	},
	otherInfo: {
		firstContactDate: {
			type: String,
			trim: true
		},
		firstQuoteDate: {
			type: String,
			trim: true
		},
		lastQuoteDate: {
			type: String,
			trim: true
		},
		firstProjectDate: {
			type: String,
			trim: true
		},
		lastProjectDate: {
			type: String,
			trim: true
		}
	},
	notes: [{
		user: {},
		createdAt: {
			type: Date,
			default: new Date()
		},
		updatedAT: {
			type: Date,
			default: new Date()
		},
		message: {
			type: String,
			default: ''
		}
	}],

}, { minimize: false });

ClientSchema.statics.authenticate = function (email, password, callback) {
	Clients.findOne({ "contacts.email": email })
			.exec((err, client) => {
				if(err) {
					return callback(err);
				} else if(!client) {
					const err = new Error('Client not found.');
					err.status = 401;
					return callback(err);
				}

				const contact = client.contacts.find((contact) => contact.email === email);
				bcrypt.compare(password, contact.password, function (err, result) {
					if(result === true || !contact.password) {
						return callback(null, { client, contact });
					} else {
						return callback();
					}
				});
			});
};

const Clients = mongoose.model('Clients', ClientSchema);

module.exports = Clients;
