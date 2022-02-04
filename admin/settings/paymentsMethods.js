const { PaymentMethods, PaymentMethodsKeys } = require('../models')


const getAllPaymentMethods = async (query = {}) => {
	return (await PaymentMethods.find(query).populate('keys'))
}

const createPaymentMethod = async ({ name, minimumAmount, isActive, keys }) => {
	await PaymentMethods.create({ name, minimumAmount, isActive, keys })
	return await getAllPaymentMethods()
}

const updatePaymentMethod = async (paymentId, { name, minimumAmount, isActive, keys }) => {
	await PaymentMethods.findByIdAndUpdate(paymentId, { name, minimumAmount, isActive, keys })
	return await getAllPaymentMethods()
}

const removePaymentMethod = async (paymentId) => {
	await PaymentMethods.findByIdAndDelete(paymentId)
	return await getAllPaymentMethods()
}


//================= PaymentMethodKeys =======================================================================

const getAllPaymentMethodsKeys = async (query = {}) => {
	return (await PaymentMethodsKeys.find(query))
}

const createPaymentMethodKeys = async (newData) => {
	await PaymentMethodsKeys.create(newData)
	return await getAllPaymentMethodsKeys()
}

const updatePaymentMethodKeys = async (paymentId, newData) => {
	await PaymentMethodsKeys.findByIdAndUpdate(paymentId, newData)
	return await getAllPaymentMethodsKeys()
}

const removePaymentMethodKeys = async (paymentId) => {
	await PaymentMethodsKeys.findByIdAndDelete(paymentId)
	return await getAllPaymentMethodsKeys()
}

module.exports = {
	getAllPaymentMethods,
	createPaymentMethod,
	updatePaymentMethod,
	removePaymentMethod,
	getAllPaymentMethodsKeys,
	createPaymentMethodKeys,
	updatePaymentMethodKeys,
	removePaymentMethodKeys
}