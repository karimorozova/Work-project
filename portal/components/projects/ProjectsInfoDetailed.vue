<template lang="pug">
    .projectsInfoDetailedWrapper
        .container
            .container__label
                .container__label-title Projects Details
            .container__infoWrapper
              .container__info
                .container-project
                  .container-project__first-block
                    .container-project__first-block-one
                      .name {{ quotesInfoDetailed.projectName }}
                      .value {{ quotesInfoDetailed.projectNameValue }}
                    .container-project__first-block-two
                      .name {{ quotesInfoDetailed.title }}
                      .value {{ quotesInfoDetailed.createdDate }}
                  .container-project__second-block
                    .container-project__second-block-one
                      .name {{ quotesInfoDetailed.status }}
                      .value {{ quotesInfoDetailed.statusDescription }}
                    .container-project__second-block-two
                      .name {{ quotesInfoDetailed.totalCost }}
                      span(v-html="quotesInfoDetailed.totalCostValue")
                  .container-project__third-block
                    .container-project__third-block-one(@click="downloadAsPDF")
                      img(src="../../assets/images/pdf-icon.png")
                    span Download Full Report
                .tableWrapper
                  table.container-table
                    tr.row
                      td Language Pair
                        img(src="../../assets/images/open-close-arrow-brown.png")
                      td Status
                        img(src="../../assets/images/open-close-arrow-brown.png")
                      td Wordcount
                        img(src="../../assets/images/open-close-arrow-brown.png")
                      td Cost
                      td
                    tr.row(v-for="projectInformation in projectInformations")
                      td.first-ceil {{ projectInformation.languaagePair }}
                      td.second-ceil {{ projectInformation.status }}
                      td.third-ceil {{ projectInformation.wordcount }}
                      td.fourth-ceil(v-html="projectInformation.cost")
                      td.fifth-ceil(@click="downloadDetail")
                        img(src="../../assets/images/download.png")
              .project-manager
                .project-manager__detailed_info
                  .manager-icon
                    img(src="../../assets/images/man.png")
                  .manager-title  Project Manager
                  .manager-person {{ managerPerson }}
                .project-manager__detailed_description
                  .project-manager__detailed_description-firstblock
                    .services1 {{ services.servicesTitle }}
                    .services2 {{ services.servicesTitleValue }}
                  .project-manager__detailed_description-secondblock
                    .services1 {{ services.industryTitle }}
                    .services2 {{ services.industryTitleValue }}
                  .project-manager__detailed_description-thirdblock
                    .services1 {{ services.requestedOn }}
                    .services2 {{ services.requestedOnDate }}
                  .project-manager__detailed_description-fourthblock
                    .services1 {{ services.deadline }}
                    .services2 {{ services.deadlineDate }}
</template>

<style lang="scss" scoped>
.projectsInfoDetailedWrapper {
  max-width: 919px;
  box-shadow: 0 0 6px #000;
}

.container {
  display: flex;
  flex-direction: column;

  .container__label {
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

    .container__info {
      flex-direction: column;
      width: 100%;

      .container-project {
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
        .container-table {
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
</style>

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
        }
  },
  data() {
    return {
      quotesInfoDetailed: {
        title: "Project ID:",
        createdDate: "2018 04 11 [27]",
        projectName: "Project Name:",
        projectNameValue: "1Market Resources(Updated)",
        status: "Status:",
        statusDescription: "Wating for approval",
        totalCost: "Total Cost:",
        totalCostValue: "1000&#8364;"
      },
      projectInformations: [
        {
          languaagePair: "English(United Kingdom)>>Spanish(Spain)",
          status: "Open",
          wordcount: "100",
          cost: "32.32&#8364;"
        },
        {
          languaagePair: "English(United Kingdom)>>Korean",
          status: "Open",
          wordcount: "200",
          cost: "32.32&#8364;"
        }
      ],
      managerPerson: "Sakis Koulos",
      services: {
        servicesTitle: "Services:",
        servicesTitleValue: "Marketing & Copyrighting",
        industryTitle: "Industry:",
        industryTitleValue: "ICO & Cryptocurrencies",
        requestedOn: "Requested On:",
        requestedOnDate: "01-Apr-2018",
        deadline: "Suggested Dedline",
        deadlineDate: "11-Apr-2018"
      },
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
    downloadDetail() {
      //stub
      console.log("Implement this method");
    }
  }
};
</script>
