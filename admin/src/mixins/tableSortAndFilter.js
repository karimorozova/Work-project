export default {
	data() {
		return {
			sortKeys: [],
			filtersData: {},
			sortedData: []
		}
	},
	methods: {
		addSortKey({ sortInfo, key, sortField, order }) {
			sortInfo.order = order
			this.sortKeys.push({ sortField, key, sortInfo })
		},
		changeSortKey({ sortInfo, order }) {
			sortInfo.order = order
			this.sortKeys = [ ...this.sortKeys ]
		},
		removeSortKey({ sortInfo, sortField }) {
			sortInfo.order = 'default'
			this.sortKeys = this.sortKeys.filter((sortKey) => sortKey.sortField !== sortField)
		},
		setFilter({ value, key, filterField, filterInfo }) {
			filterInfo.isFilterSet = value !== ''
			this.filtersData = { ...this.filtersData, [filterField]: { value, key } }
		},
		removeFilter({ filterInfo, filterField }) {
			filterInfo.isFilterSet = false
			this.filtersData = { ...this.filtersData, [filterField]: { value: '', key: '' } }
		},
		clearAllFilters() {
			this.filtersData = {}
		},

		setDefaults(){
			this.sortKeys = []
			this.filtersData = {}
			this.sortedData = []
		},
		sortData({ sortInfo, key, sortField }) {
			this.sortedData.sort((a, b) => {
				const rawFirst = Array.isArray(a[sortField]) ? a[sortField][0] : a[sortField]
				const rawSecond = Array.isArray(b[sortField]) ? b[sortField][0] : b[sortField]

				let first = key ? rawFirst[key] : rawFirst
				let second = key ? rawSecond[key] : rawSecond
				if (sortInfo.order === 'asc') [ first, second ] = [ second, first ]
				if(typeof first === 'string' && typeof second === 'string'){
					return first.localeCompare(second)
				}
				if (first > second) {
					return 1
				}
				if (first < second) {
					return -1
				}
				return 0
			})
		},
		filterData({ filterKey, value, fieldName }) {
			this.sortedData = this.sortedData.filter((data) => {
				const rawData = data[filterKey]
				const flatData = !Array.isArray(rawData) ? useKeyIfSet(rawData) : rawData.map(elem => useKeyIfSet(elem)).join(' ')
				const dataReadyForSearch = toLowerCaseIfString(flatData)
				return dataReadyForSearch.includes(toLowerCaseIfString(value))
			})

			function useKeyIfSet(elem) {
				return fieldName ? elem[fieldName] : elem
			}

			function toLowerCaseIfString(elem) {
				return (typeof elem === 'string') ? elem.toLowerCase() : elem + ""
			}
		}
	},
	computed: {
		finalData() {
			if (!this.rawData) return []
			this.sortedData = JSON.parse(JSON.stringify(this.rawData))

			for (let filterKey in this.filtersData) {
				if (this.filtersData[filterKey].value.length < 1) continue
				this.filterData({filterKey, value: this.filtersData[filterKey].value, fieldName: this.filtersData[filterKey].key })
			}

			let sortKeys = [...this.sortKeys].reverse()
			for(let sortKey of sortKeys ) {
				this.sortData(sortKey)
			}
			return this.sortedData
		},
	}
}