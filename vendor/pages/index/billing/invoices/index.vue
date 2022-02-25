<template lang="pug">
  .container

    .reports
      .title Invoices
      GeneralTable(
        :fields="fields"
        :tableData="reports"
        :isBodyShort="true"
      )
        template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
          .table__header {{ field.label }}

        template(slot="reportId" slot-scope="{ row, index }" )
          .table__data
            router-link(:to="'/billing/invoices/details/' + row._id")
              span {{ row.reportId }}

        template(slot="dateRange" slot-scope="{ row, index }")
          .table__data(v-html="dateRange(row)")

        template(slot="status" slot-scope="{ row, index }")
          .table__data {{ row.status }}

        template(slot="name" slot-scope="{ row, index }")
          .table__data
            router-link(:to="'/billing/billing-information'")
              span(v-if="row.paymentDetails.paymentMethod" ) {{ row.paymentDetails.paymentMethod.name }}
              span.grey-tone(v-else) After invoice upload

        template(slot="type" slot-scope="{ row, index }")
          .table__data(v-if="row.paymentDetails.paymentMethod") {{ row.paymentDetails.paymentMethod.paymentType }}
          .table__data.grey-tone(v-else) After invoice upload

        template(slot="jobs" slot-scope="{ row, index }")
          .table__data {{ row.steps.length }}

        template(slot="amount" slot-scope="{ row, index }")
          .table__data
            span.currency(v-html="'&euro;'")
            span {{ getStepsPayables(row.steps).toFixed(2) }}

        template(slot="created" slot-scope="{ row, index }")
          .table__data {{ formattedDate( row.createdAt) }}

        template(slot="icon" slot-scope="{ row, index }")
          .table__icons
            router-link(:to="'/billing/invoices/details/' + row._id")
              .table__icon
                i(class="fa-solid fa-arrow-right-to-bracket")

    .reports
      .title Paid Invoices
      GeneralTable(
        :fields="fields"
        :tableData="reportsPaid"
        :isBodyShort="true"
      )
        template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
          .table__header {{ field.label }}

        template(slot="reportId" slot-scope="{ row, index }" )
          .table__data
            router-link(:to="'/billing/invoices/details-paid/' + row._id")
              span {{ row.reportId }}

        template(slot="dateRange" slot-scope="{ row, index }")
          .table__data(v-html="dateRange(row)")

        template(slot="status" slot-scope="{ row, index }")
          .table__data {{ row.status }}

        template(slot="name" slot-scope="{ row, index }")
          .table__data
            router-link(:to="'/billing/billing-information'")
              span {{ row.paymentDetails.paymentMethod.name }}

        template(slot="type" slot-scope="{ row, index }")
          .table__data {{ row.paymentDetails.paymentMethod.paymentType }}

        template(slot="jobs" slot-scope="{ row, index }")
          .table__data {{ row.steps.length }}

        template(slot="amount" slot-scope="{ row, index }")
          .table__data
            span.currency(v-html="'&euro;'")
            span {{ getStepsPayables(row.steps).toFixed(2) }}

        template(slot="created" slot-scope="{ row, index }")
          .table__data {{ formattedDate( row.createdAt) }}

        template(slot="icon" slot-scope="{ row, index }")
          .table__icons
            router-link(:to="'/billing/invoices/details-paid/' + row._id")
              .table__icon
                i(class="fa-solid fa-arrow-right-to-bracket")

</template>

<script>
import { mapGetters } from "vuex"
import GeneralTable from "../../../../components/general/GeneralTable"
import moment from "moment"

export default {
  data() {
    return {
      reports: [],
      reportsPaid: [],
      fields: [
        {
          label: "Report ID",
          headerKey: "headerReportId",
          key: "reportId",
          style: { width: "12%" }
        },
        {
          label: "Status",
          headerKey: "headerStatus",
          key: "status",
          style: { width: "12%" }
        },
        {
          label: "Payment Name",
          headerKey: "header1",
          key: "name",
          style: { width: "16%" }
        },
        {
          label: "Payment Type",
          headerKey: "header2",
          key: "type",
          style: { width: "12%" }
        },
        {
          label: "Jobs",
          headerKey: "headerJobs",
          key: "jobs",
          style: { width: "7%" }
        },
        {
          label: "Date Range",
          headerKey: "headerDateRange",
          key: "dateRange",
          style: { width: "14%" }
        },
        {
          label: "Created On",
          headerKey: "headerCreated",
          key: "created",
          style: { width: "12%" }
        },
        {
          label: "Amount",
          headerKey: "headerAmount",
          key: "amount",
          style: { width: "10%" }
        },
        {
          label: "",
          headerKey: "headerIcon",
          key: "icon",
          style: { width: "5%" }
        }
      ]
    }
  },
  methods: {
    getStepsPayables(steps) {
      return steps.reduce((sum, finance) => {
        sum += finance.nativeFinance.Price.payables || 0
        return sum
      }, 0)
    },
    formattedDate(date) {
      return moment(date).format('MMM D, HH:mm')
    },
    formattedDateRange(date) {
      return moment(date).format('MMM D')
    },
    dateRange(row) {
      return `${ this.formattedDateRange(row.firstPaymentDate) } <span style="color: #999999; margin: 0 4px;">/</span> ${ this.formattedDateRange(row.lastPaymentDate) || "-" }`
    },
    async getVendorReports() {
      try {
        const result = await this.$axios.get(`/vendor/reports?token=${ this.$store.state.token }`)
        const decode = window.atob(result.data)
        this.reports = JSON.parse(decode)
      } catch (err) {
      }
    },
    async getVendorPaidReports() {
      try {
        const result = await this.$axios.get(`/vendor/paid-reports?token=${ this.$store.state.token }`)
        const decode = window.atob(result.data)
        this.reportsPaid = JSON.parse(decode)
      } catch (err) {
      }
    }
  },
  components: { GeneralTable },
  async created() {
    await this.getVendorReports()
    await this.getVendorPaidReports()
  }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors";

.grey-tone {
  opacity: 0.4;
}

.fa-chalkboard-teacher {
  font-size: 15px;
  cursor: pointer;
}

.currency {
  margin-right: 4px;
  color: $dark-border;
}

.table {
  &__header {
    padding: 0 0 0 7px;
  }

  &__icon {
    display: flex;
    justify-content: center;
    width: 100%;
    font-size: 17px;
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

.reports {
  box-shadow: $box-shadow;
  padding: 25px;
  margin-bottom: 50px;
  border-radius: 4px;
  width: 1200px;
  box-sizing: border-box;
  background-color: white;
}

.title {
  font-size: 16px;
  font-family: Roboto600;
  margin-bottom: 10px;
}

a {
  color: inherit;
  text-decoration: none;
  transition: .2s ease-out;

  &:hover {
    text-decoration: underline;
  }
}

</style>