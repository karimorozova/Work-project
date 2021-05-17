const { ClientsApiSetting } = require('../models/')

/**
 *
 * @param {Object} obj - query for searching needed client
 * @returns {Object} returns client with populated(fullfilled) rows
 */
async function getClientsApi(obj) {
	return await ClientsApiSetting.find(obj)
			.populate('industry', [ 'name', 'icon' ])
}



module.exports = {
	getClientsApi,
}