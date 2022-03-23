<template lang="pug">
  .template
    .template__header
      .header
        .header__logo
          .header__logo-image
            img(src="../../../assets/images/latest-version/navbar-logo.svg")

          .header__logo-company
            .profile__name {{ companyProfile().name }}
            .profile__text {{ companyProfile().address }}
            .profile__text {{ companyProfile().country }}, {{ companyProfile().city }}, {{ companyProfile().postCode }}
            .profile__text {{ companyProfile().taxId }}


        .header__data
          .header__data-line
          .header__data-title Invoice
          .header__data-number {{invoice.invoiceId}}
          .row
            .row__key Balance Due:
            .row__value.row__value-bold EUR 123.123


      .subheader
        .subheader__left
          .profile__name {{ paymentProfile().getOfficialName() }}
          .profile__text {{ paymentProfile().getAddress() }}
          .profile__text(v-if="paymentProfile().getState()" ) {{ paymentProfile().getState() }}
          .profile__text {{ paymentProfile().getCityWithCode() }}
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

        .body__subtable
          .table-details
            .row
              .row__key Sub Total:
              .row__value EUR 222
            .row
              .row__key VAT:
              .row__value EUR 222
            .row
              .row__key Total:
              .row__value EUR 222
            .splitter
            .row
              .row__key Balance Due:
              .row__value.row__value-bold EUR 222
</template>

<script>
import { company } from "../../../../enums"
import GeneralTable from "../../GeneralTable"

export default {
  name: "InvoiceDetailsPDF",
  components: { GeneralTable },
  props: {
    invoice: {
      type: Object
    }
  },
  data() {
    return {
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
        getCountry: () => country || '',
        getCityWithCode() {
          return `${ this.getCountry() }${ this.getCity() && ', ' }${ this.getCity() }${ this.getZipCode() && ', ' }${ this.getZipCode() }`
        },
        getVat: () => vat || ''
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors";

.template {
  width: 840px;
  box-sizing: border-box;
  border-radius: 2px;
  box-shadow: $box-shadow;
  padding: 40px;
  background: white;
}

.subheader {
  display: flex;
  justify-content: space-between;
  margin: 15px 0 32px 0px;
  padding-bottom: 25px;
  border-bottom: 1px solid $green;
}

.row {
  display: flex;
  height: 30px;
  align-items: center;

  &__key {
    width: 120px;
    margin-right: 10px;
  }

  &__value {
    width: 150px;

    &-bold {
      font-family: Myriad600;
    }
  }
}

.header {
  display: flex;
  justify-content: space-between;
  gap: 25px;

  &__data {
    width: 280px;

    &-title {
      margin: 10px 0;
      font-size: 30px;
      font-family: Myriad300;
    }

    &-number {
      margin: 7px 0;
      font-family: Myriad600;
      font-size: 16px;
    }

    &-line {
      height: 20px;
      background: $green;
      margin-right: -40px;
    }
  }

  &__logo {
    &-company {
      margin-top: 25px;
    }

    &-image {
      width: 230px;
    }
  }
}

.body {
  &__subtable {
    display: flex;
    justify-content: end;

    .table-details {
      margin-top: 25px;
    }
  }
}

.profile {
  &__name {
    font-family: Myriad600;
  }

  &__text,
  &__name {
    margin: 7px 0;
  }
}


.table {
  &__header,
  &__data {
    padding: 0 7px;
  }
}

.splitter {
  margin-top: 6px;
  margin-bottom: 6px;
  height: 1px;
  background-color: $light-border;
  width: 100%;
}
</style>