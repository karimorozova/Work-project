<template lang="pug">
  .overallView
    div(v-if="isAdmin")
      .row(v-if="user.email === 'michal@pangea.global'")
        .col
          XtrfStatsToday( :xtrfStats="todayStats")
      .row
        .col
          AcceptedRequest( :projects="acceptedRequest")
        .col
          IncomingRequests( :projects="incomingRequests")
      .row
        .col
          Dr1( :projects="dr1")
        .col
          Dr2( :projects ="dr2")
      .row
        .col
          DueToday( :projects="dueToday")
        .col
          StartedToday( :projects="startedToday")
      .row
        .col
          Quotes( :projects ="quotes")
        .col
          MyQuotes( :projects ="myQuotes")

    div(v-else)
      .row(v-if="isPm")
        .col
          AcceptedRequest( :projects="acceptedRequest")
        .col
          Dr1( :projects="dr1")
      .row(v-if="isAm")
        .col
          IncomingRequests( :projects="incomingRequests")
        .col
          Dr2( :projects ="dr2")
      .row
        .col
          DueToday( :projects="dueToday")
        .col
          StartedToday( :projects="startedToday")
      .row
        .col
          Quotes( :projects ="quotes")
        .col
          MyQuotes( :projects ="myQuotes")


    //.overallView__col
      .col__title Today
      ProjectFinanceStats
    //.overallView__spaceLine
      .overallView__spaceLine-line
    //.overallView__col
      .col__title Month
      ProjectFinanceStats(:startDateSet="startDateMonth")

