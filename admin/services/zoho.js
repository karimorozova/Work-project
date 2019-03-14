const unirest = require('unirest');
const { zohoCreds } = require('../configs');
const { Zoho } = require('../models');

const tokensUrl = 'https://accounts.zoho.com';
const dataUrl = 'https://www.zohoapis.com/crm/v2';

const date = new Date();
date.setHours(0,0,0,0);
const isoDate = date.toISOString().split(".")[0];

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

module.exports = { getTokens, refreshToken, getRecords, getLeads, getActivities, getCallsCount }