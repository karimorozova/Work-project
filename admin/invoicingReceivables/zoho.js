const axios = require("axios")
const { Zoho } = require("../models")

const baseUrl = 'https://books.zoho.com/api/v3/'
const organizationId = '630935724'

async function getCurrentToken() {
	try {
		const token = await Zoho.findOne();
		return token.access_token;
	} catch(err) {
		console.log(err);
		console.log("Error on getCurrentToken ZOHO from DB")
	}
}


const zohoRequest = async (link, data, method = "GET") => {
	try {
		const token = await getCurrentToken()
		return (await axios({
			headers: { 'Authorization': `Bearer  ${ token }` },
			method,
			url: baseUrl + link,
			data
		}))
	} catch (e) {
		console.log(e)
	}
}

const getCustomer = async (companyName) => {
  const customer = await zohoRequest(`contacts?organization_id=${ organizationId }&contact_name=${companyName}`,)
	return customer.data.contacts[0].contact_id
}

const createZohoInvoice = async (companyName) => {
	const data  = {
		customer_id: await getCustomer(companyName),
		line_items: {
			item_id: 658416846
		}
	}
	console.log( await getCustomer(companyName))

	// const customer = await zohoRequest('invoices?organization_id=' + organizationId, data, "POST")
}


module.exports = {
	createZohoInvoice
}
