<template lang="pug">
    .qoutesWrap 
        .row
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
                        .col
        .row(v-for="(quote,index) in clientQuotes")
            .shortInfo
                .row__columns_info
                    .col {{ quote.requestOn }}
                    .col.proj {{ quote.projectId }}
                    .col.col-5 {{ quote.projectName }}
                    .col.col-4 {{ quote.status }}
                    .col {{ quote.deadline }}
                    .col.col-5.colSplit
                        .col
                            span {{ quote.totalCost }}
                        .col
                            img(src="../../assets/images/Approve-icon.png")                            
                        .col
                            img(src="../../assets/images/Reject-icon.png")
            .fullInfo(v-if="quote.fullInfoAppear")
                .languagePair
                    .languagePair__title {{ languagePair }}
                        img.languagePair__image(src="../../assets/images/open-close-arrow-brown.png")
                    ul.languagePair__ul
                        li.languagePair__li(v-for="language in languagesFromTo") {{ language.description }}
                .cost
                    .cost__title {{ cost }}
                        img.cost__image(src="../../assets/images/open-close-arrow-brown.png")
                    ul.cost__ul
                        li.cost__li(v-for="language in languagesFromTo" v-html="language.price")
                                         
</template>

<script>
import moment from "moment";

export default {
  data() {
    return {
      clientQuotes: [
        {
          requestOn: moment(new Date()).format("DD-MM-YYYY"),
          projectId: "111 [33]",
          projectName: "1Market Resources",
          status: "Open",
          deadline: moment(new Date()).format("DD-MM-YYYY"),
          totalCost: "€1000",
          fullInfoAppear: false
        },
        {
          requestOn: moment(new Date()).format("DD-MM-YYYY"),
          projectId: "111 [33]",
          projectName: "1Market Resources",
          status: "Open",
          deadline: moment(new Date()).format("DD-MM-YYYY"),
          totalCost: "€1000",
          fullInfoAppear: false
        },
        {
          requestOn: moment(new Date()).format("DD-MM-YYYY"),
          projectId: "111 [33]",
          projectName: "1Market Resources",
          status: "Open",
          deadline: moment(new Date()).format("DD-MM-YYYY"),
          totalCost: "€1000",
          fullInfoAppear: false
        }
      ],
      languagePair: "Language Pair",
      cost: "Cost",
      languagesFromTo: [
        {
          description: "EN-GB >> PL",
          price: "32.43 &#8364;"
        },
        {
          description: "EN-GB >> HU",
          price: "32.43 &#8364;"
        },
        {
          description: "EN-GB >> CZ",
          price: "32.43 &#8364;"
        }
      ]
    };
  },
  methods: {
    showFullInfo(index) {
      this.clientQuotes[index].fullInfoAppear = !this.clientQuotes[index]
        .fullInfoAppear;
    }
  }
};
</script>

<style lang="scss">
.qoutesWrap {
  .row {
    display: flex;
    justify-content: center;
    margin-bottom: 5px;
    flex-direction: column;
    .shortInfo {
      display: flex;
    }
    &__icon {
      width: 4%;
      display: flex;
      justify-content: center;
      align-items: center;
      img {
        cursor: pointer;
      }
      .rotateImage {
        transform: rotate(180deg);
        padding-right: 5px;
        padding-bottom: 3px;
      }
    }
    &__columns {
      width: 100%;
      display: flex;
      background-color: #998e7e;
      align-items: center;
      .col {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-right: 0.5px solid white;
        color: white;
        padding: 0 5px;
        width: 12%;
        &:last-child {
          border-right: none;
        }
        &__title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 5px;
          width: 100%;
          img {
            height: 10px;
            cursor: pointer;
          }

            .double_arrow {

            .up {
              margin-left: -19%;
              margin-bottom: -33%;
              .arrow_up {
                height: 10px;
                cursor: pointer;
              }
            }

            .down {
              .arrow_down {
              height: 10px;
              cursor: pointer;
              transform: rotate(180deg);
              }
            }
          }

          .req_img {
            transform: rotate(180deg);
          }
        }
      }
      .col-4 {
        width: 14%;
      }
      .col-5 {
        width: 23%;
      }
      .colSplit {
        display: flex;
        padding: 0;
        .col {
          width: 33%;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
        }
        .col__title {
          border-right: 1px solid white;
          width: 35%;
          height: 100%;
        }
      }
      &_info {
        width: 100%;
        display: flex;
        border: 0.5px solid #998e7e;
        .col {
          border-right: 1px solid #998e7e;
          padding: 5px;
          width: 12%;
          &:last-child {
            border-right: none;
          }
        }
        .proj {
            cursor: pointer;
          }
        .col-4 {
          width: 14%;
        }
        .col-5 {
          width: 23%;
          cursor: pointer;
          span {
            border-right: 1px solid #998e7e;
            padding: 0 3px;
            font-size: 14px;
            color: green;
            &:first-child {
              font-size: 16px;
              color: black;
              padding-right: 10px;
            }
            &:last-child {
              border-right: none;
            //   color: rgb(245, 135, 110);
            }
          }
        }
        .colSplit {
          display: flex;
          padding: 0;
          .col {
            width: 33%;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            &:first-child {
              padding: 7px;
            }
            img {
              cursor: pointer;
              width: 22px;
            }
          }
        }
      }
    }
    .fullInfo {
      margin-top: 2px;
      align-self: flex-end;
      border-radius: 20px;
      width: 95%;
      min-height: 66px;
      border: 1px solid #998e7e;
      display: flex;
      justify-content: flex-start;

      .languagePair {
        width: 17%;
        border-right: 1px solid #998e7e;

        &__title {
          background-color: rgba(243, 226, 199, 1);
          border-radius: 20px 0 0 0;
          padding: 5px 0 5px 20px;
          border-bottom: 2px solid #67573e;
        }
        &__image {
          margin-left: 7%;
        }

        &__ul {
          padding-left: 0;
        }

        &__li {
          border-bottom: 1px solid rgba(243, 226, 199, 1);
          padding: 5px 0 5px 20px;
          &:last-child {
            border-bottom: none;
          }
        }
      }

      .cost {
        width: 83%;
        &__title {
          background-color: rgba(243, 226, 199, 1);
          border-radius: 0 20px 0 0;
          padding: 5px 0 5px 20px;
          border-bottom: 2px solid #67573e;
        }
        &__image {
          margin-left: 4%;
        }

        &__ul {
          padding-left: 0;
        }

        &__li {
          border-bottom: 1px solid rgba(243, 226, 199, 1);
          padding: 5px 0 5px 20px;
          &:last-child {
            border-bottom: none;
          }
        }
      }
    }
  }

  ul {
    padding: 5px 0 5px 20px;
    margin: 0;
  }

  li {
    list-style: none;
  }
}
</style>
