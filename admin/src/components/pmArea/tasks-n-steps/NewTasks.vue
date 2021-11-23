<template lang="pug">
  .tasks
    .modal
      ApproveModal(
        v-if="isApproveTaskModal"
        text="Are you sure?"
        approveValue="Yes"
        notApproveValue="Cancel"
        @approve="approveAction"
        @notApprove="closeModal"
        @close="closeModal"
      )
    .tasks__fileDetails(v-if="isFilesDetailsModal && fileDetailsIndex !== null")
      Files(
        @close="hideFileDetails"
        :task="finalData[fileDetailsIndex]"
      )
    .tasks__preview(v-if="isEditAndSendQuote")
      PreviewQuote( @closePreview="closePreview"  :allMails="projectClientContacts" :message="previewMessageQuote" @send="sendMessageQuote")

    .manager__modal(v-if="changeManagerModal")
      .manager__title New Manager [DR1]
      .manager__close-modal(@click="closeManagerModal()") &#215;
      .manager__body
        .manager__itemsContacts
          .manager__selectTitle Choose Manager:
          .manager__select
            SelectSingle(
              :options="projectManagers"
              :selectedOption="selectedManager"
              placeholder="Select Manager"
              @chooseOption="setManager"
            )

        .manager__button-change
          Button(value="Save" :isDisabled="!selectedManager" @clicked="changeManager")

    .tasks__approve-action(v-if="isCancelApproveModal")
      ApproveModalPayment(
        :isCheckbox="false"
        :text="modalTexts.main"
        :approveValue="modalTexts.approve"
        :notApproveValue="modalTexts.notApprove"
        @approve="approveCancelAction"
        @notApprove="closeApproveModal"
        @close="closeApproveModal"
      )
    .tasks__action(v-if="!isProjectFinished && !$parent.isTaskData && checkedTasks.length")
      .tasks__drop-menu
        SelectSingle(
          selectedOption=""
          :options="availableActionsOptions"
          placeholder="Tasks Action"
          @chooseOption="setAction"
        )

    Tabs(:tabs="tabs" @setTab="setTab" :selectedTab="selectedTabQuery")

    GeneralTable(
      :fields="fields"
      :tableData="finalData"

      :isFilterShow="true"
      :isFilterAbsolute="true"

      @addSortKey="addSortKey"
      @changeSortKey="changeSortKey"
      @removeSortKey="removeSortKey"
      @setFilter="setFilter"
      @removeFilter="removeFilter"
      @clearAllFilters="clearAllFilters"
    )
      template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
        .table__header(v-if="field.headerKey === 'headerCheck'")
          CheckBox(:isChecked="!!isAllSelected" @check="toggleAll(true)" @uncheck="toggleAll(false)")
        .table__header(v-else) {{ field.label }}

      template(slot="check" slot-scope="{ row, index }")
        .table__data
          CheckBox(:isChecked="row.isCheck" @check="()=>toggleCheck(row._id, true)" @uncheck="()=>toggleCheck( row._id, false)" customClass="tasks-n-steps")

      template(slot="taskId" slot-scope="{ row }")
        .table__data {{ row.taskId }}

      template(slot="service" slot-scope="{ row }")
        .table__data {{ row.service.title }}

      template(slot="language" slot-scope="{ row }")
        .table__data(v-html="getPair(row)")

      template(slot="status" slot-scope="{ row }")
        .table__data
          .status {{ row.status }}

      template(slot="receivables" slot-scope="{ row }")
        .table__data
          span.currency(v-if="!currentProject.minimumCharge.isUsed" v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
          span {{ !currentProject.minimumCharge.isUsed ? getReceivables(row) : '-'  }}

      template(slot="payables" slot-scope="{ row }")
        .table__data
          span.currency(v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
          span {{ getPayables(row) }}

      template(slot="margin" slot-scope="{ row, index }")
        .table__data
          span.currency(v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
          span {{ +(getReceivables(row) - getPayables(row)).toFixed(2) }}
          sup(:class="{'red-color': (+marginCalcPercent(row) > 1 && +marginCalcPercent(row) < 50) || +marginCalcPercent(row) < 0  }") {{ marginCalcPercent(row) }}%

      template(slot="icons" slot-scope="{ row, index }")
        .table__icons
          img(v-if="row.status.indexOf('Pending Approval') !== -1"  style="cursor: pointer;" src="../../../assets/images/latest-version/delivery-list.svg" @click="reviewForDelivery(row)")
          img(src="../../../assets/images/latest-version/files.svg"  style="cursor: pointer;" @click="showFileDetails(index)")

    .tasks__review(v-if="isDeliveryReviewMulti && reviewTasksMulti.length")
      DeliveryOneMulti(
        @close="closeMultiReview"
        :user="user"
        :users="users"
        :project="currentProject"
        :allTasks="currentProject.tasks"
        :deliveryTasks="currentProject.tasksDR1.filter(item => reviewTasksMulti.includes(item.taskId))"
      )
    .tasks__review(v-if="isDeliveryReview")
      DeliveryOne(
        :project="currentProject"
        :user="user"
        :users="users"
        :task="reviewTask"
        :deliveryTask="currentProject.tasksDR1.find(({taskId}) => taskId === reviewTask.taskId)"
        @close="closeReview"
      )
</template>

<script>
import PreviewQuote from "../WYSIWYGMultiMails"
import GeneralTable from '../../GeneralTable'
import CheckBox from '../../CheckBox'
import Tabs from '../../Tabs'
import SelectSingle from '../../SelectSingle'
import { mapActions, mapGetters } from "vuex"
import Files from "../stepinfo/Files"
import DeliveryOneMulti from "./DeliveryOneMulti"
import DeliveryOne from "./DeliveryOne"
import currencyIconDetected from "../../../mixins/currencyIconDetected"
import tableSortAndFilter from "../../../mixins/tableSortAndFilter"
import ApproveModalPayment from "../../ApproveModalPayment"
import Button from "../../Button"
import ApproveModal from "../../ApproveModal"

export default {
  name: "NewTasks",
  mixins: [ currencyIconDetected, tableSortAndFilter ],
  props: {
    tabs: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      reviewTask: [],
      reviewTasksMulti: [],
      fileDetailsIndex: null,
      isFilesDetailsModal: false,
      isDeliveryReview: false,
      isDeliveryReviewMulti: false,
      isCancelApproveModal: false,
      isEditAndSendQuote: false,
      changeManagerModal: false,
      selectedManager: null,
      selectedAction: "",
      previewMessageQuote: "",
      isApproveTaskModal: false,
      // tasksReadyToDelete: [],
      modalTexts: { main: "Are you sure?", approve: "Yes", notApprove: "No" },
      fields: [
        { label: "check", headerKey: "headerCheck", key: "check", style: { "width": "3%" } },
        { label: "ID", headerKey: "headerTaskId", key: "taskId", sortInfo: { isSort: true, order: 'default' }, filterInfo: { isFilter: true }, style: { "width": "17%" } },
        {
          label: "Service",
          headerKey: "headerService",
          key: "service",
          dataKey: "title",
          sortInfo: { isSort: true, order: 'default' },
          filterInfo: { isFilter: true },
          style: { "width": "12%" }
        },
        { label: "Languages", headerKey: "headerLanguage", key: "language", style: { "width": "12%" } },
        { label: "Status", headerKey: "headerStatus", key: "status", sortInfo: { isSort: true, order: 'default' }, filterInfo: { isFilter: true }, style: { "width": "17%" } },
        { label: "Rec.", headerKey: "headerReceivables", key: "receivables", style: { "width": "9%" } },
        { label: "Pay.", headerKey: "headerPayables", key: "payables", style: { "width": "9%" } },
        { label: "Margin", headerKey: "headerMargin", key: "margin", style: { "width": "11%" } },
        { label: "", headerKey: "headerDelivery", key: "icons", style: { "width": "10%" } }
      ]
    }
  },
  methods: {
    ...mapActions([
      "alertToggle",
      "setCurrentProject"
    ]),
    marginCalcPercent(task) {
      const [ receivables, payables ] = [ this.getReceivables(task), this.getPayables(task) ]
      let percent = NaN
      percent = 100 - (payables / receivables) * 100
      return Number.isNaN(percent) || !isFinite(percent) ? 0 : percent.toFixed(0)
    },
    getPayables(task) {
      return this.getCalculationByProp(task, 'vendor')
    },
    getReceivables(task) {
      return this.getCalculationByProp(task, 'client')
    },
    getCalculationByProp(task, prop) {
      const { steps } = this.currentProject
      const neededSteps = steps.filter(item => item.taskId === task.taskId && item.status !== 'Cancelled')

      return +(neededSteps.reduce((acc, cur) => {
        acc = acc + cur.finance.Price[prop === 'client' ? 'receivables' : 'payables']
        return acc
      }, 0).toFixed(2))
    },
    closeReview() {
      this.isDeliveryReview = false
      this.selectedAction = ""
    },
    closeMultiReview(e) {
      this.reviewTasksMulti = []
      this.isDeliveryReviewMulti = false
      this.selectedAction = ""
      this.toggleAll(e, false)
    },
    showFileDetails(index) {
      this.fileDetailsIndex = index
      this.isFilesDetailsModal = true
    },
    hideFileDetails() {
      this.fileDetailsIndex = null
      this.isFilesDetailsModal = false
    },
    getPair(task) {
      return task.sourceLanguage === task.targetLanguage
          ? `${ task.targetLanguage }`
          : `<span>${ task.sourceLanguage }</span><span style="font-size: 12px;color: #9c9c9c;margin: 0 4px;"><i class="fas fa-angle-double-right"></i></span><span>${ task.targetLanguage }</span>`
    },
    toggleCheck(id, isCheck) {
      const index = this.currentProject.tasks.findIndex(step => step._id === id)
      const obj = this.currentProject.tasks[index]
      obj.isCheck = isCheck
      this.currentProject.tasks.splice(index, 1, obj)
      // this.$set(this.finalData[index], "isCheck", isCheck)
    },
    toggleAll(val) {
      this.currentProject.tasks = this.currentProject.tasks.reduce((acc, cur) => {
        acc.push({ ...cur, isCheck: val })
        return acc
      }, [])
    },
    setTab({ index }) {
      this.$emit('setTab', { index })
    },
    reviewForDelivery(task) {
      this.reviewTask = task
      this.isDeliveryReview = true
    },
    async approveCancelAction() {
      if (!this.checkedTasks.length) return this.closeApproveModal()
      const validCancelStatuses = [ 'Created', 'Approved', 'Rejected', 'Quote Sent', 'In progress' ]
      const filteredTasks = this.checkedTasks.filter(item => validCancelStatuses.indexOf(item.status) !== -1)
      if (filteredTasks.length) {
        try {
          const updatedProject = await this.$http.post("/pm-manage/cancel-tasks", { tasks: filteredTasks, projectId: this.currentProject._id })
          await this.setCurrentProject(updatedProject.data)
          this.alertToggle({ message: "Tasks cancelled", isShow: true, type: "success" })
        } catch (e) {
          this.alertToggle({ message: "Server error / Cannot execute action", isShow: true, type: "error" })
        }
      }
      this.closeApproveModal()
    },
    closePreview() {
      this.isEditAndSend = false
      this.isEditAndSendQuote = false
      this.selectedAction = ""
    },
    openPreviewQuote() {
      this.isEditAndSendQuote = true
    },
    async getSendQuoteMessage() {
      try {
        const tasksIds = this.checkedTasks.filter(item => item.status === "Created").map(item => item.taskId)
        if (!tasksIds.length) return

        const template = await this.$http.post(`/pm-manage/task-quote-message`, {
          projectId: this.currentProject._id,
          tasksIds
        })
        this.previewMessageQuote = template.body.message
        this.openPreviewQuote()
      } catch (err) {
        this.alertToggle({ message: err.message, isShow: true, type: "error" })
      }
    },
    async sendMessageQuote({ message, arrayOfEmails }) {
      try {
        const tasksIds = this.checkedTasks.filter(item => item.status === "Created").map(item => item.taskId)
        if (!tasksIds.length) return

        const result = await this.$http.post("/pm-manage/send-task-quote", {
          projectId: this.currentProject._id,
          message: message,
          arrayOfEmails: arrayOfEmails,
          tasksIds
        })
        this.setCurrentProject(result.data)
        this.alertToggle({ message: "Message sent", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: err.message, isShow: true, type: "error" })
      }
      this.closePreview()
    },
    closeApproveModal() {
      this.isCancelApproveModal = false
      this.selectedAction = ""
      this.toggleAll(false)
    },
    closeManagerModal() {
      this.changeManagerModal = false
      this.selectedAction = ""
      this.toggleAll(false)
    },
    manageDR1() {
      this.changeManagerModal = true
    },
    setManager({ option }) {
      this.selectedManager = option
    },
    async approveAction() {
      switch (this.selectedAction) {
        case "Delete" :
          await this.approveDelete()
          break
      }
      this.closeModal()
    },
    async approveDelete() {
      const tasksCanDeletedIds = this.checkedTasks.filter(({ status }) => status === 'Cancelled').map(({ taskId }) => taskId)
      if (tasksCanDeletedIds.length < 1) return
      try {
        const updatedProject = await this.$http.post("/pm-manage/delete-tasks", { tasks: tasksCanDeletedIds, projectId: this.currentProject._id })
        await this.setCurrentProject(updatedProject.data)
        this.closeModal()
      } catch (err) {
      }
    },
    closeModal() {
      this.isApproveTaskModal = false
      this.selectedAction = ""
      this.toggleAll(false)
    },
    async changeManager() {
      const checkedTasksId = this.checkedTasks.filter(({ status }) => status === 'Pending Approval [DR1]').map(({ taskId }) => taskId)
      if (!checkedTasksId.length) return

      try {
        const result = await this.$http.post('/delivery/change-managers', {
          projectId: this.currentProject._id,
          checkedTasksId,
          manager: this.users.find(item => `${ item.firstName } ${ item.lastName }` === this.selectedManager)
        })

        await this.setCurrentProject(result.data)
        this.closeManagerModal()
        this.selectedAction = ""
        this.selectedManager = null
      } catch (err) {
        this.alertToggle({ message: err.message, isShow: true, type: "error" })
      }
    },
    async setAction({ option }) {
      this.selectedAction = option

      switch (this.selectedAction) {
        case 'Approve [DR1]':
          if (this.checkedTasks.filter(({ status }) => status === 'Pending Approval [DR1]').length) {
            this.reviewTasksMulti = this.checkedTasks.filter(({ status }) => status === 'Pending Approval [DR1]').map(i => i.taskId)
            this.isDeliveryReviewMulti = true
          }
          break
        case 'Send a Quote':
          await this.getSendQuoteMessage()
          break
        case 'Cancel':
          this.isCancelApproveModal = true
          break
        case 'Assign Manager [DR1]':
          if (this.checkedTasks.filter(({ status }) => status === 'Pending Approval [DR1]').length) {
            await this.manageDR1()
          }
          break
        case 'Delete':
          this.isApproveTaskModal = true
          break
      }

      // switch (option) {
      //   case 'Cancel':
      //     this.modalTexts = { main: "Are you sure?", approve: "Yes", notApprove: "No" }
      //     this.isCancelApproveModal = true
      //     break
      //   case 'Upload reference files':
      //     this.openFileModal = true
      //     break
      //   case 'Manage reference files':
      //     this.refFilesForDelete = this.checkedTasks[0].refFiles
      //     this.manageFileModal = true
      //     break
      // }
    }
  },
  computed: {
    ...mapGetters({
      currentProject: 'getCurrentProject',
      user: 'getUser',
      users: 'getUsers'
    }),
    selectedTabQuery() {
      return this.$route.query.selectedTab || 'Tasks'
    },
    projectClientContacts() {
      return this.currentProject.clientContacts.map(({ email }) => email)
    },
    availableActionsOptions() {
      //   const { status, tasks } = this.currentProject
      //   const checkedTasks = tasks.filter(item => item.isChecked)
      //   if (checkedTasks.length) {
      //     if (this.isEvery('Created')) {
      //
      //       if (status !== "Draft" && status !== "Cost Quote" && status !== "Rejected") {
      //         return [ 'Manage reference files', 'Upload reference files', 'Send a Quote', 'Cancel' ]
      //       } else if (checkedTasks.every(({ status }) => this.fileUploadStatus.includes(status)) && checkedTasks.length === 1) {
      //         return [ 'Manage reference files', 'Upload reference files', 'Cancel' ]
      //       } else {
      //         return [ 'Cancel' ]
      //       }
      //
      //     } else if (this.isEvery("Pending Approval [DR1]")) {
      //
      //       let elements = []
      //       const [ first ] = checkedTasks
      //       const isSameService = checkedTasks.every(({ service }) => service.title === first.service.title)
      //       if (isSameService) elements.push('Complete DR1')
      //       if (this.canChangeDR1Manager) elements.push('Reassign DR1')
      //       return elements
      //     //
      //     // } else if (checkedTasks.every(({ status }) => this.fileUploadStatus.includes(status)) && checkedTasks.length > 1) {
      //     //   return [ 'Upload reference files', 'Cancel' ]
      //     // } else if (checkedTasks.every(({ status }) => this.fileUploadStatus.includes(status)) && checkedTasks.length === 1) {
      //     //   return [ 'Manage reference files', 'Upload reference files', 'Cancel' ]
      //     }
      //   }
      //   return  [ 'Manage reference files', 'Upload reference files', 'Send a Quote', 'Cancel' ]

      if (!this.checkedTasks.length) return []

      const isSendStatus = this.currentProject.status === 'In progress' || 'Approved' ? [ 'Send a Quote' ] : []
      return [ ...isSendStatus, 'Assign Manager [DR1]', 'Approve [DR1]', 'Cancel', 'Delete' ]

    },
    // finalData() {
    //   return this.currentProject.tasks
    // },
    rawData() {
      return this.currentProject.tasks
    },
    checkedTasks() {
      return this.finalData.filter(({ isCheck }) => isCheck)
    },
    isAllSelected() {
      return (this.finalData && this.finalData.length) && this.finalData.every(i => i.isCheck)
    },
    projectManagers() {
      if (this.users) {
        return this.users.filter(item => item.group.name === 'Project Managers').map(item => `${ item.firstName } ${ item.lastName }`)
      }
    }
  },
  components: {
    Button,
    ApproveModalPayment,
    DeliveryOne,
    DeliveryOneMulti,
    Files,
    GeneralTable,
    CheckBox,
    Tabs,
    SelectSingle,
    PreviewQuote,
    ApproveModal
  }
}
</script>

<style scoped lang="scss">
@import "../../../assets/scss/colors";

.manager {
  &__modal {
    padding: 25px;
    background: white;
    position: absolute;
    box-shadow: $box-shadow;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 500;
  }

  &__selectTitle {
    margin-bottom: 3px;
  }

  &__button-change {
    margin-top: 20px;
    text-align: center;
  }

  &__select {
    position: relative;
    height: 32px;
    width: 220px;
  }

  &__title {
    font-size: 19px;
    margin-bottom: 20px;
    font-family: Myriad600;
  }

  &__close-modal {
    position: absolute;
    top: 5px;
    right: 7px;
    font-size: 22px;
    cursor: pointer;
    height: 22px;
    width: 22px;
    justify-content: center;
    display: flex;
    align-items: center;
    font-family: Myriad900;
    opacity: 0.8;
    transition: ease 0.2s;

    &:hover {
      opacity: 1
    }
  }

}

.tasks {
  position: relative;

  &__review {
    position: absolute;
    top: -70px;
    right: -20px;
    left: -20px;
    bottom: 0;
    z-index: 50;
    box-sizing: border-box;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    height: fit-content;
    padding-bottom: 150px;
  }


  &__action {
    position: absolute;
    top: -52px;
    right: 232px;
  }

  &__title {
    margin-bottom: 4px;
  }

  &__drop-menu {
    position: relative;
    width: 220px;
    height: 32px;
  }

  &__approve-action {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 502;
  }

  &__fileDetails {
    padding: 25px;
    background: white;
    position: absolute;
    box-shadow: $box-shadow;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 501;
  }
}

.table {
  width: 100%;

  &__data {
    padding: 0 7px;
  }

  &__header {
    padding: 0 7px;
  }

  &__drop {
    position: relative;
    height: 32px;
    max-width: 220px;
    margin: 0 7px;
    width: 100%;
    background: white;
    border-radius: 4px;
  }

  &__icons {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    gap: 10px;

    img {
      height: 18px;
    }
  }

  &__icon {
    cursor: pointer;
    opacity: 0.5;
  }

  &__opacity {
    opacity: 1;
  }

  &__input {
    width: 100%;
    padding: 0 7px;
  }

}

input {
  font-size: 14px;
  color: $text;
  border: 1px solid $border;
  border-radius: 4px;
  box-sizing: border-box;
  padding: 0 7px;
  outline: none;
  width: 100%;
  height: 32px;
  transition: .1s ease-out;

  &:focus {
    border: 1px solid $border-focus;
  }
}

.modal {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.currency {
  margin-right: 4px;
  color: $dark-border;
}

.red-color {
  color: $red;
}
</style>