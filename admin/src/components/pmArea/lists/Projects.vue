<template lang="pug">
  .all-projects
    ProjectSettingsSidebar(
      v-if="!!user.layoutsSettings"
      :filters="filtersSetting"
      :fields="fieldsSetting"
      :userInfo="user.layoutsSettings.project"

      @updateFiltersAndFields="updateFiltersAndFields"
    )
    ProjectsLayoutTable(
      :list="allProjects"
      @bottomScrolled="bottomScrolled"
    )
</template>

<script>
	import { mapGetters, mapActions } from 'vuex'
	import ProjectsLayoutTable from "./ProjectsLayoutTable"
	import ProjectsLayoutFilter from "./ProjectsLayoutFilter"
  import ProjectSettingsSidebar from "./ProjectSettingsSidebar"

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
				],
        filtersSetting: [
          {
            id: "projectId",
            name: "Project Id",
            order: 1,
            fixed: false,
            isCheck: false,
          },
          {
            id: "projectName",
            name: "Project Name",
            order: 2,
            fixed: false,
            isCheck: false,
          },
          {
            id: "clientName",
            name: "Client Name",
            order: 3,
            fixed: false,
            isCheck: false,
          },
          {
            id: "startDate",
            name: "Start Date",
            order: 4,
            fixed: false,
            isCheck: false,
          },
          {
            id: "deadline",
            name: "Deadline",
            order: 5,
            fixed: false,
            isCheck: false,
          },
          {
            id: "projectManager",
            name: "Project Manager",
            order: 6,
            fixed: false,
            isCheck: false,
          },
          {
            id: "accountManger",
            name: "Account Manger",
            order: 7,
            fixed: false,
            isCheck: false,
          },
          {
            id: "sourceLanguages",
            name: "Source Languages",
            order: 8,
            fixed: false,
            isCheck: false,
          },
          {
            id: "targetLanguages",
            name: "Target Languages",
            order: 9,
            fixed: false,
            isCheck: false,
          },
        ],
        fieldsSetting: [
          {
            id: "projectId",
            name: "Project Id",
            order: 1,
            fixed: false,
            isCheck: false,
          },
          {
            id: "projectName",
            name: "Project Name",
            order: 2,
            fixed: false,
            isCheck: false,
          },
          {
            id: "clientName",
            name: "Client Name",
            order: 3,
            fixed: false,
            isCheck: false,
          },
          {
            id: "startDate",
            name: "Start Date",
            order: 4,
            fixed: false,
            isCheck: false,
          },
          {
            id: "deadline",
            name: "Deadline",
            order: 5,
            fixed: false,
            isCheck: false,
          },
          {
            id: "projectManager",
            name: "Project Manager",
            order: 6,
            fixed: false,
            isCheck: false,
          },
          {
            id: "accountManger",
            name: "Account Manger",
            order: 7,
            fixed: false,
            isCheck: false,
          },
        ],
			}
		},
		methods: {
			...mapActions([
        "alertToggle",
        "setUser",
      ]),
      async updateFiltersAndFields(data) {
        await this.$http.post('/pm-manage/update-filters-and-fields/' + this.user._id, {data})
        await this.setUser()
      },
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
      ...mapGetters({
        user: "getUser"
      }),
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
      ProjectSettingsSidebar,
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



