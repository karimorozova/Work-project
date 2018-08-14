const mongoose = require('mongoose');

const TimezoneSchema = new mongoose.Schema({
    zone: { 
        type : String, 
        default : '', 
        trim : true 
    }    
});

const Timezones = mongoose.model('Timezones', TimezoneSchema);

module.exports = Timezones;