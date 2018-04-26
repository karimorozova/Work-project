<template lang="pug">
  .container
    .summaryTable
      h1 Summary
      table.table.reportTable(border='bordered')
        tr
          th(v-for="title in titles") {{ title.header }}
        tr(v-for="res in summary")
          td(v-for="column in res.columns") {{ column }}
          
        
</template>
<script>
export default {
  data() {
    return {
      summary : [],
      titles: []      
    };
  },
  methods: {
    getQuotes() {
      console.log("Quotes are getting");

      this.$http.get("/reps").then(
        response => {
          var month = JSON.parse(response.bodyText);

          //console.log(JSON.parse(response.bodyText)[0]._id)
          //this.orders = JSON.parse(response.bodyText);
          
          this.titles = month[0].columns;
          this.summary = month[0].tasks;

          console.log(month);
        },
        err => {
          console.log(`You have to log in ${err}`);
          this.$router.push('/login')
        }
      );
    }
  },
  computed: {},
  created() {
    this.getQuotes();
  },
  components: {}
};
</script>


<style lang="scss">
  .reportTable {
    margin-top: 20px;
  }
</style>
