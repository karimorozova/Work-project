const unirest = require('unirest');
const { zohoCreds } = require('../configs');
const { Zoho, ZohoReport, User } = require('../models');

const tokensUrl = 'https://accounts.zoho.com';
const dataUrl = 'https://www.zohoapis.com/crm/v2';

const date = new Date();
date.setHours(0,0,0,0);
const isoDate = date.toISOString().split(".")[0];

const grades = {
    "F": {min: 0, max: 59},
    "D": {min: 60, max: 69},
    "C": {min: 70, max: 76},
    "C+": {min: 77, max: 79},
    "B-": {min: 80, max: 82},
    "B": {min: 83, max: 86},
    "B+": {min: 87, max: 89},
    "A-": {min: 90, max: 92},
    "A": {min: 93, max: 96},
    "A+": {min: 97, max: 100}
}

const standard = {leads: 30, calls: 30, communications: 50, meetings: 1};

async function getCurrentToken() {
    try {
        const token = await Zoho.find();
        return token[0].access_token;
    } catch(err) {
        console.log(err);
        console.log("Error on getCurrentToken ZOHO from DB")
    }
}

async function getTokens(code) {
    return new Promise((resolve,reject) => {
        unirest.post(`${tokensUrl}/oauth/v2/token`)
        .header('Accept', 'application/json')
        .field('grant_type', 'authorization_code')
        .field('client_id', zohoCreds.client_id)
        .field('client_secret', zohoCreds.client_secret)
        .field('redirect_uri', zohoCreds.redirect_uri)
        .field('code', code)
        .end( (res) => {
            if(res.error) {
                return reject(res.error)
            }
            resolve(res.body);
        })
    })
}

async function refreshToken() {
    return new Promise((resolve,reject) => {
        unirest.post(`${tokensUrl}/oauth/v2/token`)
        .header('Accept', 'application/json')
        .field('grant_type', 'refresh_token')
        .field('refresh_token', '1000.7963cfec29ec47370f975ee7e3033186.ba2acd9ed645dc106b3f10af0a69ceef')
        .field('client_id', zohoCreds.client_id)
        .field('client_secret', zohoCreds.client_secret)
        .end( (res) => {
            if(res.error) {
                return reject(res.error)
            }
            resolve(res.body);
        })
    })
}

async function getRecords(user) {
    try {
        const leads = await getLeads(user);
        const activities = await getActivities(user);
        const calls = getCallsCount(activities);
        const meetings = getMeetings(activities);
        const communications = getCommunications(activities);
        return { leads, calls, meetings, communications }
    } catch(err) {
        console.log(err);
        console.log("Error in getRecords(Zoho)");
        throw err
    }
}
// async function getLeads() {
//     return new Promise((resolve,reject) => {
//         unirest.get(`${dataUrl}/Leads/search?criteria=(Owner.name:equals:Amelia Lotter)`)
//         .header('Authorization', `Zoho-oauthtoken ${currentToken}`)
//         .end( (res) => {
//             if(res.error) {
//                 return reject(res.error)
//             }
//             resolve(res.body);
//         })
//     })
// }

async function getLeads(user) {
    const currentToken = await getCurrentToken();
    return new Promise((resolve,reject) => {
        unirest.get(`${dataUrl}/Leads`)
        .header('Authorization', `Zoho-oauthtoken ${currentToken}`)
        .header('If-Modified-Since', `${isoDate}+02:00`)
        .end( (res) => {
            if(res.error) {
                return reject(res.error)
            }
            let result = res.body.data.filter(item => item.Owner.name === user);
            resolve(result);
        })
    })
}

// async function getActivities(params) {
//     return new Promise((resolve,reject) => {
//         unirest.get(`${dataUrl}/Activities/search?criteria=${params}`)
//         .header('Authorization', `Zoho-oauthtoken ${currentToken}`)
//         .end( (res) => {
//             if(res.error) {
//                 return reject(res.error)
//             }
//             resolve(res.body);
//         })
//     })
// }

async function getActivities(user) {
    const currentToken = await getCurrentToken();
    return new Promise((resolve,reject) => {
        unirest.get(`${dataUrl}/Activities`)
        .header('Authorization', `Zoho-oauthtoken ${currentToken}`)
        .header('If-Modified-Since', `${isoDate}+02:00`)
        .end( (res) => {
            if(res.error) {
                return reject(res.error)
            }
            let result = res.body.data.filter(item => item.Owner.name === user);
            resolve(result);
        })
    })
}

function getCallsCount(data) {
    const result = data.filter(item => {
        return item.Activity_Type === "Calls"
    });
    return result;
}

function getMeetings(data) {
    const result = data.filter(item => {
        return item.Subject === "Meeting setup"
    });
    return result;
}

function getCommunications(data) {
    const subjects = ["Email Comm", "Linkedin Comm", "Facebook Comm"];
    const result = data.filter(item => {
        return item.Activity_Type === 'Tasks' && subjects.indexOf(item.Subject) !== -1;
    })
    return result;
}

async function saveRecords(records, user) {
    const newRecords = parseRecords(records);
    try {
        const recordsUser = await User.findOne({firstName: user.split(" ")[0], lastName: user.split(" ")[1]});
        const todaysRecords = await ZohoReport.findOne({user: recordsUser.id, date: {$gte: date}});
        todaysRecords ? await ZohoReport.updateOne({user: recordsUser._id, date: {$gte: date}}, { ...newRecords }) :
        await ZohoReport.create({ ...newRecords, user: recordsUser._id })
    } catch(err) {
        console.log(err);
        console.log("Error in saveRecords (Zoho)");
        throw err
    }
}

function parseRecords(records) {
    return {
        date: new Date(),
        leads: records.leads.length,
        calls: records.calls.length,
        communications: records.communications.length,
        meetings: records.meetings.length,
        percent: +getDayAverage(records),
        grade: getDayGrade(records),
        notes: ""
    }
}

function getDayAverage(records) {
    const totals = getAverage(records);
    let total = Object.keys(totals).reduce((init, cur) => {
        return init + totals[cur];
    }, 0);
    return total ? (total / 4).toFixed(2) : 0;
}

function getAverage(obj) {
    return Object.keys(obj).reduce((init, cur) => {
        init[cur] = obj[cur].length / standard[cur] * 100;
        return {...init};
    }, {})
}

function getDayGrade(obj) {
    const percent = +getDayAverage(obj);
    return gradeLetter(percent);
}

function gradeLetter(percent) {
    let result = "F";
    Object.keys(grades).forEach(key => {
        if(percent >= grades[key].min && percent <= grades[key].max) {
            result = key;
        }
    })
    if(percent > 100) {
        result = "A+"
    }
    return result;
}


module.exports = { getTokens, refreshToken, getRecords, getLeads, getActivities, getCallsCount, saveRecords }