<template lang="pug">
  .invoicing-details
    .modal__block
    .invoicing-details__wrapper(v-if="reportDetailsInfo.hasOwnProperty('vendor')")
      .invoicing-details__details
        .title
          //.title__text
          //  router-link(class="link-to" target= '_blank' :to="{path: `/pangea-vendors/all/details/${reportDetailsInfo.vendor._id}`}")
          //    span {{reportDetailsInfo.vendor.firstName + ' ' + reportDetailsInfo.vendor.surname}}

          .title__button
            Button(v-if='!toggleAddSteps && reportDetailsInfo.status === "Created"' :outline="true" value="Send" @clicked="changeReportStatus")
            Button(v-if='!toggleAddSteps && (reportDetailsInfo.status === "Created" || reportDetailsInfo.status === "Sent")' value="Add jobs" @clicked="changeToggleAddSteps")
            //Button(v-if='reportDetailsInfo.status === "Created" || reportDetailsInfo.status === "Sent"' value="Delete" @clicked="showModalDeleteRequest")


        .invoicing-details__body(v-if="reportDetailsInfo.hasOwnProperty('vendor')")
          .invoicing-details__details
            .invoicing-details__user
              .user
                .user__image(v-if="reportDetailsInfo.vendor.photo")
                  img(:src="domain + reportDetailsInfo.vendor.photo")
                .user__fakeImage(:style="{'--bgColor': getBgColor(reportDetailsInfo.vendor._id)[0], '--color': getBgColor(reportDetailsInfo.vendor._id)[1]}" v-else) {{ reportDetailsInfo.vendor.firstName[0] }}
                .user__description
                  .user__name
                    router-link(class="link-to" target= '_blank' :to="{path: `/pangea-vendors/all/details/${reportDetailsInfo.vendor._id}`}")
                      span {{reportDetailsInfo.vendor.firstName + ' ' + reportDetailsInfo.vendor.surname}}
                  .user__address {{ reportDetailsInfo.vendor.billingInfo.address || 'No address...' }}

            .invoicing-details__text
              .text__block
                .text__title Report ID:
                .text__value {{reportDetailsInfo.reportId}}
              .text__block
                .text__title Status:
                .text__value {{reportDetailsInfo.status}}
              .text__block
                .text__title Created On:
                .text__value {{ formattedDate(reportDetailsInfo.createdAt) }}
              .text__block
                .text__title Date Range:
                .text__value
                  span {{ formattedDateRange(reportDetailsInfo.firstPaymentDate)}}
                  span(style="color:#999; margin: 0 4px;") /
                  span {{ formattedDateRange(reportDetailsInfo.lastPaymentDate) }}
              .text__block
                .text__title Jobs:
                .text__value {{ reportDetailsInfo.steps.length }}
              .text__block
                .text__title Total Amount:
                .text__value
                  span(style="margin-right: 4px;") {{ getStepsPayables(reportDetailsInfo.steps) | roundTwoDigit }}
                  span(v-html="'&euro;'")
              .text__block(v-if="this.reportDetailsInfo.status === 'Invoice Received' || this.reportDetailsInfo.status === 'Partially Paid' ")
                .text__title Invoice:
                .text__value
                  .file-fake-button(style="cursor: pointer" @click="downloadFile(reportDetailsInfo.paymentDetails.file.path)")
                    i(class="fas fa-download")


              //TODO PAYMENT CARD ====>
              .payment-info(v-if="this.reportDetailsInfo.status === 'Invoice Received' || this.reportDetailsInfo.status === 'Partially Paid' ")
                .payment-info__doublePay
                  .payment-info__payBlock
                    .amount__title Paid Amount:
                    input(:value="amount" @change="updatePaidAmount" class="payment-info__input" :disabled="isFull")
                  .check-box
                    CheckBox(:isChecked="isFull" :isWhite="true" @check="togglePaidFull(true)" @uncheck="togglePaidFull(false)")
                    span(class="check-box__text") Paid full

                .payment-info__amountAndFile
                  .payment-info__amount
                    .amount__title Unpaid Amount:
                    .amount__value(:class="{'green-value': +getUnpaidAmount === 0 }") {{ getUnpaidAmount }} €

                .payment-info__double
                  .payment-info__block
                    .payment-info__title Payment Method:
                    .payment-info__select
                      SelectSingle(
                        :selectedOption="paymentMethod"
                        :options="['test1', 'test2', 'test3' ]"
                        placeholder="Option"
                        @chooseOption="setPaymentMethod"
                      )
                  .payment-info__block
                    .payment-info__title Payment Date:
                    DatepickerWithTime(
                      :value="paymentDate"
                      @selected="setFromDate"
                      placeholder="Date"
                      :isTime="true"
                      :highlighted="highlighted"
                      :monday-first="true"
                      inputClass="datepicker-custom-filter-185"
                      calendarClass="calendar-custom"
                      :format="customFormatter"
                      :disabled="disabled"
                    )

                .payment-info__notes
                  .payment-info__title Notes:
                  textarea(type="text" rows="3" v-model="notes")

                Button(style="display: flex; justify-content: center; margin-top: 20px;" v-if="amount" :value="'Submit ' + `${amount} €`" @clicked="reportToPayment")


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
              :tableData="reportDetailsInfo.steps",
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
                .table__data {{ row.stepId }}

              template(slot="service" slot-scope="{ row, index }")
                .table__data {{ row.stepAndUnit.step.title }}

              template(slot="langPair" slot-scope="{ row, index }")
                .table__data {{ row.sourceLanguage}}
                  span(style="font-size: 12px;color: #999999; margin: 0 4px;")
                    i(class="fas fa-angle-double-right")
                  | {{ row.targetLanguage }}

              template(slot="billing" slot-scope="{ row, index }")
                .table__data {{ formattedDate(row.billingDate) }}

              template(slot="status" slot-scope="{ row, index }")
                .table__data {{ row.status }}

              template(slot="payables" slot-scope="{ row, index }")
                .table__data
                  span.currency(v-html="'&euro;'")
                  span {{ row.nativeFinance.Price.payables | roundTwoDigit}}

              template(slot="icons", slot-scope="{ row, index }")
                .table__icons(v-if="(reportDetailsInfo.status === 'Created' || reportDetailsInfo.status === 'Sent')")
                  i(class="fas fa-trash" @click="requestToDelete(row._id)")

      .invoicing-details__add-steps
        PayablesAddStepsTo(
          v-if="toggleAddSteps"
          :steps="steps"
          :invoicingEditId="reportDetailsInfo._id"
          @refreshReports="refreshReports"
          @closeTable="changeToggleAddSteps"
        )

    .invoicing-details__cards(v-if="reportDetailsInfo && reportDetailsInfo.paymentInformation.length")
      .invoicing-details__card(v-for="cardInfo in reportDetailsInfo.paymentInformation")
        PayablesPaymentInformationCard(
          :cardInfo="cardInfo"
          :paymentDetails="reportDetailsInfo.paymentDetails"
        )

