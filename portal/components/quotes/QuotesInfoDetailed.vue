<template lang="pug">
    .qoutesInfoDetailedWrapper
        .container
            .container__label
                .container__label-title QuotesInfo
            .container__info
                .container__info-first
                    .projid
                        .projid-name {{ quotesInfoDetailed.title }}
                        .projid-value {{ quotesInfoDetailed.createdDate }}
                    .requsted
                        .requsted-name {{ quotesInfoDetailed.requested }}
                        .requsted-value {{ quotesInfoDetailed.requstedDate }}
                    .deadline
                        .deadline-name {{ quotesInfoDetailed.deadline }}
                        .deadline-value {{ quotesInfoDetailed.deadlineDate }}
                .container__info-second
                    .projectName
                        .projectName-name {{ quotesInfoDetailed.projectName }}
                        .projectName-value {{ quotesInfoDetailed.projectNameValue }}
                    .status
                        .status-name {{ quotesInfoDetailed.status }}
                        .status-value {{ quotesInfoDetailed.statusDescription }}
                    .totalcost
                        .totalcost-name {{ quotesInfoDetailed.totalCost }}
                        .totalcost-value(v-html="quotesInfoDetailed.totalCostValue")
            .container-table
                .container-table__header
                    .container-table__col-1
                      .firstPart ID
                      .secondPart
                        img(src="../../assets/images/open-close-arrow-brown.png")
                    .container-table__col-2
                      .firstPart Language Pair
                      .secondPart
                        img(src="../../assets/images/open-close-arrow-brown.png")
                    .container-table__col-3
                      .firstPart Wordcount
                      .secondPart
                        img(src="../../assets/images/open-close-arrow-brown.png")
                    .container-table__col-4.addition Cost
                .container-table__inner-ceils
                    .container-table__row
                        .container-table__col-1 1
                        .container-table__col-2 2
                        .container-table__col-3 3
                        .container-table__col-4 4
                    .container-table__row
                        .container-table__col-1 1
                        .container-table__col-2 2
                        .container-table__col-3 3
                        .container-table__col-4 4
                    .container-table__row
                        .container-table__col-1
                        .container-table__col-2
                        .container-table__col-3 TOTAL COST:
                        .container-table__col-4 4
            .container__buttons
                button.approve APPROVE QUOTE
                button.reject REJECT QUOTE
</template>

<style lang="scss" scoped>
.qoutesInfoDetailedWrapper {
  height: 32vh;
  max-width: 919px;
  box-shadow: 0 0 6px #000;
}

.container {
  display: flex;
  flex-direction: column;
  width: 100%;

  &__label {
    display: flex;
    justify-content: flex-start;

    &-title {
      padding: 2% 0 2% 2%;
      color: #67573e;
      border-bottom: 1px solid #c5bfb7;
      width: 100%;
    }
  }

  &__info {
    flex-direction: column;

    &-first {
      display: flex;
      justify-content: space-around;
      margin-top: 3%;
      margin-bottom: 3%;

      .projid,
      .requsted,
      .deadline {
        display: flex;
        justify-content: space-around;

        &-name {
          color: #978d7e;
          padding-right: 2%;
        }
        &-value {
          color: #67573e;
        }
      }
    }

    &-second {
      display: flex;
      justify-content: space-around;
      margin-top: 3%;
      margin-bottom: 3%;

      .projectName,
      .status,
      .totalcost {
        display: flex;
        justify-content: space-around;

        &-name {
          color: #978d7e;
          padding-right: 2%;
        }
        &-value {
          color: #67573e;
        }
      }
    }
    border-bottom: 1px solid #c5bfb7;
  }

  .container-table {
    display: flex;
    width: 100%;
    flex-direction: column;
    margin-left: 2%;
    margin-top: 2%;
    color: #978d7e;

    &__header {
      display: flex;
      flex-direction: columns;
      color: #67573e;
    }

    &__inner-ceils {
      display: flex;
      flex-direction: column;
    }

    &__row {
      display: flex;
      &:last-child {
        .container-table__col-1 {
          border: none;
        }

        .container-table__col-2 {
          border: none;
        }

        .container-table__col-3 {
          border: none;
          margin-right: 0.5%;
        }
      }
    }

    &__col-1 {
      flex-basis: 25%;
      border: 1px solid #978d7e;
      padding: 5px 5px;
      justify-content: flex-start;
      display: flex;

      .firstPart {
        margin-left: 7%;
      }

      .secondPart {
        margin-left: 6%;
      }
      &:last-child {
        border: none;
      }
    }

    &__col-2 {
      flex-basis: 25%;
      border: 1px solid #978d7e;
      padding: 5px 5px;
      justify-content: flex-start;
      display: flex;

      .firstPart {
        margin-left: 7%;
      }

      .secondPart {
        margin-left: 6%;
      }
    }

    &__col-3 {
      flex-basis: 25%;
      border: 1px solid #978d7e;
      padding: 5px 5px;
      justify-content: flex-start;
      display: flex;

      .firstPart {
        margin-left: 7%;
      }

      .secondPart {
        margin-left: 6%;
      }
    }

    &__col-4 {
      flex-basis: 16%;
      border: 1px solid #978d7e;
      padding: 5px 5px;

      .addition {
        margin-left: 7%;
      }
    }
  }

  &__buttons {
    display: flex;
    justify-content: flex-end;

    button {
      width: 164px;
      height: 40px;
      color: #fff;
      box-shadow: 0 5px 8px rgba(103, 87, 62, 0.5);
      border-radius: 18px;
      border: none;
      margin-right: 2%;
      margin-left: 2%;
      font-size: 15px;
    }

    .approve {
      background-color: #84ca8e;
    }

    .reject {
      background-color: #f5876e;
    }
  }
}
</style>

<script>
export default {
  data() {
    return {
      quotesInfoDetailed: {
        title: "Project ID:",
        createdDate: "2018 04 11 [27]",
        requested: "Requested On:",
        requstedDate: "01-Apr-2018",
        deadline: "Deadline:",
        deadlineDate: "11-Apr-2018",
        projectName: "Pproject Name",
        projectNameValue: "1Market Resources(Updated)",
        status: "Status",
        statusDescription: "Wating for approval",
        totalCost: "Total Cost",
        totalCostValue: "1000&#8364;"
      },
      projectInformation: [
        {
          projectID: "2018 04 11 [27]/EN-GB*ES-ES/1",
          languaagePair: "English(United Kingdom)>>Spanish(Spain)",
          wordcount: "100",
          cost: "32.32&#8364;"
        },
        {
          projectID: "2018 04 11 [27]/EN-GB*KO/1",
          languaagePair: "English(United Kingdom)>>Korean",
          wordcount: "200",
          cost: "32.32&#8364;"
        }
      ]
    };
  }
};
</script>
