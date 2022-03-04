<template lang="pug">
  .reports
    .reports__wrapper
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
      .filter
        .filter__item
          label Report Id:
          .filter__input
            input(type="text" placeholder="Value" :value="reportIdValue" @change="reportIdSetFilter" @keyup.13="reportIdSetFilter")
            .clear-icon(v-if="reportIdValue.length" @click="requestToDeleteReceivables('reportId')")
              i.fas.fa-backspace
        .filter__item
          label Clients:
          .filter__input
            SelectMulti(
              :selectedOptions="selectedClients"
              :options="allClients"
              :hasSearch="true"
              placeholder="Options"
              @chooseOptions="setClient"
              :isSelectedWithIcon="true"
              :isRemoveOption="true"
              @removeOption="removeClients"
            )
        .filter__item
          label Status:
          .filter__input
            SelectSingle(
              :selectedOption="selectedStatus"
              :options="['Created', 'Sent']"
              placeholder="Option"
              @chooseOption="setStatus"
              :isRemoveOption="true"
              @removeOption="removeStatus"
            )
        .filter__itemLong
          label Date Range:
          .filter__input
            DatePicker.range-with-one-panel(
              :value="selectedBillingDateRange"
              @input="(e) => setBillingDateRange(e)"
              format="DD-MM-YYYY, HH:mm"
              prefix-class="xmx"
              range-separator=" - "
              :clearable="false"
              type="datetime"
              range
              placeholder="Select datetime range"
            )
          .clear-icon-picker(v-if="!!selectedBillingDateRange[0]" @click="removeSelectedBillingDateRange()")
            i.fas.fa-backspace.backspace-long

        .options
          .options__item(v-if="ifSomeCheck")
            label Reports Actions:
            .options__input
              SelectSingle(
                :options="availableActionOptions",
                placeholder="Action",
                :selectedOption="selectedReportAction",
                @chooseOption="openApproveActionModal"
              )
            .options__description Reports Selected: {{ reports.filter(item => item.isCheck).length }}

          .options__button(v-else)
            Button(value="Zoho sync." :outline="true" @clicked="updateReportsStateFromZoho()" style="margin-right: 10px;")
            router-link(class="link-to" :to="{path: `/pangea-finance/invoicing-receivables/create-reports`}")
              Button(value="Add Reports")

      .reports__container
        .modal
          .modal__block
            ApproveModal(
              v-if="deleteReceivablesId !== ''"
              text="Are you sure?"
              approveValue="Yes"
              notApproveValue="Cancel"
              @approve="deleteReceivables"
              @close="closeDeleteReceivablesModal"
              @notApprove="closeDeleteReceivablesModal"
            )
        LayoutsTable(
          :fields="fields"
          :tableData="reports"
          :customNumberOfFilterRows="2"
          @bottomScrolled="bottomScrolled"
        )
          template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
            .table__header(v-if="field.headerKey === 'headerCheck'")
              CheckBox(:isChecked="!!isAllSelected" :isWhite="true" @check="toggleAll(true)" @uncheck="toggleAll(false)")
            .table__header(v-else) {{ field.label }}

          template(slot="check" slot-scope="{ row, index }")
            .table__data
              CheckBox(:isChecked="row.isCheck" @check="toggleCheck(index, true)" @uncheck="toggleCheck(index, false)")

          template(slot="reportId" slot-scope="{ row, index }" )
            .table__data
              router-link(class="link-to" :to="{path: `/pangea-finance/invoicing-receivables/reports/${row._id}`}")
                span {{ row.reportId }}

          template(slot="dateRange" slot-scope="{ row, index }")
            .table__data(v-html="dateRange(row)")

          template(slot="client" slot-scope="{ row, index }")
            .table__data
              router-link(class="link-to" :to="{path: '/pangea-clients/all/details/' + row.client._id }" target= '_blank')
                span {{ row.client.name }}

          template(slot="bn" slot-scope="{ row, index }")
            .table__data {{ getCompanyNameAndPaymentType(row).getName() }}

          template(slot="pt" slot-scope="{ row, index }")
            .table__data {{ getCompanyNameAndPaymentType(row).getPaymentType() }}

          template(slot="status" slot-scope="{ row, index }")
            .table__data {{ row.status }}

          template(slot="projects" slot-scope="{ row, index }")
            .table__data {{ getReportProjectsCount(row) }}

          template(slot="jobs" slot-scope="{ row, index }")
            .table__data {{ row.stepsWithProject.length }}

          template(slot="amount" slot-scope="{ row, index }")
            .table__data
              span.currency(v-html="returnIconCurrencyByStringCode(row.projectCurrency)")
              span {{ row.total | roundTwoDigit }}

          template(slot="created" slot-scope="{ row, index }")
            .table__data {{ getTime( row.createdAt) }}

          template(slot="updated" slot-scope="{ row, index }")
            .table__data {{ getTime( row.updatedAt) }}

          template(slot="icon" slot-scope="{ row, index }")
            .table__icon
              i(class="fas fa-trash" @click="requestToDeleteReceivables(row._id)")

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
import currencyIconDetected from "../../mixins/currencyIconDetected"

