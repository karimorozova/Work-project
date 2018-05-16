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
                  .col(@click="openProjectsInfoDetailed") {{ project.requestOn }}
                  .col.proj(@click="openProjectsInfoDetailed") {{ project.projectId }}
                  .col.col-5(@click="openProjectsInfoDetailed") {{ project.projectName }}
                  .col.col-4(@click="openProjectsInfoDetailed") {{ project.status }}
                  .col(@click="openProjectsInfoDetailed") {{ project.deadline }}
                  .col.col-5.colSplit
                      .col
                        span(@click="openProjectsInfoDetailed") {{ project.totalCost }}
                      .col.download
                        img(src="../../assets/images/download.png")

    //- .project-table
    //-     .project-table__header
    //-         .project-table__col-1.col_bleach
    //-             span Request On
    //-             img.requestOn(src="../../assets/images/white-arrow.png")
    //-         .project-table__col-2.col_bleach
    //-             span Project ID
    //-             img.projectid(src="../../assets/images/white-arrow.png")
    //-         .project-table__col-3.col_bleach
    //-             span Project Name
    //-             .double_arrow
    //-               .up
    //-                 img.arrow_up(src="../../assets/images/white-arrow.png")
    //-               .down
    //-                 img.arrow_down(src="../../assets/images/white-arrow.png")
    //-         .project-table__col-4.col_bleach
    //-             span Status
    //-             .double_arrow
    //-               .up
    //-                 img.arrow_up(src="../../assets/images/white-arrow.png")
    //-               .down
    //-                 img.arrow_down(src="../../assets/images/white-arrow.png")
    //-         .project-table__col-5.col_bleach
    //-             span Deadline
    //-             .double_arrow
    //-               .up
    //-                 img.arrow_up(src="../../assets/images/white-arrow.png")
    //-               .down
    //-                 img.arrow_down(src="../../assets/images/white-arrow.png")
    //-         .project-table__col-6.col_bleach
    //-             span Total Cost
    //-         .project-table__col-7
    //-             span Download
    //-     .project-table__body
    //-         .project-table__row(v-for="(quote, index) in clientProjects")
    //-             .project-table__col-1(@click="openProjectsInfoDetailed") {{ quote.requestOn }}
    //-             .project-table__col-2(@click="openProjectsInfoDetailed") {{ quote.projectId }}
    //-             .project-table__col-3(@click="openProjectsInfoDetailed") {{ quote.projectName }}
    //-             .project-table__col-4(@click="openProjectsInfoDetailed") {{ quote.status }}
    //-             .project-table__col-5(@click="openProjectsInfoDetailed") {{ quote.deadline }}
    //-             .project-table__col-6(@click="openProjectsInfoDetailed") {{ quote.totalCost }}   
    //-             .project-table__col-7
    //-                 img(src="../../assets/images/download.png")
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
      // clientQuotes: [
      //   {
      //     requestOn: moment(new Date()).format("DD-MM-YYYY"),
      //     projectId: "111 [33]",
      //     projectName: "1Market Resources",
      //     status: "Open",
      //     deadline: moment(new Date()).format("DD-MM-YYYY"),
      //     totalCost: "€1000",
      //     fullInfoAppear: false
      //   },
      //   {
      //     requestOn: moment(new Date()).format("DD-MM-YYYY"),
      //     projectId: "111 [33]",
      //     projectName: "1Market Resources",
      //     status: "Open",
      //     deadline: moment(new Date()).format("DD-MM-YYYY"),
      //     totalCost: "€1000",
      //     fullInfoAppear: false
      //   },
      //   {
      //     requestOn: moment(new Date()).format("DD-MM-YYYY"),
      //     projectId: "111 [33]",
      //     projectName: "1Market Resources",
      //     status: "Open",
      //     deadline: moment(new Date()).format("DD-MM-YYYY"),
      //     totalCost: "€1000",
      //     fullInfoAppear: false
      //   }
      // ],
      projectInfoDetailed: false
    };
  },
  methods: {
    openProjectsInfoDetailed() {
      this.projectInfoDetailed = !this.projectInfoDetailed;
      this.$emit("projectDetails", this.projectInfoDetailed);
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
          if(array[i].status == "OPENED") {
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

<style lang="scss">
.projectWrapper {
  .row {
    &__columns {
      width: 100%;
      &_info {
        .col {
          .download {
            width: 60%;
          }
        }
      }
    }
  }
  .scrollingArea {
    overflow-x: hidden;
    overflow-y: auto;
  }
}
// .project-table {
//   display: flex;
//   width: 100%;
//   flex-direction: column;

//   &__header {
//     display: flex;
//     background-color: #998e7e;
//     color: white;
//     margin-bottom: 5px;
//     align-items: center;
//     width: 98.5%;
//     .col_bleach {
//       border-right: 1px solid #fff;
//       display: flex;
//       justify-content: space-between;
//       align-items: center;

//       .double_arrow {
//         .up {
//           margin-left: -13%;
//           margin-bottom: -33%;
//           .arrow_up {
//             height: 10px;
//             cursor: pointer;
//           }
//         }

//         .down {
//           .arrow_down {
//             height: 10px;
//             cursor: pointer;
//             transform: rotate(180deg);
//           }
//         }
//       }
//     }
//   }

//   &__body {
//     display: flex;
//     flex-direction: column;
//   }

//   &__row {
//     width: 98.5%;
//     display: flex;
//     margin-bottom: 5px;
//     &:last-child {
//       margin-bottom: 0;
//     }
//     &:nth-of-type(even) {
//       background-color: #f4f0ee;
//     }
//     &:hover {
//       background-color: #ddd3c8;
//     }
//   }

//   &__col {
//     &-1 {
//       flex-basis: 14.2857%;
//       border: 1px solid #978d7e;
//       padding: 0 5px;
//       line-height: 32px;
//       cursor: pointer;
//     }
//     &-2 {
//       flex-basis: 14.2857%;
//       border: 1px solid #978d7e;
//       padding: 0 5px;
//       line-height: 32px;
//       cursor: pointer;
//     }
//     &-3 {
//       display: flex;
//       justify-content: flex-start;
//       align-items: center;
//       flex-basis: 28%;
//       border: 1px solid #978d7e;
//       padding: 0 5px;
//       cursor: pointer;
//     }
//     &-4 {
//       flex-basis: 17%;
//       border: 1px solid #978d7e;
//       padding: 0 5px;
//       display: flex;
//       justify-content: flex-start;
//       align-items: center;
//       cursor: pointer;
//     }
//     &-5 {
//       flex-basis: 15%;
//       border: 1px solid #978d7e;
//       padding: 0 5px;
//       display: flex;
//       justify-content: flex-start;
//       align-items: center;
//       cursor: pointer;
//     }
//     &-6 {
//       flex-basis: 10%;
//       border: 1px solid #978d7e;
//       padding: 5px;
//       display: flex;
//       justify-content: center;
//       padding: 0 5px;
//       line-height: 32px;
//       cursor: pointer;
//     }
//     &-7 {
//       flex-basis: 16%;
//       border: 1px solid #978d7e;
//       padding: 0 5px;
//     }
//   }

//   &__col-1 {
//     .requestOn {
//       height: 10px;
//       cursor: pointer;
//       transform: rotate(180deg);
//     }
//   }

//   &__col-2 {
//     .projectid {
//       height: 10px;
//       cursor: pointer;
//     }
//   }

//   &__col-7 {
//     display: flex;
//     justify-content: center;
//   }

//   &__col-7 {
//     display: flex;
//     justify-content: center;
//     align-items: center;

//     img {
//       width: 19px;
//       cursor: pointer;
//     }
//   }

//   .lightbrown {
//     background-color: #f4f0ee;
//   }
// }
</style>
