<template lang="pug">
  .template
    .details
      .details__invoice
        .details__invoice-title Actions

      .icons
        IconButton(
          :popupText="'Edit Invoice'"
          @clicked="editInvoice"
        )
          i.fas.fa-pen

</template>

<script>
import IconButton from "../../IconButton"

export default {
  name: "InvoiceDetailsActions",
  components: { IconButton },
  props: {
    invoice: {
      type: Object
    }
  },
  methods: {
    editInvoice() {
      this.$router.push(`/pangea-finance/receivables-reports/invoice/${ this.$route.params.id }/edit`)
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors";

.template {
  width: 400px;
  box-sizing: border-box;
  border-radius: 2px;
  box-shadow: $box-shadow;
  padding: 25px;
  background: white;
}

.details {
  &__invoice {
    margin-bottom: 20px;
    border-bottom: 1px solid $light-border;
    width: 100%;
    padding-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    &-title {
      font-size: 16px;
      font-family: 'Myriad600';
    }
  }
}

.icons {
  display: flex;
  flex-wrap: wrap;

  .button-wrapper {
    margin-bottom: 12px;
    margin-right: 12px;
  }
}
</style>