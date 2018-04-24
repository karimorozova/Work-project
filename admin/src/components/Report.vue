<template lang="pug">
  .container
    .summaryTable
      h1 Summary
      table.table.reportTable(border='bordered')
        tr
          th(v-for="title in titles") {{ title }}
        tr(v-for="res in summary")
          td {{ res.client }}        
          td {{ res.project }}        
          td {{ res.service }}        
          td {{ res.deadline }}        
          td {{ res.sourceLang }}        
          td {{ res.targetLang }}        
          td {{ res.words }}        
          td {{ res.cost }}        
          td {{ res.amount }}        
          td {{ res.month }}        
        
</template>
<script>
export default {
  data() {
    return {
      summary: [
        {client: 'Johnson', project: '11111', service: 'translation', deadline: new Date(), sourceLang: 'EN-GB',
        targetLang: 'RU', words: 199, cost: 0.15, amount: 29.85, month: new Date().getMonth()}
      ],
      titles: ['col1', 'col2', 'col3', 'col4', 'col5', 'col6', 'col7', 'col8', 'col9', 'col10']      
    };
  },
  methods: {
  },
  computed: {},
  mounted() {},
  components: {}
};
</script>


<style lang="scss">
  .reportTable {
    margin-top: 20px;
  }
</style>