</template>

<script>
import GeneralTable from '../GeneralTable'
import moment from "moment"
import PayablesAddStepsTo from "./PayablesAddStepsTo"
import ApproveModal from '../ApproveModal'
import Button from "../Button"
import SelectSingle from "../SelectSingle"
import DatepickerWithTime from "../DatepickerWithTime"
import CheckBox from "../CheckBox"
import PayablesPaymentInformationCard from "./PayablesPaymentInformationCard"
import { mapActions } from "vuex"
import getBgColor from "../../mixins/getBgColor"


export default {
  name: "InvoicingDetails",
  mixins: [ getBgColor ],
  data() {
    return {
      domain: '',
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
          key: "payables",
          style: { width: "10%" }
        },
        {
          label: "",
          headerKey: "headerIcons",
          key: "icons",
          style: { width: "5%" }
        }
      ],
      toggleAddSteps: false,
      deleteInfo: {},
      isDeletingStep: false,
      steps: [],
      paymentMethod: '',
      paymentDate: new Date(),
      amount: 0,
      notes: '',

      // showDeleteRequestModal: false,
      // showSendModal: false,

      isFull: false,

      disabled: {
        to: moment().add(-1, 'day').endOf('day').toDate()
      }
    }
  },
  methods: {
    ...mapActions([ 'alertToggle' ]),
    downloadFile(path) {
      let link = document.createElement('a')
      link.href = __WEBPACK__API_URL__ + '/' + path
      link.target = "_blank"
      link.click()
    },
    getStepsPayables(stepFinance) {
      return stepFinance.reduce((sum, step) => {
        sum += step.nativeFinance.Price.payables || 0
        return sum
      }, 0)
    },
    setPaymentMethod({ option }) {
      this.paymentMethod = option
    },
    setFromDate(e) {
      this.paymentDate = e
    },
    customFormatter(date) {
      return moment(date).format('DD-MM-YYYY, HH:mm')
    },
    async reportToPayment() {
      const data = {
        paidAmount: this.amount,
        unpaidAmount: (this.getUnpaidAmount - +this.amount).toFixed(2),
        paymentMethod: this.paymentMethod,
        paymentDate: this.paymentDate,
        notes: this.notes
      }
      const reuslt = (await (this.$http.post(`/invoicing-payables/report-final-status/${ this.reportDetailsInfo._id }`, data))).data
      if (reuslt === "Moved") {
        await this.$router.push('/pangea-finance/invoicing-payables/paid-invoices/' + this.reportDetailsInfo._id)
      } else {
        await this.refreshReports()
      }
      this.amount = 0
    },
    updatePaidAmount(event) {
      const value = event.target.value
      // console.log(value, this.amount)
      if ((+value).toFixed(2) <= this.getUnpaidAmount && value >= 0) {
        this.amount = (parseFloat(value)).toFixed(2)
      }
      this.$forceUpdate()
    },
    togglePaidFull(val) {
      this.isFull = val
      if (val) {
        this.amount = this.getUnpaidAmount
      }
    },
    formattedDate(date) {
      return moment(date).format('MMM D, HH:mm')
    },
    formattedDateRange(date) {
      return moment(date).format('MMM D')
    },
    async refreshReports() {
      await this.openDetails(this.$route.params.id)
      await this.getSteps()
    },
    changeToggleAddSteps() {
      this.toggleAddSteps = !this.toggleAddSteps
      if (this.toggleAddSteps) {
        this.getSteps()
      }
    },
    requestToDelete(stepId) {
      this.deleteInfo = { reportId: this.reportDetailsInfo._id, stepId }
      this.isDeletingStep = true
    },
    async changeReportStatus() {
      try {
        await this.$http.post('/invoicing-payables/manage-report-status', {
          reportsIds: [ this.$route.params.id ],
          nextStatus: 'Sent'
        })
        await this.refreshReports()
        // this.closeSendRequest()
      } catch (error) {
        this.alertToggle({ message: "Error on Reports sending", isShow: true, type: "error" })
      }
    },
    // showModalSendRequest() {
    //   this.showSendModal = true
    // },
    // closeSendRequest() {
    //   this.showSendModal = false
    // },
    async deleteStep() {
      const { reportId, stepId } = this.deleteInfo
      this.closeModalStep()
      await this.$http.post(`/invoicing-payables/report/${ reportId }/delete/${ stepId }`)
      await this.refreshReports()

    },
    closeModalStep() {
      this.deleteInfo = {}
      this.isDeletingStep = false
    },
    async openDetails(id) {
      try {
        this.reportDetailsInfo = (await this.$http.post('/invoicing-payables/report/' + id)).data[0]
      } catch (e) {
        this.alertToggle({ message: "Error on getting details", isShow: true, type: "error" })
      }
    },
    async getSteps() {
      this.steps = (await this.$http.post('/invoicing-payables/not-selected-steps-list/' + this.reportDetailsInfo.vendor._id)).data.map(i => ({ ...i, isCheck: false }))
      console.log('steps', this.steps)
    }
  },
  computed: {
    //Todo: show status "Invoice Received" and "Partially Paid"1
    getPaymentRemainder() {
      const { paymentInformation = [] } = this.reportDetailsInfo
      return paymentInformation.reduce((sum, item) => {
        sum += item.paidAmount
        return sum
      }, 0)
    },
    getUnpaidAmount() {
      const rawUnpaidAmount = this.getStepsPayables(this.reportDetailsInfo.steps) - (+this.getPaymentRemainder)
      return +(parseFloat(rawUnpaidAmount)).toFixed(2)
    }
  },
  async created() {
    await this.openDetails(this.$route.params.id)
    this.paymentMethod = this.reportDetailsInfo.paymentDetails.paymentMethod
    this.domain = __WEBPACK__API_URL__
  },
  components: {
    Button,
    GeneralTable,
    PayablesAddStepsTo,
    ApproveModal,
    SelectSingle,
    DatepickerWithTime,
    CheckBox,
    PayablesPaymentInformationCard
  }
}
</script>

