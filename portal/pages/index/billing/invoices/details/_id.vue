<template lang="pug">
  .invoicing-details(v-if="reportDetailsInfo.client")
    .invoicing-details__main-info
      .invoicing-details__table.style-wrapper
        Tabs(:tabs="tabs" :selectedTab="selectedTab" @setTab="setTab")
        ReportsByJob(v-if="selectedTab === 'Per Job'" :stepsWithProject="reportDetailsInfo.stepsWithProject" )
        ReportsByProject(v-if="selectedTab === 'Per Project'" :stepsWithProject="reportDetailsInfo.stepsWithProject" )

      .invoicing-details__side-card.style-wrapper
        .text__main-block
          .text__block-title {{ billingDetails.officialName }}
          .text__text-gray {{address}}

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
            span.currency(v-html="'&euro;'")
            span(style="margin-right: 4px;") {{ reportDetailsInfo.total  }}

        .text__block(v-if="this.reportDetailsInfo.status !== 'Created' && reportDetailsInfo.invoice.path")
          .text__title Invoice:
          .text__button
            IconButton(@clicked="downloadFile(reportDetailsInfo.invoice.path)")
              i(class="fa-solid fa-download")


    .invoicing-details__cards(v-if="reportDetailsInfo && reportDetailsInfo.paymentInformation.length")
      .invoicing-details__card(v-for="cardInfo in reportDetailsInfo.paymentInformation")
        PaymentInformationCard(
          :cardInfo="cardInfo"
        )


</template>

<script>
import moment from "moment"
import ReportsByJob from "../../../../../components/pangea/invoicing/ReportsByJob"
import ReportsByProject from "../../../../../components/pangea/invoicing/ReportsByProject"
import Tabs from "../../../../../components/pangea/Tabs"
import PaymentInformationCard from "../../../../../components/pangea/PaymentInformationCard"
import IconButton from "../../../../../components/pangea/IconButton"

export default {
  components: {
    Tabs,
    IconButton,
    ReportsByJob,
    ReportsByProject,
    PaymentInformationCard
  },
  data() {
    return {
      tabs: [ "Per Job", "Per Project"],
      selectedTab: "Per Job",
      reportDetailsInfo: [],
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
    setTab({index}) {
      this.selectedTab = this.tabs[index]
    },
    downloadFile(path) {
      const domain = window.location.hostname === 'localhost'
          ? 'http://localhost:3001'
          : 'https://admin.pangea.global'
      let link = document.createElement('a')
      link.href = domain + '/' + path
      link.target = "_blank"
      link.click()
    },
  },
  computed: {
    billingDetails() {
      const { billingInfo } = this.reportDetailsInfo.client
      return  billingInfo.find(item => item._id.toString() === this.reportDetailsInfo.clientBillingInfo.toString())
    },
    address() {
      return `${ this.billingDetails.address.street1 || 'No street' },  ${ this.billingDetails.address.city || 'No city' }, ${ this.billingDetails.address.country || 'No country' }`
    }
  },
  async created() {
    await this.getReport()
  }
}
</script>

<style scoped lang="scss">
@import "assets/scss/colors";

.style-wrapper {
  box-sizing: border-box;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: $box-shadow;
  padding: 25px;
}

.invoicing-details {
  &__main-info{
    display: flex;
  }

  &__cards {
    display: flex;
    flex-wrap: wrap;
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
    width: 1000px;
  }


  &__side-card {
    width: 290px;
    margin-left: 25px;
    height: fit-content;
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
      width: 120px;
      color: $dark-border;
    }

    &__main-block {
      border-bottom: 1px solid $border;
      margin-bottom: 15px;
      padding-bottom: 15px;
    }

    &__block-title  {
      font-size: 18px;
      font-family: Myriad600;
      margin-bottom: 5px;
    }
    &__text-gray {
      color: $dark-border;
    }

    &__value {
      width: 100px;
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

}



</style>