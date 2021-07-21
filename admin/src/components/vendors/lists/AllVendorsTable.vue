<template lang="pug">
  .all-vendors
    .all-vendors__table
      VendorFilters(
        :industryFilter="industryFilter"
        @setIndustryFilter="(option) => setFilter(option, 'industryFilter')"

        @setNameFilter="(option) => setFilter(option, 'nameFilter')"
        @setStatusFilter="(option) => setFilter(option, 'statusFilter')"

        :sourceLang="sourceLang"
        @setSourceFilter="setSourceFilter"

        :targetLang="targetLang"
        @setTargetFilter="setTargetFilter"
      )

      VendorsTable(
        @bottomScrolled="bottomScrolled"
        @update="update"
        @goToVendor="goToVendorPage"
      )
</template>

<script>
	import VendorsTable from "../VendorsTable"
	import VendorFilters from "../VendorFilters"
	import { mapActions, mapGetters } from "vuex"

	export default {
		data() {
			return {
				industryFilter: { name: "All" },
				sourceLang: "All",
				targetLang: "All",
				stepFilter: { title: "All" },
				nameFilter: "",
				isDataRemain: true,
				lastId: "",
				statusFilter: "All"
			}
		},
		methods: {
			...mapActions([ "setFilteredVendors", "alertToggle" ]),

			async setSourceFilter(data) {
				this.sourceLang = data
				await this.getVendors()
			},
			async setTargetFilter(data) {
				this.targetLang = data
				await this.getVendors()
			},

			scrollBodyToTop() {
				let tbody = document.querySelector(".vendors-table__body")
				tbody.scrollTop = 0
			},
			async bottomScrolled() {
				if (this.isDataRemain) {
					const result = await this.$http.post('/vendorsapi/filtered-vendors', { filters: this.filters })
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

			goToVendorPage(vendorId) {
				this.$router.push(`/pangea-vendors/all/details/${ vendorId }`)
			},

			async setFilter({ option }, prop) {
				this[prop] = option
				await this.getVendors()
			},
			async getVendors() {
				this.lastId = ""
				this.isDataRemain = true
				try {
					const result = await this.$http.post('/vendorsapi/filtered-vendors', { filters: this.filters })
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
					nameFilter: this.nameFilter,
					statusFilter: this.statusFilter,
					sourceFilter: this.sourceLang,
					targetFilter: this.targetLang,
					industryFilter: this.industryFilter,
					lastId: this.lastId
				}
			}
		},
		components: {
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

  .all-vendors {
    position: relative;
    width: 1220px;
    margin: 50px;
    background: white;

    &__table {
      border-radius: 4px;
      padding: 20px;
      box-sizing: border-box;
      box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;
    }
  }
</style>
