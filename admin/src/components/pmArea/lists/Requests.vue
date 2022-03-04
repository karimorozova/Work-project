<template lang="pug">
  .all-requests
    .all-requests__filters
      RequestFilters(
        :clientName="clientFilter"
        :sourceLangs="sourceFilter"
        :targetLangs="targetFilter"
        :pmFilter="pmFilter"
        :salesFilter="salesFilter"
        :projectManagers="projectManagers"
        :salesManagers="salesManagers"
        @addLangFilter="addLangFilter"
        @removeLangFilter="removeLangFilter"
        @setFilter="setFilter"
      )
    .all-requests__table
      RequestsTable(
        :allProjects="allRequests"
        @selectProject="selectProject"
        @bottomScrolled="bottomScrolled"
      )
</template>

<script>
	import RequestsTable from "../RequestsTable"
	import { mapGetters } from 'vuex'
	import RequestFilters from "../clientRequests/RequestFilters"

	export default {
		props: {},
		data() {
			return {
				clientFilter: "",
				sourceFilter: [],
				targetFilter: [],
				statusFilter: "",
				pmFilter: "All",
				salesFilter: "All",
				startFilter: "",
				deadlineFilter: "",
				managers: [],
				allRequests: [],
				lastDate: new Date(),
				isDataRemain: true
			}
		},
		methods: {
			setFilter({ option, prop }) {
				this[prop] = option
				// this.refreshProjects()
			},
			removeLangFilter({ from, position }) {
				this[from].splice(position, 1)
				// this.refreshProjects()
			},
			addLangFilter({ to, lang }) {
				this[to].push(lang)
				// this.refreshProjects()
			},
			selectProject({ project }) {
				this.$router.push(`${ this.$route.path }/details/${ project._id }`)
				// this.$router.push(`/pangea-projects/requests/details/${ project._id }`)
			},
			async getManagers() {
				const managers = await this.$http.get("/pm-manage/all-managers?groupFilters=Project%20Managers,Sales")
				this.managers = managers.body
			},
			async bottomScrolled() {
				if (this.isDataRemain) {
					const result = await this.$http.post(`/clients-requests/all`, { ...this.filters, lastDate: this.lastDate })
					console.log(result.data)
					this.allRequests.push(...result.data)
					this.isDataRemain = result.data.length === 25
					this.lastDate = result.data && result.data.length ? result.data[result.data.length - 1].startDate : ""
				}
			},
			async getData(filters) {
				this.lastDate = new Date()
				this.lastDate.setDate(this.lastDate.getDate() + 1)
				this.isDataRemain = true
				try {
					const result = await this.$http.post(`/clients-requests/all`, { ...filters, lastDate: this.lastDate })
					this.allRequests = result.data
					this.lastDate = result.data && result.data.length ? result.data[result.data.length - 1].startDate : ""
				} catch (err) {
					this.alertToggle({ message: "Error on getting data", isShow: true, type: "error" })
				}
			}
		},
		computed: {
			...mapGetters({
				allCustomers: "getClients"
			}),
			filters() {
				const pmIds = this.pmFilter !== 'All' ? this.managers.filter(item => `${ item.firstName } ${ item.lastName }` === this.pmFilter) : null
				const salesIds = this.salesFilter !== 'All' ? this.managers.filter(item => `${ item.firstName } ${ item.lastName }` === this.salesFilter) : null
				return {
					statusFilter: this.statusFilter,
					pmIds,
					salesIds,
					clientFilter: this.clientFilter,
					startFilter: this.startFilter,
					deadlineFilter: this.deadlineFilter,
					sourceFilter: this.sourceFilter,
					targetFilter: this.targetFilter
				}
			},
			projectManagers() {
				return this.managers.filter(item => item.group.name === 'Project Managers')
			},
			salesManagers() {
				return this.managers.filter(item => item.group.name === 'Sales')
			}
		},
		beforeRouteEnter(to, from, next) {
			next((vm) => {
				let { status } = to.params
				if (status.includes('_')) status = status.replace('_', ' ')
				vm.statusFilter = status
				vm.getData(vm.filters)
			})
		},
		created() {
			this.getManagers()
		},
		components: {
			RequestFilters,
			RequestsTable
		}
	}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors";

  .all-requests {
    box-shadow: $box-shadow;
    position: relative;
    width: 1200px;
    margin: 50px;
    background: white;
    padding: 20px;
    box-sizing: border-box;
    border-radius: 2px;
  }

</style>



