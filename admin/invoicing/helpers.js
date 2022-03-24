const getPercentByAmount = (total, value) => {
	return +((value / total) * 100).toFixed(2)
}

const getAmountByPercent = (total, value) => {
	return +(total * (value / 100)).toFixed(2)
}


module.exports = {
	getPercentByAmount,
	getAmountByPercent
}