<template lang="pug">
  .activity
    div(v-if="isAdmin")
      .row
        .col
          AllActivity( :allActivity="normalizedAllActivity")

    div(v-else)
      .row
        .col
          MyActivity( :allActivity="normalizedMyActivity")


</template>
<script>
	import ProjectFinanceStats from "./OverallViewChildrens/ProjectFinanceStats"
	import moment from "moment"
	import { mapGetters } from "vuex"
  import AllActivity from "./Tables/AllActivity"
  import MyActivity from "./Tables/MyActivity"

	export default {
		data() {
			return {
        allActivity: [],
			}
		},
		methods: {},
		computed: {
			...mapGetters({
				user: 'getUser'
			}),
      normalizedAllActivity() {
        return this.allActivity.map(activity => {
          activity.normAssociatedTo = activity.associatedTo.map(({firstName, surname}) => firstName+ ' ' + surname).join('; ')
          activity.normAssignedTo = activity.assignedTo.firstName + ' ' + activity.assignedTo.lastName
          return activity
        })
      },
      normalizedMyActivity() {
			  return this.normalizedAllActivity.filter(activity => activity.assignedTo._id === this.user._id)
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
			this.allActivity = (await this.$http.get('/dashboard-api/all-client-activity')).data
		},
		components: {
      AllActivity,
      MyActivity
		}
	}
</script>
<style lang="scss" scoped>
  .activity {
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