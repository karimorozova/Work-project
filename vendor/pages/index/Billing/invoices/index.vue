<template lang="pug">
  .container
    .title Invoices
    .reports
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

        template(slot="jobs" slot-scope="{ row, index }")
          .table__data {{ row.steps.length }}

        template(slot="amount" slot-scope="{ row, index }")
          .table__data
            span.currency(v-html="'&euro;'")
            span {{ getStepsPayables(row.steps).toFixed(2) }}

        template(slot="created" slot-scope="{ row, index }")
          .table__data {{ formattedDate( row.createdAt) }}

    .title Paid Invoices
    .reports
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

        template(slot="jobs" slot-scope="{ row, index }")
          .table__data {{ row.steps.length }}

        template(slot="amount" slot-scope="{ row, index }")
          .table__data
            span.currency(v-html="'&euro;'")
            span {{ getStepsPayables(row.steps).toFixed(2) }}

        template(slot="created" slot-scope="{ row, index }")
          .table__data {{ formattedDate( row.createdAt) }}

</template>

<script>
import { mapGetters } from "vuex"
import GeneralTable from "../../../../components/pangea/GeneralTable"
import moment from "moment"

export default {
  data() {
    return {
      reports: [],
      reportsPaid: [],
      fields: [
        {
          label: "Report Id",
          headerKey: "headerReportId",
          key: "reportId",
          style: { width: "20%" }
        },
        {
          label: "Status",
          headerKey: "headerStatus",
          key: "status",
          style: { width: "15%" }
        },
        {
          label: "Jobs",
          headerKey: "headerJobs",
          key: "jobs",
          style: { width: "15%" }
        },
        {
          label: "Date Range",
          headerKey: "headerDateRange",
          key: "dateRange",
          style: { width: "20%" }
        },
        {
          label: "Created On",
          headerKey: "headerCreated",
          key: "created",
          style: { width: "15%" }
        },
        {
          label: "Amount",
          headerKey: "headerAmount",
          key: "amount",
          style: { width: "15%" }
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
  }

  &__data {
    padding: 0 7px;
  }
}

.reports {
  box-shadow: $box-shadow;
  padding: 25px;
  margin-bottom: 50px;
  border-radius: 4px;
  width: 1025px;
  box-sizing: border-box;
  background-color: white;
}

.container {
}

.title {
  font-size: 18px;
  font-family: Myriad600;
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