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
      // quote: {
      //   type: Object
      // },
      quoteIndex: {
        type: Number
      },

    },
    data(){
      return {
        quote: {
          name:'some name',
          idNumber: 345345,
          status: 'SENT',
          totalAgreed:{
            formattedAmount:1000
          },
          projectManager:{
            name: 'Sam'
          },
          service: 'Special',
          specialization: 'Some spec',
          startDate:{
            formatted:'1980 07 15'
          },
          deadline:{
            formatted:'2980 07 15'
          }
        },
      }
    },
    components: {
      QuotesInfoDetailed,
    },
  }
</script>

<style scoped>

</style>
