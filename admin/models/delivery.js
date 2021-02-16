const mongoose = require("mongoose")
const Schema = mongoose.Schema

const DeliverySchema = new mongoose.Schema({
	projectId: {
		type: String,
		default: "",
		trim: true
	},
	comments: {
		dr1: {
			comment: {
				type: String,
				default: ''
			}
		},
		dr2: {
			comment: {
				type: String,
				default: ''
			}
		}
	},
	tasks: [
		{
			timestamp: {
				type: Date,
				default: new Date()
			},
			isAssigned: {
				type: Boolean,
				default: false
			},
			dr1Manager: {
				type: Schema.Types.ObjectId,
				ref: "User"
			},
			dr2Manager: {
				type: Schema.Types.ObjectId,
				ref: "User"
			},
			status: {
				type: String,
				default: "dr1",
				trim: true
			},
			pair: {
				type: String,
				default: "",
				trim: true
			},
			taskId: {
				type: String,
				default: "",
				trim: true
			},
			files: [
				{
					fileName: {
						type: String,
						default: "",
						trim: true
					},
					path: {
						type: String,
						default: "",
						trim: true
					},
					isFileApproved: {
						type: Boolean,
						default: false
					},
					isOriginal: {
						type: Boolean,
						default: false
					}
				}
			],
			instructions: [
				{
					step: {
						type: String,
						default: "dr1",
						trim: true
					},
					title: {
						type: String,
						default: "",
						trim: true
					},
					text: {
						type: String,
						default: "",
						trim: true
					},
					isChecked: {
						type: Boolean,
						default: false
					},
					isNotRelevant: {
						type: Boolean,
						default: false
					}
				}
			]
		}
	]
})

const Delivery = mongoose.model("Delivery", DeliverySchema)

module.exports = Delivery
