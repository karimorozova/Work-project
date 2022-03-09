<template lang="pug">
  .invoicing-payables-add
    .title Client Invoices
      .row
        SelectSingle(
          placeholder="Select"
          :hasSearch="true"
          :options="allClients"
          :selectedOption="selectedClient.name"
          @chooseOption="setClient"
          :allOptionsButtons="true"
        )
      .row
        SelectSingle(
          v-if="selectedClient.hasOwnProperty('name')"
          placeholder="Select"
          :hasSearch="true"
          :options="selectedClient.billingInfo"
          :selectedOption="selectedBillingInfo.name"
          @chooseOption="setBilling"
          :allOptionsButtons="true"
        )

      Button(value="Next >" @clicked="createInvoice" :isDisabled="!selectedBillingInfo.hasOwnProperty('name')")
</template>

<script>
import SelectSingle from "../SelectSingle"
import IconButton from "../IconButton"
import Button from "../Button"
import { mapGetters } from "vuex"

export default {
  components: {
    SelectSingle,
    Button,
    IconButton
  },
  data() {
    return {
      allClients: [],
      selectedClient: {},
      selectedBillingInfo: {}
    }
  },
  methods: {
    async getAllClients() {
      let result = await this.$http.post('/api-settings/all-clients-billing')
      this.allClients = result.data
    },
    setClient({option}) {
      this.selectedClient = option

    },
    setBilling({option}) {
      this.selectedBillingInfo = option
    },
    async createInvoice() {
      const { id } = (await this.$http.post('/invoicing/create-invoice', { customerId: this.selectedClient._id, clientBillingInfoId: this.selectedBillingInfo._id })).data
      console.log(id)
      this.$router.push(`/pangea-finance/receivables-reports/invoice/${id}`)
    }
  },

  computed: {

  },
  mounted() {

    this.getAllClients()
  },
  watch: {

  },

}
</script>

<style lang="scss" scoped>
.row {
  position: relative;
  height: 30px;
}
</style>