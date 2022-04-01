<template lang="pug">
  .reports
    .reports__wrapper
      .options
        .options__item(v-if="ifSomeCheck")
          .options__input
            SelectSingle(
              :options="availableActionOptions",
              placeholder="Reports Actions",
              :selectedOption="selectedReportAction",
              @chooseOption="openApproveActionModal"
            )
      .modal
        .modal__block
          ApproveModal(
            v-if="isActionModal"
            :text='`Confirm action: "${selectedReportAction}"`'
            approveValue="Yes"
            notApproveValue="Cancel"
            @approve="manageReportActions"
            @close="closeApproveActionModal"
            @notApprove="closeApproveActionModal"
          )
        .modal__block
          ApproveModal(
            v-if="deleteRequestId !== ''"
            text="Are you sure?"
            approveValue="Yes"
            notApproveValue="Cancel"
            @approve="deleteRequest"
            @close="closeDeleteRequestModal"
            @notApprove="closeDeleteRequestModal"
          )

      LayoutsListWrapper(
        :hasFilterButton="true"
        :hasClearButton="true"
        :isFilterActive="isFilterActive"
        @toggleFilters="toggleFilters"
        @clearFilters="clearFilters"
      )
        template(slot="table")
          LayoutsTable(
            :fields="fields"
            :tableData="reports"
            @bottomScrolled="bottomScrolled"
          )
            template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
              .table__header(v-if="field.headerKey === 'headerCheck'")
                CheckBox(:isChecked="!!isAllSelected" :isWhite="true" @check="toggleAll(true)" @uncheck="toggleAll(false)")
              .table__header(v-else-if="field.headerKey === 'headerAmount'" )
                .amount-header
                  .amount-header__title {{ field.label }}
                  .amount-header__icon(@mouseover="calculateTotal" @mouseout="totalAmount = 0")
                    PopUp(
                      :text="totalAmount + ' €'"
                    )
                      span &Sigma;

              .table__header(v-else) {{ field.label }}

            template(slot="check" slot-scope="{ row, index }")
              .table__data
                CheckBox(:isChecked="row.isCheck" @check="toggleCheck(index, true)" @uncheck="toggleCheck(index, false)")

            template(slot="reportId" slot-scope="{ row, index }" )
              .table__data
                router-link(class="link-to" :to="{path: `/pangea-finance/payables-reports/reports/${row._id}`}")
                  span {{ row.reportId }}

            template(slot="dateRange" slot-scope="{ row, index }")
              .table__data(v-html="dateRange(row)")

            template(slot="vendorName" slot-scope="{ row, index }")
              .table__data
                router-link(class="link-to" :to="{path: '/pangea-vendors/all/details/' + row.vendor._id }" target= '_blank')
                  span {{ row.vendor.firstName + ' ' + row.vendor.surname }}

            template(slot="type" slot-scope="{ row, index }")
              .table__data(v-if="row.paymentDetails.paymentMethod" )
                div.type {{ row.paymentDetails.paymentMethod.paymentType  }}
                div.name {{ row.paymentDetails.paymentMethod.name }}
              .table__data(v-else) -

            template(slot="status" slot-scope="{ row, index }")
              .table__data {{ row.status }}

            template(slot="jobs" slot-scope="{ row, index }")
              .table__data {{ row.steps.length }}

            template(slot="amount" slot-scope="{ row, index }")
              .table__data
                span.currency(v-html="'&euro;'")
                span {{ +(row.total).toFixed(2) }}

            template(slot="paymentDay" slot-scope="{ row, index }")
              .table__data(v-if="row.paymentDetails.expectedPaymentDate && row.status !== 'Invoice on-hold'" ) {{ getTime( row.paymentDetails.expectedPaymentDate) }}
              .table__data(v-else) -

            template(slot="created" slot-scope="{ row, index }")
              .table__data {{ getTime( row.createAt) }}

            template(slot="updated" slot-scope="{ row, index }")
              .table__data {{ getTime( row.updatedAt) }}

            template(slot="icon" slot-scope="{ row, index }")
              .table__icon(v-if="row.status === 'Created'|| row.status === 'Sent' || user.group.name === 'Developers'  || user.group.name === 'Administrators'")
                i(class="fas fa-trash" @click="requestToDeleteRequest(row._id)")

        template(slot="filters")
          .filter
            .filter__item
              label Report Id
              .filter__input
                input(type="text" placeholder="Value" :value="reportIdValue" @change="reportIdSetFilter" @keyup.13="reportIdSetFilter")
                .clear-icon(v-if="reportIdValue.length" @click="removeSelectedInputs('reportId')")
                  i.fas.fa-backspace
            .filter__item
              label Vendors
              .filter__input
                SelectMulti(
                  :selectedOptions="selectedVendors"
                  :options="allVendors"
                  :hasSearch="true"
                  placeholder="Options"
                  @chooseOptions="setVendors"
                  :isSelectedWithIcon="true"
                  :isRemoveOption="true"
                  @removeOption="removeVendors"
                )
            .filter__item
              label Status
              .filter__input
                SelectMulti(
                  :selectedOptions="selectedStatus"
                  :options="['Created', 'Sent', 'Approved', 'Invoice on-hold', 'Invoice Ready', 'Partially Paid']"
                  placeholder="Option"
                  @chooseOptions="setStatus"
                  :isRemoveOption="true"
                  @removeOption="removeStatus"
                )
            .filter__item
              label Payment Method
              .filter__input
                SelectMulti(
                  :selectedOptions="selectedPaymentMethod"
                  :options="allPaymentMethods.map(i => i.name)"
                  placeholder="Options"
                  @chooseOptions="setPaymentMethod"
                  :isRemoveOption="true"
                  @removeOption="removePaymentMethod"
                )
            .filter__item
              label Payment Date Range
              .filter__input
                DatePicker.range-with-one-panel(
                  :value="selectedPaymentDateRange"
                  @input="(e) => setPaymentDateRange(e)"
                  format="DD-MM-YYYY, HH:mm"
                  prefix-class="xmx"
                  range-separator=" - "
                  :clearable="false"
                  type="datetime"
                  range
                  placeholder="Datetime range"
                )
              .clear-icon-picker(v-if="!!selectedPaymentDateRange[0]" @click="removeSelectedPaymentDateRange()")
                i.fas.fa-backspace.backspace
            .filter__item
              label Deadline Date Range
              .filter__input
                DatePicker.range-with-one-panel(
                  :value="selectedDeadlineDateRange"
                  @input="(e) => setDeadlineDateRange(e)"
                  format="DD-MM-YYYY, HH:mm"
                  prefix-class="xmx"
                  range-separator=" - "
                  :clearable="false"
                  type="datetime"
                  range
                  placeholder="Datetime range"
                )
              .clear-icon-picker(v-if="!!selectedDeadlineDateRange[0]" @click="removeSelectedDeadlineDateRange()")
                i.fas.fa-backspace.backspace

