<template lang="pug">
  .step-dashboard
    //.step-dashboard__modal(v-if="isFinanceEdit")
    //  ProjectFinanceModal(
    //    :step="steps[infoIndex].steps"
    //    :index="infoIndex"
    //    :projectCurrency="steps[infoIndex].projectCurrency"
    //    :currentProject="steps[infoIndex]"
    //    @closeFinanceEditing="closeFinanceEditing"
    //    @approve="approveFinanceModal"
    //  )
    //
    //.step-dashboard__modal(v-if="isStepInfo")
    //  StepInfo(
    //    :step="steps[infoIndex].steps"
    //    :index="infoIndex"
    //    :projectCurrency="steps[infoIndex].projectCurrency"
    //    :task="getTask(infoIndex)"
    //    @closeStepInfo="closeStepInfo"
    //  )
    //
    //.modal(v-if="isModalOpen")
    //  VendorManage(
    //    :steps="[steps[infoIndex].steps]"
    //    :currentProject="steps[infoIndex]"
    //    @closeVendorManage="toggleVendorManage"
    //    @updateCurrentProject="updateSteps"
    //  )
    //
    //.step-dashboard__modal(v-if="isVendorDetailsModal && vendorDetailsId")
    //  StepVendorDetails(
    //    :index="infoIndex"
    //    :vendorId="vendorDetailsId"
    //    :currentStep="steps[infoIndex].steps"
    //    :currentIndustry="steps[infoIndex].industry"
    //    :projectCurrency="steps[infoIndex].projectCurrency"
    //    :currentProject="steps[infoIndex]"
    //    @close="closeVendorDetailsModal"
    //  )
    //
    ////StepsDashboardFilters(
    ////  v-if="userGroup && user"
    ////  :userId="user._id"
    ////  :userGroup="userGroup"
    ////)
    //LayoutsTable(
    //  :fields="fields"
    //  :tableData="steps"
    //  @bottomScrolled="bottomScrolled"
    //  style="margin-top: 15px;"
    //)
    //  template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
    //    .table__header(v-if="field.headerKey === 'headerCheck'")
    //      CheckBox(:isChecked="isAllSelected" :isWhite="true" @check="toggleAll(true)" @uncheck="toggleAll(false)")
    //    .table__header(v-else) {{ field.label }}
    //
    //  template(slot="check" slot-scope="{ row, index }")
    //    .table__data
    //      CheckBox(:isChecked="row.isCheck" @check="toggleCheck(index, true)" @uncheck="toggleCheck(index, false)")
    //
    //  template(slot="projectId" slot-scope="{ row, index }")
    //    .table__projectId
    //      router-link(class="link-to" :to="{path: `/pangea-projects/all-projects/All/details/${row._id}`}")
    //        span {{row.projectId}}
    //      .short
    //        span {{ row.projectName }}
    //
    //  //template(slot="projectName" slot-scope="{ row, index }")
    //  //  .table__data
    //  //      router-link(class="link-to" :to="{path: `/pangea-projects/all-projects/All/details/${row._id}`}")
    //
    //
    //  template(slot="status" slot-scope="{ row, index }")
    //    .table__statusAndProgress
    //      .status {{ row.steps.status }}
    //      .progress
    //        ProgressLineStep(:progress="progress(row.steps.progress)" :status="row.steps.status")
    //
    //  template(slot="langPair" slot-scope="{ row, index }")
    //    .table__data
    //      span {{row.steps.sourceLanguage}} &ensp;
    //      span( style="font-size: 12px;color: #9c9c9c;margin: 0 2px;")
    //        i(class="fas fa-angle-double-right")
    //      span {{row.steps.targetLanguage}} &ensp;
    //
    //  template(slot="langPair" slot-scope="{ row, index }")
    //    .table__data
    //      span {{row.steps.sourceLanguage+' '}}
    //      span( style="font-size: 12px;color: #9c9c9c;margin: 0 2px;")
    //        i(class="fas fa-angle-double-right")
    //      span {{' ' + row.steps.targetLanguage}}
    //
    //  template(slot="step" slot-scope="{ row, index }")
    //    .table__data
    //      span {{row.steps.step.title}}
    //
    //  template(slot="vendor" slot-scope="{ row, index }")
    //    .table__data(v-if="row.steps.vendor")
    //      .vendor-details(@click="openVendorDetailsModal(row.steps.vendor, row.steps, index)")
    //        span {{row.steps.vendor.firstName + ' ' + row.steps.vendor.surname  }}
    //    .table__data(v-else)
    //      .emptyVendor No vendor...
    //
    //  template(slot="startDate" slot-scope="{ row, index }")
    //    .table__data {{ customFormatter(row.startDate) }}
    //
    //  template(slot="deadline" slot-scope="{ row, index }")
    //    .table__data {{ customFormatter(row.deadline) }}
    //
    //  template(slot="receivables" slot-scope="{ row }")
    //    .table__data
    //      span.currency(v-if="!row.minimumCharge.isUsed" v-html="returnIconCurrencyByStringCode(row.projectCurrency)")
    //      span(v-if="row.steps.finance.Price.receivables !== ''") {{ !row.minimumCharge.isUsed ? +(row.steps.finance.Price.receivables).toFixed(2) : '-' }}
    //
    //  template(slot="payables" slot-scope="{ row }")
    //    .table__data
    //      span.currency(v-html="returnIconCurrencyByStringCode(row.projectCurrency)")
    //      span(v-if="row.steps.finance.Price.payables !== ''") {{ +(row.steps.finance.Price.payables).toFixed(2) }}
    //
    //  template(slot="margin" slot-scope="{ row, index }")
    //    .table__finance(:id="'margin'+index")
    //      span(v-if="marginCalc(row.steps)")
    //        span.currency(v-html="returnIconCurrencyByStringCode(row.projectCurrency)")
    //      span(v-if="marginCalc(row.steps)") {{ marginCalc(row.steps) }}
    //      sup(:class="{'red-color': (+marginCalcPercent(row.steps) > 1 && +marginCalcPercent(row.steps) < 50) || +marginCalcPercent(row.steps) < 0  }" v-if="marginCalc(row.steps)") {{ marginCalcPercent(row.steps) }}%
    //
    //  template(slot="icons" slot-scope="{ row, index }")
    //    .table__icons(v-if="!isFinanceEdit && !isStepInfo && !isVendorDetailsModal && !isModalOpen")
    //      img(src="../../assets/images/latest-version/step-info.svg" style="cursor: pointer;" @click="showFinanceEditing(index)")
    //      img(src="../../assets/images/latest-version/vendor-manage.svg" style="cursor: pointer;" @click="toggleVendorManage(index)")
    //      img(src="../../assets/images/latest-version/refresh-icon.svg" style="cursor: pointer;" @click="() => refreshProgress(index)")
    //    .table__icons(v-else)
    //      img(src="../../assets/images/latest-version/step-info.svg" style="cursor: default; filter: opacity(0.5);")
    //      img(src="../../assets/images/latest-version/vendor-manage.svg" style="cursor: default; filter: opacity(0.5);")
    //      img(src="../../assets/images/latest-version/refresh-icon.svg" style="cursor: default; filter: opacity(0.5);")
    //
    //  template(slot="projectManager" slot-scope="{ row, index }")
    //    .table__imageWithHover
    //      .tooltip.user__image
    //        .tooltip-data.user(v-html="row.projectManager.firstName + ' ' + row.projectManager.lastName")
    //        img(v-if="getUserPhoto(row.projectManager)" :src="getUserPhoto(row.projectManager)")
    //        .user__fakeImage(:style="{'--bgColor': getBgColor(row.projectManager._id)[0], '--color':getBgColor(row.projectManager._id)[1]  }" v-else)
    //          span {{ row.projectManager.firstName[0].toUpperCase() }}
    //
    //  template(slot="accountManager" slot-scope="{ row, index }")
    //    .table__imageWithHover
    //      .tooltip.user__image
    //        .tooltip-data.user(v-html="row.accountManager.firstName + ' ' + row.accountManager.lastName")
    //        img(v-if="getUserPhoto(row.accountManager)" :src="getUserPhoto(row.accountManager)")
    //        .user__fakeImage(:style="{'--bgColor': getBgColor(row.accountManager._id)[0], '--color':getBgColor(row.accountManager._id)[1]  }" v-else)
    //          span {{ row.accountManager.firstName[0].toUpperCase() }}
    //
    //  template(slot="clientName" slot-scope="{ row, index }")
    //    .table__imageWithHover
    //      .tooltip.user__image
    //        .tooltip-data.user(v-html="row.customer.name")
    //        .user__fakeImage(:style="{'--bgColor': getBgColor(row.customer._id)[0], '--color':getBgColor(row.customer._id)[1] }")
    //          span {{ row.customer.name[0].toUpperCase() }}
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