</template>
<script>
	import ProjectFinanceStats from "./OverallViewChildrens/ProjectFinanceStats"
	import moment from "moment"
	import XtrfStatsToday from "./Tables/XtrfStatsToday"
	import DueToday from "./Tables/DueToday"
	import StartedToday from "./Tables/StartedToday"
	import Quotes from "./Tables/Quotes"
	import MyQuotes from "./Tables/MyQuotes"
	import IncomingRequests from "./Tables/IncomingRequests"
	import AcceptedRequest from "./Tables/AcceptedRequest"
	import Dr1 from "./Tables/Dr1"
	import Dr2 from "./Tables/Dr2"
	import { mapGetters } from "vuex"

	export default {
		data() {
			return {
				projects: [],
				clientRequest: [],
				todayStats: {},
				startDateMonth: moment({ hour: 0, minute: 0, second: 0 }).subtract(30, 'days').toDate()
			}
		},
		methods: {},
		computed: {
			...mapGetters({
				user: 'getUser'
			}),
			incomingRequests() {
				if (!this.user.hasOwnProperty('group')) return []
				const clientRequest = this.clientRequest.filter(({ status }) => status === "Client Request")
				if (this.isAdmin) return clientRequest
				if (this.isAm) return clientRequest.filter(({ accountManager }) => accountManager === this.user._id || accountManager === null)
			},
			acceptedRequest() {
				if (!this.user.hasOwnProperty('group')) return []
				const clientRequest = this.clientRequest.filter(({ status }) => status === "Request Approved")
				if (this.isAdmin) return clientRequest
				if (this.isPm)
					return clientRequest.filter(({ projectManager }) => {
						return projectManager === this.user._id
					})
			},
			dr1() {
				if (!this.user.hasOwnProperty('group')) return []
				if (this.isAdmin) return this.projects.filter(item => {
					return item.tasks.some(({ status }) => status === 'Pending Approval [DR1]')
				})
				if (this.isPm) {
					return this.projects.filter(item => {
						const DR1Tasks = item.tasks.filter(({ status }) => status === 'Pending Approval [DR1]').map(item => item.taskId)
						return item.tasksDR1.some(({ dr1Manager, taskId }) => dr1Manager === this.user._id && DR1Tasks.includes(taskId))
					})
				}
			},
			dr2() {
				if (!this.user.hasOwnProperty('group')) return []
				if (this.isAdmin) return this.projects.filter(item => {
					return item.hasOwnProperty('tasksDR2')
							&& (item.tasksDR2.singleLang.filter(item => item.status !== 'Delivered').length || item.tasksDR2.multiLang.filter(item => item.status !== 'Delivered').length)
				})

				if (this.isAm) {
					return this.projects.filter(project => {
						return project.hasOwnProperty('tasksDR2')
								&& ((project.tasksDR2.singleLang.filter(item => item.status !== 'Delivered').length ? project.tasksDR2.singleLang.filter(item => item.status !== 'Delivered').some(singleLang => singleLang.files.some(({ dr2Manager }) => dr2Manager === this.user._id)) : false)
										|| (project.tasksDR2.multiLang.filter(item => item.status !== 'Delivered').length ? project.tasksDR2.multiLang.filter(item => item.status !== 'Delivered').some(multiLang => multiLang.file.some(({ dr2Manager }) => dr2Manager === this.user._id)) : false)
								)
					})
				}
			},
			filteredForPmAmOrAdmin() {
				if (!this.user.hasOwnProperty('group')) return []
				if (this.isAdmin) return this.projects
				if (this.isAm)
					return this.projects.filter(({ accountManager }) => {
						return accountManager._id === this.user._id
					})

				if (this.isPm)
					return this.projects.filter(({ projectManager }) => {
						return projectManager._id === this.user._id
					})
			},
			dueToday() {
				if (this.filteredForPmAmOrAdmin.length) {
					const today = this.filteredForPmAmOrAdmin.filter((project) => moment(0, "HH").isSame(project.deadline, 'days'))
					return today.map(item => {
						item.class = moment(item.deadline).diff(moment()) <= 0 ? 'red-row' : ''
						return item
					})
				}
			},
			startedToday() {
				return this.filteredForPmAmOrAdmin.length
						? this.filteredForPmAmOrAdmin.filter((project) => {
							return moment(0, "HH").isSame(project.startDate, 'days')
									&& project.status !== 'Draft'
									&& project.status !== 'Cost Quote'
									&& project.status !== 'Quote sent'
						})
						: []
			},
			quotes() {
				const STATUSES = [ 'Draft', 'Cost Quote', 'Quote sent' ]
				return this.projects.length
						? this.projects.filter((project) => {
							return STATUSES.includes(project.status)
						})
						: []
			},
			myQuotes() {
				const STATUSES = [ 'Draft', 'Cost Quote', 'Quote sent' ]
				if (this.isAdmin)
					return this.quotes.filter(({ accountManager, projectManager }) => (accountManager._id === this.user._id || projectManager._id === this.user._id))

				return this.filteredForPmAmOrAdmin.length
						? this.filteredForPmAmOrAdmin.filter((project) => {
							return STATUSES.includes(project.status)
						})
						: []
			},
			isAdmin() {
				if (!this.user.hasOwnProperty('group')) return false
				const userGroup = this.user.group.name
				return userGroup === 'Administrators' || userGroup === 'Developers'
			},
			isPm() {
				if (!this.user.hasOwnProperty('group')) return false
				const userGroup = this.user.group.name
				return userGroup === 'Project Managers'
			},
			isAm() {
				if (!this.user.hasOwnProperty('group')) return false
				const userGroup = this.user.group.name
				return userGroup === 'Account Managers'
			}
		},
		async created() {
			this.projects = (await this.$http.get('/dashboard-api/all-projects')).data
			this.clientRequest = (await this.$http.get('/dashboard-api/all-client-requests')).data
			this.todayStats = (await this.$http.get('/dashboard-api/finance')).data
		},
		components: {
			DueToday,
			XtrfStatsToday,
			StartedToday,
			Quotes,
			MyQuotes,
			IncomingRequests,
			AcceptedRequest,
			ProjectFinanceStats,
			Dr1,
			Dr2
		}
	}
</script>
<style lang="scss" scoped>
  .overallView {
    width: 1530px;
    margin: 50px;

    .row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 35px;
    }

    .col {
      width: 750px;
      padding: 10px 20px 20px;
      box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;
      box-sizing: border-box;
      background-color: white;
      border-radius: 4px;
      position: relative;
      align-self: baseline;
    }
  }
</style>