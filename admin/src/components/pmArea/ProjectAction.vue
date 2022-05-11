<template lang="pug">
  .project-actions

    .project-action
      .project-action__preview(v-if="isEditAndSendQuote")
        PreviewQuote(
          @closePreview="closePreview"
          :allMails="projectClientContacts"
          :message="previewMessage" @send="sendMessageQuotes"
        )

      .project-action__preview(v-if="isEditAndSendCostQuote")
        PreviewQuote(
          @closePreview="closePreview"
          :allMails="projectClientContacts"
          :message="previewMessage"
          @send="sendMessageCostQuotes"
        )

      .project-action__preview(v-if="isEditAndSendCancel")
        Preview(
          @closePreview="closePreview"
          :message="previewMessage"
          @send="sendMessageCancel"
        )

      .project-action__title(:style="{'padding-bottom': '8px'}")
        .project-action__title-text Project Actions

      .project-action__drop-menuSend
        .project-action__dropBody
          SelectSingle(
            :isDisabled="!isAm && !isPm && !isAdmin"
            :selectedOption="selectedAction"
            :options="filteredActions"
            placeholder="Select Action"
            @chooseOption="setAction"
          )
      .project-action__confirm(v-if="isAction('Delete') && project.status !== 'Closed'")
        .project-action__button
          Button(:value="'Confirm'" @clicked="makeApprovedAction" :isDisabled="!canDelete")

      .project-action__confirm(v-if="isAction('ReOpen') && project.status !== 'Rejected'")
        .project-action__button
          Button(:value="'Confirm'" @clicked="approveAction = true")

      .project-action__confirm(v-if="isAction('ReOpen') && project.status === 'Rejected'")
        .project-action__button
          Button(:value="'Confirm'" @clicked="approveActionToDraft = true")

      .project-action__confirm(v-if="isAction('Close Project')")
        .project-action__button
          Button(:value="'Confirm'" @clicked="makeApprovedAction")

      .project-action__confirm(v-if="isAction('Accept/Reject Quote')")
        .project-action__button
          Button(:value="'Accept'" @clicked="makeApprovedAction")
        .project-action__button(v-if="isAlternativeAction")
          Button(:value="'Reject'" @clicked="makeAlterAction")

      .project-action__setting(v-if="isAction('Send a Quote')")
        .project-action__confirm
          Button(:value="'Edit & Send'" @clicked="getSendQuoteMessage")

      .project-action__setting(v-if="isAction('Cost Quote')")
        .project-action__confirm
          Button(:value="'Edit & Send'" @clicked="getSendCostQuoteMessage")

      .project-action__setting(v-if="isAction('Cancel')")
        .project-action__drop-menu
          SelectSingle(
            :selectedOption="selectedReason"
            :options="reasons"
            placeholder="Select Reason"
            @chooseOption="setReason"
          )
        .project-action__setting(v-if="project.status === 'In progress'")
          .project-action__payment
            .project-action__payment-span
              span Partial Payment:
            .project-action__checkbox
              Toggler(
                :isDisabled="false"
                :isActive="isPay"
                @toggle="isPay = !isPay"
              )
        .project-action__buttonRow
          .project-action__confirm
            Button(:value="'Confirm'" @clicked="getCancelMessage")
          .project-action__confirm
            Button(:value="'Confirm Without Notification'" @clicked="cancelProjectWithoutNotification")

    .project-action
      .project-action__title(:style="{'padding-bottom': '8px'}")
        .project-action__title-text Managers

      .drops
        .drops__item
          .drops__label Account Manager:
          .drops__menu(v-if="!isProjectFinished")
            SelectSingle(
              :isDisabled="!isAm && !isPm && !isAdmin"
              :options="accManagers"
              :selectedOption="selectedAccManager"
              @chooseOption="(e) => setManager(e, 'accountManager')"
            )
          .drops__menuTitle(v-else) {{ selectedAccManager }}
        .drops__item
          .drops__label Project Manager:
          .drops__menu(v-if="!isProjectFinished")
            SelectSingle(
              :isDisabled="!isAm && !isPm && !isAdmin"
              :options="projManagers"
              :selectedOption="selectedProjManager"
              @chooseOption="(e) => setManager(e, 'projectManager')"
            )
          .drops__menuTitle(v-else) {{ selectedProjManager }}
        slot

    .approve-action(v-if="approveAction")
      ApproveModal(
        text="Are you sure you want to re-open the project?"
        approveValue="Yes"
        notApproveValue="Cancel"
        @approve="approveModal"
        @close="closeModal"
        @notApprove="closeModal"
      )

    .approve-action(v-if="approveActionToDraft")
      ApproveModal(
        text="Are you sure you want to re-open the project?"
        approveValue="Yes"
        notApproveValue="Cancel"
        @approve="approveModalToDraft"
        @close="closeModal"
        @notApprove="closeModal"
      )

