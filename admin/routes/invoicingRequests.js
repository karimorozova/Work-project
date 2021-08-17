const router = require('express').Router();
const { getAllReports, getReport, reportAddSteps, reportDeleteStep, getAllSteps, addStepsToRequest} = require('../invoicingReports')
const ObjectId = require("mongodb").ObjectID

router.post("/steps/not-in-requests", async (req, res) => {
	const { countToSkip, countToGet, vendorId = '' } = req.body;
	try {
		let queryForStep = {}
		if (vendorId) {
			queryForStep = {"steps.vendor": ObjectId(vendorId)}
		}
		const steps = await getAllSteps(countToSkip, countToGet, queryForStep)
		res.send(steps);
	} catch(err) {
		console.log(err);
		res.status(500).send('Something wrong on getting steps');
	}
});

router.post("/reports", async (req, res) => {
	try {
		const reports = await getAllReports()
		res.send(reports);
	} catch(err) {
		console.log(err);
		res.status(500).send('Something wrong on getting steps');
	}
});

router.post("/report/:id", async (req, res) => {
	const { id } = req.params
	try {
		const report = await getReport(id)
		res.send(report);
	} catch(err) {
		console.log(err);
		res.status(500).send('Something wrong on getting steps');
	}
});

router.post("/report/:reportId/delete/:stepId", async (req, res) => {
	const { reportId, stepId } = req.params
	try {
		const report = await reportDeleteStep(reportId, stepId)
		res.send(report);
	} catch(err) {
		console.log(err);
		res.status(500).send('Something wrong on getting steps');
	}
});


router.post("/report/:reportId/steps/add", async (req, res) => {
	const { reportId } = req.params
	const { checkedProjects } = req.body
	try {
		const report = await reportAddSteps(reportId, checkedProjects)
		res.send(report);
	} catch(err) {
		console.log(err);
		res.status(500).send('Something wrong on getting steps');
	}
});

router.post("/create", async (req, res) => {
	const { checkedProjects, createdBy } = req.body;
	try {
		await addStepsToRequest(checkedProjects, createdBy )
		res.send("success");
	} catch(err) {
		console.log(err);
		res.status(500).send('Something wrong on getting steps');
	}
});

module.exports = router;