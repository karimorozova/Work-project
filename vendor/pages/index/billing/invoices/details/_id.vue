<template lang="pug">
  .container
    ValidationErrors(
      v-if="errors.length"
      :errors="errors"
      :isAbsolute="true"
      @closeErrors="errors = []"
    )
    .report(v-if="reportDetailsInfo.hasOwnProperty('vendor') && vendor._id" )
      .body
        .body__details
          .details__user
            .user
              .user__image(v-if="reportDetailsInfo.vendor.photo")
                img(:src="domain + reportDetailsInfo.vendor.photo")
              .user__fakeImage(:style="{'--bgColor': getBgColor(reportDetailsInfo.vendor._id)[0], '--color': getBgColor(reportDetailsInfo.vendor._id)[1]}" v-else) {{ reportDetailsInfo.vendor.firstName[0] }}
              .user__description
                .user__name {{reportDetailsInfo.vendor.firstName + ' ' + reportDetailsInfo.vendor.surname}}
                .user__address {{ reportDetailsInfo.vendor.billingInfo.address || 'No address...' }}
          .details__info
            .row
              .row__title Report Id:
              .row__value {{ reportDetailsInfo.reportId }}
            .row
              .row__title Status:
              .row__value {{ reportDetailsInfo.status }}
            .row
              .row__title Created on:
              .row__value(v-if="reportDetailsInfo.createAt") {{ formattedDate(reportDetailsInfo.createAt) }}
            .row
              .row__title Date range:
              .row__value(v-if="reportDetailsInfo.firstPaymentDate") {{ formattedDateRange(reportDetailsInfo.firstPaymentDate) + ' / ' + formattedDateRange(reportDetailsInfo.lastPaymentDate)  }}
            .row
              .row__title Jobs:
              .row__value(v-if="reportDetailsInfo.steps") {{ reportDetailsInfo.steps.length}}
            .row
              .row__title Total amount:
              .row__value(v-if="reportDetailsInfo.steps")
                span(style="margin-right: 4px;") {{ getStepsPayables(reportDetailsInfo.steps).toFixed(2) }}
                span(v-html="'&euro;'")


          // Invoice ==>>
          .body__invoiceReceived(v-if="reportDetailsInfo.status === 'Invoice Ready' || reportDetailsInfo.status === 'Invoice on-hold'")
            .row
              .row__title Invoice:
              .row__value2
                input.file-button(type="file" :disabled="isPaymentMethodChanging" @change="uploadFile" )
                .file-fake-button(:class="{'file-button-disabled': isPaymentMethodChanging}")
                  i(class="fa-solid fa-upload")

                .file-fake-button(style="cursor: pointer" @click="downloadFile(reportDetailsInfo.paymentDetails.file.path)")
                  i(class="fa-solid fa-download")

                span.file-name2(v-if="invoiceFile") {{ invoiceFile.name }}
                span.file-name2(v-else) {{ reportDetailsInfo.paymentDetails.file.fileName }}

            .row
              .row__title Payment Method:
              .row__valueDrops
                SelectSingle(
                  :isDisabled="!!invoiceFile"
                  :options="vendorExtra.billingInfo.paymentMethods",
                  placeholder="Option",
                  :selectedOption="reportDetailsInfo.paymentDetails.paymentMethod.name",
                  @chooseOption="resetPaymentMethod"
                )
            .row
              .row__title Expected payment date:
              .row__value {{formattedDate(reportDetailsInfo.paymentDetails.expectedPaymentDate)}}

            .row
              .submission-alert.center(v-if="isSubmissionAlert" ) {{submissionAlertMessage}}
                Button.center(style="margin-top: 20px; display: flex; justify-content: center;" value="Send New Invoice File" @clicked="reSubmitPaymentMethod")

            Button(v-if="invoiceFile" style="margin-top: 20px; display: flex; justify-content: center;" value="Send New Invoice File" @clicked="submitFile")
          // <<== Invoice


          .body__invoiceReceived(v-if="reportDetailsInfo.status === 'Partially Paid'")
            //.row
            //  .row__title Invoice:
            //  .row__value2(v-if="reportDetailsInfo.status === 'Invoice Received'" )
            //    input.file-button(type="file" @change="uploadFile")
            //    .file-fake-button
            //      i(class="fa-solid fa-upload")
            //
            //    .file-fake-button(style="cursor: pointer" @click="downloadFile(reportDetailsInfo.paymentDetails.file.path)")
            //      i(class="fa-solid fa-download")
            //
            //    span.file-name2(v-if="invoiceFile") {{ invoiceFile.name }}
            //    span.file-name2(v-else) {{ reportDetailsInfo.paymentDetails.file.fileName }}
            //  .row__value2(v-else)
            //    .file-fake-button(style="cursor: pointer" @click="downloadFile(reportDetailsInfo.paymentDetails.file.path)")
            //      i(class="fa-solid fa-download")
            //    span.file-name {{ reportDetailsInfo.paymentDetails.file.fileName }}
            //
            //.row
            //  .row__title Payment Method:
            //  .row__value {{ reportDetailsInfo.paymentDetails.paymentMethod.name }}
            //.row
            //  .row__title Expected payment date:
            //  .row__value {{formattedDate(reportDetailsInfo.paymentDetails.expectedPaymentDate)}}
            //
            //Button(v-if="invoiceFile" style="margin-top: 20px; display: flex; justify-content: center;" value="Send New Invoice" @clicked="submitFile")

          .body__approve(v-if="reportDetailsInfo.status === 'Sent'")
            Button.button-center( value="Approve report" @clicked="approveReport" )

          .body__submission(v-if="reportDetailsInfo.status === 'Approved'")
            .row(v-if="isVendorHavePaymentMethod")
              .row__title Upload invoice:
              .row__value
                input.file-button(type="file" @change="uploadFile")
                .file-fake-button
                  i(class="fas fa-upload")
                .file-name(v-if="invoiceFile") {{ invoiceFile.name }}
            .row(v-if="isVendorHavePaymentMethod")
              .row__title Payment method:
              .row__valueDrops
                SelectSingle(
                  :options="vendorExtra.billingInfo.paymentMethods",
                  placeholder="Option",
                  :selectedOption="reportDetailsInfo.paymentDetails.paymentMethod ? reportDetailsInfo.paymentDetails.paymentMethod.name : ''",
                  @chooseOption="setPaymentMethod"
                )
            .row.center(v-if="isVendorDontHaveBI")
              span To be able to submit your invoice, you must first enter your billing information and payment method. Click on the button below to start.
            .bill-button(v-if="isVendorDontHaveBI")
              router-link(v-bind:to="'/billing/billing-information'")
                Button(value="Billing & Payment Info")
            div(v-else)
              .submission-alert.center(v-if="isSubmissionAlert" ) {{submissionAlertMessage}}

              Button(:isDisabled="isRequestNow" v-if="!isVendorDontHaveBI" style="margin-top: 25px; display: flex; justify-content: center;" value="Submit" @clicked="submitReport")

        .body__table
          GeneralTable(
            :fields="fields",
            :tableData="reportDetailsInfo.steps",
            :isFilterShow="false"
            :isFilterAbsolute="false"
          )

            template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
              .table__header {{ field.label }}

            template(slot="stepId" slot-scope="{ row, index }")
              .table__data
                div {{ row.stepId }}
                .short {{ row.projectName }}

            template(slot="service" slot-scope="{ row, index }")
              .table__data {{ row.stepAndUnit.step.title }}

            template(slot="langPair" slot-scope="{ row, index }")
              .table__data {{ row.sourceLanguage}}
                span(style="font-size: 12px;color: #999999; margin: 0 4px;")
                  i(class="fas fa-angle-double-right")
                | {{ row.targetLanguage }}

            template(slot="deadline" slot-scope="{ row, index }")
              .table__data {{ formattedDate(row.deadline) }}

            template(slot="payables" slot-scope="{ row, index }")
              .table__data
                span.currency(v-html="'&euro;'")
                span {{ +(row.nativeFinance.Price.payables).toFixed(2) }}

    .payments
      .cards(v-if="reportDetailsInfo && reportDetailsInfo.paymentInformation && reportDetailsInfo.paymentInformation.length")
        .card(v-for="cardInfo in reportDetailsInfo.paymentInformation")
          PaymentInformationCard(
            :cardInfo="cardInfo"
            :paymentDetails="reportDetailsInfo.paymentDetails"
          )
