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

module.exports = { getFilteredJson }