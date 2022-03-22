<template lang="pug">
  .reports
    .reports__wrapper
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
              .table__header {{ field.label }}

            template(slot="reportId" slot-scope="{ row, index }" )
              .table__data
                router-link(class="link-to" :to="{path: `/pangea-finance/payables-reports/paid-reports/${row._id}`}")
                  span {{ row.reportId }}

            template(slot="paymentDay" slot-scope="{ row, index }")
              .table__data(v-if="row.paymentDetails.expectedPaymentDate" ) {{ getTime( row.paymentDetails.expectedPaymentDate) }}
              .table__data(v-else) -

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
              .table__data(v-if="row.total" )
                span.currency(v-html="'&euro;'")
                span {{ +(row.total).toFixed(2) }}

            template(slot="created" slot-scope="{ row, index }")
              .table__data {{ getTime( row.createdAt) }}

            template(slot="updated" slot-scope="{ row, index }")
              .table__data {{ getTime( row.updatedAt) }}

        template(slot="filters")
          .filter
            .filter__item
              label Report Id:
              .filter__input
                input(type="text" placeholder="Value" :value="reportIdValue" @change="reportIdSetFilter" @keyup.13="reportIdSetFilter")
                .clear-icon(v-if="reportIdValue.length" @click="removeSelectedInputs('reportId')")
                  i.fas.fa-backspace

            .filter__item
              label Vendors:
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
              label Payment Method
              .filter__input
                SelectSingle(
                  :selectedOption="selectedPaymentMethod"
                  :options="allPaymentMethods.map(i => i.name)"
                  placeholder="Option"
                  @chooseOption="setPaymentMethod"
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
              label Date Range:
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
                  placeholder="Select datetime range"
                )
              .clear-icon-picker(v-if="!!selectedDeadlineDateRange[0]" @click="removeSelectedDeadlineDateRange()")
                i.fas.fa-backspace.backspace-long

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

export default {
  mixins: [ LayoutsListWrapperLogic ],
  name: "InvoicingPayablesList",
  data() {
    return {
      selectedReportAction: '',
      isActionModal: false,
      vendorsList: [],
      reports: [],
      allPaymentMethods: [],
      fields: [
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
        }
      ],
      isDataRemain: true,

      reportId: '',
      vendors: '',
      deadlineDateFrom: '',
      deadlineDateTo: '',
      paymentDateFrom: '',
      paymentDateTo: '',
      paymentMethod: '',
      status: '',

      dataVariables: [
        'reportId',
        'vendors',
        'deadlineDateFrom',
        'deadlineDateTo',
        'paymentDateFrom',
        'paymentDateTo',
        'paymentMethod',
        'status'
      ],

      deleteRequestId: ''
    }
  },
  methods: {
    ...mapActions([ 'alertToggle' ]),
    removeSelectedDeadlineDateRange() {
      let query = this.$route.query
      this.$router.replace({
        path: this.$route.path,
        query: { ...query, deadlineDateFrom: '', deadlineDateTo: '' }
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
    removeSelectedPaymentDateRange() {
      let query = this.$route.query
      this.$router.replace({
        path: this.$route.path,
        query: { ...query, paymentDateFrom: '', paymentDateTo: '' }
      })
    },
    setPaymentMethod({ option }) {
      this.replaceRoute('paymentMethod', option)
    },
    removePaymentMethod() {
      this.replaceRoute('paymentMethod', '')
    },
    getTime(date) {
      return moment(date).format('MMM D, HH:mm')
    },
    dateRange(row) {
      return `${ this.formattedDate(row.firstPaymentDate) } <span style="color: #999999;">  /  </span> ${ this.formattedDate(row.lastPaymentDate) || "-" }`
    },
    removeSelectedInputs(prop) {
      this.replaceRoute(prop, '')
    },
    reportIdSetFilter(e) {
      const { value } = e.target
      this.replaceRoute('reportId', value)
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
    // getStepsPayables(stepFinance) {
    //   return stepFinance.reduce((sum, finance) => {
    //     sum += finance.payables || 0
    //     return sum
    //   }, 0)
    // },
    // getProjectCount(stepFinance) {
    //   return [ ...new Set(stepFinance.map(({ projectNativeId }) => projectNativeId)) ].length
    // },
    openDetails(id) {
      this.$emit('openDetails', id)
    },
    formattedDate(date) {
      return moment(date).format('MMM D')
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
    async getReports() {
      this.reports = (await this.$http.post('/invoicing-payables/paid-reports', {
        countToSkip: 0,
        countToGet: 100,
        filters: this.allFilters
      })).data.map(i => ({ ...i, isCheck: false }))
      this.vendorsList = (await this.$http.get('/pm-manage/vendors-for-options')).data
    },
    async bottomScrolled() {
      if (this.isDataRemain) {
        const result = await this.$http.post("/invoicing-payables/paid-reports", {
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
    }
  },
  computed: {
    ...mapGetters({
      // vendorsList: "getAllVendorsForOptions"
    }),
    allFilters() {
      const filters = {}
      for (let variable of this.dataVariables) filters[variable] = this[variable]
      return filters
    },
    selectedVendors() {
      return this.$route.query.vendors && this.vendorsList.length
          ? this.$route.query.vendors.split(',').map(_id => {
            const vendor = this.vendorsList.find(vendor => _id === vendor._id)
            return vendor ? `${ vendor.firstName } ${ vendor.surname }` : ''
          })
          : []
    },
    selectedPaymentMethod() {
      return this.$route.query.paymentMethod || ''
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

</style>