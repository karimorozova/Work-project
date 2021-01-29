const staticPangeaCodes = () =>
		new Map([
			['0', 'AKAKCASIUENRMOASJD'],
			['1', 'KAJANHATWOLPADKOAS'],
			['2', 'LAKAJSDJAAQOANZNCK'],
			['3', 'KKPASOWNDAIOSDANSD'],
			['4', 'AKLJPQJAHHFOKJHSDF'],
			['5', 'OOIWENJSDHNASKHSDD'],
			['6', 'KLSJDFPOWENJLIFSDA'],
			['7', 'IOPUWESDJFSDKFSDFS'],
			['8', 'KASJDIQWHJDUWIIQWE'],
			['9', 'OIUWERWENDFJSKSADD']
		])


const pangeaEncoder = (string) => {
	for (let symbol of string) {
		if (/^\d{1}$/.test(symbol)) {
			const [key, value] = [...staticPangeaCodes().entries()].find(([key]) => key === symbol)
			string = string.replace(symbol, value)
		}
	}
	return string
}

const pangeaDecoder = (string) => {
	for (let [key, value] of [...staticPangeaCodes().entries()]) {
		const re = new RegExp(value, 'g')
		string = string.replace(re, key)
	}
	return string
}

module.exports = {
	pangeaEncoder,
	pangeaDecoder
}