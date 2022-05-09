const getPercentByAmount = (total, value) => {
	return +((value / total) * 100).toFixed(2)
}

const getAmountByPercent = (total, value) => {
	return +(total * (value / 100)).toFixed(2)
}

const getInvoiceFinance = (report) => {
	if (!report.hasOwnProperty("items")) return null
	const { items } = report

	return {
		discount: +(items.reduce((acc, curr) => {
			if (curr.discount) {
				const itemCost = curr.rate * curr.quantity
				return curr.discountType === 'Percents'
					? acc += getAmountByPercent(itemCost, curr.discount)
					: acc += curr.discount
			}
			return acc += 0
		}, 0)).toFixed(2),

		vat: +(items.reduce((acc, curr) => {
			if (curr.tax) {
				let itemCost = curr.rate * curr.quantity
				if(curr.discount){
					itemCost -= curr.discountType === 'Percents'
						? getAmountByPercent(itemCost, curr.discount)
						: curr.discount
				}
				return curr.taxType === 'Percents'
						? acc += getAmountByPercent(itemCost, curr.tax)
						: acc += curr.tax
			}
			return acc += 0
		}, 0).toFixed(2)),

		subTotal: +(items.reduce((acc, curr) => acc += curr.rate * curr.quantity, 0)).toFixed(2),
		total: +(items.reduce((acc, curr) => acc += curr.amount, 0)).toFixed(2)
	}
}


module.exports = {
	getPercentByAmount,
	getAmountByPercent,
	getInvoiceFinance
}