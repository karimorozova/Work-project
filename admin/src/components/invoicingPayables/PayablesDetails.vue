<template lang="pug">
  .layout
    NavbarList(
      v-if="shortProjectList.length"
      :items="shortProjectList"
      :basicLink="'/pangea-finance/payables-reports/reports/'"
    )
    .invoicing-details
      .options-buttons
        Button(
          v-if='!toggleAddSteps && reportDetailsInfo.status === "Created"'
          value="Send Report"
          :outline="true"
          :isDisabled="!!getRequestCounter"
          @clicked="changeReportStatus"
        )
        Button(
          v-if="!isPaymentCard && (this.reportDetailsInfo.status === 'Invoice Ready' || this.reportDetailsInfo.status === 'Partially Paid')"
          value="Add Payment"
          :outline="true"
          @clicked="openPaymentCard"
          :isDisabled="isRequestNow"
        )

      ValidationErrors(v-if="errors.length" :errors="errors" @closeErrors="closeErrors" isAbsolute)

      .paymentMethodAndFileModal(v-if="isShowUploadInvoice" )
        //.paymentMethodAndFileModal__close(@click="closeUploadModal") &#215;
        .files-upload
          .files-upload__title Invoice File:
          .files-upload__value
            UploadFileButton
              input.file-input(type="file" @change='uploadFile')
            .file-name-invoice(v-if="invoiceFile") {{ invoiceFile.name }}
        .files-upload
          .files-upload__title Payment Method:
          .files-upload__value
            .drop
              SelectSingle(
                :selectedOption="paymentMethod.name || ''"
                :options="reportDetailsInfo.vendor.billingInfo.paymentMethods.length ? reportDetailsInfo.vendor.billingInfo.paymentMethods.map(i => i.name) : []"
                placeholder="Option"
                @chooseOption="setPaymentMethod"
              )
        .files-upload-buttons
          Button(value="Submit" :isDisabled="!!getRequestCounter" @clicked="confirmInvoiceUploading")
          Button(value="Cancel" :isDisabled="!!getRequestCounter" :outline="true" @clicked="closeUploadModal")

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

      PaymentCard(v-if="isPaymentCard" :paymentMethods="paymentMethodsLists" :unpaidAmount="getUnpaidAmount" @reportToPayment="reportToPayment" @closePaymentCard="closePaymentCard" )

      .invoicing-details__wrapper(v-if="reportDetailsInfo.hasOwnProperty('vendor')")
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

              .text__block.fixed-height
                .text__title Status:
                .text__value
                  .text__edit(v-if="reportDetailsInfo.status !== 'Partially Paid'" )
                    IconButton(
                      :hasPopup="true"
                      popupText="Rollback & Jump"
                      @clicked="toggleForceStatusEdition"
                    )
                      i(class="fas fa-pen" v-if="!isStatusEdit" )
                      i(class="fa-solid fa-xmark" v-else )
                  .text__select(v-if="isStatusEdit")
                    SelectSingle(
                      :selectedOption="forceStatus"
                      :options="statuses"
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

              .text__block(v-if="reportDetailsInfo.paymentDetails.file")
                .text__title Invoice:
                .text__value
                  IconButton(
                    @clicked="downloadFile(reportDetailsInfo.paymentDetails.file.path)"
                  )
                    i(class="fa-solid fa-download")
                  span.file-name {{ reportDetailsInfo.paymentDetails.file.fileName }}

              .text__block(v-if="reportDetailsInfo.paymentDetails && reportDetailsInfo.paymentDetails.paymentMethod")
                .text__title Payment method:
                .text__value
                  IconButton(
                    :hasPopup="true"
                    :popupText="'Payment Details'"
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
                .text__value(v-if="reportDetailsInfo.paymentDetails.expectedPaymentDate" ) {{ formattedDateRange(reportDetailsInfo.paymentDetails.expectedPaymentDate) }}
                .text__value(v-else) -

              .text__block
                .text__title Total Amount:
                .text__value
                  span {{ +(reportDetailsInfo.total).toFixed(2) }}
                  span(v-html="'&euro;'")

              .outstandingAmount
                .text__block
                  .text__title Outstanding Payables:
                  .text__value
                    span {{ getOutstandingAmount }}
                    span(v-html="'&euro;'")

        .right-side
          .invoicing-details__infoJobs
            .invoicing-details__listOfJobs
              ReportDetailsJobsList(
                :isAvailableDeleting="reportDetailsInfo.status === 'Created' || reportDetailsInfo.status === 'Sent'"
                :enumOfReports="'vendor'"
                :steps="reportDetailsInfo.steps"
                @deleteStep="deleteStep"
              )
              Add(
                v-if="!toggleAddSteps && (reportDetailsInfo.status === 'Created' || reportDetailsInfo.status === 'Sent')"
                @add="changeToggleAddSteps"
              )
            .invoicing-details__allReports
              .invoicing-details__allReports-table
                .invoicing-details__allReports-table-title Reports
                ReportDetailsVendorReports(
                  :reports="vendorOtherReports"
                )

      .available-jobs(v-if="toggleAddSteps")
        PayablesAddStepsTo(
          :steps="steps"
          :invoicingEditId="reportDetailsInfo._id"
          @refreshReports="refreshReports"
          @closeTable="changeToggleAddSteps"
          @toggleAll="toggleAllSteps"
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
import PayablesAddStepsTo from "./PayablesAddStepsTo"
import ApproveModal from '../ApproveModal'
import Button from "../Button"
import SelectSingle from "../SelectSingle"
import DatepickerWithTime from "../DatepickerWithTime"
import CheckBox from "../CheckBox"
import PayablesPaymentInformationCard from "./PayablesPaymentInformationCard"
import { mapActions, mapGetters } from "vuex"
import getBgColor from "../../mixins/getBgColor"
import DatePicker from 'vue2-datepicker'
import '../../assets/scss/datepicker.scss'
import IconButton from "../IconButton"
import UploadFileButton from "../UploadFileButton"
import ValidationErrors from "../ValidationErrors"
import ReportDetailsJobsList from "./ReportDetailsJobsList"
import Add from "../Add"
import NavbarList from "../NavbarLists"
import ReportDetailsVendorReports from "./ReportDetailsVendorReports"
import PaymentCard from "../PaymentCard"

export default {
  name: "InvoicingDetails",
  mixins: [ getBgColor ],
  components: {
    ReportDetailsVendorReports,
    NavbarList,
    Add,
    ReportDetailsJobsList,
    ValidationErrors,
    UploadFileButton,
    Button,
    GeneralTable,
    PayablesAddStepsTo,
    ApproveModal,
    SelectSingle,
    DatepickerWithTime,
    CheckBox,
    PayablesPaymentInformationCard,
    DatePicker,
    IconButton,
    PaymentCard
  },
  data() {
    return {
      isStatusEdit: false,
      isPaymentCard: false,
      domain: '',
      reportDetailsInfo: {},
      isRequestNow: false,
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
          label: "Deadline",
          headerKey: "headerBilling",
          key: "deadline",
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
      isDeletingStep: false,
      steps: [],
      amount: 0,
      notes: '',
      shortProjectList: [],
      paymentDate: new Date(),
      errors: [],
      invoiceFile: null,
      paymentMethod: {},
      forceStatus: '',
      isShowPaymentDetails: false,
      isShowUploadInvoice: false,
      isDoubleApproveForceStatus: false,
      vendorOtherReports: []
    }
  },
  methods: {
    ...mapActions([ 'alertToggle' ]),
    toggleAllSteps(bool) {
      this.steps = this.steps.map(i => ({ ...i, isCheck: bool }))
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
    async approveForceStatus() {
      this.isDoubleApproveForceStatus = false
      if (this.forceStatus === 'Invoice Ready / Invoice on-hold') {
        const fileData = new FormData()
        fileData.append("invoiceFile", this.invoiceFile)
        fileData.append("reportId", this.$route.params.id)
        fileData.append("vendorId", this.reportDetailsInfo.vendor._id)
        fileData.append("paymentMethod", JSON.stringify(this.paymentMethod))
        try {
          await this.$http.post('/invoicing-payables/invoice-submission', fileData)
          await this.refreshReports()
        } catch (err) {
          this.alertToggle({ message: "Error on Reports Status Editing", isShow: true, type: "error" })
        } finally {
          this.toggleForceStatusEdition()
        }
      } else if (this.forceStatus === 'Paid') {
        try {
          const data = {
            paidAmount: this.getUnpaidAmount,
            unpaidAmount: 0,
            paymentMethod: this.reportDetailsInfo.paymentDetails.paymentMethod,
            paymentDate: new Date(),
            vendorEmail: this.reportDetailsInfo.vendor.email,
            reportTextId: this.reportDetailsInfo.reportId,
            dueDate: this.reportDetailsInfo.paymentDetails.expectedPaymentDate,
            notes: this.notes
          }
          const res = (await (this.$http.post(`/invoicing-payables/report-final-status/${ this.reportDetailsInfo._id }`, data))).data
          if (res === "Moved") await this.$router.push('/pangea-finance/payables-reports/paid-reports/' + this.reportDetailsInfo._id)
          else await this.refreshReports()
        } catch (err) {
          this.alertToggle({ message: "Error on Reports Status Editing", isShow: true, type: "error" })
        } finally {
          this.toggleForceStatusEdition()
        }
      } else {
        try {
          await this.$http.post('/invoicing-payables/manage-report-status', { reportsIds: [ this.$route.params.id ], nextStatus: this.forceStatus })
          await this.refreshReports()
        } catch (error) {
          this.alertToggle({ message: "Error on Reports Status Editing", isShow: true, type: "error" })
        } finally {
          this.toggleForceStatusEdition()
        }
      }
    },
    closeErrors() {
      this.errors = []
    },
    confirmInvoiceUploading() {
      this.errors = []
      if (!this.invoiceFile) this.errors.push('Please upload invoice file')
      if (!this.paymentMethod.name) this.errors.push('Please set payment method')
      if (this.errors.length) return
      this.approveForceStatus()
    },
    closeUploadModal() {
      this.paymentMethod = {}
      this.isShowUploadInvoice = false
      this.clearInvoiceFileInput()
      this.invoiceFile = null
      this.isStatusEdit = false
    },
    uploadFile(e) {
      const files = e.target.files
      const filteredFiles = Array.from(files).filter(item => item.size / 1000000 <= 40)
      if (filteredFiles.length) {
        this.invoiceFile = files[0]
      }
      if (!filteredFiles.length) this.clearInvoiceFileInput()
    },
    clearInvoiceFileInput() {
      let inputFiles = document.querySelectorAll(".file-input")
      for (let elem of inputFiles) {
        elem.value = ''
      }
    },
    jumpOrRollbackStatus({ option }) {
      if (option === 'Invoice Ready / Invoice on-hold') {
        this.isShowUploadInvoice = true
        this.forceStatus = option
        return
      }
      this.forceStatus = option
      this.isDoubleApproveForceStatus = true
    },
    toggleForceStatusEdition() {
      this.isDoubleApproveForceStatus = false
      if (this.isStatusEdit) {
        this.closeUploadModal()
        this.forceStatus = ''
        return
      }
      this.forceStatus = this.reportDetailsInfo.status
      this.isStatusEdit = !this.isStatusEdit
      this.clearInvoiceFileInput()
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
    openPaymentCard() {
      this.isPaymentCard = true
      this.paymentDate = new Date()
      this.amount = this.getUnpaidAmount
      this.paymentMethod = this.reportDetailsInfo.paymentDetails.paymentMethod
    },
    closePaymentCard() {
      this.isPaymentCard = false
      this.isNotes = false
      this.notes = ''
      this.paymentMethod = {}
      this.amount = 0
    },
    downloadFile(path) {
      let link = document.createElement('a')
      link.href = this.$domains.admin + '/' + path
      link.target = "_blank"
      link.click()
    },
    customFormatter(date) {
      return moment(date).format('DD-MM-YYYY, HH:mm')
    },
    async reportToPayment({paymentAmount,paymentMethod, paymentDate, notes}) {
      this.isRequestNow = true
      const amount = +(parseFloat(paymentAmount)).toFixed(2)
      const data = {
        paidAmount: amount,
        unpaidAmount: +(this.getUnpaidAmount - amount).toFixed(2),
        paymentMethod: paymentMethod,
        paymentDate: paymentDate,
        notes: notes,
        vendorEmail: this.reportDetailsInfo.vendor.email,
        reportTextId: this.reportDetailsInfo.reportId,
        dueDate: this.reportDetailsInfo.paymentDetails.expectedPaymentDate
      }
      this.closePaymentCard()
      const res = (await (this.$http.post(`/invoicing-payables/report-final-status/${ this.reportDetailsInfo._id }`, data))).data
      if (res === "Moved") {
        await this.$router.push('/pangea-finance/payables-reports/paid-reports/' + this.reportDetailsInfo._id)
      } else {
        await this.refreshReports()
      }
      this.isRequestNow = false
    },
    formattedDate(date) {
      return moment(date).format('MMM D, HH:mm')
    },
    formattedDateRange(date) {
      return moment(date).format('MMM D')
    },
    async refreshReports() {
      await this.getShortReports()
      await this.openDetails(this.$route.params.id)
      await this.getSteps()
      await this.getVendorOtherReports()
    },
    changeToggleAddSteps() {
      this.toggleAddSteps = !this.toggleAddSteps
      if (this.toggleAddSteps) {
        this.getSteps()
      }
    },
    async changeReportStatus() {
      try {
        await this.$http.post('/invoicing-payables/manage-report-status', {
          reportsIds: [ this.$route.params.id ],
          nextStatus: 'Sent'
        })
        await this.refreshReports()
      } catch (error) {
        this.alertToggle({ message: "Error on Reports sending", isShow: true, type: "error" })
      }
    },
    async deleteStep(data) {
      const { reportId, stepsId } = data
      await this.$http.post(`/invoicing-payables/report/${ reportId }/delete`, {
        stepsId
      })
      await this.refreshReports()
    },
    async openDetails(id) {
      try {
        this.reportDetailsInfo = (await this.$http.post('/invoicing-payables/report/' + id)).data[0]
      } catch (e) {
        this.alertToggle({ message: "Error on getting details", isShow: true, type: "error" })
      }
    },
    async getVendorOtherReports() {
      try {
        this.vendorOtherReports = (await this.$http.get('/invoicing-payables/all-vendor-reports/' + this.reportDetailsInfo.vendor._id)).data
      } catch (e) {
        this.alertToggle({ message: "Error on getting vendor reports", isShow: true, type: "error" })
      }
    },
    async getSteps() {
      this.steps = (await this.$http.post('/invoicing-payables/not-selected-steps-list/' + this.reportDetailsInfo.vendor._id)).data.map(i => ({ ...i, isCheck: false }))
    },
    async getShortReports() {
      try {
        const shortProjectList = await this.$http.get(`/invoicing-payables/short-report-list`)
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
    }
  },
  computed: {
    ...mapGetters({
      getRequestCounter: 'getRequestCounter'
    }),
    paymentMethodsLists() {
      return this.reportDetailsInfo.vendor.billingInfo.paymentMethods || []
    },
    statuses() {
      const currentStatus = this.reportDetailsInfo.status
      let statuses = []

      switch (currentStatus) {
        case 'Created':
          statuses = [ 'Sent', 'Approved', 'Invoice Ready / Invoice on-hold' ]
          break
        case 'Sent':
          statuses = [ 'Created', 'Approved', 'Invoice Ready / Invoice on-hold' ]
          break
        case 'Approved':
          statuses = [ 'Created', 'Sent', 'Invoice Ready / Invoice on-hold' ]
          break
        case 'Invoice Ready':
          statuses = [ 'Created', 'Sent', 'Approved', 'Paid' ]
          break
        case 'Invoice on-hold':
          statuses = [ 'Created', 'Sent', 'Approved' ]
          break
      }
      return statuses
    },

    //Todo: show status "Invoice Received" and "Partially Paid"1
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
    getOutstandingAmount() {
      if (!this.vendorOtherReports.length && this.reportDetailsInfo._id) return 0
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
  },
  async created() {
    await this.getShortReports()
    await this.openDetails(this.$route.params.id)
    await this.getVendorOtherReports()
    // TODO Zoho (soon)
    // await this.updatePayableStateFromZoho(this.$route.params.id)
    //
    this.domain = this.$domains.admin
  },
  watch: {
    async $route(to, from) {
      if (to.name === from.name) {
        if (to.params.id !== from.params.id) {
          this.reportDetailsInfo = {}
          this.isStatusEdit = false
          this.isNotes = false
          this.isPaymentCard = false
          this.toggleAddSteps = false
          this.isDeletingStep = false
          this.steps = []
          this.paymentMethod = {}
          this.amount = 0
          this.notes = ''
          this.errors = []
          this.invoiceFile = null
          this.forceStatus = ''
          this.isShowPaymentDetails = false
          this.isShowUploadInvoice = false
          this.isDoubleApproveForceStatus = false
          this.vendorOtherReports = []
          await this.openDetails(this.$route.params.id)
          await this.getVendorOtherReports()
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

  &__wrapper {
    display: flex;
    gap: 25px;
  }

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
</style>