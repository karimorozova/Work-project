<template lang="pug">
  .table
    GeneralTable(
      :fields="fields"
      :tableData="reports"
      :isBodyShort="true"
    )
      template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
        .table__header {{ field.label }}

      template(slot="reportId" slot-scope="{ row, index }" )
        .table__data
          router-link(v-if="row.status === 'Paid'" class="link-to" :to="{path: `/pangea-finance/payables-reports/paid-reports/${row._id}`}")
            span {{ row.reportId }}
          router-link(v-else class="link-to" :to="{path: `/pangea-finance/payables-reports/reports/${row._id}`}")
            span {{ row.reportId }}

      template(slot="status" slot-scope="{ row, index }")
        .table__data {{ row.status }}

      template(slot="paymentDay" slot-scope="{ row, index }")
        .table__data(v-if="row.paymentDetails.expectedPaymentDate" ) {{ getDate( row.paymentDetails.expectedPaymentDate) }}
        .table__data(v-else) -

      template(slot="type" slot-scope="{ row, index }")
        .table__data(v-if="row.paymentDetails.paymentMethod" )
          div.type {{ row.paymentDetails.paymentMethod.paymentType  }}
          div.name {{ row.paymentDetails.paymentMethod.name }}
        .table__data(v-else) -

      template(slot="amount" slot-scope="{ row, index }")
        .table__data
          span.currency(v-html="'&euro;'")
          span {{ +(row.total).toFixed(2) }}
</template>

<script>
import GeneralTable from "../GeneralTable"
import moment from "moment"

export default {
  name: "ReportDetailsVendorReports",
  components: { GeneralTable },
  props: {
    reports: {
      type: Array
    }
  },
  data() {
    return {
      fields: [
        {
          label: "Report ID",
          headerKey: "headerReportId",
          key: "reportId",
          style: { width: "22%" }
        },
        {
          label: "Status",
          headerKey: "headerStatus",
          key: "status",
          style: { width: "22%" }
        },
        {
          label: "Payment Date",
          headerKey: "headerPaymentDate",
          key: "paymentDay",
          style: { width: "22%" }
        },
        {
          label: "Type / Name",
          headerKey: "headerType",
          key: "type",
          style: { width: "22%" }
        },
        {
          label: "Amount",
          headerKey: "headerAmount",
          key: "amount",
          style: { width: "12%" }
        }
      ]
    }
  },
  methods: {
    getDate(date) {
      return moment(date).format('MMM D')
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

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
}

.name {
  opacity: 0.4;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.currency {
  margin-right: 4px;
  color: $dark-border;
}
</style>