export default {
  name: "InvoicingReportsList",
  mixins: [ currencyIconDetected ],
  data() {
    return {
      selectedReportAction: '',
      isActionModal: false,
      reports: [],
      highlighted: {
        days: [ 6, 0 ]
      },
      fields: [
        {
          label: "",
          headerKey: "headerCheck",
          key: "check",
          style: { width: "36px" }
        },
        {
          label: "Report ID",
          headerKey: "headerReportId",
          key: "reportId",
          style: { width: "120px" }
        },
        {
          label: "Client",
          headerKey: "headerClient",
          key: "client",
          style: { width: "150px" }
        },
        {
          label: "Billing name",
          headerKey: "headerBN",
          key: "bn",
          style: { width: "158px" }
        },
        {
          label: "Payment type",
          headerKey: "headerPT",
          key: "pt",
          style: { width: "120px" }
        },
        {
          label: "Date Range",
          headerKey: "headerDateRange",
          key: "dateRange",
          style: { width: "180px" }
        },
        {
          label: "Status",
          headerKey: "headerStatus",
          key: "status",
          style: { width: "120px" }
        },
        {
          label: "Projects",
          headerKey: "headerProjects",
          key: "projects",
          style: { width: "85px" }
        },
        {
          label: "Jobs",
          headerKey: "headerJobs",
          key: "jobs",
          style: { width: "85px" }
        },
        {
          label: "Amount",
          headerKey: "headerAmount",
          key: "amount",
          style: { width: "110px" }
        },
        {
          label: "Created On",
          headerKey: "headerCreated",
          key: "created",
          style: { width: "130px" }
        },
        {
          label: "Updated On",
          headerKey: "headerUpdated",
          key: "updated",
          style: { width: "130px" }
        },
        {
          label: "",
          headerKey: "headerIcon",
          key: "icon",
          style: { width: "47px" }
        }
      ],
      isDataRemain: true,

      reportId: '',
      clients: '',
      billingDateFrom: '',
      billingDateTo: '',
      status: '',
      clientsList: [],

      dataVariables: [
        'reportId',
        'clients',
        'billingDateFrom',
        'billingDateTo',
        'status'
      ],

      deleteReceivablesId: ''
    }
  },
  methods: {
    ...mapActions([ 'alertToggle' ]),
    getReportProjectsCount({ stepsAndProjects }) {
      const { length } = [ ...new Set(stepsAndProjects.map(i => i.project)) ]
      return length
    },
    getCompanyNameAndPaymentType({ client, clientBillingInfo }) {
      if (!clientBillingInfo) return buildReturn('-', '-')
      if (!client.billingInfo) return buildReturn('-', '-')

      const { name, paymentType } = client.billingInfo.find(({ _id }) => _id.toString() === clientBillingInfo)
      return buildReturn(name, paymentType)

      function buildReturn(name, paymentType) {
        return {
          getName: () => name,
          getPaymentType: () => paymentType
        }
      }
    },
    async manageReportActions() {
      if (this.selectedReportAction === "Delete") {
        await this.deleteChecked()
      }
      // }else {
      //   await this.changeTaskStatus()
      // }
    },
    async deleteChecked() {
      await this.$http.post('/invoicing-receivables/delete-reports', {
        receivableIds: this.reports.filter(i => i.isCheck).map(i => i._id.toString())
      })
      this.closeApproveActionModal()
      await this.getReports()
    },
    async updateReportsStateFromZoho() {
      try {
        await this.$http.get('/invoicing-receivables/update-reports-state-from-zoho')
        const { type, message } = result.data
        this.alertToggle({ message, isShow: true, type })
      } catch (e) {
        console.log(e)
      }
    },
    // async changeTaskStatus() {
    //   const nextStatus = this.selectedReportAction === 'Send Report' ? 'Sent' : this.selectedReportAction
    //   try {
    //     await this.$http.post('/invoicing-receivables/manage-report-status', {
    //       reportsIds: this.reports.filter(i => i.isCheck).map(i => i._id.toString()),
    //       nextStatus
    //     })
    //     this.closeApproveActionModal()
    //     this.getReports()
    //   } catch (error) {
    //     this.alertToggle({ message: "Error on Reports Actions", isShow: true, type: "error" })
    //   }
    // },
    openApproveActionModal({ option }) {
      this.selectedReportAction = option
      this.isActionModal = true
    },
    closeApproveActionModal() {
      this.selectedReportAction = ''
      this.isActionModal = false
    },
    setStatus({ option }) {
      this.replaceRoute('status', option)
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
    removeSelectedBillingDateRange() {
      let query = this.$route.query
      this.$router.replace({
        path: this.$route.path,
        query: { ...query, billingDateFrom: '', billingDateTo: '' }
      })
    },
    setBillingDateRange(e) {
      let query = this.$route.query
      delete query.billingDateFrom
      delete query.billingDateTo
      this.$router.replace({
        path: this.$route.path,
        query: {
          ...query, billingDateFrom: new Date(e[0]).getTime(),
          billingDateTo: new Date(e[1]).getTime()
        }
      })
    },
    getTotalAmount({ stepsWithProject }) {
      return stepsWithProject.reduce((sum, i) => {
        sum += i.finance.Price.receivables || 0
        return sum
      }, 0)
    },
    formattedDate(date) {
      return moment(date).format('MMM D')
    },
    toggleCheck(index, val) {
      if (this.isActionModal) return
      this.reports[index].isCheck = val
    },
    toggleAll(val) {
      if (this.isActionModal) return
      this.reports = this.reports.reduce((acc, cur) => {
        acc.push({ ...cur, isCheck: val })
        return acc
      }, [])
    },
    replaceRoute(key, value) {
      let query = this.$route.query
      delete query[key]
      this.$router.replace({ path: this.$route.path, query: { ...query, [key]: value } })
    },
    querySetter(vm, to) {
      for (let variable of this.dataVariables) if (to.query[variable] != null) vm[variable] = to.query[variable]
    },
    defaultSetter() {
      for (let variable of this.dataVariables) this[variable] = ''
    },
    requestToDeleteReceivables(id) {
      this.deleteReceivablesId = id
    },
    async deleteReceivables() {
      await this.$http.get(`/invoicing-receivables/report/${ this.deleteReceivablesId }/delete`)
      await this.getReports()
      this.closeDeleteReceivablesModal()
    },
    closeDeleteReceivablesModal() {
      this.deleteReceivablesId = ''
    },
    setClient({ option }) {
      if (!this.$route.query.clients) {
        this.replaceRoute('clients', this.getClientsIdByName(option))
        return
      }
      let _ids = this.$route.query.clients.split(',')
      if (_ids.includes(this.getClientsIdByName(option))) _ids = _ids.filter(_id => _id !== this.getClientsIdByName(option))
      else _ids.push(this.getClientsIdByName(option))
      this.replaceRoute('clients', _ids.join(','))
    },
    getClientsIdByName(option) {
      const { _id } = this.clientsList.find(({ name }) => `${ name }` === option)
      return _id
    },
    removeClients() {
      this.replaceRoute('clients', '')
    },
    async getReports() {
      this.reports = (await this.$http.post('/invoicing-receivables/reports', {
        countToSkip: 0,
        countToGet: 100,
        filters: this.allFilters
      })).data.map(i => ({ ...i, isCheck: false }))
      this.clientsList = (await this.$http.get('/pm-manage/clients-for-options')).data

    },
    async bottomScrolled() {
      if (this.isDataRemain) {
        const result = await this.$http.post("/invoicing-receivables/reports", {
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
      // clientsList: "getAllClientsForOptions"
    }),
    selectedClients() {
      return this.$route.query.clients && this.clientsList.length
          ? this.$route.query.clients.split(',').map(_id => {
            const client = this.clientsList.find(item => _id === item._id)
            return client ? `${ client.name }` : ''
          })
          : []
    },
    allClients() {
      return this.clientsList.map(({ name }) => `${ name }`)
    },
    availableActionOptions() {
      if (this.reports && this.reports.length) {
        if (this.reports.filter(i => i.isCheck).every(i => i.status === 'Created')) {
          return [ "Delete" ]
        }
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
      return this.$route.query.status || ''
    },
    selectedBillingDateRange() {
      return this.$route.query.billingDateFrom
          ? [ new Date(+this.$route.query.billingDateFrom), new Date(+this.$route.query.billingDateTo) ]
          : [ null, null ]
    },
    reportIdValue() {
      return this.$route.query.reportId || ''
    },
    isAllSelected() {
      return (this.reports && this.reports.length) && this.reports.every(i => i.isCheck)
    }
  },
  watch: {
    $route(to, from) {
      if (to.path === from.path) {
        this.querySetter(this, to)
        this.getReports()
      }
    }
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.defaultSetter()
      vm.querySetter(vm, to)
      vm.getReports()
    })
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
  background: #fff;

  &__wrapper {
    position: relative;
    border-radius: 2px;
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
  top: 25px;
  right: 25px;
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
  border-radius: 2px;
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

.backspace-long {
  position: absolute;
  right: 54px !important;
  top: 27px !important;
}
</style>