const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClientsApiSettingSchema = new mongoose.Schema({
  logo: {
    type: String,
    default: '',
  },
  affiliation: {
    type: String,
    default: 'Input',
  },
  clientName: {
    type: String,
    default: '',
  },
  industry : [{
    type: Schema.Types.ObjectId,
    ref: "Industries",
  }],
  isDisplay: {
    type: Boolean,
    default: false,
  },
});

const ClientsApiSetting = mongoose.model('ClientsApiSetting', ClientsApiSettingSchema);

module.exports = ClientsApiSetting;
