const { TierInfo } = require('../models');

async function getTierInfo() {
    try {
        const tierInfo = await TierInfo.find().sort({'tier': 1});
        let result = {}
        tierInfo.forEach(tier => {
            tier.lqas.forEach(lqa => {
                if (lqa.lqaName === 'tqi') return
                result[lqa.lqaName] = {...result[lqa.lqaName], ['tier' + tier.tier]: lqa.minWordCount }
            })
        })
        return result;
    } catch(err) {
        console.log(err);
        console.log("Error in createNewIndustry function");
    }
}

async function updateTierInfo(updatedInfo) {
    try {
        const tierInfo = await TierInfo.find().sort({'tier': 1});
        tierInfo.forEach(tier => {
            const findedTier = tier.lqas.find(lqa => {
                return lqa.lqaName === updatedInfo.index
            } )
            if (findedTier.minWordCount === updatedInfo['currentTier' + tier.tier]) return
            findedTier.minWordCount = updatedInfo['currentTier' + tier.tier]

            tier.save()
        })
    } catch(err){
        console.log(err);
        console.log('Error in deleteIndustryFiles func');
    }
}

module.exports = { getTierInfo, updateTierInfo };
