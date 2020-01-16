const EventEmitter = require('events');
const emitter = new EventEmitter();
const { Vendors } = require('../models');
const { sendEmail, notifyManagerProjectStarts, notifyManagerProjectRejected } = require('../utils');

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

emitter.on('porjectApprovedNotification', async (project) => {
    try {
        await notifyManagerProjectStarts(project);
    } catch(err) {
        console.log("Error from emitter porjectApprovedNotification");
        console.log(err);
    }
})

emitter.on('porjectRejectedNotification', async (project) => {
    try {
        await notifyManagerProjectRejected(project);
    } catch(err) {
        console.log("Error from emitter porjectRejectedNotification");
        console.log(err);
    }
})

module.exports = { emitter };