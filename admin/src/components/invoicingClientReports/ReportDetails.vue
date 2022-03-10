<template lang="pug">
  .invoicing-details
    .invoicing-details__wrapper(v-if="Object.keys(reportDetailsInfo).length")
      .invoicing-details__info
        .info__user
          .user
            .user__description
              .user__name
                router-link(class="link-to" target= '_blank' :to="{path: `/pangea-clients/all/details/${reportDetailsInfo.client._id}`}")
                  span {{ getBillingDetails(reportDetailsInfo).getOfficialName() }}
              .user__address {{ getBillingDetails(reportDetailsInfo).getAddressFull() }}

        .info__descriptions
          .text__block
            .text__title Report ID:
            .text__value {{reportDetailsInfo.reportId}}

          .text__block
            .text__title Customer:
            .text__value {{reportDetailsInfo.client.name}}

          .text__block
            .text__title Billing Name:
            .text__value {{ getBillingDetails(reportDetailsInfo).getName() }}

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
              span /
              span {{ formattedDateRange(reportDetailsInfo.lastPaymentDate) }}

          .text__block
            .text__title Payment Terms:
            .text__value {{ getBillingDetails(reportDetailsInfo).getPaymentTerms() }}

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
          :isAvailableDeleting="true"
          :enumOfReports="'client'"
          :steps="reportDetailsInfo.stepsWithProject"
          @deleteStep="deleteStep"
        )
        Add(
          v-if="!toggleAddSteps"
          @add="changeToggleAddSteps"
        )
      //  .payment-card(v-if="isPaymentCard")
      //    .payment-card__close(@click="closePaymentCard") &#215;
      //    .payment-card__title Payment
      //    .payment-card__header
      //      //.payment-card__header-block
      //      //  .drop-title Payment Method:
      //      //  .drop
      //      //    SelectSingle(
      //      //      :selectedOption="paymentMethod.name || ''"
      //      //      :options="reportDetailsInfo.vendor.billingInfo.paymentMethod.length ? reportDetailsInfo.vendor.billingInfo.paymentMethod.map(i => i.name) : []"
      //      //      placeholder="Option"
      //      //      @chooseOption="setPaymentMethod"
      //      //    )
      //      .payment-card__header-block
      //        .drop-title Payment Date:
      //        .drop
      //          DatePicker(
      //            :value="paymentDate"
      //            @confirm="(e) => setFromDate(e)"
      //            format="MMM D, HH:mm"
      //            type="datetime"
      //            ref="deadline"
      //            :clearable="false"
      //            :confirm="true"
      //            confirm-text="Set date"
      //            prefix-class="xmx"
      //          )
      //      .payment-card__header-block(v-if="!isNotes" @click="isNotes = true")
      //        .payment-card__link Add Note
      //      .payment-card__header-block(v-else style="margin-top: 10px; width: 100%;")
      //        .drop-title Notes:
      //        textarea(type="text" rows="4" v-model="notes")
      //    .payment-card__body
      //      .payment-card__body-block
      //        .drop-title Amount:
      //        input(v-model="amount" ref="input" @click="selectInput" :class="'payment-card__input'" type="number" style="background-color: white;")
      //      .payment-card__body-block
      //        .drop-title Unpaid Amount:
      //        input(:value="getUnpaidAmount" :class="'payment-card__input'" :disabled="true")
      //      .payment-card__body-block
      //        .payment-card__link(@click="approvePaidFull") Pay Full Amount
      //    .payment-card__buttons
      //      Button(
      //        :isDisabled="!abilityToSubmitPayment"
      //        :value="`${abilityToSubmitPayment ? 'Submit ' + amount + ' €' : 'Cannot be confirmed' }`"
      //        @clicked="reportToPayment"
      //      )
      //      Button(:value="'Cancel'" :outline="true" @clicked="closePaymentCard")
      //
      //  .invoicing-details__details
      //    .invoicing-details__body(v-if="Object.keys(reportDetailsInfo).length")
      //      .invoicing-details__details
      //
      //        .invoicing-details__text

      //
      //
      //          //TODO PAYMENT CARD ====>
      //          //.payment-info(v-if="false")
      //          //  .payment-info__doublePay
      //          //    .payment-info__payBlock
      //          //      .amount__title Paid Amount:
      //          //      input(:value="amount" @change="updatePaidAmount" class="payment-info__input" :disabled="isFull")
      //          //    .check-box
      //          //      CheckBox(:isChecked="isFull" :isWhite="true" @check="togglePaidFull(true)" @uncheck="togglePaidFull(false)")
      //          //      span(class="check-box__text") Paid full
      //          //
      //          //  .payment-info__amountAndFile
      //          //    .payment-info__amount
      //          //      .amount__title Unpaid Amount:
      //          //      .amount__value(:class="{'green-value': +getUnpaidAmount === 0 }") {{ getUnpaidAmount }} €
      //          //
      //          //  .payment-info__double
      //          //    .payment-info__block
      //          //      .payment-info__title Payment Method:
      //          //      .payment-info__select
      //          //        SelectSingle(
      //          //          :selectedOption="paymentMethod"
      //          //          :options="['test1', 'test2', 'test3' ]"
      //          //          placeholder="Option"
      //          //          @chooseOption="setPaymentMethod"
      //          //        )
      //          //    .payment-info__block
      //          //      .payment-info__title Payment Date:
      //          //      DatepickerWithTime(
      //          //        :value="paymentDate"
      //          //        @selected="setFromDate"
      //          //        placeholder="Date"
      //          //        :isTime="true"
      //          //        :highlighted="highlighted"
      //          //        :monday-first="true"
      //          //        inputClass="datepicker-custom-filter-185"
      //          //        calendarClass="calendar-custom"
      //          //        :format="customFormatter"
      //          //        :disabled="disabled"
      //          //      )
      //          //
      //          //
      //          //  .payment-info__notes
      //          //    .payment-info__title Notes:
      //          //    textarea(type="text" rows="3" v-model="notes")
      //          //
      //          //  Button(style="display: flex; justify-content: center; margin-top: 20px;" v-if="amount" :value="'Submit ' + `${amount} €`" @clicked="reportToPayment")
      //
      //        .payment-buttons
      //          Button(v-if="reportDetailsInfo.status === 'Invoice Ready'" value="Send" @clicked="sendInvoice")
      //          Button(v-if="reportDetailsInfo.status === 'Created'" value="Generate And Send" @clicked="generateAndSendInvoice")
      //          Button(v-if="reportDetailsInfo.status === 'Created'" value="Generate Invoice" @clicked="generateInvoice")
      //          Button(v-if="reportDetailsInfo.status === 'Sent'" value="Add Payment" @clicked="openPaymentCard")
      //          Button(v-if="reportDetailsInfo.status === 'Created'" value="Add jobs" @clicked="changeToggleAddSteps")
      //
      //
      //      .invoicing-details__table
      //        ApproveModal(
      //          v-if="isDeletingStep"
      //          class="absolute-middle"
      //          text="Are you sure?"
      //          approveValue="Yes"
      //          notApproveValue="Cancel"
      //          @approve="deleteStep"
      //          @close="closeModalStep"
      //          @notApprove="closeModalStep"
      //        )
      //        GeneralTable(
      //          :fields="fields",
      //          :tableData="reportDetailsInfo.stepsWithProject",
      //          :isFilterShow="false"
      //          :isFilterAbsolute="false"
      //        )
      //
      //          template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
      //            .table__header {{ field.label }}
      //
      //          template(slot="project" slot-scope="{ row, index }")
      //            .table__data
      //              router-link(class="link-to" target= '_blank' :to="{path: `/pangea-projects/all-projects/All/details/${row.projectNativeId}`}")
      //                .short {{ row.projectName }}
      //
      //          template(slot="stepId" slot-scope="{ row, index }")
      //            .table__data {{ row.stepId || '-' }}
      //
      //          template(slot="service" slot-scope="{ row, index }")
      //            .table__data {{ row.type === 'Classic' ? row.stepAndUnit.step.title : row.title }}
      //
      //          template(slot="langPair" slot-scope="{ row, index }")
      //            span(v-if="row.type === 'Classic'" )
      //              .table__data {{ row.sourceLanguage}}
      //                span(style="font-size: 12px;color: #999999; margin: 0 4px;")
      //                  i(class="fas fa-angle-double-right")
      //                | {{ row.targetLanguage }}
      //            span(v-else) -
      //
      //          template(slot="billing" slot-scope="{ row, index }")
      //            .table__data {{ formattedDate(row.billingDate) }}
      //
      //          template(slot="status" slot-scope="{ row, index }")
      //            .table__data {{ row.status || 'Completed' }}
      //
      //          template(slot="receivables" slot-scope="{ row, index }")
      //            .table__data
      //              span.currency(v-html="returnIconCurrencyByStringCode(row.projectCurrency)")
      //              span {{ row.finance.Price.receivables | roundTwoDigit }}
      //
      //          template(slot="icons", slot-scope="{ row, index }")
      //            .table__icons(v-if="(reportDetailsInfo.status === 'Created' || reportDetailsInfo.status === 'Sent')")
      //              i(class="fas fa-trash" @click="requestToDelete(row._id)")
      //
    .available-jobs(v-if="toggleAddSteps")
      ReceivablesAddStepsTo(
        :paymentType="getBillingDetails(reportDetailsInfo).getPaymentType()"
        :steps="steps"
        @refreshReports="refreshReports"
        @closeTable="changeToggleAddSteps"
      )
    //
    ////.invoicing-details__cards(v-if="reportDetailsInfo && reportDetailsInfo.hasOwnProperty('paymentInformation') && reportDetailsInfo.paymentInformation.length")
    ////  .invoicing-details__card(v-for="cardInfo in reportDetailsInfo.paymentInformation")
    ////    ReceivablesPaymentInformationCard(
    ////      :cardInfo="cardInfo"
    ////      :paymentDetails="{paymentDetails: {expectedPaymentDate: 0}}"
    ////    )