<style scoped lang="scss">
@import "../../assets/scss/colors";

textarea {
  width: 100%;
  border-radius: 4px;
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

.file-fake-button {
  height: 30px;
  width: 40px;
  background-color: $red;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  color: white;

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
    border-radius: 4px;
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

.payment-info {
  width: 427px;
  padding: 20px;
  box-sizing: border-box;
  background: white;
  border: 2px solid $border;
  margin-top: 20px;
  border-radius: 4px;


  &__notes {
    margin-top: 10px;
  }

  &__payBlock {
    display: flex;
  }

  &__file {
    display: flex;
    gap: 15px;
    align-items: center;
  }

  &__amountAndFile {
    display: flex;
    gap: 15px;
    align-items: center;
  }

  &__amount {
    display: flex;
  }

  &__double {
    display: flex;
    justify-content: space-between;
    margin-top: 15px;
    padding-top: 15px;
    border-top: 2px solid #ededed;
  }

  &__doublePay {
    gap: 15px;
    display: flex;
    margin-bottom: 12px;
  }

  &__select {
    position: relative;
    height: 32px;
    width: 185px;
    background-color: white;
    border-radius: 4px;
  }

  &__title {
    font-family: Myriad600;
    margin-bottom: 3px;
  }

  &__input {
    font-size: 14px;
    border: 1px solid $border;
    border-radius: 4px;
    box-sizing: border-box;
    padding: 0 7px;
    outline: none;
    width: 100px;
    height: 32px;
    transition: .1s ease-out;

    &:focus {
      border: 1px solid $border-focus;
    }
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
    border-radius: 4px;
    padding: 25px;
    box-sizing: border-box;
    box-shadow: $box-shadow;
    background: white;
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
    border-radius: 4px;
    border-bottom: 1px solid $light-border;
  }

  &__user {
    padding: 25px;
    background: $light-background;
    margin-bottom: 15px;
    border-radius: 4px;
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
  }
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
</style>