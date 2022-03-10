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

      template(slot="name" slot-scope="{ row, index }")
        .table__data {{ row.name }}
</template>

<script>
import SelectSingle from "../SelectSingle"
import Button from "../Button"
import GeneralTable from "../GeneralTable"
import '../../assets/scss/datepicker.scss'
import DatePicker from 'vue2-datepicker'
import { mapGetters } from "vuex"

export default {
  components: {
    SelectSingle,
    DatePicker,
    Button,
    GeneralTable,
  },
  data() {
    return {
      invoice: {},
      terms: ['test', 'test2', 'test3'],
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
      ]
    }
  },
  methods: {
    async getInvoice() {
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
      const {firstName = '', lastName = ''} = this.invoice.accountManager
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
.drop-down {
  position: relative;
  height: 31px;
  width: 220px;
}
</style>