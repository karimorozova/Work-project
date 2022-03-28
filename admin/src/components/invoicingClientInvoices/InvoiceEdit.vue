<template lang="pug">
  .invoicing-layout(v-if="invoice._id" )
    .invoicing-layout__rightSide
      InvoiceDetailsPDFEdit(
        :invoice="invoice"
        @modifyInvoice="modifyInvoiceByPropValue"
      )
    .invoicing-layout__leftSide
      InvoiceDetailsSubInfoEdit(
        :invoice="invoice"
        @modifyInvoice="modifyInvoiceByPropValue"
      )
      InvoiceDetailsActionsEdit(
        @save="saveInvoiceChanges"
      )
</template>

<script>
import SelectSingle from "../SelectSingle"
import Button from "../Button"
import IconButton from "../IconButton"
import GeneralTable from "../GeneralTable"
import '../../assets/scss/datepicker.scss'
import DatePicker from 'vue2-datepicker'
import { mapActions, mapGetters } from "vuex"
import crudIcons from "../../mixins/crudIcons"

import InvoiceDetailsPDFEdit from "./sub-components/InvoiceDetailsPDFEdit"
import InvoiceDetailsActionsEdit from "./sub-components/InvoiceDetailsActionsEdit"
import InvoiceDetailsSubInfoEdit from "./sub-components/InvoiceDetailsSubInfoEdit"

export default {
  components: {
    InvoiceDetailsSubInfoEdit,
    InvoiceDetailsActionsEdit,
    InvoiceDetailsPDFEdit,
    SelectSingle,
    DatePicker,
    Button,
    GeneralTable,
    IconButton
  },
  data() {
    return {
      invoice: {},
    }
  },
  methods: {
    // setTerms({ option }) {
    //   this.$set(this.invoice, 'terms', option)
    // },
    // addNewItem() {
    //   if (typeof this.editedId === 'number') return
    //
    //   this.invoice.items.push({
    //     title: '',
    //     quantity: 0,
    //     rate: 0,
    //     tax: 0,
    //     amount: 0
    //   })
    //
    //   this.editedId = this.invoice.items.length - 1
    //   // this.$set(this.invoice, 'items', this.invoice.it)
    // },
    // isActive(key, index, id) {
    //   if (this.editedId === id || this.editedId === index) {
    //     return key !== "edit"
    //   } else {
    //     return key !== "save" && key !== "cancel"
    //   }
    // },
    // findItemById(id) {
    //   console.log(this.invoice)
    //   return this.invoice.items.find(({ _id }) => _id.toString() === id)
    // },
    // setEditedData({ title = '', rate = 0, quantity = 0, tax = 0, amount = 0 }) {
    //   this.title = title
    //   this.rate = rate
    //   this.quantity = quantity
    //   this.tax = tax
    //   this.amount = amount
    // },
    // async makeAction(key, id, index) {
    //   console.log({ test: this.editedId, index, id })
    //   if (this.editedId != null && !(this.editedId === id || this.editedId === index)) return
    //   if (id == null && key === 'save') {
    //     await this.createItem()
    //   } else {
    //     switch (key) {
    //       case 'edit':
    //         if (this.editedId != null) return
    //         this.editedId = id
    //         const item = this.findItemById(id)
    //         this.setEditedData(item)
    //         break
    //       case 'save':
    //         if (this.editedId == null) return
    //         await this.$http.put(`/invoicing/invoice/${ this.$route.params.id }/item/${ id }`, {
    //           title: this.title,
    //           quantity: this.quantity,
    //           rate: this.rate,
    //           tax: this.tax,
    //           amount: this.amount
    //         })
    //         this.editedId = null
    //         this.clearEditCreateFields()
    //         await this.getInvoice()
    //         break
    //       case 'cancel':
    //         if (this.editedId == null) return
    //         this.editedId = null
    //         this.setEditedData({})
    //         break
    //       case 'delete':
    //         // if (this.editedId != null ) return
    //         await this.$http.delete(`/invoicing/invoice/${ this.$route.params.id }/item/${ id }`)
    //         this.editedId = null
    //         this.clearEditCreateFields()
    //         await this.getInvoice()
    //         break
    //     }
    //   }
    //
    // },
    // clearEditCreateFields() {
    //   this.title = ''
    //   this.quantity = 0
    //   this.rate = 0
    //   this.tax = 0
    //   this.amount = 0
    // },
    // async editItem() {
    //   await this.$http.post(`/invoicing/invoice/${ this.$route.params.id }/item`, {
    //     title: this.title,
    //     quantity: this.quantity,
    //     rate: this.rate,
    //     tax: this.tax,
    //     amount: this.amount
    //   })
    // },
    // async createItem() {
    //   await this.$http.post(`/invoicing/invoice/${ this.$route.params.id }/item`, {
    //     title: this.title,
    //     quantity: this.quantity,
    //     rate: this.rate,
    //     tax: this.tax,
    //     amount: this.amount
    //   })
    //   this.editedId = null
    //   this.clearEditCreateFields()
    //   await this.getInvoice()
    // },


    //DONE!! ==========>>>
    ...mapActions([ 'alertToggle' ]),
    modifyInvoiceByPropValue({ prop, value }) {
      this.$set(this.invoice, prop, value)
    },
    checkSaves() {
      {
        if (!this.invoice.invoiceId.includes('_')) this.invoice.invoiceId = 'INV_' + this.invoice.invoiceId
        let num = this.invoice.invoiceId.split('_')[1]
        if (!num) num = '000000'
        this.invoice.invoiceId = 'INV_' + num.split('').map(i => +i).filter(Number.isInteger).join('')
      }
    },
    async saveInvoiceChanges() {
      this.checkSaves()
      try {
        const reportsItems = this.invoice.items.filter(i => i.type === 'Report')
        if(reportsItems.length){
          for await (const report of reportsItems) {
            await this.$http.post(`/invoicing-receivables/update-report`, {_reportId: report.reportId, updates: { invoice: this.invoice._id } })
          }
        }
        this.invoice = (await this.$http.post(`/invoicing/invoice/${ this.$route.params.id }`, this.invoice)).data
        await this.$router.push(`/pangea-finance/receivables-reports/invoice/${ this.$route.params.id }`)
        this.alertToggle({ message: "Invoice updated", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: err.message, isShow: true, type: "error" })
      }
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

.invoicing-layout {
  margin: 50px;
  display: flex;
  gap: 25px;
}
</style>
