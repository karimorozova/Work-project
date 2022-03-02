<template lang="pug">
  .activity
    div
      .row
        .col(v-if="isAdmin")
          AllActivity( :allActivity="normalizedAllActivity" @deleteActivityTask="deleteActivityTask")
        .col
          MyActivity( :allActivity="normalizedMyActivity")


</template>
<script>
	import ProjectFinanceStats from "./OverallViewChildrens/ProjectFinanceStats"
	import moment from "moment"
  import { mapActions, mapGetters } from "vuex"
  import AllActivity from "./Tables/AllActivity"
  import MyActivity from "./Tables/MyActivity"

	export default {
		data() {
			return {
        allActivity: [],
			}
		},
		methods: {
      ...mapActions({
        alertToggle: "alertToggle"
      }),
      async deleteActivityTask({ id }) {
        try {
          await this.$http.delete(`/dashboard-api/activity/task/${ id }/delete`)
          await this.getTaskActivity()
          this.alertToggle({ message: "Activity deleted", isShow: true, type: "success" })
        } catch (e) {
          this.alertToggle({ message: "Error on deleting Activity", isShow: true, type: "error" })
        }
      },
      async getTaskActivity() {
        this.allActivity = (await this.$http.get('/dashboard-api/all-client-activity')).data
      }
    },
		computed: {
			...mapGetters({
				user: 'getUser'
			}),
      normalizedAllActivity() {
        return this.allActivity.map(activity => {
          activity.normAssociatedTo = activity.associatedTo.map(({firstName, surname}) => firstName+ ' ' + surname).join('; ') || '-'
          activity.normAssignedTo = activity.assignedTo.firstName + ' ' + activity.assignedTo.lastName
          if (activity.client == null ) {
            activity.client = {_id: '', name: 'N/A'}
          }
          activity.class = moment(activity.dateTime).diff(moment()) <= 0 ? 'red-row' : ''
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
			},
		},
		async created() {
		  await this.getTaskActivity()
		},
		components: {
      AllActivity,
      MyActivity
		}
	}
</script>
<style lang="scss" scoped>
  @import "../../assets/scss/colors";
  .activity {
    width: 1530px;
    margin: 50px;

    .row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 35px;
    }

    .col {
      width: 755px;
      padding: 10px 20px 20px;
      box-shadow: $box-shadow;
      box-sizing: border-box;
      background-color: white;
      border-radius: 4px;
      position: relative;
      align-self: baseline;
    }
  }
</style>