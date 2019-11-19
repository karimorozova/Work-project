function getFilteredJson(data) {
    let result = data.filter(item => item.target).map(item => {
        item = getNonZeroWordcounts(item);
        return item;
    });
    for(let i = 0; i < result.length; i++) {
        result[i] = getNonZeroWordcounts(result[i]);
    }
    return result;
}

function getNonZeroWordcounts(obj) {
    let result = {target: obj.target};
    for(let key in obj) {
        if(key !== 'target' && obj[key]) {
            result[key] = obj[key]
        }
    }
    return result;
}

module.exports = { getFilteredJson }