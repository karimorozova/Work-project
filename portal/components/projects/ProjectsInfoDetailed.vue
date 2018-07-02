<template lang="pug">
    .projectsInfoDetailedWrapper
        .projContainer
            .projContainer__label
                .projContainer__label-title Projects Details
            .projContainer__infoWrapper
              .projContainer__info
                .projContainer-project
                  .projContainer-project__first-block
                    .projContainer-project__first-block-one
                      .name Project Name:
                      .value {{ project.name }}
                    .projContainer-project__first-block-two
                      .name Project ID:
                      .value {{ project.idNumber }}
                  .projContainer-project__second-block
                    .projContainer-project__second-block-one
                      .name Status:
                      .value {{ project.status }}
                    .projContainer-project__second-block-two
                      .name Total Cost:
                      .value {{ project.totalAgreed.formattedAmount }}
                  .projContainer-project__third-block
                    .projContainer-project__third-block-one(@click="downloadAsPDF")
                    //-   img(src="../../assets/images/pdf-icon.png")
                    //- span Download Full Report
                .tableWrapper
                  table.projContainer-table
                    tr.row
                      td Language Pair
                        img(src="../../assets/images/open-close-arrow-brown.png")
                      td Status
                        img(src="../../assets/images/open-close-arrow-brown.png")
                      td Wordcount
                        img(src="../../assets/images/open-close-arrow-brown.png")
                      td Cost
                      td
                    tr.row(v-for="(job, jobIndex) in jobsById")
                      td.first-ceil {{ job[21] }} >> {{ job[22] }}
                      td.second-ceil {{ job[20] }}
                      td.third-ceil {{ job[11] }}
                      td.fourth-ceil {{ job[17] }}
                      td.fifth-ceil(@click="downloadDetail(jobIndex)")
                        img(src="../../assets/images/download.png")
              .project-manager
                .project-manager__detailed_info
                  .manager-icon
                    img(src="../../assets/images/man.png")
                  .manager-title  Project Manager
                  .manager-person {{ project.projectManager.name }}
                .project-manager__detailed_description
                  .project-manager__detailed_description-firstblock
                    .services1 Services
                    .services2 {{ project.service }}
                  .project-manager__detailed_description-secondblock
                    .services1 Industry
                    .services2 {{ project.specialization }}
                  .project-manager__detailed_description-thirdblock
                    .services1 Requested On
                    .services2 {{ project.startDate.formatted.split(' ')[0].split('-').reverse().join('-') }}
                  .project-manager__detailed_description-fourthblock
                    .services1 Suggested Deadline
                    .services2(v-if="project.deadline") {{ project.deadline.formatted.split(' ')[0].split('-').reverse().join('-') }}
</template>


<script>
import axios from "axios";

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
        project: {
            type: Object
        },
        jobsById: {
          type: Array
        }
  },
  data() {
    return {
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
    async downloadDetail(jobIndex) {
      console.log("Start downloading job details...");
      let job = this.jobsById[jobIndex];
      let info = [
        `Project ID: ${job[0]}`,
        `Project Name: ${job[1]}`,
        `Start Date: ${job[2].split(' ')[0]}`,
        `Deadline: ${job[3].split(' ')[0]}`,
        `Source Language: ${job[4]}`,
        `Target Language: ${job[5]}`,
        `Project Service: ${job[6]}`,
        `ID: ${job[7]}`,
        `Provider Name: ${job[8]}`,
        `Job Type: ${job[9]}`,
        `Provider rate: ${job[10]}`,
        `Wordcount payable: ${job[11]}`,
        `Total cost: ${job[12]}`,
        `Customer name: ${job[13]}`,
        `Customer rate: ${job[14]}`,
        `Wordcount receivable: ${job[15]}`,
        `Sum: ${job[16]}`,
        `Total agreed: ${job[17]}`,
        `Special instructions: ${job[18]}`,
        `Invoiced: ${job[19]}`,
        `Job status: ${job[20]}`,
      ]
      await this.$axios.get("api/taskDetail", {
        params: {
          info
        }
      })
      .then(res => {
        let blob = new Blob([res.data], {type: 'application/xls'});
        let link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = 'task' + jobIndex + '.xls';
        link.click()
      });
    }
  },
  computed: {
  }
};
</script>


<style lang="scss" src="../../assets/styles/projects/projectsinfodetailed.scss" scoped>
// @import "../../assets/styles/projects/projectsinfodetailed.scss";

</style>
