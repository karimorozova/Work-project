const mongoose = require("mongoose")
const Schema = mongoose.Schema


const ClientsNotesSchema = new Schema({
  client: {
    type: Schema.Types.ObjectId,
    ref: 'Clients'
  },
  title:{
    type: String,
    default: '',
    trim: true,
  },
  details: {
    type: String,
    default: '',
    trim: true,
  },
  dateTime: {
    type: Date,
    default: new Date(),
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  associatedTo: [{
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
    password: {
      type: String,
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
    photo: {
      type: String,
    },
    whatsApp: {
      type: String,
      trim: true
    },
    skype: {
      type: String,
      trim: true
    },
    linkedIn: {
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
  }]
})

const ClientsNotes = mongoose.model('ClientsNotes', ClientsNotesSchema);

module.exports = ClientsNotes;
