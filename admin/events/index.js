const EventEmitter = require('events');
const emitter = new EventEmitter();
const { Vendors } = require('../models');
const { sendEmail, notifyManagerProjectStarts } = require('../utils');

emitter.on('testEvent', () => {
    setTimeout(async () => {
        try {
            const vendors = await Vendors.find();
            const message = 'Some message here';
            await sendEmail({to: vendors[0].email, subject: 'Just a test email'}, message);
            console.log('emitted');
        } catch(err) {
            console.log("Error from emitter testEvent");
            console.log(err);
        }
    }, 60000) 
});

emitter.on('managersNotificationEmail', async (project) => {
    try {
        await notifyManagerProjectStarts(project);
    } catch(err) {
        console.log("Error from emitter managersNotificationEmail");
        console.log(err);
    }
})

module.exports = { emitter };