</template>

<script>

import { mapActions, mapGetters } from "vuex"
import GeneralTable from "../../../../../components/general/GeneralTable"
import moment from 'moment'
import Button from "../../../../../components/general/Button"
import SelectSingle from "../../../../../components/general/SelectSingle"
import ValidationErrors from "../../../../../components/general/ValidationErrors"
import getBgColor from "../../../../../mixins/getBgColor"
import PaymentInformationCard from "../../../../../components/sub-components/PaymentInformationCard"

export default {
  mixins: [ getBgColor ],
  components: { PaymentInformationCard, ValidationErrors, SelectSingle, Button, GeneralTable },
  data() {
    return {
      isSubmissionAlert: false,
      submissionAlertMessage: '',

      isPaymentMethodChanging: false,
      isRequestNow: false,
      domain: '',
      invoiceFile: null,
      errors: [],
      reportDetailsInfo: {},
      reports: [],
      vendorExtra: null,
      fields: [
        {
          label: "Step ID",
          headerKey: "headerStepId",
          key: "stepId",
          style: { width: "35%" }
        },
        {
          label: "Step",
          headerKey: "headerService",
          key: "service",
          style: { width: "18%" }
        },
        {
          label: "Deadline",
          headerKey: "headerBilling",
          key: "deadline",
          style: { width: "17%" }
        },
        {
          label: "Language Pair",
          headerKey: "headerLangPair",
          key: "langPair",
          style: { width: "19%" }
        },
        {
          label: "Fee ",
          headerKey: "headerPayables",
          key: "payables",
          style: { width: "11%" }
        }
      ]
    }
  },
  methods: {
    ...mapActions([ 'alertToggle' ]),
    downloadFile(href) {
      let link = document.createElement('a')
      link.href = this.domain + href
      link.target = "_blank"
      link.click()
    },
    uploadFile(e) {
      const files = e.target.files
      const filteredFiles = Array.from(files).filter(item => item.size / 1000000 <= 40)
      if (filteredFiles.length) {
        this.invoiceFile = files[0]
      }
      if (!filteredFiles.length) this.clearInputFiles(".file-button")
    },
    clearInputFiles(str) {
      let inputFiles = document.querySelectorAll(str)
      for (let elem of inputFiles) {
        elem.value = ''
      }
    },
    async resetPaymentMethod({ option }) {
      await this.getReport()
      if (this.reportDetailsInfo.paymentDetails.paymentMethod.name === option.name) {
        this.clearResetsPaymentMethod()
        return
      }
      const paymentMethod = option
      this.isPaymentMethodChanging = true
      this.submissionAlertMessage = ''
      this.isSubmissionAlert = true

      this.mutatePaymentMethod(paymentMethod)
    },
    clearResetsPaymentMethod() {
      this.isPaymentMethodChanging = false
      this.submissionAlertMessage = ''
      this.isSubmissionAlert = false
    },
    setPaymentMethod({ option }) {
      const paymentMethod = option

      const { status, totalPrice } = this.reportDetailsInfo
      const isOnHoldStatusOne = status === 'Approved'
          && totalPrice < paymentMethod.minimumAmount

      switch (true) {
        case isOnHoldStatusOne: {
          this.submissionAlertMessage = ''
          this.isSubmissionAlert = true
          break
        }
      }
      this.mutatePaymentMethod(paymentMethod)
    },
    mutatePaymentMethod(paymentMethod) {
      this.reportDetailsInfo = Object.assign({}, this.reportDetailsInfo, {
        ...this.reportDetailsInfo,
        paymentDetails: {
          ...this.reportDetailsInfo.paymentDetails,
          paymentMethod
        }
      })
    },
    async submitFile() {
      const fileData = new FormData()
      fileData.append("invoiceFile", this.invoiceFile)
      fileData.append("reportId", this.$route.params.id)
      fileData.append("oldPath", this.reportDetailsInfo.paymentDetails.file.path)
      try {
        await this.$axios.post(`/vendor/invoice-reload`, fileData)
        this.clearInputFiles(".file-button")
        this.invoiceFile = null
        await this.getReport()
        this.alertToggle({ message: "Invoice reloaded!", isShow: true, type: "success" })
      } catch (err) {
        console.log(err)
      }
    },
    async reSubmitPaymentMethod() {
      this.isRequestNow = true
      try {
        await this.$axios.post(`/vendor/invoice-paymentMethod-resubmission`, {
          reportId: this.$route.params.id,
          vendorId: this.vendor._id,
          paymentMethod: this.reportDetailsInfo.paymentDetails.paymentMethod
        })
        this.clearResetsPaymentMethod()
        await this.getReport()
      } catch (err) {
        this.alertToggle({ message: "Error sending invoice, please try again later", isShow: true, type: "error" })
      } finally {
        this.isRequestNow = false
      }
    },
    async submitReport() {
      this.errors = []
      if (!this.invoiceFile) this.errors.push('Please upload invoice file')
      if (!this.reportDetailsInfo.paymentDetails.paymentMethod) this.errors.push('Please set payment method')
      if (this.errors.length) return
      this.isRequestNow = true

      const fileData = new FormData()
      fileData.append("invoiceFile", this.invoiceFile)
      fileData.append("reportId", this.$route.params.id)
      fileData.append("vendorId", this.vendor._id)
      fileData.append("paymentMethod", JSON.stringify(this.reportDetailsInfo.paymentDetails.paymentMethod))
      try {
        await this.$axios.post(`/vendor/invoice-submission`, fileData)
        this.clearInputFiles(".file-button")
        this.invoiceFile = null
        await this.getReport()
      } catch (err) {
        this.alertToggle({ message: "Error sending invoice, please try again later", isShow: true, type: "error" })
      } finally {
        this.isRequestNow = false
      }
    },
    async approveReport() {
      try {
        const result = await this.$axios.post(`/vendor/approve-report`, { nextStatus: 'Approved', reportsIds: [ this.reportDetailsInfo._id.toString() ] })
        const decode = window.atob(result.data)
        const data = JSON.parse(decode)
        await this.getReport(data)
      } catch (err) {
      }
    },
    formattedDate(date) {
      return moment(date).format('MMM D, HH:mm')
    },
    formattedDateRange(date) {
      return moment(date).format('MMM D')
    },
    getStepsPayables(steps) {
      return steps.reduce((sum, finance) => {
        sum += finance.nativeFinance.Price.payables || 0
        return sum
      }, 0)
    },
    async getReport() {
      try {
        const result = await this.$axios.get(`/vendor/get-report?reportId=${ this.$route.params.id }`)
        const decode = window.atob(result.data)
        this.reportDetailsInfo = JSON.parse(decode)[0]
        console.log(this.reportDetailsInfo)
      } catch (e) {
      }
    },
    async getVendorReports() {
      try {
        const result = await this.$axios.get(`/vendor/reports?token=${ this.$store.state.token }`)
        const decode = window.atob(result.data)
        this.reports = JSON.parse(decode)
      } catch (err) {
      }
    },
    async getVendorExtra() {
      try {
        const result = await this.$axios.get(`/vendor/portal-vendor-extra-info?token=${ this.$store.state.token }`)
        this.vendorExtra = result.data
      } catch (err) {
      }
    }
  },
  async created() {
    await this.getVendorExtra()
    await this.getVendorReports()
    await this.getReport()
    this.domain = process.env.domain
  },
  mounted() {
    this.domain = process.env.domain
  },
  computed: {
    ...mapGetters({
      vendor: "getVendor"
    }),
    isVendorDontHaveBI() {
      return !this.vendorExtra.hasOwnProperty('billingInfo') || !this.vendorExtra.billingInfo.paymentMethods.length
    },
    isVendorHavePaymentMethod() {
      return this.vendorExtra.hasOwnProperty('billingInfo') && this.vendorExtra.billingInfo.paymentMethods.length
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../../../../assets/scss/colors";

.bill-button {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.center {
  text-align: center;
}

.submission-alert {
  margin-top: 20px;
  width: 100%;
}

.cards {
  display: flex;
  width: 1200px;
  flex-wrap: wrap;
}

.details {
  &__user {
    width: 370px;
    background: $light-background;
    box-sizing: border-box;
    padding: 25px;
    border-radius: 4px;
    border-bottom: 1px solid $light-border;
    margin-bottom: 15px;
  }

  &__info {
    width: 370px;
    background: $light-background;
    box-sizing: border-box;
    padding: 25px;
    border-radius: 4px;
    border-bottom: 1px solid $light-border;
  }
}

.file-name {
  position: absolute;
  width: 170px;
  top: 7px;
  left: 50px;
  opacity: 0.6;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.file-name2 {
  position: absolute;
  width: 130px;
  top: 7px;
  left: 95px;
  opacity: 0.6;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.file-fake-button {
  height: 30px;
  width: 38px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  border: 1px solid $border;
  box-sizing: border-box;
}

.file-button {
  left: 0px;
  top: -6px;
  width: 38px;
  height: 36px;
  border: none;
  outline: none;
  opacity: 0;
  z-index: 2;
  position: absolute;
  cursor: pointer;
  font-size: 0;
}

.row {
  display: flex;
  margin-bottom: 12px;
  align-items: center;

  &:last-child {
    margin-bottom: 0px;
  }

  &__title {
    width: 130px;
    color: $dark-border;
    margin-right: 20px;
  }

  &__valueDrops {
    height: 32px;
    width: 220px;
    position: relative;
  }

  &__value {
    width: 170px;
    position: relative;
  }

  &__value2 {
    position: relative;
    display: flex;
    gap: 10px;
  }
}

.body {
  display: flex;
  justify-content: space-between;

  &__invoiceReceived {
    margin-top: 25px;
    padding-top: 25px;
    border-top: 1px solid $border;
  }

  &__submission {
    margin-top: 25px;
    padding-top: 25px;
    border-top: 1px solid $border;
  }

  &__approve {
    //display: flex;
    //justify-content: center;
    margin-top: 20px;

    .button-center {
      text-align: center;
    }
  }

  &__details {
    width: 370px;
  }

  &__table {
    width: 750px;
  }
}

.container {
  position: relative;
  width: fit-content;
}

.report {
  box-shadow: $box-shadow;
  padding: 25px;
  border-radius: 4px;
  width: 1200px;
  box-sizing: border-box;
  background-color: white;

}

.table {
  &__header {
    padding: 0 0 0 7px;
  }

  &__icon {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  &__data {
    padding: 0 7px;
  }
}

.currency {
  margin-right: 4px;
  color: $dark-border;
}

.user {
  display: flex;
  gap: 20px;

  &__address {
    color: $dark-border;
    font-family: 'Roboto300';
    letter-spacing: 0.2px;
  }

  &__name {
    font-family: Roboto600;
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

.short {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 190px;
  opacity: .3;
}

.download-icon {
  cursor: pointer;
  font-size: 16px;
  margin-right: 10px;
}

.file-button-disabled {
  background: #F8F8F8;
  cursor: default !important;
}
</style>