</template>

<script>
import GeneralTable from '../GeneralTable'
import moment from "moment"
import ReceivablesAddStepsTo from "./ReceivablesAddStepsTo"
import ApproveModal from '../ApproveModal'
import Button from "../Button"
import SelectSingle from "../SelectSingle"
import CheckBox from "../CheckBox"
// import ReceivablesPaymentInformationCard from "./ReceivablesPaymentInformationCard"
import { mapActions } from "vuex"
import _ from "lodash"
import DatePicker from 'vue2-datepicker'
import '../../assets/scss/datepicker.scss'
import currencyIconDetected from "../../mixins/currencyIconDetected"
import ReportDetailsJobsList from "../invoicingPayables/ReportDetailsJobsList"
import Add from "../Add"

export default {
  name: "ReportDetails",
  mixins: [ currencyIconDetected ],
  data() {
    return {
      // isNotes: false,
      // isPaymentCard: false,

      // deleteInfo: {},
      // isDeletingStep: false,

      // paymentMethod: '',
      // paymentDate: new Date(),
      // amount: 0,
      // notes: ''
      reportDetailsInfo: {},
      toggleAddSteps: false,
      steps: []
    }
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle"
    }),
    //   closePaymentCard() {
    //     this.isPaymentCard = false
    //     this.isNotes = false
    //     this.notes = ''
    //     // this.paymentMethod = this.reportDetailsInfo.paymentDetails.paymentMethod
    //     this.amount = 0
    //   },
    //   openPaymentCard() {
    //     this.isPaymentCard = true
    //     this.paymentDate = new Date()
    //   },
    //   downloadFile(path) {
    //     let link = document.createElement('a')
    //     link.href = this.$domains.admin + '/' + path
    //     link.target = "_blank"
    //     link.click()
    //   },
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
    //   // setPaymentMethod({ option }) {
    //   //   this.paymentMethod = option
    //   // },
    //   approvePaidFull() {
    //     this.amount = this.getUnpaidAmount
    //   },
    //   selectInput() {
    //     this.$refs.input.select()
    //   },
    //   setFromDate(e) {
    //     this.paymentDate = e
    //   },
    //   async reportToPayment() {
    //     const amount = +(parseFloat(this.amount)).toFixed(2)
    //     const data = {
    //       paidAmount: amount,
    //       unpaidAmount: +(this.getUnpaidAmount - amount).toFixed(2),
    //       paymentMethod: this.paymentMethod,
    //       paymentDate: this.paymentDate,
    //       // zohoBillingId: this.reportDetailsInfo.zohoBillingId,
    //       // vendorName: this.reportDetailsInfo.vendor.firstName + ' ' + this.reportDetailsInfo.vendor.surname,
    //       notes: this.notes
    //     }
    //     this.closePaymentCard()
    //     // const reuslt = (await (this.$http.post(`/invoicing-receivables/report-final-status/${ this.reportDetailsInfo._id }`, data))).data
    //     // if (reuslt === "Moved") {
    //     //   await this.$router.push('/pangea-finance/invoicing-payables/paid-invoices/' + this.reportDetailsInfo._id)
    //     // } else {
    //     //   await this.refreshReports()
    //     // }
    //     this.amount = 0
    //   },
    //   // updatePaidAmount(event) {
    //   //   const value = event.target.value
    //   //   if ((+value).toFixed(2) <= this.getUnpaidAmount && value >= 0) {
    //   //     this.amount = (parseFloat(value)).toFixed(2)
    //   //   }
    //   //   this.$forceUpdate()
    //   // },
    //   // togglePaidFull(val) {
    //   //   this.isFull = val
    //   //   if (val) {
    //   //     this.amount = this.getUnpaidAmount
    //   //   }
    //   // },
    //   async sendInvoice() {
    //     try {
    //       const result = await this.$http.post('/invoicing-receivables/sendInvoice', { _id: this.$route.params.id })
    //       await this.getReportDetails(this.$route.params.id)
    //       const { type, message } = result.data
    //       this.alertToggle({ message, isShow: true, type })
    //     } catch (e) {
    //       console.log(e, 'generateInvoice()')
    //     }
    //   },
    //   async generateAndSendInvoice() {
    //     try {
    //       const result = await this.$http.post('/invoicing-receivables/zoho/createAndSendInvoice', { _id: this.$route.params.id })
    //       await this.getReportDetails(this.$route.params.id)
    //       const { type, message } = result.data
    //       this.alertToggle({ message, isShow: true, type })
    //     } catch (e) {
    //       console.log(e, 'generateInvoice()')
    //     }
    //   },
    //   async generateInvoice() {
    //     try {
    //       const result = await this.$http.post('/invoicing-receivables/zoho/createInvoice', { _id: this.$route.params.id })
    //       await this.getReportDetails(this.$route.params.id)
    //       const { type, message } = result.data
    //       this.alertToggle({ message, isShow: true, type })
    //     } catch (e) {
    //       console.log(e, 'generateInvoice()')
    //     }
    //   },
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
      const PT = this.getBillingDetails(this.reportDetailsInfo).getPaymentType()
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
    }
    // },
    // computed: {
    //   getPaymentRemainder() {
    //     const { paymentInformation = [] } = this.reportDetailsInfo
    //     return paymentInformation.reduce((sum, item) => {
    //       sum += +item.paidAmount
    //       return sum
    //     }, 0)
    //   },
    //   getUnpaidAmount() {
    //     const rawUnpaidAmount = +this.reportDetailsInfo.total - +this.getPaymentRemainder
    //     return +(parseFloat(rawUnpaidAmount)).toFixed(2)
    //   },
    //   abilityToSubmitPayment() {
    //     return this.amount !== 0
    //         && this.amount !== '0'
    //         && this.amount > 0
    //         && this.amount <= this.getUnpaidAmount
    //   }
    // groupByProject() {
    //   const groupedByProject = _.groupBy(this.reportDetailsInfo.stepsWithProject, (item) => {
    //     return item.projectId
    //   })
    //   return groupedByProject
    // }
  },
  async created() {
    await this.getReportDetails()
    // await this.updateReportsStateFromZoho(this.$route.params.id)
    // this.paymentMethod = this.reportDetailsInfo.paymentDetails.paymentMethod
  },
  components: {
    Add,
    ReportDetailsJobsList,
    DatePicker,
    Button,
    GeneralTable,
    ReceivablesAddStepsTo,
    ApproveModal,
    SelectSingle,
    CheckBox
    // ReceivablesPaymentInformationCard
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
  width: 1545px;
  margin-top: 25px;
}

