<template lang="pug">
  .invoicing-layout(v-if="invoice._id" )
    .invoicing-layout__rightSide
      InvoiceDetailsPDF(
        :invoice="invoice"
      )
    .invoicing-layout__leftSide
      InvoiceDetailsSubInfo(
        :invoice="invoice"
      )
      InvoiceDetailsActions(
        :invoice="invoice"
        @deleteInvoice="deleteInvoice"
        @refreshInvoice="getInvoice"
      )
</template>

<script>

import InvoiceDetailsPDF from "./sub-components/InvoiceDetailsPDF"
import InvoiceDetailsSubInfo from "./sub-components/InvoiceDetailsSubInfo"
import InvoiceDetailsActions from "./sub-components/InvoiceDetailsActions"

export default {
  components: { InvoiceDetailsActions, InvoiceDetailsSubInfo, InvoiceDetailsPDF },
  data() {
    return {
      invoice: {}
    }
  },
  methods: {
    async getInvoice() {
      console.log('GET')
      this.invoice = (await this.$http.get(`/invoicing/invoice/${ this.$route.params.id }`)).data
    },
    async deleteInvoice() {
      await this.$http.delete(`/invoicing/invoice/${ this.$route.params.id }`)
      await this.$router.push("/pangea-finance/receivables-reports/invoice")
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