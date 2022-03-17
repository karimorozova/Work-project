<template lang="pug">
  .layout
    .invoicing-payables-add
      .title Add Invoice
      .row
        .row__key Client Name:
        .row__value
          .drop
            SelectSingle(
              placeholder="Select"
              :hasSearch="true"
              :options="allClients"
              :selectedOption="selectedClient.name"
              @chooseOption="setClient"
              :allOptionsButtons="true"
            )
      .row
        .row__key Payment Profile:
        .row__value
          .drop
            SelectSingle(
              :isDisabled="!selectedClient.hasOwnProperty('name')"
              placeholder="Select"
              :hasSearch="true"
              :options="selectedClient.billingInfo"
              :selectedOption="selectedBillingInfo.name"
              @chooseOption="setBilling"
              :allOptionsButtons="true"
            )
      .add
        Button(value="Next >>" @clicked="createInvoice" :isDisabled="!selectedBillingInfo.hasOwnProperty('name')")
</template>

<script>
import SelectSingle from "../SelectSingle"
import IconButton from "../IconButton"
import Button from "../Button"

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
    setClient({ option }) {
      this.selectedClient = option

    },
    setBilling({ option }) {
      this.selectedBillingInfo = option
    },
    async createInvoice() {
      const { id } = (await this.$http.post('/invoicing/create-invoice', { customerId: this.selectedClient._id, clientBillingInfoId: this.selectedBillingInfo._id })).data
      await this.$router.push(`/pangea-finance/receivables-reports/invoice/${ id }/edit`)
    }
  },
  computed: {},
  mounted() {

    this.getAllClients()
  },
  watch: {}

}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.invoicing-payables-add {
  margin: 50px;
  padding: 25px;
  background: white;
  border-radius: 2px;
  box-shadow: $box-shadow;
  height: fit-content;
  box-sizing: border-box;
  width: fit-content;
}

.drop {
  height: 32px;
  position: relative;
  width: 220px;
  border-radius: 2px;
}

.title {
  font-size: 16px;
  font-family: Myriad600;
  margin-bottom: 25px;
}

.row {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 12px;

  &__key {
    width: 120px;
  }
}

.add {
  margin-top: 25px;
  text-align: center;
}
</style>