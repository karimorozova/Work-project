const router = require('express').Router();
const { getReport } = require("../reports/get");
const { getXtrfTierReport, getXtrfLqaReport, getXtrfBenchmarkReport } = require("../reports/xtrf");
const  { upload } = require("../utils");
const { getFilteredJson, fillXtrfLqa, fillXtrfPrices } = require("../services");
const { XtrfTier, XtrfReportLang } = require("../models");
convertExcel = require('excel-as-json').processFile;

router.get('/languages', async (req, res) => {
    try {
        const langs = await XtrfReportLang.find().sort({lang: 1});
        res.send(langs);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on getting xtrf languages");
    }
})

router.post('/tier-report', async (req, res) => {
    const { type, filters } = req.body;
    try {
        const reportData = await getReport(type, filters);
        res.send(reportData);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on getting tier report");
    }
})

router.post('/xtrf-tier', upload.fields([{ name: 'reportFiles' }]), async (req, res) => {
    const { start, end, industry } = req.body;
    const { reportFiles } = req.files;
    convertExcel(reportFiles[0].path, undefined, null, async (err, data) => {
        if(err) {
            res.send(err);
        }
        const languages = getFilteredJson(data);
        try {
            await XtrfTier.create({languages, start: new Date(start), end: new Date(end), industry});
        } catch(err) {
            console.log(err);
            res.status(500).send("Error on saving xtrf tier");
        }
        res.send(data);
    }); 
})

router.post('/xtrf-tier-report', async (req, res) => {
    const { filters } = req.body; 
    try {
        const reports = await getXtrfTierReport(filters);
        res.send(reports);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on getting reports");
    }
})

router.post('/xtrf-lqa', upload.fields([{ name: 'reportFiles' }]), async (req, res) => {
    const { reportFiles } = req.files;
    try {
        convertExcel(reportFiles[0].path, undefined, null, async (err, data) => {
            if(err) {
                res.send(err);
            }
            try {
                await fillXtrfLqa(data);
            } catch(err) {
                console.log(err);
                res.status(500).send("Error on filling xtrf LQA reports");
            }
            res.send(data);
        });
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on filling xtrf LQA reports");
    }
})

router.post('/xtrf-lqa-report', async (req, res) => {
    const { filters } = req.body; 
    try {
        const reports = await getXtrfLqaReport(filters);
        res.send(reports);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on getting reports");
    }
})

router.post('/xtrf-prices', upload.fields([{ name: 'reportFiles' }]), async (req, res) => {
    const { reportFiles } = req.files; 
    try {
        convertExcel(reportFiles[0].path, undefined, null, async (err, data) => {
            if(err) {
                res.send(err);
            }
            try {
                await fillXtrfPrices(data);
            } catch(err) {
                console.log(err);
                res.status(500).send("Error on filling xtrf prices");
            }
            res.send(data);
        });
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on getting reports");
    }
})

router.post('/xtrf-benchmark-report', async (req, res) => {
    const { filters } = req.body; 
    try {
        const reports = await getXtrfBenchmarkReport(filters);
        res.send(reports);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on getting reports");
    }
})

module.exports = router;