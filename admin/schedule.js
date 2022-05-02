const schedule = require("node-schedule")
const moment = require('moment')
const { deleteEmptyOrNotCreatedByManger, sendPreventDeleteNotActiveVendor } = require("./vendors/deleteVendor")
const { XtrfLqa, Vendors, Clients, Projects, InvoicingPayables } = require('./models')
const { downloadFromMemoqProjectsData } = require("./services/memoqs/projects")
const { downloadMemoqFile } = require("./services/memoqs/files")
const { updateStatusesForOtherProjects, clearGarbageProjects } = require("./services/memoqs/otherProjects")
const { saveOtherProjectStatuses } = require('./gmail')
const { newLangReport } = require('./reports/newLangTierReport')
const { parseAndWriteLQAReport } = require('./reports/newLQAStatusFromFiles')
const { UpdateLQAFromProject, newLQAStatusFromXTRFProjects, updateVendorBenchmarkCost } = require('./reports')


const { getAllSteps, addStepsToPayables, getPayable, getAllPaidPayables, addFile } = require('./invoicingPayables')
const { sendRequestToZoho } = require("./services/zoho")


const autoCreationPayablesReports = async () => {
	const allSteps = await getAllSteps(0, 999999, {
		"deadline": {
			$gt: new Date('2022-04-01T00:00:00.000Z'),
			$lt: new Date('2022-30-28T24:00:00.000Z')
		}
	}, false)
	try {
		await addStepsToPayables(allSteps, null)
	} catch (e) {
		console.log(e)
	}
	console.log(allSteps.length)
}

// autoCreationPayablesReports()


// const generateTotal = async () => {
// 	const list = await InvoicingPayables.find()
// 	for await (const report of list) {
// 		const [ { totalPrice } ] = await getPayable(report._id)
// 		await InvoicingPayables.updateOne({ _id: report._id }, { total: +(totalPrice).toFixed(2) })
// 	}
// 	console.log('DONE')
// }
// generateTotal()
// const uploadZohoInvoiceFileAll = async () => {
// 	const reports = await getAllPaidPayables(0, 1e6)
// 	for await (let report of reports) {
// 		console.log('--1')
// 		if(report.zohoBillingId){
// 		console.log('start', report.reportId)
// 			await sendRequestToZoho(`bills/335260000006169620?organization_id=630935724`, `JSONString=` + JSON.stringify({ "data": moment(report.lastPaymentDate).format('YYYY-MM-DD'), }), 'PUT')
// 		console.log('Done', report.reportId)
// 		}
// 	}
// }
// uploadZohoInvoiceFileAll()


// downloadMemoqFile({memoqProjectId:'1443ab32-fa74-eb11-90ed-82bb18d08256', docId:'4c077bd7-e5e7-46a5-9e4e-2953ab86e913', path:'./dist/max.xlsx'} )
// saveOtherProjectStatuses()
// downloadFromMemoqProjectsData();
// clearGarbageProjects(true);
// updateStatusesForOtherProjects()
// deleteEmptyOrNotCreatedByManger()
// sendPreventDeleteNotActiveVendor()


// schedule.scheduleJob('0 */3 * * *', async () => await scheduleJobBody(downloadFromMemoqProjectsData(), "Download new memoq projects"))

// schedule.scheduleJob('30 8,13,18 * * *', async () => await scheduleJobBody(saveOtherProjectStatuses(), "Save project statuses from Gmail API"))
// schedule.scheduleJob('40 8,13,18 * * *', async () => await scheduleJobBody(updateStatusesForOtherProjects(), "Save project statuses from Gmail API"))

// schedule.scheduleJob('40 0 * * *', async () => await scheduleJobBody(UpdateLQAFromProject(), "Updating LQA reports from projects data"))
// schedule.scheduleJob('30 0 * * *', async () => await scheduleJobBody(newLQAStatusFromXTRFProjects(), "Updating LQA reports from MemoqProjects data"))
// schedule.scheduleJob('30 23 * * *', async () => await scheduleJobBody(newLangReport(), "Updating lang tier data"))

// schedule.scheduleJob('10 0 * * *', async () => await scheduleJobBody(deleteEmptyOrNotCreatedByManger(), "Deleting not active vendor"));
// schedule.scheduleJob('20 0 * * *', async () => await scheduleJobBody(sendPreventDeleteNotActiveVendor(), "Send prevent delete not active vendor"));
// schedule.scheduleJob('30 01 * * *', async () => await scheduleJobBody(updateVendorBenchmarkCost(), "Updating vendor benchmark cost"));


// (async () => {
// 	const countLQAReports = await XtrfLqa.countDocuments()
// 	if (countLQAReports <= 0) parseAndWriteLQAReport()
// })()

const scheduleJobBody = async (fnc, scheduleName) => {
	console.log(
			'\x1b[33m',
			`Start schedule: "${ scheduleName }"`,
			`At: ${ moment(new Date()).format("DD.MM.YYYY, hh:mm:ss") };`,
			'\x1b[0m'
	)
	try {
		await fnc
	} catch (err) {
		console.log(err.message)
	} finally {
		console.log(
				'\x1b[33m',
				`Finish schedule: "${ scheduleName }"`,
				`At: ${ moment(new Date()).format("DD.MM.YYYY, hh:mm:ss") };`,
				'\x1b[0m'
		)
	}
}
