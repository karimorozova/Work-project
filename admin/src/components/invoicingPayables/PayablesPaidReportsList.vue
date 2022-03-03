<template lang="pug">
  .reports
    .reports__wrapper
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
        .filter__itemLong
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

      .reports__container
        .modal
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
        LayoutsTable(
          :fields="fields"
          :tableData="reports"
          :customNumberOfFilterRows="2"
          @bottomScrolled="bottomScrolled"
        )
          template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
            .table__header {{ field.label }}

          template(slot="reportId" slot-scope="{ row, index }" )
            .table__data
              router-link(class="link-to" :to="{path: `/pangea-finance/payables-reports/paid-reports/${row._id}`}")
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

          //template(slot="project" slot-scope="{ row, index }")
          //  .table__data {{getProjectCount(row.stepFinance) }}

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

        .table__empty(v-if="!reports.length") Nothing found...

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

export default {
  name: "InvoicingPayablesList",
  data() {
    return {
      selectedReportAction: '',
      isActionModal: false,
      vendorsList: [],
      reports: [],
      highlighted: {
        days: [ 6, 0 ]
      },
      fields: [
        {
          label: "Report ID",
          headerKey: "headerReportId",
          key: "reportId",
          style: { width: "150px" }
        },
        {
          label: "Vendor Name",
          headerKey: "headerVendorName",
          key: "vendorName",
          style: { width: "200px" }
        },
        {
          label: "Type / Name",
          headerKey: "headerType",
          key: "type",
          style: { width: "150px" }
        },
        {
          label: "Date Range",
          headerKey: "headerDateRange",
          key: "dateRange",
          style: { width: "185px" }
        },
        {
          label: "Status",
          headerKey: "headerStatus",
          key: "status",
          style: { width: "140px" }
        },
        // {
        //   label: "Projects",
        //   headerKey: "headerProject",
        //   key: "project",
        //   style: { width: "100px" }
        // },
        {
          label: "Jobs",
          headerKey: "headerJobs",
          key: "jobs",
          style: { width: "100px" }
        },
        {
          label: "Amount",
          headerKey: "headerAmount",
          key: "amount",
          style: { width: "120px" }
        },
        {
          label: "Created On",
          headerKey: "headerCreated",
          key: "created",
          style: { width: "160px" }
        },
        {
          label: "Updated On",
          headerKey: "headerUpdated",
          key: "updated",
          style: { width: "160px" }
        }
      ],
      isDataRemain: true,

      reportId: '',
      vendors: '',
      deadlineDateFrom: '',
      deadlineDateTo: '',
      status: '',

      dataVariables: [
        'reportId',
        'vendors',
        'deadlineDateFrom',
        'deadlineDateTo',
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
    allVendors() {
      return this.vendorsList.map(({ firstName, surname }) => `${ firstName } ${ surname }`)
    },
    selectedDeadlineDateRange() {
      return this.$route.query.deadlineDateFrom
          ? [ new Date(+this.$route.query.deadlineDateFrom), new Date(+this.$route.query.deadlineDateTo) ]
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
    })
  },
  watch: {
    $route(to, from) {
      if (to.path === from.path) {
        this.querySetter(this, to)
        this.getReports()
      }
    }
  },
  components: {
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

.fa-trash {
  cursor: pointer;
}

.reports {
  position: relative;
  width: 1530px;
  margin: 50px;
  background: white;

  &__wrapper {
    position: relative;
    border-radius: 4px;
    padding: 25px;
    box-sizing: border-box;
    box-shadow: $box-shadow;
  }

  &__container {
    margin-top: 15px;
  }
}

.filter {
  display: flex;
  flex-wrap: wrap;

  &__itemLong {
    position: relative;
    margin-bottom: 15px;
    margin-right: 25px;
    width: 342.5px;
  }

  &__item {
    position: relative;
    margin-bottom: 15px;
    margin-right: 25px;
    width: 220px;
  }

  &__input {
    position: relative;
    height: 32px;
  }
}

.options {
  display: flex;
  flex-wrap: wrap;
  position: absolute;
  top: 20px;
  right: 20px;
  align-items: center;

  &__description {
    opacity: .5;
    margin-top: 5px;
  }

  &__button {
    height: 66px;
    display: flex;
    align-items: center;
  }

  &__item {
    position: relative;
    margin-bottom: 15px;
    margin-right: 25px;
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

  &__header {
    padding: 0 7px;
  }

  &__empty {
    margin-top: 10px;
  }
}

.fa-backspace {
  font-size: 16px;
  transition: .2s ease-out;
  color: $dark-border;
  cursor: pointer;
  position: absolute;
  right: 8px;
  top: 8px;

  &:hover {
    color: $text;
  }
}

.clickable-element {
  cursor: pointer;
}

a {
  color: inherit;
  text-decoration: none;
  transition: .2s ease-out;

  &:hover {
    text-decoration: underline;
  }
}

label {
  display: block;
  margin-bottom: 3px;
  font-family: 'Myriad600';
}

input {
  font-size: 14px;
  color: $text;
  border: 1px solid $border;
  border-radius: 4px;
  box-sizing: border-box;
  padding: 0 7px;
  outline: none;
  height: 32px;
  transition: .1s ease-out;
  width: 220px;
  font-family: 'Myriad400';

  &:focus {
    border: 1px solid $border-focus;
  }
}

.currency {
  margin-right: 4px;
  color: $dark-border;
}

.backspace-long {
  position: absolute;
  right: 54px !important;
  top: 27px !important;
}

.name {
  opacity: 0.4;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 131px;
}
</style>