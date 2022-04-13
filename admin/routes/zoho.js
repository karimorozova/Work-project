const router = require('express').Router()
const { Zoho } = require('../models')
const { getTokens } = require('../services')
const { sendRequestToZoho } = require("../services/zoho")

router.get("/getTokens", async (req, res) => {
	const { code } = req.query
	try {
		const result = await getTokens(code)
		console.log(result)
		const zoho = await Zoho.find()
		if (zoho.length) {
			await Zoho.updateOne({ "_id": zoho[0]._id, access_token: result.access_token, refresh_token: result.refresh_token })
		} else {
			await Zoho.create(result)
		}
		res.send(result)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting ZOHO tokens")
	}
})

router.get("/getBankAccounts", async (req, res) => {
	try{
		const response = await sendRequestToZoho('bankaccounts')
		const bankAccounts = response.data.bankaccounts.map(({account_id, account_name, account_type}) => ({id: account_id, name: account_name, type: account_type}))
		res.send(bankAccounts)
	} catch (e) {
		res.status(500).send("Error on getting ZOHO tokens")
	}

})
// router.get("/refreshToken", async (req, res) => {
//     try {
//         const result = await refreshToken();
//         res.send(result);
//     }   catch(err) {
//         console.log(err);
//         res.status(500).send("Error on refreshing ZOHO token");
//     }
// })
//
// router.get('/zoho-reports', async (req, res) => {
//     const { from, to } = req.query;
//     try {
//         const fromDate = from ? new Date(from): new Date(new Date().getFullYear(), new Date().getMonth(), 1);
//         const toDate = to ? new Date(to) : new Date();
//         const result = await ZohoReport.find({date: {$gte: fromDate, $lte: toDate}})
//                 .populate('user', 'firstName lastName')
//                 .sort({date: 1});
//         const reports = result.filter(item => item.isWorkingDay);
//         res.send(reports);
//     } catch(err) {
//         console.log(err);
//         res.status(500).send("Error on getting Zoho Reports");
//     }
// })
//
// router.post('/report', async (req, res) => {
//     const { id, notes, isWorkingDay } = req.body;
//     try {
//         await ZohoReport.updateOne({"_id": id}, { notes, isWorkingDay });
//         res.send("Updated");
//     } catch(err) {
//         console.log(err);
//         res.status(500).send("Error on updating the Report");
//     }
// })
//
// router.get("/leads", async (req, res) => {
//     try {
//         const result = await getLeads();
//         res.send(result.data);
//     } catch(err) {
//         console.log(err);
//         res.status(500).send("Error on getting ZOHO leads");
//     }
// })
//
// router.get("/activities", async (req, res) => {
//     try {
//         const result = await getActivities('(Owner.name:equals:Sakis Kyriakou)');
//         const callsReport = getCallsCount(result.data);
//         res.send({callsReport});
//         // res.send(result.data);
//     } catch(err) {
//         console.log(err);
//         res.status(500).send("Error on getting ZOHO activities");
//     }
// })

module.exports = router