<template lang="pug">
  .invoices
    .invoices__message Coming soon...
</template>

<script>
  import invoices from "~/components/invoices/invoices";

  export default {
    components: {
      invoices,
    },
  }
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.invoices {
  &__message {
    color: $main-color;
    margin-left: 20px;
    font-size: 28px;
  }
}

</style>
