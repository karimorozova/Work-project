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
          .table__data {{ row.reportId }}

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
          .table__data {{ getTime( row.createdAt) }}

        template(slot="details" slot-scope="{ row, index }")
          .table__icon
            router-link(:to="'/invoices/details/' + row._id" target="_blank")
              i(class="fas fa-chalkboard-teacher")

    .title Old Invoices
    .reports
      GeneralTable(
        :fields="fields"
        :tableData="reportsPaid"
        :isBodyShort="true"
      )
        template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
          .table__header {{ field.label }}

        template(slot="reportId" slot-scope="{ row, index }" )
          .table__data {{ row.reportId }}

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
          .table__data {{ getTime( row.createdAt) }}

        template(slot="details" slot-scope="{ row, index }")
          .table__icon
            router-link(:to="'/invoices/details-paid/' + row._id" target="_blank")
              i(class="fas fa-chalkboard-teacher")

</template>

<script>
import { mapGetters } from "vuex"
import GeneralTable from "../../../components/pangea/GeneralTable"
import moment from "moment"

export default {
  data() {
    return {
      fields: [
        {
          label: "Report Id",
          headerKey: "headerReportId",
          key: "reportId",
          style: { width: "15%" }
        },
        {
          label: "Date Range",
          headerKey: "headerDateRange",
          key: "dateRange",
          style: { width: "21%" }
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
          style: { width: "13%" }
        },
        {
          label: "Amount",
          headerKey: "headerAmount",
          key: "amount",
          style: { width: "13%" }
        },
        {
          label: "Created On",
          headerKey: "headerCreated",
          key: "created",
          style: { width: "15%" }
        },
        {
          label: "Details",
          headerKey: "headerDetails",
          key: "details",
          style: { width: "8%" }
        }
      ]
    }
  },
  methods: {
    getTime(time) {
      return moment(time).format('DD-MM-YYYY, HH:mm')
    },
    getStepsPayables(steps) {
      return steps.reduce((sum, finance) => {
        sum += finance.nativeFinance.Price.payables || 0
        return sum
      }, 0)
    },
    formattedDate(date) {
      return moment(date).format("DD-MM-YYYY")
    },
    dateRange(row) {
      return `${ this.formattedDate(row.firstPaymentDate) } <span style="color: #999999; margin: 0 1px;"> / </span> ${ this.formattedDate(row.lastPaymentDate) || "-" }`
    },
    test() {
      console.log(this.dava)
    }
  },
  computed: {
    ...mapGetters({
      reportsPaid: "getReportsPaid",
      reports: "getReports"
    })
  },
  components: { GeneralTable }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors";

a {
  color: $text;
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
  width: 1000px;
  box-sizing: border-box;
}

.container {
}

.title {
  font-size: 18px;
  font-family: Myriad600;
  margin-bottom: 10px;
}

</style>