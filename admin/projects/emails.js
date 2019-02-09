const { sendEmail } = require("../utils/mailTemplate");
const { vendorNotificationMessage } = require("../utils/emailMessages");

async function notifyVendors(steps) {
    try {
        for(let step of steps) {
            if(step.vendor) {
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

module.exports = { notifyVendors };