const router = require('express').Router();

const { Languages } = require('../models')
const {
	getAllReports,
	getReport,
	reportAddSteps,
	reportDeleteStep,
	getAllSteps,
	addStepsToRequest,
	stepsFiltersQuery,
	reportsFiltersQuery,
	setReportsNextStatus,
	reportDelete,
	paidOrAddPaymentInfo,
} = require('../invoicingReports')

const ObjectId = require("mongodb").ObjectID


router.post("/manage-report-status", async (req, res) => {
	const { nextStatus } = req.body
	try {
		switch (nextStatus) {
			case "Sent":
				const { reportsIds } = req.body
				await setReportsNextStatus(reportsIds, nextStatus)
				//TODO send nofitication
				break;
		}
		res.send('foo');
	} catch(err) {
		console.log(err);
		res.status(500).send('Something wrong on manage-report-status');
	}
});

router.post("/not-selected-steps-list", async (req, res) => {
	const { countToSkip, countToGet, filters } = req.body;
	const allLanguages = await Languages.find()
	try {
		const query = stepsFiltersQuery(filters, allLanguages)
		const steps = await getAllSteps(countToSkip, countToGet, query)
		res.send(steps);
	} catch(err) {
		console.log(err);
		res.status(500).send('Something wrong on getting steps');
	}
});

router.post("/not-selected-steps-list/:vendor", async (req, res) => {
	const { vendor } = req.params;
	try {
		const query = {"steps.vendor": ObjectId(vendor)}
		const steps = await getAllSteps(0, 0, query)
		res.send(steps);
	} catch(err) {
		console.log(err);
		res.status(500).send('Something wrong on getting steps');
	}
});

router.post("/reports", async (req, res) => {
	try {
		const {	countToSkip, countToGet, filters } = req.body
		const query = reportsFiltersQuery(filters)
		const reports = await getAllReports( countToSkip, countToGet, query )
		res.send(reports);
	} catch(err) {
		console.log(err);
		res.status(500).send('Something wrong on getting steps');
	}
});

router.post("/report-final-status/:reportId", async (req, res) => {
	const {reportId} = req.params
	const {paidAmount, unpaidAmount, paymentMethod,	paymentDate, notes} = req.body

	try {
		const result = await paidOrAddPaymentInfo(reportId, {paidAmount, unpaidAmount, paymentMethod,	paymentDate, notes})
		// const reports = await getAllReports( countToSkip, countToGet, query )
		res.send(result);
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

router.get("/report/:id/delete", async (req, res) => {
	const { id } = req.params
	try {
		const report = await reportDelete(id)
		res.send(report);
	} catch(err) {
		console.log(err);
		res.status(500).send('Something wrong on getting steps');
	}
});

router.post("/delete-reports", async (req, res) => {
	const { reportIds } = req.body
	try {
		for await (const reportId of reportIds) {
			await reportDelete(reportId)
		}

		res.send("success");
	} catch(err) {
		console.log(err);
		res.status(500).send('Something wrong on deleting reports');
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