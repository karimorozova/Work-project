const { managerNotifyMail } = require('../utils');
const { managerRequestAssignedMessage, managerRequestNotifyingMessage } = require('../emailMessages/internalCommunication');

async function clientRequestNotification(request, prop) {
    try {
        const msg = prop ? managerRequestAssignedMessage({...request._doc, user: request[prop]}) : managerRequestNotifyingMessage({...request._doc, user: request.accountManager});
        const messageId = prop ? "I005.0" : "I004.0";
        const subject = prop ? 
            `Request assigned: ${request.requestId} ${request.projectName} (${messageId})` 
            : `Client ${request.customer.name} has send a request (${messageId})`;
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

async function noitfyRequestCancelled(request) {
    try {
        const msg = requestCancelledMessage({...request._doc, user: request.accountManager});
        const subject = `Request cancelled (I004.1, ${request.requestId})`;
        await managerNotifyMail(request.accountManager, msg, subject);
    } catch(err) {
        console.log(err);
        console.log("Error in clientRequestNotification");
    }
}

module.exports = { clientRequestNotification, sendNotificationToManager, noitfyRequestCancelled }
