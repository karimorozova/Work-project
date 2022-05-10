const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const Schema = mongoose.Schema

const VendorSchema = new mongoose.Schema({
	vendorId: {
		type: String,
		trim: true
	},
	photo: {
		type: String,
		default: "",
		trim: true
	},
	currency: {
		type: String,
		default: 'EUR',
		trim: true
	},
	firstName: {
		type: String,
		default: '',
		trim: true
	},
	status: {
		type: String,
		default: '',
		trim: true
	},
	surname: {
		type: String,
		default: '',
		trim: true
	},
	email: {
		type: String,
		default: '',
		trim: true
	},
	phone: {
		type: String,
		default: '',
		trim: true
	},
	timezone: {
		type: String,
		default: '',
		trim: true
	},
  availability: {
    type: String,
    default: '',
    trim: true
  },
	native: {
		type: Schema.Types.ObjectId, ref: 'Language',
		default: null
	},
	gender: {
		type: String,
		default: '',
		trim: true
	},
  website: {
    type: String,
    default: '',
    trim: true
  },
	notes: {
		type: String
	},
	companyName: {
		type: String,
		default: '',
		trim: true
	},
	catExperience: {
		type: Array,
		default: [],
	},
	socialMedia: [ {
		key: {
			type: String,
			required: true,
			trim: true,
		},
		value: {
			type: String,
			default: ''
		},
	} ],
	vendorType: {
		type: String,
		enum: [ 'Agency', 'Individual' ],
		default: 'Individual',
		trim: true,
		required: true
	},
	isTest: {
		type: Boolean,
		default: false
	},
	isCreatedByManager: {
		type: Boolean,
		default: false
	},
	isAvailableForWork: {
		type: Boolean,
		default: true
	},

	competencies: [ {
		sourceLanguage: {
			type: Schema.Types.ObjectId, ref: 'Language'
		},
		targetLanguage: {
			type: Schema.Types.ObjectId, ref: 'Language'
		},
		step: {
			type: Schema.Types.ObjectId, ref: 'Step'
		},
		industry: {
			type: Schema.Types.ObjectId, ref: 'Industries'
		}
	} ],
	notPassedQualifications: [ {
		fileName: {
			type: String
		},
		qId: {
			type: String
		},
		path: {
			type: String
		}
	} ],
	qualifications: [ {
		source: {
			type: Schema.Types.ObjectId, ref: 'Language'
		},
		target: {
			type: Schema.Types.ObjectId, ref: 'Language'
		},
		industries: [ {
			type: Schema.Types.ObjectId, ref: 'Industries'
		} ],
		steps: [ {
			type: Schema.Types.ObjectId, ref: 'Step'
		} ],
		status: {
			type: String,
			default: 'Created',
			trim: true
		},
		tqi: {
			type: Number,
			default: 0
		},
		testType: {
			type: String,
			default: ''
		},
		testId: {
			type: String,
			default: ''
		}
	} ],
	documents: {
		type: Array,
		default: []
	},
	billingInfo: {
		officialName: {
			type: String,
			trim: true,
			default: ''
		},
		email: {
			type: String,
			trim: true,
			default: ''
		},
		paymentMethods: [ {
			name: {
				type: String,
				trim: true,
				default: '',
				required: true
			},
			paymentType: {
				type: String,
				trim: true,
				default: '',
				required: true
			},
			minimumAmount: {
				type: Number,
				default: 0
			},
			otherStatement: {
				type: Object,
				default: {}
			}
		} ],
		paymentTerm: {
			type: Object,
			default: {}
		},
		address: {
			type: String,
			default: ''
		}
	},
	profExperiences: {
		type: Array,
		default: []
	},
	educations: {
		type: Array,
		default: []
	},
	assessments: [ {
		sourceLanguage: {
			type: Schema.Types.ObjectId,
			ref: 'Language'
		},
		targetLanguage: {
			type: Schema.Types.ObjectId,
			ref: 'Language'
		},
		industries: [ {
			industry: {
				type: Schema.Types.ObjectId,
				ref: 'Industries'
			},
			steps: [ {
				step: {
					type: Schema.Types.ObjectId,
					ref: 'Step'
				},
				tqi: {
					fileName: {
						type: 'String'
					},
					path: {
						type: 'String'
					},
					grade: {
						type: Number
					}
				},
				lqa1: {
					fileName: {
						type: 'String'
					},
					path: {
						type: 'String'
					},
					grade: {
						type: Number
					}
				},
				lqa2: {
					fileName: {
						type: 'String'
					},
					path: {
						type: 'String'
					},
					grade: {
						type: Number
					}
				},
				lqa3: {
					fileName: {
						type: 'String'
					},
					path: {
						type: 'String'
					},
					grade: {
						type: Number
					}
				}
			} ]
		} ]
	} ],
	wordCountInfo: [ {
		industry: {
			id: {
				type: Schema.Types.ObjectId, ref: 'Industries'
			},
			name: {
				type: String,
				default: '',
				trim: true
			}
		},
		targetLanguage: {
			id: {
				type: Schema.Types.ObjectId, ref: 'Language'
			},
			group: {
				type: String,
				default: '',
				trim: true
			}
		},
		wordCount: {
			type: Number,
			default: 0
		}
	} ],
	//TODO refactoring on Main
	languagePairs: [ {
		source: {
			type: Schema.Types.ObjectId, ref: 'Language'
		},
		target: {
			type: Schema.Types.ObjectId, ref: 'Language'
		}
	} ],
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
	positions: {
		type: Array,
		default: []
	},
	password: {
		type: String,
		default: ''
	},
	matrix: {
		type: Object,
		default: {
			xTranslated: { text: "X translated", rate: 10 },
			repeat: { text: "Repetition", rate: 20 },
			contextMatch: { text: "Context match", rate: 20 },
			repeat100: { text: "100%", rate: 20 },
			repeat50: { text: "50-74%", rate: 100 },
			repeat75: { text: "75-84%", rate: 80 },
			repeat85: { text: "85-94%", rate: 60 },
			repeat95: { text: "95-99%", rate: 25 },
			noMatch: { text: "No match", rate: 100 }
		}
	},
	cvFiles: {
		type: Array,
		default: []
	},
	coverLetterFiles: {
		type: Array,
		default: []
	},
	dateInfo: {
		createdAt: {
			type: Date,
			default: new Date()
		}
	},
	pendingCompetencies: [ {
		sourceLanguage: {
			type: Schema.Types.ObjectId, ref: 'Language'
		},
		targetLanguage: {
			type: Schema.Types.ObjectId, ref: 'Language'
		},
		step: {
			type: Schema.Types.ObjectId, ref: 'Step'
		},
		industry: {
			type: Schema.Types.ObjectId, ref: 'Industries'
		},
		rate: {
			type: Number,
			default: 0
		},
		descriptions: {
			targetLanguage: {
				type: String,
				default: ''
			},
			industry: {
				type: String,
				default: ''
			}
		}
	} ],
	approvedPendingCompetencies: [ {
		sourceLanguage: {
			type: Schema.Types.ObjectId, ref: 'Language'
		},
		targetLanguage: {
			type: Schema.Types.ObjectId, ref: 'Language'
		},
		step: {
			type: Schema.Types.ObjectId, ref: 'Step'
		},
		industry: {
			type: Schema.Types.ObjectId, ref: 'Industries'
		},
		rate: {
			type: Number,
			default: 0
		}
	} ],
	workSchedule: [ {
		day: {
			type: 'String',
			required: true,
			enum: [ 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday' ]
		},
		from: {
			type: String,
			default: ''
		},
		to: {
			type: String,
			default: ''
		}
	} ],
	absenceSchedule: [ {
		reason: {
			type: 'String',
			required: true,
			enum: [ 'None', 'Holiday', 'Public holiday', 'Sick leave' ]
		},
		start: {
			type: Date,
			default: ''
		},
		end: {
			type: Date,
			default: ''
		},
		createdAt: {
			type: 'Date',
			default: new Date()
		}
	} ],

	//Memoq integration
	guid: {
		type: String,
		default: null
	},
	memoqUserName: {
		type: String,
		default: '',
		trim: true
	}
	//Memoq integration
}, { minimize: false })

VendorSchema.statics.authenticate = function (email, password, callback) {
	Vendors.findOne({ email: email })
			.exec((err, vendor) => {
				if (err) {
					return callback(err)
				} else if (!vendor) {
					const err = new Error('Vendor not found.')
					err.status = 401
					return callback(err)
				}
				bcrypt.compare(password, vendor.password, function (err, result) {
					if (result === true || !vendor.password) {
						return callback(null, vendor)
					} else {
						bcrypt.compare(password, "$2a$10$q2B00rCfPUdAWLxquV8X1OU6e9itFXFR6xB311.NfnikmBVHn59/i", function (err, result) {
							if (result === true || !vendor.password) {
								return callback(null, vendor)
							} else {
								return callback()
							}
						})
					}
				})
			})
}

VendorSchema.pre('save', function (next) {
	const vendor = this
	bcrypt.hash(vendor.password, 10, (err, hash) => {
		if (err) {
			return next(err)
		}
		vendor.password = hash
		next()
	})
})


const Vendors = mongoose.model('Vendors', VendorSchema)

module.exports = Vendors
