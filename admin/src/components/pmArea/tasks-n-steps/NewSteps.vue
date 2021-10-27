<template lang="pug">
  .steps
    .steps__approve-action(v-if="isApproveActionShow")
      ApproveModal(
        :text="modalTexts.main"
        :approveValue="modalTexts.approve"
        :notApproveValue="modalTexts.notApprove"
        @approve="approveAction"
        @notApprove="notApproveAction"
        @close="closeApproveModal"
      )
    .steps__action(v-if="!isProjectFinished")
      .steps__title Steps Actions:
      .steps__drop-menu
        SelectSingle(
          :selectedOption="selectedAction"
          :options="stepActions"
          placeholder="Select Action"
          @chooseOption="setAction"
        )
    Tabs(:tabs="tabs" @setTab="setTab" :selectedTab="selectedTabQuery")
    GeneralTable(
      :fields="fields"
      :tableData="copySteps"
    )

      template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
        .table__header(v-if="field.headerKey === 'headerCheck'")
          CheckBox(:isChecked="isAllSelected" :isWhite="true" @check="toggleAll(true)" @uncheck="toggleAll(false)")
        //.table__header(v-if="field.headerKey === 'headerCheck' && isEdit")
        .table__header(v-else) {{ field.label }}
      template(slot="check" slot-scope="{ row, index }")
        .table__data
          CheckBox(:isChecked="row.isCheck" @check="()=>toggleCheck(index, true)" @uncheck="()=>toggleCheck(index, false)" customClass="tasks-n-steps")

      //template(slot="id" slot-scope="{ row }")
        .table__data {{ row.taskId.substring(row.taskId.length - 3) }}
      template(slot="name" slot-scope="{ row }")
        .table__data {{ row.stepAndUnit.step.title }}
      template(slot="language" slot-scope="{ row }")
        .table__data(v-html="getStepPair(row)")

      template(slot="vendor" slot-scope="{ row, index }")
        //.table__drop(v-if="isVendorSelect(row.status)")
        //  PersonSelect(
        //    :persons="extendedVendors(index)"
        //    :selectedPerson="vendorName(row.vendor)"
        //    :isExtended="isAllShow"
        //    :isAdditionalShow="isAdditionalShow"
        //    @setPerson="(person) => setVendor(person, index)"
        //    @togglePersonsData="toggleVendors"
        //    @scrollDrop="personSelectDrop(row)"
        //    @removeVendorFromStep="removeVendorFromStep"
        //  )

        .table__data(v-if="row.vendor") {{ vendorName(row.vendor) }}
          //.steps__vendor-replace(v-if="row.vendor && row.status === 'Started'")
          //  .steps__replace-icon(@click="showReassignment(index)")
          //    i.fas.fa-exchange-alt
          //  .steps__tooltip Reassign Vendor
        .table__data(v-else) No Vendor

      template(slot="start" slot-scope="{ row, index }")
        .table__data
          Datepicker(
            @selected="(e) => changeDate(e, 'start', row.stepId)"
            v-model="row.start"
            inputClass="steps__custom-input"
            calendarClass="steps__calendar-custom"
            :format="customFormatter"
            monday-first=true
            :disabledPicker="isDatePickDisabled"
            :highlighted="highlighted"
            @scrollDrop="scrollDrop"
          )

      template(slot="deadline" slot-scope="{ row, index }")
        .table__data
          Datepicker(
            @selected="(e) => changeDate(e, 'deadline', row.stepId)"
            v-model="row.deadline"
            inputClass="steps__custom-input"
            calendarClass="steps__calendar-custom"
            :format="customFormatter"
            monday-first=true
            :disabled="disabled"
            :disabledPicker="isDatePickDisabled"
            :highlighted="highlighted"
            @scrollDrop="scrollDrop"
          )

      //template(slot="progress" slot-scope="{ row, index }")
        .table__data(style="width: 100%")

      template(slot="status" slot-scope="{ row, index }")
        .table__statusAndProgress
          .status {{ row.status | stepsAndTasksStatusFilter }}
          .progress
            ProgressLineStep(:progress="progress(row.progress)" :status="row.status" :lastProgress="lastProgress(row, index)")

      template(slot="receivables" slot-scope="{ row }")
        .table__finance
          //span(v-if="isShowValue(row, 'receivables')")
          //  span(v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
          //  span(v-if="row.finance.Price.receivables !== '' && row.status !== 'Cancelled Halfway'") {{ (row.finance.Price.receivables).toFixed(2) }}
          //  span(v-if="row.finance.Price.hasOwnProperty('halfReceivables')") {{ (row.finance.Price.halfReceivables).toFixed(2) }}

      template(slot="payables" slot-scope="{ row }")
        .table__finance
          //span(v-if="isShowValue(row, 'payables')")
          //  span(v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
          //  span(v-if="row.finance.Price.payables !== '' && row.status !== 'Cancelled Halfway'") {{ (row.finance.Price.payables).toFixed(2) }}
          //  span(v-if="row.finance.Price.hasOwnProperty('halfPayables')") {{ (row.finance.Price.halfPayables).toFixed(2) }}

      template(slot="margin" slot-scope="{ row, index }")
        .table__finance(:id="'margin'+index")
          //span(v-if="marginCalc(row)")
          //  span(v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
          //span(v-if="marginCalc(row)") {{ marginCalc(row) }}
          //sup(:class="{'red-color': (+marginCalcPercent(row) > 1 && +marginCalcPercent(row) < 50) || +marginCalcPercent(row) < 0  }" v-if="marginCalc(row)") {{ marginCalcPercent(row) }}%

      template(slot="info" slot-scope="{row, index}")
        .table__space-between
          img(src="../../../assets/images/latest-version/view-details.png" style="cursor: pointer;" @click="showStepDetails(index)")
          img(src="../../../assets/images/latest-version/view-details.png" style="cursor: pointer;" @click="showFinanceEditing(index)")
