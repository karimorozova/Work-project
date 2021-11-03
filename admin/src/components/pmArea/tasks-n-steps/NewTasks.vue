<template lang="pug">
  .tasks
    .tasks__fileDetails(v-if="isFilesDetailsModal && fileDetailsIndex !== null")
      Files(
        @close="hideFileDetails"
        :task="copyTasks[fileDetailsIndex]"
      )
    .tasks__preview(v-if="isEditAndSendQuote")
      PreviewQuote( @closePreview="closePreview"  :allMails="projectClientContacts" :message="previewMessageQuote" @send="sendMessageQuote")

    .tasks__approve-action(v-if="isCancelApproveModal")
      ApproveModalPayment(
        :isCheckbox="isAppearCheckBox()"
        :text="modalTexts.main"
        :approveValue="modalTexts.approve"
        :notApproveValue="modalTexts.notApprove"
        @approve="approveCancelAction"
        @notApprove="notApproveAction"
        @close="closeApproveModal"
        @returnData="getApproveModalData"

      )
    .tasks__action(v-if="!isProjectFinished")
      .tasks__title Tasks Actions:
      .tasks__drop-menu
        SelectSingle(
          selectedOption=""
          :options="availableActionsOptions"
          placeholder="Select Action"
          @chooseOption="setAction"
        )

    Tabs(:tabs="tabs" @setTab="setTab" :selectedTab="selectedTabQuery")

    GeneralTable(
      :fields="fields"
      :tableData="copyTasks"
    )
      template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
        .table__header(v-if="field.headerKey === 'headerCheck'")
          CheckBox(:isChecked="isAllSelected" @check="toggleAll(true)" @uncheck="toggleAll(false)")
        .table__header(v-else) {{ field.label }}

      template(slot="check" slot-scope="{ row, index }")
        .table__data
          CheckBox(:isChecked="row.isCheck" @check="()=>toggleCheck(index, true)" @uncheck="()=>toggleCheck( index, false)" customClass="tasks-n-steps")

      template(slot="taskId" slot-scope="{ row }")
        .table__data {{ row.taskId }}

      template(slot="service" slot-scope="{ row }")
        .table__data {{ row.service.title }}

      template(slot="language" slot-scope="{ row }")
        .table__data(v-html="getPair(row)")

      template(slot="status" slot-scope="{ row }")
        .table__statusAndProgress
          .status {{ row.status | stepsAndTasksStatusFilter }}

      template(slot="receivables" slot-scope="{ row }")
        .table__data
          span.currency(v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
          span {{ getReceivables(row) }}
          //span(v-if="row.finance.Price.receivables || row.finance.Price.receivables === 0")
          //  span(v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
          //span(v-if="row.finance.Price.receivables !== '' && row.status !== 'Cancelled Halfway'") {{ (row.finance.Price.receivables).toFixed(2) }}
          //span(v-if="row.finance.Price.halfReceivables && row.status === 'Cancelled Halfway'") {{ (row.finance.Price.halfReceivables).toFixed(2) }}

      template(slot="payables" slot-scope="{ row }")
        .table__data
          span.currency(v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
          span {{ getPayables(row) }}
        //  span(v-if="row.finance.Price.payables || row.finance.Price.payables === 0")
        //    span(v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
        //  span(v-if="row.finance.Price.payables !== '' && row.status !== 'Cancelled Halfway'") {{ (row.finance.Price.payables).toFixed(2) }}
        //  span(v-if="row.finance.Price.halfPayables && row.status === 'Cancelled Halfway'") {{ (row.finance.Price.halfPayables).toFixed(2) }}

      template(slot="margin" slot-scope="{ row, index }")
        .table__data
          span.currency(v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
          span {{ +(getReceivables(row) - getPayables(row)).toFixed(2) }}
          sup(:class="{'red-color': (+marginCalcPercent(row) > 1 && +marginCalcPercent(row) < 50) || +marginCalcPercent(row) < 0  }") {{ marginCalcPercent(row) }}%

          //span(v-if="marginCalc(row)")
          //  span(v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
          //span(v-if="marginCalc(row)") {{ marginCalc(row) }}


      template(slot="icons" slot-scope="{ row, index }")
        .table__icons
          img(v-if="row.status.indexOf('Pending Approval') !== -1"  style="cursor: pointer;" src="../../../assets/images/latest-version/delivery-list.png" @click="reviewForDelivery(row)")
          img(src="../../../assets/images/latest-version/files.png"  style="cursor: pointer;" @click="showFileDetails(index)")

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

export default {
  name: "NewTasks",
  mixins: [ currencyIconDetected ],
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
      selectedAction: "",
      previewMessageQuote: "",
      modalTexts: { main: "Are you sure?", approve: "Yes", notApprove: "No" },
      fields: [
        { label: "check", headerKey: "headerCheck", key: "check", style: { "width": "3%" } },
        { label: "ID", headerKey: "headerTaskId", key: "taskId", style: { "width": "17%" } },
        { label: "Service", headerKey: "headerService", key: "service", style: { "width": "13%" } },
        { label: "Languages", headerKey: "headerLanguage", key: "language", style: { "width": "11%" } },
        { label: "Status", headerKey: "headerStatus", key: "status", style: { "width": "17%" } },
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
      return Number.isNaN(percent) ? 0 : percent.toFixed(0)
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

      const key = prop === 'client' ? 'receivables' : 'payables'
      const key2 = prop === 'client' ? 'halfReceivables' : 'halfPayables'

      return +(neededSteps.reduce((acc, cur) => {
        if (cur.status === 'Cancelled Halfway') acc = acc + cur.finance.Price[key2]
        else acc = acc + cur.finance.Price[key]
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
    toggleCheck(index, isCheck) {
      this.$set(this.copyTasks[index], "isCheck", isCheck)
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
    // async approveCancelAction() {
    //   try {
    //     const groupedByStatus = this.checkedTasks.reduce((acc, step) => {
    //       if (!acc.hasOwnProperty(step.status)) {
    //         acc[step.status] = [ step ]
    //       } else {
    //         acc[step.status].push(step)
    //       }
    //       return acc
    //     }, {})
    //
    //     for (const [ stepStatus, steps ] of Object.entries(groupedByStatus)) {
    //       const statusAndAction = this.getStatusAndAction(stepStatus, this.selectedAction)
    //
    //       switch (statusAndAction) {
    //           //Action MARK AS ACCEPT/REJECT
    //         case "Created__Mark-as-accept/reject":
    //         case "Request_Sent__Mark-as-accept/reject":
    //
    //           //Action REQUEST CONFIRMATION
    //         case "Created__Request-confirmation":
    //
    //           break
    //
    //           //Action CHANGE DEADLINE
    //         case "Created__Change-Deadline":
    //         case "Request-Sent__Change-Deadline":
    //         case "Completed__Change-Deadline":
    //
    //           break
    //
    //           //Action RE OPEN
    //         case "Completed__ReOpen":
    //
    //           break
    //
    //         default:
    //           console.log(statusAndAction)
    //       }
    //
    //     }
    //   } catch (e) {
    //
    //   } finally {
    //     // this.closeApproveModal()
    //   }
    //
    // },
    // async approveCancelAction() {
    //   const checkedTasks = this.copyTasks.filter(item => item.isChecked)
    //   // if (!checkedTasks.length) return this.closeApproveModal()
    //   try {
    //     await this.cancelTasks(checkedTasks)
    //     this.alertToggle({ message: "Cancelled", isShow: true, type: "success" })
    //     this.closeApproveModal()
    //     this.unCheckAllTasks()
    //   } catch (e) {
    //     this.alertToggle({ message: "Server error / Cannot execute action", isShow: true, type: "error" })
    //   }
    // },
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
    },
    async setAction({ option }) {
      this.selectedAction = option

      switch (this.selectedAction) {
        case 'Approve [DR1]':
          this.reviewTasksMulti = this.checkedTasks.map(i => i.taskId)
          this.isDeliveryReviewMulti = true
          break
        case 'Send a Quote':
          await this.getSendQuoteMessage()
          break
      }


      // try {
      //   const groupedByStatus = this.checkedTasks.reduce((acc, step) => {
      //     if (!acc.hasOwnProperty(step.status)) {
      //       acc[step.status] = [ step ]
      //     } else {
      //       acc[step.status].push(step)
      //     }
      //     return acc
      //   }, {})
      //
      //   for (const [ taskStatus, tasks ] of Object.entries(groupedByStatus)) {
      //     const statusAndAction = this.getStatusAndAction(taskStatus, this.selectedAction)
      //     //     [ 'Manage reference files', 'Upload reference files', 'Send a Quote', 'Cancel' ]
      //     switch (statusAndAction) {
      //         //Action MANAGE REFERENCE FILES
      //       case "Created__Manage-reference-files":
      //
      //         //Action UPLOAD REFERENCE FILES
      //       case "Created__Request-confirmation":
      //
      //         break
      //
      //         //Action SEND A QUOTE
      //       case "Created__Change-Deadline":
      //       case "Request-Sent__Change-Deadline":
      //       case "Completed__Change-Deadline":
      //
      //         break
      //
      //         //Action CANCEL
      //       case "Completed__ReOpen":
      //
      //         break
      //
      //       default:
      //         console.log(statusAndAction)
      //     }
      //   }
      //
      // } catch (e) {
      //
      // }

      // switch (option) {
      //   case 'Reassign DR1':
      //     await this.manageDR1()
      //     break
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
      return [ ...isSendStatus, 'Approve [DR1]', 'Cancel' ]

    },
    copyTasks() {
      return this.currentProject.tasks
    },
    checkedTasks() {
      return this.copyTasks.filter(({ isCheck }) => isCheck)
    },
    isAllSelected() {
      return (this.copyTasks && this.copyTasks.length) && this.copyTasks.every(i => i.isCheck)
    }

  },
  components: {
    DeliveryOne,
    DeliveryOneMulti,
    Files,
    GeneralTable,
    CheckBox,
    Tabs,
    SelectSingle,
    PreviewQuote
  }
}
</script>

<style scoped lang="scss">
@import "../../../assets/scss/colors";

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
    align-self: flex-end;
  }

  &__title {
    margin-bottom: 4px;
  }

  &__drop-menu {
    position: relative;
    width: 220px;
    height: 32px;
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

  &__statusAndProgress {
    width: 100%;
    padding: 0 6px;
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

.currency {
  margin-right: 4px;
  color: $dark-border;
}

.red-color {
  color: $red;
}
</style>