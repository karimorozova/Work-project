<template lang="pug">
    .qoutesInfoDetailedWrapper
        .container
            .container__label
                .container__label-title Quote Details
            .container__infoWrapper
              .container__info
                .container-project
                  .container-project__first-block
                    .container-project__first-block-one
                      .name Project Name:
                      .value {{ quote.name }}
                    .container-project__first-block-two
                      .name Project ID:
                      .value {{ quote.idNumber }}
                  .container-project__second-block
                    .container-project__second-block-one
                      .name Status:
                      .value {{ quote.status }}
                    .container-project__second-block-two
                      .name Total Cost:
                      .value {{ quote.totalAgreed.formattedAmount }}
                  .container-project__third-block
                    .container-project__third-block-one(@click="downloadAsPDF")
                      img(src="../../assets/images/pdf-icon.png")
                    span Download Full Report
                .tableWrapper
                  table.container-table
                    tr.row
                      td Language Pair
                        img(src="../../assets/images/open-close-arrow-brown.png")
                      td Wordcount
                        img(src="../../assets/images/open-close-arrow-brown.png")
                      td Cost
                    tr.row(v-for="task in tasks")
                      td.first-ceil {{ task.sourceLang }} >> {{ task.targetLang }}
                      td.second-ceil {{ task.wordcount }}
                      td.third-ceil {{ task.totalCost }}
                .container__buttons(v-if='quote.status == "SENT"')
                    button.approve(@click="approveQuote") APPROVE QUOTE
                    button.reject(@click="rejectQuote") REJECT QUOTE
              .project-manager
                .project-manager__detailed_info
                  .manager-icon
                    img(src="../../assets/images/man.png")
                  .manager-title  Project Manager
                  .manager-person {{ quote.projectManager.name }}
                .project-manager__detailed_description
                  .project-manager__detailed_description-firstblock
                    .services1 Services
                    .services2 {{ quote.service }}
                  .project-manager__detailed_description-secondblock
                    .services1 Industry
                    .services2 {{ quote.specialization }}
                  .project-manager__detailed_description-thirdblock
                    .services1 Requested On
                    .services2 {{ quote.startDate.formatted }}
                  .project-manager__detailed_description-fourthblock
                    .services1 Suggested Deadline
                    .services2(v-if="quote.deadline") {{ quote.deadline.formatted }}
</template>

<script>
export default {
  props: {
        client: {
            type: Object
        },
        user: {
            type: Object
        },
        projects : {
            type: Array
        },
        quotes: {
            type: Array
        },
        quoteIndex: {
            type: Number
        }
  },
  data() {
    return {
      tasks: [],
      spanVisible: false
    };
  },
  methods: {
    hideSpan() {
      this.spanVisible = !this.spanVisible;
    },
    downloadAsPDF() {
      //stub
      console.log("Implement this method");
    },
    async getTasksOfQuote() {
      this.$axios.get(`portal/tasksInfo?quoteId=${this.quotes[this.quoteIndex].id}`)
        .then(res => {
          var tasksInfo = res.data.tasksOfQuote;
          for(let i = 0; i < tasksInfo.length; i++) {
            this.tasks.push({
              sourceLang: tasksInfo[i][19],
              targetLang: tasksInfo[i][20],
              wordcount: tasksInfo[i][10],
              totalCost: tasksInfo[i][13]
            })
          }
        })
        .catch(err => console.log(err))
    },
    async approveQuote() {
      this.$axios.get(`portal/approve?quoteId=${this.quotes[this.quoteIndex].id}`, {withCredentials: true})
      .then(res => console.log(res))
      .catch(err => console.log(err));
      this.quotes[this.quoteIndex].status = "ACCEPTED"
    },
    async rejectQuote() {
      this.$axios.get(`portal/reject?quoteId=${this.quotes[this.quoteIndex].id}`, {withCredentials: true})      
      .then(res => console.log(res))
      .catch(err => console.log(err));
      this.quotes[this.quoteIndex].status = "REJECTED";
    }
  },
  computed: {
    quote() {
      return this.quotes[this.quoteIndex]
    }
  },
  mounted() {
    this.getTasksOfQuote()
  }
};
</script>


<style lang="scss" src="../../assets/styles/quotes/quotesinfodetailed.scss">
// @import "../../assets/styles/quotes/quotesinfodetailed.scss";

</style>