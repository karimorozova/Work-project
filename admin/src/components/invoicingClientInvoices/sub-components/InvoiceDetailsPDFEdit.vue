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
            .row__value.row__value-bold
              span(style="margin-right: 5px;" v-html="returnIconCurrencyByStringCode(invoice.customer.currency)" )
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
          .body__modal(v-if="isOpenNewModalEdit")
            .body__modal-title Add Item
            .body__modal-item
              span Title:
              input(type="text" v-model="itemTitle")
            .body__modal-item
              span Quantity:
              input(type="number" v-model="itemQuantity")
            .body__modal-item
              span Rate:
              input(type="number" v-model="itemRate")
            .body__modal-buttons
              Button(value="Add" @clicked="saveItem('Custom', null)")
              Button(value="Cancel" @clicked="closeNewItemModal" :outline="true")

          GeneralTable(
            :fields="fieldsItems"
            :tableData="invoice.items"
            :isDarkMode="true"
          )
            template(v-for="field in fieldsItems" :slot="field.headerKey" slot-scope="{ field }")
              .table__header {{ field.label }}

          .add
            Add(@add="openItemModal" v-if="!isOpenModalEdit && !isOpenNewModalEdit")
            .add__modal(v-if="isOpenModalEdit")
              .selectList
                .selectList__close(@click="closeItemModal")
                  span &#215;
                .selectList__item(v-for="item in listOfClientReports" @click="closeItemModal(), saveItem('Report', item._id)")
                  span {{ item.reportId }} -
                  span(style="margin-left: 3px;") {{ item.total }}
                  span(style="margin-left: 3px;" v-html="returnIconCurrencyByStringCode(invoice.customer.currency)" )
                .selectList__item.selectList__item-flex(@click="openNewItemModal")
                  span
                    i.fas.fa-plus
                  span Add Custom Item


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
              .row__value
                span(style="margin-right: 5px;" v-html="returnIconCurrencyByStringCode(invoice.customer.currency)" )
                span {{ takeInvoiceFinance().total }}
            .splitter
            .row
              .row__key Balance Due:
              .row__value.row__value-bold
                span(style="margin-right: 5px;" v-html="returnIconCurrencyByStringCode(invoice.customer.currency)" )
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
import {getAmountByPercent, getInvoiceFinance} from "../../../../invoicing/helpers"
import Button from "../../Button";
import {mapActions} from "vuex";
// import {ObjectId} from "mongoose";

export default {
  mixins: [ currencyIconDetected ],
  name: "InvoiceDetailsPDFEdit",
  components: {Button, SelectSingle, Add, GeneralTable, DatePicker },
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
      paymentTerms: [],


      // editedId: null,

      itemTitle: '',
      itemQuantity: 1,
      itemRate: 0,

      isOpenModalEdit: false,
      isOpenNewModalEdit: false,

      listOfClientReports: [],

      defaultItem: {
        reportId : null,
        quantity : 0,
        rate : 0,
        vatAmount : 0,
        vatPercents : 0,
        discountsAmount : 0,
        discountsPercents : 0,
        surchargesAmount : 0,
        surchargesPercents : 0,
        amount : 0,
        title : '',
        // type : "Custom"
      }
    }
  },
  methods: {
    ...mapActions({
      alertToggle: 'alertToggle'
    }),
    openNewItemModal(){
      this.isOpenNewModalEdit = true
      this.closeItemModal()
    },
    closeNewItemModal(){
      this.isOpenNewModalEdit = false
      this.itemTitle= ''
      this.itemQuantity= 1
      this.itemRate= 0
    },
    openItemModal(){
      this.isOpenModalEdit = true
      this.getItemsReports()
    },
    closeItemModal(){
      this.isOpenModalEdit = false
    },
    async saveItem(type, _reportId){
      let item = { ...this.defaultItem }
      item.type = type

      if(type === 'Custom'){
        item.rate = this.itemRate
        item.quantity = this.itemQuantity
        item.amount = item.rate * item.quantity
      }else{
        const report = this.listOfClientReports.find(i => i._id === _reportId)
        item.reportId = _reportId
        item.title = 'Language Service: report ' + report.reportId
        item.rate = report.total
        item.amount = report.total
        item.type = "Report"
      }

      const { customer: { billingInfo }, clientBillingInfo } = this.invoice
      const currBI = billingInfo.find(item => item._id.toString() === clientBillingInfo.toString())

      if (currBI.address && currBI.address.country === 'Cyprus') {
        item.vatPercents = 19
        item.vatAmount = getAmountByPercent(item.amount, 19)
      }
      if(!!item.vatAmount) item.amount = +(item.amount + item.vatAmount).toFixed(2)

      this.modifyInvoice('items', [...this.invoice.items, item])

      this.closeNewItemModal()

      // try {
      //   await this.$http.post(`/invoicing/invoice/${ this.invoice._id }/create-item/`, {
      //     reportId: null,
      //     title: this.itemTitle,
      //     quantity: this.itemQuantity,
      //     rate: this.itemRate,
      //     amount,
      //     type: "Custom"
      //   })
      //   this.alertToggle({ message: "Item created", isShow: true, type: "success" })
      // } catch (err) {
      // }finally {
      //   this.closeNewItemModal()
      // }
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
    async getItemsReports(){
      const existingReports = (item) => !this.invoice.items.map(i => `${i.reportId}`).includes(`${item._id}`)
      try{
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

  &__table{
    position: relative;
  }

  &__modal{
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

    &-item{
      display: flex;
      align-items: center;
      width: 300px;
      justify-content: space-between;
      height: 44px;
    }

    &-title{
      font-size: 16px;
      font-family: Myriad600;
      margin-bottom: 15px;
    }

    &-buttons{
      display: flex;
      gap: 20px;
      justify-content: center;
      margin-top: 20px;
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

.add{
  position: relative;
  height: 27px;
  margin-top: 10px;

  &__modal{
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
  .selectList{

    &__close {
      padding: 5px;
      font-size: 22px;
      cursor: pointer;
      text-align: right;
      margin-right: 6px;
      color: $dark-border;

      &:hover {
        color: $text;
      }
    }

    &__item{
      padding: 10px;
      border-bottom: 1px solid $light-border;
      cursor: pointer;
      font-size: 14px;
      transition: .1s ease-out;
      display: flex;
      align-items: center;
      color: $text;

      &-flex{
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
