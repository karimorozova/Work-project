<template lang="pug">
    .qoutesWrap
        .calendarWrapper
          .calenadr-container
            quotesCalendarDetailed(v-if="currentFormVisible")
            quotesCalendarDetailed(v-if="currentFormVisibleOther" :class="{switcher: currentFormVisibleOther}")
            .calenadr-container__requestes
                .calenadr-container__requestes-left
                    .first Request On
                    .second Project Name
                    .third Source Langs
                .calenadr-container__requestes-right
                    .first
                        .first-text {{ quotesCalendar.requeteOn }}
                        .first-image(@click="showDetailedCalendar")
                            img(src="../../assets/images/calendar.png")
                    .second {{ quotesCalendar.projectName }}
                    .third(@click="showSrcLangs")
                        img(src="../../assets/images/open-close-arrow-brown.png")
                    .src_lang(v-if="srcLangs")
                        .lang
                        .lang
                        .lang
            .calenadr-container__deadlines
                .calenadr-container__deadlines-left
                    .first Deadline
                    .second Project ID
                    .third Target Langs
                .calenadr-container__deadlines-right
                    .first
                        .first-text {{ quotesCalendar.requeteOn }}
                        .first-image(@click="showDetailedCalendarOther")
                            img(src="../../assets/images/calendar.png")
                    .second {{ quotesCalendar.projectId }}
                    .third(@click="showTargLangs")
                        img(src="../../assets/images/open-close-arrow-brown.png")
                    .targ_lang(v-if="targLangs")
                        .lang
                        .lang
                        .lang
            .calenadr-container__statuses
                .calenadr-container__statuses-left
                    .first Status
                    .second
                    .third
                .calenadr-container__statuses-right
                    .first(@click="showStatuses")
                        img(src="../../assets/images/open-close-arrow-brown.png")
                    .second(v-if="statusesBar")
                        .status {{ quotesCalendar.statusW }}
                        .status {{ quotesCalendar.statusR }}
                        .status
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
                    .col(@click="openQuotesInfoDetailed") {{ quote.requestOn }}
                    .col.proj(@click="openQuotesInfoDetailed") {{ quote.projectId }}
                    .col.col-5(@click="openQuotesInfoDetailed") {{ quote.projectName }}
                    .col.col-4(@click="openQuotesInfoDetailed") {{ quote.status }}
                    .col(@click="openQuotesInfoDetailed") {{ quote.deadline }}
                    .col.col-5.colSplit
                        .col
                            span(@click="openQuotesInfoDetailed") {{ quote.totalCost }}
                        .col.approve
                            img(src="../../assets/images/Approve-icon.png")
                            .sp-wrapper
                              span.appr APPROVE QUOTE                         
                        .col.reject
                            img(src="../../assets/images/Reject-icon.png")
                            .sp-wrapper
                              span.rej REJECT QUOTE
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
import QuotesCalendarDetailed from "./QuotesCalendarDetailed";

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
      ],
      detailedInfoVisible: false,
      quotesCalendar: {
        requeteOn: "01-Apr-2018-15-Apr-2018",
        deadline: "01-Apr-2018-15-Apr-2018",
        projectName: "1Market Resources(Updated)",
        projectId: "2018 04 11 [27]",
        statusW: "Waiting for approval",
        statusR: "Request in process"
      },
      statusesBar: false,
      srcLangs: false,
      targLangs: false,
      currentFormVisible: false,
      currentFormVisibleOther: false
    };
  },
  methods: {
    showFullInfo(index) {
      this.clientQuotes[index].fullInfoAppear = !this.clientQuotes[index]
        .fullInfoAppear;
    },
    openQuotesInfoDetailed() {
      this.detailedInfoVisible = true;
      this.$emit("quoteDetails", this.detailedInfoVisible);
    },
    showStatuses() {
      this.statusesBar = !this.statusesBar;
    },
    showSrcLangs() {
      this.srcLangs = !this.srcLangs;
    },
    showTargLangs() {
      this.targLangs = !this.targLangs;
    },
    showDetailedCalendar() {
      this.currentFormVisible = !this.currentFormVisible;
    },
    showDetailedCalendarOther() {
      this.currentFormVisibleOther = !this.currentFormVisibleOther;
    }
  },
  components: {
    quotesCalendarDetailed: QuotesCalendarDetailed
  }
};
</script>

