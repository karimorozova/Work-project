<template lang="pug">
  .template
    .full-modal(v-if="isOpenJobsModal")
      .full-modal__close
        IconButton(
          popupText="Close reports modal"
          @clicked="closeAllJobsModal()"
        )
          i(class="fa-solid fa-circle-xmark")
      AddReports

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
            .row__value.row__value-bold
              span( v-html="returnIconCurrencyByStringCode(invoice.customer.currency)" )
              span {{ takeInvoiceFinance().total }}


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
          .body__modal(v-if="isOpenModalAddItem || isOpenModalEditItem")
            .body__modal-title {{ isOpenModalAddItem ? 'Add Item' : 'Edit Item' }}
            .body__modal-cols
              .body__modal-col1
                .body__modal-item
                  span Title:
                  input(type="text" v-model="title" placeholder="Value")
                .body__modal-item
                  span Quantity:
                  input(type="number" :disabled="editedInvoiceItemType === 'Report'" v-model="quantity" placeholder="Value")
                .body__modal-item
                  span Rate:
                  input(type="number" :disabled="editedInvoiceItemType === 'Report'" v-model="rate" placeholder="Value")
              .body__modal-col2
                .body__modal-item
                  span(style="width: 70px;") Tax:
                  input.w-90(type="number" v-model="tax"  placeholder="Value")
                  .input-option
                    SelectSingle(
                      :selectedOption="taxType"
                      :options="['Percent', 'Currency']"
                      @chooseOption="({option}) => setItemOption(option, 'taxType')"
                    )
                .body__modal-item
                  span(style="width: 70px;") Discounts:
                  input.w-90(type="number" v-model="discount" placeholder="Value")
                  .input-option
                    SelectSingle(
                      :selectedOption="discountType"
                      :options="['Percent', 'Currency']"
                      @chooseOption="({option}) => setItemOption(option, 'discountType')"
                    )

            .body__modal-buttons
              Button(value="Save" @clicked="isOpenModalAddItem ? saveNewItem('Custom', null) : saveEditItem()")
              Button(value="Cancel" @clicked="closeItemsModal" :outline="true")

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
            template(slot="icons" slot-scope="{ row, index }")
              .table__icons
                .table__icon(@click="openItemModalEdit(index)")
                  i(class="fas fa-pen")
                .table__icon(@click="deleteItem(index)")
                  i(class="fas fa-trash")

          .add
            Add(@add="openOptionsModal" v-if="!isOpenModalOptions && !isOpenModalAddItem && !isOpenModalEditItem")
            .add__modal(v-if="isOpenModalOptions")
              .selectList
                .selectList__close(@click="closeOptionsModal")
                  span &#215;
                .selectList__item(v-for="item in listOfClientReports" @click="closeOptionsModal(), saveNewItem('Report', item._id)")
                  span {{ item.reportId }} -
                  span(style="margin-left: 3px;") {{ +(item.total).toFixed(2) }}
                  span(style="margin-left: 3px;" v-html="returnIconCurrencyByStringCode(invoice.customer.currency)" )

                //.selectList__item.selectList__item-flex(@click="openAllJobsModal")
                //  span
                //    i.fas.fa-plus
                //  span Generate Report
                .selectList__item.selectList__item-flex(@click="openItemModalAdd")
                  span
                    i.fas.fa-plus
                  span Add Custom Item

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
import '../../../assets/scss/datepicker.scss'
import DatePicker from 'vue2-datepicker'
import GeneralTable from "../../GeneralTable"
import Add from "../../Add"
import SelectSingle from "../../SelectSingle"
import moment from "moment"
import currencyIconDetected from "../../../mixins/currencyIconDetected"
import { getAmountByPercent, getInvoiceFinance } from "../../../../invoicing/helpers"
import Button from "../../Button"
import { mapActions } from "vuex"
import AddReports from "../../invoicingClientReports/AddReports"
import IconButton from "../../IconButton"

