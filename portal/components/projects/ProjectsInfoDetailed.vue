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
                      td.fifth-ceil
                        img(src="../../assets/images/download.png" v-if="job[20] == 'Ready'" @click="downloadDetail(jobIndex)")
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
      console.log("Start downloading task details...");
      let result = await this.$axios.get(`/portal/taskFiles?taskId=${this.jobsById[jobIndex][23]}`, {withCredentials: true});
      let file = await this.$axios.get(`/portal/downloadTask?taskId=${this.jobsById[jobIndex][23]}`);
      
      let link = document.createElement('a');
          link.href = file.data;
          link.click();
      let del = await this.$axios.get(`/portal/deleteZip?taskId=${this.jobsById[jobIndex][23]}`);
    }
  },
  computed: {
  }
};
</script>


<style lang="scss" src="../../assets/styles/projects/projectsinfodetailed.scss" scoped>

</style>