<style lang="scss">
.qoutesWrap {
  .calendarWrapper {
    position: relative;
    .calenadr-container {
      display: flex;
      border-bottom: 1px solid #c5bfb7;
      padding: 0 1.5% 1.5% 0;
      margin-bottom: 1%;

      &__requestes {
        width: 35%;
        display: flex;
        margin-right: 2%;
        &-left {
          flex-direction: column;
          margin-right: 1%;
          width: 33%;

          .first {
            margin-bottom: 27%;
            padding-top: 8%;
          }
          .second {
            margin-bottom: 24%;
          }
          .third {
            display: flex;
            margin-bottom: 5%;
          }
        }

        &-right {
          flex-direction: column;

          .first {
            border: 1px solid #998e7e;
            display: flex;
            margin-bottom: 7%;
            align-items: center;
            padding: 5px;
            .first-image {
              display: flex;
              cursor: pointer;
              img {
                height: 20px;
              }
            }
          }
          .second {
            border: 1px solid #998e7e;
            margin-bottom: 7%;
            padding: 5px;
          }
          .third {
            border: 1px solid #998e7e;
            display: flex;
            justify-content: flex-end;
            padding: 5px;
            position: relative;
            img {
              padding: 2.5px 0;
            }
          }
          .src_lang {
            position: absolute;
            top: 88.21%;
            left: 11.81%;
            width: 200px;
            border-left: 2px solid #998e7e;
            border-right: 2px solid #998e7e;
            border-bottom: 2px solid #998e7e;
            border-top: 2px solid #998e7e;
            z-index: 5;
            .lang {
              border-bottom: 0.2px solid #c5bfb7;
              padding: 5px;
              padding-left: 15px;
              height: 18px;
              background-color: #fff;
              &:last-child {
                height: 18px;
                border-bottom: none;
              }
            }
          }
        }
      }

      &__deadlines {
        display: flex;
        margin-right: 3%;
        width: 34%;
        &-left {
          flex-direction: column;
          margin-right: 3%;

          .first {
            margin-bottom: 32%;
            padding-top: 9%;
          }
          .second {
            margin-bottom: 32%;
          }
          .third {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 5%;
          }
        }

        &-right {
          flex-direction: column;
          .first {
            border: 1px solid #998e7e;
            display: flex;
            margin-bottom: 7%;
            align-items: center;
            padding: 5px;
            .first-image {
              cursor: pointer;
              display: flex;
              img {
                height: 20px;
              }
            }
          }
          .second {
            border: 1px solid #998e7e;
            margin-bottom: 7%;
            padding: 5px;
          }
          .third {
            border: 1px solid #998e7e;
            display: flex;
            justify-content: flex-end;
            padding: 5px;
            img {
              padding: 2.5px 0;
            }
          }
          .targ_lang {
            position: absolute;
            top: 88.21%;
            left: 46.5%;
            width: 200px;
            border-left: 2px solid #998e7e;
            border-right: 2px solid #998e7e;
            border-bottom: 2px solid #998e7e;
            border-top: 2px solid #998e7e;
            z-index: 5;
            .lang {
              border-bottom: 0.2px solid #c5bfb7;
              padding: 5px;
              padding-left: 15px;
              height: 18px;
              background-color: #fff;
              &:last-child {
                height: 18px;
                border-bottom: none;
              }
            }
          }
        }
      }

      &__statuses {
        display: flex;
        &-left {
          flex-direction: column;
          .first {
            margin-bottom: 5%;
            padding-top: 10%;
            margin-right: 10px;
          }
        }

        &-right {
          flex-direction: column;
          .first {
            border: 1px solid #998e7e;
            padding: 5px;
            width: 170px;
            display: flex;
            justify-content: flex-end;
            padding-bottom: 5%;
            img {
              padding: 2.5px 0;
            }
          }
          .second {
            border-left: 2px solid #998e7e;
            border-right: 2px solid #998e7e;
            border-bottom: 2px solid #998e7e;
            border-top: 1px solid #998e7e;
            .status {
              border-bottom: 0.2px solid #c5bfb7;
              padding: 5px;
              padding-left: 15px;
              &:last-child {
                height: 18px;
                border-bottom: none;
              }
            }
          }
        }
      }
    }

    .switcher {
      position: absolute;
      top: 28%;
      left: 40%;
      z-index: 5;
    }
  }

  .row {
    display: flex;
    justify-content: center;
    margin-bottom: 5px;
    flex-direction: column;
    .shortInfo {
      display: flex;
      &:hover {
        background-color: #ddd3c8;
      }

      .row__columns_info {
        .col.col-5.colSplit {
          .col {
            // .sp-wrapper {
            //   position: absolute;
            //   top: 21%;
            //   left: -66%;
            //   width: 112px;
            //   height: 32px;
            //   visibility: hidden;
            //   z-index: 1;

            //   .appr {
            //     opacity: 0.5;
            //     color: green;
            //     z-index: -1;
            //     font-size: 14px;
            //     white-space: nowrap;
            //     font-size: 12px;
            //   }
            // }

            // .rej {
            //   position: absolute;
            //   top: 1%;
            //   left: 1%;
            //   z-index: -1;
            //   opacity: 0.5;
            //   color: #f5876e;
            //   visibility: hidden;
            // }
          }
        }
      }
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
        height: 100%;
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
          cursor: pointer;
          position: relative;
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
            z-index: 2;
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
          .approve {
            .sp-wrapper {
              position: absolute;
              top: 73%;
              left: -37%;
              width: 112px;
              height: 32px;
              visibility: hidden;
              z-index: 1;

              .appr {
                opacity: 0.5;
                color: green;
                z-index: -1;
                font-size: 14px;
                white-space: nowrap;
                font-size: 12px;
              }
            }

            &:hover {
              .sp-wrapper {
                span {
                  visibility: visible;
                }
              }
            }
          }

          .reject {
            .sp-wrapper {
              position: absolute;
              top: 73%;
              left: -20%;
              width: 112px;
              height: 32px;
              visibility: hidden;
              z-index: 1;

              .rej {
                z-index: -1;
                font-size: 14px;
                white-space: nowrap;
                font-size: 12px;
                opacity: 0.5;
                color: #f5876e;
              }
            }

            &:hover {
              .sp-wrapper {
                span {
                  visibility: visible;
                }
              }
            }
          }
        }
      }
    }
    &:nth-of-type(odd) {
      background-color: #f4f0ee;
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
