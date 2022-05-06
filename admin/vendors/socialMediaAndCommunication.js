const { Vendors } = require("../models")

const getVendorSocialMedia = async (_vendorId) => {
	return Vendors.findOne({ _id: _vendorId }, {
		socialMedia: 1
	})
}

const updateVendorSocialMediaValue = async (_vendorId, value) => {
	await Vendors.updateOne({ _id: _vendorId }, { socialMedia: value })
	return getVendorSocialMedia(_vendorId)
}

module.exports = {
	getVendorSocialMedia,
	updateVendorSocialMediaValue
}