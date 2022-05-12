const { Vendors } = require("../models")


module.exports = getLayoutVendors = async ({ query = {}, sort = {}, options = {}, countToSkip = 0, countToGet = 50 }) => {

	const vendors = Vendors.find()

	return vendors
}
