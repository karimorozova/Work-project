<template lang="pug">
.other-information
    .block-item
        .block-item__label First Contact Date:
        .block-item__time
          .block-item__time-input
            Datepicker(
              monday-first=true
              ref="firstContactDate"
              inputClass="datepicker-custom-client"
              calendarClass="calendar-custom" 
              :format="customFormatter"
              @selected="setDate"
              :value="currentClient.hasOwnProperty('otherInfo') ? currentClient.otherInfo.firstContactDate : firstContactDate"
            )
        img.icon(src="../../assets/images/calendar.png" @click="openCalendar")

    .block-item
        .block-item__label Client First Quote Date:
        .block-item__time {{ currentClient.otherInfo.firstQuoteDate || emptyField }}
    .block-item
        .block-item__label Client Last Quote Date:
        .block-item__time {{ currentClient.otherInfo.lastQuoteDate || emptyField }}
    .block-item
        .block-item__label Client First Project Date:
        .block-item__time {{ currentClient.otherInfo.firstProjectDate || emptyField }}
    .block-item
        .block-item__label Client Last Project Date:
        .block-item__time {{ currentClient.otherInfo.lastProjectDate || emptyField }}

</template>
<script>
import Datepicker from "../Datepicker";
import moment from "moment";
import { mapGetters, mapActions } from "vuex";

export default {
  data() {
    return {
      firstContactDate: '',
      emptyField: "Not yet assigned",
    };
  },
  methods: {
    ...mapActions({
      storeClientProperty: "storeClientProperty"
    }),
    customFormatter(date) {
      return moment(date).format("DD-MM-YYYY");
    },
    openCalendar() {
      this.$refs.firstContactDate.showCalendar();
    },
    setDate(date) {
      this.firstContactDate = date;
      let clientDates = {
        firstContactDate: date,
      };
      this.storeClientProperty({ prop: "otherInfo", value: clientDates });
    }
  },
  computed: {
    ...mapGetters({
      currentClient: "getCurrentClient"
    })
  },
  components: {
    Datepicker
  }
};
</script>
<style lang="scss" scoped>
.other-information {
  padding: 20px;
  .block-item:last-child {
    height: 30px;
  }
  .block-item:first-child {
    margin-top: 10px;
    position: relative;
  }
  .block-item {
    display: flex;
    height: 50px;
    &__last {
      height: 30px;
    }
    &__label {
      width: 179px;
    }
    &__time {
      position: relative;
      width: 171px;
      &-input{
        margin-top: -6px;
      }
    }
  }
  .icon {
    position: absolute;
    right: 5px;
    width: 20px;
    cursor: pointer;
  }
}
</style>