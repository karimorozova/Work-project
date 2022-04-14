<template lang="pug">
  .layout
    NavbarList(
      v-if="shortProjectList.length"
      :items="shortProjectList"
      :basicLink="'/pangea-finance/payables-reports/paid-reports/'"
    )
    .invoicing-details
      ApproveModal(
        v-if="isDoubleApproveForceStatus"
        class="absolute-middle"
        text="Are you sure?"
        approveValue="Yes"
        notApproveValue="Cancel"
        @approve="approveForceStatus"
        @close="toggleForceStatusEdition"
        @notApprove="toggleForceStatusEdition"
      )
      ApproveModal(
        v-if="isClearZohoLink"
        class="absolute-middle"
        text="Are you sure?"
        approveValue="Yes"
        notApproveValue="Cancel"
        @approve="cleanZohoLink"
        @close="closeModalClearZohoLink"
        @notApprove="closeModalClearZohoLink"
      )
      .invoicing-details__wrapper(v-if="reportDetailsInfo.hasOwnProperty('vendor')")
        .modal(v-if="isOpenSendToZoho")
          .modal__title Zoho Options
          .modal__item
            .item__title Payment mode
            .item__select
              SelectSingle(
                :options="paymentMode",
                placeholder="Select",
                :selectedOption="selectedPaymentMode",
                @chooseOption="chosePaymentMode"
              )
          .modal__item
            .item__title Paid through
            .item__select
              SelectSingle(
                :options="paidThrough",
                placeholder="Select",
                :selectedOption="selectedPaidThrough ? selectedPaidThrough.name : ''",
                @chooseOption="chosePaidThrough"
              )

          .modal__item
            .item__title Date
            .item__input.datepicker__normalize
              DatePicker(
                :value="new Date(selectedDate)"
                @input="(e) => setDueDate(e)"
                format="DD-MM-YYYY"
                prefix-class="xmx"
                :clearable="false"
                type="date"
                placeholder="Select datetime range"
              )
          .modal__item
            .item__title Bank Charges
            .item__input
              input(v-model="selectedBankCharges")
          .modal__buttons
            Button(
              value="Send"
              @clicked="sendToZoho"
              :isDisabled="!!getRequestCounter"
            )
            Button(
              value="Cancel"
              :outline="true"
              @clicked="closeZohoModal"
              :isDisabled="!!getRequestCounter"
            )
        .options-buttons
          Button(
            v-if="!reportDetailsInfo.zohoBillingId"
            value="Send to Zoho"
            :outline="true"
            @clicked="openZohoModal"
          )
          Button(
            v-else
            value="Clear Zoho link"
            :outline="true"
            @clicked="openModalClearZohoLink"
          )
        .left-side
          .invoicing-details__info
            .info__user
              .user
                .user__image(v-if="reportDetailsInfo.vendor.photo")
                  img(:src="domain + reportDetailsInfo.vendor.photo")
                .user__fakeImage(:style="{'--bgColor': getBgColor(reportDetailsInfo.vendor._id)[0], '--color': getBgColor(reportDetailsInfo.vendor._id)[1]}" v-else) {{ reportDetailsInfo.vendor.firstName[0] }}
                .user__description
                  .user__name
                    router-link(class="link-to" target= '_blank' :to="{path: `/pangea-vendors/all/details/${reportDetailsInfo.vendor._id}`}")
                      span {{reportDetailsInfo.vendor.firstName + ' ' + reportDetailsInfo.vendor.surname}}
                  .user__address {{ reportDetailsInfo.vendor.billingInfo.address || 'No address...' }}

            .info__descriptions
              .text__block
                .text__title Report ID:
                .text__value {{reportDetailsInfo.reportId}}

              .text__block(v-if="reportDetailsInfo.zohoBillingId")
                .text__title Zoho Bill:
                .text__value
                  a( target="_blank" :href="`https://books.zoho.com/app#/bills/${reportDetailsInfo.zohoBillingId}`")
                    span Link

              .text__block
                .text__title Status:
                .text__value
                  .text__edit
                    IconButton(
                      :hasPopup="true"
                      popupText="Rollback"
                      @clicked="toggleForceStatusEdition"
                    )
                      i(class="fas fa-pen" v-if="!isStatusEdit" )
                      i(class="fa-solid fa-xmark" v-else )

                  .text__select(v-if="isStatusEdit")
                    SelectSingle(
                      :selectedOption="forceStatus"
                      :options="['Created']"
                      placeholder="Option"
                      @chooseOption="jumpOrRollbackStatus"
                    )
                  span(v-else) {{reportDetailsInfo.status}}
              .text__block
                .text__title Created On:
                .text__value {{ formattedDate(reportDetailsInfo.createAt) }}
              .text__block
                .text__title Date Range:
                .text__value
                  span {{ formattedDateRange(reportDetailsInfo.firstPaymentDate)}}
                  span /
                  span {{ formattedDateRange(reportDetailsInfo.lastPaymentDate) }}
              .text__block
                .text__title Jobs:
                .text__value {{ reportDetailsInfo.steps.length }}
              .text__block
                .text__title Invoice:
                .text__value
                  IconButton(
                    @clicked="downloadFile(reportDetailsInfo.paymentDetails.file.path)"
                  )
                    i(class="fa-solid fa-download")
                  span.file-name {{ reportDetailsInfo.paymentDetails.file ? reportDetailsInfo.paymentDetails.file.fileName : '' }}
              .text__block(v-if="reportDetailsInfo.paymentDetails && reportDetailsInfo.paymentDetails.paymentMethod")
                .text__title Payment method:
                .text__value
                  IconButton(
                    :hasPopup="true"
                    popupText="Payment Details"
                    @clicked="togglePaymentDetails"
                  )
                    i( v-if="!isShowPaymentDetails" class="fa-solid fa-info")
                    i( v-else class="fa-solid fa-xmark")
                  span {{ reportDetailsInfo.paymentDetails.paymentMethod.name }}
              div(v-if="isShowPaymentDetails" )
                .text__block(v-for="[key, val] in Object.entries(allFieldsOutput(reportDetailsInfo.paymentDetails.paymentMethod))" v-if="key !== 'name'" )
                  .text__title {{ replaceKey(key) }}:
                  .text__value
                    IconButton(
                      @clicked="copyDetailsInfo(val)"
                    )
                      i(class="fa-regular fa-copy")
                    span {{ val }}
              .text__block
                .text__title Expected payment date:
                .text__value {{ formattedDateRange(reportDetailsInfo.paymentDetails.expectedPaymentDate) }}
              .text__block(v-if="reportDetailsInfo.total" )
                .text__title Total Amount:
                .text__value
                  span(style="margin-right: 4px;") {{ +(reportDetailsInfo.total).toFixed(2) }}
                  span(v-html="'&euro;'")

              .outstandingAmount
                .text__block
                  .text__title Outstanding Payables:
                  .text__value
                    span {{ getOutstandingAmount }}
                    span(v-html="'&euro;'")

        .right-side
          .invoicing-details__listOfJobs
            ReportDetailsJobsList(
              :isAvailableDeleting="false"
              :enumOfReports="'vendor'"
              :steps="reportDetailsInfo.steps"
            )
          .invoicing-details__allReports
            .invoicing-details__allReports-table
              .invoicing-details__allReports-table-title Reports
              ReportDetailsVendorReports(
                :reports="vendorOtherReports"
              )

      .cards(v-if="reportDetailsInfo._id && reportDetailsInfo.paymentInformation.length")
        .card(v-for="cardInfo in reportDetailsInfo.paymentInformation")
          PayablesPaymentInformationCard(
            :cardInfo="cardInfo"
            :paymentDetails="reportDetailsInfo.paymentDetails"
          )
