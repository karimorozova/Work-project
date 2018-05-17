<template lang="pug">
  .projectWrapper
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
                        .first-text {{ quotesCalendar.requestOn }}
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
                        .first-text {{ quotesCalendar.requestOn }}
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
    .project-table
        .project-table__header
            .project-table__col-1.col_bleach
                span Request On
                img.requestOn(src="../../assets/images/white-arrow.png")
            .project-table__col-2.col_bleach
                span Project ID
                img.projectid(src="../../assets/images/white-arrow.png")
            .project-table__col-3.col_bleach
                span Project Name
                .double_arrow
                  .up
                    img.arrow_up(src="../../assets/images/white-arrow.png")
                  .down
                    img.arrow_down(src="../../assets/images/white-arrow.png")
            .project-table__col-4.col_bleach
                span Status
                .double_arrow
                  .up
                    img.arrow_up(src="../../assets/images/white-arrow.png")
                  .down
                    img.arrow_down(src="../../assets/images/white-arrow.png")
            .project-table__col-5.col_bleach
                span Deadline
                .double_arrow
                  .up
                    img.arrow_up(src="../../assets/images/white-arrow.png")
                  .down
                    img.arrow_down(src="../../assets/images/white-arrow.png")
            .project-table__col-6.col_bleach
                span Total Cost
            .project-table__col-7
                span Download
        .project-table__body
            .project-table__row(v-for="(quote, index) in clientQuotes")
                .project-table__col-1(@click="openProjectsInfoDetailed") {{ quote.requestOn }}
                .project-table__col-2(@click="openProjectsInfoDetailed") {{ quote.projectId }}
                .project-table__col-3(@click="openProjectsInfoDetailed") {{ quote.projectName }}
                .project-table__col-4(@click="openProjectsInfoDetailed") {{ quote.status }}
                .project-table__col-5(@click="openProjectsInfoDetailed") {{ quote.deadline }}
                .project-table__col-6(@click="openProjectsInfoDetailed") {{ quote.totalCost }}   
                .project-table__col-7
                    img(src="../../assets/images/download.png")
</template>

<style lang="scss">
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
            left: 11.71%;
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

.project-table {
  display: flex;
  width: 100%;
  flex-direction: column;

  &__header {
    display: flex;
    background-color: #998e7e;
    color: white;
    margin-bottom: 5px;
    align-items: center;

    .col_bleach {
      border-right: 1px solid #fff;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .double_arrow {
        .up {
          margin-left: -13%;
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
    }
  }

  &__body {
    display: flex;
    flex-direction: column;
  }

  &__row {
    display: flex;
    margin-bottom: 5px;
    &:last-child {
      margin-bottom: 0;
    }
    &:nth-of-type(even) {
      background-color: #f4f0ee;
    }
    &:hover {
      background-color: #ddd3c8;
    }
  }

  &__col {
    &-1 {
      flex-basis: 14.2857%;
      border: 1px solid #978d7e;
      padding: 0 5px;
      line-height: 32px;
      cursor: pointer;
    }
    &-2 {
      flex-basis: 14.2857%;
      border: 1px solid #978d7e;
      padding: 0 5px;
      line-height: 32px;
      cursor: pointer;
    }
    &-3 {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex-basis: 28%;
      border: 1px solid #978d7e;
      padding: 0 5px;
      cursor: pointer;
    }
    &-4 {
      flex-basis: 17%;
      border: 1px solid #978d7e;
      padding: 0 5px;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      cursor: pointer;
    }
    &-5 {
      flex-basis: 15%;
      border: 1px solid #978d7e;
      padding: 0 5px;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      cursor: pointer;
    }
    &-6 {
      flex-basis: 10%;
      border: 1px solid #978d7e;
      padding: 5px;
      display: flex;
      justify-content: center;
      padding: 0 5px;
      line-height: 32px;
      cursor: pointer;
    }
    &-7 {
      flex-basis: 16%;
      border: 1px solid #978d7e;
      padding: 0 5px;
    }
  }

  &__col-1 {
    .requestOn {
      height: 10px;
      cursor: pointer;
      transform: rotate(180deg);
    }
  }

  &__col-2 {
    .projectid {
      height: 10px;
      cursor: pointer;
    }
  }

  &__col-7 {
    display: flex;
    justify-content: center;
  }

  &__col-7 {
    display: flex;
    justify-content: center;
    align-items: center;

    img {
      width: 19px;
      cursor: pointer;
    }
  }

  .lightbrown {
    background-color: #f4f0ee;
  }
}
</style>

<script>
import moment from "moment";
import QuotesCalendarDetailed from "../quotes/QuotesCalendarDetailed";

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
      projectInfoDetailed: false,
      quotesCalendar: {
        requestOn: "01-Apr-2018-15-Apr-2018",
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
    openProjectsInfoDetailed() {
      this.projectInfoDetailed = !this.projectInfoDetailed;
      this.$emit("projectDetails", this.projectInfoDetailed);
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
