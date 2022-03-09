<template lang="pug">
  .invoicing-details
    .invoicing-details__wrapper(v-if="Object.keys(reportDetailsInfo).length")
      .payment-card(v-if="isPaymentCard")
        .payment-card__close(@click="closePaymentCard") &#215;
        .payment-card__title Payment
        .payment-card__header
          //.payment-card__header-block
          //  .drop-title Payment Method:
          //  .drop
          //    SelectSingle(
          //      :selectedOption="paymentMethod.name || ''"
          //      :options="reportDetailsInfo.vendor.billingInfo.paymentMethod.length ? reportDetailsInfo.vendor.billingInfo.paymentMethod.map(i => i.name) : []"
          //      placeholder="Option"
          //      @chooseOption="setPaymentMethod"
          //    )
          .payment-card__header-block
            .drop-title Payment Date:
            .drop
              DatePicker(
                :value="paymentDate"
                @confirm="(e) => setFromDate(e)"
                format="MMM D, HH:mm"
                type="datetime"
                ref="deadline"
                :clearable="false"
                :confirm="true"
                confirm-text="Set date"
                prefix-class="xmx"
              )
          .payment-card__header-block(v-if="!isNotes" @click="isNotes = true")
            .payment-card__link Add Note
          .payment-card__header-block(v-else style="margin-top: 10px; width: 100%;")
            .drop-title Notes:
            textarea(type="text" rows="4" v-model="notes")
        .payment-card__body
          .payment-card__body-block
            .drop-title Amount:
            input(v-model="amount" ref="input" @click="selectInput" :class="'payment-card__input'" type="number" style="background-color: white;")
          .payment-card__body-block
            .drop-title Unpaid Amount:
            input(:value="getUnpaidAmount" :class="'payment-card__input'" :disabled="true")
          .payment-card__body-block
            .payment-card__link(@click="approvePaidFull") Pay Full Amount
        .payment-card__buttons
          Button(
            :isDisabled="!abilityToSubmitPayment"
            :value="`${abilityToSubmitPayment ? 'Submit ' + amount + ' €' : 'Cannot be confirmed' }`"
            @clicked="reportToPayment"
          )
          Button(:value="'Cancel'" :outline="true" @clicked="closePaymentCard")

      .invoicing-details__details
        .invoicing-details__body(v-if="Object.keys(reportDetailsInfo).length")
          .invoicing-details__details
            .invoicing-details__user
              .user
                .user__description
                  .user__name
                    router-link(class="link-to" target= '_blank' :to="{path: `/pangea-clients/all/details/${reportDetailsInfo.client._id}`}")
                      span {{ getBillingDetails(reportDetailsInfo).getOfficialName() }}
                  .user__address {{ getBillingDetails(reportDetailsInfo).getAddressFull() }}

            .invoicing-details__text
              .text__block
                .text__title Customer:
                .text__value {{reportDetailsInfo.client.name}}

              .text__block
                .text__title Billing Name:
                .text__value {{ getBillingDetails(reportDetailsInfo).getName() }}

              .text__block
                .text__title Status:
                .text__value {{reportDetailsInfo.status}}

              .text__block
                .text__title Report ID:
                .text__value {{reportDetailsInfo.reportId}}

              .text__block(v-if="reportDetailsInfo.externalIntegration.reportId")
                .text__title External Report ID:
                .text__value {{reportDetailsInfo.externalIntegration.reportId}}

              .text__block(v-if="reportDetailsInfo.externalIntegration.reportId")
                .text__title Zoho Link:
                .text__value
                  a(target="_blank" :href="`https://books.zoho.com/app#/invoices/${reportDetailsInfo.externalIntegration._id}?filter_by=Status.All&per_page=200&sort_column=invoice_number&sort_order=D`") Invoice

              .text__block
                .text__title Payment Type:
                .text__value {{ getBillingDetails(reportDetailsInfo).getPaymentType() }}

              .text__block
                .text__title Created On:
                .text__value {{ formattedDate(reportDetailsInfo.createdAt) }}

              .text__block
                .text__title Date Range:
                .text__value
                  span {{ formattedDateRange(reportDetailsInfo.firstPaymentDate) }}
                  span(style="color:#999; margin: 0 4px;") /
                  span {{ formattedDateRange(reportDetailsInfo.lastPaymentDate) }}

              .text__block
                .text__title Payment Terms:
                .text__value {{ getBillingDetails(reportDetailsInfo).getPaymentTerms() }}

              .text__block
                .text__title Projects:
                .text__value {{ getReportProjectsCount(reportDetailsInfo) }}

              .text__block
                .text__title Jobs:
                .text__value {{ reportDetailsInfo.stepsWithProject.length }}

              .text__block
                .text__title Total Amount:
                .text__value
                  span(style="margin-right: 4px;") {{ reportDetailsInfo.total | roundTwoDigit }}
                  span(v-html="'&euro;'")

              .text__block(v-if="this.reportDetailsInfo.status !== 'Created' && reportDetailsInfo.invoice.path")
                .text__title Invoice:
                .text__value
                  .file-fake-button(style="cursor: pointer" @click="downloadFile(reportDetailsInfo.invoice.path)")
                    i(class="fa-solid fa-download")
                  span.file-name {{ reportDetailsInfo.invoice.filename }}

              .text__block(v-if="this.reportDetailsInfo.status !== 'Created' && reportDetailsInfo.reportFiles.length > 0")
                .text__title Reports:
                .text__value
                  .download-file(v-for="reportFile in reportDetailsInfo.reportFiles" style="cursor: pointer"  @click="downloadFile(reportFile.path)") {{reportFile.filename}}
                  //.file-fake-button(style="cursor: pointer" @click="downloadFile(reportDetailsInfo.invoice.path)")
                  //  i(class="fas fa-download")


              //TODO PAYMENT CARD ====>
              //.payment-info(v-if="false")
              //  .payment-info__doublePay
              //    .payment-info__payBlock
              //      .amount__title Paid Amount:
              //      input(:value="amount" @change="updatePaidAmount" class="payment-info__input" :disabled="isFull")
              //    .check-box
              //      CheckBox(:isChecked="isFull" :isWhite="true" @check="togglePaidFull(true)" @uncheck="togglePaidFull(false)")
              //      span(class="check-box__text") Paid full
              //
              //  .payment-info__amountAndFile
              //    .payment-info__amount
              //      .amount__title Unpaid Amount:
              //      .amount__value(:class="{'green-value': +getUnpaidAmount === 0 }") {{ getUnpaidAmount }} €
              //
              //  .payment-info__double
              //    .payment-info__block
              //      .payment-info__title Payment Method:
              //      .payment-info__select
              //        SelectSingle(
              //          :selectedOption="paymentMethod"
              //          :options="['test1', 'test2', 'test3' ]"
              //          placeholder="Option"
              //          @chooseOption="setPaymentMethod"
              //        )
              //    .payment-info__block
              //      .payment-info__title Payment Date:
              //      DatepickerWithTime(
              //        :value="paymentDate"
              //        @selected="setFromDate"
              //        placeholder="Date"
              //        :isTime="true"
              //        :highlighted="highlighted"
              //        :monday-first="true"
              //        inputClass="datepicker-custom-filter-185"
              //        calendarClass="calendar-custom"
              //        :format="customFormatter"
              //        :disabled="disabled"
              //      )
              //
              //
              //  .payment-info__notes
              //    .payment-info__title Notes:
              //    textarea(type="text" rows="3" v-model="notes")
              //
              //  Button(style="display: flex; justify-content: center; margin-top: 20px;" v-if="amount" :value="'Submit ' + `${amount} €`" @clicked="reportToPayment")

            .payment-buttons
              Button(v-if="reportDetailsInfo.status === 'Invoice Ready'" value="Send" @clicked="sendInvoice")
              Button(v-if="reportDetailsInfo.status === 'Created'" value="Generate And Send" @clicked="generateAndSendInvoice")
              Button(v-if="reportDetailsInfo.status === 'Created'" value="Generate Invoice" @clicked="generateInvoice")
              Button(v-if="reportDetailsInfo.status === 'Sent'" value="Add Payment" @clicked="openPaymentCard")
              Button(v-if="reportDetailsInfo.status === 'Created'" value="Add jobs" @clicked="changeToggleAddSteps")


          .invoicing-details__table
            ApproveModal(
              v-if="isDeletingStep"
              class="absolute-middle"
              text="Are you sure?"
              approveValue="Yes"
              notApproveValue="Cancel"
              @approve="deleteStep"
              @close="closeModalStep"
              @notApprove="closeModalStep"
            )
            GeneralTable(
              :fields="fields",
              :tableData="reportDetailsInfo.stepsWithProject",
              :isFilterShow="false"
              :isFilterAbsolute="false"
            )

              template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
                .table__header {{ field.label }}

              template(slot="project" slot-scope="{ row, index }")
                .table__data
                  router-link(class="link-to" target= '_blank' :to="{path: `/pangea-projects/all-projects/All/details/${row.projectNativeId}`}")
                    .short {{ row.projectName }}

              template(slot="stepId" slot-scope="{ row, index }")
                .table__data {{ row.stepId || '-' }}

              template(slot="service" slot-scope="{ row, index }")
                .table__data {{ row.type === 'Classic' ? row.stepAndUnit.step.title : row.title }}

              template(slot="langPair" slot-scope="{ row, index }")
                span(v-if="row.type === 'Classic'" )
                  .table__data {{ row.sourceLanguage}}
                    span(style="font-size: 12px;color: #999999; margin: 0 4px;")
                      i(class="fas fa-angle-double-right")
                    | {{ row.targetLanguage }}
                span(v-else) -

              template(slot="billing" slot-scope="{ row, index }")
                .table__data {{ formattedDate(row.billingDate) }}

              template(slot="status" slot-scope="{ row, index }")
                .table__data {{ row.status || 'Completed' }}

              template(slot="receivables" slot-scope="{ row, index }")
                .table__data
                  span.currency(v-html="returnIconCurrencyByStringCode(row.projectCurrency)")
                  span {{ row.finance.Price.receivables | roundTwoDigit }}

              template(slot="icons", slot-scope="{ row, index }")
                .table__icons(v-if="(reportDetailsInfo.status === 'Created' || reportDetailsInfo.status === 'Sent')")
                  i(class="fas fa-trash" @click="requestToDelete(row._id)")

      .invoicing-details__add-steps
        ReceivablesAddStepsTo(
          v-if="toggleAddSteps"
          :steps="steps"
          @refreshReports="refreshReports"
          @closeTable="changeToggleAddSteps"
        )

    //.invoicing-details__cards(v-if="reportDetailsInfo && reportDetailsInfo.hasOwnProperty('paymentInformation') && reportDetailsInfo.paymentInformation.length")
    //  .invoicing-details__card(v-for="cardInfo in reportDetailsInfo.paymentInformation")
    //    ReceivablesPaymentInformationCard(
    //      :cardInfo="cardInfo"
    //      :paymentDetails="{paymentDetails: {expectedPaymentDate: 0}}"
    //    )

