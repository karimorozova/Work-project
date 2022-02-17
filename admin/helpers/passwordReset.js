const { sendEmail } =  require("../utils/mailTemplate")
const { getMessageResetPassword } =  require("../emailMessages/internalCommunication")
const jwt =  require('jsonwebtoken')
const secret = "DAdkalsld"


const generateNewToken = (email, type, secret, expiresIn) => {
	return jwt.sign( {email, type} , secret, { expiresIn })
}

const getTokenData = (token, secret) => {
	try {
		return jwt.verify(token, secret)
	} catch (err) {

	}
}

const setNewPassToAdmin = (email, newPass) => {

}

const setNewPassToVendor = (email, newPass) => {

}

const setNewPassToPortal = (email, newPass) => {

}

const sendMail = async (email, token, type) => {
	const urlsByType = {
		admin: 'http://localhost:3001/password-reset',
		portal: '',
		vendor: ''
	}

	const message =  getMessageResetPassword(token, urlsByType[type])

	await sendEmail({to: email, subject: 'Password Reset' }, message)
}


const sendResetToken = async (email, type) => {
	const token = generateNewToken(email, type, secret, '30m' )
	await sendMail(email, token, type)
}

const changePass = async (token, pass, repeatPass) => {
	if (pass !== repeatPass) return "pass Is not same"

	const { email, type } = getTokenData(token)
	switch (type) {
		case 'admin':
			setNewPassToAdmin(email, pass)
			break;
		case 'portal':
			setNewPassToPortal(email, pass)
			break;
		case 'vendor':
			setNewPassToVendor(email, pass)
			break;
	}
}

module.exports = {
	sendResetToken,
	changePass
}