<template lang="pug">
  .quotesCalendarWrapper(v-click-outside="close")
    .calendarContainer
        .calendarContainer__left
            .calendarContainer__left-level1
                .col1 From
                .col2
                    .col2-text1(@click="fromAny")
                      .innerCheck(:class="{checkedBox: checked.from}")
                    .col2-text2 Anytime
            .calendarContainer__left-level4
                input(type="text" :value="dateFrom" readonly)
                datepicker(monday-first=true :inline="true" :highlighted='state.highlighted' @selected="(date) => setDate(date, 'from')" v-model="datesFilter.from")
        .calendarContainer__right
            .calendarContainer__right-level1
                .col1 To
                .col2
                    .col2-text1(@click="toAny")
                      .innerCheck(:class="{checkedBox: checked.to}")
                    .col2-text2 Anytime
            .calendarContainer__right-level4
                input(type="text" :value="dateTo" readonly)
                datepicker(monday-first=true :inline="true" :highlighted='state.highlighted' @selected="(date) => setDate(date, 'to')" v-model="datesFilter.to")
            .calendarContainer__right-level5
                .col2
                    button(@click="close") Close
</template>


<script>
import DatePicker from "../Datepicker.vue";
import moment from "moment";
import ClickOutside from "vue-click-outside";

export default {
  props: {
    datesFilter: {
      type: Object,
      default: () => {
        return {
            from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), 
            to: new Date()
          }
      }
    }
  },
  data() {
    return {
      state: {
        highlighted: {
          days: [6, 0]
        },
        disabled: {
          to: moment().add(-1, 'day').endOf('day').toDate()
        }
      },
      currentTo: ''
    }
  },
  methods: {
    close() {
      this.$emit('close')
    },
    setDate(date, prop) {
      this.$emit('setDate', { prop , date })
    },
    fromAny() {
      let from = new Date(1970, 1, 1);
      if(this.checked.from) {
        from = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
      this.$emit('fromAny', { from });
    },
    toAny() {
      this.$emit('toAny', {to: new Date()});
    }
  },
  computed: {
    dateFrom() {
      return moment(this.datesFilter.from).format('MMMM Do YYYY')
    },
    dateTo() {
      return moment(this.datesFilter.to).format('MMMM Do YYYY')      
    },
    checked() {
      let result = {from: false, to: false}
      if(this.datesFilter.from <= new Date(1970, 1, 1)) {
        result.from = true;
      }
      if(this.datesFilter.to >= moment(new Date()).hours(2)) {
        result.to = true
      }
      return result;
    }
  },
  components: {
    datepicker: DatePicker
  },
  directives: {
    ClickOutside
  }
};
</script>


<style lang="scss">
@import "../../assets/styles/quotes/quotescalendardetailed.scss";

</style>