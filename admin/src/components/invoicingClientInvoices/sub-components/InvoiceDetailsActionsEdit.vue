<template lang="pug">
  .template
    .details
      .details__invoice
        .details__invoice-title Actions

      .crud-buttons
        Button(value="Save" @clicked="saveEditing()")
        Button(@clicked="cancelEditing" value="Cancel" :outline="true")


</template>

<script>

import Button from "../../Button"

export default {
  name: "InvoiceDetailsActionsEdit",
  components: { Button },
  props: {
    // invoice: {
    //   type: Object
    // }
  },
  methods: {
    saveEditing() {
      this.$emit('save')
    },
    cancelEditing() {
      this.$router.push(`/pangea-finance/receivables-reports/invoice/${ this.$route.params.id }`)
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

.crud-buttons {
  display: flex;
  gap: 20px;
}
</style>