</template>

<script>
import Preview from '../vendors/WYSIWYG'
import SelectSingle from '../SelectSingle'
import SelectMulti from '../SelectMulti'
import Button from '../Button'
import { mapGetters, mapActions } from 'vuex'
import ApproveModal from '../ApproveModal'
import PreviewQuote from "./WYSIWYGMultiMails"
import { deleteProject } from "../../vuex/pmarea/actions"
import Toggler from "../Toggler"

export default {
  props: {
    project: {
      type: Object
    }
  },
  data() {
    return {
      previewMessage: '',
      selectedAction: '',
      selectedReason: '',
      reasons: [],
      managers: [],
      actions: [ 'Cancel' ],
      approveButtonValue: 'Confirm',
      alternativeButtonValue: 'Reject',
      isAlternativeAction: false,
      isPay: false,
      approveAction: false,
      approveActionToDraft: false,

      isEditAndSendCostQuote: false,
      isEditAndSendQuote: false,
      isEditAndSendCancel: false
    }
  },
  methods: {
    ...mapActions({
      setRequestValue: 'setRequestValue',
      setProjectValue: 'setProjectValue',
      alertToggle: 'alertToggle',
      storeProject: 'setCurrentProject',
      setProjectStatus: 'setProjectStatus',
      sendClientQuote: 'sendClientQuote',
      sendProjectDetails: 'sendProjectDetails',
      deleteProject: 'deleteProject',
      sendCancelProjectMessage: 'sendCancelProjectMessage',
      sendClientCostQuote: 'sendClientCostQuote'
    }),
    closeModal() {
      this.approveAction = false
      this.approveActionToDraft = false
    },
    approveModal() {
      this.reOpenProject()
      this.approveAction = false
      this.selectedAction = ''
    },
    approveModalToDraft() {
      this.reOpenProjectToDraft()
      this.approveActionToDraft = false
      this.selectedAction = ''
    },
    closePreview() {
      this.isEditAndSendCancel = false
      this.isEditAndSendQuote = false
      this.isEditAndSendCostQuote = false
      this.previewMessage = ""
      this.selectedAction = ""
      this.selectedReason = ""
    },
    openPreviewCancel() {
      this.isEditAndSendCancel = true
    },
    openPreviewQuote() {
      this.isEditAndSendQuote = true
    },
    openPreviewCostQuote() {
      this.isEditAndSendCostQuote = true
    },
    async getCancelMessage() {
      try {
        const template = await this.$http.post("/pm-manage/making-cancel-message", { ...this.project, cancelStatus: 'Cancelled', reason: this.selectedReason, isPay: this.isPay })
        this.previewMessage = template.data.message
        this.openPreviewCancel()
      } catch (err) {
        this.alertToggle({ message: err.message, isShow: true, type: "error" })
      }
    },
    async getSendCostQuoteMessage() {
      try {
        if (!this.project.clientBillingInfo) return this.alertToggle({ message: "Billing Info cannot be empty" , isShow: true, type: "error" })
        const template = await this.$http.get(`/pm-manage/quote-cost-message?projectId=${ this.project._id }`)
        this.previewMessage = template.data.message
        this.openPreviewCostQuote()
      } catch (err) {
        this.alertToggle({ message: err.message, isShow: true, type: "error" })
      }
    },
    async getSendQuoteMessage() {
      try {
        if (!this.project.clientBillingInfo) return this.alertToggle({ message: "Billing Info cannot be empty" , isShow: true, type: "error" })
        const template = await this.$http.get(`/pm-manage/quote-message?projectId=${ this.project._id }`)
        this.previewMessage = template.data.message
        this.openPreviewQuote()
      } catch (err) {
        this.alertToggle({ message: err.message, isShow: true, type: "error" })
      }
    },
    async sendMessageCostQuotes({ message, arrayOfEmails }) {
      try {
        await this.sendClientCostQuote({ message, arrayOfEmails })
        this.alertToggle({ message: "Cost Quote sent", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: err.message, isShow: true, type: "error" })
      } finally {
        this.setDefaults()
        this.closePreview()
      }
    },
    async sendMessageQuotes({ message, arrayOfEmails }) {
      try {
        await this.clientQuote(message, arrayOfEmails)
        this.alertToggle({ message: "Quote sent", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: err.message, isShow: true, type: "error" })
      } finally {
        this.setDefaults()
        this.closePreview()
      }
    },
    async sendMessageCancel(message) {
      try {
        await this.setProjectStatus({ id: this.$route.params.id, status: "Cancelled", reason: this.selectedReason || "" })
        await this.sendCancelProjectMessage({ id: this.project._id, message, isNotify: true })
        this.alertToggle({ message: "Sent successfully", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: err.message, isShow: true, type: "error" })
      } finally {
        this.setDefaults()
        this.closePreview()
      }
    },
    async cancelProjectWithoutNotification() {
      try {
        await this.setProjectStatus({ id: this.$route.params.id, status: "Cancelled", reason: this.selectedReason || "" })
        await this.sendCancelProjectMessage({ id: this.project._id, message: null, isNotify: false })
        this.alertToggle({ message: "Sent successfully", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: err.message, isShow: true, type: "error" })
      } finally {
        this.setDefaults()
        this.closePreview()
      }
    },
    isAction(action) {
      return this.selectedAction === action
    },
    setDefaults() {
      this.selectedAction = ""
      this.approveButtonValue = "Confirm"
      this.isAlternativeAction = false
    },
    setReason({ option }) {
      this.selectedReason = option
    },
    setAction({ option }) {
      this.selectedAction = option
      this.isAlternativeAction = false
      if (this.selectedAction === "Accept/Reject Quote") {
        this.approveButtonValue = "Accept"
        this.alternativeButtonValue = "Reject"
        this.isAlternativeAction = true
      }
    },
    async makeApprovedAction(message) {
      try {
        switch (this.selectedAction) {
          case "Send Project Details":
            await this.projectDetails(message)
            break
          case "Close Project":
            if (!this.project.clientBillingInfo) {
              alert('Set BI!')
              return
            }
            const updatedProject = await this.$http.post('/pm-manage/close-project', { projectId: this.project._id })
            await this.storeProject(updatedProject.data)
            break
          case "Accept/Reject Quote":
            await this.acceptQuote()
            break
          case "Delete":
            await this.deleteProjectAction()
            break
        }
      } catch (err) {
        this.alertToggle({ message: "Internal server error. Cannot execute chosen action.", isShow: true, type: "error" })
      } finally {
        this.setDefaults()
      }
    },
    async deleteProjectAction() {
      try {
        await this.deleteProject({ projectId: this.project._id })
        this.$router.back()
        this.alertToggle({ message: "Project deleted!", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Project not deleted!", isShow: true, type: "error" })
      }
    },
    async reOpenProjectToDraft() {
      await this.setStatus('Draft', "")
    },
    async reOpenProject() {
      let status
      if (this.project.status === 'Cancelled' || this.project.status === 'Cancelled Halfway') {
        status = 'fromCancelled'
      } else {
        status = 'fromClosed'
      }
      await this.setStatus(status, '')
    },
    async clientQuote(message, arrayOfEmails) {
      try {
        await this.sendClientQuote({ projectId: this.$route.params.id, message, arrayOfEmails })
        this.alertToggle({ message: 'Details sent', isShow: true, type: 'success' })
      } catch (err) {
        this.alertToggle({ message: err.message, isShow: true, type: "error" })
      }
    },
    async projectDetails(message) {
      try {
        await this.sendProjectDetails({ message })
        this.alertToggle({ message: "Details sent", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: err.message, isShow: true, type: "error" })
      }
    },
    async makeAlterAction() {
      try {
        if (this.selectedAction === "Accept/Reject Quote") await this.rejectQuote()
      } catch (err) {
        this.alertToggle({ message: "Internal server error. Cannot execute chosen action.", isShow: true, type: "error" })
      } finally {
        this.setDefaults()
      }
    },
    async setStatus(status, reason) {
      try {
        const id = this.$route.params.id
        await this.setProjectStatus({ id, status, reason })
        this.alertToggle({ message: "Project's status changed", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: err.message, isShow: true, type: "error" })
      }
    },
    async acceptQuote() {
      if (!this.project.clientBillingInfo) return this.alertToggle({ message: "Billing Info cannot be empty" , isShow: true, type: "error" })
      const status = "Approved"
      try {
        await this.setStatus(status)
      } catch (err) {
        this.alertToggle({ message: err.message, isShow: true, type: "error" })
      }
    },
    async rejectQuote() {
      try {
        await this.setStatus("Rejected")
      } catch (err) {
        this.alertToggle({ message: err.message, isShow: true, type: "error" })
      }
    },
    async setManager({ option }, prop) {
      const manager = this.managers.find(item => `${ item.firstName } ${ item.lastName }` === option)
      if (manager._id === this.project[prop]._id) return
      if (this.type === "project") {
        await this.setProjectValue({ id: this.project._id, prop, value: manager })
      }
    },
    async getManagers() {
      try {
        const result = await this.$http.get('/users')
        this.managers = result.data
      } catch (err) {
        this.alertToggle({ message: 'Error on getting managers', isShow: true, type: 'error' })
      }
    },
    isAllDeliveredTasks(tasksDR2) {
      let statuses = []
      if (tasksDR2.hasOwnProperty('singleLang')) {
        const { singleLang } = tasksDR2
        for (const { status } of singleLang) statuses.push(status)
      }
      if (tasksDR2.hasOwnProperty('multiLang')) {
        const { multiLang } = tasksDR2
        for (const { status } of multiLang) statuses.push(status)
      }
      return statuses.every(item => item === 'Delivered')
    }
  },
  computed: {
    ...mapGetters({
      currentClient: 'getCurrentClient',
      user: 'getUser'
    }),
    isPm() {
      if (!this.user.hasOwnProperty('group')) return false
      return this.project.projectManager._id === this.user._id
    },
    isAm() {
      if (!this.user.hasOwnProperty('group')) return false
      return this.project.accountManager._id === this.user._id || (this.user._id.toString() === "61b359f25c9ee507f4aa7a14" && this.project.projectManager._id === "60b4dee7f2611f5115701566")
    },
    isAdmin() {
      if (!this.user.hasOwnProperty('group')) return false
      return this.user.group.name === 'Administrators' || this.user.group.name === 'Developers'
    },
    isProjectFinished() {
      const { status } = this.project
      return status === 'Closed' || status === 'Cancelled Halfway' || status === 'Cancelled'
    },
    canDelete() {
      return status !== 'Closed'
          && (this.project.projectManager._id === this.user._id || this.user.group.name === 'Administrators' || this.user.group.name === 'Developers')
    },
    projectClientContacts() {
      return this.project.clientContacts.map(({ _id, email, photo, firstName }) => ({ _id, email, photo, firstName }))
    },
    type() {
      return this.project.projectId ? 'project' : 'request'
    },
    accManagers() {
      let result = []
      if (this.managers.length) {
        result = this.managers.filter(item => item.group.name === 'Account Managers')
        result = result.map(item => `${ item.firstName } ${ item.lastName }`)
      }
      return result
    },
    projManagers() {
      let result = []
      if (this.managers.length) {
        result = this.managers.filter(item => item.group.name === "Project Managers")
        result = result.map(item => `${ item.firstName } ${ item.lastName }`)
      }
      return result
    },
    selectedAccManager() {
      return this.project.accountManager ? this.project.accountManager.firstName + " " + this.project.accountManager.lastName : ""
    },
    selectedProjManager() {
      return this.project.projectManager ? this.project.projectManager.firstName + " " + this.project.projectManager.lastName : ""
    },
    filteredActions() {
      let result = this.actions
      const nonStartedStatuses = [
        "Draft",
        "Cost Quote",
        "Quote sent",
        "Cancelled"
      ]

      if (this.project.status === "Approved") {
        result = [ "Cancel" ]
      }

      if (nonStartedStatuses.indexOf(this.project.status) !== -1) {
        result = [ "Send a Quote", "Cost Quote", "Accept/Reject Quote", "Cancel" ]
      }

      if (this.project.status === 'Started' || this.project.status === 'In progress') {
        // const { tasks, tasksDR2 } = this.project
        // const isAllTasksCompleted = tasks.filter(({ status }) => status !== 'Cancelled' && status !== 'Cancelled Halfway').every(({ status }) => status === 'Completed')
        // if (isAllTasksCompleted && this.isAllDeliveredTasks(tasksDR2)) result = [ "Close Project" ]
        result = [ "Send Project Details", "Cancel", 'Close Project' ]
      }

      if (this.project.status === 'Closed') {
        // result = [ 'ReOpen' ]
        result = []
      }

      if (this.project.status === 'Rejected') {
        result = [ 'ReOpen', 'Cancel' ]
      }

      if (this.project.status === 'Cancelled' || this.project.status === 'Cancelled Halfway') {
        result = []
      }

      if (!result.includes('Delete') && this.project.status !== 'Closed') result.push('Delete')

      return result
    }
  },
  async created() {
    const reasons = await this.$http.get("/api/reasons")
    for (let key in reasons.data) this.reasons.push(reasons.data[key].reason)
    await this.getManagers()
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.project-actions {
  position: relative;
}

.project-action {
  padding: 25px;
  box-shadow: $box-shadow;
  box-sizing: border-box;
  width: 400px;
  margin-top: 25px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  background: white;
  border-radius: 2px;

  &__buttonRow {
    display: flex;
    gap: 20px;
  }

  &__dropBody {
    position: relative;
    width: 220px;
    height: 32px;
  }

  &__setting {
    display: flex;
    flex-direction: column;
  }

  &__payment {
    margin-top: 20px;
    display: flex;
    align-items: center;

    &-span {
      vertical-align: sub;
      display: inline-block;
      font-size: 14px;
    }
  }

  &__text-input {
    width: 220px;
    margin-top: 5px;
    border-radius: 2px;
    border: 1px solid $border;
    padding: 5px;
    color: $text;
    resize: none;
    outline: none;
    box-sizing: border-box;
    margin-top: 20px;
  }

  &__title {
    font-size: 16px;
    font-family: Myriad600;
    border-bottom: 1px solid $light-border;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__drop-menu {
    width: 220px;
    height: 32px;
    position: relative;
    margin-top: 20px;
  }

  &__confirm {
    display: flex;
    margin-top: 20px;
  }

  &__button {
    margin-right: 20px;
  }

  &__checkbox {
    margin-left: 15px;
  }

  .drops {
    width: 100%;
    position: relative;

    &__menu {
      position: relative;
      width: 220px;
      height: 32px;
    }

    &__menuTitle {
      width: 220px;
      height: 32px;
      display: flex;
      align-items: center;
    }

    &__item {
      @extend %item-style;
      width: 100%;
      justify-content: space-between;

    }

    &__text {
      font-size: 14px;
      font-weight: bolder;
    }

    &__label {
      position: relative;
      width: 150px;
    }

    &__assigned-icon {
      position: absolute;
      left: -18px;
      width: 15px;
    }
  }

  %item-style {
    display: flex;
    align-items: center;
    height: 44px;
  }
}

.approve-action {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.project-details {
  margin-bottom: 4px;
}
</style>
