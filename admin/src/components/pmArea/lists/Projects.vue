<template lang="pug">
  .all-projects

    ProjectsLayoutTable(
      :list="allProjects"
      @bottomScrolled="bottomScrolled"
    )

    //.all-projects__filters
    //  ProjectFilters(
    //    :idFilter="idFilter"
    //    :clientName="clientFilter"
    //    :projectName="projectFilter"
    //    :sourceLangs="sourceFilter"
    //    :targetLangs="targetFilter"
    //    :pmFilter="pmFilter"
    //    :salesFilter="salesFilter"
    //    :projectManagers="projectManagers"
    //    :salesManagers="salesManagers"
    //    @setFilter="setFilter"
    //    :projectsType="projectsType"
    //    @refreshProjects="refreshProjects"
    //  )
    //
    //.all-projects__table
    //  ProjectsTable(
    //    v-if="projectsType !== 'requests'"
    //    :allProjects="allProjects"
    //    @selectProject="selectProject"
    //    @bottomScrolled="bottomScrolled"
    //  )
</template>

<script>
	import { mapGetters, mapActions } from 'vuex'
	import ProjectsLayoutTable from "./ProjectsLayoutTable"
	import ProjectsLayoutFilter from "./ProjectsLayoutFilter"

	export default {
		props: {
			projectsType: {
				type: String
			}
		},
		data() {
			return {
				allProjects: [],
				lastDate: new Date(),
				isDataRemain: true,

				statusFilter: '',
				projectIdFilter: '',
				projectNameFilter: '',

				// clientFilter: "",
				// projectFilter: "",
				// idFilter: "",
				// sourceFilter: [],
				// targetFilter: [],
				// statusFilter: "",
				// pmFilter: "All",
				// salesFilter: "All",
				// startFilter: "",
				// deadlineFilter: "",
				// managers: [],
				// // statuses: [],
				// endpoint: "allprojects",
			}
		},
		methods: {
			...mapActions([
				"setCurrentProject",
				"alertToggle"
			]),
			// setFilter({ option, prop }) {
			// 	this[prop] = option
			// 	this.getData()
			// },
			async getData() {
				this.lastDate = new Date()
				this.lastDate.setDate(this.lastDate.getDate() + 1)
				this.isDataRemain = true
				try {
					const result = await this.$http.post(`/pm-manage/allprojects`, {
						...this.filters,
						lastDate: this.lastDate
					})
					this.allProjects = result.data
					this.lastDate = (result.data && result.data.length)
							? result.data[result.data.length - 1].startDate
							: ""
				} catch (err) {
					this.alertToggle({ message: "Error on getting data", isShow: true, type: "error" })
				}
			},
			async bottomScrolled() {
				if (this.isDataRemain) {
					const result = await this.$http.post(`/pm-manage/allprojects`, {
						...this.filters,
						lastDate: this.lastDate
					})
					this.allProjects.push(...result.data)
					this.isDataRemain = result.data.length === 25
					this.lastDate = (result.data && result.data.length)
							? result.data[result.data.length - 1].startDate
							: ""
				}
			},
			querySetter(vm, to) {
				if (to.query.projectId != null) vm.projectIdFilter = to.query.projectId
				if (to.query.projectName != null) vm.projectNameFilter = to.query.projectName
			}
		},
		computed: {
			filters() {
				return {
					statusFilter: this.statusFilter,
					projectIdFilter: this.projectIdFilter,
					projectNameFilter: this.projectNameFilter
				}

				// const pmIds = this.pmFilter !== 'All' ? this.managers.filter(item => `${ item.firstName } ${ item.lastName }` === this.pmFilter) : null
				// const salesIds = this.salesFilter !== 'All' ? this.managers.filter(item => `${ item.firstName } ${ item.lastName }` === this.salesFilter) : null
				// return {
				// 	statusFilter: this.statusFilter,
				// 	pmIds,
				// 	salesIds,
				// 	clientFilter: this.clientFilter,
				// 	startFilter: this.startFilter,
				// 	deadlineFilter: this.deadlineFilter,
				// 	sourceFilter: this.sourceFilter,
				// 	targetFilter: this.targetFilter,
				// 	projectFilter: this.projectFilter,
				// 	idFilter: this.idFilter
				// }
			}
		},
		beforeRouteEnter(to, from, next) {
			next((vm) => {
				vm.querySetter(vm, to)
				let { status } = to.params
				if (status.includes('_')) status = status.replace('_', ' ')
				vm.statusFilter = status
				vm.getData()
			})
		},

		watch: {
			$route(to) {
				this.querySetter(this, to)
				this.getData()
			}
		},

		components: {
			ProjectsLayoutFilter,
			ProjectsLayoutTable
		}
	}
</script>

<style lang="scss" scoped>

  .all-projects {
    width: 1550px;
    margin: 50px 50px 0 50px;
  }

</style>



