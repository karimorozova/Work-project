const { Pricelist, Clients } = require("../models")

const createClient = async (client) => {
	const { discountChart } = await Pricelist.findOne({ _id: client.defaultPricelist })
	client.matrix = discountChart
	let result = await Clients.create(client)


	const contactIds = result.contacts.map(({_id}) => _id)

	const finalUpdate = await Clients.findByIdAndUpdate(result._id, { $set:  {"billingInfo.$[].contacts":  contactIds } } )
	return finalUpdate
}

module.exports = { createClient }