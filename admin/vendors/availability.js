const { Vendors } = require("../models")

const getVendorAvailability = async (_vendorId) => {
	return Vendors.findOne({ _id: _vendorId }, {
		workSchedule: 1,
		isAvailableForWork: 1,
		timezone: 1,
		absenceSchedule: 1
	})
}

const updateVendorAvailability = async (_vendorId, { prop, value }) => {
	await Vendors.updateOne({ _id: _vendorId }, { $set: { [prop]: value } })
	return getVendorAvailability(_vendorId)
}

module.exports = {
	getVendorAvailability,
	updateVendorAvailability
}
