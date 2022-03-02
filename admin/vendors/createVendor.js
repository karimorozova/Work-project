const { Pricelist, Vendors, PaymentTerms } = require("../models")

const createVendor = async (vendor) => {
	const paymentTerms = await PaymentTerms.findOne({ name: '30 Days' })
	const lastIndex = await Vendors.findOne().sort({ 'vendorId': -1 }) || false
	let lastIntIndex = !lastIndex
			? 0
			: lastIndex.toJSON().hasOwnProperty('vendorId')
					? parseInt(lastIndex.vendorId.split('_').pop())
					: 0

	const { discountChart } = await Pricelist.findOne({ isVendorDefault: true })

	const { email, firstName, surname, gender, native, phone, skype, status, timezone, isTest, isCreatedByManager } = vendor

	const vendorForSave = {
		matrix: { ...discountChart },
		vendorId: 'VEN_' + (++lastIntIndex + '').padStart(6, "0"),
		email,
		firstName,
		surname,
		gender: gender || '',
		native: native || null,
		phone: phone || '',
		skype: skype || '',
		status: status || '',
		timezone: timezone || '',
		isTest: isTest || false,
		isCreatedByManager: isCreatedByManager || false,
		password: '$2y$10$BD5uiSRNnKwFo4fJYHDarub7qV8F/ZlaC8kHlEAW8cmyn7bIThKL6',
		billingInfo: {
			officialName: `${ firstName } ${ surname }`,
			email,
			paymentMethod: [],
			address: "",
			paymentTerm: paymentTerms
		},
		...vendor
	}

	try {
		return await Vendors.create(vendorForSave)
	} catch (err) {
		console.log(err, 'On creating vendor')
	}
}

module.exports = {
	createVendor
}