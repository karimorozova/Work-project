<template lang="pug">
  .all-projects

    .all-projects__filters
      ProjectFilters(
        :idFilter="idFilter"
        :clientName="clientFilter"
        :projectName="projectFilter"
        :sourceLangs="sourceFilter"
        :targetLangs="targetFilter"
        :pmFilter="pmFilter"
        :salesFilter="salesFilter"
        :projectManagers="projectManagers"
        :salesManagers="salesManagers"
        @setFilter="setFilter"
        :projectsType="projectsType"
        @refreshProjects="refreshProjects"
      )

    .all-projects__table
      ProjectsTable(
        v-if="projectsType !== 'requests'"
        :allProjects="allProjects"
        @selectProject="selectProject"
        @bottomScrolled="bottomScrolled"
      )
</template>

<script>
	import ProjectsTable from "../ProjectsTable"
	import RequestsTable from "../RequestsTable"
	import ProjectInfo from "../ProjectInfo"
	import ProjectFilters from "../ProjectFilters"
	import { mapGetters, mapActions } from 'vuex'

	export default {
		props: {
			projectsType: {
				type: String
			}
		},
		data() {
			return {
				clientFilter: "",
				projectFilter: "",
				idFilter: "",
				sourceFilter: [],
				targetFilter: [],
				statusFilter: "",
				pmFilter: "All",
				salesFilter: "All",
				startFilter: "",
				deadlineFilter: "",
				managers: [],
				// statuses: [],
				isDataRemain: true,
				lastDate: new Date(),
				endpoint: "allprojects",
				prop: "projects",
				allProjects: []
			}
		},
		methods: {
			...mapActions([
				"setCurrentProject",
				// "setAllProjects",
				"alertToggle"
			]),
			setFilter({ option, prop }) {
				this[prop] = option
				console.log({ option, prop })
				this.getData(this.filters)
			},
			// removeLangFilter({ from, position }) {
			// 	this[from].splice(position, 1)
			// 	this.$emit('filterProjects', this.filters)
			// },
			// addLangFilter({ to, lang }) {
			// 	this[to].push(lang.symbol)
			// 	this.$emit('filterProjects', this.filters)
			// },
			selectProject({ project }) {
				this.setCurrentProject(project)
				this.$router.push(`${ this.$route.path }/details/${ project._id }`)
			},
			async getManagers() {
				const managers = await this.$http.get("/pm-manage/all-managers?groupFilters=Project%20Managers,Sales")
				this.managers = managers.data
			},
			refreshProjects() {
				this.$emit('filterProjects', this.filters)
			},
			async getData(filters) {
				this.lastDate = new Date()
				this.lastDate.setDate(this.lastDate.getDate() + 1)
				this.isDataRemain = true
				try {
					const result = await this.$http.post(`/pm-manage/${ this.endpoint }`, {
						...filters,
						lastDate: this.lastDate
					})
					this.allProjects = result.data
					// this.setAllProjects([ ...result.data ])
					this.lastDate = result.data && result.data.length ? result.data[result.data.length - 1].startDate : ""
					// this.scrollBodyToTop()
				} catch (err) {
					this.alertToggle({ message: "Error on getting data", isShow: true, type: "error" })
				}
			},
			scrollBodyToTop() {
				let tbody = document.querySelector(".all-projects")
				tbody.scrollTop = 0
			},
			async bottomScrolled() {
				if (this.isDataRemain) {
					const result = await this.$http.post(`/pm-manage/${ this.endpoint }`, { ...this.filters, lastDate: this.lastDate })
					this.allProjects.push(...result.data)
					this.isDataRemain = result.data.length === 25
					this.lastDate = result.data && result.data.length ? result.data[result.data.length - 1].startDate : ""
				}
			}
		},
		computed: {
			...mapGetters({
				// TODO: ref this getters
				// allProjects: "getAllProjects",
				// allRequests: "getAllRequests",
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
					targetFilter: this.targetFilter,
					projectFilter: this.projectFilter,
					idFilter: this.idFilter,
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
		async created() {
			await this.getManagers()
		},
		components: {
			ProjectsTable,
			RequestsTable,
			ProjectInfo,
			ProjectFilters
		}
	}
</script>

<style lang="scss" scoped>

  .all-projects {
    box-shadow: rgba(81, 68, 48, 0.3) 0px 1px 2px 0px, rgba(81, 68, 48, 0.15) 0px 1px 3px 1px;
    position: relative;
    width: 1200px;
    margin: 50px;
    background: white;
    padding: 20px;
    box-sizing: border-box;
    border-radius: 4px;
  }

</style>