</template>

<script>
import GeneralTable from '../GeneralTable'
import moment from "moment"
import ApproveModal from '../ApproveModal'
import Button from "../Button"
import SelectSingle from "../SelectSingle"
import DatepickerWithTime from "../DatepickerWithTime"
import CheckBox from "../CheckBox"
import PayablesPaymentInformationCard from "./PayablesPaymentInformationCard"
import getBgColor from "../../mixins/getBgColor"
import IconButton from "../IconButton"
import ReportDetailsJobsList from "./ReportDetailsJobsList"
import NavbarList from "../NavbarLists"

import DatePicker from 'vue2-datepicker'
import '../../assets/scss/datepicker.scss'
import { mapActions, mapGetters } from "vuex"
import ReportDetailsVendorReports from "./ReportDetailsVendorReports"

export default {
  mixins: [ getBgColor ],
  components: {
    ReportDetailsVendorReports,
    NavbarList,
    ReportDetailsJobsList,
    IconButton,
    Button,
    GeneralTable,
    ApproveModal,
    SelectSingle,
    DatepickerWithTime,
    CheckBox,
    PayablesPaymentInformationCard,
    DatePicker
  },
  data() {
    return {
      isClearZohoLink: false,
      isOpenSendToZoho: false,
      selectedPaymentMode: '',
      selectedPaidThrough: null,
      selectedDate: '',
      selectedBankCharges: 0,
      paidThrough: [],
      paymentMode: [
        'PayPal',
        'Bank Transfer',
        'TransferWise',
        'Skrill',
        'SmartCAT',
        'Credit Card'

        // 'Bank Remittance',
        // 'Cash',
        // 'Cheque',
        // 'Compensation ',
        // 'GoCardless',
        // 'Net Cents',
        // 'Stripe',
      ],
      isStatusEdit: false,
      forceStatus: '',
      isDoubleApproveForceStatus: false,
      shortProjectList: [],

      reportDetailsInfo: {},
      domain: '',
      isShowPaymentDetails: false,
      fields: [
        {
          label: "Project",
          headerKey: "headerStepId",
          key: "project",
          style: { width: "20%" }
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
          style: { width: "14%" }
        },
        {
          label: "Deadline",
          headerKey: "headerBilling",
          key: "deadline",
          style: { width: "12%" }
        },
        {
          label: "Language Pair",
          headerKey: "headerLangPair",
          key: "langPair",
          style: { width: "13%" }
        },
        {
          label: "Status",
          headerKey: "headerStatus",
          key: "status",
          style: { width: "12%" }
        },
        {
          label: "Fee",
          headerKey: "headerPayables",
          key: "payables",
          style: { width: "10%" }
        }
      ],
      vendorOtherReports: []
    }
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle"
    }),
    openModalClearZohoLink() {
      this.isClearZohoLink = true
    },
    closeModalClearZohoLink() {
      this.isClearZohoLink = false
    },
    async cleanZohoLink() {
      await this.$http.delete(`/invoicing-payables/report/${this.$route.params.id}/clear-zoho-link`)
      await this.openDetails(this.$route.params.id)
      this.closeModalClearZohoLink()
    },
    openZohoModal() {
      this.isOpenSendToZoho = true
    },
    closeZohoModal() {
      this.isOpenSendToZoho = false
      this.selectedPaymentMode = ''
      this.selectedPaidThrough = null
      this.selectedDate = ''
    },
    async getPaidThrough() {
      try {
        const rest = await this.$http.get('/zoho/getBankAccounts')
        this.paidThrough = rest.data
            //temp for Julia
            .filter(i =>
                i.name === 'Pangea Translation Services [01]'
                || i.name === 'Paypal'
                || i.name === 'Transfer Wise'
            )
      } catch (e) {
        console.log(e)
        this.alertToggle({ message: e.body, isShow: true, type: "error" })
      }
    },
    chosePaymentMode({ option }) {
      this.selectedPaymentMode = option
    },
    chosePaidThrough({ option }) {
      this.selectedPaidThrough = option
    },
    setDueDate(test) {
      this.selectedDate = moment(test).format("YYYY-MM-DD")
    },
    async sendToZoho() {
      if (!(this.selectedPaymentMode && this.selectedPaidThrough.hasOwnProperty('id') && this.selectedDate && this.selectedBankCharges >= 0)) {
        this.alertToggle({ message: "Fill all field for sending to Zoho", isShow: true, type: "error" })
        return
      }
      try {
        const result = await this.$http.post(`/invoicing-payables/report/${ this.$route.params.id }/sendToZoho`, {
          paidAmount: +(this.reportDetailsInfo.total).toFixed(2),
          paymentMode: this.selectedPaymentMode,
          paidThrough: this.selectedPaidThrough.id,
          bankCharges: this.selectedBankCharges,
          date: this.selectedDate,
          lastPaymentDate: this.reportDetailsInfo.lastPaymentDate,
          vendorEmail: this.reportDetailsInfo.vendor.email,
          reportTextId: this.reportDetailsInfo.reportId,
          dueDate: this.reportDetailsInfo.paymentDetails.expectedPaymentDate,
          reportPath: this.reportDetailsInfo.paymentDetails.file.path,
        })
        this.closeZohoModal()
        await this.openDetails(this.$route.params.id)
        await this.getVendorOtherReports()
        this.alertToggle({ message: result.data.message, isShow: true, type: result.data.type })
      } catch (e) {
        if (e.body) {
          this.alertToggle({ message: e.body, isShow: true, type: "error" })
        } else {
          console.log(e)
          this.alertToggle({ message: "Something went wrong", isShow: true, type: "error" })
        }
      }
    },
    async approveForceStatus() {
      try {
        await this.$http.post('/invoicing-payables/rollback-invoiceReport-from-paid', { reportsIds: [ this.$route.params.id ] })
        await this.$router.push('/pangea-finance/payables-reports/reports/' + this.reportDetailsInfo._id)
      } catch (error) {
        this.alertToggle({ message: "Error on Reports Status Editing", isShow: true, type: "error" })
      } finally {
        this.toggleForceStatusEdition()
      }
    },
    jumpOrRollbackStatus({ option }) {
      this.forceStatus = option
      this.isDoubleApproveForceStatus = true
    },
    toggleForceStatusEdition() {
      this.forceStatus = this.reportDetailsInfo.status
      this.isDoubleApproveForceStatus = false
      this.isStatusEdit = !this.isStatusEdit
    },
    allFieldsOutput(item, result = {}) {
      for (const key in item) {
        if (typeof item[key] === 'object') {
          return this.allFieldsOutput(item[key], result)
        } else {
          result = {
            ...result,
            [key]: item[key]
          }
        }
      }
      delete result._id
      return result
    },
    downloadFile(path) {
      let link = document.createElement('a')
      link.href = this.$domains.admin + '/' + path
      link.target = "_blank"
      link.click()
    },
    replaceKey(key) {
      switch (key) {
        case 'accountName':
          key = 'Account Name'
      }
      return key[0].toUpperCase() + key.substr(1)
    },
    copyDetailsInfo(str) {
      navigator.clipboard.writeText(str.trim())
      this.alertToggle({ message: "Copied!", isShow: true, type: "success" })
    },
    togglePaymentDetails() {
      this.isShowPaymentDetails = !this.isShowPaymentDetails
    },
    formattedDate(date) {
      return moment(date).format('MMM D, HH:mm')
    },
    formattedDateRange(date) {
      return moment(date).format('MMM D')
    },
    async openDetails(id) {
      this.reportDetailsInfo = (await this.$http.post('/invoicing-payables/paid-report/' + id)).data[0]
    },
    async getShortReports() {
      try {
        const shortProjectList = await this.$http.get(`/invoicing-payables/short-paid-report-list`)
        this.shortProjectList = shortProjectList.data.map(i => {
          return {
            _id: i._id,
            item1: i.reportId,
            item2: `${ i.vendor.firstName } ${ i.vendor.surname || '' }`,
            item3: i.status,
            item4: i.total + ' ' + '€'
          }
        })
      } catch (err) {
      }
    },
    async getVendorOtherReports() {
      try {
        this.vendorOtherReports = (await this.$http.get('/invoicing-payables/all-vendor-reports/' + this.reportDetailsInfo.vendor._id)).data
      } catch (e) {
        this.alertToggle({ message: "Error on getting vendor reports", isShow: true, type: "error" })
      }
    }
  },
  computed: {
    ...mapGetters({
      getRequestCounter: 'getRequestCounter'
    }),
    getOutstandingAmount() {
      if (!this.vendorOtherReports.length) return 0
      return +(this.vendorOtherReports
          .filter(i => (i.status === 'Invoice Ready' || i.status === 'Partially Paid')
              && this.reportDetailsInfo.paymentDetails.paymentMethod
              && `${ i.paymentDetails.paymentMethod._id }` === `${ this.reportDetailsInfo.paymentDetails.paymentMethod._id }`
          )
          .reduce((acc, curr) => {
            if (curr.status === 'Partially Paid') {
              return acc += curr.paymentInformation.at(-1).unpaidAmount
            }
            return acc += curr.total
          }, 0)).toFixed(2)
    }
    //Todo: show status "Invoice Received" and "Partially Paid"1
    // getPaymentRemainder() {
    //   const { paymentInformation = [] } = this.reportDetailsInfo
    //   return paymentInformation.reduce((sum, item) => {
    //     sum += +item.paidAmount
    //     return sum
    //   }, 0)
    // },
    // getUnpaidAmount() {
    //   const rawUnpaidAmount = this.getStepsPayables(this.reportDetailsInfo.steps) - (+this.getPaymentRemainder)
    //   return +(parseFloat(rawUnpaidAmount)).toFixed(2)
    // }
  },
  async created() {
    await this.getShortReports()
    await this.openDetails(this.$route.params.id)
    await this.getVendorOtherReports()
    await this.getPaidThrough()
    this.domain = this.$domains.admin
  },
  watch: {
    async $route(to, from) {
      if (to.name === from.name) {
        if (to.params.id !== from.params.id) {
          this.isStatusEdit = false
          this.forceStatus = ''
          this.isDoubleApproveForceStatus = false
          this.reportDetailsInfo = {}
          this.isShowPaymentDetails = false
          this.vendorOtherReports = []
          await this.openDetails(this.$route.params.id)
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../assets/scss/colors";

.options-buttons {
  position: absolute;
  top: -40px;
  display: flex;
  gap: 10px;
}

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

  .outstandingAmount {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid $light-border;
    font-family: 'Myriad600';
  }

  &__allReports {
    &-table {
      padding: 25px;
      background: white;
      border-radius: 2px;
      box-shadow: $box-shadow;
      height: fit-content;
      box-sizing: border-box;
      width: 1020px;
      margin-top: 25px;
      margin-right: 25px;

      &-title {
        font-family: Myriad600;
        font-size: 16px;
        margin-bottom: 10px;
      }
    }
  }


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

.paymentMethodAndFileModal {
  position: absolute;
  z-index: 4;
  padding: 25px;
  background: white;
  box-shadow: $box-shadow;
  top: 50%;
  left: 485px;
  transform: translate(0%, -50%);

  .files-upload-buttons {
    display: flex;
    justify-content: center;
    gap: 20px;
  }

  &__close {
    position: absolute;
    top: 7px;
    right: 7px;
    font-size: 24px;
    cursor: pointer;
    height: 22px;
    width: 22px;
    justify-content: center;
    display: flex;
    align-items: center;
    font-family: Myriad600;
    opacity: 0.8;
    transition: ease 0.2s;

    &:hover {
      opacity: 1
    }
  }

  .files-upload {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 20px;

    &__title {
      width: 120px;
    }

    &__value {
      position: relative;
      width: 220px;
      display: flex;
    }
  }

  .file-name-invoice {
    position: absolute;
    width: 130px;
    top: 10px;
    left: 80px;
    opacity: 0.6;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
}

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
    font-size: 24px;
    cursor: pointer;
    height: 24px;
    width: 24px;
    justify-content: center;
    display: flex;
    align-items: center;
    font-family: Myriad600;
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

.fixed-height {
  height: 30px;
}

.text {
  &__block {
    min-height: 32px;
    display: flex;
    margin-bottom: 6px;
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

.info {
  &__user {
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid $light-border;
  }
}

.file-name {
  position: absolute;
  width: 200px;
  top: 7px;
  left: 40px;
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

.cards {
  width: 100%;
  display: flex;
}

.modal {
  box-shadow: $box-shadow;
  position: absolute;
  top: 0px;
  left: 430px;
  background: white;
  z-index: 20;
  padding: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;

  &__title{
    font-size: 16px;
    font-family: Myriad600;
    margin-bottom: 20px;
  }

  &__item {
    margin-bottom: 15px;
  }

  &__buttons {
    display: flex;
    gap: 15px;
    margin-top: 20px;
  }
}

.item {
  &__title {
    margin-bottom: 3px;
  }

  &__select {
    position: relative;
    height: 32px;
    width: 220px;
  }

  &__input {
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
  }

}

</style>