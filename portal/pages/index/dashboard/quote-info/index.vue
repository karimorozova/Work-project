<template lang="pug">
  .detailedInfoWrapper
    QuotesInfoDetailed(:quoteIndex="quoteIndex" :quotes="quotes" :quote="quote")
</template>

<script>
  import QuotesInfoDetailed from "~/components/quotes/QuotesInfoDetailed";

  export default {
    props: {
      projects: {
        type: Array
      },
      quotes: {
        type: Array
      },
      quote: {
        type: Object
      },
      quoteIndex: {
        type: Number
      },

    },
    components: {
      QuotesInfoDetailed,
    },
  }
</script>

<style scoped>

</style>
