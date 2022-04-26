<template lang="pug">
  .todo-list(v-if="!isForbidRouteForRetrievingAndDisplayingData($route) && vendorInProgressJobs.length")
    .list-item(v-for="item in vendorInProgressJobs" :class="`list-item__type-${item.priority}`")
      .list-item__icon
        img(:src="require(`../../assets/images/final/todo-` + `${item.priority}` + `.svg`)" )

      div(v-if="item.type === 'complete'")
        .list-item__content
          span Job
          span(style="font-family:Roboto600;") {{ item.stepId}}
          span has not been completed. Please click on
          u(style="cursor: pointer; margin: 0 4px;" @click="completeJob(item._stepId, item.stepId)") Complete
          span or enter the
          a(style="color:#333; margin: 0 4px;" :href="`/dashboard/job-details/${ item._stepId }_${ item._id }`") job page
          span or further information
      div(v-else)
        .list-item__content(v-html="item.title" )

</template>

<script>
import { mapActions, mapGetters } from "vuex"
import moment from "moment"

export default {
  name: "ImportantVendorTodos",
  data() {
    return {
      domain: '',
      vendorInProgressJobs: [],
      alertsTypes: {
        complete: {
          type: 'complete',
          priority: 'high',
          priorityPosition: 1
        },
        overdueDeadline: {
          type: 'overdueDeadline',
          priority: 'high',
          priorityPosition: 1
        },
        quote: {
          type: 'quote',
          priority: 'medium',
          priorityPosition: 2
        },
        readyToStart: {
          type: 'readyToStart',
          priority: 'medium',
          priorityPosition: 2
        }
      }
    }
  },
  methods: {
    ...mapActions([ 'alertToggle' ]),
    async completeJob(_stepId, stepId) {
      if (!!this.requestCounter) return
      try {
        await this.$axios.post('/vendor/target-files', { stepId: _stepId })
        await this.$axios.post('/vendor/job', { jobId: _stepId, status: 'Completed' })
        await this.$axios.post('/vendor/set-workFlowStatus', { token: this.token, stepId: stepId, stepAction: 'Finish' })
        this.alertToggle({ message: `Job ${ stepId } Completed!`, isShow: true, type: "success" })
        await this.getAlertsVendorJobs()
      } catch (err) {
        console.log(err)
        this.alertToggle({ message: "Error closing, job. Please inform the project manager!", isShow: true, type: "error" })
      }
    },
    async onVendorPortalTabEnter() {
      if (document.visibilityState === 'visible' && !this.isForbidRouteForRetrievingAndDisplayingData(this.$route)) {
        await this.getAlertsVendorJobs()
      }
    },
    async getAlertsVendorJobs() {
      this.lastDate = new Date()
      this.lastDate.setDate(this.lastDate.getDate() + 1)

      const jobs = await this.$axios.post(`/vendor/all-vendor-jobs`, {
        filters: {
          ...this.filters,
          stepsStatuses: { $in: [ 'Request Sent', 'Ready to Start', 'In progress' ] },
          lastDate: this.lastDate,
          vendor: this.vendor._id,
          isFilterZeroFinance: true,
          isLimit: false
        },
        project: {
          '_id': 1,
          'steps._id': 1,
          'steps.stepId': 1,
          'steps.status': 1,
          'steps.payablesUnit': 1,
          'steps.deadline': 1,
          'steps.progress': 1,
          'steps.memoqDocIds': 1
        }
      })
      const memoqQuery = (item) => item.steps.status === 'In progress' && item.steps.payablesUnit.type === 'CAT Wordcount'
      if (jobs.data.some(memoqQuery)) {
        const { _id } = jobs.data.find(memoqQuery)
        await this.$axios.post('/vendor/update-progress', { token: this.token, projectId: _id, isCatTool: true })
      }
      this.vendorInProgressJobs = jobs.data
          .map(item => {
            const { steps: step, _id } = item
            const memoqCond = step.status === 'In progress' && step.payablesUnit.type === 'CAT Wordcount' && typeof step.progress === 'object' && step.memoqDocIds.length

            if (memoqCond) {
              const listOfFullProgress = []
              for (const fileGuid of step.memoqDocIds) listOfFullProgress.push(step.progress[fileGuid].totalWordCount === step.progress[fileGuid].wordsDone)
              if (listOfFullProgress.length && listOfFullProgress.every(Boolean)) return {
                ...this.alertsTypes.complete,
                _id,
                '_stepId': step._id,
                'stepId': step.stepId
              }
            } else if (step.status === 'Ready to Start') {
              return {
                ...this.alertsTypes.readyToStart,
                title: `Job <span style="font-family:Roboto600;">${ step.stepId }</span>
                is Ready to Start. Please enter the <a style="color:#333;" href="/dashboard/job-details/${ step._id }_${ _id }">job page</a> to start working`
              }
            } else if (step.status === 'Request Sent') {
              return {
                ...this.alertsTypes.quote,
                title: `A new offer is pending. Please enter the <a style="color:#333;" href="/dashboard/job-details/${ step._id }_${ _id }">job page</a>
                for further information`
              }
            } else if (moment(item.steps.deadline).diff(moment()) <= 0) {
              return {
                ...this.alertsTypes.overdueDeadline,
                title: `You have missed the deadline for Job <span style="font-family:Roboto600;">${ step.stepId }</span>.
                Please enter the <a style="color:#333;" href="/dashboard/job-details/${ step._id }_${ _id }">job page</a> for further action`
              }
            } else return null
          })
          .filter(Boolean)
          .sort((a, b) => a.priorityPosition - b.priorityPosition)
    },
    isForbidRouteForRetrievingAndDisplayingData(route) {
      const { name } = route
      return name === 'index-dashboard-job-details-id' || name === 'index-completed-jobs-job-details-id'
    }
  },
  async created() {
    if (!this.isForbidRouteForRetrievingAndDisplayingData(this.$route)) {
      await this.getAlertsVendorJobs()
    }
    this.domain = process.env.domain
    document.addEventListener("visibilitychange", this.onVendorPortalTabEnter)
  },
  computed: {
    ...mapGetters({
      token: "getToken",
      vendor: 'getVendor',
      requestCounter: 'getRequestsCount'
    })
  },
  destroyed() {
    document.removeEventListener('visibilitychange', this.onVendorPortalTabEnter)
  },
  watch: {
    $route(to) {
      if (this.isForbidRouteForRetrievingAndDisplayingData(to)) return
      this.getAlertsVendorJobs()
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.todo-list {
  margin-left: 50px;
  margin-top: 25px;
  margin-bottom: -25px;
}

.list-item {
  border-radius: 2px;
  background: white;
  width: 1000px;
  padding: 10px 12px;
  margin-bottom: 7px;
  box-sizing: border-box;
  border: 1px solid $light-border;
  display: flex;
  align-items: center;
  gap: 10px;

  &__icon {
    height: 21px;
    width: 21px;
  }

  &__content {
    margin-top: 3px;
  }

  &__type {
    &-high {
      border-left: 2px solid $red;
    }

    &-medium {
      border-left: 2px solid $yellow;
    }
  }
}
</style>