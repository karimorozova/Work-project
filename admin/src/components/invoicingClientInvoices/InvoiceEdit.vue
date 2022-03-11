<template lang="pug">
  .invoice-edit
    .invoice-details__field
      .title Invoice ID
      .value {{invoice.invoiceId}}
    .invoice-details__field
      .title Customer Name
      .value {{invoice.customer.name}}
    .invoice-details__field
      .title Invoice Date
      DatePicker.range-with-one-panel-short(
        :value="new Date(invoice.invoicingDate)"
        @input="(e) => setInvoiceDate(e)"
        format="DD-MM-YYYY, HH:mm"
        prefix-class="xmx"
        :clearable="false"
        type="datetime"
        placeholder="Select datetime range"
      )
    .invoice-details__field
      .title Terms
      .drop-down
        SelectSingle(
          :options="terms",
          placeholder="Reports Actions",
          :selectedOption="invoice.terms",
          @chooseOption="setTerms"
        )

    .invoice-details__field
      .title Account Manager
      .drop-down
        SelectSingle(
          :options="allAMs",
          placeholder="Reports Actions",
          :selectedOption="currentAM",
          @chooseOption="setAm"
        )
    .invoice-details__field
      .title Due date
      DatePicker.range-with-one-panel-short(
        :value="new Date(invoice.dueDate)"
        @input="(e) => setDueDate(e)"
        format="DD-MM-YYYY, HH:mm"
        prefix-class="xmx"
        :clearable="false"
        type="datetime"
        placeholder="Select datetime range"
      )
    Button(value="Save" @clicked="saveChanges")

    GeneralTable.test(
      :fields="fieldsItems"
      :tableData="invoice.items"
      :isBodyShort="true"
    )
      template(v-for="field in fieldsItems" :slot="field.headerKey" slot-scope="{ field }")
        .table__header {{ field.label }}

      template(slot="title" slot-scope="{ row, index }")
        .table__data(v-if="editedId === row._id || editedId === index")
          input(type="text" placeholder="Value" v-model="title")
        .table__data(v-else) {{ row.title }}
      template(slot="quantity" slot-scope="{ row, index }")
        .table__data(v-if="editedId === row._id || editedId === index")
          input(type="text" placeholder="Value" v-model="quantity")
        .table__data(v-else) {{ row.quantity }}
      template(slot="rate" slot-scope="{ row, index }")
        .table__data(v-if="editedId === row._id || editedId === index")
          input(type="text" placeholder="Value" v-model="rate")
        .table__data(v-else) {{ row.rate }}
      template(slot="tax" slot-scope="{ row, index }")
        .table__data(v-if="editedId === row._id || editedId === index")
          input(type="text" placeholder="Value" v-model="tax")
        .table__data(v-else) {{ row.tax }}
      template(slot="amount" slot-scope="{ row, index }")
        .table__data(v-if="editedId === row._id || editedId === index")
          input(type="text" placeholder="Value" v-model="amount")
        .table__data(v-else) {{ row.amount }}

      template(slot="icons" slot-scope="{ row, index }")
        .table__icons
          img.table__icon(
            v-for="(icon, key) in icons"
            :class="{'table__opacity': isActive(key, index, row._id)}"
            :src="icon.icon"
            @click="makeAction(key, row._id, index)"
          )

    IconButton(@clicked="addNewItem")
      i(class="fa-solid fa-plus")
</template>

<script>
import SelectSingle from "../SelectSingle"
import Button from "../Button"
import IconButton from "../IconButton"
import GeneralTable from "../GeneralTable"
import '../../assets/scss/datepicker.scss'
import DatePicker from 'vue2-datepicker'
import { mapGetters } from "vuex"
import crudIcons from "../../mixins/crudIcons"

