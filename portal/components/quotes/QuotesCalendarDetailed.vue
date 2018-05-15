<template lang="pug">
  .quotesCalendarWrapper
    .container(v-if="formVisible")
        .container__left
            .container__left-level1
                .col1 From
                .col2
                    .col2-text1
                    .col2-text2 Anytime
            .container__left-level4
                datepicker(monday-first=true :inline="true" :highlighted='state.highlighted' :disabled='state.disabled')
        .container__right
            .container__right-level1
                .col1 From
                .col2
                    .col2-text1
                    .col2-text2 Anytime
            .container__right-level4
                datepicker(monday-first=true :inline="true" :highlighted='state.highlighted' :disabled='state.disabled')
            .container__right-level5
                .col1
                    .col1-text 15 days selected
                .col2
                    button(@click="closeWindow") Close
</template>

<style lang="scss">
.quotesCalendarWrapper {
  position: absolute;
  top: 28%;
  left: -30%;
  z-index: 5;
  width: 582px;

  .container {
    display: flex;
    border: 2px solid #67573e;
    padding: 20px 20px 20px 20px;
    font-size: 16px;
    background-color: #fff;
    width: 100%;

    &__left {
      flex-direction: column;
      margin-right: 8%;
      width: 50%;
      &-level1 {
        display: flex;
        justify-content: space-around;
        margin-bottom: 3%;
        .col1 {
          color: #67573e;
          font-size: 16px;
          font-weight: bold;
          margin-right: 57%;
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
        display: flex;
        justify-content: flex-start;
        margin-bottom: 3%;
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
        justify-content: space-around;
        margin-bottom: 3%;
        .col1 {
          color: #67573e;
          font-size: 16px;
          font-weight: bold;
          margin-right: 57%;
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
        display: flex;
        justify-content: flex-start;
        margin-bottom: 3%;
      }
      &-level5 {
        display: flex;
        justify-content: space-evenly;

        .col1 {
          font-size: 14px;
          color: #e2dddb;
          &-text {
            padding-top: 16%;
          }
        }
        .col2 {
          button {
            background-color: #f5876e;
            border-radius: 8px;
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
      width: 260px;
      div {
        .day-header {
          font-weight: bold;
          font-size: 16px;
        }
        .cell {
          background-color: #eaeaea;
          height: 30px;
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
</style>

<script>
import DatePicker from "../Datepicker.vue";
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
      }
    };
  },
  methods: {
    closeWindow() {
      this.formVisible = !this.formVisible;
    }
  },
  components: {
    datepicker: DatePicker
  }
};
</script>