.invoicing-details {
  position: relative;
  margin: 50px;

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
    width: 450px;
  }

  &__listOfJobs {
    padding: 25px;
    background: white;
    border-radius: 2px;
    box-shadow: $box-shadow;
    height: fit-content;
    box-sizing: border-box;
    width: 1070px;
  }
}

.info {
  &__user {
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid $light-border;
  }
}

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
//.payment-card {
//  background-color: white;
//  padding: 25px;
//  box-shadow: $box-shadow;
//  border-radius: 2px;
//  height: fit-content;
//  z-index: 500;
//  width: 510px;
//  box-sizing: border-box;
//  position: absolute;
//  top: 50%;
//  left: 485px;
//  transform: translate(0%, -50%);
//
//  &__buttons {
//    display: flex;
//    justify-content: center;
//    gap: 20px;
//    margin-top: 25px;
//  }
//
//  &__input {
//    font-size: 14px;
//    border: 1px solid $border;
//    border-radius: 2px;
//    box-sizing: border-box;
//    padding: 0 7px;
//    outline: none;
//    width: 220px;
//    height: 32px;
//    transition: .1s ease-out;
//
//    &:focus {
//      border: 1px solid $border-focus;
//    }
//  }
//
//  &__link {
//    transition: .2s ease-out;
//    margin-top: 10px;
//    cursor: pointer;
//
//    &:hover {
//      text-decoration: underline;
//    }
//  }
//
//  &__body {
//    display: flex;
//    justify-content: space-between;
//    flex-wrap: wrap;
//  }
//
//  &__header {
//    display: flex;
//    justify-content: space-between;
//    margin: 15px 0;
//    padding: 15px 0;
//    border-top: 1px solid $light-border;
//    border-bottom: 1px solid $light-border;
//    flex-wrap: wrap;
//  }
//
//  &__title {
//    text-align: center;
//    font-family: 'Myriad900';
//    text-transform: uppercase;
//  }
//
//  &__close {
//    position: absolute;
//    top: 10px;
//    right: 10px;
//    font-size: 22px;
//    cursor: pointer;
//    height: 22px;
//    width: 22px;
//    justify-content: center;
//    display: flex;
//    align-items: center;
//    font-family: Myriad900;
//    opacity: 0.8;
//    transition: ease 0.2s;
//
//    &:hover {
//      opacity: 1
//    }
//  }
//}
//
//.drop {
//  height: 32px;
//  position: relative;
//  width: 220px;
//  background-color: white;
//  border-radius: 2px;
//
//  &-title {
//    margin-bottom: 3px;
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
//  &__button {
//    display: flex;
//    gap: 20px;
//  }
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
//    position: relative;
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
//    font-size: 18px;
//    margin-bottom: 20px;
//    display: flex;
//    justify-content: space-between;
//    align-items: center;
//    font-family: Myriad600;
//  }
//}
//

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
    width: 130px;
    position: relative;
    margin-right: 10px;
  }

  &__value {
    width: 260px;
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

//
//.file-name {
//  position: absolute;
//  width: 145px;
//  top: 7px;
//  left: 40px;
//  opacity: 0.6;
//  text-overflow: ellipsis;
//  white-space: nowrap;
//  overflow: hidden;
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
//
//
.user {
  display: flex;
  gap: 20px;

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