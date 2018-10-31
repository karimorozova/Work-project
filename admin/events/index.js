const EventEmitter = require('events');
const emitter = new EventEmitter();
const { Vendors } = require('../models');
const { sendEmail } = require('../utils');

emitter.on('testEvent', () => {
    setTimeout(async () => {
        const vendors = await Vendors.find();
        const message = 'Some message here';
        await sendEmail({to: vendors[0].email, subject: 'Just a test email'}, message);
        console.log('emitted');
    }, 60000) 
});

module.exports = { emitter };