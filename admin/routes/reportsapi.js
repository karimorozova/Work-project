const router = require('express').Router();
const { getReport } = require("../reports/get");
const { getXtrfTierReport } = require("../reports/xtrf");
const  { upload } = require("../utils");
const { getFilteredJson } = require("../services");
const { XtrfTier } = require("../models");
convertExcel = require('excel-as-json').processFile;

router.post('/tier-report', async (req, res) => {
    const { type, filters } = req.body;
    const reportData = await getReport(type, filters);
    res.send(reportData);
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
            res.send(err);
        }
        res.send(data);
    }); 
})

router.get('/xtrf-tier-report', async (req, res) => {
    try {
        const reports = await getXtrfTierReport();
        res.send(reports);
    } catch(err) {
        console.log(err);
        res.status(500).send("Error on getting reports");
    }
})

module.exports = router;