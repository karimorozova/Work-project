<template lang="pug">
  .container
    .summaryTable
      h1 Summary
      table.table.reportTable(border='bordered')
        tr
          th(v-for="title in titles") {{ title }}
        tr(v-for="res in summary")
          td {{ res.id }}        
          td {{ res.companyName }}        
          td {{ res.beginDate }}         
        
</template>
<script>
export default {
  data() {
    return {
      summary : [],
      titles: ['id', 'Company Name', 'Begin Date']      
    };
  },
  methods: {
    getQuotes() {
      this.$http.get("/quotes").then(
        response => {
          console.log(JSON.parse(response.bodyText)[0]._id)
          //this.orders = JSON.parse(response.bodyText);
          this.summary = JSON.parse(response.bodyText);
        },
        err => {
          console.log(`You have to log in ${err}`);
          this.$router.push('/login')
        }
      );
    }
  },
  computed: {},
  mounted() {
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
