<template lang="pug">
    .qoutesWrap
        .row
            .shortInfo
                .row__columns
                    .col.col-ic
                      span Icon
                    .col.col-nam
                      span Name
                    .col.col-5
                        .col__symb 
                            span Symbol                      
                    .col.col-4
                      span ISO 639-1
                      img(src="../../assets/images/info-icon-white.png")           
                    .col.col-4
                      span ISO 639-2
                      img(src="../../assets/images/info-icon-white.png")
                    .col
                      span Status
                    .col.col-5.colSplit
                      .col
        .scrollingArea
          .row
              .shortInfo
                  .row__columns_info
                      .col.first
                        img(src="../../assets/images/flags 31x21pix/Afrikaans[AF].png")
                        img.upload(src="../../assets/images/Other/upload-icon.png")
                      .col.proj Africanas
                      .col.col-5 AF
                      .col.col-4 af
                      .col afr
                      .col
                        span Options
                        .imgWrapper
                          img(src="../../assets/images/open-close-arrow-brown.png")
                        .chooser
                          span YES
                          span NO
                      .col.col-5.colSplit
                          .col
                            img.save(src="../../assets/images/Other/save-none active.png" v-if="true")
                            img.save(src="../../assets/images/Other/save-icon-qa-form.png" v-if="false")
                            img(src="../../assets/images/Other/edit-icon-qa.png" v-if="true")                      
                            img(src="../../assets/images/Other/save-none active.png" v-if="false")
                            img(src="../../assets/images/Other/delete-icon-qa-form.png")
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
      detailedInfoVisible: false,
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
    openQuotesInfoDetailed(index) {
      this.detailedInfoVisible = true;
      this.$emit("quoteDetails", {open: this.detailedInfoVisible, index: index} );
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
  computed: {
  },
  components: {
  }
};
</script>

<style lang="scss" scoped>
  .qoutesWrap {
    font-size: 14px;
    .scrollingArea {
      height: 195px;
      overflow-y: auto;
      overflow-x: hidden;
    }
    .calendarWrapper {
      position: relative;
  
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
      margin-left: 0;
      margin-right: 0;
      .shortInfo {
        display: flex;
        // &:hover {
        //   background-color: #ddd3c8;
        // }
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
        justify-content: flex-start;
        background-color: #998e7e;
        align-items: center;
        .col {
          display: flex;
          align-items: center;
          // justify-content: space-between;
          border-right: 0.5px solid white;
          color: white;
          padding: 0 5px;
          width: 18%;
          height: 100%;
          &:last-child {
            border-right: none;
          }
        }
        .col-ic {
          padding-right: 10px;
        }
        .col-nam {
          padding-right: 117px;
        }
        .col-4 {
          // width: 14%;
          flex: 0 0 13.666667%;
          max-width: 13.666667%;
        }
        .col-5 {
          // width: 23%;
          flex: 0 0 12.666667%;
          max-width: 12.666667%;
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
          .first {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .col-4 {
            // width: 14%;
            flex: 0 0 21.666667%;
            max-width: 21.666667%;
          }
          .col-5 {
            // width: 23%;
            flex: 0 0 21.666667%;
            max-width: 21.666667%;
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
