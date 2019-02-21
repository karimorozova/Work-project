<template lang="pug">
  .projectWrapper
    .row.projectWrapper__head
      .shortInfo
          .row__columns
              .col
                  .col__title
                      span Request On
                      img.req_img(src="../../assets/images/white-arrow.png")
              .col
                  .col__title
                      span Project ID
                      img(src="../../assets/images/white-arrow.png")
              .col.col-5
                  .col__title
                      span Project Name
                      .double_arrow
                        .up
                          img.arrow_up(src="../../assets/images/white-arrow.png")
                        .down
                          img.arrow_down(src="../../assets/images/white-arrow.png")
              .col.col-4
                  .col__title
                      span Status
                      .double_arrow
                        .up
                          img.arrow_up(src="../../assets/images/white-arrow.png")
                        .down
                          img.arrow_down(src="../../assets/images/white-arrow.png")
              .col
                  .col__title
                      span Deadline
                      .double_arrow
                        .up
                          img.arrow_up(src="../../assets/images/white-arrow.png")
                        .down
                          img.arrow_down(src="../../assets/images/white-arrow.png")
              .col.col-5.colSplit
                  .col__title
                      span Total Cost
                  .col
    .scrollingArea
      .row(v-for="(project,main) in clientProjects")
          .shortInfo
              .row__columns_info
                  .col(@click="openProjectsInfoDetailed(main)") {{ project.startDate.formatted.split(' ')[0].split('-').reverse().join('-') }}
                  .col.proj(@click="openProjectsInfoDetailed(main)") {{ project.idNumber }}
                  .col.col-5(@click="openProjectsInfoDetailed(main)") {{ project.name }}
                  .col.col-4(@click="openProjectsInfoDetailed(main)") {{ project.status }}
                  .col(@click="openProjectsInfoDetailed(main)")
                    span(v-if="project.deadline") {{ project.deadline.formatted.split(' ')[0].split('-').reverse().join('-') }}
                  .col.col-5.colSplit
                      .col
                        span(@click="openProjectsInfoDetailed(main)") {{ project.totalAgreed.formattedAmount }}
                      .col.download
                        //- img(src="../../assets/images/download.png")
</template>


<script>
import moment from "moment";

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
    }
  },
  data() {
    return {
      projectInfoDetailed: false
    };
  },
  methods: {
    async openProjectsInfoDetailed(index) {
      console.log(this.clientProjects[index])
      var id = this.clientProjects[index].id;
      this.$axios.get(`portal/job?projectId=${id}`)
      .then(res => {
        this.$emit("projectDetails", {project: this.clientProjects[index], jobs: res.data.jobById})
      }).catch(err => {console.log(err)})
      this.projectInfoDetailed = !this.projectInfoDetailed;
    }
  },
  computed: {
    clientProjects() {
      let result = [];
      if(this.projects.length) {
        let array = this.projects;
        let finalDeadline = '';
        for(let i = 0; i < array.length; i++) {
          if(array[i].deadline) {
             finalDeadline = moment(new Date(array[i].deadline.millisGMT)).format("DD-MM-YYYY");
          } else {
            finalDeadline = ''
          }
          if(array[i].status == "OPENED" || array[i].status == "REQUESTED") {
              result.push(array[i])
          }
        }
      }
      return result;
    }
  }
};
</script>

<style lang="scss" src="../../assets/styles/projects/projectsinfo.scss" scoped>
// @import "../../assets/styles/projects/projectsinfo.scss";
</style>
