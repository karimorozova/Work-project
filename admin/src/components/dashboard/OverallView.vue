<template lang="pug">
  .overallView
    div(v-if="isAdmin")
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

    div(v-else-if="isComplianceCoordinator" )
      .row
        .col
          IncomingRequests( :projects="incomingRequests")
        .col
          AcceptedRequest( :projects="acceptedRequest")
      .row
        .col
          Dr1(:projects="dr1")
        .col
          Dr2(:projects="dr2")
      .row
        .col
          DueToday( :projects="dueToday")
        .col
          StartedToday( :projects="startedToday")

    div(v-else)
      .row(v-if="isPm")
        .col
          AcceptedRequest( :projects="acceptedRequest")
        .col
          Dr1(:projects="dr1")
      .row(v-if="isAm")
        .col
          IncomingRequests( :projects="incomingRequests")
        .col
          Dr2(:projects ="dr2")
      .row
        .col
          DueToday(:projects="dueToday")
        .col
          StartedToday(:projects="startedToday")
      .row
        .col
          Quotes(:projects ="quotes")
        .col
          MyQuotes(:projects ="myQuotes")

</template>
<script>
import ProjectFinanceStats from "./OverallViewChildrens/ProjectFinanceStats"
import moment from "moment"
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
  components: {
    DueToday,
    StartedToday,
    Quotes,
    MyQuotes,
    IncomingRequests,
    AcceptedRequest,
    ProjectFinanceStats,
    Dr1,
    Dr2
  },
  data() {
    return {
      projects: [],
      clientRequest: [],
      stats: {},
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
      if (this.isAm || this.isComplianceCoordinator) return clientRequest.filter(({ accountManager, projectManager }) => accountManager === this.user._id || accountManager === null
          || (this.user._id.toString() === "61b359f25c9ee507f4aa7a14" && projectManager === "60b4dee7f2611f5115701566")
      )
    },
    acceptedRequest() {
      if (!this.user.hasOwnProperty('group')) return []
      const clientRequest = this.clientRequest.filter(({ status }) => status === "Request Approved")
      if (this.isAdmin) return clientRequest
      if (this.isComplianceCoordinator) {
        return clientRequest.filter(({ accountManager, projectManager }) => {
          return accountManager === this.user._id || (this.user._id.toString() === "61b359f25c9ee507f4aa7a14" && projectManager === "60b4dee7f2611f5115701566")
        })
      }
      if (this.isPm) {
        return clientRequest.filter(({ projectManager }) => {
          return projectManager === this.user._id
        })
      }
    },
    dr1() {
      if (!this.user.hasOwnProperty('group')) return []
      if (this.isAdmin) return this.projects.filter(item => {
        return item.tasks.some(({ status }) => status === 'Pending Approval [DR1]')
      })
      if (this.isComplianceCoordinator) {
        return this.projects.filter(item => {
          const DR1Tasks = item.tasks.filter(({ status }) => status === 'Pending Approval [DR1]').length
          return DR1Tasks && (item.accountManager._id === this.user._id || (this.user._id.toString() === "61b359f25c9ee507f4aa7a14" && item.projectManager._id === "60b4dee7f2611f5115701566"))
        })
      }
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

      if (this.isAm || this.isComplianceCoordinator) {
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
      if (this.isAm || this.isComplianceCoordinator)
        return this.projects.filter(({ accountManager, projectManager }) => {
          return accountManager._id === this.user._id || (this.user._id.toString() === "61b359f25c9ee507f4aa7a14" && projectManager._id === "60b4dee7f2611f5115701566")
        })

      if (this.isPm)
        return this.projects.filter(({ projectManager }) => {
          return projectManager._id === this.user._id
        })
    },
    dueToday() {
      if (this.filteredForPmAmOrAdmin.length) {
        return [ ...this.filteredForPmAmOrAdmin.filter((project) => moment(0, "HH").isSame(project.deadline, 'days')) ]
        // return today.map(item => {
        //   item.class = moment(item.deadline).diff(moment()) <= 0 ? 'red-row' : ''
        //   return item
        // })
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
    },
    isComplianceCoordinator() {
      if (!this.user.hasOwnProperty('group')) return false
      return this.user.position === 'Compliance Coordinator'
    }
  },
  async created() {
    this.projects = (await this.$http.get('/dashboard-api/all-projects')).data
    this.clientRequest = (await this.$http.get('/dashboard-api/all-client-requests')).data
  }
}
</script>
<style lang="scss" scoped>
@import "../../assets/scss/colors";

.overallView {
  margin: 50px 0 50px 50px;

  .row {
    display: flex;
    margin-bottom: 25px;
    gap: 25px;
  }

  .col {
    width: 770px;
    padding: 15px 25px 25px;
    box-shadow: $box-shadow;
    box-sizing: border-box;
    background-color: white;
    border-radius: 2px;
    position: relative;
    align-self: baseline;
  }

  .col-size {
    width: 755px;
    box-sizing: border-box;
  }
}
</style>