</template>

<script>
import GeneralTable from '../GeneralTable'
import LayoutsTable from '../LayoutsTable'
import moment from "moment"
import CheckBox from "../CheckBox"
import SelectMulti from "../SelectMulti"
import { mapActions, mapGetters } from "vuex"
import DatepickerWithTime from "../DatepickerWithTime"
import SelectSingle from "../SelectSingle"
import Button from "../Button"
import ApproveModal from "../ApproveModal"
import '../../assets/scss/datepicker.scss'
import DatePicker from 'vue2-datepicker'
import LayoutsListWrapper from "../LayoutsListWrapper"
import LayoutsListWrapperLogic from "../../mixins/LayoutsListWrapperLogic"
import PopUp from "../PopUp"

export default {
  name: "InvoicingPayablesList",
  mixins: [ LayoutsListWrapperLogic ],
  data() {
    return {
      selectedReportAction: '',
      isActionModal: false,
      reports: [],
      vendorsList: [],
      allPaymentMethods: [],
      fields: [
        {
          label: "",
          headerKey: "headerCheck",
          key: "check",
          style: { width: "28px" }
        },
        {
          label: "Report ID",
          headerKey: "headerReportId",
          key: "reportId",
          style: { width: "130px" }
        },
        {
          label: "Vendor Name",
          headerKey: "headerVendorName",
          key: "vendorName",
          style: { width: "180px" }
        },
        {
          label: "Type / Name",
          headerKey: "headerType",
          key: "type",
          style: { width: "170px" }
        },
        {
          label: "Status",
          headerKey: "headerStatus",
          key: "status",
          style: { width: "140px" }
        },
        {
          label: "Jobs",
          headerKey: "headerJobs",
          key: "jobs",
          style: { width: "70px" }
        },
        {
          label: "Amount",
          headerKey: "headerAmount",
          key: "amount",
          style: { width: "110px" }
        },
        {
          label: "Payment Date",
          headerKey: "headerPaymentDate",
          key: "paymentDay",
          style: { width: "120px" }
        },
        {
          label: "Date Range",
          headerKey: "headerDateRange",
          key: "dateRange",
          style: { width: "175px" }
        },
        {
          label: "Created On",
          headerKey: "headerCreated",
          key: "created",
          style: { width: "120px" }
        },
        {
          label: "Updated On",
          headerKey: "headerUpdated",
          key: "updated",
          style: { width: "120px" }
        },
        {
          label: "",
          headerKey: "headerIcon",
          key: "icon",
          style: { width: "62px" }
        }
      ],
      isDataRemain: true,

      reportId: '',
      vendors: '',
      deadlineDateFrom: '',
      deadlineDateTo: '',
      paymentDateFrom: '',
      paymentDateTo: '',
      status: '',
      paymentMethod: '',

      dataVariables: [
        'reportId',
        'vendors',
        'deadlineDateFrom',
        'deadlineDateTo',
        'paymentDateFrom',
        'paymentDateTo',
        'status',
        'paymentMethod'
      ],

      deleteRequestId: '',
      totalAmount: 0
    }
  },
  methods: {
    ...mapActions([ 'alertToggle' ]),
    calculateTotal() {
      this.getTotalAmount()
    },
    async manageReportActions() {

      switch (this.selectedReportAction) {
        case "Delete" :
          await this.deleteChecked()
          break
        case 'Send Report' :
          await this.changeTaskStatus()
          break
        case 'Paid':
          await this.paidChecked()
          break
      }
      this.closeApproveActionModal()
    },
    async paidChecked() {
      const data = this.reports.filter(i => i.isCheck).reduce((acc, { _id, reportId, zohoBillingId, total, paymentDetails, vendor }) => {

        acc[_id] = {
          paidAmount: total,
          unpaidAmount: 0,
          paymentMethod: paymentDetails.paymentMethod,
          paymentDate: new Date(),
          vendorEmail: vendor.email,
          vendorName: vendor.firstName + ' ' + vendor.surname,
          zohoBillingId: zohoBillingId,
          reportTextId: reportId,
          dueDate: paymentDetails.expectedPaymentDate,
          notes: ''
        }
        return acc
      }, {})
      this.closeApproveActionModal()
      await (this.$http.post(`/invoicing-payables/reports-final-status/`, data))
      await this.getReports()
    },
    async deleteChecked() {
      this.closeApproveActionModal()
      await this.$http.post('/invoicing-payables/delete-reports', {
        reportIds: this.reports.filter(i => i.isCheck).map(i => i._id.toString())
      })
      await this.getReports()
    },
    async changeTaskStatus() {
      const nextStatus = this.selectedReportAction === 'Send Report' ? 'Sent' : this.selectedReportAction
      this.closeApproveActionModal()
      try {
        await this.$http.post('/invoicing-payables/manage-report-status', {
          reportsIds: this.reports.filter(i => i.isCheck).map(i => i._id.toString()),
          nextStatus
        })
        await this.getReports()
      } catch (error) {
        this.alertToggle({ message: "Error on Reports Actions", isShow: true, type: "error" })
      }
    },
    openApproveActionModal({ option }) {
      this.selectedReportAction = option
      this.isActionModal = true
    },
    closeApproveActionModal() {
      this.selectedReportAction = ''
      this.isActionModal = false
    },
    setStatus({ option }) {
      if (!this.$route.query.status) {
        this.replaceRoute('status', option)
        return
      }
      let list = this.$route.query.status.split(',')
      if (list.includes(option)) list = list.filter(item => item !== option)
      else list.push(option)
      this.replaceRoute('status', list.join(','))
    },
    setPaymentMethod({ option }) {
      if (!this.$route.query.paymentMethod) {
        this.replaceRoute('paymentMethod', option)
        return
      }
      let list = this.$route.query.paymentMethod.split(',')
      if (list.includes(option)) list = list.filter(item => item !== option)
      else list.push(option)
      this.replaceRoute('paymentMethod', list.join(','))
    },
    removePaymentMethod() {
      this.replaceRoute('paymentMethod', '')
    },
    removeStatus() {
      this.replaceRoute('status', '')
    },
    getTime(date) {
      return moment(date).format('MMM D, HH:mm')
    },
    dateRange(row) {
      return `${ this.formattedDate(row.firstPaymentDate) } <span style="color: #999999; margin: 0 4px;">/</span> ${ this.formattedDate(row.lastPaymentDate) || "-" }`
    },
    removeSelectedInputs(prop) {
      this.replaceRoute(prop, '')
    },
    reportIdSetFilter(e) {
      const { value } = e.target
      this.replaceRoute('reportId', value)
    },
    removeSelectedDeadlineDateRange() {
      let query = this.$route.query
      this.$router.replace({
        path: this.$route.path,
        query: { ...query, deadlineDateFrom: '', deadlineDateTo: '' }
      })
    },
    removeSelectedPaymentDateRange() {
      let query = this.$route.query
      this.$router.replace({
        path: this.$route.path,
        query: { ...query, paymentDateFrom: '', paymentDateTo: '' }
      })
    },
    setDeadlineDateRange(e) {
      let query = this.$route.query
      delete query.deadlineDateFrom
      delete query.deadlineDateTo
      this.$router.replace({
        path: this.$route.path,
        query: {
          ...query, deadlineDateFrom: new Date(e[0]).getTime(),
          deadlineDateTo: new Date(e[1]).getTime()
        }
      })
    },
    setPaymentDateRange(e) {
      let query = this.$route.query
      delete query.paymentDateFrom
      delete query.paymentDateTo
      this.$router.replace({
        path: this.$route.path,
        query: {
          ...query, paymentDateFrom: new Date(e[0]).getTime(),
          paymentDateTo: new Date(e[1]).getTime()
        }
      })
    },
    // getStepsPayables(stepFinance) {
    //   return stepFinance.reduce((sum, finance) => {
    //     sum += finance.payables || 0
    //     return sum
    //   }, 0)
    // },
    // getProjectCount(stepFinance) {
    //   return [ ...new Set(stepFinance.map(({ projectName }) => projectName)) ].length
    // },
    openDetails(id) {
      this.$emit('openDetails', id)
    },
    formattedDate(date) {
      return moment(date).format('MMM D')
    },
    toggleCheck(index, val) {
      if (this.isActionModal) return
      this.reports[index].isCheck = val
    },
    async toggleAll(val) {
      // if (val) await this.getReports(1e6)
      if (this.isActionModal) return
      this.reports = this.reports.reduce((acc, cur) => {
        acc.push({ ...cur, isCheck: val })
        return acc
      }, [])
    },
    getVendorsIdByFullName(option) {
      const { _id } = this.vendorsList.find(({ firstName, surname }) => `${ firstName } ${ surname }` === option)
      return _id
    },
    replaceRoute(key, value) {
      let query = this.$route.query
      delete query[key]
      this.$router.replace({ path: this.$route.path, query: { ...query, [key]: value } })
    },
    removeVendors() {
      this.replaceRoute('vendors', '')
    },
    setVendors({ option }) {
      if (!this.$route.query.vendors) {
        this.replaceRoute('vendors', this.getVendorsIdByFullName(option))
        return
      }
      let _ids = this.$route.query.vendors.split(',')
      if (_ids.includes(this.getVendorsIdByFullName(option))) _ids = _ids.filter(_id => _id !== this.getVendorsIdByFullName(option))
      else _ids.push(this.getVendorsIdByFullName(option))
      this.replaceRoute('vendors', _ids.join(','))
    },
    querySetter(vm, to) {
      for (let variable of this.dataVariables) if (to.query[variable] != null) vm[variable] = to.query[variable]
    },
    defaultSetter() {
      for (let variable of this.dataVariables) this[variable] = ''
    },
    requestToDeleteRequest(id) {
      this.deleteRequestId = id
      console.log(id)
    },
    async deleteRequest() {
      await this.$http.get(`/invoicing-payables/report/${ this.deleteRequestId }/delete`)
      await this.getReports()
      this.closeDeleteRequestModal()
    },
    closeDeleteRequestModal() {
      this.deleteRequestId = ''
    },
    async getReports(countToGet = 100) {
      this.reports = (await this.$http.post('/invoicing-payables/reports', {
        countToSkip: 0,
        countToGet,
        filters: this.allFilters
      })).data.map(i => ({ ...i, isCheck: false }))
      this.vendorsList = (await this.$http.get('/pm-manage/vendors-for-options')).data
    },
    async bottomScrolled() {
      if (this.isDataRemain) {
        const result = await this.$http.post("/invoicing-payables/reports", {
          filters: this.allFilters,
          countToSkip: this.reports.length,
          countToGet: 100
        })
        this.reports.push(...result.data.map(i => ({ ...i, isCheck: false })))
        this.isDataRemain = result.data.length === 100
      }
    },
    async getPaymentsMethods() {
      try {
        const result = await this.$http.get("/api-settings/payment-methods")
        this.allPaymentMethods = result.data
      } catch (err) {
        this.alertToggle({ message: "Error on getting Payment Methods", isShow: true, type: "error" })
      }
    },
    async getTotalAmount() {
      const result = await this.$http.post("/invoicing-payables/reports", {
        filters: this.allFilters,
        countToSkip: 0,
        countToGet: 1e6
      })

      this.totalAmount = result.data.length ? (+(result.data.reduce((acc, curr) => acc += +curr.total || 0, 0)).toFixed(2)).toString() : 0
    }
    // TODO Zoho (soon)
    // async updatePayablesStateFromZoho() {
    //   try {
    //     const result = await this.$http.get('/invoicing-payables/update-all-state-from-zoho')
    //     await this.getReports()
    //     const { type, message } = result.data
    //     this.alertToggle({ message, isShow: true, type })
    //   } catch (e) {
    //     console.log(e)
    //   }
    // }
  },
  computed: {
    ...mapGetters({
      user: "getUser"
    }),
    // getTotalAmount() {
    //   return
    // },
    availableActionOptions() {
      if (this.reports && this.reports.length) {
        const availableOptions = []
        if (this.reports.filter(i => i.isCheck).every(i => i.status === 'Created')) {
          availableOptions.push('Send Report')
        }
        if (this.reports.filter(i => i.isCheck).every(i => i.status === 'Created' || i.status === 'Sent')) {
          availableOptions.push('Delete')
        }
        if (this.reports.filter(i => i.isCheck).every(i => i.status === 'Invoice Ready')) {
          availableOptions.push('Paid')
        }
        return availableOptions
      }
    },
    allFilters() {
      const filters = {}
      for (let variable of this.dataVariables) filters[variable] = this[variable]
      return filters
    },
    ifSomeCheck() {
      return this.reports.length && this.reports.some(item => item.isCheck)
    },
    selectedStatus() {
      return this.$route.query.status ? this.$route.query.status.split(',') : []
    },
    selectedPaymentMethod() {
      return this.$route.query.paymentMethod ? this.$route.query.paymentMethod.split(',') : []
    },
    selectedVendors() {
      return this.$route.query.vendors && this.vendorsList.length
          ? this.$route.query.vendors.split(',').map(_id => {
            const vendor = this.vendorsList.find(vendor => _id === vendor._id)
            return vendor ? `${ vendor.firstName } ${ vendor.surname }` : ''
          })
          : []
    },
    allVendors() {
      return this.vendorsList.map(({ firstName, surname }) => `${ firstName } ${ surname }`)
    },
    selectedDeadlineDateRange() {
      return this.$route.query.deadlineDateFrom
          ? [ new Date(+this.$route.query.deadlineDateFrom), new Date(+this.$route.query.deadlineDateTo) ]
          : [ null, null ]
    },
    selectedPaymentDateRange() {
      return this.$route.query.paymentDateFrom
          ? [ new Date(+this.$route.query.paymentDateFrom), new Date(+this.$route.query.paymentDateTo) ]
          : [ null, null ]
    },
    reportIdValue() {
      return this.$route.query.reportId || ''
    },
    isAllSelected() {
      return (this.reports && this.reports.length) && this.reports.every(i => i.isCheck)
    }
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.defaultSetter()
      vm.querySetter(vm, to)
      vm.getReports()
      vm.getPaymentsMethods()
    })
  },
  watch: {
    $route(to, from) {
      if (to.path === from.path) {
        this.querySetter(this, to)
        this.getReports()
        this.getPaymentsMethods()
      }
    }
  },
  components: {
    PopUp,
    LayoutsListWrapper,
    Button,
    SelectSingle,
    DatepickerWithTime,
    SelectMulti,
    GeneralTable,
    LayoutsTable,
    CheckBox,
    ApproveModal,
    DatePicker
  }
}
</script>

<style scoped lang="scss">
@import "../../assets/scss/colors";
@import "../../assets/scss/LayoutFilters";

.fa-trash {
  cursor: pointer;
}

.reports {
  &__wrapper {
    position: relative;
  }

  &__container {
    margin-top: 15px;
  }
}

.options {
  position: absolute;
  top: -41px;
  left: 129px;

  &__item {
    position: relative;
    width: 220px;
  }

  &__input {
    position: relative;
    height: 32px;
  }
}

.table {
  &__icon {
    width: 100%;
    align-items: center;
    display: flex;
    justify-content: center;
    font-size: 15px;
  }
}

.modal {
  position: relative;

  &__block {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, 50%);
    z-index: 50;
  }
}

.currency {
  margin-right: 4px;
  color: $dark-border;
}

.name {
  opacity: 0.4;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 131px;
}

.amount-header {
  display: flex;
  align-items: center;

  &__icon {
    margin-left: 10px;
    cursor: help;
    font-size: 15px;
    font-weight: bold;
    margin-top: -1px;
    color: $dark-border;
    transition: 0.2s ease-out;

    &:hover {
      color: $text;
    }
  }
}
</style>