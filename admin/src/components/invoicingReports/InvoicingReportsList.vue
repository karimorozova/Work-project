<template lang="pug">
  .reports
    .reports__table
      LayoutsTable(
        :fields="fields"
        :tableData="reports"

        :customNumberOfFilterRows="1"
      )

        template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
          .table__header {{ field.label }}

        template(slot="reportId" slot-scope="{ row, index }" )
          .table__data
            router-link(class="link-to" :to="{path: `/pangea-finance/invoicing-reports/reports/${row._id}`}")
              span {{ row.reportId }}


        template(slot="dateRange" slot-scope="{ row, index }")
          .table__data {{ formattedDate(row.firstPaymentDate) +' - '+ formattedDate(row.lastPaymentDate)|| '-' }}

        template(slot="vendorName" slot-scope="{ row, index }")
          .table__data {{ row.vendor.firstName + ' ' + row.vendor.surname }}

        template(slot="status" slot-scope="{ row, index }")
          .table__data {{ row.status }}

        template(slot="jobs" slot-scope="{ row, index }")
          .table__data {{ row.steps.length }}


        template(slot="amount" slot-scope="{ row, index }")
          .table__data {{ getStepsPayables(row.stepFinance)| roundTwoDigit }}

</template>

<script>
import GeneralTable from '../GeneralTable'
import LayoutsTable from '../LayoutsTable'
import moment from "moment"
export default {
  name: "InvoicingReportsList",
  props: {
    reports: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      fields: [
        {
          label: "Report Id",
          headerKey: "headerReportId",
          key: "reportId",
          style: { width: "271px" }
        },
        {
          label: "Date Range",
          headerKey: "headerDateRange",
          key: "dateRange",
          style: { width: "300px" }
        },
        {
          label: "Vendor Name",
          headerKey: "headerVendorName",
          key: "vendorName",
          style: { width: "300px" }
        },
        {
          label: "Status",
          headerKey: "headerStatus",
          key: "status",
          style: { width: "200px" }
        },
        {
          label: "Jobs",
          headerKey: "headerJobs",
          key: "jobs",
          style: { width: "200px" }
        },
        {
          label: "Amount",
          headerKey: "headerAmount",
          key: "amount",
          style: { width: "200px" }
        },

      ]

    }
  },
  methods: {
    getStepsPayables(stepFinance){
      return stepFinance.reduce((sum, finance) => {
        sum += finance.payables || 0
        return sum
      }, 0)
    },
    openDetails(id) {
      this.$emit('openDetails', id)
    },
    formattedDate(date) {
      return moment(date).format("DD-MM-YYYY");
    },
  },
  components: {
    GeneralTable,
    LayoutsTable,
  },
}
</script>

<style scoped lang="scss">
@import "../../assets/scss/colors";

.table {
  &__header,
  &__data {
    padding: 0 6px;
  }

  &__data {
    width: 100%;
  }

  &__icons {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 7px;
    width: 100%;
    height: 40px;

    &-info {
      cursor: help;
      color: $red;
      font-size: 16px;
    }

    &-link {
      cursor: pointer;
      font-size: 16px;
    }

    &-link-opacity {
      cursor: default;
      font-size: 16px;
      opacity: 0.5;
    }
  }
}

.clickable-element{
  cursor: pointer;
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