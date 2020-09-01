<template lang="pug">
.datepickers
  .picker-block
    .picker-block__item
      .picker-block__title {{ title }}
      .picker-block__check
        CheckBox(:isChecked="isAnytime", @check="setAnytime", @uncheck="removeAnytime")
        .picker-block__label Anytime
    .picker-block__item
      .picker-block__days-setter(@click="setPrevDate") Prev
      .picker-block__days-setter(@click="setTodaysDate") Today
      .picker-block__days-setter(@click="setNextDate") Next
    .picker-block__item
      .picker-block__month
      .picker-block__year
    .picker-block__item
      Datepicker(
        :value="date",
        @selected="setDate",
        :inline="true",
        calendarClass="steps__calendar-custom",
        :format="customFormatter",
        monday-first,
        :highlighted="highlighted"
      )
</template>

<script>
import Datepicker from "../../Datepicker";
import CheckBox from "../../CheckBox";
import moment from "moment";

export default {
  props: {
    title: { type: String },
    date: { type: Date },
    disabled: { type: Object },
  },
  data() {
    return {
      highlighted: {
        days: [6, 0],
      },
      isAnytime: false,
    };
  },
  methods: {
    customFormatter(date) {
      return moment(date).format("DD-MM-YYYY");
    },
    setDate(e) {
      this.$emit("setDate", { date: e });
    },
    setTodaysDate() {
      this.$emit("setDate", { date: new Date() });
    },
    setNextDate() {
      const today = new Date();
      this.$emit("setDate", { date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1) });
    },
    setPrevDate() {
      const today = new Date();
      this.$emit("setDate", { date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1) });
    },
    setAnytime() {
      this.isAnytime = true;
      this.$emit("setAnytime");
    },
    removeAnytime() {
      this.isAnytime = false;
      this.$emit("removeAnytime");
    },
  },
  components: {
    Datepicker,
    CheckBox,
  },
};
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.picker-block {
  display: flex;
  flex-direction: column;
  &__title {
    font-weight: 600;
  }
  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  &__days-setter {
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid $light-brown;
    border-right: none;
    cursor: pointer;
    padding: 3px;
    width: 32%;
    transition: all 0.2s;
    &:nth-of-type(2) {
      width: 36%;
    }
    &:last-child {
      border-right: 1px solid $light-brown;
    }
    &:hover {
      text-shadow: 0 0 5px $brown-shadow;
    }
  }
  &__check {
    display: flex;
    align-items: center;
  }
  &__label {
    margin-left: 5px;
  }
}
</style>
