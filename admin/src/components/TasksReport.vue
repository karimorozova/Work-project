<template lang="pug">
  .reportWrapper
    .summaryTable
      h1 Summary
      .tableFilters
        .tableFilters__project
          label Project ID: 
          input(type="text" v-model="projectIdFilter" :value="projectIdFilter")
        .tableFilters__dateFrom
          label From: 
          input(type="date" v-model="projectDeadlineStart" :value="projectDeadlineStart")
        .tableFilters__dateTo
          label To: 
          input(type="date" v-model="projectDeadlineEnd" :value="projectDeadlineEnd")
        .tableFilters__sourceLang
          label Surce Language: 
          input(type="text" v-model="sourceLang" :value="sourceLang")
        .tableFilters__targetLang
          label Target Language: 
          input(type="text" v-model="targetLang" :value="targetLang")
        .tableFilters__clientName
          label Client Name: 
          input(type="text" v-model="clientNameFilter" :value="clientNameFilter")
      table.table.reportTable(border='bordered')
        tr
          th(v-for="title in titles") {{ title }}
        tr(v-for="res in filteredSummary")
          td {{ res.projectId }}
          td {{ res.projectName }}
          td {{ res.beginDate }}
          td {{ res.deadline }}
          td {{ res.sourceLanguage }}
          td {{ res.targetLanguage }}
          td {{ res.projectService }}
          template(v-for="vendor in res.vendors")
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
          td {{ res.profit }}
          td {{ res.profitPerc }}
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
      ],
      projectIdFilter: "",
      projectDeadlineStart: "",
      projectDeadlineEnd: "",
      sourceLang: "",
      targetLang: "",
      clientNameFilter: ""
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
  computed: {
    filteredSummary() {
      let result = [];
      if(this.projectIdFilter) {
        result = this.summary.filter(item => {
          if(item.projectId.includes(this.projectIdFilter)) {
            return item;
          }
        })
      } else {
        result = this.summary;
      }

      if(this.sourceLang) {
        result = this.summary.filter(item => {
          if(item.sourceLanguage.includes(this.sourceLang)) {
            return item;
          }
        })
      } else {
        result = this.summary;
      }

      if(this.targetLang) {
        result = this.summary.filter(item => {
          if(item.targetLanguage.includes(this.targetLang)) {
            return item;
          }
        })
      } else {
        result = this.summary;
      }

      if(this.targetLang) {
        result = this.summary.filter(item => {
          if(item.targetLanguage.includes(this.targetLang)) {
            return item;
          }
        })
      } else {
        result = this.summary;
      }

      if(this.clientNameFilter) {
        result = this.summary.filter(item => {
          if(item.clientName.includes(this.clientNameFilter)) {
            return item;
          }
        })
      } else {
        result = this.summary;
      }

    return result;
    }
  },
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
