<template lang="pug">
  .tasks
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

      template(slot="service" slot-scope="{ row }")
        .table__data {{ row.service.title }}

      //template(slot="fileDetails" slot-scope="{row, index}")
        .table__data(style="cursor: pointer;" @click="showFileDetails(index)")
          img(src="../../../assets/images/latest-version/files.png")
      //template(slot="taskId" slot-scope="{ row }")
        .table__data {{ row.taskId.substring(row.taskId.length - 3) }}

      template(slot="language" slot-scope="{ row }")
        .table__data(v-html="getPair(row)")
      template(slot="status" slot-scope="{ row, index }")
        .table__statusAndProgress
          .status {{ row.status | stepsAndTasksStatusFilter }}
          //.progress
            //ProgressLine(:progress="progress(row.progress)" :status="row.status")

      template(slot="receivables" slot-scope="{ row }")
        .table__data
          span -
          //span(v-if="row.finance.Price.receivables || row.finance.Price.receivables === 0")
          //  span(v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
          //span(v-if="row.finance.Price.receivables !== '' && row.status !== 'Cancelled Halfway'") {{ (row.finance.Price.receivables).toFixed(2) }}
          //span(v-if="row.finance.Price.halfReceivables && row.status === 'Cancelled Halfway'") {{ (row.finance.Price.halfReceivables).toFixed(2) }}

      template(slot="payables" slot-scope="{ row }")
        .table__data
          span -
        //  span(v-if="row.finance.Price.payables || row.finance.Price.payables === 0")
        //    span(v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
        //  span(v-if="row.finance.Price.payables !== '' && row.status !== 'Cancelled Halfway'") {{ (row.finance.Price.payables).toFixed(2) }}
        //  span(v-if="row.finance.Price.halfPayables && row.status === 'Cancelled Halfway'") {{ (row.finance.Price.halfPayables).toFixed(2) }}

      template(slot="margin" slot-scope="{ row, index }")
        .table__data
          span -
          //span(v-if="marginCalc(row)")
          //  span(v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
          //span(v-if="marginCalc(row)") {{ marginCalc(row) }}
          //sup(:class="{'red-color': (+marginCalcPercent(row) > 1 && +marginCalcPercent(row) < 50) || +marginCalcPercent(row) < 0  }" v-if="marginCalc(row)") {{ marginCalcPercent(row) }}%

      template(slot="icons" slot-scope="{ row }")
        .table__data
          img.tasks__delivery-image(v-if="row.status.indexOf('Pending Approval') !== -1" src="../../../assets/images/latest-version/delivery-list.png" @click="reviewForDelivery(row)")

</template>

<script>
import GeneralTable from '../../GeneralTable'
import CheckBox from '../../CheckBox'
import Tabs from '../../Tabs'
import SelectSingle from '../../SelectSingle'
import { mapGetters } from "vuex"

export default {
  name: "NewTasks",
  props: {
    // tasks: {
    //   type: Array,
    //   default: []
    // },
    tabs: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      isCancelApproveModal: false,
      selectedAction: "",
      modalTexts: { main: "Are you sure?", approve: "Yes", notApprove: "No" },
      fields: [
        { label: "check", headerKey: "headerCheck", key: "check", style: { "width": "3%" } },
        { label: "Service", headerKey: "headerService", key: "service", style: { "width": "11%" } },
        { label: "Languages", headerKey: "headerLanguage", key: "language", style: { "width": "11%" } },
        { label: "Status", headerKey: "headerStatus", key: "status", style: { "width": "11%" } },
        { label: "Rec.", headerKey: "headerReceivables", key: "receivables", style: { "width": "8%" } },
        { label: "Pay.", headerKey: "headerPayables", key: "payables", style: { "width": "8%" } },
        { label: "Margin", headerKey: "headerMargin", key: "margin", style: { "width": "9%" } },
        { label: "", headerKey: "headerDelivery", key: "icons", style: { "width": "10%" } }
      ]
    }
  },
  methods: {
    getPair(task) {
      return task.sourceLanguage === task.targetLanguage
          ? `${ task.targetLanguage }`
          : `<span>${ task.sourceLanguage }</span><span style="font-size: 12px;color: #9c9c9c;margin: 0 4px;"><i class="fas fa-angle-double-right"></i></span><span>${ task.targetLanguage }</span>`
    },
    toggleCheck(index, isCheck) {
      this.$set(this.copyTasks[index], "isCheck", isCheck)
    },
    toggleAll(val) {
      this.copyTasks = this.copyTasks.reduce((acc, cur) => {
        acc.push({ ...cur, isCheck: val })
        return acc
      }, [])
    },
    setTab({ index }) {
      this.$emit('setTab', { index })
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
    closeApproveModal() {
      this.isCancelApproveModal = false
      this.selectedAction = ""
    },
    async setAction({ option }) {
      this.selectedAction = option


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
      //   case 'Complete DR1':
      //     this.reviewTasksMulti = this.checkedTasks.map(item => item.taskId)
      //     this.isDeliveryReviewMulti = true
      //     this.setShowTasksAndDeliverables(false)
      //     break
      //   case 'Send a Quote':
      //     await this.getSendQuoteMessage()
      //     break
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
      currentProject: 'getCurrentProject'
    }),
    selectedTabQuery() {
      return this.$route.query.selectedTab || 'Tasks'
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
      return [ 'Send a Quote', 'Cancel' ]

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
    GeneralTable,
    CheckBox,
    Tabs,
    SelectSingle
  }
}
</script>

<style scoped lang="scss">
@import "../../../assets/scss/colors";

.tasks {
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
    gap: 8px;
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

</style>