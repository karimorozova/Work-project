// const unirest = require('unirest');
const { zohoCreds } = require('../configs')
const { Zoho, ZohoReport, User } = require('../models')
const axios = require("axios")
const { returnMessageAndType } = require("../invoicingReceivables-Old/helper")

const baseUrl = 'https://books.zoho.com/api/v3/'
const tokensUrl = 'https://accounts.zoho.com'
const dataUrl = 'https://www.zohoapis.com/crm/v2'

async function getTokens(code) {
	return (await axios({
		headers: {
			'Accept': `application/json`
		},
		method: "post",
		url: `${ tokensUrl }/oauth/v2/token`,
		params: {
			'grant_type': 'authorization_code',
			'client_id': zohoCreds.client_id,
			'client_secret': zohoCreds.client_secret,
			'redirect_uri': zohoCreds.redirect_uri,
			'code': code
		}
	})).data
}

async function refreshToken(refreshToken) {
	return (await axios({
		headers: {
			'Accept': `application/json`
		},
		method: "post",
		url: `${ tokensUrl }/oauth/v2/token`,
		params: {
			'grant_type': 'refresh_token',
			'refresh_token': refreshToken,
			'client_id': zohoCreds.client_id,
			'client_secret': zohoCreds.client_secret
		}
	})).data
}

async function getCurrentToken() {
	try {
		const token = await Zoho.findOne()
		return token.access_token
	} catch (err) {
		console.log(err)
		console.log("Error on getCurrentToken ZOHO from DB")
	}
}

const setNewTokenFromRefresh = async () => {
	try {
		const { _id, refresh_token } = await Zoho.findOne()
		const { access_token = '' } = await refreshToken(refresh_token)
		if (access_token === '') return returnMessageAndType("test", 'error')
		await Zoho.updateOne({ _id: _id }, { access_token })
		return access_token
	} catch (e) {
		return false
	}
}

const zohoRequest = async (link, data, token, method = "GET", header = {}, additional = {}) => {
	return (await axios({
		headers: {
			'Authorization': `Bearer  ${ token }`,
			"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
			...header
		},
		method,
		url: baseUrl + link,
		data,
		...(additional)
	}))
}

const sendRequestToZoho = async (link, data = {}, method = "GET", header = {}, additional = {}) => {
	let token = await getCurrentToken()
	try {
		return await zohoRequest(link, data, token, method, header, additional)
	} catch (err) {
		try {
			if (err.response || err.response.data.code === 57) {
				token = await setNewTokenFromRefresh()
				if (!token) return returnMessageAndType('Can`t get access_token', 'error')
				return await zohoRequest(link, data, token, method, header, additional)
			}
		} catch (err) {
			returnMessageAndType(err.message, 'error')
		}

		returnMessageAndType(err.message, 'error')
	}
}

module.exports = {
	// getTokens, refreshToken,
	// getRecords,
	// getLeads, getActivities,
	// getCallsCount, saveRecords,
	refreshToken,
	sendRequestToZoho,
	getTokens
}