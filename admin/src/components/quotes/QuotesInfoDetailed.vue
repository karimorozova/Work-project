<template lang="pug">
    .qoutesInfoDetailedWrapper
        .quoteContainer
            .quoteContainer__label
                .quoteContainer__label-title Quote Details
            .quoteContainer__infoWrapper
              .quoteContainer__info
                .quoteContainer-project
                  .quoteContainer-project__first-block
                    .quoteContainer-project__first-block-one
                      .name Project Name:
                      .value {{ quote.name }}
                    .quoteContainer-project__first-block-two
                      .name Project ID:
                      .value {{ quote.idNumber }}
                  .quoteContainer-project__second-block
                    .quoteContainer-project__second-block-one
                      .name Status:
                      .value {{ quote.status }}
                    .quoteContainer-project__second-block-two
                      .name Total Cost:
                      .value {{ quote.totalAgreed.formattedAmount }}
                  .quoteContainer-project__third-block
                    .quoteContainer-project__third-block-one(@click="downloadAsPDF")
                      img(src="../../assets/images/pdf-icon.png")
                    span Download Full Report
                .tableWrapper
                  table.quoteContainer-table
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
                .quoteContainer__buttons(v-if='quote.status == "SENT"')
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
                    .services2 {{ quote.startDate.formatted.split(" ")[0].split('-').reverse().join('-') }}
                  .project-manager__detailed_description-fourthblock
                    .services1 Suggested Deadline
                    .services2(v-if="quote.deadline") {{ quote.deadline.formatted.split(" ")[0].split('-').reverse().join('-') }}
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


<style lang="scss" scoped>
// @import "../../assets/styles/quotes/quotesinfodetailed.scss";
.qoutesInfoDetailedWrapper {
  max-width: 919px;
  box-shadow: 0 0 6px #000;
}
  
.quoteContainer {
  display: flex;
  flex-direction: column;

  .quoteContainer__label {
    display: flex;
    justify-content: flex-start;

    &-title {
      padding: 2% 0 2% 2%;
      color: #67573e;
      border-bottom: 1px solid #c5bfb7;
      width: 100%;
      font-size: 20px;
    }
  }

  &__infoWrapper {
    display: flex;

    .quoteContainer__info {
      flex-direction: column;
      width: 100%;

      .quoteContainer-project {
        display: flex;
        justify-content: space-around;
        padding-top: 2%;
        padding-bottom: 9%;
        color: #67573e;
        border-bottom: 1px solid #c5bfb7;
        margin-left: 3%;
        margin-right: 3%;

        &__first-block {
          display: flex;
          flex-direction: column;
          align-content: stretch;

          &-one {
            margin-bottom: 9%;
            display: flex;

            .name {
              opacity: 0.67;
              margin-right: 8px;
            }
          }

          &-two {
            display: flex;

            .name {
              opacity: 0.67;
              margin-right: 8px;
            }
          }
        }
        &__second-block {
          display: flex;
          flex-direction: column;

          &-one {
            margin-bottom: 14%;
            display: flex;

            .name {
              opacity: 0.67;
              margin-right: 8px;
            }
          }

          &-two {
            display: flex;

            .name {
              opacity: 0.67;
              margin-right: 8px;
            }
          }
        }

        &__third-block {
          display: flex;
          flex-direction: column;
          cursor: pointer;

          &-one {
            justify-content: center;
            img {
              height: 33px;
            }
          }
          span {
            visibility: hidden;
            font-size: 10px;
          }
          &:hover {
            span {
              visibility: visible;
            }
          }
        }
      }

      .tableWrapper {
        margin: 3%;
        .quoteContainer-table {
          border: 1px solid #c5bfb7;
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;

          tr,
          td {
            border: 2px solid #c5bfb7;
          }

          td {
            padding: 2% 2% 2% 2%;
            img {
              margin-left: 5px;
            }
          }
        }

        .row {
          .first-ceil {
            width: 50%;
          }
          .second-ceil {
            width: 13%;
          }
          .third-ceil {
            width: 17%;
          }
          .fourth-ceil {
            width: 11%;
          }
          .fifth-ceil {
            width: 9%;
            cursor: pointer;
          }
        }
      }
    }
  }

  .project-manager {
    background-color: #f4f0ee;
    border: 1px solid #c5bfb7;
    width: 37%;
    display: flex;
    flex-direction: column;
    font-size: 14px;

    &__detailed_info {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding-top: 6%;
      padding-bottom: 6%;
      border-bottom: 1px solid #c5bfb7;
      margin: 3% 7% 0 7%;

      .manager-icon {
        border: 1px solid #67573e;
        border-radius: 23px;
        width: 45px;
        height: 45px;
        justify-content: center;
        align-items: center;
        margin-bottom: 2%;
        img {
          padding-left: 5px;
          padding-top: 3px;
          height: 37px;
        }
      }

      .manager-title {
        margin-top: 3%;
        margin-bottom: 3%;
        color: #67573e;
        opacity: 0.67;
      }

      .manager-person {
        color: #67573e;
      }
    }

    &__detailed_description {
      display: flex;
      flex-direction: column;

      &-firstblock {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 7%;
        margin-top: 3%;
        .services1 {
          margin-bottom: 3%;
          color: #67573e;
          opacity: 0.67;
        }
        .services2 {
          color: #67573e;
        }
      }
      &-secondblock {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 7%;
        .services1 {
          margin-bottom: 3%;
          color: #67573e;
          opacity: 0.67;
        }
        .services2 {
          color: #67573e;
        }
      }
      &-thirdblock {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 7%;
        .services1 {
          margin-bottom: 3%;
          color: #67573e;
          opacity: 0.67;
        }
        .services2 {
          color: #67573e;
        }
      }
      &-fourthblock {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 7%;
        .services1 {
          margin-bottom: 3%;
          color: #67573e;
          opacity: 0.67;
        }
        .services2 {
          color: #67573e;
        }
      }
    }
  }
}

.quoteContainer__buttons {
  display: flex;
  justify-content: flex-end;
  padding-bottom: 20px;
  button {
    width: 164px;
    height: 40px;
    color: #fff;
    -webkit-box-shadow: 0 5px 8px rgba(103,87,62,.5);
    box-shadow: 0 5px 8px rgba(103,87,62,.5);
    border-radius: 18px;
    border: none;
    margin-right: 2%;
    margin-left: 2%;
    font-size: 15px;
    outline-style: none;
    cursor: pointer;
    &:hover {
      color: #67573e;
    }
  }
  .approve {
    background-color: #84ca8e;
  }
  .reject {
    background-color: #f5876e;
  }
}
</style>