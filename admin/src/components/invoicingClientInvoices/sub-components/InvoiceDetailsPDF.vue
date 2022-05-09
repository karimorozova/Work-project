<template lang="pug">
  .template
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
            .row__value.row__value-bold
              span( v-html="returnIconCurrencyByStringCode(invoice.customer.currency)" )
              span {{ takeInvoiceFinance().total }}

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
            .row__value {{ getTime(invoice.invoicingDate)  }}
          .row
            .row__key Terms:
            .row__value {{ invoice.terms.name }}
          .row
            .row__key Due Date:
            .row__value {{ getTime(invoice.dueDate) }}

      .body
        .body__table
          GeneralTable(
            :fields="fieldsItemsFiltered"
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
              .table__data
                span {{ row.rate }}
            template(slot="discount" slot-scope="{ row, index }")
              .table__data
                span {{ row.discount }}
                span.table-symbol(v-if="row.discountType === 'Currency'" v-html="returnIconCurrencyByStringCode(invoice.customer.currency)")
                span.table-symbol(v-else) %
            template(slot="tax" slot-scope="{ row, index }")
              .table__data
                span {{ row.tax }}
                span.table-symbol(v-if="row.taxType === 'Currency'" v-html="returnIconCurrencyByStringCode(invoice.customer.currency)")
                span.table-symbol(v-else) %
            template(slot="amount" slot-scope="{ row, index }")
              .table__data
                span {{ row.amount }}
                span.table-symbol(v-html="returnIconCurrencyByStringCode(invoice.customer.currency)")

        .body__subtable
          .table-details
            .row
              .row__key Sub Total:
              .row__value
                span( v-html="returnIconCurrencyByStringCode(invoice.customer.currency)" )
                span {{ takeInvoiceFinance().subTotal }}

            .row(v-if="takeInvoiceFinance().vat")
              .row__key VAT:
              .row__value
                span( v-html="returnIconCurrencyByStringCode(invoice.customer.currency)" )
                span {{ takeInvoiceFinance().vat }}

            .row(v-if="takeInvoiceFinance().discount" )
              .row__key Discount:
              .row__value
                span( v-html="returnIconCurrencyByStringCode(invoice.customer.currency)" )
                span {{ takeInvoiceFinance().discount }}
            .row
              .row__key Total:
              .row__value
                span( v-html="returnIconCurrencyByStringCode(invoice.customer.currency)" )
                span {{ takeInvoiceFinance().total }}
            .splitter
            .row
              .row__key Balance Due:
              .row__value.row__value-bold
                span( v-html="returnIconCurrencyByStringCode(invoice.customer.currency)" )
                span {{ takeInvoiceFinance().total }}

</template>

<script>
import { company } from "../../../../enums"
import GeneralTable from "../../GeneralTable"
import moment from "moment"
import currencyIconDetected from "../../../mixins/currencyIconDetected"
import { getInvoiceFinance } from '../../../../invoicing/helpers'

export default {
  name: "InvoiceDetailsPDF",
  mixins: [ currencyIconDetected ],
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
          style: { "width": "100%" }
        },
        {
          label: "Quantity",
          headerKey: "headerQuantity",
          key: "quantity",
          style: { "width": "50%" }
        },
        {
          label: "Rate",
          headerKey: "headerRate",
          key: "rate",
          style: { "width": "50%" }
        },
        {
          label: "Discount",
          headerKey: "headerDiscount",
          key: "discount",
          style: { "width": "50%" }
        },
        {
          label: "Tax",
          headerKey: "headerTax",
          key: "tax",
          style: { "width": "50%" }
        },
        {
          label: "Amount",
          headerKey: "headerAmount",
          key: "amount",
          style: { "width": "50%" }
        }
      ]
    }
  },
  methods: {
    getTime(date) {
      return moment(date).format('DD/MM/YYYY')
    },
    takeInvoiceFinance() {
      return getInvoiceFinance(this.invoice)
    },
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
  },
  computed: {
    fieldsItemsFiltered() {
      const items = this.invoice.items
      const hasTax = this.invoice.items.some(j => !!j.tax)
      const hasDiscount = this.invoice.items.some(k => !!k.discount)
      return this.fieldsItems
        .filter(item => (!items.length || !hasTax) ? item.key !== 'tax' : item)
        .filter(item => (!items.length || !hasDiscount) ? item.key !== 'discount' : item)
    }
  },
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
      margin: 15px 0 10px;
      font-size: 30px;
      font-family: Myriad300;
    }

    &-number {
      margin: 7px 0;
      font-family: Myriad600;
      font-size: 16px;
    }

    &-line {
      height: 18px;
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
.table-symbol{
  color: $dark-border;
  margin-left: 4px;
}
</style>
