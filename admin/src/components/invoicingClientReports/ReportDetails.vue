<template lang="pug">
  .layout
    NavbarList(
      v-if="shortProjectList.length"
      :items="shortProjectList"
      :basicLink="'/pangea-finance/receivables-reports/reports/'"
    )
    .invoicing-details(v-if="Object.keys(reportDetailsInfo).length")
      .modals
        .modal.wrapper(v-if="isModalOpen")
          .modal__title Choose Invoice
          .select-options
            SelectSingle(
              :hasSearch="true"
              placeholder="Option",
              :options="invoicesList",
              :selectedOption="selectedInvoice.name",
              @chooseOption="selectInvoice"
            )
          .buttons__modal
            Button(value="Add" @clicked="addToInvoice")
            Button(value="Close" :outline="true" @clicked="closeRequestAddToInvoice")
        .modal(v-if="isDeleteModalOpen")
          ApproveModal(
            text="Are you sure?"
            approveValue="Yes"
            notApproveValue="Cancel"
            @approve="deleteReportFromInvoice"
            @notApprove="closeDeleteModal"
            @close="closeDeleteModal"
          )
      .invoicing-details__buttons
        .buttons__group(v-if="reportDetailsInfo.invoice === null")
          IconButton(
            :isDisabled="!!requestCounter"
            :popupText="'Create invoice and attach report'"
            @clicked="createNewInvoice"
          )
            i(class="fa-solid fa-file-circle-plus")
          IconButton(
            :popupText="'Attach report to invoice'"
            :isDisabled="!!requestCounter"
            @clicked="openRequestAddToInvoice"
          )
            i(class="fa-solid fa-file-import")
        .buttons__group(v-else)
          IconButton(
            v-if="reportDetailsInfo.invoice.status === 'Draft'"
            :isDisabled="!!requestCounter"
            :popupText="'Delete report from invoice'"
            @clicked="openDeleteModal"
          )
            i(class="fa-solid fa-file-circle-minus")

      .invoicing-details__wrapper
        .invoicing-details__info
          .info__user
            .user
              .user__description
                .user__name
                  router-link(class="link-to" target= '_blank' :to="{path: `/pangea-clients/all/details/${reportDetailsInfo.client._id}`}")
                    span {{ paymentProfile(reportDetailsInfo).getOfficialName() }}
                .user__text {{ paymentProfile(reportDetailsInfo).getAddress() }}
                //.user__text(v-if="paymentProfile(reportDetailsInfo).getState()" ) {{ paymentProfile(reportDetailsInfo).getState() }}
                .user__text {{ paymentProfile(reportDetailsInfo).getCityWithCode() }}
                //.user__text {{ paymentProfile(reportDetailsInfo).getVat() }}

          .info__descriptions
            .text__block
              .text__title Report ID:
              .text__value {{reportDetailsInfo.reportId}}

            .text__block(v-if="reportDetailsInfo.invoice")
              .text__title Invoice ID:
              .text__value
                router-link(class="link-to" target= '_blank' :to="{path: `/pangea-finance/receivables-reports/invoice/${reportDetailsInfo.invoice._id}`}")
                  span {{ reportDetailsInfo.invoice.invoiceId }}

            .text__block(v-if="reportDetailsInfo.invoice")
              .text__title Invoice Status:
              .text__value {{reportDetailsInfo.invoice.status}}

            .text__block
              .text__title Customer:
              .text__value {{reportDetailsInfo.client.name}}

            .text__block
              .text__title Payment Profile Name:
              .text__value {{ paymentProfile(reportDetailsInfo).getName() }}

            .text__block
              .text__title Payment Type:
              .text__value {{ paymentProfile(reportDetailsInfo).getPaymentType() }}

            .text__block
              .text__title Created On:
              .text__value {{ formattedDate(reportDetailsInfo.createdAt) }}

            .text__block
              .text__title Date Range:
              .text__value
                span {{ formattedDateRange(reportDetailsInfo.firstPaymentDate) }}
                span /
                span {{ formattedDateRange(reportDetailsInfo.lastPaymentDate) }}

            .text__block
              .text__title Payment Terms:
              .text__value {{ paymentProfile(reportDetailsInfo).getPaymentTerms() }}

            .text__block
              .text__title Projects / Jobs:
              .text__value
                span {{ getReportProjectsCount(reportDetailsInfo) }}
                span /
                span {{ reportDetailsInfo.stepsWithProject.length }}

            .text__block(v-if="reportDetailsInfo.stepsWithProject.length" )
              .text__title Total Amount:
              .text__value
                span(style="margin-right: 4px;") {{ +(reportDetailsInfo.total).toFixed(2) }}
                span.currency(v-html="returnIconCurrencyByStringCode(reportDetailsInfo.stepsWithProject.at(0).projectCurrency)")


        .invoicing-details__listOfJobs
          ReportDetailsJobsList(
            :isAvailableDeleting="!reportDetailsInfo.invoice"
            :enumOfReports="'client'"
            :steps="reportDetailsInfo.stepsWithProject"
            @deleteStep="deleteStep"
          )
          Add(
            v-if="!toggleAddSteps && !reportDetailsInfo.invoice"
            @add="changeToggleAddSteps"
          )
      .available-jobs(v-if="toggleAddSteps")
        ReceivablesAddStepsTo(
          :paymentType="paymentProfile(reportDetailsInfo).getPaymentType()"
          :steps="steps"
          @refreshReports="refreshReports"
          @closeTable="changeToggleAddSteps"
          @toggleAll="toggleAllSteps"
        )
