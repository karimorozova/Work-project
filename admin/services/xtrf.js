const { XtrfVendor, XtrfLqa, XtrfReportLang, XtrfPrice } = require('../models');

function getFilteredJson(data) {
    let result = data.filter(item => item.target).reduce((acc, cur) => {
        const targetIndex = acc.findIndex(item => {
            const keys = Object.keys(item);
            return keys[0] === cur.target;
        });
        if(targetIndex !== -1) {
            acc[targetIndex] = updateWordcounts(acc[targetIndex], cur);
        } else {
            acc.push(getNonZeroWordcounts(cur));
        }
        return acc;
    }, []);
    return result;
}

function getNonZeroWordcounts(obj) {
    let result = {};
    for(let key in obj) {
        if(key !== 'target' && obj[key]) {
            result[key] = obj[key];
        }
    }
    return {[obj.target]: result};
}

function updateWordcounts(oldData, newData) {
    let result = {};
    const { target, ...clients } = newData;
    for(let key in clients) {
        const oldClient = oldData[target];
        if(oldClient[key]) {
            result[key] = oldClient[key] + clients[key];    
        } else if(clients[key]) {
            result[key] = oldClient[key] ? clients[key] + oldClient[key] : clients[key];
        }
    }
    return {[target]: result}
}

async function fillXtrfLqa(data) {
    try {
        for(let wordData of data) {
            const { name, language, basicPrice, tqi, lqa1, lqa2, lqa3, providerType: type, ...wordcounts } = wordData;
            let xtrfLang = await XtrfReportLang.findOne({lang: language});
            if(!xtrfLang) {
                xtrfLang = await XtrfReportLang.create({lang: language});
            }
            const steps = wordData.steps.split(",");
            let vendor = await XtrfVendor.create({name, language: xtrfLang, basicPrice, tqi, lqa1, lqa2, lqa3, type, steps});
            await XtrfLqa.create({vendor, wordcounts});
        }
    } catch(err) {
        console.log(err);
        console.log("Error in fillXtrfLqa")
    }
}

async function fillXtrfPrices(data) {
    try {
        for(let priceData of data) {
            let { language, ...prices } = priceData;
            let xtrfLang = await XtrfReportLang.findOne({lang: language});
            if(!xtrfLang) {
                xtrfLang = await XtrfReportLang.create({lang: language});
            }
            prices = Object.keys(prices).reduce((acc, cur) => {
                const clientPrice = (prices[cur]/2).toFixed(2);
                return {...acc, [cur]: +clientPrice}
            }, {})
            await XtrfPrice.create({language: xtrfLang, prices})
        }
    } catch(err) {

    }
}

module.exports = { getFilteredJson, fillXtrfLqa, fillXtrfPrices }