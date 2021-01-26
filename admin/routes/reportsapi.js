const router = require('express').Router();
const {
	rebuildTierReportsStructure,
	getXtrfLqaReport,
	getXtrfUpcomingReport,
	filterTierReport,
	getLqaReportFilterOptions,
	newLQAStatusFromXTRFProjects,
	UpdateLQAFromProject,
	newLangReport,
  groupXtrfLqaByIndustryGroup,
  UpdateLqaAliases,
	saveVendorBenchmarkCost,
} = require('../reports');

//
// const { newLangReport } = require('../reports/newLangTierReport');
// const { parseAndWriteLQAReport } = require('../reports/parseOldMemoqProjects');
// const { UpdateLQAFromProject } = require('../reports/newLQAStatusFromProjects');

const { upload } = require('../utils');
const { getFilteredJson, fillXtrfLqa, fillXtrfPrices } = require("../services");
const { XtrfTier, XtrfReportLang, XtrfVendor, XtrfLqa, XtrfLqaGrouped, LangTier } = require("../models");
convertExcel = require('excel-as-json').processFile;

router.get('/languages', async (req, res) => {
	try {
		const langs = await XtrfReportLang.find().sort({ lang: 1 });
		res.send(langs);
	} catch (err) {
		console.log(err);
		res.status(500).send("Error on getting xtrf languages");
	}
});

router.post('/xtrf-tier', upload.fields([{ name: 'reportFiles' }]), async (req, res) => {
	const { start, end, industry } = req.body;
	const { reportFiles } = req.files;
	convertExcel(reportFiles[0].path, undefined, null, async (err, data) => {
		if(err) {
			res.send(err);
		}
		const languages = getFilteredJson(data);
		try {
			await XtrfTier.create({ languages, start: new Date(start), end: new Date(end), industry });
		} catch (err) {
			console.log(err);
			res.status(500).send("Error on saving xtrf tier");
		}
		res.send(data);
	});
});

router.post('/xtrf-tier-report', async (req, res) => {
	const { filters } = req.body;
	try {
		const reports = await LangTier.find();
		const structuredReports = rebuildTierReportsStructure(reports);
		const filteredReports = filterTierReport(structuredReports, filters);
		const result = { filteredReports, structuredReports };
		res.send(result);
	} catch (err) {
		console.log(err);
		res.status(500).send("Error on getting reports");
	}
});

router.post('/xtrf-lqa', upload.fields([{ name: 'reportFiles' }]), async (req, res) => {
	const { reportFiles } = req.files;
	try {
		convertExcel(reportFiles[0].path, undefined, null, async (err, data) => {
			if(err) {
				res.send(err);
			}
			try {
				await fillXtrfLqa(data);
			} catch (err) {
				console.log(err);
				res.status(500).send("Error on filling xtrf LQA reports");
			}
			res.send(data);
		});
	} catch (err) {
		console.log(err);
		res.status(500).send("Error on filling xtrf LQA reports");
	}
});


router.get('/rewrite-xtrf-tier-report', async (req, res) => {
	try {
		await newLangReport();
		res.send('Updated');
	} catch (err) {
		console.log(err);
		res.status(500).send("Error on getting reports");
	}
});

router.post('/xtrf-lqa-report', async (req, res) => {
	const { filters } = req.body;
	try {
		const reports = await getXtrfLqaReport(filters);
		res.send(reports);
	} catch (err) {
		console.log(err);
		res.status(500).send('Error on getting reports');
	}
});

//TODO: Routes BenchmarkReport
router.post('/vendor-benchmark-cost', async (req, res) => {
	const { filters } = req.body;
	try {
		const reports = await saveVendorBenchmarkCost();
		console.log(reports)
		res.send(reports);
	} catch (err) {
		console.log(err);
		res.status(500).send('Error on getting reports');
	}
});

router.get('/xtrf-lqa-reports-filter-options', async (req, res) => {
	try {
		const lqaReport = await XtrfLqaGrouped.find()
				.populate('sourceLanguage')
				.populate('targetLanguage');

		const filterOptions = getLqaReportFilterOptions(lqaReport);
		res.send(filterOptions);
	} catch (err) {
		console.log(err);
		res.status(500).send('Error on getting lqa report options');
	}
});

