<template lang="pug">
  .invoices(v-if="false")
    GeneralTable(
      :fields="fields"
      :tableData="reports"
    )
      template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
        .table__header {{ field.label }}

      template(slot="invoiceId" slot-scope="{ row, index }")
        .table__data
          router-link(:to="'/billing/invoices-paid/details/' + row._id")
            span {{ row.reportId }}

      template(slot="plan" slot-scope="{ row, index }")
        .table__data {{ getCompanyNameAndPaymentType(row.client, row.clientBillingInfo) }}

      template(slot="status" slot-scope="{ row, index }")
        .table__data {{ row.status }}

      template(slot="total" slot-scope="{ row, index }")
        .table__data
          span.currency(v-html="currencyIconDetected(row.client.currency)" )
          span {{ row.total }}

</template>

<script>
import GeneralTable from '../../../../components/pangea/GeneralTable'
import moment from "moment"

export default {
  components: {
    GeneralTable
  },
  data() {
    return {
      fields: [
        {
          label: "Invoice ID",
          headerKey: "headerInvoiceId",
          key: "invoiceId",
          style: { width: "25%" }
        },
        {
          label: "Plan",
          headerKey: "headerPlan",
          key: "plan",
          style: { width: "25%" }
        },
        {
          label: "Status",
          headerKey: "headerStatus",
          key: "status",
          style: { width: "25%" }
        },
        {
          label: "Total",
          headerKey: "headerTotal",
          key: "total",
          style: { width: "25%" }
        },
      ],
      reports: []
    }
  },
  methods: {
    async getReports() {
      this.reports = (await this.$axios.get(`/portal/invoices-paid?token=${ this.token }`)).data
    },
    customFormatter(date) {
      return moment(date).format('MMM D, HH:mm')
    },
    getCompanyNameAndPaymentType(client, clientBillingInfo) {
      if (!clientBillingInfo) return '-'
      if (!client.billingInfo) return '-'

      const {  paymentType } = client.billingInfo.find(({ _id }) => _id.toString() === clientBillingInfo)
      return  paymentType
    },
    currencyIconDetected(currencyStingCode) {
      switch (currencyStingCode) {
        case "EUR":
          return "&euro;"
        case "USD":
          return "&#36;"
        case "GBP":
          return "&pound;"
        default:
          return "&euro;"
      }
    }
  },
  async created() {
    await this.getReports()
  }
}
</script>

<style scoped lang="scss">
  @import "assets/scss/colors";

  .invoices {
    width: 1000px;
    box-sizing: border-box;
    border-radius: 4px;
    background-color: #fff;
    box-shadow: $box-shadow;
    padding: 25px;
    position: relative;

    .currency {
      margin-right: 4px;
      color: $dark-border;
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
  a {
    color: $text;
    text-decoration: none;
    transition: .2s ease-out;

    &:hover {
      text-decoration: underline;
    }
  }
</style>