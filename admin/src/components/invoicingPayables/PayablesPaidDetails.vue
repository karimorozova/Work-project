<template lang="pug">
  .invoicing-details
    .invoicing-details__wrapper(v-if="reportDetailsInfo.hasOwnProperty('vendor')")

      .invoicing-details__details
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

              .text__block(v-if="reportDetailsInfo.zohoBillingId" )
                .text__title Zoho Link:
                .text__value
                  a(target="_blank" :href="`https://books.zoho.com/app#/bills/${reportDetailsInfo.zohoBillingId}?filter_by=Status.All&per_page=25&sort_column=created_time&sort_order=D`") Bill

              .text__block
                .text__title Invoice:
                .text__value
                  .file-fake-button(style="cursor: pointer" @click="downloadFile(reportDetailsInfo.paymentDetails.file.path)")
                    i(class="fa-solid fa-download")
                  span.file-name {{ reportDetailsInfo.paymentDetails.file ? reportDetailsInfo.paymentDetails.file.fileName : '' }}

              .text__block(v-if="reportDetailsInfo.paymentDetails && reportDetailsInfo.paymentDetails.paymentMethod")
                .text__title Payment method:
                .text__value(style="display:flex; gap: 10px; align-items: center;")
                  span.toggle-details(@click="togglePaymentDetails")
                    i( v-if="!isShowPaymentDetails" class="fa-solid fa-info")
                    i( v-else class="fa-solid fa-xmark")
                  span {{ reportDetailsInfo.paymentDetails.paymentMethod.name }}

              .text__block
                .text__title Expected payment date:
                .text__value {{ formattedDate(reportDetailsInfo.paymentDetails.expectedPaymentDate) }}
              .text__block
                .text__title Total Amount:
                .text__value
                  span(style="margin-right: 4px;") {{ getStepsPayables(reportDetailsInfo.steps) | roundTwoDigit }}
                  span(v-html="'&euro;'")


            .payment-details(v-if="isShowPaymentDetails" )
              .payment-details__row(v-for="[key, val] in Object.entries(reportDetailsInfo.paymentDetails.paymentMethod)" v-if="key !== 'name'" )
                .payment-details__key {{ replaceKey(key) }}:
                .payment-details__value
                  span.details-icon(@click="copyDetailsInfo(val)")
                    i(class="fa-regular fa-copy")
                  span {{ val }}

          .invoicing-details__table
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

              template(slot="deadline" slot-scope="{ row, index }")
                .table__data {{ formattedDate(row.deadline) }}

              template(slot="status" slot-scope="{ row, index }")
                .table__data {{ row.status }}

              template(slot="payables" slot-scope="{ row, index }")
                .table__data
                  span.currency(v-html="'&euro;'")
                  span {{ row.nativeFinance.Price.payables | roundTwoDigit}}

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
import ApproveModal from '../ApproveModal'
import Button from "../Button"
import SelectSingle from "../SelectSingle"
import DatepickerWithTime from "../DatepickerWithTime"
import CheckBox from "../CheckBox"
import PayablesPaymentInformationCard from "./PayablesPaymentInformationCard"
import getBgColor from "../../mixins/getBgColor"

export default {
  name: "InvoicingDetails",
  mixins: [ getBgColor ],
  data() {
    return {
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
          style: { width: "13%" }
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
          style: { width: "11%" }
        }
      ],
      amount: 0
    }
  },
  methods: {
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
    getStepsPayables(stepFinance) {
      return stepFinance.reduce((sum, step) => {
        sum += step.nativeFinance.Price.payables || 0
        return sum
      }, 0)
    },
    async openDetails(id) {
      this.reportDetailsInfo = (await this.$http.post('/invoicing-payables/paid-report/' + id)).data[0]
    }
  },
  computed: {
    //Todo: show status "Invoice Received" and "Partially Paid"1
    getPaymentRemainder() {
      const { paymentInformation = [] } = this.reportDetailsInfo
      return paymentInformation.reduce((sum, item) => {
        sum += +item.paidAmount
        return sum
      }, 0)
    },
    getUnpaidAmount() {
      const rawUnpaidAmount = this.getStepsPayables(this.reportDetailsInfo.steps) - (+this.getPaymentRemainder)
      return +(parseFloat(rawUnpaidAmount)).toFixed(2)
    }
  },
  created() {
    this.openDetails(this.$route.params.id)
    this.domain = __WEBPACK__API_URL__
  },
  components: {
    Button,
    GeneralTable,
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

.payment-card {
  background-color: white;
  padding: 25px;
  box-shadow: $box-shadow;
  border-radius: 4px;
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
    border-radius: 4px;
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
  border-radius: 4px;

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
    border-radius: 4px;
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
  border-radius: 4px;
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
  border-radius: 4px;
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
  border-radius: 4px;
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