export default {
  mixins: [crudIcons],
  components: {
    SelectSingle,
    DatePicker,
    Button,
    GeneralTable,
    IconButton
  },
  data() {
    return {
      invoice: {},
      terms: ['test', 'test2', 'test3'],
      editedId: null,
      title: '',
      quantity: 0,
      rate: 0,
      tax:0,
      amount: 0,
      fieldsItems: [
        {
          label: "Title",
          headerKey: "headerTitle",
          key: "title",
          style: { "width": "160px" }
        },
        {
          label: "Quantity",
            headerKey: "headerQuantity",
            key: "quantity",
            style: { "width": "160px" }
        },
        {
          label: "Rate",
            headerKey: "headerRate",
            key: "rate",
            style: { "width": "160px" }
        },
        {
          label: "Tax",
            headerKey: "headerTax",
            key: "tax",
            style: { "width": "160px" }
        },
        {
          label: "Amount",
            headerKey: "headerAmount",
            key: "amount",
            style: { "width": "160px" }
        },
        {
          label: "",
          headerKey: "headerIcons",
          key: "icons",
          style: {width: "16%"},
          padding: "0"
        }
      ]
    }
  },
  methods: {
    async getInvoice() {
      console.log('test')
      this.invoice = (await this.$http.get(`/invoicing/invoice/${this.$route.params.id}`)).data
    },
    setDueDate(date) {
      this.$set(this.invoice, 'dueDate', date)
    },
    setAm({option}) {
      this.$set(this.invoice, 'accountManager', option)
    },
    setTerms({ option }) {
      this.$set(this.invoice, 'terms', option)
    },
    setInvoiceDate(date) {
      this.$set(this.invoice, 'invoicingDate', date)
    },
    addNewItem() {
      if (typeof this.editedId === 'number') return

      this.invoice.items.push({
        title: '',
        quantity: 0,
        rate: 0,
        tax:0,
        amount: 0,
      })

      this.editedId = this.invoice.items.length - 1
      // this.$set(this.invoice, 'items', this.invoice.it)
    },
    isActive(key, index, id) {
      if (this.editedId === id || this.editedId === index) {
        return key !== "edit"
      }else  {
        return key !== "save" && key !== "cancel"
      }

    },
    editItem() {

    },
    async makeAction(key, id, index) {
      console.log(key, id)
      if (id == null && key === 'create'){
        await this.createItem()
      } else {
        switch (key) {
          case 'edit':
            this.editedId = id

            break;
        }
      }

    },
    clearEditCreateFields() {
      this.title = ''
      this.quantity = 0
      this.rate = 0
      this.tax = 0
      this.amount = 0
    },
    // async editItem( ) {
    //   await this.$http.post(`/invoicing/invoice/${this.$route.params.id}/item`, {
    //     title:this.title,
    //     quantity:this.quantity,
    //     rate:this.rate,
    //     tax:this.tax,
    //     amount:this.amount,
    //   })
    // },
    async createItem() {
      await this.$http.post(`/invoicing/invoice/${this.$route.params.id}/item`, {
        title:this.title,
        quantity:this.quantity,
        rate:this.rate,
        tax:this.tax,
        amount:this.amount,
      })
      this.editedId = null
      this.clearEditCreateFields()
      await this.getInvoice()
    },
    async saveChanges() {
      this.invoice = (await this.$http.post(`/invoicing/invoice/${this.$route.params.id}`,  this.invoice )).data
    }
  },
  computed: {
    ...mapGetters({
      users: 'getUsers'
    }),
    allAMs() {
      return this.users
          .filter(({ group }) => group.name === 'Account Managers')
          .map(({ firstName, lastName, _id }) => ({_id, firstName, lastName, name: firstName + ' ' + lastName}))
    },
    currentAM() {
      if (!this.invoice.hasOwnProperty('accountManager')) return ''
      const {firstName, lastName} = this.invoice.accountManager
      return firstName + ' ' + lastName
    }
  },
  created() {
    this.getInvoice()
  }
}
</script>

<style scoped lang="scss">
@import "../../assets/scss/colors";

.invoice-details {
  &__field {
    margin-bottom: 10px;
  }

}
.table {
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
    border-radius: 2px;
  }

  &__icons {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    gap: 8px;
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
.drop-down {
  position: relative;
  height: 31px;
  width: 220px;
}
</style>