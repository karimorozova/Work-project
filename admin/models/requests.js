const mongoose = require('mongoose');

const USD = {
	type: Number,
	default: 0
}
const EUR = {
	type: Number,
	default: 0
}
const GBP = {
	type: Number,
	default: 0
}

const RequestSchema = new mongoose.Schema({
	projectName: {
		type: String,
		default: '',
		trim: true
	},
	isUrgent: {
		type: Boolean,
		default: false
	},
	clientContacts: [],
	paymentProfile: {
		type: String,
		default: '',
		trim: true
	},
	startDate: {
		type: Date,
		default: Date.now
	},
	deadline: {
		type: Date,
		default: Date.now
	},
	industry: {
		type: Schema.Types.ObjectId, ref: 'Industries'
	},
	tasks: {
		type: Array,
		default: []
	},
	steps: [ {
		vendor: { type: Schema.Types.ObjectId, ref: 'Vendors' },
		stepId: '',
		taskId: "",
		serviceStep: {
			step: { type: Schema.Types.ObjectId, ref: 'Step' },
			unit: { type: Schema.Types.ObjectId, ref: 'Units' },
			size: {
				type: Number,
				default: 1
			},
			memoqAssignmentRole: {
				type: Number
			},
			title: {
				type: String,
				trim: true
			}
		},
		name: "",
		sourceLanguage: "",
		targetLanguage: "",
		memoqProjectId: "",
		memoqSource: "",
		memoqTarget: "",
		memoqDocIds: [],
		packageSize: "",
		hours: "",
		quantity: "",
		size: {
			type: Number,
			default: 1
		},
		totalWords: "",
		start: {},
		deadline: {},
		progress: "",
		status: "",
		clientRate: {},
		targetFile: "",
		finance: stepFinance,
		nativeFinance: stepFinance,
		defaultStepPrice: 0,
		vendorRate: "",
		nativeVendorRate: "",
		// check: false,
		vendorsClickedOffer: Array,
		isVendorRead: { type: Boolean, default: false },
		previousStatus: ""
	} ],
	customer: {
		type: Schema.Types.ObjectId, ref: 'Clients'
	},
	projectManager: {
		type: Schema.Types.ObjectId, ref: 'User'
	},
	accountManager: {
		type: Schema.Types.ObjectId, ref: 'User'
	},
	status: {
		type: String,
		default: '',
		trim: true
	},
	brief: {
		type: String,
		default: ''
	},
	notes: {
		type: String,
		default: ''
	},
	finance: {
		type: Object,
		default: {
			'Wordcount': {},
			'Price': {}
		}
	},
	minimumCharge: {
		value: {
			type: Number,
			default: 0
		},
		toIgnore: {
			type: Boolean,
			default: false
		}
	},
	projectCurrency: {
		type: String,
		default: ''
	},
	crossRate: {
		EUR: {
			EUR,
			USD,
			GBP
		},
		USD: {
			USD,
			EUR,
			GBP
		},
		GBP: {
			GBP,
			USD,
			EUR
		}
	}

//   typeOfRequest: {
//     type: String,
//     default: '',
//     trim: true
//   },
//   projectName: {
//     type: String,
//     default: '',
//     trim: true
//   },
//   date: {
//     type: Date,
//     default: Date.now
//   },
//   contactName: {
//     type: String,
//     default: '',
//     trim: true
//   },
//   industry: {
//     type: Object,
//     default: null,
//     trim: true
//   },
//   contactEmail: {
//     type: String,
//     default: '',
//     trim: true
//   },
//   web: {
//     type: String,
//     default: '',
//     trim: true
//   },
//   skype: {
//     type: String,
//     default: '',
//     trim: true
//   },
//   phone: {
//     type: String,
//     default: '',
//     trim: true
//   },
//   service: {
//     type: Object,
//     default: null,
//     trim: true
//   },
//   status: {
//     type: String,
//     default: '',
//     trim: true
//   },
//   accountManager: {
//     type: String,
//     default: 'Non selected',
//     trim: true
//   },
//   companyName: {
//     type: String,
//     default: '',
//     trim: true
//   },
//   sourceLanguage: {
//     type: Object,
//     default: null,
//     trim: true
//   },
//   targetLanguages: {
//     type: Array,
//     default: [],
//     trim: true
//   },
//   brief: {
//     type: String,
//     default: ''
//   },
//   detailFiles: {
//     type: Array,
//     default: [],
//     trim: true
//   },
//   refFiles: {
//     type: Array,
//     default: [],
//     trim: true
//   },
//   jsession: {
//     type: String,
//     default: ""
//   },
//   genBrief: {
//     type: String,
//     default: ""
//   }
});
//
// RequestSchema.methods.targetLangName = function targetLangName() {
//   var res = [];
//   for (var i = 0; i < this.targetLanguages.length; i++) {
//     res.push({
//       "name": this.targetLanguages[i].lang
//     });
//   }
//   return res;
// }
//
// RequestSchema.methods.targetArray = function targetArray() {
//   var res = [];
//   for(var i = 0; i < this.targetLanguages.length; i++ )
//   {
//       res.push(this.targetLanguages[i].xtrf);
//   }
//   return res;
// }
//
// RequestSchema.methods.sourceLangName = function sourceLangName() {
//   return {
//     "name": this.sourceLanguage.lang
//   };
// }
//
// RequestSchema.methods.deadline = function deadline() {
//   return this.date.getTime();
// }
//
// const Requests = mongoose.model('Requests', RequestSchema);

module.exports = Requests;
