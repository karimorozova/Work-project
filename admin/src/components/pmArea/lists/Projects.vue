<template lang="pug">
  .all-projects

    ProjectsLayoutTable(
      :list="allProjects"
      @bottomScrolled="bottomScrolled"
    )
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

				status: '',

				projectId: '',
				projectName: '',
				clientName: '',
				projectManager: '',
				accountManager: '',
				startDate: '',
				deadline: '',
				sourceLanguages: '',
				targetLanguages: '',

				dataVariables: [
					'projectId',
					'projectName',
					'clientName',
					'projectManager',
					'accountManager',
					'startDate',
					'deadline',
					'sourceLanguages',
					'targetLanguages'
				]
			}
		},
		methods: {
			...mapActions([ "alertToggle" ]),
			async getData() {
				this.lastDate = new Date()
				this.lastDate.setDate(this.lastDate.getDate() + 1)
				this.isDataRemain = true
				try {
					const result = await this.$http.post(`/pm-manage/allprojects`, { ...this.filters, lastDate: this.lastDate })
					this.allProjects = result.data
					this.lastDate = this.getLastDateFromRes(result)
				} catch (err) {
					this.alertToggle({ message: "Error on project getting data", isShow: true, type: "error" })
				}
			},
			async bottomScrolled() {
				if (this.isDataRemain) {
					const result = await this.$http.post(`/pm-manage/allprojects`, { ...this.filters, lastDate: this.lastDate })
					this.allProjects.push(...result.data)
					this.isDataRemain = result.data.length === 25
					this.lastDate = this.getLastDateFromRes(result)
				}
			},
			getLastDateFromRes({ data }) {
				return (data && data.length) ? data[data.length - 1].startDate : ""
			},
			querySetter(vm, to) {
				for (let variable of this.dataVariables) if (to.query[variable] != null) vm[variable] = to.query[variable]
			},

			defaultSetter() {
				for (let variable of this.dataVariables) this[variable] = ''
			}
		},
		computed: {
			filters() {
				const filters = { status: this.status }
				for (let variable of this.dataVariables) filters[variable] = this[variable]
				return filters
			}
		},
		beforeRouteEnter(to, from, next) {
			next((vm) => {
				vm.defaultSetter()
				vm.querySetter(vm, to)
				let { status } = to.params
				status.includes('_') ? vm.status = status.replace('_', ' ') : vm.status = status
				vm.getData()
			})
		},

		watch: {
			$route(to, from) {
				if (to.path === from.path) {
					this.querySetter(this, to)
					this.getData()
				}
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
    width: 1530px;
    margin: 50px 50px 0 50px;
  }

</style>



