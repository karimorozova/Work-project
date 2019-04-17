const { sendEmail } = require("../utils/mailTemplate");
const { vendorNotificationMessage, emailMessageForContact, messageForClient } = require("../utils/emailMessages");
const { getProject } = require("./getProjects");
const { getOneService } = require("../services/getServices");

async function notifyVendors(steps) {
    try {
        for(let step of steps) {
            if(step.vendor && (step.status === 'Cancelled' || step.status === 'Cancelled Halfway')) {
                const message = vendorNotificationMessage(step);
                step["to"] = step.vendor.email;
                step.subject = "Step cancelling notification!";
                await sendEmail(step, message);
            }
        }
    } catch(err) {
        console.log(err);
        console.log("Error in notifyVendors");
    }
}

async function getMessage(projectId, messageTarget) {
    let quote = await getQuoteInfo(projectId);
    const message = messageTarget === "quote" ? messageForClient(quote) : emailMessageForContact(quote);
    return message;
}

async function getQuoteInfo(projectId) {
    const project = await getProject({"_id": projectId});
    const service = await getOneService({"_id": project.tasks[0].service});
    let quote = {...project._doc, id: project.id};
    quote.service = service.title;
    const { contacts } = project.customer;
    quote.contact = contacts.find(item => item.leadContact);
    quote.firstName = quote.contact.firstName;
    quote.surame = quote.contact.surame;
    return quote;
}

module.exports = { notifyVendors, getMessage };