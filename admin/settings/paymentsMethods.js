const { PaymentMethods, PaymentMethodsKeys } = require('../models')


const getAllPaymentMethods = async (query = {}) => {
	return (await PaymentMethods.find(query))
}

const createPaymentMethod = async (newData) => {
	await PaymentMethods.create(newData)
	return await getAllPaymentMethods()
}

const updatePaymentMethod = async (paymentId, newData) => {
	await PaymentMethods.findByIdAndUpdate(paymentId, newData)
	return getAllPaymentMethods()
}

const removePaymentMethod = async  (paymentId) => {
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
	return getAllPaymentMethodsKeys()
}

const removePaymentMethodKeys = async  (paymentId) => {
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
	removePaymentMethodKeys,
}