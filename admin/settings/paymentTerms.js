const { PaymentTerms } = require('../models')

const getPaymentTerms = async () => await PaymentTerms.find()

const managePaymentTerms = async (data) => {
	const { _id, name, value, isActive } = data

	if (!!_id) await PaymentTerms.updateOne({ _id }, { name, value, isActive })
	else await PaymentTerms.create({ name, value, isActive })

	return await getPaymentTerms()
}

const deletePaymentTerms = async (_id) => {
	await PaymentTerms.deleteOne({ _id })
	return await getPaymentTerms()
}

module.exports = {
	getPaymentTerms,
	managePaymentTerms,
	deletePaymentTerms
}