const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DeliverySchema = new mongoose.Schema({
    projectId: { type: String, default: "", trim: true },
    tasks: [{
        isAssigned: { type: Boolean, default: false },
        manager: { type: Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, default: "", trim: true },
        pair: { type: String, default: "", trim: true },
        taskId: { type: String, default: "", trim: true },
        files: [{
            fileName: { type: String, default: "", trim: true },
            path: { type: String, default: "", trim: true },
            isFileApproved: { type: Boolean, default: false },
            isOriginal: { type: Boolean, default: false },
        }],
        instructions: [{
            text: { type: String, default: "", trim: true },
            isChecked: { type: Boolean, default: false }
        }],
    }]
});

const Delivery = mongoose.model('Delivery', DeliverySchema);

module.exports = Delivery;