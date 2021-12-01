<template lang="pug">
  .all-projects
    ProjectSettingsSidebar(
      v-if="!!user.layoutsSettings"
      :filters="filteredPositionByUserSetting.filters"
      :fields="filteredPositionByUserSetting.fields"
      :userInfo="user.layoutsSettings.project"

      @updateFiltersAndFields="updateFiltersAndFields"
    )
    .clear-filter(@click="clearFilters")
      i(class="fas fa-broom")
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
				industry: '',
				services: '',
				isTest: '',
				projectCurrency: '',
				paymentProfile: '',
				vendors: '',
				tasksStatuses: '',
				requestId: '',

				dataVariables: [
					'projectId',
					'projectName',
					'clientName',
					'projectManager',
					'accountManager',
					'startDate',
					'deadline',
					'sourceLanguages',
					'targetLanguages',
					'industry',
					'services',
					'isTest',
					'projectCurrency',
					'paymentProfile',
					'vendors',
					'tasksStatuses',
					'requestId'
				],
				filtersSetting: [
					{
						id: "projectId",
						name: "Project Id",
						fixed: false,
						isCheck: false
					},
					{
						id: "projectName",
						name: "Project Name",
						fixed: false,
						isCheck: false
					},
					{
						id: "clientName",
						name: "Client Name",
						fixed: false,
						isCheck: false
					},
					{
						id: "startDate",
						name: "Start Date",
						fixed: false,
						isCheck: false
					},
					{
						id: "deadline",
						name: "Deadline",
						fixed: false,
						isCheck: false
					},
					{
						id: "projectManager",
						name: "Project Manager",
						fixed: false,
						isCheck: false
					},
					{
						id: "accountManger",
						name: "Account Manger",
						fixed: false,
						isCheck: false
					},
					{
						id: "sourceLanguages",
						name: "Source Languages",
						fixed: false,
						isCheck: false
					},
					{
						id: "targetLanguages",
						name: "Target Languages",
						fixed: false,
						isCheck: false
					},
					{
						id: "industry",
						name: "Industry",
						fixed: false,
						isCheck: false
					},
					{
						id: "services",
						name: "Services",
						fixed: false,
						isCheck: false
					},
					{
						id: "isTest",
						name: "Test",
						fixed: false,
						isCheck: false
					},
					{
						id: "projectCurrency",
						name: "Currency",
						fixed: false,
						isCheck: false
					},
					{
						id: "paymentProfile",
						name: "Payment Profile",
						fixed: false,
						isCheck: false
					},
					{
						id: "vendors",
						name: "Vendors",
						fixed: false,
						isCheck: false
					},
					{
						id: "tasksStatuses",
						name: "Tasks Statuses",
						fixed: false,
						isCheck: false
					},
					{
						id: "requestId",
						name: "Request ID",
						fixed: false,
						isCheck: false
					}
				],
				fieldsSetting: [
					{
						id: "projectId",
						name: "Project ID",
						fixed: false,
						isCheck: false
					},
					{
						id: "projectName",
						name: "Project Name",
						fixed: false,
						isCheck: false
					},
					{
						id: "clientName",
						name: "Client Name",
						fixed: false,
						isCheck: false
					},
					{
						id: "startDate",
						name: "Start Date",
						fixed: false,
						isCheck: false
					},
					{
						id: "deadline",
						name: "Deadline",
						fixed: false,
						isCheck: false
					},
					{
						id: "languages",
						name: "Languages",
						fixed: false,
						isCheck: false
					},
					{
						id: "projectManager",
						name: "Project Manager",
						fixed: false,
						isCheck: false
					},
					{
						id: "accountManager",
						name: "Account Manger",
						fixed: false,
						isCheck: false
					},
					{
						id: "industry",
						name: "Industry",
						fixed: false,
						isCheck: false
					},
					{
						id: "services",
						name: "Services",
						fixed: false,
						isCheck: false
					},
					{
						id: "isTest",
						name: "Test",
						fixed: false,
						isCheck: false
					},
					{
						id: "payables",
						name: "Payables",
						fixed: false,
						isCheck: false
					}, {
						id: "receivables",
						name: "Receivables",
						fixed: false,
						isCheck: false
					}, {
						id: "margin",
						name: "Margin",
						fixed: false,
						isCheck: false
					}, {
						id: "marginPercentage",
						name: "Margin %",
						fixed: false,
						isCheck: false
					}, {
						id: "roi",
						name: "Roi",
						fixed: false,
						isCheck: false
					},
					{
						id: "projectCurrency",
						name: "Currency",
						fixed: false,
						isCheck: false
					},
					{
						id: "status",
						name: "Status",
						fixed: false,
						isCheck: false
					},
					{
						id: "paymentProfile",
						name: "Payment Profile",
						fixed: false,
						isCheck: false
					},
					{
						id: "xtrf",
						name: "In XTRF",
						fixed: false,
						isCheck: false
					},
					{
						id: "progress",
						name: "Progress",
						fixed: false,
						isCheck: false
					},
					{
						id: "discounts",
						name: "Discounts",
						fixed: false,
						isCheck: false
					},
					{
						id: "urgent",
						name: "Urgent",
						fixed: false,
						isCheck: false
					},
					{
						id: "vendors",
						name: "Vendors",
						fixed: false,
						isCheck: false
					},
					{
						id: "tasksStatuses",
						name: "Tasks Statuses",
						fixed: false,
						isCheck: false
					},
					{
						id: "requestId",
						name: "Request ID",
						fixed: false,
						isCheck: false
					}
				]
			}
		},
		methods: {
			...mapActions([
				"alertToggle",
				"setUser"
			]),
			clearFilters() {
				this.$router.replace({ 'query': null }).catch((err) => err)
				this.defaultSetter()
				// this.getData()
			},
			async updateFiltersAndFields(data) {
				await this.$http.post('/pm-manage/update-filters-and-fields/' + this.user._id, { data })
				await this.setUser()
			},
			async getData() {
				this.lastDate = new Date()
				this.lastDate.setDate(this.lastDate.getDate() + 1)
				try {
					const result = await this.$http.post(`/pm-manage/allprojects`, { ...this.filters, lastDate: this.lastDate })
					this.allProjects = result.data
					this.lastDate = this.getLastDateFromRes(result)
          this.isDataRemain = true
        } catch (err) {
					this.alertToggle({ message: "Error on project getting data", isShow: true, type: "error" })
				}
			},
			async bottomScrolled() {
				if (this.isDataRemain && this.lastDate) {
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
			filteredPositionByUserSetting() {
				const obj = {
					fields: [],
					filters: []
				}
				if (Object.keys(this.user).length) {
					const { layoutsSettings: { project: { fields, filters } } } = this.user

					if (fields.length) {
						fields.forEach(filed => {
							const _idx = this.fieldsSetting.findIndex(({ id }) => id === filed)
							if (_idx !== -1) obj.fields.push(this.fieldsSetting[_idx])
						})
						const rest = this.fieldsSetting.filter(({ id }) => !obj.fields.map(item => item.id).includes(id))
						obj.fields.push(...rest)
					} else {
						obj.fields.push(...this.fieldsSetting)
					}

					if (filters.length) {
						filters.forEach(filter => {
							const _idx = this.filtersSetting.findIndex(({ id }) => id === filter)
							if (_idx !== -1) obj.filters.push(this.filtersSetting[_idx])
						})
						const rest = this.filtersSetting.filter(({ id }) => !obj.filters.map(item => item.id).includes(id))
						obj.filters.push(...rest)
					} else {
						obj.filters.push(...this.filtersSetting)
					}
				}
				return obj
			},
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
  @import "../../../assets/scss/colors";

  .all-projects {
    width: 1530px;
    margin: 50px 50px 0 50px;
    position: relative;
  }

  .clear-filter {
    position: absolute;
    right: 10px;
    top: 48px;
    background: #fff;
    border: 1px solid $border;
    border-radius: 4px;
    cursor: pointer;
    padding: 5px;
    transition: .2s ease-out;

    & i {
      color: #9c9c9c;
      height: 20px;
      width: 20px;
      display: -ms-flexbox;
      display: flex;
      -ms-flex-pack: center;
      justify-content: center;
      -ms-flex-align: center;
      align-items: center;
    }

    &:hover {
      & i {
        color: $text;
      }
    }
  }

</style>



