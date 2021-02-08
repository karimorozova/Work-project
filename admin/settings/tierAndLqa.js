const { TierInfo, IndustryTierInfo } = require('../models');

async function getTierInfo() {
    try {
        const tierInfo = await TierInfo.find().sort({'tier': 1});
        let result = {}
        tierInfo.forEach(tier => {
            tier.lqas.forEach(lqa => {
                if (lqa.lqaName === 'tqi') return
                result[tier.tier] = {...result[tier.tier], [lqa.lqaName]: lqa.minWordCount }
            })
        })
        return result;
    } catch(err) {
        console.log(err);
        console.log("Error in getTierInfo function");
    }
}

async function updateTierInfo(updatedInfo) {
    try {
        const tierInfo = await TierInfo.findOne({tier: updatedInfo.index});
        tierInfo.lqas.map(lqa => {
            lqa.minWordCount =  updatedInfo[lqa.lqaName]
            return lqa
        })
        tierInfo.save()
    } catch(err){
        console.log(err);
        console.log('Error in updateTierInfo func');
    }
}

async function getIndustryTier() {
    try {
        const industryTier = await IndustryTierInfo.find({industry: {$ne: null}}).sort({'industry.name': 1}).populate('industry', 'name')
        const industryTierAllIndustry = await IndustryTierInfo.findOne({industry:  null})

        const allIndustry = {
            industry: {name: "All industry"},
            _id: industryTierAllIndustry._id,
            tier1: industryTierAllIndustry.tier1,
            tier3: industryTierAllIndustry.tier3
        }

        return [allIndustry, ...industryTier]
    } catch (e) {
        console.log(err);
        console.log('Error in getIndustryTier func');
    }
}

async function updateIndustryTier(industryUpdate) {
    const industryId = industryUpdate.index || null
    try {
        const industryTier = await IndustryTierInfo.findOne({industry: industryId})
        industryTier.tier1 = industryUpdate.currentTier1
        industryTier.tier3 = industryUpdate.currentTier3

        await industryTier.save()

    } catch (e) {
        console.log(err);
        console.log('Error in updateIndustryTier func');
    }
}

async function createIndustryTier(industryId){
    const tierAllIndustry = await IndustryTierInfo.findOne({industry:  null})
    const newTierIndustry = {
        industry: industryId,
        tier1: tierAllIndustry.tier1,
        tier3: tierAllIndustry.tier3
    }

    await IndustryTierInfo.create(newTierIndustry)
}

module.exports = { getTierInfo, updateTierInfo, getIndustryTier, updateIndustryTier, createIndustryTier };
