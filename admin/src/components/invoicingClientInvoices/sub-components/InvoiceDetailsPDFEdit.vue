<template lang="pug">
  .template
    .template__header
      .header
        .header__logo
          .header__logo-image
            img(src="../../../assets/images/latest-version/navbar-logo.svg")

          .header__logo-company
            .row-edit
              .row-edit__key Company:
              .row-edit__value INPUT SOON
            //.profile__name {{ companyProfile().name }}
            //.profile__text {{ companyProfile().address }}
            //.profile__text {{ companyProfile().country }}, {{ companyProfile().city }}, {{ companyProfile().postCode }}
            //.profile__text {{ companyProfile().taxId }}


        .header__data
          .header__data-line
          .header__data-title Invoice

          .header__data-number
            input(:value="invoice.invoiceId" @keyup="(e) => modifyInvoice('invoiceId', e.target.value)")

          .row
            .row__key Balance Due:
            .row__value.row__value-bold EUR 123.123


      .subheader
        .subheader__left
          .row-edit
            .row-edit__key Client:
            .row-edit__value INPUT SOON
          .row-edit
            .row-edit__key Payment Profile:
            .row-edit__value INPUT SOON
          //.profile__name {{ paymentProfile().getOfficialName() }}
          //.profile__text {{ paymentProfile().getAddress() }}
          //.profile__text(v-if="paymentProfile().getState()" ) {{ paymentProfile().getState() }}
          //.profile__text {{ paymentProfile().getCityWithCode() }}
          //.profile__text {{ paymentProfile().getVat() }}

        .subheader__right
          .row-edit
            .row-edit__key Invoice Date:
            .row-edit__value
              .drop
                DatePicker(
                  :value="new Date(invoice.invoicingDate)"
                  @input="(e) => modifyInvoice('invoicingDate',e)"
                  format="DD/MM/YYYY"
                  prefix-class="xmx"
                  :clearable="false"
                  type="date"
                  placeholder="Date"
                  :confirm="true"
                  confirm-text="Set date"
                )

          .row-edit
            .row-edit__key Terms:
            .row-edit__value
              .dropbox
                SelectSingle(
                  placeholder="Option"
                  :options="paymentTerms.map(i => i.name)"
                  :selectedOption="invoice.terms.name"
                  @chooseOption="setPaymentTerms"
                )
          .row-edit
            .row-edit__key Due Date:
            .row-edit__value
              .drop
                DatePicker(
                  :value="new Date(invoice.dueDate)"
                  @input="(e) => modifyInvoice('dueDate',e)"
                  format="DD/MM/YYYY"
                  prefix-class="xmx"
                  :clearable="false"
                  type="date"
                  placeholder="Date"
                  :confirm="true"
                  confirm-text="Set date"
                )

      .body
        .body__table
          GeneralTable(
            :fields="fieldsItems"
            :tableData="invoice.items"
            :isDarkMode="true"
          )
            template(v-for="field in fieldsItems" :slot="field.headerKey" slot-scope="{ field }")
              .table__header {{ field.label }}

            //template(slot="title" slot-scope="{ row, index }")
            //  .table__data(v-if="editedId === row._id || editedId === index")
            //    input(type="text" placeholder="Value" v-model="title")
            //  .table__data(v-else) {{ row.title }}
            //template(slot="quantity" slot-scope="{ row, index }")
            //  .table__data(v-if="editedId === row._id || editedId === index")
            //    input(type="text" placeholder="Value" v-model="quantity")
            //  .table__data(v-else) {{ row.quantity }}
            //template(slot="rate" slot-scope="{ row, index }")
            //  .table__data(v-if="editedId === row._id || editedId === index")
            //    input(type="text" placeholder="Value" v-model="rate")
            //  .table__data(v-else) {{ row.rate }}
            //template(slot="tax" slot-scope="{ row, index }")
            //  .table__data(v-if="editedId === row._id || editedId === index")
            //    input(type="text" placeholder="Value" v-model="tax")
            //  .table__data(v-else) {{ row.tax }}
            //template(slot="amount" slot-scope="{ row, index }")
            //  .table__data(v-if="editedId === row._id || editedId === index")
            //    input(type="text" placeholder="Value" v-model="amount")
            //  .table__data(v-else) {{ row.amount }}

          //  template(slot="icons" slot-scope="{ row, index }")
          //    .table__icons
          //      img.table__icon(
          //        v-for="(icon, key) in icons"
          //        :class="{'table__opacity': isActive(key, index, row._id)}"
          //        :src="icon.icon"
          //        @click="makeAction(key, row._id, index)"
          //      )
          //Add(@add="addNewItem")

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
import '../../../assets/scss/datepicker.scss'
import DatePicker from 'vue2-datepicker'
import GeneralTable from "../../GeneralTable"
import Add from "../../Add"
import SelectSingle from "../../SelectSingle"
import moment from "moment"

export default {
  name: "InvoiceDetailsPDFEdit",
  components: { SelectSingle, Add, GeneralTable, DatePicker },
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
          style: { "width": "12%" }
        },
        {
          label: "Rate",
          headerKey: "headerRate",
          key: "rate",
          style: { "width": "12%" }
        },
        {
          label: "Tax",
          headerKey: "headerTax",
          key: "tax",
          style: { "width": "12%" }
        },
        {
          label: "Amount",
          headerKey: "headerAmount",
          key: "amount",
          style: { "width": "12%" }
        },
        {
          label: "",
          headerKey: "headerIcons",
          key: "icons",
          style: { width: "12%" }
        }
      ],
      paymentTerms: []
    }
  },
  methods: {
    setPaymentTerms({ option }) {
      const terms = this.paymentTerms.find(i => i.name === option)
      this.modifyInvoice('terms', terms)
      this.modifyInvoice('dueDate', new Date(moment().add((terms.value || 21), 'days').format('YYYY-MM-DD')))
    },
    modifyInvoice(prop, value) {
      this.$emit('modifyInvoice', { prop, value })
    },
    async getPaymentTerms() {
      try {
        const result = await this.$http.get("/api-settings/payment-terms")
        const { paymentTerms } = result.data
        this.paymentTerms = paymentTerms
      } catch (err) {
        this.alertToggle({ message: "Error on getting Payment Terms", isShow: true, type: "error" })
      }
    }
  },
  created() {
    this.getPaymentTerms()
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

  &__right {
    margin-bottom: 5px;
  }
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

.row-edit {
  display: flex;
  height: 32px;
  align-items: center;
  margin-bottom: 10px;

  &:last-child {
    margin-bottom: 0;
  }

  &__key {
    width: 100px;
    margin-right: 10px;
  }

  &__value {
    width: 220px;

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
      min-height: 90px;
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

input {
  font-size: 14px;
  color: $text;
  border: 1px solid $border;
  border-radius: 2px;
  box-sizing: border-box;
  padding: 0 7px;
  outline: none;
  width: 220px;
  height: 32px;
  transition: .1s ease-out;

  &:focus {
    border: 1px solid $border-focus;
  }
}
</style>