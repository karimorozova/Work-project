<template lang="pug">
  .potential-vendors
    .potential-vendors__table
      VendorFiltersPotential(
        :industryFilter="industryFilter"
        :leadFilter="leadFilter"
        :sourceLangs="sourceFilter"
        :targetLangs="targetFilter"
        :step="stepFilter.title"

        @setDateRange="setDateRange"

        @setNameFilter="(option) => setFilter(option, 'nameFilter')"
        @setStatusFilter="(option) => setFilter(option, 'statusFilter')"
        @setLeadFilter="(option) => setFilter(option, 'leadFilter')"
        @setIndustryFilter="(option) => setFilter(option, 'industryFilter')"
        @removeLangFilter="removeLangFilter"
        @addLangFilter="addLangFilter"
        @setAllLangs="setAllLangs"
        @setStepFilter="setStepFilter"
        @setIsPendingFilter="setIsPendingFilter"
      )

      VendorsTablePotential(
        :nameFilter="nameFilter"
        :industryFilter="industryFilter"
        :sourceFilter="sourceFilter"
        :targetFilter="targetFilter"
        :statusFilter="statusFilter"
        :stepFilter="stepFilter"
        @bottomScrolled="bottomScrolled"
        @update="update"
      )
</template>

<script>
	import VendorsTable from "../VendorsTable"
	import VendorFilters from "../VendorFilters"
	import { mapActions, mapGetters } from "vuex"
	import VendorsTablePotential from "../VendorsTablePotential"
	import VendorFiltersPotential from "../VendorFiltersPotential"

	export default {
		data() {
			return {
				dateRange: null,
				industryFilter: { name: "All" },
				sourceLangs: [ { symbol: "All" } ],
				targetLangs: [ { symbol: "All" } ],
				stepFilter: { title: "All" },
				nameFilter: "",
				isDataRemain: true,
				lastId: "",
				statusFilter: 'Potential',
				pendingFilter: true
			}
		},
		methods: {
			...mapActions([ "setFilteredVendors", "alertToggle" ]),

			async setDateRange(dateRange) {
				this.dateRange = dateRange
				await this.getVendors()
			},
			scrollBodyToTop() {
				let tbody = document.querySelector(".vendors-table__body")
				tbody.scrollTop = 0
			},
			async bottomScrolled() {
				if (this.isDataRemain) {
					const result = await this.$http.post('/vendorsapi/filtered-potential-vendors', { filters: this.filters })
					const mappedResult = result.data.map(item => {
						return {
							...item,
							name: `${ item.firstName } ${ item.surname }`
						}
					})
					this.setFilteredVendors([ ...this.vendors, ...mappedResult ])
					this.isDataRemain = result.body.length === 25
					this.lastId = result.body && result.body.length ? result.body[result.body.length - 1]._id : ""
				}
			},
			async update({ status }) {
				if (this.statusFilter !== status) {
					await this.getVendors()
				}
			},
			addVendor() {
				this.$router.push("/vendors/new-vendor")
			},
			async setFilter({ option }, prop) {
				this[prop] = option
				await this.getVendors()
			},
			async setStepFilter({ step }) {
				this.stepFilter = step
				await this.getVendors()
			},
			async setAllLangs({ prop }) {
				this[prop] = [ { symbol: "All" } ]
				await this.getVendors()
			},
			async removeLangFilter({ prop, position }) {
				this[prop].splice(position, 1)
				if (this[prop].length === 0) {
					this[prop] = [ { symbol: "All" } ]
				}
				await this.getVendors()
			},
			async addLangFilter({ prop, lang }) {
				const currentProp = prop === 'sourceLangs' ? 'sourceFilter' : 'targetFilter'
				if (this[currentProp].indexOf('All') !== -1) {
					this[prop] = []
				}
				this[prop].push(lang)
				await this.getVendors()
			},
			async setIsPendingFilter(e) {
				this.pendingFilter = e.hasPending

				await this.getVendors()
			},
			async getVendors() {
				this.lastId = ""
				this.isDataRemain = true
				try {
					const result = await this.$http.post('/vendorsapi/filtered-potential-vendors', { filters: this.filters })
					const mappedResult = result.data.map(item => {
						return {
							...item,
							name: `${ item.firstName } ${ item.surname }`
						}
					})
					this.setFilteredVendors(mappedResult)
					this.lastId = result.body && result.body.length ? result.body[result.body.length - 1]._id : ""
					this.scrollBodyToTop()
				} catch (err) {
					this.alertToggle({ message: "Error on getting vendors", isShow: true, type: "error" })
				}
			}
		},
		computed: {
			...mapGetters({
				vendors: "getFilteredVendors"
			}),
			filters() {
				return {
					dateRange: this.dateRange,
					nameFilter: this.nameFilter,
					stepFilter: this.stepFilter,
					statusFilter: this.statusFilter,
					sourceFilter: this.sourceLangs.map(item => item._id),
					targetFilter: this.targetLangs.map(item => item._id),
					industryFilter: this.industryFilter,
					lastId: this.lastId,
					pendingFilter: this.pendingFilter

				}
			},
			sourceFilter() {
				return this.sourceLangs.map(item => item.symbol)
			},
			targetFilter() {
				return this.targetLangs.map(item => item.symbol)
			}
		},
		components: {
			VendorFiltersPotential,
			VendorsTablePotential,
			VendorsTable,
			VendorFilters
		},
		created() {
			this.getVendors()
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

  .potential-vendors {
    position: relative;
    width: 1200px;
    margin: 40px;
    background: white;

    &__table {
      border-radius: 4px;
      padding: 20px;
      box-sizing: border-box;
      box-shadow: rgba(81, 68, 48, 0.3) 0px 1px 2px 0px, rgba(81, 68, 48, 0.15) 0px 1px 3px 1px;
    }
  }
</style>
