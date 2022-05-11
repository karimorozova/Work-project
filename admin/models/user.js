const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const Schema = mongoose.Schema

// type: String,
// unique: true,
// required: true,
// trim: true


// username: {
// 	type: String,
// 			unique: true,
// 			required: true,
// 			trim: true
// },
// gender: {
// 	type: String,
// 			trim: true
// },
// phone: {
// 	type: String,
// default: "",
// 			trim: true
// },

const UserSchema = new mongoose.Schema({
	email: {
		type: String,
		unique: true,
		required: true,
		trim: true
	},
	password: {
		type: String,
		required: true,
		trim: true
	},
	group: {
		type: Schema.Types.ObjectId, ref: 'Group'
	},
	firstName: {
		type: String,
		trim: true
	},
	lastName: {
		type: String,
		trim: true
	},
	position: {
		type: String,
		trim: true
	},
	isActive: {
		type: Boolean,
		default: true
	},
	photo: {
		type: String,
		default: "",
		trim: true
	},
	layoutsSettings: {
		project: {
			filters: {
				type: Array,
				default: [
					"projectId",
					"startDate",
					"sourceLanguages",
					"projectManager",
					"clientName",
					"tasksStatuses",
					"projectName",
					"deadline",
					"targetLanguages",
					"accountManger",
					"industry",
					"isTest"
				]
			},
			fields: {
				type: Array,
				default: [
					"projectId",
					"projectName",
					"clientName",
					"status",
					"progress",
					"languages",
					"startDate",
					"deadline",
					"isTest",
					"payables",
					"receivables",
					"margin"
				]
			},
			sorting: {
				type: Array,
				default: []
			},
			presets: {
				type: Array,
				default: []
			}
		},
		"receivables-reports-steps": {
			project: {
				filters: {
					type: Array,
					default: []
				},
				fields: {
					type: Array,
					default: []
				},
				sorting: {
					type: Array,
					default: []
				},
				presets: {
					type: Array,
					default: []
				}
			}
		},
		vendor: {
			project: {
				filters: {
					type: Array,
					default: []
				},
				fields: {
					type: Array,
					default: []
				},
				sorting: {
					type: Array,
					default: []
				},
				presets: {
					type: Array,
					default: []
				}
			}
		}
	}

}, { minimize: false })

UserSchema.statics.authenticate = function (email, password, callback) {
	User.findOne({ email: email }).populate("group").lean()
			.exec((err, user) => {
				if (err) {
					return callback(err)
				} else if (!user) {
					const err = new Error('User not found.')
					err.status = 401
					return callback(err)
				}
				bcrypt.compare(password, user.password, function (err, result) {
					if (result === true) {
						return callback(null, user)
					} else {
						return callback()
					}
				})
			})
}

UserSchema.pre('save', function (next) {
	const user = this
	bcrypt.hash(user.password, 10, (err, hash) => {
		if (err) {
			return next(err)
		}
		user.password = hash
		next()
	})
})

const User = mongoose.model('User', UserSchema)

module.exports = User