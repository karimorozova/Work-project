const { managerNotifyMail, managerRequestNotifyingMessage } = require('../utils');

async function clientRequestNotification(request, prop) {
    try {
        const msg = prop ? managerRequestNotifyingMessage({...request._doc, user: request[prop]}) : managerRequestNotifyingMessage({...request._doc, user: request.accountManager});
        const subject = "Client's request assignment notification";
        await managerNotifyMail(request.accountManager, msg, subject);
    } catch(err) {
        console.log(err);
        console.log("Error in clientRequestNotification");
    }
}

module.exports = { clientRequestNotification }
