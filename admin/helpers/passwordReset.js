const { sendEmail } =  require("../utils/mailTemplate")
const { getMessageResetPassword } =  require("../emailMessages/internalCommunication")
const { User, Vendors } = require('../models')
const jwt =  require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const secret = "DAdkalsld"

const generateNewToken = (email, type, secret, expiresIn) => {
	return jwt.sign( {email, type} , secret, { expiresIn })
}

const getTokenData = (token, secret) => {
	try {
		const verify = jwt.verify(token, secret)
		return verify
	} catch (err) {
		throw new Error('This reset token isn\'t active. Make new password reset.')
	}
}

const setNewPassToAdmin = async (email, newPass) => {
	await User.updateOne({email: email}, {password: newPass} )

}

const setNewPassToVendor = async (email, newPass) => {
	await Vendors.updateOne({email: email}, {password: newPass} )
}

const setNewPassToPortal = async (email, newPass) => {
	await Clients.updateOne({'contacts.email': email}, {'contacts[i].password': newPass}, { arrayFilters:  { 'i.email': email }  })
}

const sendMail = async (email, token, type) => {
	const urlsByType = {
		admin: `http://localhost:3001/password-reset/token/${token}`,
		portal: `http://localhost:3000/password-reset?token=${token}`,
		vendor: `http://localhost:3002/password-reset?token=${token}`
	}

	const message =  getMessageResetPassword(urlsByType[type])

	await sendEmail({to: email, subject: 'Password Reset' }, message)
}


const sendResetToken = async (email, type) => {
	const token = generateNewToken(email, type, secret, '20m' )
	await sendMail(email, token, type)
}

const changePass = async (token, pass, repeatPass) => {

	pass = pass.trim()
	repeatPass = repeatPass.trim()

	if (pass.length < 6) return { status: "error", message: 'Password must contain at least 6' }
	if (pass !== repeatPass) return { status: "error", message: 'Passwords do not match' }
	try {
		const { email, type } = getTokenData(token, secret)
		const encryptedPass = await bcrypt.hash(pass, 10)
		switch (type) {
			case "admin":
				await setNewPassToAdmin(email, encryptedPass)
				break;
			case 'portal':
				setNewPassToPortal(email, encryptedPass)
				break;
			case 'vendor':
				setNewPassToVendor(email, encryptedPass)
				break;
		}
		return { status: "success", message: 'Password changed' }
	}catch (e) {
		return { status: "error", message: e.message }
	}

}

module.exports = {
	sendResetToken,
	changePass
}