</template>

<script>
import GeneralTable from '../GeneralTable'
import moment from "moment"
import ReceivablesAddStepsTo from "./ReceivablesAddStepsTo"
import ApproveModal from '../ApproveModal'
import Button from "../Button"
import IconButton from "../IconButton"
import SelectSingle from "../SelectSingle"
import CheckBox from "../CheckBox"
import { mapActions, mapGetters } from "vuex"
import DatePicker from 'vue2-datepicker'
import '../../assets/scss/datepicker.scss'
import currencyIconDetected from "../../mixins/currencyIconDetected"
import ReportDetailsJobsList from "../invoicingPayables/ReportDetailsJobsList"
import Add from "../Add"
import NavbarList from "../NavbarLists"
import { getAmountByPercent } from "/invoicing/helpers"

export default {
  name: "ReportDetails",
  mixins: [ currencyIconDetected ],
  data() {
    return {
      reportDetailsInfo: {},
      toggleAddSteps: false,
      steps: [],
      shortProjectList: [],
      isModalOpen: false,
      invoicesList: [],
      selectedInvoice: '',
      isDeleteModalOpen: false
    }
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle"
    }),
    toggleAllSteps(bool) {
      this.steps = this.steps.map(i => ({ ...i, isCheck: bool }))
    },
    paymentProfile({ client, clientBillingInfo }) {
      const { billingInfo } = client
      const data = billingInfo.find(item => item._id.toString() === clientBillingInfo.toString())
      const { officialName, name, address, paymentType, paymentTerms: { name: paymentTerms } } = data
      const { city, country, state, street1, street2, vat, zipCode } = address
      return {
        getOfficialName: () => officialName || '',
        getAddress: () => `${ street1 || '' }${ street2 && '. ' }${ street2 || '' }`,
        getState: () => state || '',
        getCity: () => city || '',
        getZipCode: () => zipCode || '',
        getCountry: () => country || '',
        getCityWithCode() {
          return `${ this.getCountry() }${ this.getCity() && ', ' }${ this.getCity() }${ this.getZipCode() && ', ' }${ this.getZipCode() }`
        },
        getVat: () => vat || '',
        getName: () => name,
        getPaymentTerms: () => paymentTerms,
        getPaymentType: () => paymentType
      }
    },
    getReportProjectsCount({ stepsAndProjects }) {
      const { length } = [ ...new Set(stepsAndProjects.map(i => i.project)) ]
      return length
    },
    formattedDate(date) {
      return moment(date).format('MMM D, HH:mm')
    },
    formattedDateRange(date) {
      return moment(date).format('MMM D')
    },
    async refreshReports() {
      await this.getReportDetails()
      await this.callDesiredStepsMethod()
    },
    changeToggleAddSteps() {
      this.toggleAddSteps = !this.toggleAddSteps
      if (this.toggleAddSteps) this.callDesiredStepsMethod()
    },
    async deleteStep(data) {
      const { reportId, stepsId } = data
      await this.$http.post(`/invoicing-receivables/report/${ reportId }/delete`, {
        stepsId
      })
      await this.refreshReports()
    },
    callDesiredStepsMethod() {
      const PT = this.paymentProfile(this.reportDetailsInfo).getPaymentType()
      PT === 'PPP' || PT === 'Pre-Payment' ? this.getStepsMonoProject() : this.getStepsMultiProject()
    },
    async getStepsMonoProject() {
      const { stepsAndProjects, clientBillingInfo } = this.reportDetailsInfo
      try {
        if (!stepsAndProjects.length) return this.getStepsMultiProject()
        this.steps = (await this.$http.post('/invoicing-receivables/not-selected-steps-list-mono-project/', {
          projectId: stepsAndProjects[0].project,
          clientBillingInfo
        })).data.map(i => ({ ...i, isCheck: false }))
      } catch (err) {
        this.alertToggle({ message: "Error on getting details", isShow: true, type: "error" })
      }
    },
    async getStepsMultiProject() {
      const { clientBillingInfo } = this.reportDetailsInfo
      try {
        this.steps = (await this.$http.post('/invoicing-receivables/not-selected-steps-list-multi-project/', {
          clientBillingInfo
        })).data.map(i => ({ ...i, isCheck: false }))
      } catch (err) {
        this.alertToggle({ message: "Error on getting details", isShow: true, type: "error" })
      }
    },
    async getReportDetails() {
      try {
        this.reportDetailsInfo = (await this.$http.post('/invoicing-receivables/report-details/' + this.$route.params.id)).data
        console.log('REPORT', this.reportDetailsInfo)
      } catch (err) {
        this.alertToggle({ message: "Error on getting details", isShow: true, type: "error" })
      }
    },
    async createNewInvoice() {
      await this.$http.post(
          `/invoicing/create-invoice-from-report/`,
          {
            _reportId: this.reportDetailsInfo._id,
            _customerId: this.reportDetailsInfo.client._id,
            _clientBillingInfoId: this.reportDetailsInfo.clientBillingInfo,
            item: {
              title: 'Language Service: report ' + this.reportDetailsInfo.reportId,
              quantity: 1,
              rate: this.reportDetailsInfo.total
            }
          }
      )
      await this.getReportDetails()
    },
    async openRequestAddToInvoice() {
      this.isModalOpen = !this.isModalOpen
      const invoicesList = (await this.$http.post('/invoicing/invoices-list-for-options', {
        query: {
          customer: this.reportDetailsInfo.client._id,
          status: 'Draft'
        }
      })).data
      this.invoicesList = invoicesList.map(data => ({ name: data.invoiceId, id: data._id }))
    },
    closeRequestAddToInvoice() {
      this.isModalOpen = !this.isModalOpen
      this.invoicesList = []
      this.selectedInvoice = {}
    },
    selectInvoice({ option }) {
      this.selectedInvoice = option
    },
    async addToInvoice() {
      let amount = 0, vatPercents = 0, vatAmount = 0, invoiceId = this.selectedInvoice.id
      const { client: { billingInfo }, clientBillingInfo } = this.reportDetailsInfo
      const currBI = billingInfo.find(item => item._id.toString() === clientBillingInfo.toString())
      const rate = this.reportDetailsInfo.total

      if (currBI.address && currBI.address.country === 'Cyprus') {
        vatPercents = 19
        vatAmount = getAmountByPercent(rate, 19)
      }
      !!vatAmount ? amount = +(rate + vatAmount).toFixed(2) : amount = rate

      try {
        this.closeRequestAddToInvoice()
        await this.$http.post(`/invoicing/invoice/${ invoiceId }/create-item/`, {
          reportId: this.reportDetailsInfo._id,
          title: 'Language Service: report ' + this.reportDetailsInfo.reportId,
          quantity: 1,
          rate,
          amount,
          type: "Report"
        })
        await this.getReportDetails()
      } catch (err) {
      }
    },
    openDeleteModal() {
      this.isDeleteModalOpen = !this.isDeleteModalOpen
    },
    closeDeleteModal() {
      this.isDeleteModalOpen = false
    },
    async deleteReportFromInvoice() {
      this.closeDeleteModal()
      await this.$http.delete(`/invoicing/invoice-from-report/${ this.$route.params.id }/invoice/${ this.reportDetailsInfo.invoice._id }`)
      await this.getReportDetails()
    },
    async getShortReports() {
      try {
        const shortProjectList = await this.$http.get(`/invoicing-receivables/short-report-list`)
        this.shortProjectList = shortProjectList.data.map(i => {
          return {
            _id: i._id,
            item1: i.reportId,
            item2: i.client.name,
            item3: i.invoice?.status || 'No invoice',
            item4: i.total + ' ' + getCurrencySymbol(i.client.currency)
          }
        })
      } catch (err) {
      }

      function getCurrencySymbol(str) {
        let symbol = ''
        if (str === 'USD') symbol = '$'
        else if (str === 'EUR') symbol = '€'
        else if (str === 'GBP') symbol = '£'
        return symbol
      }
    }
  },
  computed: {
    ...mapGetters({
      requestCounter: 'getRequestCounter'
    })
  },
  async created() {
    await this.getShortReports()
    await this.getReportDetails()
  },
  watch: {
    async $route(to, from) {
      if (to.name === from.name) {
        if (to.params.id !== from.params.id) {
          this.reportDetailsInfo = {}
          this.toggleAddSteps = false
          this.steps = []
          await this.getReportDetails()
        }
      }
    }
  },
  components: {
    NavbarList,
    Add,
    ReportDetailsJobsList,
    DatePicker,
    Button,
    GeneralTable,
    ReceivablesAddStepsTo,
    ApproveModal,
    SelectSingle,
    CheckBox,
    IconButton
  }
}
</script>

