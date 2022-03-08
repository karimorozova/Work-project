<template lang="pug">
  .step-dashboard(v-if="user._id")
    .step-dashboard__change-deadline(v-if="deadlineModal")
      .step-dashboard__change-deadline-close(@click="closeErrorsDeadline") &#215;
      DatePicker(
        class="no-border"
        @confirm="(e) => setMassDeadline(e)"
        format="DD-MM-YYYY, HH:mm"
        type="datetime"
        :clearable="false"
        :confirm="true"
        confirm-text="Set date"
        :inline="true"
        prefix-class="xmx"
      )
    .step-dashboard__approve-action(v-if="isApproveActionShow")
      ApproveModal(
        :text="modalTexts.main"
        :approveValue="modalTexts.approve"
        :notApproveValue="modalTexts.notApprove"
        @approve="approveAction"
        @notApprove="closeApproveModal"
        @close="closeApproveModal"
      )
    .step-dashboard__modal(v-if="isFinanceEdit")
      ProjectFinanceModal(
        :step="steps[infoIndex].steps"
        :index="infoIndex"
        :projectCurrency="steps[infoIndex].projectCurrency"
        :currentProject="steps[infoIndex]"
        @closeFinanceEditing="closeFinanceEditing"
        @approve="approveFinanceModal"
      )

    .step-dashboard__modal(v-if="isStepInfo")
      StepInfo(
        :step="steps[infoIndex].steps"
        :index="infoIndex"
        :projectCurrency="steps[infoIndex].projectCurrency"
        :task="getTask(infoIndex)"
        @closeStepInfo="closeStepInfo"
      )

    .modal(v-if="isModalOpen")
      VendorManage(
        :steps="[steps[infoIndex].steps]"
        :currentProject="steps[infoIndex]"
        @closeVendorManage="toggleVendorManage"
        @updateCurrentProject="updateSteps"
      )

    .step-dashboard__modal(v-if="isVendorDetailsModal && vendorDetailsId")
      StepVendorDetails(
        :index="infoIndex"
        :vendorId="vendorDetailsId"
        :currentStep="steps[infoIndex].steps"
        :currentIndustry="steps[infoIndex].industry"
        :projectCurrency="steps[infoIndex].projectCurrency"
        :currentProject="steps[infoIndex]"
        @close="closeVendorDetailsModal"
      )

    .step-dashboard__stepsActions(v-if="checkedSteps.length")
      .drop
        SelectSingle(
          :selectedOption="selectedAction"
          :options="stepActions"
          placeholder="Step Actions"
          @chooseOption="setAction"
          :isDisabled="!checkedSteps.length"
        )
    LayoutsListWrapper(
      :hasFilterButton="true"
      :hasClearButton="true"
      :isFilterActive="isFilterActive"
      @toggleFilters="toggleFilters"
      @clearFilters="clearFilters"
    )
      template(slot="filters")
        StepsDashboardFilters(
          v-if="userGroup && user"
          :userGroup="userGroup"
        )
      template(slot="table")
        LayoutsTable(
          :fields="fields"
          :tableData="steps"
          @bottomScrolled="bottomScrolled"
        )
          template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
            .table__header(v-if="field.headerKey === 'headerCheck'")
              CheckBox(:isChecked="isAllSelected" :isWhite="true" :isDisabled="isAm" @check="toggleAll(true)" @uncheck="toggleAll(false)")
            .table__header(v-else) {{ field.label }}

          template(slot="check" slot-scope="{ row, index }")
            .table__data
              CheckBox(:isChecked="row.isCheck" :isDisabled="isAm" @check="toggleCheck(index, true)" @uncheck="toggleCheck(index, false)")

          template(slot="projectId" slot-scope="{ row, index }")
            .table__projectId
              router-link(class="link-to" :to="{path: `/pangea-projects/all-projects/All/details/${row._id}`}")
                span {{row.projectId}}
              .short
                span {{ row.projectName }}

          template(slot="status" slot-scope="{ row, index }")
            .table__statusAndProgress
              .status {{ row.steps.status }}
              .progress
                ProgressLineStep(:progress="progress(row.steps.progress)" :status="row.steps.status")

          template(slot="langPair" slot-scope="{ row, index }")
            .table__data
              span {{row.steps.sourceLanguage}} &ensp;
              span( style="font-size: 12px;color: #9c9c9c;margin: 0 2px;")
                i(class="fas fa-angle-double-right")
              span {{row.steps.targetLanguage}} &ensp;

          template(slot="langPair" slot-scope="{ row, index }")
            .table__data
              span {{row.steps.sourceLanguage+' '}}
              span( style="font-size: 12px;color: #9c9c9c;margin: 0 2px;")
                i(class="fas fa-angle-double-right")
              span {{' ' + row.steps.targetLanguage}}

          template(slot="step" slot-scope="{ row, index }")
            .table__data
              span {{row.steps.step.title}}

          template(slot="vendor" slot-scope="{ row, index }")
            .table__data(v-if="row.steps.vendor")
              .vendor-details(@click="openVendorDetailsModal(row.steps.vendor, row.steps, index)")
                span {{row.steps.vendor.firstName + ' ' + row.steps.vendor.surname  }}
            .table__data(v-else)
              .emptyVendor No vendor...

          template(slot="startDate" slot-scope="{ row, index }")
            .table__data {{ customFormatter(row.steps.start) }}

          template(slot="deadline" slot-scope="{ row, index }")
            .table__data
              span.deadline-red(v-if="isDueToday(row.steps.deadline)" ) {{ customFormatter(row.steps.deadline) }}
              span.deadline-orange(v-else-if="isDueTomorrow(row.steps.deadline)" ) {{ customFormatter(row.steps.deadline) }}
              span(v-else) {{ customFormatter(row.steps.deadline) }}

          template(slot="receivables" slot-scope="{ row }")
            .table__data
              span.currency(v-if="!row.minimumCharge.isUsed" v-html="returnIconCurrencyByStringCode(row.projectCurrency)")
              span(v-if="row.steps.finance.Price.receivables !== ''") {{ !row.minimumCharge.isUsed ? +(row.steps.finance.Price.receivables).toFixed(2) : '-' }}

          template(slot="payables" slot-scope="{ row }")
            .table__data
              span.currency(v-html="returnIconCurrencyByStringCode(row.projectCurrency)")
              span(v-if="row.steps.finance.Price.payables !== ''") {{ +(row.steps.finance.Price.payables).toFixed(2) }}

          template(slot="margin" slot-scope="{ row, index }")
            .table__finance(:id="'margin'+index")
              span(v-if="marginCalc(row.steps)")
                span.currency(v-html="returnIconCurrencyByStringCode(row.projectCurrency)")
              span(v-if="marginCalc(row.steps)") {{ marginCalc(row.steps) }}
              sup(:class="{'red-color': (+marginCalcPercent(row.steps) > 1 && +marginCalcPercent(row.steps) < 50) || +marginCalcPercent(row.steps) < 0  }" v-if="marginCalc(row.steps)") {{ marginCalcPercent(row.steps) }}%

          template(slot="icons" slot-scope="{ row, index }")
            .table__icons(v-if="!isFinanceEdit && !isStepInfo && !isVendorDetailsModal && !isModalOpen && !isAm")
              img(src="../../assets/images/latest-version/step-info.svg" style="cursor: pointer;" @click="showFinanceEditing(index)")
              img(src="../../assets/images/latest-version/vendor-manage.svg" style="cursor: pointer;" @click="toggleVendorManage(index)")
              img(src="../../assets/images/latest-version/refresh-icon.svg" style="cursor: pointer;" @click="() => refreshProgress(index)")
            .table__icons(v-else)
              img(src="../../assets/images/latest-version/step-info.svg" style="cursor: default; filter: opacity(0.5);")
              img(src="../../assets/images/latest-version/vendor-manage.svg" style="cursor: default; filter: opacity(0.5);")
              img(src="../../assets/images/latest-version/refresh-icon.svg" style="cursor: default; filter: opacity(0.5);")

          template(slot="projectManager" slot-scope="{ row, index }")
            .table__imageWithHover
              .tooltip.user__image
                .tooltip-data.user(v-html="row.projectManager.firstName + ' ' + row.projectManager.lastName")
                img(v-if="getUserPhoto(row.projectManager)" :src="getUserPhoto(row.projectManager)")
                .user__fakeImage(:style="{'--bgColor': getBgColor(row.projectManager._id)[0], '--color':getBgColor(row.projectManager._id)[1]  }" v-else)
                  span {{ row.projectManager.firstName[0].toUpperCase() }}

          template(slot="accountManager" slot-scope="{ row, index }")
            .table__imageWithHover
              .tooltip.user__image
                .tooltip-data.user(v-html="row.accountManager.firstName + ' ' + row.accountManager.lastName")
                img(v-if="getUserPhoto(row.accountManager)" :src="getUserPhoto(row.accountManager)")
                .user__fakeImage(:style="{'--bgColor': getBgColor(row.accountManager._id)[0], '--color':getBgColor(row.accountManager._id)[1]  }" v-else)
                  span {{ row.accountManager.firstName[0].toUpperCase() }}

          template(slot="clientName" slot-scope="{ row, index }")
            .table__imageWithHover
              .tooltip.user__image
                .tooltip-data.user(v-html="row.customer.name")
                .user__fakeImage(:style="{'--bgColor': getBgColor(row.customer._id)[0], '--color':getBgColor(row.customer._id)[1] }")
                  span {{ row.customer.name[0].toUpperCase() }}
