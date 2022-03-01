<template lang="pug">
  .container
    ValidationErrors(
      v-if="errors.length"
      :errors="errors"
      :isAbsolute="true"
      @closeErrors="errors = []"
    )
    .report(v-if="reportDetailsInfo.hasOwnProperty('vendor')" )
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

          .body__invoiceReceived
            .row
              .row__title Invoice:
              .row__value2
                .file-fake-button(style="cursor: pointer" @click="downloadFile(reportDetailsInfo.paymentDetails.file.path)")
                  i(class="fa-solid fa-download")
                span.file-name {{ reportDetailsInfo.paymentDetails.file.fileName }}
            .row(v-if="reportDetailsInfo.paymentDetails.paymentMethod" )
              .row__title Payment method:
              .row__value {{ reportDetailsInfo.paymentDetails.paymentMethod.name }}

            .row
              .row__title Expected payment date:
              .row__value {{formattedDate(reportDetailsInfo.paymentDetails.expectedPaymentDate)}}

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

            template(slot="icon" slot-scope="{ row, index }")
              .table__icons
                router-link(class="link-to" target="_blank" :to="{path: `/completed-jobs/job-details/${row._id}_${row.projectNativeId}`}")
                  .icon
                    i(class="fa-solid fa-arrow-right-to-bracket")

    .payments
      .cards(v-if="reportDetailsInfo && reportDetailsInfo.paymentInformation")
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
import PaymentInformationCard from "../../../../../components/sub-components/PaymentInformationCard"
import getBgColor from "../../../../../mixins/getBgColor"

export default {
  mixins: [ getBgColor ],
  components: { ValidationErrors, SelectSingle, Button, GeneralTable, PaymentInformationCard },
  data() {
    return {
      domain: '',
      invoiceFile: null,
      errors: [],
      reportDetailsInfo: {},
      fields: [
        {
          label: "Step ID",
          headerKey: "headerStepId",
          key: "stepId",
          style: { width: "29%" }
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
        },
        {
          label: "",
          headerKey: "headerIcon",
          key: "icon",
          style: { width: "6%" }
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
        const result = await this.$axios.get(`/vendor/get-report-paid?reportId=${ this.$route.params.id }`)
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
    })
  }
}
</script>

<style lang="scss" scoped>
@import "../../../../../assets/scss/colors";

.cards {
  display: flex;
  width: 1250px;
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
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }

  &__details {
    width: 370px;
  }

  &__table {
    width: 780px;
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
  width: 1250px;
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

  &__icons {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    gap: 8px;
  }
}

.icon {
  font-size: 17px;
  cursor: pointer;
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

a {
  color: $text;
  text-decoration: none;
  transition: .2s ease-out;

  &:hover {
    text-decoration: underline;
  }
}
</style>