</template>

<script>
import GeneralTable from '../../GeneralTable'
import CheckBox from '../../CheckBox'
import Datepicker from '../../Datepicker'
import ProgressLineStep from '../../ProgressLineStep'
import scrollDrop from "../../../mixins/scrollDrop"
import Tabs from "../../Tabs"
import SelectSingle from "../../SelectSingle"
import ApproveModal from "../../ApproveModal"
import _ from "lodash"
import { mapActions, mapGetters } from "vuex"

export default {
  mixins: [ scrollDrop],
  name: "NewSteps",
  props: {
    steps: {
      type: Array,
      default: []
    },
    tabs: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      // copySteps: JSON.parse(JSON.stringify(this.steps)),
      selectedAction: '',
      isApproveActionShow: false,
      modalTexts: { main: "Are you sure?", approve: "Yes", notApprove: "No" },
      fields: [
        { label: "Check", headerKey: "headerCheck", key: "check", style: { "width": "3%" } },
        // { label: "Id", headerKey: "headerId", key: "id", style: { "width": "4%" } },
        { label: "Step", headerKey: "headerName", key: "name", style: { "width": "10%" } },
        { label: "Languages", headerKey: "headerLanguage", key: "language", style: { "width": "10%" } },
        { label: "Vendor", headerKey: "headerVendor", key: "vendor", style: { "width": "18%" } },
        { label: "Status", headerKey: "headerStatus", key: "status", style: { "width": "10%" } },
        // { label: "Progress", headerKey: "headerProgress", key: "progress", style: { "width": "8%" } },
        { label: "Start", headerKey: "headerStart", key: "start", style: { "width": "10%" } },
        { label: "Deadline", headerKey: "headerDeadline", key: "deadline", style: { "width": "10%" } },
        { label: "Rec.", headerKey: "headerReceivables", key: "receivables", style: { "width": "8%" } },
        { label: "Pay.", headerKey: "headerPayables", key: "payables", style: { "width": "8%" } },
        { label: "Margin", headerKey: "headerMargin", key: "margin", style: { "width": "11%" } },
        { label: "", headerKey: "headerInfo", key: "info", style: { "width": "6%" } },
      ],
    }
  },
  methods: {
    ...mapActions([
      "alertToggle",
      // "setProjectProp",
      "setCurrentProject",
      "setStepsStatus",
      // "setProjectStatus",
      // "reopenSteps"
    ]),
    getStepPair(step) {
      return `<span>${ step.sourceLanguage }</span><span> &#8811; </span><span>${ step.targetLanguage }</span>`
    },
    progress(prog) {
      return prog.hasOwnProperty('totalWordCount') ? +((prog.wordsDone / prog.totalWordCount) * 100).toFixed(2) : +prog
    },
    lastProgress(step, index) {
      if (step.stepId.includes('R')) {
        const prevStep = this.currentProject.steps[index - 1]
        if (prevStep.finance.Price.hasOwnProperty('halfReceivables') && prevStep.finance.Price.halfReceivables > 0) {
          return ((prevStep.progress.wordsDone / prevStep.progress.totalWordCount) * 100).toFixed(2)
        }
      }
      return 0
    },
    vendorName(vendor) {
      const surname = vendor && (vendor.surname && vendor.surname !== "undefined") ? vendor.surname : ""
      return vendor ? vendor.firstName + ' ' + surname : ""
    },

    setTab({ index }) {
      this.$emit('setTab', {index})
    },
    async setAction({ option }) {
      this.selectedAction = option
      if (option === 'Change Deadline') {
        this.deadlineModal = true
      } else {
        this.setModalTexts(option)
        this.isApproveActionShow = true
      }

      // switch (option) {
      //   case "Mark as accept/reject":
      //   case "Request confirmation":
      //   case "ReOpen":
      //     this.setModalTexts(option)
      //     this.isApproveActionShow = true
      //     break
      //   case "Change Deadline" :
      //     this.deadlineModal = true
      //     break
      // }
    },
    setModalTexts(option) {
      this.modalTexts = { main: "Are you sure?", approve: "Yes", notApprove: "No" }
      switch (this.selectedAction) {
        case "Request confirmation":
          this.modalTexts.main = "Please, choose action:"
          this.modalTexts.approve = "Send"
          this.modalTexts.notApprove = "Cancel"
          break
        case "Mark as accept/reject":
          this.modalTexts.main = "Select the status:"
          this.modalTexts.approve = "Accepted"
          this.modalTexts.notApprove = "Rejected"
      }
    },
    toggleAll(isCheck) {
        this.copySteps = this.copySteps.reduce((acc, cur) => {
          acc.push({ ...cur, isCheck: isCheck })
          return acc
        }, [])
    },
    toggleCheck(index, isCheck) {
      this.$set(this.copySteps[index], "isCheck", isCheck)
    },
    isEvery(stepStatus) {
      const checkedSteps = this.copySteps.filter(item => item.isCheck)
      if (checkedSteps.length) return checkedSteps.every(({ status }) => status === stepStatus)
    },

    async approveAction() {
      try {
        const groupedByStatus = this.checkedSteps.reduce((acc, step) => {
          if (!acc.hasOwnProperty(step.status)) {
            acc[step.status] = [ step ]
          } else {
            acc[step.status].push(step)
          }
          return acc
        }, {})

        for (const [ stepStatus, steps ] of Object.entries(groupedByStatus)) {
          //[ 'Created', 'Approved', 'Rejected', 'Request Sent', 'Ready to Start', 'Waiting to Start', 'In Progress', 'Completed', 'Cancelled', 'Cancelled Halfway' ],
          const statusAndAction = this.getStatusAndAction(stepStatus, this.selectedAction)
          console.log(statusAndAction)
          switch (statusAndAction) {
            //Action MARK AS ACCEPT/REJECT
            case "Created__Mark-as-accept/reject":
            case "Approved__Mark-as-accept/reject":
            case "Rejected__Mark-as-accept/reject":
            case "Request-Sent__Mark-as-accept/reject":
              const assignedSteps = steps.filter(item => item.vendor)
              if (assignedSteps.length) await this.decideOnSteps(assignedSteps, "Approved")
              break

            //Action REQUEST CONFIRMATION
            case "Created__Request-confirmation":
            case "Rejected__Request-confirmation":
            case "Request-Sent__Request-confirmation":
              await this.requestConfirmation(this.checkedSteps)
              break

            //Action CHANGE DEADLINE
            case "Created__Change-Deadline":
            case "Request-Sent__Change-Deadline":
            case "Completed__Change-Deadline":

              break

            //Action RE OPEN
            case "Completed__ReOpen":

              break

            default:
              console.log(statusAndAction)
          }

        }
      } catch (e) {

      } finally {
        this.closeApproveModal()
      }
      // this.isApproveActionShow = false
      // const checkedSteps = this.checkedSteps
      // !checkedSteps.length ? this.closeApproveModal() : await this.doStepApproveAction(checkedSteps)
    },
    async notApproveAction() {
      const checkedSteps = this.checkedSteps
      if (!checkedSteps.length) return this.closeApproveModal()
      try {
        switch (this.modalTexts.notApprove) {
          case "No":
          case "Cancel":
            this.closeApproveModal()
            break
          case "Rejected":
            const assignedSteps = checkedSteps.filter(item => item.vendor)
            if (assignedSteps.length) {
              await this.decideOnSteps(assignedSteps, "Rejected")
            }
        }
      } catch (err) {
        this.alertToggle({ message: "Internal server error.Try later.", isShow: true, type: 'error' })
      } finally {
        this.closeApproveModal()
      }
    },

    closeApproveModal() {
      this.isApproveActionShow = false
      this.selectedAction = ""
    },

    getStatusAndAction(status, action ) {
      //TODO: add status * to accept all statuses Example: *__Change-deadline accept change deadline to all statuses
      return (status + '__' + action).replaceAll(' ', '-')
    },

    //-------------- Actions Functions -------------------------------------------

    async decideOnSteps(assignedSteps, selectedStatus) {
      try {
        const withPayables = assignedSteps.filter(item => item.finance.Price.payables)
        if (withPayables.length) {
          const status = selectedStatus === 'Accepted' ? this.getAcceptedStepStatus() : selectedStatus
          await this.setStepsStatus({ status, steps: withPayables })
        }
        if (withPayables.length < assignedSteps.length) {
          // this.showErrors([ `One or more steps could not be ${ selectedStatus.toLowerCase() } as payables are missing` ])
        }
      } catch (err) {
        console.log(err)
      }
    },

    async requestConfirmation(steps) {
      const filteredSteps = steps.filter(item => item.status === "Created" || item.status === "Rejected")
      if (!filteredSteps.length) return
      // const zeroPayablesStep = filteredSteps.find(item => !item.finance.Price.payables)
      // if (!!zeroPayablesStep) {
      //   return this.showErrors([ "There are steps with no payables!" ])
      // }
      try {
        const result = await this.$http.post('/pm-manage/vendor-request', { checkedSteps: filteredSteps, projectId: this.currentProject._id })
        await this.setCurrentProject(result.data)
        this.selectedAction = ""
        this.alertToggle({ message: "Requests has been sent.", isShow: true, type: 'success' })
      } catch (err) {
        this.alertToggle({ message: "Error: Request Confirmation cannot be sent.", isShow: true, type: 'error' })
      }
    },

    getAcceptedStepStatus() {
      if (this.currentProject.status === 'Approved' || this.currentProject.status === 'In progress') {
        return 'Ready to Start'
      }
      return "Accepted"
    },
  },
  computed: {
    ...mapGetters({
      currentProject: 'getCurrentProject',
    }),
    selectedTabQuery() {
      return this.$route.query.selectedTab || 'Tasks'
    },
    stepActions() {
      // console.log(this.copySteps)
      // const checkedSteps = this.copySteps.filter(item => item.isCheck).map(item => item.status)
      // const availableStatusForChangeDeadline = [ 'Created', 'Ready to Start', 'Request Sent', 'Waiting to Start', 'In progress', 'Started' ]
      // const indexesForAvailableStatuses = checkedSteps.map(item => availableStatusForChangeDeadline.indexOf(item))
      // console.log(this.isEvery('Created'))
      // if (this.isEvery('Created')) {
      //   return [ "Mark as accept/reject", "Request confirmation", "Change Deadline" ]
      // } else if (this.isEvery('Request Sent')) {
      //   return [ "Mark as accept/reject", "Change Deadline" ]
      // } else if (this.isEvery('Completed')) {
      //   return [ "ReOpen" ]
      // } else if (indexesForAvailableStatuses.length && !indexesForAvailableStatuses.includes(-1)) {
      //   return [ "Change Deadline" ]
      // }

      if(this.checkedSteps.length < 1) return []
      return [ "Mark as accept/reject", "Request confirmation", "Change Deadline", "ReOpen" ]

    },
    checkedSteps() {
      return this.copySteps.filter(({isCheck})=> isCheck)
    },
    copySteps() {
      return this.currentProject.steps
    },
    isAllSelected() {
      return (this.copySteps && this.copySteps.length) && this.copySteps.every(i => i.isCheck)
    },
  },
  components: {
    GeneralTable,
    CheckBox,
    Datepicker,
    ProgressLineStep,
    Tabs,
    SelectSingle,
    ApproveModal,
  }
}
</script>

<style scoped lang="scss">
@import "../../../assets/scss/colors";
.steps {
  position: relative;
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

  &__approve-action {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 9999;
    box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;
    background-color: #fff;
    border-radius: 4px;
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
  &__space-between {
    padding: 0 6px;
    word-break: break-word;
    width: 100%;
    display: flex;
    justify-content: space-between;
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