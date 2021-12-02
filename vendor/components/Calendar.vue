<template lang="pug">
  .quotesCalendarWrapper
    .calendarContainer(v-if="formVisible")
        .calendarContainer__left
            .calendarContainer__left-level1
                .col1 From
                .col2
                    .col2-text1(@click="fromAny")
                      .innerCheck(:class="{checkedBox: checked.from}")
                    .col2-text2 Anytime
            .calendarContainer__left-level4
                input(type="text" :value="dateFrom" readonly)
                datepicker(monday-first=true :inline="true" :highlighted='state.highlighted' v-model="datesFilter.from" @touch="touch")
        .calendarContainer__right
            .calendarContainer__right-level1
                .col1 To
                .col2
                    .col2-text1(@click="toAny")
                      .innerCheck(:class="{checkedBox: checked.to}")
                    .col2-text2 Anytime
            .calendarContainer__right-level4
                input(type="text" :value="dateTo" readonly)
                datepicker(monday-first=true :inline="true" :highlighted='state.highlighted' v-model="datesFilter.to" @touch="touch")
            .calendarContainer__right-level5
                .col2
                    button(@click="closeWindow") Close
</template>


<script>
import DatePicker from "@/components/Datepicker.vue";
import moment from "moment";

export default {
  data() {
    return {
      formVisible: true,
      state: {
        highlighted: {
          days: [6, 0]
        },
        disabled: {
          to: moment().add(-1, 'day').endOf('day').toDate()
        }
      },
      datesFilter: {from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), to: new Date()},
      checked: {from: false, to: false},
      currentTo: '',
      isTouched :false,
    }
  },
  methods: {
    closeWindow() {
      this.formVisible = !this.formVisible;
      this.$emit('dateFilter', {...this.datesFilter,isTouched: this.isTouched})
    },
    fromAny() {
      this.isTouched = true;
      this.checked.from = !this.checked.from;
      if(!this.checked.from) {
        this.datesFilter.from = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      } else {
        this.datesFilter.from = new Date(1970, 1, 1);
      }
      this.$emit('fromAny', this.datesFilter);
    },
    toAny() {
      this.isTouched = true;
      this.checked.to = !this.checked.to;
      this.datesFilter.to = new Date();
      this.$emit('toAny', this.datesFilter);
    },
    touch(){
      this.isTouched = true;
    }
  },
  computed: {
    dateFrom() {
      return moment(this.datesFilter.from).format('MMMM Do YYYY')
    },
    dateTo() {
      return moment(this.datesFilter.to).format('MMMM Do YYYY')
    }
  },
  components: {
    datepicker: DatePicker
  }
};
</script>


<style lang="scss">
  .quotesCalendarWrapper {
    position: absolute;
    top: 70%;
    left: -30%;
    z-index: 5;
    width: 582px;

    .calendarContainer {
      display: flex;
      box-shadow: 0 2px 4px 0 rgba(103, 87, 62, .3), 0 2px 16px 0 rgba(103, 87, 62, .2);
      padding: 10px;
      font-size: 16px;
      background-color: #fff;
      width: 82%;
      @media screen and (max-width: 1550px) {
        padding: 10px;
      }

      &__left {
        flex-direction: column;
        margin-right: 18px;
        width: 50%;
        @media screen and (max-width: 1550px) {
          margin-right: 9px;
        }
        &-level1 {
          display: flex;
          justify-content: flex-start;
          margin-bottom: 3%;
          @media screen and (max-width: 1550px) {
            justify-content: flex-start;
          }

          .col1 {
            color: #67573e;
            font-size: 16px;
            font-weight: bold;
            margin-right: 117px;
            @media screen and (max-width: 1550px) {
              margin-right: 116px;
            }
          }
          .col2 {
            display: flex;
            align-items: baseline;
            &-text2 {
              font-size: 14px;
            }
          }
        }
        &-level4 {
          margin-bottom: 3%;
          input {
            padding: 4px;
            margin-bottom: 10px;
          }
        }
        &-level5 {
          display: flex;
          justify-content: flex-start;

          .col1 {
            display: flex;
            margin-right: 5%;
            &-text {
              margin-right: 6%;
            }
          }
          .col2 {
            display: flex;
            margin-right: 5%;
            &-text {
              margin-right: 6%;
            }
          }
          .col3 {
            display: flex;
            &-text {
              margin-right: 6%;
            }
          }
        }
      }

      &__right {
        flex-direction: column;
        width: 50%;
        &-level1 {
          display: flex;
          justify-content: flex-start;
          margin-bottom: 3%;
          @media screen and (max-width: 1550px) {
            justify-content: flex-start;
          }
          .col1 {
            color: #67573e;
            font-size: 16px;
            font-weight: bold;
            margin-right: 137px;
            @media screen and (max-width: 1550px) {
              margin-right: 137px;
            }
          }
          .col2 {
            display: flex;
            align-items: baseline;
            &-text1 {
              border: 0.1px solid #e2dddb;
              height: 20px;
              width: 20px;
              margin-right: 6px;
            }
            &-text2 {
              font-size: 14px;
            }
          }
        }
        &-level4 {
          margin-bottom: 3%;
          input {
            padding: 4px;
            margin-bottom: 10px;
          }
        }
        &-level5 {
          display: flex;
          justify-content: flex-end;
          padding-right: 3px;
          .col2 {
            button {
              background-color: #d66f58;
              border-radius: 4px;
              color: #fff;
              width: 120px;
              height: 30px;
              border: none;
              font-size: 16px;
              outline: none;
            }
          }
        }
      }

      .vdp-datepicker__calendar {
        width: 230px;
        div {
          .day-header {
            font-weight: bold;
            font-size: 16px;
          }
          .cell {
            background-color: #eaeaea;
            height: 25px;
            font-size: 14px;
            line-height: 29px;
          }
        }
      }

      .vdp-datepicker__calendar .cell.highlighted,
      .vdp-datepicker__calendar .cell.disabled.weekend {
        background: #cde1f7;
        color: rgba(0, 0, 0, 0.4);
      }
    }
  }

  .col2-text1 {
    border: 0.1px solid #e2dddb;
    height: 20px;
    width: 20px;
    margin-right: 6px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    .innerCheck {
      width: 62%;
      height: 62%;
      background-color: white;
    }
    .checkedBox {
      background-color: #67573e;
    }
  }



</style>
