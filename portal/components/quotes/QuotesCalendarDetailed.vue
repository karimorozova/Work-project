<template lang="pug">
  .quotesCalendarWrapper
    .container(v-if="currentFormVisible")
        .container__left
            .container__left-level1
                .col1 From
                .col2
                    .col2-text1
                    .col2-text2 Anytime
            .container__left-level2
                .col1
                    .col1-image
                        img(src="../../assets/images/open-close-arrow-brown.png")
                    .col1-text Prev
                .col2 Today
                .col3
                    .col3-image
                        img(src="../../assets/images/open-close-arrow-brown.png")
                    .col3-text Next
            .container__left-level3
                .col1
                    .col1-text February
                    .col1-image
                        img(src="../../assets/images/open-close-arrow-brown.png")
                .col2
                    .col2-text February
                    .col2-image
                        img(src="../../assets/images/open-close-arrow-brown.png")
            .container__left-level4
                datepicker
            .container__left-level5
                .col1
                    .col1-text Current
                    .col1-image
                        img(src="../../assets/images/open-close-arrow-brown.png")
                .col2
                    .col2-text Last
                    .col2-image
                        img(src="../../assets/images/open-close-arrow-brown.png")
                .col3
                    .col3-text Next
                    .col3-image
                        img(src="../../assets/images/open-close-arrow-brown.png")
        .container__right
            .container__right-level1
                .col1 From
                .col2
                    .col2-text1
                    .col2-text2 Anytime
            .container__right-level2
                .col1
                    .col1-image
                        img(src="../../assets/images/open-close-arrow-brown.png")
                    .col1-text Prev
                .col2 Today
                .col3
                    .col3-image
                        img(src="../../assets/images/open-close-arrow-brown.png")
                    .col3-text Next
            .container__right-level3
                .col1
                    .col1-text February
                    .col1-image
                        img(src="../../assets/images/open-close-arrow-brown.png")
                .col2
                    .col2-text February
                    .col2-image
                        img(src="../../assets/images/open-close-arrow-brown.png")
            .container__right-level4
                datepicker
            .container__right-level5
                .col1
                    .col1-text 15 days selected
                .col2
                    button(@click="closeWindow") Close
</template>

<style lang="scss" scoped>
.quotesCalendarWrapper {
  position: absolute;
  background-color: #fff;
  top: -160%;
  left: -4%;
  z-index: 5;

  .container {
    display: flex;
    border: 2px solid #67573e;
    padding: 20px;
    font-size: 16px;

    &__left {
      width: 50%;
      flex-direction: column;
      margin-right: 40px;
      &-level1 {
        display: flex;
        justify-content: space-around;
        margin-bottom: 2%;
        .col1 {
          color: #67573e;
          font-size: 16px;
          font-weight: bold;
          margin-right: 27%;
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
      &-level2 {
        display: flex;
        border: 0.1px solid #e2dddb;
        .col1 {
          border-right: 0.1px solid #e2dddb;
        }
        .col2 {
          border-right: 0.1px solid #e2dddb;
        }
      }
      &-level3 {
        display: flex;
        .col1 {
          border: 0.1px solid #e2dddb;
        }
        .col2 {
          border: 0.1px solid #e2dddb;
        }
      }
      &-level4 {
        display: flex;
      }
      &-level5 {
        display: flex;
      }
    }

    &__right {
      width: 50%;
      flex-direction: column;
      margin-right: 40px;
      &-level1 {
        display: flex;
        justify-content: space-around;
        margin-bottom: 2%;
        .col1 {
          color: #67573e;
          font-size: 16px;
          font-weight: bold;
          margin-right: 27%;
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
      &-level2 {
        display: flex;
        border: 0.1px solid #e2dddb;
        .col1 {
          border-right: 0.1px solid #e2dddb;
        }
        .col2 {
          border-right: 0.1px solid #e2dddb;
        }
      }
      &-level3 {
        display: flex;
        .col1 {
          border: 0.1px solid #e2dddb;
        }
        .col2 {
          border: 0.1px solid #e2dddb;
        }
      }
      &-level4 {
        display: flex;
      }
      &-level5 {
        display: flex;

        .col1 {
          font-size: 14px;
          color: #e2dddb;
        }
        .col2 {
          button {
            background-color: #f5876e;
            border-radius: 8px;
            color: #fff;
            width: 100px;
            height: 30px;
            border: none;
          }
        }
      }
    }
  }
}
</style>

<script>
import DatePicker from "../Datepicker.vue";

export default {
  data() {
    return {
      currentFormVisible: true
    };
  },
  methods: {
    closeWindow() {
      this.currentFormVisible = !this.currentFormVisible;
    }
  },
  components: {
    datepicker: DatePicker
  }
};
</script>
