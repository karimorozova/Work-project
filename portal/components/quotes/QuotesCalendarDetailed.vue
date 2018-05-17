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
                .col1 To
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


<style lang="scss">
@import "../../assets/styles/quotes/quotescalendardetailed.scss";

</style>