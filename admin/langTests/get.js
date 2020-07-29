const { LangTest } = require("../models");

async function getLangTest(obj) {
    try {
        return await LangTest.findOne(obj)
            .populate("source")
            .populate("targets")
            .populate("industries")
            .populate("steps")
    } catch(err) {
        console.log(err);
        console.log("Error in getLangTest")
    }
}

async function getLangTests(obj) {
    try {
        return await LangTest.find(obj)
            .populate("source")
            .populate("targets")
            .populate("industries")
            .populate("steps")
    } catch(err) {
        console.log(err);
        console.log("Error in getLangTests")
    }
}

async function getUpdatedTest(query, update) {
    try {
        return await LangTest.findOneAndUpdate(query, update, {new: true})
            .populate("source")
            .populate("targets")
            .populate("industries")
            .populate("steps")
    } catch(err) {
        console.log(err);
        console.log("Error in getUpdatedTest")
    }
}

module.exports = {
    getLangTest,
    getLangTests,
    getUpdatedTest
}