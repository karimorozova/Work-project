<template lang="pug">
  .invoice-details
    Button(value="Edit" @clicked="goToEdit" )
    .invoice-details__field
      .title Invoice ID
      .value {{invoice.invoiceId}}
    .invoice-details__field
      .title Client Name
      .value {{invoice.customer.name}}
    .invoice-details__field
      .value {{invoice.status}}
      .title Status
</template>

<script>
import Button from "../Button"

export default {
  components: {
    Button,
  },
  data() {
    return {
      invoice: {}
    }
  },
  methods: {
    goToEdit() {
      this.$router.push(`/pangea-finance/receivables-reports/invoice/${this.$route.params.id}/edit`)
    },
    async getInvoice() {
      this.invoice = (await this.$http.get(`/invoicing/invoice/${this.$route.params.id}`)).data
    }
  },
  created() {
    this.getInvoice()
  }
}
</script>

<style scoped lang="scss">

</style>