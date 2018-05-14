<template lang="pug">
  .quotesCalendarWrapper
    .container(v-if="formVisible")
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
                    .col3-text Next
                    .col3-image
                        img(src="../../assets/images/open-close-arrow-brown.png")
            .container__left-level3
                .col1
                    .col1-text February
                    .col1-image
                        img(src="../../assets/images/open-close-arrow-brown.png")
                .col2
                    .col2-text 2018
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
                    .col3-text Next
                    .col3-image
                        img(src="../../assets/images/open-close-arrow-brown.png")
            .container__right-level3
                .col1
                    .col1-text February
                    .col1-image
                        img(src="../../assets/images/open-close-arrow-brown.png")
                .col2
                    .col2-text 2018
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
      &-level2 {
        display: flex;
        justify-content: space-between;
        border: 0.1px solid #e2dddb;
        margin-bottom: 7%;
        .col1 {
          width: 33%;
          border-right: 0.1px solid #e2dddb;
          display: flex;
          &-image {
            padding: 6px;
            transform: rotate(90deg);
          }
          &-text {
            padding: 6px;
          }
        }
        .col2 {
          width: 33%;
          border-right: 0.1px solid #e2dddb;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px 13px 6px 6px;
        }
        .col3 {
          width: 33%;
          display: flex;
          &-image {
            padding: 6px;
            transform: rotate(-90deg);
          }
          &-text {
            padding: 6px;
          }
        }
      }
      &-level3 {
        display: flex;
        flex-direction: column;
        margin-bottom: 3%;
            width: 68%;
        .col1 {
          border: 0.1px solid #e2dddb;
          margin-bottom: 1%;
          display: flex;
          justify-content: flex-end;
          &-text {
            padding: 6px 79px 6px 6px;
          }
          &-image {
            padding: 6px;
          }
        }
        .col2 {
          border: 0.1px solid #e2dddb;
          margin-bottom: 3%;
          display: flex;
          justify-content: flex-end;
          &-text {
            padding: 6px 105px 6px 6px;
          }
          &-image {
            padding: 6px;
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
      // margin-right: 8%;
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
      &-level2 {
        display: flex;
        justify-content: space-between;
        border: 0.1px solid #e2dddb;
        margin-bottom: 7%;
        .col1 {
          width: 33%;
          border-right: 0.1px solid #e2dddb;
          display: flex;
          &-image {
            padding: 6px;
            transform: rotate(90deg);
          }
          &-text {
            padding: 6px;
          }
        }
        .col2 {
          width: 33%;
          border-right: 0.1px solid #e2dddb;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px 13px 6px 6px;
        }
        .col3 {
          width: 33%;
          display: flex;
          &-image {
            padding: 6px;
            transform: rotate(-90deg);
          }
          &-text {
            padding: 6px;
          }
        }
      }
      &-level3 {
        display: flex;
        flex-direction: column;
        margin-bottom: 3%;
            width: 68%;
        .col1 {
          border: 0.1px solid #e2dddb;
          margin-bottom: 1%;
          display: flex;
          justify-content: flex-end;
          &-text {
            padding: 6px 79px 6px 6px;
          }
          &-image {
            padding: 6px;
          }
        }
        .col2 {
          border: 0.1px solid #e2dddb;
          margin-bottom: 3%;
          display: flex;
          justify-content: flex-end;
          &-text {
            padding: 6px 105px 6px 6px;
          }
          &-image {
            padding: 6px;
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
            &-text{
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
      formVisible: true
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
