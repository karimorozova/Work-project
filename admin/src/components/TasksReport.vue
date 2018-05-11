<template lang="pug">
  .reportWrapper
    .summaryTable
      h1 Summary
        a(href="/reports-update") Load Report to DB
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
          input(type="text" v-model="targetLang")
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
            td {{ vendor.providerRate }} &euro;
            td {{ vendor.wordcount }}
            td {{ vendor.wordcountRelative }}
            td {{ vendor.totalCost }}
          td {{ res.clientName }}
          td {{ res.clientRate }}
          td {{ res.wordcountReceivable }}
          td {{ res.sumStep1 }} &euro;
          td {{ res.sumStep2 }} &euro;         
          td {{ res.sum }} &euro;
          td {{ res.totalAgreed }} &euro;
          td {{ res.profit }} &euro;
          td {{ res.profitPerc }} %
          td {{ res.instructions }}
          td {{ res.invoiced }}
          td {{ res.jobId }}
          
        
</template>
<script>
import moment from "moment";

export default {
  data() {
    return {
      summary : [],
      titles: ["Project ID", "Project Name", "Date", "Project Deadline", "Source Language", "Target Language", "Project Service", 
      "Provider Name", "Service", "Rate [Provider]", "Wordcount", "Relative Wordcount", "Total Cost", "Provider Name", "Service", "Rate [Provider]", "Wordcount", "Relative Wordcount", "Total Cost",
      "Client Name", "Rate [Client]", "Wordcount [Receivable]", "Sum [Step1]", "Sum [Step2]", "Sum [Receivable]", "Total Agreed", 
      "Profit", "Profit in %", "Internal Special Instructions", "Invoiced"
      ],
      projectIdFilter: "",
      projectDeadlineStart: "",
      projectDeadlineEnd: "",
      sourceLang: "",
      targetLang: "",
      clientNameFilter: "",
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
      let result = this.summary;

      if(this.projectIdFilter) {
        result = result.filter(item =>{          
          if(item.projectId.indexOf(this.projectIdFilter) != -1) {
            return true;
          }
          return false;                  
        })        
      }
      
      if(this.projectDeadlineEnd) {
        result = result.filter(item => {
          if(+new Date(item.deadline.split(' ')[0]) <= +new Date(this.projectDeadlineEnd)) {
            return true;
          }
          return false;
        })
      }

      if(this.projectDeadlineStart) {
        result = result.filter(item => {
          if(+new Date(item.deadline.split(' ')[0]) >= +new Date(this.projectDeadlineStart)) {
            return true;
          }
          return false;
        })
      }

      if(this.sourceLang) {
        result = result.filter(item =>{          
          if(item.sourceLanguage.toLowerCase().indexOf(this.sourceLang.toLowerCase()) != -1) {
            return true;
          }
          return false;                  
        })
      } 

      if(this.targetLang) {
        result = result.filter(item =>{          
          if(item.targetLanguage.toLowerCase().indexOf(this.targetLang.toLowerCase()) != -1) {
            return true;
          }
          return false;                  
        })
      } 

      if(this.clientNameFilter) {
        result = result.filter(item =>{          
          if(item.clientName.toLowerCase().indexOf(this.clientNameFilter.toLowerCase()) != -1) {
            return true;
          }
          return false;                  
        })
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
  .summaryTable {
    .tableFilters {
      display: flex;
      justify-content: space-between;
    }
    .reportTable {
      margin-top: 20px;
    }
  }
  
</style>
