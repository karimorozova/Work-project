const { User, Vendors, Clients } = require("../models")
const jwt = require("jsonwebtoken")
const { secretKey } = require("../configs")
const { OAuth2Client } = require("google-auth-library")
const client = new OAuth2Client("1057113930206-vcj6erd2h955k9jr2e3ib3lqddrcsn7b.apps.googleusercontent.com")

const getUserAuthAdmin = async (email, picture) => {
	// await User.updateOne({ email: email }, { $set: { photo: picture } })
	const client = await User.findOne({ email: email, isActive: {$ne: false}}).populate("group")
	const user = {email: client.email, _id: client._id}
	return { user }

	// const token = await jwt.sign({ user }, secretKey, { expiresIn: '12h' })
}

const getUserAuthVendor = async (email, picture) => {
	// await Vendors.updateOne({ email: email }, { $set: { photo: picture } })
	const vendor = await Vendors.findOne({ email: email })
	return { vendorId: vendor._id }

	// const token = await jwt.sign({ vendorId: vendor._id }, secretKey, { expiresIn: '12h' })
}

const getUserAuthPortal = async (email, picture) => {
	// await Clients.updateOne({'contacts.email': email}, {'contacts.$[i].photo': picture}, { arrayFilters:  [{ 'i.email': email }]  })
	const [client] = await Clients.aggregate([
		{$match: {'contacts.email': email}},
		{$unwind: '$contacts'},
		{$match: {'contacts.email': email}},
	])
	return { clientId: client._id, contactEmail: client.contacts.email }
	//const clientToken = await jwt.sign({ clientId: data.client.id, contactEmail: data.contact.email }, secretKey, { expiresIn: "12h" })
}


const googleOAuth = async (idToken, portal) => {
	const ticket = await client.verifyIdToken({
		idToken: idToken,
		audience: "1057113930206-vcj6erd2h955k9jr2e3ib3lqddrcsn7b.apps.googleusercontent.com"
	})

	const { email, picture } = ticket.getPayload()
	let payload

	switch (portal) {
		case "admin":
			payload = await getUserAuthAdmin(email, picture)
			break;
		case 'portal':
			payload = await getUserAuthPortal(email, picture)
			break;
		case 'vendor':
			payload = await getUserAuthVendor(email, picture)
			break;
	}

	if (!payload) return { status: "error" }

	const token = await jwt.sign( payload , secretKey, { expiresIn: '12h' })
	return {status: 'success', token: token}
}

module.exports = {
	googleOAuth
}