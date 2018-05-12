<template lang="pug">
.calendarWrapper
          .calenadr-container
            .calenadr-container__requestes
                .calenadr-container__requestes-left
                    .first Request On
                    .second Project Name
                    .third Source Langs
                .calenadr-container__requestes-right
                    .first
                        .first-text {{ quotesCalendar.requeteOn }}
                        .first-image
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
                        .first-image
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
</template>

<style lang="scss" scoped>
.calendarWrapper {
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
          top: 52.21%;
          left: 24.91%;
          width: 200px;
          border-left: 2px solid #998e7e;
          border-right: 2px solid #998e7e;
          border-bottom: 2px solid #998e7e;
          border-top: 2px solid #998e7e;
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
          top: 52.21%;
          left: 43.1%;
          width: 200px;
          border-left: 2px solid #998e7e;
          border-right: 2px solid #998e7e;
          border-bottom: 2px solid #998e7e;
          border-top: 2px solid #998e7e;
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
}
</style>

<script>
export default {
  data() {
    return {
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
      targLangs: false
    };
  },
  methods: {
    showStatuses() {
      this.statusesBar = !this.statusesBar;
    },
    showSrcLangs() {
      this.srcLangs = !this.srcLangs;
    },
    showTargLangs(){
       this.targLangs = !this.targLangs; 
    }
  }
};
</script>