router.post('/xtrf-upcoming-lqa-report', async (req, res) => {
	const { filters } = req.body;
	try {
		const reports = await getXtrfUpcomingReport(filters);
		res.send(reports);
	} catch (err) {
		console.log(err);
		res.status(500).send('Error on getting upcoming reports');
	}
});

router.post('/xtrf-prices', upload.fields([{ name: 'reportFiles' }]), async (req, res) => {
	const { reportFiles } = req.files;
	try {
		convertExcel(reportFiles[0].path, undefined, null, async (err, data) => {
			if(err) {
				res.send(err);
			}
			try {
				await fillXtrfPrices(data);
			} catch (err) {
				console.log(err);
				res.status(500).send("Error on filling xtrf prices");
			}
			res.send(data);
		});
	} catch (err) {
		console.log(err);
		res.status(500).send("Error on getting reports");
	}
});

router.post('/xtrf-vendor-lqa', async (req, res) => {
	const { vendorData } = req.body;
	const key = `${ vendorData.lqa }s.${ [vendorData.industry] }`;
	const updateQuery = { [key]: vendorData.grade };
	try {
		await XtrfVendor.updateOne({ _id: vendorData.vendor._id }, updateQuery);
		res.send("ok");
	} catch (err) {
		console.log(err);
		res.status(500).send("Error on updating vendor's lqa");
	}
});

router.get('/check-vendor', async (req, res) => {
	const { name } = req.query;
	try {
		const vendor = await XtrfVendor.find({ name: { "$regex": new RegExp(`${ name }`, 'i') } });
		res.send(vendor);
	} catch (err) {
		console.log(err);
		res.status(500).send("Error on checking for vendor existence");
	}
});

router.post('/new-xtrf-vendor', async (req, res) => {
	const { industriesData, language, name } = req.body;
	const basicPrices = industriesData.reduce((acc, cur) => {
		acc[cur.industry] = cur.basicPrice;
		return acc;
	}, {});
	const tqis = industriesData.reduce((acc, cur) => {
		acc[cur.industry] = cur.tqi;
		return acc;
	}, {});
	try {
		const xtrfLang = await XtrfReportLang.findOne({ lang: language });
		const vendor = await XtrfVendor.create({ name, language: xtrfLang, basicPrices, tqis });
		await XtrfLqa.create({ vendor, wordcounts: { Finance: 0, iGaming: 0, General: 0 } });
		res.send('saved');
	} catch (err) {
		console.log(err);
		res.status(500).send('Error on saving new xtrf vendor');
	}
});

router.get('/restore-old-xtrf-lqa-report', async (req, res) => {
	try {
		await parseAndWriteLQAReport();
		res.send('Restored!');
	} catch (err) {
		console.log(err);
		res.status(500).send('Erron on restoring old xtrf-lqa reports!');
	}
});

router.get('/restore-memoq-lqa-report', async (req, res) => {
	try {
		await UpdateLQAFromProject();
		const result = await newLQAStatusFromXTRFProjects();
		res.send(result.filter(({industries})=> industries.length));
	} catch (err) {
		console.log(err);
		res.status(500).send('Erron on restoring old xtrf-lqa reports!');
	}
});

router.get('/restore-lqa-report-aliases', async (req, res) => {
  try {
    const result = await UpdateLqaAliases();
    res.send(result.filter(({industries})=> industries.length));
  } catch (err) {
    console.log(err);
    res.status(500).send('Erron on restoring old xtrf-lqa reports!');
  }
});

router.post('/reports-vendor-assessment', upload.fields([{ name: 'assessmentFile' }]), async (req, res) => {
  const assessment = JSON.parse(req.body.assessment);
  const { vendorId } = req.body;
  const files = req.files["assessmentFile"];
  try {
    const updatedVendor = await updateVendorAssessment({
      vendorId,
      assessment,
      file: files[0]
    });
    res.send(updatedVendor);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error on saving Vendor's assessment");
  }
});


module.exports = router;
