const { managerNotifyMail } = require('../utils');
const { managerRequestNotifyingMessage } = require('../emailMessages/internalCommunication');

async function clientRequestNotification(request, prop) {
    try {
        const msg = prop ? managerRequestNotifyingMessage({...request._doc, user: request[prop]}) : managerRequestNotifyingMessage({...request._doc, user: request.accountManager});
        const subject = "Client's request assignment notification";
        const manager = prop ? request[prop] : request.accountManager;
        await managerNotifyMail(manager, msg, subject);
    } catch(err) {
        console.log(err);
        console.log("Error in clientRequestNotification");
    }
}

async function sendNotificationToManager(request, prop) {
    try {
        if(prop === 'isAssigned') {
            return request.isAssigned ? await clientRequestNotification(request, 'projectManager') : await clientRequestNotification(request, 'accountManager');
        }
        await await clientRequestNotification(request, prop);
    } catch(err) {
        console.log(err);
        console.log("Error in sendNotificationToManager");
    }
}

module.exports = { clientRequestNotification, sendNotificationToManager }
