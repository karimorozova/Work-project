const { ClientRequest } = require('../models')

const getClientsRequestsForDashboard = async () => {
	return (await ClientRequest.find({status: {$in: ["Client Request", "Request Approved"]}}).populate('customer'))
}

module.exports = {getClientsRequestsForDashboard}