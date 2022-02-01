<template lang="pug">
  .invoicing-details
    .invoicing-details__main-info(v-if="reportDetailsInfo.client")
      .invoicing-details__text
        .text__block
          .text__title Billing Name:
          .text__value {{ billingDetails.name }}

        .text__block
          .text__title Status:
          .text__value {{reportDetailsInfo.status}}

        .text__block
          .text__title Report ID:
          .text__value {{reportDetailsInfo.reportId}}

        .text__block
          .text__title Payment Type:
          .text__value {{ billingDetails.paymentType }}

        .text__block
          .text__title Date Range:
          .text__value
            span {{ formattedDateRange(reportDetailsInfo.firstPaymentDate) }}
            span(style="color:#999; margin: 0 4px;") /
            span {{ formattedDateRange(reportDetailsInfo.lastPaymentDate) }}

        .text__block
          .text__title Payment Terms:
          .text__value {{ billingDetails.paymentTerms.name}}

        .text__block
          .text__title Projects:
          .text__value {{ getReportProjectsCount(reportDetailsInfo) }}

        .text__block
          .text__title Jobs:
          .text__value {{ reportDetailsInfo.stepsWithProject.length }}

        .text__block
          .text__title Total Amount:
          .text__value
            span(style="margin-right: 4px;") {{ reportDetailsInfo.total  }}
            span(v-html="'&euro;'")

      .invoicing-details__table
        GeneralTable(
          :fields="fields"
          :tableData="reportDetailsInfo.stepsWithProject"
        )
          template(v-for="field in fields", :slot="field.headerKey", slot-scope="{ field }")
            .table__header {{ field.label }}

          template(slot="jobId" slot-scope="{ row, index }")
            .table__data
              .id
                span {{row.stepId}}
              //router-link(class="link-to" :to="{path: `/pangea-projects/all-projects/All/details/${row._id}`}")
              .short
                span {{ row.projectName }}

          template(slot="step" slot-scope="{ row, index }")
            .table__data {{row.type === 'Classic' ? row.stepAndUnit.step.title : row.title}}

          template(slot="langPair" slot-scope="{ row, index }")
            .table__data(v-html="getStepPair(row)")

          template(slot="fee" slot-scope="{ row, index }")
            span.currency(v-html="returnIconCurrencyByStringCode(row.projectCurrency)")
            span {{ row.finance.Price.receivables.toFixed(2) }}

    .invoicing-details__payments
      //PaymentInformationCard(:cardInfo="reportDetailsInfo.")

</template>

<script>
import moment from "moment"
import GeneralTable from "../../../../../components/pangea/GeneralTable"
import PaymentInformationCard from "../../../../../components/pangea/PaymentInformationCard"

export default {
  components: {
    GeneralTable,
    PaymentInformationCard
  },
  data() {
    return {
      reportDetailsInfo: [],
      fields: [
        {
          label: "Job ID",
          headerKey: "headerJobId",
          key: "jobId",
          style: { width: "40%" }
        },
        {
          label: "Service",
          headerKey: "headerStep",
          key: "step",
          style: { width: "25%" }
        },
        {
          label: "Language Pair",
          headerKey: "headerLangPair",
          key: "langPair",
          style: { width: "25%" }
        },
        {
          label: "Fee",
          headerKey: "headerfee",
          key: "fee",
          style: { width: "10%" }
        },
      ]
    }
  },
  methods: {
    async getReport() {
      this.reportDetailsInfo = (await this.$axios.get(`/portal/invoice/${this.$route.params.id}?token=${ this.token }`)).data[0]
    },
    formattedDateRange(date) {
      return moment(date).format('MMM D')
    },

    getReportProjectsCount({ stepsAndProjects }) {
      const { length } = [ ...new Set(stepsAndProjects.map(i => i.project)) ]
      return length
    },
    getStepPair(step) {
      return step.sourceLanguage === step.targetLanguage
          ? `${ step.targetLanguage }`
          : `<span>${ step.sourceLanguage }</span><span style="font-size: 12px;color: #9c9c9c;margin: 0 4px;"><i class="fas fa-angle-double-right"></i></span><span>${ step.targetLanguage }</span>`
    },
    returnIconCurrencyByStringCode(currencyStingCode) {
      switch (currencyStingCode) {
        case "EUR":
          return "&nbsp;&euro;&nbsp;";
        case "USD":
          return "&nbsp;&#36;&nbsp;";
        case "GBP":
          return "&nbsp;&pound;&nbsp;";
        default:
          return "&nbsp;&euro;&nbsp;";
      }
    }
  },
  computed: {
    billingDetails() {
      const { billingInfo } = this.reportDetailsInfo.client
      return  billingInfo.find(item => item._id.toString() === this.reportDetailsInfo.clientBillingInfo.toString())
    }
  },
  async created() {
    await this.getReport()
  }
}
</script>

<style scoped lang="scss">
@import "assets/scss/colors";
.invoicing-details {
  width: 980px;
  box-sizing: border-box;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: $box-shadow;
  padding: 25px;

  &__main-info{
    display: flex;
    justify-content: space-between;
  }


  &__text {
    width: 300px;
    background: $light-background;
    box-sizing: border-box;
    padding: 25px;
    height: fit-content;
    border-radius: 4px;
    border-bottom: 1px solid $light-border;
  }

  &__table {
    width: 590px;
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
      width: 200px;
      color: $dark-border;
    }

    &__value {
      width: 140px;
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

  .currency {
    margin-right: 4px;
    color: $dark-border;
  }

  .short {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    max-width: 146px;
    opacity: 0.3;
  }

}

.table {
  width: 100%;

  &__data {
    padding: 0 7px;
  }

  &__header {
    padding: 0 7px;
  }

  &__drop {
    position: relative;
    height: 32px;
    max-width: 220px;
    margin: 0 7px;
    width: 100%;
    background: white;
    border-radius: 4px;
  }

  &__icons {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    gap: 8px;
    cursor: pointer;
  }

  &__icon {
    cursor: pointer;
    opacity: 0.5;
  }

  &__opacity {
    opacity: 1;
  }

  &__input {
    width: 100%;
    padding: 0 7px;
  }
}
</style>