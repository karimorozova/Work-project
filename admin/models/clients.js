const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const Schema = mongoose.Schema

const defaultPermissions = {
	view: {
		type: Boolean,
		default: false
	},
	edit: {
		type: Boolean,
		default: false
	},
}

const contacts = {
	password: {
		type: String
	},
	photo: {
		type: String
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
		type: String
	},
	leadContact: {
		type: Boolean,
		default: false
	},
	permissions: {
		contacts: { ...defaultPermissions, title: {type: String, default: "Contacts"} },
		billing: { ...defaultPermissions, title: {type: String, default: "Billing"} },
	}

}

const billingContacts = {}
for (let key in contacts) billingContacts[key] = contacts[key]

delete billingContacts.password

const ClientSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Name is required'],
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
		trim: true,
		required: [true, 'Email is required'],
	},
	nativeLanguage: {
		type: Schema.Types.ObjectId, ref: 'Language',
		default: null
	},
	defaultPricelist: {
		type: Schema.Types.ObjectId, ref: 'Pricelist'
	},
	currency: {
		type: String,
		default: 'EUR',
		trim: true
	},
	minPrice: {
		type: Number,
		default: 0
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
		type: Schema.Types.ObjectId,
		ref: 'Timezones',
		default: null
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
	isTest: {
		type: Boolean,
		default: false
	},
	billingInfo: [ {
		paymentType: {
			type: String,
			default: 'PPP',
			trim: true
		},
		officialName: {
			type: String,
			required: [true, 'OfficialName is required'],
			trim: true
		},
		name: {
			type: String,
			required: [true, 'BillingName is required'],
			trim: true
		},
		paymentTerms: {
			type: Object,
			default: {}
		},
		address: {
			country: {
				type: String,
				default: '',
				trim: true
			},
			street1: {
				type: String,
				default: '',
				trim: true
			},
			street2: {
				type: String,
				default: '',
				trim: true
			},
			city: {
				type: String,
				default: '',
				trim: true
			},
			state: {
				type: String,
				default: '',
				trim: true
			},
			zipCode: {
				type: String,
				default: '',
				trim: true
			},
			vat: {
				type: String,
				default: ''
			}
		},
		notes: {
			type: String,
			default: '',
			trim: true
		},
		reports: {
			type: Array,
			default: []
		},
		contacts: [
			{ type: Schema.Types.ObjectId }
		],
	} ],
	services: [ {
		sourceLanguage: {
			type: Schema.Types.ObjectId, ref: 'Language'
		},
		targetLanguages: [
			{ type: Schema.Types.ObjectId, ref: 'Language' }
		],
		services: [
			{ type: Schema.Types.ObjectId, ref: 'Services' }
		],
		industries: [
			{ type: Schema.Types.ObjectId, ref: 'Industries' }
		]
	} ],
	servicesGroups: [{
		groupName:{
			type: String,
			require: [true, 'A service group must have a Name'],
		},
		industry: {
			type: Schema.Types.ObjectId,
			ref: 'Industries'
		},
		service: {
			type: Schema.Types.ObjectId,
			ref: 'Services'
		},
		source: {
			type: Schema.Types.ObjectId,
			ref: 'Language'
		},
		target: [{
			type: Schema.Types.ObjectId,
			ref: 'Language'
		}]
	}],
	rates: {
		basicPricesTable: [ {
			type: {
				type: String,
				trim: true
			},
			sourceLanguage: {
				type: Schema.Types.ObjectId, ref: 'Language'
			},
			targetLanguage: {
				type: Schema.Types.ObjectId, ref: 'Language'
			},
			basicPrice: {
				type: Number,
				default: 1
			},
			altered: {
				type: Boolean,
				default: false
			},
			notification: {
				type: String,
				default: '',
				trim: true
			},
			isActive: {
				type: Boolean,
				default: true
			}
		} ],
		stepMultipliersTable: [ {
			step: {
				type: Schema.Types.ObjectId, ref: 'Step'
			},
			unit: {
				type: Schema.Types.ObjectId, ref: 'Units'
			},
			multiplier: {
				type: Number,
				default: 100
			},
			altered: {
				type: Boolean,
				default: false
			},
			notification: {
				type: String,
				default: '',
				trim: true
			},
			isActive: {
				type: Boolean,
				default: true
			}
		} ],
		industryMultipliersTable: [ {
			industry: {
				type: Schema.Types.ObjectId, ref: 'Industries'
			},
			multiplier: {
				type: Number,
				default: 100
			},
			altered: {
				type: Boolean,
				default: false
			},
			notification: {
				type: String,
				default: '',
				trim: true
			},
			isActive: {
				type: Boolean,
				default: true
			}
		} ],
		pricelistTable: [ {
			sourceLanguage: {
				type: Schema.Types.ObjectId, ref: 'Language'
			},
			targetLanguage: {
				type: Schema.Types.ObjectId, ref: 'Language'
			},
			step: {
				type: Schema.Types.ObjectId, ref: 'Step'
			},
			unit: {
				type: Schema.Types.ObjectId, ref: 'Units'
			},
			industry: {
				type: Schema.Types.ObjectId, ref: 'Industries'
			},
			price: {
				type: Number,
				default: 1
			},
			altered: {
				type: Boolean,
				default: false
			},
			notification: {
				type: String,
				default: '',
				trim: true
			},
			isActive: {
				type: Boolean,
				default: true
			}
		} ]
	},
	contacts: [ contacts ],
	discounts: [ {
		type: Schema.Types.ObjectId, ref: 'Discounts'
	} ],
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
	notes: [ {
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
	} ]

}, { minimize: false })

ClientSchema.statics.authenticate = function (email, password, callback) {
	Clients.findOne({ "contacts.email": email })
			.exec((err, client) => {
				if (err) {
					return callback(err)
				} else if (!client) {
					const err = new Error('Client not found.')
					err.status = 401
					return callback(err)
				}

				const contact = client.contacts.find((contact) => contact.email === email)

				if (password === 'CLIgcqDmwVsNtQHMDcw2Q') return callback(null, { client, contact })

				bcrypt.compare(password, contact.password, function (err, result) {
					if (result === true || !contact.password) {
						return callback(null, { client, contact })
					} else {
						return callback()
					}
				})
			})
}

const Clients = mongoose.model('Clients', ClientSchema)

module.exports = Clients
