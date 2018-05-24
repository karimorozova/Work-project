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
                datepicker(monday-first=true :inline="true" :highlighted='state.highlighted' v-model="datesFilter.from")
        .calendarContainer__right
            .calendarContainer__right-level1
                .col1 To
                .col2
                    .col2-text1(@click="toAny")
                      .innerCheck(:class="{checkedBox: checked.to}")
                    .col2-text2 Anytime
            .calendarContainer__right-level4
                input(type="text" :value="dateTo" readonly)
                datepicker(monday-first=true :inline="true" :highlighted='state.highlighted' v-model="datesFilter.to")
            .calendarContainer__right-level5
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
      },
      datesFilter: {from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), to: new Date()},
      checked: {from: false, to: false},
      currentTo: ''
    }
  },
  methods: {
    closeWindow() {
      this.formVisible = !this.formVisible;
      this.$emit('dateFilter', this.datesFilter)
    },
    fromAny() {
      this.checked.from = !this.checked.from;
      if(!this.checked.from) {
        this.datesFilter.from = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      } else {
        this.datesFilter.from = new Date(1970, 1, 1);
      }
      this.$emit('fromAny', this.datesFilter);
    },
    toAny() {
      this.checked.to = !this.checked.to;
      this.datesFilter.to = new Date();        
      this.$emit('toAny', this.datesFilter);
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
@import "../../assets/styles/quotes/quotescalendardetailed.scss";

</style>