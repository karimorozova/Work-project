const { Vendors, Pricelist } = require('../models')
const { getVendorAfterUpdate } = require('./getVendors')

const updateVendorMatrix = async (vendorId, newData) => {
	const { key, value } = newData
	const { matrix } = await Vendors.findOne({ _id: vendorId })
	if (matrix[key].rate !== Number(value)) {
		matrix[key].rate = Number(value)
		matrix[key].altered = true
		matrix[key].notification = 'Vendor\'s discount chart is different from related'
		return await getVendorAfterUpdate({ _id: vendorId }, { matrix })
	} else {
		return await getVendorAfterUpdate({ _id: vendorId }, {})
	}
}

const syncVendorMatrix = async (vendorId, dataKeyToSync) => {
	const { matrix } = await Vendors.findOne({ _id: vendorId.toString() })
	const { discountChart } = await Pricelist.findOne({ isVendorDefault: true })
	matrix[dataKeyToSync].altered = false
	matrix[dataKeyToSync].notification = ''
	matrix[dataKeyToSync].rate = discountChart[dataKeyToSync].rate
	return await getVendorAfterUpdate({ _id: vendorId }, { matrix })
}

module.exports = { updateVendorMatrix, syncVendorMatrix }
