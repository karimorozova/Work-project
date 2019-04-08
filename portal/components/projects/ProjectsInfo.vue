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
                  .col(@click="openProjectsInfoDetailed(index)") {{ project.startDate }}
                  .col.proj(@click="openProjectsInfoDetailed(index)") {{ project.idNumber }}
                  .col.col-5(@click="openProjectsInfoDetailed(index)") {{ project.name }}
                  .col.col-4(@click="openProjectsInfoDetailed(index)") {{ project.status }}
                  .col(@click="openProjectsInfoDetailed(index)")
                    span(v-if="project.deadline") {{ project.deadline }}
                  .col.col-5.colSplit
                      .col
                        span(@click="openProjectsInfoDetailed(index)") {{ project.totalAgreed.formattedAmount }}
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
      var id = this.clientProjects[index].id;
      // this.$axios.get(`portal/job?projectId=${id}`)
      // .then(res => {
      //   this.$emit("projectDetails", {project: this.clientProjects[index], jobs: res.data.jobById})
      // }).catch(err => {console.log(err)})
      // this.projectInfoDetailed = !this.projectInfoDetailed;
    }
  },
  computed: {
    clientProjects() {
      let result = [];
      if(this.projects.length) {
        let array = this.projects;
        let finalDeadline = '';
        // for(let i = 0; i < array.length; i++) {
        //   if(array[i].deadline) {
        //      finalDeadline = moment(new Date(array[i].deadline.millisGMT)).format("DD-MM-YYYY");
        //   } else {
        //     finalDeadline = ''
        //   }
        //   if(array[i].status == "OPENED" || array[i].status == "REQUESTED") {
        //       result.push(array[i])
        //   }
        // }
        array.map((project)=>{
          result.push({
            requestOn: moment(project.createdAt).format("DD-MM-YYYY"),
            id: project._id,
            startDate: moment(project.createdAt).format("DD-MM-YYYY"),
            idNumber: project.projectId,
            name: project.projectName,
            // status: array[i].status,
            deadline: moment(project.deadline).format("DD-MM-YYYY"),
            totalAgreed: {formattedAmount:1000},
            // projectManager: array[i].projectManager,
            // service: array[i].service,
            // specialization: array[i].specialization,
            // languageCombinations: array[i].languageCombinations,
            // fullInfoAppear: false
          })
        });
      }
      return result;
    }
  }
};
</script>

<style lang="scss" src="../../assets/styles/projects/projectsinfo.scss" scoped>

</style>
