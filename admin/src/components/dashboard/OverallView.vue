<template lang="pug">
  .overallView
    .row
      .col
        DueToday( :projects="dueToday")
      .col
        StartedToday( :projects="startedToday")
    .row
      .col
        Quotes( :projects ="quotes")

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
	import DueToday from "./Tables/DueToday"
	import StartedToday from "./Tables/StartedToday"
	import Quotes from "./Tables/Quotes"
	import { mapGetters } from "vuex"

	export default {
		data() {
			return {
				projects: [],
				startDateMonth: moment({ hour: 0, minute: 0, second: 0 }).subtract(30, 'days').toDate()
			}
		},
		methods: {},
		computed: {
			...mapGetters({
				user: 'getUser'
			}),
			filteredForPmAmOrAdmin() {
				if (!this.user.hasOwnProperty('group')) return []
				const userGroup = this.user.group.name
				if (userGroup === 'Administrators' || userGroup === "Developers") return this.projects
				if (userGroup === 'Account Managers')
					return this.projects.filter(({ accountManager }) => {
						return accountManager._id === this.user._id
					})

				if (userGroup === "Project Managers")
					return this.projects.filter(({ projectManager }) => {
						return projectManager._id === this.user._id
					})
			},
			dueToday() {
				return this.filteredForPmAmOrAdmin.length
						? this.filteredForPmAmOrAdmin.filter((project) => {
							return moment(0, "HH").isSame(project.deadline, 'days')
						})
						: []
			},
			startedToday() {
				return this.filteredForPmAmOrAdmin.length
						? this.filteredForPmAmOrAdmin.filter((project) => {
							return moment(0, "HH").isSame(project.startDate, 'days')
						})
						: []
			},
			quotes() {
				const STATUSES = [ 'Draft', 'Cost Quote', 'Quote sent' ]
				return this.filteredForPmAmOrAdmin.length
						? this.filteredForPmAmOrAdmin.filter((project) => {
							return STATUSES.includes(project.status)
						})
						: []
			},
			currentDate() {

			}
		},
		async created() {
			this.projects = (await this.$http.get('/dashboard-api/due-today')).data
		},
		components: {
			DueToday,
			StartedToday,
			Quotes,
			ProjectFinanceStats
		}
	}
</script>
<style lang="scss" scoped>
  .overallView {
    width: 1550px;
    margin: 50px;

    .row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 50px;
    }

    .col {
      width: 750px;
      padding: 10px 20px 20px;
      box-shadow: rgba(81, 68, 48, 0.3) 0px 1px 2px 0px, rgba(81, 68, 48, 0.15) 0px 1px 3px 1px;
      box-sizing: border-box;
      background-color: white;
      border-radius: 4px;
      position: relative;
    }
  }
</style>