<template lang="pug">
  .container
    .summaryTable
      h1 Summary
      table.table.reportTable(border='bordered')
        tr
          th(v-for="title in titles") {{ title }}
        tr(v-for="res in summary")
          td {{ res.projectId }}
          td {{ res.projectName }}
          td {{ res.beginDate }}
          td {{ res.deadline }}
          td {{ res.sourceLanguage }}
          td {{ res.targetLanguage }}
          td {{ res.projectService }}
          td 
            tr(v-for="vendor in res.vendors")
              td {{ vendor.providerName }}
              td {{ vendor.jobService }}
              td {{ vendor.providerRate }}
              td {{ vendor.wordcount }}
              td {{ vendor.wordcountRelative }}
              td {{ vendor.totalCost }}
          td {{ res.clientName }}
          td {{ res.clientRate }}
          td {{ res.wordcountReceivable }}
          td {{ res.sumStep1 }}
          td {{ res.sumStep2 }}          
          td {{ res.sum }}
          td {{ res.totalAgreed }}
          td {{ res.porfit }}
          td {{ res.porfitPerc }}
          td {{ res.instructions }}
          td {{ res.invoiced }}
          td {{ res.jobId }}
          
        
</template>
<script>
export default {
  data() {
    return {
      summary : [],
      titles: ["Project ID", "Project Name", "Start Date and Time", "Project Deadline", "Source Language", "Target Language", "Project Service", 
      "Provider Name", "Service", "Rate [Provider]", "Wordcount", "Relative Wordcount", "Total Cost", "Provider Name", "Service", "Rate [Provider]", "Wordcount", "Relative Wordcount", "Total Cost",
      "Client Name", "Rate [Client]", "Wordcount [Receivable]", "Sum [Step1]", "Sum [Step2]", "Sum [Receivable]", "Total Agreed", 
      "Profit", "Profit in %", "Internal Special Instructions", "Invoiced"
      ]      
    };
  },
  methods: {
    getReports() {
      console.log("Quotes are getting");

      this.$http.get("/reps").then(
        response => {
          //var month = 
          this.summary = JSON.parse(response.bodyText);

          console.log(response.bodyText);
        },
        err => {
          console.log(`You have to log in ${err}`);
          //this.$router.push('/login')
        }
      );
    }
  },
  computed: {},
  created() {
    this.getReports();
  },
  components: {}
};
</script>


<style lang="scss">
  .reportTable {
    margin-top: 20px;
  }
</style>
