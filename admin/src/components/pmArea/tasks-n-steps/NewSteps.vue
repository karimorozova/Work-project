<template lang="pug">
  .steps
    .steps__vendorDetails(v-if="isVendorDetailsModal && vendorDetailsId")
      StepVendorDetails(
        :index="infoIndex"
        :vendorId="vendorDetailsId"
        :currentStep="currentStep"
        :currentProject="currentProject"
        :currentIndustry="currentProject.industry"
        :projectCurrency="currentProject.projectCurrency"
        @close="closeVendorDetailsModal"
      )

    .steps__stepDetails(v-if="isStepInfo")
      StepInfo(
        :step="finalData[infoIndex]"
        :index="infoIndex"
        :task="getTask(infoIndex)"
        @closeStepInfo="closeStepInfo"
        :projectCurrency="currentProject.projectCurrency"
        @updateProject="approveFinanceModal"
      )

    .steps__stepFinance(v-if="isFinanceEdit")
      ProjectFinanceModal(
        :step="finalData[infoIndex]"
        :index="infoIndex"
        :projectCurrency="currentProject.projectCurrency"
        :currentProject="currentProject"
        @closeFinanceEditing="closeFinanceEditing"
        @approve="approveFinanceModal"
      )

    .steps__approve-action(v-if="isApproveActionShow")
      ApproveModal(
        :text="modalTexts.main"
        :approveValue="modalTexts.approve"
        :notApproveValue="modalTexts.notApprove"
        @approve="approveAction"
        @notApprove="closeApproveModal"
        @close="closeApproveModal"
      )

    .steps__change-deadline(v-if="deadlineModal")
      .steps__change-deadline-close(@click="closeErrorsDeadline") &#215;
      DatePicker(
        class="no-border"
        @confirm="(e) => setMassDeadline(e)"
        type="datetime"
        :clearable="false"
        :confirm="true"
        confirm-text="Set date"
        :inline="true"
        prefix-class="xmx"
      )

    .steps__action(v-if="!isProjectFinished && !$parent.isTaskData && checkedSteps.length")
      .steps__drop-menu
        SelectSingle(
          :selectedOption="selectedAction"
          :options="stepActions"
          placeholder="Steps Action"
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
          CheckBox(:isChecked="!!isAllSelected" :isWhite="true" @check="toggleAll(true)" @uncheck="toggleAll(false)")
        .table__header(v-else) {{ field.label }}

      template(slot="check" slot-scope="{ row, index }")
        .table__data
          CheckBox(:isChecked="row.isCheck" @check="()=>toggleCheck(row._id, true)" @uncheck="()=>toggleCheck(row._id, false)" customClass="tasks-n-steps")

      template(slot="step" slot-scope="{ row }")
        .table__data(style="display: flex; flex-wrap: wrap; gap: 6px;")
          span(v-if="!row.isReceivableVisible")
            PopUp(text="Disabled")
              span(style="opacity: 0.4; cursor: help;")
                i(class="fa-solid fa-eye-slash")
          span {{ row.step.title }}

      template(slot="language" slot-scope="{ row }")
        .table__data(v-html="getStepPair(row)")

      template(slot="vendor" slot-scope="{ row, index }")
        .table__data(v-if="row.vendor")
          span.vendor__details(@click="openVendorDetailsModal(row.vendor, row, index)") {{ vendorName(row.vendor) }}
        .table__data(v-else)
          .emptyVendor No vendor...

      template(slot="start" slot-scope="{ row, index }")
        .table__data
          DatePicker(
            :value="new Date(row.start)"
            :editable="false"
            input-class="table-input"
            @confirm="(e) => setDate(e, 'start', row._id)"
            format="MMM D, HH:mm"
            type="datetime"
            :clearable="false"
            icon-calendar=''
            :confirm="true"
            confirm-text="Set date"
            prefix-class="xmx"
          )

      template(slot="deadline" slot-scope="{ row, index }")
        .table__data
          DatePicker(
            :value="new Date(row.deadline)"
            :editable="false"
            input-class="table-input"
            @confirm="(e) => setDate(e, 'deadline', row._id)"
            format="MMM D, HH:mm"
            type="datetime"
            :clearable="false"
            icon-calendar=''
            :confirm="true"
            confirm-text="Set date"
            prefix-class="xmx"
          )

      template(slot="status" slot-scope="{ row, index }")
        .table__statusAndProgress
          .status {{ row.status }}
          .progress(v-if="row.status !== 'Cancelled'" )
            ProgressLineStep(:progress="progress(row.progress)" :status="row.status" :lastProgress="lastProgress(row, index)")


      template(slot="receivables" slot-scope="{ row }")
        .table__finance
          span.currency(v-if="!currentProject.minimumCharge.isUsed" v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
          span(v-if="row.finance.Price.receivables !== ''") {{ !currentProject.minimumCharge.isUsed ? +(row.finance.Price.receivables).toFixed(2) : '-' }}

      template(slot="payables" slot-scope="{ row }")
        .table__finance
          span.currency(v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
          span(v-if="row.finance.Price.payables !== ''") {{ +(row.finance.Price.payables).toFixed(2) }}

      template(slot="margin" slot-scope="{ row, index }")
        .table__finance(:id="'margin'+index")
          span(v-if="marginCalc(row)")
            span.currency(v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
          span(v-if="marginCalc(row)") {{ marginCalc(row) }}
          sup(:class="{'red-color': (+marginCalcPercent(row) > 1 && +marginCalcPercent(row) < 50) || +marginCalcPercent(row) < 0  }" v-if="marginCalc(row)") {{ marginCalcPercent(row) }}%

      template(slot="info" slot-scope="{row, index}")
        .table__icons(v-if="!isFinanceEdit && !isStepInfo && !isVendorDetailsModal")
          img(src="../../../assets/images/latest-version/step-info.svg" style="cursor: pointer;" @click="showStepDetails(index)")
        .table__icons(v-else)
          img(src="../../../assets/images/latest-version/step-info.svg" style="cursor: default; filter: opacity(0.5);")
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
import { mapActions, mapGetters } from "vuex"
import moment from "moment"
import DatepickerWithTime from "../../DatepickerWithTime"
import currencyIconDetected from "../../../mixins/currencyIconDetected"
import tableSortAndFilter from "../../../mixins/tableSortAndFilter"
import StepInfo from "./StepInfo"
import ProjectFinanceModal from "../ProjectFinanceModal"
import StepVendorDetails from './StepVendorDetails'


import DatePicker from 'vue2-datepicker'
import '../../../assets/scss/datepicker.scss'
import PopUp from "../../PopUp"

export default {
  mixins: [ scrollDrop, currencyIconDetected, tableSortAndFilter ],
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
      vendorDetailsId: null,
      currentStep: null,
      isVendorDetailsModal: false,
      infoIndex: -1,
      isStepInfo: false,
      isFinanceEdit: false,
      deadlineModal: false,
      selectedAction: '',
      isApproveActionShow: false,
      modalTexts: { main: "Are you sure?", approve: "Yes", notApprove: "No" },
      // {
      //   label: "Services",
      //       headerKey: "headerService",
      //     key: "services",
      //     dataKey: "title",
      //     sortInfo: { isSort: true, order: 'default' },
      //   filterInfo: { isFilter: true },
      //   style: {width: "20%"},
      // },
      fields: [
        { label: "Check", headerKey: "headerCheck", key: "check", style: { "width": "3%" } },
        {
          label: "Step",
          headerKey: "headerName",
          key: "step",
          dataKey: "title",
          sortInfo: { isSort: true, order: 'default' },
          filterInfo: { isFilter: true },
          style: { "width": "10%" }
        },
        { label: "Languages", headerKey: "headerLanguage", key: "language", style: { "width": "12%" } },
        { label: "Vendor", headerKey: "headerVendor", key: "vendor", style: { "width": "12%" } },
        { label: "Status", headerKey: "headerStatus", key: "status", sortInfo: { isSort: true, order: 'default' }, filterInfo: { isFilter: true }, style: { "width": "12%" } },
        { label: "Start", headerKey: "headerStart", key: "start", sortInfo: { isSort: true, order: 'default' }, style: { "width": "10%" } },
        { label: "Deadline", headerKey: "headerDeadline", key: "deadline", sortInfo: { isSort: true, order: 'default' }, style: { "width": "10%" } },
        { label: "Rec.", headerKey: "headerReceivables", key: "receivables", style: { "width": "8%" } },
        { label: "Pay.", headerKey: "headerPayables", key: "payables", style: { "width": "8%" } },
        { label: "Margin", headerKey: "headerMargin", key: "margin", style: { "width": "10%" } },
        { label: "", headerKey: "headerInfo", key: "info", style: { "width": "5%" } }
      ]
    }
  },
  methods: {
    ...mapActions([
      "alertToggle",
      "setCurrentProject",
      "setStepsStatus"
    ]),
    approveFinanceModal(data) {
      this.setCurrentProject(data)
    },
    closeVendorDetailsModal() {
      this.vendorDetailsId = null
      this.isVendorDetailsModal = false
      this.infoIndex = -1
    },
    openVendorDetailsModal(vendor, step, index) {
      if (this.isStepInfo || this.isFinanceEdit) return
      const { _id } = vendor
      this.vendorDetailsId = _id
      this.currentStep = step
      this.infoIndex = index
      this.isVendorDetailsModal = true
    },
    closeStepInfo() {
      this.isStepInfo = false
      this.infoIndex = -1
    },
    closeFinanceEditing() {
      this.infoIndex = -1
      this.isFinanceEdit = false
    },
    getTask(index) {
      return this.currentProject.tasks.find(item => {
        return item.taskId === this.finalData[index].taskId
      })
    },
    showStepDetails(index) {
      this.infoIndex = index
      this.isStepInfo = true
    },
    showFinanceEditing(index) {
      this.infoIndex = index
      this.isFinanceEdit = true
    },
    marginCalc(step) {
      const { Price } = step.finance
      let margin = 0
      margin = +Price.receivables - +Price.payables
      return +margin.toFixed(2)
    },
    marginCalcPercent(step) {
      const { Price } = step.finance
      let percent = NaN
      percent = 100 - (Price.payables / Price.receivables) * 100
      return Number.isNaN(percent) || !isFinite(percent) ? 0 : percent.toFixed(0)
    },
    closeErrorsDeadline() {
      this.deadlineModal = false
      this.selectedAction = ''
      this.toggleAll(false)
    },
    customFormatter(date) {
      return moment(date).format('MMM D, HH:mm')
    },
    getStepPair(step) {
      return step.sourceLanguage === step.targetLanguage
          ? `${ step.targetLanguage }`
          : `<span>${ step.sourceLanguage }</span><span style="font-size: 12px;color: #9c9c9c;margin: 0 4px;"><i class="fas fa-angle-double-right"></i></span><span>${ step.targetLanguage }</span>`
    },
    progress(prog) {
      return prog.hasOwnProperty('totalWordCount') ? +((prog.wordsDone / prog.totalWordCount) * 100).toFixed(2) : +prog
    },
    lastProgress(step, index) {
      if (step.stepId.includes('[R]')) {
        const prevStep = this.currentProject.steps[index - 1]
        if (typeof prevStep.progress === 'object') {
          return ((prevStep.progress.wordsDone / prevStep.progress.totalWordCount) * 100).toFixed(2)
        } else {
          prevStep.progress
        }
      }
      return 0
    },
    vendorName(vendor) {
      return vendor ? vendor.firstName + ' ' + vendor.surname || '' : ""
    },
    setTab({ index }) {
      this.$emit('setTab', { index })
    },
    async setAction({ option }) {
      this.selectedAction = option
      if (option === 'Set Deadline' || option === 'Set Start time') {
        this.deadlineModal = true
      } else {
        this.modalTexts = { main: "Are you sure?", approve: "Yes", notApprove: "No" }
        this.isApproveActionShow = true
      }
    },
    toggleAll(isCheck) {
      this.currentProject.steps = this.currentProject.steps.reduce((acc, cur) => {
        acc.push({ ...cur, isCheck: isCheck })
        return acc
      }, [])
    },
    toggleCheck(id, isCheck) {
      const index = this.currentProject.steps.findIndex(step => step._id === id)
      const obj = this.currentProject.steps[index]
      obj.isCheck = isCheck
      this.currentProject.steps.splice(index, 1, obj)
      // this.$set(this.finalData[index], "isCheck", isCheck)
    },
    getStepByStatus(statuses) {
      const filtered = []
      statuses.forEach(status => filtered.push(...this.checkedSteps.filter(step => step.status === status)))
      return filtered
    },
    async approveAction() {
      switch (this.selectedAction) {
        case "Request Confirmation" :
          await this.requestConfirmation(this.getStepByStatus([ 'Created', 'Rejected', 'Request Sent' ]))
          break
        case "Mark as Approved" :
          await this.decideOnSteps('Approved', this.getStepByStatus([ 'Created', 'Rejected', 'Request Sent' ]))
          break
        case "Mark as Rejected" :
          await this.decideOnSteps('Rejected', this.getStepByStatus([ 'Created', 'Rejected', 'Request Sent', 'Approved', 'Ready to Start', 'Waiting to Start' ]))
          break
        case "Start a Job" :
          await this.startJobs()
          break
        case "Complete a Job" :
          await this.completeJobs()
          break
      }
    },
    async completeJobs() {
      const steps = this.checkedSteps.filter(({ status }) => status === 'In progress')
      this.closeApproveModal()
      if (steps.length) for await (const step of steps) {
        await this.completeJob(step)
      }
    },
    async completeJob(step) {
      const isCat = step.memoqDocIds.length
      try {
        const updatedProject = await this.$http.post('/vendorsapi/manage-step-status', {
          projectId: this.currentProject._id,
          status: 'Completed',
          stepId: step.stepId,
          _stepId: step._id,
          isCat
        })
        await this.setCurrentProject(updatedProject.data)
      } catch (err) {
        this.alertToggle({ message: `Error at completing job`, isShow: true, type: 'error' })
      }
    },
    async startJobs() {
      const steps = this.checkedSteps
          // .filter(({ status }) => status === 'Ready to Start')
      this.closeApproveModal()
      if (steps.length) for await (const step of steps) {
        await this.startJob(step)
      }
    },
    async startJob(step) {
      const { receivablesUnit: { type }, vendor, stepId } = step
      if (type === 'CAT Wordcount') {
        const memoqUsers = await this.$http.get(`/memoqapi/users`)
        const memoqUsersData = memoqUsers.data
        const memoqUserGuids = memoqUsersData.map(({ id }) => id)
        const memoqUserMails = memoqUsersData.map(({ email }) => email)
        const noUserGuidInMemoq = !memoqUserGuids.includes(vendor.guid)
        const includesEmailInMemoq = memoqUserMails.includes(vendor.email)

        switch (true) {
          case (vendor.guid === null || vendor.guid === '') && !includesEmailInMemoq:
          case !!vendor.guid && noUserGuidInMemoq && !includesEmailInMemoq:
            try {
              await this.$http.get(`/vendorsapi/create-memoq-vendor/${ vendor._id }`)
            } catch (err) {
              this.alertToggle({ message: `Error on creating Vendor`, isShow: true, type: 'error' })
            }
            break
          case vendor.guid === null && includesEmailInMemoq:
          case !!vendor.guid && noUserGuidInMemoq && includesEmailInMemoq:
            try {
              await this.$http.post('/vendorsapi/rewrite-quid-for-translator', { memoqUsers: memoqUsers.data, vendorId: vendor._id })
            } catch (err) {
              this.alertToggle({ message: `Error on rewriting Vendor Guid`, isShow: true, type: 'error' })
            }
            break
        }
        try {
          await this.$http.post('/vendorsapi/assign-translator', { stepId, _stepId: step._id, vendorId: vendor._id, projectId: this.currentProject._id, stepAction: 'Start' })
        } catch (err) {
          this.alertToggle({ message: `Error at appointment Vendor on Memoq`, isShow: true, type: 'error' })
        }
      }
      try {
        const updatedProject = await this.$http.post('/vendorsapi/manage-step-status', {
          projectId: this.currentProject._id,
          status: 'In progress',
          stepId: stepId,
          _stepId: step._id
        })
        await this.setCurrentProject(updatedProject.data)
      } catch (err) {
        this.alertToggle({ message: `Error at appointment Vendor on Memoq`, isShow: true, type: 'error' })
      }
    },
    async setMassDeadline(date) {
      const prop = this.selectedAction === 'Set Start time' ? 'start' : 'deadline'
      for await (const step of this.checkedSteps) {
        await this.setDate(date, prop, step._id)
      }
      this.closeErrorsDeadline()
    },
    async setDate(date, prop, stepId) {
      const step = this.currentProject.steps.find(item => item._id === stepId)
      if (step.status === 'Completed') return
      step[prop] = new Date(date)
      const { type } = step.receivablesUnit
      await this.sendStepsDates({ _id: this.currentProject._id, step, stepId, type, prop })
    },
    closeApproveModal() {
      this.isApproveActionShow = false
      this.selectedAction = ""
      this.toggleAll(false)
    },
    async decideOnSteps(status, steps) {
      if (!steps.length) {
        this.closeApproveModal()
        return
      }
      try {
        steps = steps.filter(item => !!item.vendor)
        this.closeApproveModal()
        await this.setStepsStatus({ status, steps })
      } catch (err) {
        this.alertToggle({ message: `Error:  Status: ${ status }, cannot be set.`, isShow: true, type: 'error' })
      }
    },
    async sendStepsDates({ _id, step, stepId, type, prop }) {
      try {
        const updatedProject = await this.$http.post('/pm-manage/update-steps-dates', { projectId: _id, step, stepId, type, prop })
        await this.setCurrentProject(updatedProject.data)
      } catch (err) {
        this.alertToggle({ message: `Error on setting steps dates.`, isShow: true, type: 'error' })
      }
    },
    async requestConfirmation(steps) {
      if (!steps.length) {
        this.closeApproveModal()
        return
      }
      try {
        const checkedSteps = steps.filter(item => !!item.vendor)
        this.closeApproveModal()
        const result = await this.$http.post('/pm-manage/vendor-request', { checkedSteps, projectId: this.currentProject._id })
        await this.setCurrentProject(result.data)
        this.selectedAction = ""
        this.alertToggle({ message: "Requests has been sent.", isShow: true, type: 'success' })
      } catch (err) {
        this.alertToggle({ message: "Error: Request Confirmation cannot be sent.", isShow: true, type: 'error' })
      }
    }
  },
  computed: {
    ...mapGetters({
      currentProject: 'getCurrentProject'
    }),
    selectedTabQuery() {
      return this.$route.query.selectedTab || 'Tasks'
    },
    stepActions() {
      if (this.checkedSteps.length < 1) return []
      return [ "Request Confirmation", "Mark as Approved", "Mark as Rejected", "Start a Job", "Complete a Job", "Set Start time", "Set Deadline" ]
    },
    checkedSteps() {
      return this.finalData.filter(({ isCheck }) => isCheck)
    },
    // finalData() {
    //   return this.currentProject.steps
    // },
    isAllSelected() {
      return (this.finalData && this.finalData.length) && this.finalData.every(i => i.isCheck)
    },
    rawData() {
      return this.currentProject.steps
    },
    isProjectFinished() {
      const { status } = this.currentProject
      return status === 'Closed' || status === 'Cancelled Halfway' || status === 'Cancelled'
    }
  },
  components: {
    PopUp,
    StepVendorDetails,
    ProjectFinanceModal,
    StepInfo,
    DatepickerWithTime,
    GeneralTable,
    CheckBox,
    Datepicker,
    ProgressLineStep,
    Tabs,
    SelectSingle,
    ApproveModal,
    DatePicker
  }
}
</script>

<style scoped lang="scss">
@import "../../../assets/scss/colors";

.steps {
  position: relative;

  &__action {
    position: absolute;
    top: -51px;
    right: 127px;
  }

  &__title {
    margin-bottom: 4px;
  }

  &__drop-menu {
    position: relative;
    width: 220px;
    height: 32px;
  }

  &__vendorDetails,
  &__stepDetails,
  &__stepFinance {
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translate(-50%, 0px);
    z-index: 9999;
  }

  &__approve-action {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 9999;
    box-shadow: $box-shadow;
    background-color: #fff;
    border-radius: 2px;
  }

  &__change-deadline {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 9999;
    box-shadow: $box-shadow;
    background-color: #fff;
    border-radius: 2px;
    padding: 30px 0 0 0;
    width: 250px;

    &-close {
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
}

.table {
  width: 100%;

  &__data {
    padding: 0 7px;
  }

  &__finance {
    padding: 0 3px 0 7px;
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
    border-radius: 2px;
  }

  &__icons {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    gap: 10px;

    img {
      height: 20px;
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

  &__statusAndProgress {
    width: 100%;
    padding: 0 6px;
  }
}

input {
  font-size: 14px;
  color: $text;
  border: 1px solid $border;
  border-radius: 2px;
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

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

.currency {
  margin-right: 4px;
  color: $dark-border;
}

.red-color {
  color: $red;
}

.vendor__details {
  cursor: pointer;
  color: $text;
  text-decoration: none;
  transition: .2s ease-out;

  &:hover {
    text-decoration: underline;
  }
}

.emptyVendor {
  opacity: .3;
}

</style>