<style scoped lang="scss">
@import "../../assets/scss/colors";

.available-jobs {
  padding: 25px;
  background: white;
  border-radius: 2px;
  box-shadow: $box-shadow;
  height: fit-content;
  box-sizing: border-box;
  width: 1455px;
  margin-top: 25px;
}

.invoicing-details {
  position: relative;
  margin: 50px 0 50px 180px;


  &__wrapper {
    display: flex;
    gap: 25px;
  }

  &__info {
    padding: 25px;
    background: white;
    border-radius: 2px;
    box-shadow: $box-shadow;
    height: fit-content;
    box-sizing: border-box;
    width: 410px;
  }

  &__listOfJobs {
    padding: 25px;
    background: white;
    border-radius: 2px;
    box-shadow: $box-shadow;
    height: fit-content;
    box-sizing: border-box;
    width: 1020px;
  }
}

.info {
  &__user {
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid $light-border;
  }
}

.buttons__group {
  position: absolute;
  top: -40px;
  gap: 12px;
  display: flex;
}

.text {
  &__block {
    min-height: 32px;
    display: flex;
    margin-bottom: 5px;
    align-items: center;

    &:last-child {
      margin-bottom: 0px;
    }
  }

  &__select {
    width: 220px;
    height: 32px;
    background: white;
    border-radius: 2px;
    position: relative;
  }

  &__title {
    width: 120px;
    position: relative;
    margin-right: 10px;
  }

  &__value {
    width: 230px;
    position: relative;
    display: flex;
    gap: 10px;
    align-items: center;

    a {
      color: inherit;
      text-decoration: none;
      transition: .2s ease-out;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}


.user {
  display: flex;
  gap: 20px;

  &__text {
    margin: 5px 0;
  }

  &__name {
    font-family: Myriad600;
    margin-bottom: 10px;
    font-size: 16px;

    a {
      color: inherit;
      text-decoration: none;
      transition: .2s ease-out;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.wrapper {
  box-shadow: $box-shadow;
  box-sizing: border-box;
  padding: 25px;
  background-color: $white;
}

.modal {
  position: absolute;
  left: 40%;
  top: 0;
  z-index: 20;
  transform: translate(-50%, 0%);

  &__title {
    margin-bottom: 10px;
  }
}

.modals {
  position: relative;
}

.buttons__modal {
  display: flex;
  gap: 20px;
}

.select-options {
  position: relative;
  height: 32px;
  width: 220px;
  margin-bottom: 20px;
}

//
//.payment-button {
//  display: flex;
//  justify-content: center;
//}
//
//.payment-buttons {
//  margin-top: 25px;
//  display: flex;
//  justify-content: center;
//  gap: 20px;
//}
//
//.payment-details {
//  width: 380px;
//  background: white;
//  box-sizing: border-box;
//  padding: 25px;
//  border-radius: 2px;
//  border: 1px solid $light-border;
//  margin-top: 15px;
//
//  &__row {
//    display: flex;
//    margin-bottom: 12px;
//
//    &:last-child {
//      margin-bottom: 0px;
//    }
//  }
//
//  &__key {
//    width: 110px;
//    color: $dark-border;
//  }
//
//  &__value {
//    width: 210px;
//    display: flex;
//    gap: 12px;
//  }
//}
//
//.details-icon {
//  transition: .2s ease-out;
//  color: $dark-border;
//  font-size: 15px;
//
//  &:hover {
//    cursor: pointer;
//    color: $text;
//  }
//}
//
//.toggle-details {
//  font-size: 15px;
//  border-radius: 2px;
//  height: 30px;
//  width: 30px;
//  display: flex;
//  align-items: center;
//  cursor: pointer;
//  transition: .2s ease-out;
//  justify-content: center;
//  border: 1px solid $border;
//  color: $dark-border;
//  box-sizing: border-box;
//
//  &:hover {
//    color: $text;
//  }
//}
//
//.file-fake-button {
//  height: 30px;
//  width: 30px;
//  border-radius: 2px;
//  display: flex;
//  align-items: center;
//  justify-content: center;
//  font-size: 14px;
//  border: 1px solid $border;
//  box-sizing: border-box;
//  background-color: white;
//  color: $dark-border;
//  transition: .2s ease-out;
//
//  &:hover {
//    color: $text;
//  }
//}
</style>