export default {
  mixins: [ currencyIconDetected ],
  name: "InvoiceDetailsPDFEdit",
  components: { IconButton, AddReports, Button, SelectSingle, Add, GeneralTable, DatePicker },
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
          style: { "width": "40%" }
        },
        {
          label: "Rate",
          headerKey: "headerRate",
          key: "rate",
          style: { "width": "40%" }
        },
        {
          label: "Discount",
          headerKey: "headerDiscount",
          key: "discount",
          style: { "width": "40%" }
        },
        {
          label: "Tax",
          headerKey: "headerTax",
          key: "tax",
          style: { "width": "40%" }
        },
        {
          label: "Amount",
          headerKey: "headerAmount",
          key: "amount",
          style: { "width": "40%" }
        },
        {
          label: "",
          headerKey: "headerIcons",
          key: "icons",
          style: { width: "40%" }
        }
      ],
      paymentTerms: [],

      title: '',
      quantity: 1,
      rate: 0,
      tax: 0,
      taxType: 'Percents',
      discount: 0,
      discountType: 'Percents',

      itemEditingIndex: null,

      itemsForDelete: [],
      listOfClientReports: [],

      isOpenModalOptions: false,
      isOpenModalAddItem: false,
      isOpenModalEditItem: false,
      isOpenJobsModal: false,

      defaultItem: {
        title: '',
        reportId: null,
        quantity: 0,
        rate: 0,
        tax: 0,
        taxType: 'Percents',
        discount: 0,
        discountType: 'Percents',
        amount: 0,
        type: ''
      }
    }
  },
  methods: {
    ...mapActions({
      alertToggle: 'alertToggle'
    }),
    openItemModalAdd() {
      this.isOpenModalAddItem = true
      this.closeOptionsModal()
    },
    openItemModalEdit(index) {
      this.itemEditingIndex = index
      const item = this.invoice.items[index]
      this.title = item.title
      this.quantity = item.quantity
      this.rate = item.rate
      this.tax = item.tax
      this.taxType = item.taxType
      this.discount = item.discount
      this.discountType = item.discountType
      this.isOpenModalEditItem = true
    },
    closeItemsModal() {
      this.isOpenModalAddItem = false
      this.isOpenModalEditItem = false
      this.setDefaultData()
      this.itemEditingIndex = null
    },
    openOptionsModal() {
      this.isOpenModalOptions = true
      this.getItemsReports()
    },
    closeOptionsModal() {
      this.isOpenModalOptions = false
    },
    saveEditItem() {
      let item = this.invoice.items[this.itemEditingIndex]
      item.title = this.title
      item.rate = this.rate
      item.quantity = this.quantity
      item.amount = +(item.rate * item.quantity).toFixed(2)

      item = this.calcItemTaxAndDiscount(item)

      this.invoice.items.splice(this.itemEditingIndex, 1, item)
      this.modifyInvoice('items', this.invoice.items)
      this.closeItemsModal()
    },
    async saveNewItem(type, _reportId) {
      let item = { ...this.defaultItem }
      item.type = type

      if (type === 'Custom') {
        item.title = this.title
        item.rate = +(+this.rate).toFixed(2)
        item.quantity = +this.quantity
        item.amount = +(item.rate * item.quantity).toFixed(2)
      }

      if (type === 'Report') {
        const report = this.listOfClientReports.find(i => i._id === _reportId)
        item.reportId = _reportId
        item.title = 'Language Service: report ' + report.reportId
        item.rate = +(report.total).toFixed(2)
        item.amount = +(report.total).toFixed(2)
        item.quantity = 1
        //Cyprus
        const { customer: { billingInfo }, clientBillingInfo } = this.invoice
        const currBI = billingInfo.find(item => item._id.toString() === clientBillingInfo.toString())
        if (currBI.address && currBI.address.country === 'Cyprus') this.tax = 19
      }

      item = this.calcItemTaxAndDiscount(item)

      this.modifyInvoice('items', [ ...this.invoice.items, item ])
      this.closeItemsModal()
    },
    calcItemTaxAndDiscount(item) {
      if (this.discount) {
        item.discount = +this.discount
        if (this.discountType === 'Currency') {
          item.discountType = 'Currency'
          item.amount = +(item.amount - item.discount).toFixed(2)
        } else {
          item.discountType = 'Percents'
          const discountTotal = getAmountByPercent(item.amount, item.discount)
          item.amount = +(item.amount - discountTotal).toFixed(2)
        }
      }
      if (this.tax) {
        item.tax = +this.tax
        if (this.taxType === 'Currency') {
          item.taxType = 'Currency'
          item.amount = +(item.amount + item.tax).toFixed(2)
        } else {
          item.taxType = 'Percents'
          const taxTotal = getAmountByPercent(item.amount, item.tax)
          item.amount = +(item.amount + taxTotal).toFixed(2)
        }
      }
      return item
    },
    deleteItem(index) {
      const deletedItem = this.invoice.items.splice(index, 1)
      this.itemsForDelete.push(...deletedItem)
      this.modifyInvoice('items', [ ...this.invoice.items ])
    },
    setItemOption(option, prop) {
      this[prop] = option
    },
    takeInvoiceFinance() {
      return getInvoiceFinance(this.invoice)
    },
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
    },
    async getItemsReports() {
      const existingReports = (item) => !this.invoice.items.map(i => `${ i.reportId }`).includes(`${ item._id }`)
      try {
        this.listOfClientReports = (await this.$http.post('/invoicing/reports-list/', {
          query: {
            invoice: null,
            client: this.invoice.customer._id,
            clientBillingInfo: this.invoice.clientBillingInfo
          }
        })).data.filter(existingReports)
      } catch (err) {
        this.alertToggle({ message: "Error on getting Reports", isShow: true, type: "error" })
      }
    },
    setDefaultData() {
      this.title = ''
      this.quantity = 1
      this.rate = 0
      this.tax = 0
      this.taxType = 'Percents'
      this.discount = 0
      this.discountType = 'Percents'
      this.itemEditingIndex = null
    },
    openAllJobsModal() {
      this.closeOptionsModal()
      let elem = document.getElementsByTagName('body')[0]
      elem.classList.add("hiddenScroll")
      this.$router.replace({ path: this.$route.path, query: { clientBillingInfo: this.invoice.clientBillingInfo } }).then(() => {
        this.isOpenJobsModal = true
      })
    },
    closeAllJobsModal() {
      this.closeOptionsModal()
      let elem = document.getElementsByTagName('body')[0]
      elem.classList.remove("hiddenScroll")
      this.$router.replace({ path: this.$route.path, query: {} }).then(() => {
        this.isOpenJobsModal = false
      })
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
    },
    editedInvoiceItemType() {
      return this.invoice.items[this.itemEditingIndex]?.type
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
  margin: 15px 0 32px 0;
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

  &__table {
    position: relative;
  }

  &__modal {
    position: absolute;
    box-shadow: $box-shadow;
    padding: 25px;
    overflow: auto;
    left: 50%;
    top: 49%;
    transform: translateX(-50%) translateY(-49%);
    background: white;
    z-index: 3;
    box-sizing: border-box;

    &-cols {
      display: flex;
    }

    &-col2 {
      margin-left: 26px;
      padding-left: 25px;
      border-left: 1px solid $light-border;
    }

    &-item {
      display: flex;
      align-items: center;
      width: 300px;
      justify-content: space-between;
      height: 44px;
    }

    &-title {
      font-size: 16px;
      font-family: Myriad600;
      margin-bottom: 15px;
    }

    &-buttons {
      display: flex;
      gap: 20px;
      justify-content: center;
      margin-top: 24px;
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

.add {
  position: relative;
  height: 27px;
  margin-top: 10px;

  &__modal {
    position: absolute;
    box-shadow: $box-shadow;
    width: 220px;
    max-height: 350px;
    overflow: auto;
    //left: 50%;
    //top: 49%;
    //transform: translateX(-50%) translateY(-49%);
    background: white;
    z-index: 2;
    box-sizing: border-box;
  }

  .selectList {

    &__close {
      padding: 5px;
      font-size: 22px;
      cursor: pointer;
      text-align: center;
      color: $dark-border;
      border-bottom: 1px solid $light-border;

      &:hover {
        color: $text;
      }
    }

    &__item {
      padding: 10px;
      border-bottom: 1px solid $light-border;
      cursor: pointer;
      font-size: 14px;
      transition: .1s ease-out;
      display: flex;
      align-items: center;
      color: $text;

      &-flex {
        display: flex;
        gap: 10px;
      }

      &:last-child {
        border: none;
      }

      &:hover {
        background-color: $list-hover;
      }
    }
  }
}


.table {
  &__header,
  &__data {
    padding: 0 7px;
  }

  &__icons {
    display: flex;
    gap: 12px;
    justify-content: center;
    width: 100%;
  }

  &__icon {
    cursor: pointer;
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

.w-90 {
  width: 95px;
  margin-right: -10px;
}

.input-option {
  height: 32px;
  width: 110px;
  position: relative;
}

.full-modal {
  position: fixed;
  left: 255px;
  top: 0;
  box-sizing: border-box;
  width: calc(100% - 255px);
  box-shadow: $box-shadow;
  background: white;
  border-radius: 2px;
  z-index: 30000;
  height: 100%;

  &__close {
    position: absolute;
    left: 290px;
    top: 10px;
  }
}

.table-symbol {
  color: $dark-border;
  margin-left: 4px;
}
</style>
