const { ClientRequest } = require("../models");
const { getClientRequest } = require("./get");
const moment = require("moment");

async function createRequest(request) {
    let todayStart = new Date();
    todayStart.setUTCHours(0,0,0,0);
    let todayEnd = new Date(todayStart);
    todayEnd.setUTCHours(23,59,59,0);
    try {
        const todaysRequests = await ClientRequest.find({"createdAt" : { $gte : todayStart, $lt: todayEnd }});
        const nextNumber = (todaysRequests.length < 10) ? '[0' + (todaysRequests.length + 1) + ']': '[' + (todaysRequests.length + 1) + ']';
        request.status = "Requested";
        request.requestId = moment(new Date()).format("YYYY MM DD") + ' ' + nextNumber;
        const createdRequest = await ClientRequest.create(request);
        return await getClientRequest({"_id": createdRequest.id});
    } catch(err) {
        console.log(err);
        console.log('Error in createRequest');
    }
}

module.exports = { createRequest };