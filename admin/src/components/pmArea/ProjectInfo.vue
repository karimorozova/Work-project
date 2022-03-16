<template lang="pug">
  .layout
    NavbarList(
      v-if="shortProjectList.length"
      :items="shortProjectList"
      :basicLink="'/pangea-projects/all-projects/All/details/'"
    )
    .project-info(v-if="currentProject._id")
      .project-info__leftSide
        Project(:project="currentProject")

        NewTasksAndSteps

        Deliverables(v-if="isStageDelivery")

      .project-info__rigthSide
        ImportedProjectToXtrf(
          v-if="currentProject.isXtrfManual"
          :project="currentProject"
          @refreshProject="refreshProject"
        )
        ImportTasksToXtrf(
          v-else-if="canSendTaskToXtrf"
          :project="currentProject"
          @refreshProject="refreshProject"
        )
        ImportProjectToXtrf(
          v-else-if="canSendToXtrf"
          :project="currentProject"
          @refreshProject="refreshProject"
        )
        ProjectSubInformation(:project="currentProject" @refreshProject="refreshProject")
        ProjectAction(
          :project="currentProject"
          @editAndSend="editAndSend"
          @setStatus="setStatus"
        )
        ProjectFinance
      //.project-info__preview(v-if="isEditAndSend")
      //  Preview(
      //    @closePreview="closePreview"
      //    :message="message"
      //    @send="sendMessage"
      //  )

</template>

<script>
import ImportProjectToXtrf from "./ImportProjectToXtrf"
import ImportedProjectToXtrf from "./ImportedProjectToXtrf"
import Project from "./Project"
import ProjectAction from "./ProjectAction"
import ProjectFinance from "./ProjectFinance"
import NewTasksAndSteps from "./NewTasksAndSteps"
import { mapGetters, mapActions } from 'vuex'
import ProjectSubInformation from './ProjectSubInformation'
import Deliverables from './Deliverables'
import ImportTasksToXtrf from "./ImportTasksToXtrf"
import ValidationErrors from "../ValidationErrors"
import NavbarList from "../NavbarLists"

export default {
  data() {
    return {
      errors: [],
      isEditAndSend: false,
      // message: '',
      mailSubject: '',
      customer: null,
      shortProjectList: []
    }
  },
  methods: {
    ...mapActions([
      "setProjectProp",
      'setProjectStatus',
      'setCurrentProject',
      'alertToggle',
      'removeStepVendor',
      'updateProgress',
      'sendClientQuote',
      'sendProjectDetails',
      'storeCurrentClient'
    ]),
    async setStatus({ option }) {
      try {
        await this.setProjectStatus({ id: this.$route.params.id, status: option })
        this.alertToggle({ message: "Project's status changed", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: err.message, isShow: true, type: "error" })
      }
    },
    async refreshCustomerInfo() {
      const client = await this.$http.get(`/clientsapi/client?id=${ this.currentProject.customer._id }`)
      this.storeCurrentClient(client.data)
      await this.setProjectProp({ prop: 'customer', value: client.body })
    },
    editAndSend({ message, subject }) {
      this.isEditAndSend = true
      this.message = message.data.message
      this.mailSubject = subject
    },
    // async sendMessage({ message }) {
    //   try {
    //     if (this.mailSubject === 'quote') {
    //       await this.sendClientQuote({ message })
    //     }
    //     if (this.mailSubject === 'details') {
    //       await this.sendProjectDetails({ message })
    //     }
    //     this.alertToggle({ message: "Details sent", isShow: true, type: "success" })
    //   } catch (err) {
    //     this.alertToggle({ message: err.message, isShow: true, type: "error" })
    //   }
    //   this.closePreview()
    // },
    // closePreview() {
    //   this.isEditAndSend = false
    // },
    async getProject() {
      const { id } = this.$route.params
      try {
        if (!this.currentProject._id) {
          const curProject = await this.$http.get(`/pm-manage/project?id=${ id }`)
          this.customer = curProject.body.customer
          await this.setCurrentProject(curProject.body)
          await this.storeCurrentClient(curProject.body.customer)
        }
      } catch (err) {
      }
    },
    async refreshProject() {
      try {
        const { id } = this.$route.params
        const curProject = await this.$http.get(`/pm-manage/project?id=${ id }`)
        await this.setCurrentProject(curProject.data)
        this.alertToggle({ message: "Project updated", isShow: true, type: "success" })
      } catch (err) {
      }
    },
    async getShortProjects() {
      try {
        const shortProjectList = await this.$http.get(`/pm-manage/short-project-list`)
        this.shortProjectList = shortProjectList.data.map(i => {
          return { _id: i._id, item1: i.projectId, item2: i.projectName, item3: i.status }
        })
      } catch (err) {
      }
    }
  },
  computed: {
    ...mapGetters({
      currentProject: 'getCurrentProject',
      currentClient: 'getCurrentClient',
      originallyLanguages: 'getAllLanguages',
      originallySteps: 'getAllSteps',
      originallyServices: "getAllServices",
      originallyUnits: "getAllUnits"
    }),
    canSendToXtrf() {
      const { status, tasks } = this.currentProject
      const closedCheck = tasks.length
      return closedCheck && (status === 'Closed' || status === 'In progress' || status === 'Approved')
    },
    canSendTaskToXtrf() {
      const { status, tasks } = this.currentProject

      const closedCheck = tasks.length && (
          tasks.every(({ service }) => service.title === 'Compliance')
      )

      return closedCheck && (status === 'Closed' || status === 'In progress' || status === 'Approved')
    },
    isStageDelivery() {
      return this.currentProject.tasks.some(({ status }) => status === 'Completed' || status === 'Pending Approval [DR1]')
    },
    isFinishedStatus() {
      const finishedStatuses = [ 'Delivered', 'Closed', 'Cancelled', 'Cancelled Halfway' ]
      return finishedStatuses.indexOf(this.currentProject.status) !== -1
    }
  },
  components: {
    NavbarList,
    ValidationErrors,
    ImportTasksToXtrf,
    ImportProjectToXtrf,
    Project,
    ProjectAction,
    NewTasksAndSteps,
    ProjectFinance,
    ProjectSubInformation,
    Deliverables,
    ImportedProjectToXtrf
  },
  async created() {
    await this.getShortProjects()
    await this.getProject()
  },
  watch: {
    async $route(to, from) {
      if (to.name === from.name) {
        if (to.params.id !== from.params.id) {
          this.setCurrentProject({})
          await this.getProject()
        }
      }
    }
  },
  beforeDestroy() {
    this.setCurrentProject({})
  },
  beforeRouteEnter(to, from, next) {
    next(async (vm) => {
      if (from.name === "client-info") {
        await vm.refreshCustomerInfo()
      }
    })
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";


.project-info {
  position: relative;
  display: flex;
  margin: 50px 0 50px 180px;

  &__rigthSide {
    margin-left: 25px;
  }

  &__preview {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 100
  }

  &_bold {
    font-weight: bold;
  }
}
</style>
