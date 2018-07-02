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
      .row(v-for="(project,index) in clientProjects")
          .shortInfo
              .row__columns_info
                  .col(@click="openProjectsInfoDetailed(index)") {{ project.requestOn }}
                  .col.proj(@click="openProjectsInfoDetailed(index)") {{ project.projectId }}
                  .col.col-5(@click="openProjectsInfoDetailed(index)") {{ project.projectName }}
                  .col.col-4(@click="openProjectsInfoDetailed(index)") {{ project.status }}
                  .col(@click="openProjectsInfoDetailed(index)") {{ project.deadline }}
                  .col.col-5.colSplit
                      .col
                        span(@click="openProjectsInfoDetailed(index)") {{ project.totalCost }}
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
      console.log(this.projects[index])
      var id = this.projects[index].id;
      this.$axios.get(`portal/job?projectId=${id}`)
      .then(res => {
        this.$emit("projectDetails", {project: this.projects[index], jobs: res.data.jobById})
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
              result.push({
              requestOn: moment(new Date(array[i].startDate.millisGMT)).format("DD-MM-YYYY"),
              projectId: array[i].idNumber,
              projectName: array[i].name,
              status: array[i].status,
              deadline: finalDeadline, //moment(new Date()).format("DD-MM-YYYY"),
              totalCost: array[i].totalAgreed.formattedAmount,
              fullInfoAppear: false
            })
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
