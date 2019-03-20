const router = require('express').Router();
const { Zoho } = require('../models');
const { zohoCreds } = require('../configs');
const { getTokens, refreshToken, getRecords, getLeads, getActivities, getCallsCount, saveRecords } = require('../services');

router.get("/getTokens", async (req, res) => {
    const { code } = req.query;
    try {
        const result = await getTokens(code);
        const zoho = await Zoho.find();
        if(zoho.length) {
            await Zoho.updateOne({"_id": zoho[0]._id, access_token: result.access_token});
        } else {
            await Zoho.create(result);
        }
        res.send(result);
    }   catch(err) {
        console.log(err);
        res.status(500).send("Error on getting ZOHO tokens");
    }
})

router.get("/refreshToken", async (req, res) => {
    try {
        const result = await refreshToken();
        res.send(result);
    }   catch(err) {
        console.log(err);
        res.status(500).send("Error on refreshing ZOHO token");
    }
})

router.get("/leads", async (req, res) => {
    try {
        const result = await getLeads();
        res.send(result.data);
    }   catch(err) {
        console.log(err);
        res.status(500).send("Error on getting ZOHO leads");
    }
})

router.get("/activities", async (req, res) => {
    try {
        const result = await getActivities('(Owner.name:equals:Amelia Lotter)');
        const callsReport = getCallsCount(result.data);
        res.send({callsReport});
        // res.send(result.data);
    }   catch(err) {
        console.log(err);
        res.status(500).send("Error on getting ZOHO activities");
    }
})

router.get("/crm-records", async (req, res) => {
    const { user } = req.query;
    try {
        const records = await getRecords(user);
        await saveRecords(records, user);
        res.send("New records recieved");
    }   catch(err) {
        console.log(err);
        if(err.status === 401) {
            return res.status(401).send(err.message+" ZOHO");
        }
        res.status(500).send("Error on getting ZOHO activities");
    }
})

router.get('/creds', (req, res) => {
    res.send(zohoCreds);
})

module.exports = router;