export default {
  mixins: [ getBgColor, currencyIconDetected ],
  data() {
    return {
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
      tasksStatuses: '',
      sourceLanguages: '',
      targetLanguages: '',
      services: '',

      dataVariables: [
        'projectId',
        'projectName',
        'clientName',
        'projectManager',
        'accountManager',
        'startDate',
        'deadline',
        'sourceLanguages',
        'targetLanguages',
        'industry',
        'services',
        'isTest',
        'projectCurrency',
        'paymentProfile',
        'vendors',
        'tasksStatuses',
        'requestId'
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
        // {
        //   label: "Project Name",
        //   headerKey: "headerProjectName",
        //   key: "projectName",
        //   style: { "width": "150px" }
        // },
        {
          label: "Service",
          headerKey: "headerStep",
          key: "step",
          style: { "width": "110px" }
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
          style: { "width": "110px" }
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
          style: { "width": "55px" }
        },
        {
          label: "AM",
          headerKey: "headerAccountManager",
          key: "accountManager",
          style: { "width": "55px" }
        },
        {
          label: "Client",
          headerKey: "headerClientName",
          key: "clientName",
          style: { "width": "55px" }
        }
      ]
    }
  },
  methods: {
    ...mapActions({
      alertToggle: 'alertToggle'
    }),
    highlight() {
      return 'test'
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
      console.log('steps', steps)
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
    // clearFilters() {
    //   this.$router.replace({ 'query': null }).catch((err) => err)
    //   this.defaultSetter()
    //   // this.getData()
    // },
    // async updateFiltersAndFields(data) {
    //   // await this.$http.post('/pm-manage/update-filters-and-fields/' + this.user._id, { data })
    //   // await this.setUser()
    // },
    // getLastDateFromRes({ data }) {
    //   return (data && data.length) ? data[data.length - 1].startDate : ""
    // },
    // getProjectName(str) {
    //   if (!str.substr(0, 32).includes(' ') && str.length > 32) {
    //     return str.substr(0, 32) + '...'
    //   }
    //   return str
    // },
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
        console.log('STTETEPPSS', this.steps)
        this.isDataRemain = result.length === 25
      } catch (err) {
        this.alertToggle({ message: "Error on Steps data", isShow: true, type: "error" })
      }
    },
    querySetter(vm, to) {
      for (let variable of this.dataVariables) {
        if (to.query[variable] != null) vm[variable] = to.query[variable]
      }
    },
    defaultSetter() {
      for (let variable of this.dataVariables) this[variable] = ''
    }
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.defaultSetter()
      vm.querySetter(vm, to)
      vm.getData()
    })
  },
  computed: {
    ...mapGetters({
      userGroup: "getUserGroup",
      user: "getUser",
      users: "getUsers"
    }),
    isAllSelected() {
      if (this.steps && this.steps.length) return this.steps.every(i => i.isCheck)
    },
    filters() {
      const filters = { status: this.status }
      for (let variable of this.dataVariables) filters[variable] = this[variable]
      return filters
    }
  },
  watch: {
    $route(to, from) {
      if (to.path === from.path) {
        this.querySetter(this, to)
        this.getData()
      }
    }
  },
  async created() {
    await this.getData()
  },
  components: {
    StepVendorDetails,
    StepInfo,
    ProjectFinanceModal,
    CheckBox,
    ProgressLineStep,
    LayoutsTable,
    Tabs,
    StepsDashboardFilters,
    VendorManage
  }
}
</script>

<style scoped lang="scss">
@import "../../assets/scss/colors";

.red-color {
  color: $red;
}

.test {
  background-color: red;
}

.step-dashboard {
  width: 1530px;
  margin: 50px 50px 0;
  position: relative;
  background: #fff;
  padding: 25px;
  box-sizing: border-box;
  border-radius: 4px;
  box-shadow: $box-shadow;

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
  max-width: 160px;
  color: $border;
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
    border-radius: 4px;
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
  border-radius: 4px;
  z-index: 30000;
}
</style>