</template>

<script>
import GeneralTable from '../GeneralTable'
import moment from "moment"
import ReceivablesAddStepsTo from "../invoicingClientReports/ReceivablesAddStepsTo"
import ApproveModal from '../ApproveModal'
import Button from "../Button"
import SelectSingle from "../SelectSingle"
import CheckBox from "../CheckBox"
import ReceivablesPaymentInformationCard from "./ReceivablesPaymentInformationCard"
import { mapActions } from "vuex"
import _ from "lodash"
import DatePicker from 'vue2-datepicker'
import '../../assets/scss/datepicker.scss'
import currencyIconDetected from "../../mixins/currencyIconDetected"

export default {
  mixins: [ currencyIconDetected ],
  data() {
    return {
      isNotes: false,
      isPaymentCard: false,
      reportDetailsInfo: {},
      fields: [
        {
          label: "Project",
          headerKey: "headerStepId",
          key: "project",
          style: { width: "19%" }
        },
        {
          label: "Step ID",
          headerKey: "headerStepId",
          key: "stepId",
          style: { width: "20%" }
        },
        {
          label: "Step",
          headerKey: "headerService",
          key: "service",
          style: { width: "13%" }
        },
        {
          label: "Billing Date",
          headerKey: "headerBilling",
          key: "billing",
          style: { width: "11%" }
        },
        {
          label: "Language Pair",
          headerKey: "headerLangPair",
          key: "langPair",
          style: { width: "12%" }
        },
        {
          label: "Status",
          headerKey: "headerStatus",
          key: "status",
          style: { width: "11%" }
        },
        {
          label: "Fee",
          headerKey: "headerPayables",
          key: "receivables",
          style: { width: "10%" }
        },
        {
          label: "",
          headerKey: "headerIcons",
          key: "icons",
          style: { width: "5%" }
        }
      ],
      deleteInfo: {},
      toggleAddSteps: false,
      isDeletingStep: false,
      steps: [],

      // paymentMethod: '',
      paymentDate: new Date(),
      amount: 0,
      notes: ''
    }
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle"
    }),
    closePaymentCard() {
      this.isPaymentCard = false
      this.isNotes = false
      this.notes = ''
      // this.paymentMethod = this.reportDetailsInfo.paymentDetails.paymentMethod
      this.amount = 0
    },
    openPaymentCard() {
      this.isPaymentCard = true
      this.paymentDate = new Date()
    },
    downloadFile(path) {
      let link = document.createElement('a')
      link.href = this.$domains.admin + '/' + path
      link.target = "_blank"
      link.click()
    },
    getBillingDetails({ client, clientBillingInfo }) {
      const { billingInfo } = client
      const {
        name,
        officialName,
        paymentType,
        paymentTerms: { name: paymentTerms },
        address: { street1, street2, country, city }
      } = billingInfo.find(item => item._id.toString() === clientBillingInfo.toString())
      return {
        getOfficialName: () => officialName,
        getName: () => name,
        getPaymentTerms: () => paymentTerms,
        getPaymentType: () => paymentType,
        getAddressFull: () => `${ street1 || 'No street' }, ${ city || 'No city' }, ${ country || 'No country' }`
      }
    },
    getReportProjectsCount({ stepsAndProjects }) {
      const { length } = [ ...new Set(stepsAndProjects.map(i => i.project)) ]
      return length
    },
    // setPaymentMethod({ option }) {
    //   this.paymentMethod = option
    // },
    approvePaidFull() {
      this.amount = this.getUnpaidAmount
    },
    selectInput() {
      this.$refs.input.select()
    },
    setFromDate(e) {
      this.paymentDate = e
    },
    async reportToPayment() {
      const amount = +(parseFloat(this.amount)).toFixed(2)
      const data = {
        paidAmount: amount,
        unpaidAmount: +(this.getUnpaidAmount - amount).toFixed(2),
        paymentMethod: this.paymentMethod,
        paymentDate: this.paymentDate,
        // zohoBillingId: this.reportDetailsInfo.zohoBillingId,
        // vendorName: this.reportDetailsInfo.vendor.firstName + ' ' + this.reportDetailsInfo.vendor.surname,
        notes: this.notes
      }
      this.closePaymentCard()
      // const reuslt = (await (this.$http.post(`/invoicing-receivables/report-final-status/${ this.reportDetailsInfo._id }`, data))).data
      // if (reuslt === "Moved") {
      //   await this.$router.push('/pangea-finance/invoicing-payables/paid-invoices/' + this.reportDetailsInfo._id)
      // } else {
      //   await this.refreshReports()
      // }
      this.amount = 0
    },
    // updatePaidAmount(event) {
    //   const value = event.target.value
    //   if ((+value).toFixed(2) <= this.getUnpaidAmount && value >= 0) {
    //     this.amount = (parseFloat(value)).toFixed(2)
    //   }
    //   this.$forceUpdate()
    // },
    // togglePaidFull(val) {
    //   this.isFull = val
    //   if (val) {
    //     this.amount = this.getUnpaidAmount
    //   }
    // },
    async sendInvoice() {
      try {
        const result = await this.$http.post('/invoicing-receivables/sendInvoice', { _id: this.$route.params.id })
        await this.getReportDetails(this.$route.params.id)
        const { type, message } = result.data
        this.alertToggle({ message, isShow: true, type })
      } catch (e) {
        console.log(e, 'generateInvoice()')
      }
    },
    async generateAndSendInvoice() {
      try {
        const result = await this.$http.post('/invoicing-receivables/zoho/createAndSendInvoice', { _id: this.$route.params.id })
        await this.getReportDetails(this.$route.params.id)
        const { type, message } = result.data
        this.alertToggle({ message, isShow: true, type })
      } catch (e) {
        console.log(e, 'generateInvoice()')
      }
    },
    async generateInvoice() {
      try {
        const result = await this.$http.post('/invoicing-receivables/zoho/createInvoice', { _id: this.$route.params.id })
        await this.getReportDetails(this.$route.params.id)
        const { type, message } = result.data
        this.alertToggle({ message, isShow: true, type })
      } catch (e) {
        console.log(e, 'generateInvoice()')
      }
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
    requestToDelete(stepId) {
      this.deleteInfo = { reportId: this.reportDetailsInfo._id, stepId }
      this.isDeletingStep = true
    },
    async deleteStep() {
      const { reportId, stepId } = this.deleteInfo
      this.closeModalStep()
      await this.$http.post(`/invoicing-receivables/report/${ reportId }/delete/${ stepId }`)
      await this.refreshReports()
    },
    closeModalStep() {
      this.deleteInfo = {}
      this.isDeletingStep = false
    },
    callDesiredStepsMethod() {
      const PT = this.getBillingDetails(this.reportDetailsInfo).getPaymentType()
      PT === 'PPP' || PT === 'Pre-Payment'
          ? this.getStepsMonoProject()
          : this.getStepsMultiProject()
    },
    async getStepsMonoProject() {
      const { stepsAndProjects, clientBillingInfo } = this.reportDetailsInfo
      try {
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
    // async updateReportsStateFromZoho(id) {
    //   try {
    //     const result = await this.$http.get('/invoicing-receivables/update-report-state-from-zoho/' + id)
    //     const { type, message } = result.data
    //     this.alertToggle({ message, isShow: true, type })
    //     if (message === 'Invoice paid') {
    //       await this.$router.push('/')
    //     }
    //   } catch (err) {
    //     console.log(err)
    //     this.alertToggle({ message: "Error on getting details", isShow: true, type: "error" })
    //   }
    // },
    //
    // isProjectMinimumCharge(stepsWithProject) {
    //   const receivablesAmount = stepsWithProject.reduce((acc, { finance }) => acc += finance.Price.receivables, 0).toFixed(2)
    //   const minimumCharge = stepsWithProject[0].minimumCharge
    //   return !minimumCharge.isIgnore && +receivablesAmount < minimumCharge.value
    // },
    // getProjectTotalOrMinimumCharge(stepsWithProject) {
    //   const receivablesAmount = stepsWithProject.reduce((acc, { finance }) => acc += finance.Price.receivables, 0).toFixed(2)
    //   const minimumCharge = stepsWithProject[0].minimumCharge
    //   return +this.isProjectMinimumCharge(stepsWithProject) ? minimumCharge.value : +receivablesAmount
    // },
    // getProjectCurrencySymbol(projectCurrency) {
    //   const currencies = {
    //     'EUR': '€',
    //     'USD': '$'
    //   }
    //   return currencies[projectCurrency]
    // },
    // sumPaymentAdditions(paymentAdditions) {
    //   return paymentAdditions.reduce((acc, { finance }) => acc += finance.Price.receivables, 0)
    // },
    async getReportDetails() {
      try {
        this.reportDetailsInfo = (await this.$http.post('/invoicing-receivables/report/' + this.$route.params.id)).data
      } catch (err) {
        this.alertToggle({ message: "Error on getting details", isShow: true, type: "error" })
      }
    }
  },
  computed: {
    getPaymentRemainder() {
      const { paymentInformation = [] } = this.reportDetailsInfo
      return paymentInformation.reduce((sum, item) => {
        sum += +item.paidAmount
        return sum
      }, 0)
    },
    getUnpaidAmount() {
      const rawUnpaidAmount = +this.reportDetailsInfo.total - +this.getPaymentRemainder
      return +(parseFloat(rawUnpaidAmount)).toFixed(2)
    },
    abilityToSubmitPayment() {
      return this.amount !== 0
          && this.amount !== '0'
          && this.amount > 0
          && this.amount <= this.getUnpaidAmount
    }
    // groupByProject() {
    //   const groupedByProject = _.groupBy(this.reportDetailsInfo.stepsWithProject, (item) => {
    //     return item.projectId
    //   })
    //   return groupedByProject
    // }
  },
  async created() {
    // await this.updateReportsStateFromZoho(this.$route.params.id)
    await this.getReportDetails()
    // this.paymentMethod = this.reportDetailsInfo.paymentDetails.paymentMethod
  },
  components: {
    DatePicker,
    Button,
    GeneralTable,
    ReceivablesAddStepsTo,
    ApproveModal,
    SelectSingle,
    CheckBox,
    ReceivablesPaymentInformationCard
  }
}
</script>

<style scoped lang="scss">
@import "../../assets/scss/colors";
//
//textarea {
//  width: 100%;
//  border-radius: 2px;
//  border: 1px solid $border;
//  padding: 5px;
//  color: $text;
//  outline: none;
//  box-sizing: border-box;
//  transition: .1s ease-out;
//
//  &:focus {
//    border: 1px solid $border-focus;
//  }
//}
//
//.payment-additions {
//  width: 450px;
//  margin: 20px 0;
//  margin-left: auto;
//
//  &__sub-totoal {
//    text-align: right;
//    font-size: 16px;
//    margin-top: 5px;
//  }
//}
//
//.download-file {
//  color: $red;
//
//  &:hover {
//    text-decoration: underline;
//  }
//}
//
//.title-project {
//  font-size: 18px;
//  font-family: Myriad600;
//  display: flex;
//  justify-content: space-between;
//  margin-bottom: 5px;
//}
//
//
//.file-fake-button {
//  height: 30px;
//  width: 40px;
//  background-color: $red;
//  border-radius: 2px;
//  display: flex;
//  align-items: center;
//  justify-content: center;
//  font-size: 15px;
//  color: white;
//
//}
//
//.green-value {
//  border: 1px solid $border !important;
//  color: $text !important;
//}
//
//.amount {
//  &__title {
//    font-family: Myriad600;
//    width: 120px;
//    align-items: center;
//    display: flex;
//  }
//
//  &__value {
//    border-radius: 2px;
//    border: 1px solid #d66f5847;
//    padding: 0 7px;
//    height: 32px;
//    display: flex;
//    align-items: center;
//    width: 100px;
//    box-sizing: border-box;
//    color: $red;
//  }
//}
//
//.payment-info {
//  width: 427px;
//  padding: 20px;
//  box-sizing: border-box;
//  background: white;
//  border: 2px solid $border;
//  margin-top: 20px;
//  border-radius: 2px;
//
//
//  &__notes {
//    margin-top: 10px;
//  }
//
//  &__payBlock {
//    display: flex;
//  }
//
//  &__file {
//    display: flex;
//    gap: 15px;
//    align-items: center;
//  }
//
//  &__amountAndFile {
//    display: flex;
//    gap: 15px;
//    align-items: center;
//  }
//
//  &__amount {
//    display: flex;
//  }
//
//  &__double {
//    display: flex;
//    justify-content: space-between;
//    margin-top: 15px;
//    padding-top: 15px;
//    border-top: 2px solid #ededed;
//  }
//
//  &__doublePay {
//    gap: 15px;
//    display: flex;
//    margin-bottom: 12px;
//  }
//
//  &__select {
//    position: relative;
//    height: 32px;
//    width: 185px;
//    background-color: white;
//    border-radius: 2px;
//  }
//
//  &__title {
//    font-family: Myriad600;
//    margin-bottom: 3px;
//  }
//
//  &__input {
//    font-size: 14px;
//    border: 1px solid $border;
//    border-radius: 2px;
//    box-sizing: border-box;
//    padding: 0 7px;
//    outline: none;
//    width: 100px;
//    height: 32px;
//    transition: .1s ease-out;
//
//    &:focus {
//      border: 1px solid $border-focus;
//    }
//  }
//}
//
//.title {
//  display: flex;
//  justify-content: space-between;
//  align-items: center;
//  margin-bottom: 15px;
//  height: 32px;
//
//  &__text {
//    font-size: 18px;
//    font-family: 'Myriad600';
//
//    a {
//      color: inherit;
//      text-decoration: none;
//      transition: .2s ease-out;
//
//      &:hover {
//        text-decoration: underline;
//      }
//    }
//  }
//}
//
//.invoicing-details {
//  position: relative;
//  width: 1530px;
//  margin: 50px;
//
//  &__project-group {
//    margin-bottom: 40px;
//  }
//
//  &__cards {
//    display: flex;
//    flex-wrap: wrap;
//  }
//
//  &__body {
//    display: flex;
//    justify-content: space-between;
//  }
//
//  &__wrapper {
//    border-radius: 2px;
//    padding: 25px;
//    box-sizing: border-box;
//    box-shadow: $box-shadow;
//    background: white;
//  }
//
//  &__table {
//    width: 1050px;
//    position: relative;
//  }
//
//  &__text {
//    width: 380px;
//    background: $light-background;
//    box-sizing: border-box;
//    padding: 25px;
//    height: fit-content;
//    border-radius: 2px;
//    border-bottom: 1px solid $light-border;
//  }
//
//  &__user {
//    padding: 25px;
//    background: $light-background;
//    margin-bottom: 15px;
//    border-radius: 2px;
//    width: 380px;
//    box-sizing: border-box;
//    border-bottom: 1px solid $light-border;
//  }
//
//  &__title {
//    font-size: 19px;
//    margin-bottom: 20px;
//    display: flex;
//    justify-content: space-between;
//    align-items: center;
//    font-family: Myriad600;
//  }
//}
//
//.text {
//  &__block {
//    display: flex;
//    margin-bottom: 12px;
//
//    &:last-child {
//      margin-bottom: 0px;
//    }
//  }
//
//  &__title {
//    width: 140px;
//    color: $dark-border;
//  }
//
//  &__value {
//    width: 180px;
//  }
//}
//
//.fa-trash {
//  cursor: pointer;
//  font-size: 15px;
//}
//
//.table {
//  &__header,
//  &__data {
//    padding: 0 7px;
//  }
//
//  &__data {
//    width: 100%;
//
//    a {
//      color: inherit;
//      text-decoration: none;
//      transition: .2s ease-out;
//
//      &:hover {
//        text-decoration: underline;
//      }
//    }
//  }
//
//  &__icons {
//    width: 100%;
//    height: 40px;
//    align-items: center;
//    display: flex;
//    justify-content: center;
//  }
//}
//
//.check-box {
//  display: flex;
//  margin-top: 6px;
//
//  &__text {
//    font-family: Myriad400;
//    margin-left: 7px;
//    margin-top: 2px;
//  }
//}
//
//.absolute-middle {
//  position: absolute;
//  top: 50%;
//  left: 50%;
//  transform: translate(-50%, -50%);
//  z-index: 5;
//}
//
//.currency {
//  margin-right: 4px;
//  color: $dark-border;
//}
//
//.flex-wrapper {
//  display: flex;
//  gap: 20px;
//}
//
//.user {
//  display: flex;
//  gap: 20px;
//  width: 330px;
//
//  &__address {
//    color: $dark-border;
//    font-family: 'Myriad300';
//    letter-spacing: 0.2px;
//  }
//
//  &__name {
//    font-family: Myriad600;
//    margin-bottom: 10px;
//    font-size: 16px;
//
//    a {
//      color: inherit;
//      text-decoration: none;
//      transition: .2s ease-out;
//
//      &:hover {
//        text-decoration: underline;
//      }
//    }
//  }
//
//}
//
//.short {
//  text-overflow: ellipsis;
//  white-space: nowrap;
//  overflow: hidden;
//  max-width: 180px;
//}


textarea {
  width: 100%;
  border-radius: 2px;
  border: 1px solid $border;
  padding: 5px;
  color: $text;
  outline: none;
  box-sizing: border-box;
  transition: .1s ease-out;

  &:focus {
    border: 1px solid $border-focus;
  }
}

.green-value {
  border: 1px solid $border !important;
  color: $text !important;
}

.amount {
  &__title {
    font-family: Myriad600;
    width: 120px;
    align-items: center;
    display: flex;
  }

  &__value {
    border-radius: 2px;
    border: 1px solid #d66f5847;
    padding: 0 7px;
    height: 32px;
    display: flex;
    align-items: center;
    width: 100px;
    box-sizing: border-box;
    color: $red;
  }
}

.payment-card {
  background-color: white;
  padding: 25px;
  box-shadow: $box-shadow;
  border-radius: 2px;
  height: fit-content;
  z-index: 500;
  width: 510px;
  box-sizing: border-box;
  position: absolute;
  top: 50%;
  left: 485px;
  transform: translate(0%, -50%);

  &__buttons {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 25px;
  }

  &__input {
    font-size: 14px;
    border: 1px solid $border;
    border-radius: 2px;
    box-sizing: border-box;
    padding: 0 7px;
    outline: none;
    width: 220px;
    height: 32px;
    transition: .1s ease-out;

    &:focus {
      border: 1px solid $border-focus;
    }
  }

  &__link {
    transition: .2s ease-out;
    margin-top: 10px;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }

  &__body {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    margin: 15px 0;
    padding: 15px 0;
    border-top: 1px solid $light-border;
    border-bottom: 1px solid $light-border;
    flex-wrap: wrap;
  }

  &__title {
    text-align: center;
    font-family: 'Myriad900';
    text-transform: uppercase;
  }

  &__close {
    position: absolute;
    top: 10px;
    right: 10px;
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

.drop {
  height: 32px;
  position: relative;
  width: 220px;
  background-color: white;
  border-radius: 2px;

  &-title {
    margin-bottom: 3px;
  }
}

.title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  height: 32px;

  &__button {
    display: flex;
    gap: 20px;
  }

  &__text {
    font-size: 18px;
    font-family: 'Myriad600';

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

.invoicing-details {
  position: relative;
  width: 1530px;
  margin: 50px;


  &__cards {
    display: flex;
    flex-wrap: wrap;
  }

  &__body {
    display: flex;
    justify-content: space-between;
  }

  &__wrapper {
    border-radius: 2px;
    padding: 25px;
    box-sizing: border-box;
    box-shadow: $box-shadow;
    background: white;
    position: relative;
  }

  &__table {
    width: 1050px;
    position: relative;
  }

  &__text {
    width: 380px;
    background: $light-background;
    box-sizing: border-box;
    padding: 25px;
    height: fit-content;
    border-radius: 2px;
    border-bottom: 1px solid $light-border;
  }

  &__user {
    padding: 25px;
    background: $light-background;
    margin-bottom: 15px;
    border-radius: 2px;
    width: 380px;
    box-sizing: border-box;
    border-bottom: 1px solid $light-border;
  }

  &__title {
    font-size: 18px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: Myriad600;
  }
}

.text {
  &__block {
    display: flex;
    margin-bottom: 12px;
    align-items: center;

    &:last-child {
      margin-bottom: 0px;
    }
  }

  &__title {
    width: 140px;
    color: $dark-border;
  }

  &__value {
    width: 180px;
    position: relative;

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

.file-name {
  position: absolute;
  width: 145px;
  top: 7px;
  left: 40px;
  opacity: 0.6;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.fa-trash {
  cursor: pointer;
  font-size: 15px;
}

.table {
  &__header,
  &__data {
    padding: 0 7px;
  }

  &__data {
    width: 100%;

    a {
      color: inherit;
      text-decoration: none;
      transition: .2s ease-out;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  &__icons {
    width: 100%;
    height: 40px;
    align-items: center;
    display: flex;
    justify-content: center;
  }
}

.check-box {
  display: flex;
  margin-top: 6px;

  &__text {
    font-family: Myriad400;
    margin-left: 7px;
    margin-top: 2px;
  }
}

.absolute-middle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 5;
}

.currency {
  margin-right: 4px;
  color: $dark-border;
}

.short {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 180px;
}


.user {
  display: flex;
  gap: 20px;
  width: 330px;

  &__address {
    color: $dark-border;
    font-family: 'Myriad300';
    letter-spacing: 0.2px;
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

  &__fakeImage {
    height: 55px;
    width: 55px;
    min-width: 55px;
    border-radius: 8px;
    font-size: 28px;
    background: var(--bgColor);
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }

  &__image {
    height: 55px;
    width: 55px;
    min-width: 55px;
    position: relative;

    img {
      width: 100%;
      height: 100%;
      border-radius: 8px;
      object-fit: cover;
    }
  }
}

.payment-button {
  display: flex;
  justify-content: center;
}

.payment-buttons {
  margin-top: 25px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.payment-details {
  width: 380px;
  background: white;
  box-sizing: border-box;
  padding: 25px;
  border-radius: 2px;
  border: 1px solid $light-border;
  margin-top: 15px;

  &__row {
    display: flex;
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0px;
    }
  }

  &__key {
    width: 110px;
    color: $dark-border;
  }

  &__value {
    width: 210px;
    display: flex;
    gap: 12px;
  }
}

.details-icon {
  transition: .2s ease-out;
  color: $dark-border;
  font-size: 15px;

  &:hover {
    cursor: pointer;
    color: $text;
  }
}

.toggle-details {
  font-size: 15px;
  border-radius: 2px;
  height: 30px;
  width: 30px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: .2s ease-out;
  justify-content: center;
  border: 1px solid $border;
  color: $dark-border;
  box-sizing: border-box;

  &:hover {
    color: $text;
  }
}

.file-fake-button {
  height: 30px;
  width: 30px;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  border: 1px solid $border;
  box-sizing: border-box;
  background-color: white;
  color: $dark-border;
  transition: .2s ease-out;

  &:hover {
    color: $text;
  }
}
</style>