</template>

<script>
import LayoutsTable from "../LayoutsTable"
import Tabs from "../Tabs"
import StepsDashboardFilters from "./StepsDashboardFilters"
import moment from "moment"
import { mapActions, mapGetters } from "vuex"
import getBgColor from "../../mixins/getBgColor"
import ProgressLineStep from "../ProgressLineStep"
import CheckBox from "../CheckBox"
import currencyIconDetected from "../../mixins/currencyIconDetected"
import ProjectFinanceModal from "../pmArea/ProjectFinanceModal"
import StepInfo from "../pmArea/tasks-n-steps/StepInfo"
import StepVendorDetails from "../pmArea/tasks-n-steps/StepVendorDetails"
import VendorManage from "../pmArea/VendorManage"
import SelectSingle from "../SelectSingle"
import ApproveModal from "../ApproveModal"
import DatePicker from 'vue2-datepicker'
import '../../assets/scss/datepicker.scss'
import _ from 'lodash'
import LayoutsListWrapper from '../LayoutsListWrapper'
import LayoutsListWrapperLogic from "../../mixins/LayoutsListWrapperLogic"

export default {
  mixins: [ getBgColor, currencyIconDetected, LayoutsListWrapperLogic],
  components: {
    ApproveModal,
    SelectSingle,
    StepVendorDetails,
    StepInfo,
    ProjectFinanceModal,
    CheckBox,
    ProgressLineStep,
    LayoutsTable,
    Tabs,
    StepsDashboardFilters,
    VendorManage,
    DatePicker,
    LayoutsListWrapper
  },
  data() {
    return {
      isFilterActive: false,
      deadlineModal: false,
      isApproveActionShow: false,
      selectedAction: '',
      infoIndex: -1,
      isFinanceEdit: false,
      isVendorDetailsModal: false,
      isStepInfo: false,
      isModalOpen: false,
      vendorDetailsId: null,

      filteredFields: [],
      steps: [],
      currentPage: 1,
      isDataRemain: false,

      projectId: '',
      projectName: '',
      accountManager: '',
      projectManager: '',
      stepsStatuses: '',
      sourceLanguages: '',
      targetLanguages: '',
      services: '',
      vendors: '',
      clients: '',
      startDateFrom: '',
      startDateTo: '',
      deadlineFrom: '',
      deadlineTo: '',

      modalTexts: { main: "Are you sure?", approve: "Yes", notApprove: "No" },
      dataVariables: [
        'projectId',
        'projectName',
        'accountManager',
        'projectManager',
        'stepsStatuses',
        'sourceLanguages',
        'targetLanguages',
        'services',
        'vendors',
        'clients',
        'startDateFrom',
        'startDateTo',
        'deadlineFrom',
        'deadlineTo'
      ],
      fields: [
        {
          label: "",
          headerKey: "headerCheck",
          key: "check",
          style: { width: "36px" }
        },
        {
          label: "Project ID",
          headerKey: "headerID",
          key: "projectId",
          style: { "width": "160px" }
        },
        {
          label: "Service",
          headerKey: "headerStep",
          key: "step",
          style: { "width": "120px" }
        },
        {
          label: "Languages",
          headerKey: "headerLangPair",
          key: "langPair",
          style: { "width": "120px" }
        },
        {
          label: "Vendor",
          headerKey: "headerVendor",
          key: "vendor",
          style: { "width": "140px" }
        },
        {
          label: "Status",
          headerKey: "headerStatus",
          key: "status",
          style: { "width": "120px" }
        },
        {
          label: "Start",
          headerKey: "headerStartDate",
          key: "startDate",
          style: { "width": "105px" }
        },
        {
          label: "Deadline",
          headerKey: "headerDeadline",
          key: "deadline",
          style: { "width": "105px" }
        },
        {
          label: "Rec.",
          headerKey: "headerReceivables",
          key: "receivables",
          style: { "width": "85px" }
        },
        {
          label: "Pay.",
          headerKey: "headerPayables",
          key: "payables",
          style: { "width": "85px" }
        },
        {
          label: "Margin",
          headerKey: "headerMargin",
          key: "margin",
          style: { "width": "100px" }
        },
        {
          label: "",
          headerKey: "headerIcons",
          key: "icons",
          style: { "width": "115px" }
        },
        {
          label: "PM",
          headerKey: "headerProjectManager",
          key: "projectManager",
          style: { "width": "56px" }
        },
        {
          label: "AM",
          headerKey: "headerAccountManager",
          key: "accountManager",
          style: { "width": "56px" }
        },
        {
          label: "Client",
          headerKey: "headerClientName",
          key: "clientName",
          style: { "width": "56px" }
        }
      ]
    }
  },
  methods: {
    ...mapActions({
      alertToggle: 'alertToggle'
    }),
    clearFilters() {
      this.$router.replace({ 'query': null }).catch((err) => err)
      this.defaultSetter()
    },
    isDueToday(date) {
      const deadline = moment(date).unix()
      const todayFinish = moment().utcOffset(0).set({ hour: 23, minute: 59, second: 59, millisecond: 59 }).unix()
      return deadline <= todayFinish
    },
    isDueTomorrow(date) {
      const deadline = moment(date).unix()
      const tomorrowStart = moment().utcOffset(0).add(1, 'd').set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).unix()
      const tomorrowFinish = moment().utcOffset(0).add(1, 'd').set({ hour: 23, minute: 59, second: 59, millisecond: 59 }).unix()
      return tomorrowStart <= deadline && deadline <= tomorrowFinish
    },
    async setMassDeadline(date) {
      const prop = this.selectedAction === 'Set Start time' ? 'start' : 'deadline'
      for await (const item of this.checkedSteps) {
        await this.setDate(date, prop, item.steps._id, item._id)
      }
      this.closeErrorsDeadline()
    },
    async setDate(date, prop, stepId, projectId) {
      let { steps: step } = this.steps.find(item => item.steps._id.toString() === stepId.toString())
      if (step.status === 'Completed') return
      step[prop] = new Date(date)
      const { type } = step.receivablesUnit
      await this.sendStepsDates({ _id: projectId, step, stepId, type, prop })
    },
    async sendStepsDates({ _id, step, stepId, type, prop }) {
      try {
        const updatedProject = await this.$http.post('/pm-manage/update-steps-dates', { projectId: _id, step, stepId, type, prop })
      } catch (err) {
        this.alertToggle({ message: `Error on setting steps dates.`, isShow: true, type: 'error' })
      }
    },
    async decideOnSteps(status, steps) {
      if (!steps.length) {
        this.closeApproveModal()
        return
      }
      try {
        this.closeApproveModal()
        const projectWithSteps = _.groupBy(steps, '_id')
        for (const id in projectWithSteps) {
          const neededSteps = projectWithSteps[id]
              .map(item => item.steps)
              .filter(item => !!item.vendor)

          if (neededSteps.length) {
            const updatedProject = await this.$http.post('/pm-manage/step-status', { id, status, steps: neededSteps })
            const { steps } = updatedProject.data
            this.mutateCurrentSteps(steps)
          }
        }
      } catch (err) {
        this.alertToggle({ message: `Error:  Status: ${ status }, cannot be set.`, isShow: true, type: 'error' })
      }
    },
    getStepByStatus(statuses) {
      const filtered = []
      statuses.forEach(status => filtered.push(...this.checkedSteps.filter(item => item.steps.status === status)))
      return filtered
    },
    async requestConfirmation(steps) {
      if (!steps.length) {
        this.closeApproveModal()
        return
      }
      try {
        this.closeApproveModal()
        const projectWithSteps = _.groupBy(steps, '_id')
        for (const projectId in projectWithSteps) {
          const checkedSteps = projectWithSteps[projectId]
              .map(item => item.steps)
              .filter(item => !!item.vendor)

          if (checkedSteps.length) {
            const result = await this.$http.post('/pm-manage/vendor-request', { checkedSteps, projectId })
            const { steps } = result.data
            this.mutateCurrentSteps(steps)
          }
        }
        this.alertToggle({ message: "Requests has been sent.", isShow: true, type: 'success' })
      } catch (err) {
        this.alertToggle({ message: "Error: Request Confirmation cannot be sent.", isShow: true, type: 'error' })
      }
    },
    closeErrorsDeadline() {
      this.deadlineModal = false
      this.selectedAction = ''
      this.toggleAll(false)
    },
    closeApproveModal() {
      this.isApproveActionShow = false
      this.selectedAction = ""
      this.toggleAll(false)
    },
    async approveAction() {
      console.log('this.selectedAction', this.selectedAction)
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
      const steps = this.checkedSteps.filter(item => item.steps.status === 'In progress')
      this.closeApproveModal()
      if (steps.length) for await (const item of steps) {
        await this.completeJob(item.steps, item._id)
      }
      this.steps = this.steps.filter(item => item.steps.status !== 'Completed')
    },
    async completeJob(step, projectId) {
      const isCat = step.memoqDocIds.length
      try {
        const updatedProject = await this.$http.post('/vendorsapi/manage-step-status', {
          projectId,
          status: 'Completed',
          stepId: step.stepId,
          _stepId: step._id,
          isCat
        })
        const { steps } = updatedProject.data
        await this.mutateCurrentSteps(steps)
      } catch (err) {
        this.alertToggle({ message: `Error at completing job`, isShow: true, type: 'error' })
      }
    },
    async startJobs() {
      const steps = this.checkedSteps.filter(item => item.steps.status === 'Ready to Start')
      this.closeApproveModal()
      if (steps.length) for await (const item of steps) {
        await this.startJob(item.steps, item._id)
      }
    },
    async startJob(step, projectId) {
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
          await this.$http.post('/vendorsapi/assign-translator', { stepId, _stepId: step._id, vendorId: vendor._id, projectId, stepAction: 'Start' })
        } catch (err) {
          this.alertToggle({ message: `Error at appointment Vendor on Memoq`, isShow: true, type: 'error' })
        }
      }
      try {
        const updatedProject = await this.$http.post('/vendorsapi/manage-step-status', {
          projectId,
          status: 'In progress',
          stepId: stepId,
          _stepId: step._id
        })
        const { steps } = updatedProject.data
        await this.mutateCurrentSteps(steps)
      } catch (err) {
        this.alertToggle({ message: `Error at appointment Vendor on Memoq`, isShow: true, type: 'error' })
      }
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
    toggleVendorManage(index) {
      if (!this.isModalOpen && index >= 0) {
        this.infoIndex = index
      } else {
        this.infoIndex = -1
      }
      this.isModalOpen = !this.isModalOpen
    },
    updateSteps(data) {
      const { steps } = data
      this.mutateCurrentSteps(steps)
    },
    async refreshProgress(index) {
      try {
        const payload = {
          projectId: this.steps[index]._id,
          isCatTool: this.getTask(index).hasOwnProperty('memoqDocs') && !!this.getTask(index).memoqDocs.length
        }
        const updatedProject = (await this.$http.post('/pm-manage/update-progress', payload)).data
        const { steps } = updatedProject
        this.mutateCurrentSteps(steps)
        this.alertToggle({ message: "Progress updated!", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Can't updated progress", isShow: true, type: "error" })
      }
    },
    mutateCurrentSteps(steps) {
      for (const newStep of steps) {
        const _idx = this.steps.findIndex(item => item.steps._id.toString() === newStep._id.toString())
        if (_idx > -1) {
          const updated = this.steps[_idx]
          updated.steps = newStep
          this.steps.splice(_idx, 1, updated)
        }
      }
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
    getTask(index) {
      return this.steps[index].tasks[0]
    },
    showStepDetails(index) {
      this.infoIndex = index
      this.isStepInfo = true
    },
    closeStepInfo() {
      this.isStepInfo = false
      this.infoIndex = -1
    },
    showFinanceEditing(index) {
      this.infoIndex = index
      this.isFinanceEdit = true
    },
    closeFinanceEditing() {
      this.infoIndex = -1
      this.isFinanceEdit = false
    },
    approveFinanceModal(data) {
      const prevProjectStep = this.steps[this.infoIndex]
      prevProjectStep.steps = data.steps.find(item => item._id === prevProjectStep.steps._id)
      this.steps.splice(this.infoIndex, 1, prevProjectStep)
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
    toggleCheck(index, val) {
      this.steps[index].isCheck = val
    },
    toggleAll(val) {
      this.steps = this.steps.reduce((acc, cur) => {
        acc.push({ ...cur, isCheck: val })
        return acc
      }, [])
    },
    progress(progress) {
      return progress.hasOwnProperty('totalWordCount') ? +((progress.wordsDone / progress.totalWordCount) * 100).toFixed(2) : +progress
    },
    getUserPhoto({ _id }) {
      const photo = this.users.find(({ _id: id }) => id.toString() === _id.toString()).photo
      return photo || undefined
    },
    customFormatter(date) {
      return moment(date).format('MMM D, HH:mm')
    },
    async bottomScrolled() {
      if (this.isDataRemain) {
        this.currentPage += 1
        const result = (await this.$http.post(`/dashboard-api/pipeline?page=${ this.currentPage }&limit=25`, { filters: this.filters })).data
        this.steps.push(...result.map(item => ({ ...item, isCheck: false })))
        this.isDataRemain = result.length === 25
      }
    },
    async getData() {
      try {
        const result = (await this.$http.post(`/dashboard-api/pipeline?page=1&limit=25`, { filters: this.filters })).data
        this.steps = result.map(item => ({ ...item, isCheck: false }))
        this.isDataRemain = result.length === 25
      } catch (err) {
        this.alertToggle({ message: "Error on Steps data", isShow: true, type: "error" })
      }
    },
    querySetter(vm, to) {
      for (let variable of this.dataVariables) {
        if (to.query[variable] != null) {
          vm[variable] = to.query[variable]
        }
      }
    },
    defaultSetter() {
      for (let variable of this.dataVariables) this[variable] = ''
    },
    replaceRoute(key, value) {
      let query = this.$route.query
      delete query[key]
      this.$router.replace({ path: this.$route.path, query: { ...query, [key]: value } })
    },
    setCurrentAmOrPm() {
      if (!this.$route.query.hasOwnProperty('accountManager') && this.userGroup.name === 'Account Managers') {
        this.replaceRoute('accountManager', this.user._id)
      }
      if (!this.$route.query.hasOwnProperty('projectManager') && this.userGroup.name === 'Project Managers') {
        this.replaceRoute('projectManager', this.user._id)
      } else if (this.$route.query.hasOwnProperty('projectManager') && this.userGroup.name === 'Project Managers' && this.$route.query.projectManager.toString() !== this.user._id.toString()) {
        this.replaceRoute('projectManager', this.user._id)
      }
    }
  },
  computed: {
    ...mapGetters({
      userGroup: "getUserGroup",
      user: "getUser",
      users: "getUsers"
    }),
    stepActions() {
      if (this.checkedSteps.length < 1) return []
      return [ "Request Confirmation", "Mark as Approved", "Mark as Rejected", "Start a Job", "Complete a Job", "Set Start time", "Set Deadline" ]
    },
    checkedSteps() {
      return this.steps.filter(({ isCheck }) => isCheck)
    },
    isAllSelected() {
      if (this.steps && this.steps.length) return this.steps.every(i => i.isCheck)
    },
    filters() {
      const filters = {}
      for (let variable of this.dataVariables) filters[variable] = this[variable]
      return filters
    },
    isAm() {
      return this.userGroup.name === 'Account Managers'
    }
  },
  watch: {
    async $route(to, from) {
      if (to.path === from.path) {
        // this.defaultSetter()
        this.setCurrentAmOrPm()
        this.querySetter(this, to)
        await this.getData()
      }
    }
  },
  created() {
    this.defaultSetter()
    this.setCurrentAmOrPm()
    this.querySetter(this, this.$route)
    this.getData()
  },
}
</script>

<style scoped lang="scss">
@import "../../assets/scss/colors";
@import "../../assets/scss/LayoutFilters";

.red-color {
  color: $red;
}

.step-dashboard {
  position: relative;
  //width: 1530px;
  //margin: 50px 50px 0;
  //position: relative;
  //background: #fff;
  //padding: 25px;
  //box-sizing: border-box;
  //border-radius: 2px;
  //box-shadow: $box-shadow;

  &__stepsActions {
    left: 136px;
    top: -41px;
    position: absolute;
  }

  &__modal {
    position: absolute;
    top: 100px;
    left: 50%;
    transform: translate(-50%, 0);
    z-index: 9999;
  }

  .table {
    &__icons {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      gap: 12px;

      img {
        height: 20px;
      }
    }

    &__statusAndProgress {
      width: 100%;
    }

    &__imageWithHover {
      display: flex;
      justify-content: center;
      width: 100%;
    }

    &__header {
      padding: 0 0 0 7px;
    }
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

a {
  color: $text;
  text-decoration: none;
  transition: .2s ease-out;

  &:hover {
    text-decoration: underline;
  }
}

.short {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 146px;
  opacity: 0.3;
}


.tooltip {
  position: relative;
  display: flex;
  cursor: help;
  color: $dark-border;
  text-align: center;


  &.user {
    height: 32px;
    width: 32px;
    background: $light-border;
    border-radius: 50%;
    justify-content: center;
    align-items: center;
    color: $dark-border;
  }

  &-data {
    visibility: hidden;
    font-size: 14px;
    max-width: 280px;
    min-width: 140px;
    background: white;
    border-radius: 2px;
    right: 15px;
    top: -7px;
    padding: 7px 7px 5px 7px;
    position: absolute;
    z-index: 555;
    opacity: 0;
    transition: opacity .3s;
    border: 1px solid $text;
    color: $text;

    &.user {
      right: 40px;
      top: 1px;
      color: $text;
    }

    &::after {
      content: "";
      position: absolute;
      top: 8px;
      right: -12px;
      transform: rotate(270deg);
      border-width: 6px;
      border-style: solid;
      border-color: $text transparent transparent;
    }
  }

  &:hover {
    .tooltip-data {
      visibility: visible;
      opacity: 1;
    }
  }
}

.user {
  &__fakeImage {
    height: 32px;
    width: 32px;
    border-radius: 32px;
    background-color: var(--bgColor);
    color: var(--color);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 18px;
  }

  &__image {
    height: 32px;
    width: 32px;
    border-radius: 32px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 32px;
    }
  }
}

.emptyVendor {
  opacity: .3;
}

.currency {
  margin-right: 4px;
  color: $dark-border;
}

.vendor-details {
  cursor: pointer;
  color: $text;
  text-decoration: none;
  transition: .2s ease-out;

  &:hover {
    text-decoration: underline;
  }
}

.modal {
  position: absolute;
  left: 0px;
  top: 0px;
  z-index: 45;
  box-sizing: border-box;
  min-width: 1510px;
  width: 1530px;
  padding: 25px;
  box-shadow: $box-shadow;
  background: white;
  border-radius: 2px;
  z-index: 30000;
}

.drop {
  position: relative;
  width: 220px;
  height: 32px;

  &__title {
    display: block;
    margin-bottom: 3px;
    font-family: Myriad600;
  }
}

.deadline {
  &-red {
    color: #f44336;
  }

  &-orange {
    color: #ffa726;
  }
}

.clear-filter {
  position: absolute;
  right: 10px;
  top: 48px;
  background: #fff;
  border: 1px solid $border;
  border-radius: 2px;
  cursor: pointer;
  padding: 5px;
  transition: .2s ease-out;

  & i {
    color: #9c9c9c;
    height: 20px;
    width: 20px;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-pack: center;
    justify-content: center;
    -ms-flex-align: center;
    align-items: center;
  }

  &:hover {
    & i {
      color: $text;
    }
  }
}
</style>