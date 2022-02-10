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
              .row__value(v-if="reportDetailsInfo.firstPaymentDate") {{ formattedDate(reportDetailsInfo.createdAt) }}
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

          .body__invoiceReceived(v-if="reportDetailsInfo.status === 'Invoice Received' || reportDetailsInfo.status === 'Partially Paid'")
            .row
              .row__title Invoice:
              .row__value2(v-if="reportDetailsInfo.status === 'Invoice Received'" )
                input.file-button(type="file" @change="uploadFile")
                .file-fake-button
                  i(class="fa-solid fa-upload")

                .file-fake-button(style="cursor: pointer" @click="downloadFile(reportDetailsInfo.paymentDetails.file.path)")
                  i(class="fa-solid fa-download")

                span.file-name2(v-if="invoiceFile") {{ invoiceFile.name }}
                span.file-name2(v-else) {{ reportDetailsInfo.paymentDetails.file.fileName }}
              .row__value2(v-else)
                .file-fake-button(style="cursor: pointer" @click="downloadFile(reportDetailsInfo.paymentDetails.file.path)")
                  i(class="fa-solid fa-download")
                span.file-name {{ reportDetailsInfo.paymentDetails.file.fileName }}

            .row
              .row__title Payment Method:
              .row__value {{ reportDetailsInfo.paymentDetails.paymentMethod.name }}
            .row
              .row__title Expected payment date:
              .row__value {{formattedDate(reportDetailsInfo.paymentDetails.expectedPaymentDate)}}

            Button(v-if="invoiceFile" style="margin-top: 20px; display: flex; justify-content: center;" value="Send New Invoice" @clicked="submitFile")

          .div(v-if="notEnoughMoney" style="margin-top: 20px; text-align: center;") You cannot confirm the report and upload invoice, because you have not reached the minimum payment amount!
          .body__approve(v-if="reportDetailsInfo.status === 'Sent'")
            Button.button-center( value="Approve report" @clicked="approveReport" :isDisabled="notEnoughMoney")


          .body__submission(v-if="reportDetailsInfo.status === 'Approved'")
            .row
              .row__title Upload invoice:
              .row__value
                input.file-button(type="file" @change="uploadFile")
                .file-fake-button
                  i(class="fas fa-upload")
                .file-name(v-if="invoiceFile") {{ invoiceFile.name }}
            .row(v-if="vendor.hasOwnProperty('billingInfo') && vendor.billingInfo.paymentMethod.length"  )
              .row__title Payment method:
              .row__valueDrops
                SelectSingle(
                  :options="vendor.billingInfo.paymentMethod",
                  placeholder="Option",
                  :selectedOption="reportDetailsInfo.paymentDetails.paymentMethod ? reportDetailsInfo.paymentDetails.paymentMethod.name : ''",
                  @chooseOption="setPaymentMethod"
                )
            .row(v-if="!vendor.hasOwnProperty('billingInfo') || !vendor.billingInfo.paymentMethod.length" )
              span Enter your billing information and payment method.
              router-link(v-bind:to="'/billing/billing-information'" style="margin-left: 8px;") Here

            Button(:isDisabled="isRequestNow" style="margin-top: 25px; display: flex; justify-content: center;" value="Submit" @clicked="submitReport")

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
import GeneralTable from "../../../../../components/pangea/GeneralTable"
import moment from 'moment'
import Button from "../../../../../components/pangea/Button"
import SelectSingle from "../../../../../components/pangea/SelectSingle"
import ValidationErrors from "../../../../../components/pangea/ValidationErrors"
import getBgColor from "../../../../../mixins/getBgColor"
import PaymentInformationCard from "../../../../../components/pangea/PaymentInformationCard"

export default {
  mixins: [ getBgColor ],
  components: { PaymentInformationCard, ValidationErrors, SelectSingle, Button, GeneralTable },
  data() {
    return {
      isRequestNow: false,
      domain: '',
      invoiceFile: null,
      errors: [],
      reportDetailsInfo: {},
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
    setPaymentMethod({ option }) {
      this.reportDetailsInfo = Object.assign({}, this.reportDetailsInfo, {
        ...this.reportDetailsInfo,
        paymentDetails: {
          ...this.reportDetailsInfo.paymentDetails,
          paymentMethod: option
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
    async submitReport() {
      return

      this.errors = []
      if (!this.invoiceFile) this.errors.push('Please upload invoice file')
      if (!this.reportDetailsInfo.paymentDetails.paymentMethod) this.errors.push('Please set payment method')
      if (this.errors.length) return
      this.isRequestNow = true

      try {
        const paymentMethod = { ...this.reportDetailsInfo.paymentDetails.paymentMethod }
        delete paymentMethod.name
        // const billNotes = Object.entries(paymentMethod).reduce((acc, curr) => {
        //   acc = acc + `${ replaceKey(curr[0]) }: ${ curr[1] }\n`
        //   return acc
        // }, '')

        await this.$axios.post(`/vendor/zoho-bill-creation`, {
          paymentMethod: this.reportDetailsInfo.paymentDetails.paymentMethod,
          reportsIds: [ this.reportDetailsInfo._id.toString() ],
          // billNotes
        })
        await this.getReport()
      } catch (err) {
        console.log(err)
        this.isRequestNow = false
        return
      }
      const fileData = new FormData()
      fileData.append("invoiceFile", this.invoiceFile)
      fileData.append("reportId", this.$route.params.id)
      fileData.append("zohoBillingId", this.reportDetailsInfo.zohoBillingId)
      try {
        await this.$axios.post(`/vendor/invoice-submission`, fileData)
        this.clearInputFiles(".file-button")
        this.invoiceFile = null
        await this.getReport()
      } catch (err) {
        console.log(err)
        this.isRequestNow = false
      }
      this.isRequestNow = false

      function replaceKey(key) {
        switch (key) {
          case 'accountName':
            key = 'Account Name'
        }
        return key[0].toUpperCase() + key.substr(1)
      }
    },
    async approveReport() {
      if(this.notEnoughMoney) return
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
      } catch (e) {
      }
    }
  },
  async created() {
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
    notEnoughMoney() {
      return this.reportDetailsInfo.totalPrice < 50
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../../../../assets/scss/colors";

.cards {
  display: flex;
  width: 1035px;
  flex-wrap: wrap;
}

.details {
  &__user {
    width: 350px;
    background: $light-background;
    box-sizing: border-box;
    padding: 25px;
    border-radius: 4px;
    border-bottom: 1px solid $light-border;
    margin-bottom: 15px;
  }

  &__info {
    width: 350px;
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
    width: 350px;
  }

  &__table {
    width: 600px;
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
  width: 1025px;
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
</style>