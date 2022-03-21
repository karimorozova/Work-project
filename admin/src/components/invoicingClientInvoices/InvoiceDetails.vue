<template lang="pug">
  .invoicing-layout(v-if="invoice._id" )

    .template
      .template__header
        .header
          .header__logo
            .header__logo-image
              img(src="../../assets/images/latest-version/navbar-logo.svg")

            .header__logo-company
              .profile__name {{ companyProfile().name }}
              .profile__text {{ companyProfile().address }}
              .profile__text {{ companyProfile().city }}, {{ companyProfile().postCode }}
              .profile__text {{ companyProfile().country }}
              .profile__text {{ companyProfile().taxId }}


          .header__data
            .header__data-line
            .header__data-title Invoice
            .header__data-number INV-002047
            .header__data-total
              .header__data-total-name Balance Due:
              .header__data-total-amount
                span EUR
                span 123.123


        .subheader
          .subheader__left
            .profile__name {{ paymentProfile().getOfficialName() }}
            .profile__text {{ paymentProfile().getAddress() }}
            .profile__text(v-if="paymentProfile().getState()" ) {{ paymentProfile().getState() }}
            .profile__text {{ paymentProfile().getCityWithCode() }}
            .profile__text {{ paymentProfile().getCountry() }}
            .profile__text {{ paymentProfile().getVat() }}

          .subheader__right
            .row
              .row__key Invoice Date:
              .row__value 222
            .row
              .row__key Terms:
              .row__value 222
            .row
              .row__key Due Date:
              .row__value 222

        .body
          .body__table
            GeneralTable(
              :fields="fieldsItems"
              :tableData="invoice.items"
              :isDarkMode="true"
            )
              template(v-for="field in fieldsItems" :slot="field.headerKey" slot-scope="{ field }")
                .table__header {{ field.label }}

              template(slot="title" slot-scope="{ row, index }")
                .table__data  {{ row.title }}
              template(slot="quantity" slot-scope="{ row, index }")
                .table__data {{ row.quantity }}
              template(slot="rate" slot-scope="{ row, index }")
                .table__data {{ row.rate }}
              template(slot="tax" slot-scope="{ row, index }")
                .table__data {{ row.tax }}
              template(slot="amount" slot-scope="{ row, index }")
                .table__data {{ row.amount }}

  //.invoice-details
  //  Button(value="Edit" @clicked="goToEdit" )
  //  .invoice-details__field
  //    .title Invoice ID
  //    .value {{invoice.invoiceId}}
  //  .invoice-details__field
  //    .title Client Name
  //    .value {{invoice.customer.name}}
  //  .invoice-details__field
  //    .value {{invoice.status}}
  //    .title Status
</template>

<script>
import { company } from "../../../enums"
import Button from "../Button"
import GeneralTable from "../GeneralTable"

export default {
  components: {
    GeneralTable,
    Button
  },
  data() {
    return {
      invoice: {},
      fieldsItems: [
        {
          label: "Title",
          headerKey: "headerTitle",
          key: "title",
          style: { "width": "40%" }
        },
        {
          label: "Quantity",
          headerKey: "headerQuantity",
          key: "quantity",
          style: { "width": "15%" }
        },
        {
          label: "Rate",
          headerKey: "headerRate",
          key: "rate",
          style: { "width": "15%" }
        },
        {
          label: "Tax",
          headerKey: "headerTax",
          key: "tax",
          style: { "width": "15%" }
        },
        {
          label: "Amount",
          headerKey: "headerAmount",
          key: "amount",
          style: { "width": "15%" }
        }
      ]
    }
  },
  methods: {
    companyProfile() {
      return company
    },
    paymentProfile() {
      const invoice = this.invoice.customer.billingInfo.find(({ _id }) => _id === this.invoice.clientBillingInfo)
      const { officialName, address } = invoice
      const { city, country, state, street1, street2, vat, zipCode } = address
      return {
        getOfficialName: () => officialName || '',
        getAddress: () => `${ street1 || '' }${ street2 && '. ' }${ street2 || '' }`,
        getState: () => state || '',
        getCity: () => city || '',
        getZipCode: () => zipCode || '',
        getCityWithCode() {
          return `${ this.getCity() }${ this.getZipCode() && ', ' }${ this.getZipCode() }`
        },
        getCountry: () => country || '',
        getVat: () => vat || ''
      }
    },
    goToEdit() {
      this.$router.push(`/pangea-finance/receivables-reports/invoice/${ this.$route.params.id }/edit`)
    },
    async getInvoice() {
      this.invoice = (await this.$http.get(`/invoicing/invoice/${ this.$route.params.id }`)).data
    }
  },
  created() {
    this.getInvoice()
  }
}
</script>

<style scoped lang="scss">
@import "../../assets/scss/colors";

.template {
  width: 900px;
  box-sizing: border-box;
  margin: 50px;
  border-radius: 2px;
  box-shadow: $box-shadow;
  padding: 25px;
  background: white;
}

.subheader {
  display: flex;
  justify-content: space-between;
  margin: 25px 0;
}

.row {
  display: flex;
  height: 24px;
  align-items: center;

  &__key {
    width: 110px;
  }

  &__value {
    width: 150px;
  }
}

.header {
  display: flex;
  justify-content: space-between;

  &__data {
    width: 260px;

    &-total {
      display: flex;
      gap: 15px;
      align-items: center;

      &-amount {
        font-family: Myriad900;
      }
    }

    &-title {
      margin: 6px 0;
      font-size: 28px;
    }

    &-number {
      margin: 6px 0;
      font-size: 16px;
    }

    &-line {
      height: 16px;
      background: $green;
      margin-right: -25px;
    }
  }

  &__logo {
    &-company {
      margin-top: 25px;
    }

    &-image {
      width: 220px;
    }
  }
}

.profile {
  &__name {
    font-family: Myriad600;
  }

  &__text,
  &__name {
    margin: 5px 0;
  }
}


.table {
  &__header,
  &__data {
    padding: 0 7px;
  }
}
</style>