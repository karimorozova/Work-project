<template lang="pug">
    .qoutesWrap
        //- .calendarWrapper
        //-   .calenadr-container
        //-     quotesCalendarDetailed(v-if="currentFormVisible")
        //-     quotesCalendarDetailed(v-if="currentFormVisibleOther" :class="{switcher: currentFormVisibleOther}")
        //-     .calenadr-container__requestes
        //-         .calenadr-container__requestes-left
        //-             .first Request On
        //-             .second Project Name
        //-             .third Source Langs
        //-         .calenadr-container__requestes-right
        //-             .first
        //-                 .first-text {{ quotesCalendar.requestOn }}
        //-                 .first-image(@click="showDetailedCalendar")
        //-                     img(src="../../assets/images/calendar.png")
        //-             .second {{ quotesCalendar.projectName }}
        //-             .third(@click="showSrcLangs")
        //-                 img(src="../../assets/images/open-close-arrow-brown.png")
        //-             .src_lang(v-if="srcLangs")
        //-                 .lang
        //-                 .lang
        //-                 .lang
        //-     .calenadr-container__deadlines
        //-         .calenadr-container__deadlines-left
        //-             .first Deadline
        //-             .second Project ID
        //-             .third Target Langs
        //-         .calenadr-container__deadlines-right
        //-             .first
        //-                 .first-text {{ quotesCalendar.requestOn }}
        //-                 .first-image(@click="showDetailedCalendarOther")
        //-                     img(src="../../assets/images/calendar.png")
        //-             .second {{ quotesCalendar.projectId }}
        //-             .third(@click="showTargLangs")
        //-                 img(src="../../assets/images/open-close-arrow-brown.png")
        //-             .targ_lang(v-if="targLangs")
        //-                 .lang
        //-                 .lang
        //-                 .lang
        //-     .calenadr-container__statuses
        //-         .calenadr-container__statuses-left
        //-             .first Status
        //-             .second
        //-             .third
        //-         .calenadr-container__statuses-right
        //-             .first(@click="showStatuses")
        //-                 img(src="../../assets/images/open-close-arrow-brown.png")
        //-             .second(v-if="statusesBar")
        //-                 .status {{ quotesCalendar.statusW }}
        //-                 .status {{ quotesCalendar.statusR }}
        //-                 .status
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
        .scrollingArea
          .row(v-for="(quote,index) in clientQuotes")
              .shortInfo
                  .row__columns_info
                      .col(@click="openQuotesInfoDetailed(index)") {{ quote.requestOn }}
                      .col.proj(@click="openQuotesInfoDetailed(index)") {{ quote.projectId }}
                      .col.col-5(@click="openQuotesInfoDetailed(index)") {{ quote.projectName }}
                      .col.col-4(@click="openQuotesInfoDetailed(index)") {{ quote.status }}
                      .col(@click="openQuotesInfoDetailed(index)") {{ quote.deadline }}
                      .col.col-5.colSplit
                          .col
                              span(@click="openQuotesInfoDetailed") {{ quote.totalCost }}
                          .col.approve
                              img(src="../../assets/images/Approve-icon.png" v-if="quote.status == 'SENT'")
                              //- .sp-wrapper
                              //-   span.appr APPROVE QUOTE                         
                          .col.reject
                              img(src="../../assets/images/Reject-icon.png" v-if="quote.status == 'SENT'")
                              //- .sp-wrapper
                              //-   span.rej REJECT QUOTE
                                         
</template>

<script>
import moment from "moment";
import QuotesCalendarDetailed from "./QuotesCalendarDetailed";

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
    clientQuotes() {
      let result = [];
      if(this.quotes.length) {
        let array = this.quotes;
        let finalDeadline = '';
        for(let i = 0; i < array.length; i++) {
          if(array[i].deadline) {
             finalDeadline = moment(new Date(array[i].deadline.millisGMT)).format("DD-MM-YYYY");
          } else {
            finalDeadline = ''
          }
          if(array[i].status != "APPROVED" && array[i].status != "REJECTED") {
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
  },
  components: {
    quotesCalendarDetailed: QuotesCalendarDetailed
  }
};
</script>

<style lang="scss">
@import "../../assets/styles/quotes/quotesinfo.scss";
</style>
