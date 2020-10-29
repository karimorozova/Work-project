const { ClientRequest } = require("../models");
const { getClientRequest } = require("./get");
const moment = require("moment");

async function createRequest(request) {
    let todayStart = new Date();
    todayStart.setUTCHours(0,0,0,0);
    let todayEnd = new Date(todayStart);
    todayEnd.setUTCHours(23,59,59,0);
    try {
        const todaysRequests = await ClientRequest.find({"startDate" : { $gte : todayStart, $lt: todayEnd }});
        const nextNumber = (todaysRequests.length < 10) ? '[0' + (todaysRequests.length + 1) + ']': '[' + (todaysRequests.length + 1) + ']';
        const requestId = moment(new Date()).format("YYYY MM DD") + ' ' + nextNumber;
        const requestData = {...request, requestId};
        if(request.serviceTitle === 'Translation') {
            return await createWordsRequest({...requestData})
        }
        else {
            return await createPackagesRequest({...requestData});
        }
    } catch(err) {
        console.log(err);
        console.log('Error in createRequest');
    }
}

async function createWordsRequest(request) {
    try {
        const sourceLanguage = JSON.parse(request.source);
        const targetLanguages = JSON.parse(request.targets);
        const newRequest = await ClientRequest.create({...request, sourceLanguage, targetLanguages});
        return await getClientRequest({"_id": newRequest.id});
    } catch(err) {
        console.log(err);
        console.log('Error in createWordsRequest');
    }
}

async function createPackagesRequest(request) {
    try {
        const targetLanguages = JSON.parse(request.targets);
        const packageSize = request.packageSize ? JSON.parse(request.packageSize) : "";
        const genBrief = request.genBrief ? JSON.parse(request.genBrief) : "";
        const tones = request.tones ? JSON.parse(request.tones) : "";
        const designs = request.designs ? JSON.parse(request.designs) : "";
        const seo = getSeo(request);
        const newRequest = await ClientRequest.create({...request,
            packageSize, targetLanguages, genBrief, tones, designs, seo
        });
        return await getClientRequest({"_id": newRequest.id});
    } catch(err) {
        console.log(err);
        console.log('Error in createWordsRequest');
    }
}

function getSeo(request) {
    let seoData = [];
    if(request.isSeo === 'true') {
        const isMetaTags = request.isMeta === 'true';
        let seoInfo = Object.keys(request).filter(item => item.indexOf('seo') !== -1);
        if(seoInfo.length) {
            seoInfo = seoInfo.map(item => {
              return item.split('-')[1];
            })
        }
        seoData.push(...seoInfo, isMetaTags);
    }
    return seoData;
}

module.exports = { createRequest };
