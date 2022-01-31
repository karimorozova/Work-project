<template lang="pug">
  .invoices
    GeneralTable(
      :fields="fields"
      :tableData="reports"
      :isFilterShow="false"
      :isBodyShort="false"
    )
      template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
        .table__header {{ field.label }}

      template(slot="date" slot-scope="{ row, index }")
        .table__data {{ customFormatter(row.lastPaymentDate) }}

      template(slot="invoiceId" slot-scope="{ row, index }")
        .table__data
          router-link(:to="'/billing/invoices/details/' + row._id")
            span {{ row.reportId }}

      template(slot="plan" slot-scope="{ row, index }")
        .table__data {{ getCompanyNameAndPaymentType(row.client, row.clientBillingInfo) }}

      template(slot="status" slot-scope="{ row, index }")
        .table__data {{ row.status }}

      template(slot="total" slot-scope="{ row, index }")
        .table__data
          span.currency(v-html="currencyIconDetected(row.client.currency)" )
          span {{ row.total }}

      template(slot="icon" slot-scope="{ row, index }")
        .table__icons(v-if="row.invoice.path" @click="() => download(row.invoice.path)")
          i(class="fas fa-download")
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
          label: "Date",
          headerKey: "headerDate",
          key: "date",
          style: { width: "15%" }
        },
        {
          label: "Invoice ID",
          headerKey: "headerInvoiceId",
          key: "invoiceId",
          style: { width: "15%" }
        },
        {
          label: "Plan",
          headerKey: "headerPlan",
          key: "plan",
          style: { width: "35%" }
        },
        {
          label: "Status",
          headerKey: "headerStatus",
          key: "status",
          style: { width: "15%" }
        },
        {
          label: "Total",
          headerKey: "headerTotal",
          key: "total",
          style: { width: "15%" }
        },
        {
          label: "",
          headerKey: "headerIcon",
          key: "icon",
          style: { width: "5%" }
        }
      ],
      reports: [],
      domain: ''
    }
  },
  methods: {
    async getReports() {
      this.reports = (await this.$axios.get(`/portal/invoices?token=${ this.token }`)).data
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
    download(path) {
      let link = document.createElement('a')
      link.href = this.domain + '/' +  path
      link.target = "_blank"
      link.click()
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
  mounted() {
    this.domain = window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://admin.pangea.global'
  },
  async created() {
    await this.getReports()
  }
}
</script>

<style scoped lang="scss">
  @import "assets/scss/colors";

  .invoices {
    width: 980px;
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