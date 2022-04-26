<template lang="pug">
  .container
    .wrapper
      draggable( :value="daysList" @input="changeItemPosition" handle=".handle")
        .item(v-for="(item, index) in daysList")
          .drop
            SelectSingle(
              :options="weekDays"
              placeholder="Option"
              :selectedOption="item.day"
              @chooseOption="({option}) => updateItem(option, 'day', index)"
            )
          span.time-text from
          .datepicker
            DatePicker.time-picker(
              class="datepicker"
              @confirm="(time) => updateItem(time, 'from', index)"
              ref="deadline"
              :clearable="false"
              :confirm="true"
              confirm-text="Set date"
              prefix-class="xmx"
              format="HH:mm"
              v-model="item.from"
              value-type="format"
              type="time"
              placeholder="hh:mm"
            )
            .converted-time(v-if="item.from") {{ convertToActualTimezone(item.from) }}

          span.time-text to
          .datepicker
            DatePicker.time-picker(
              @confirm="(time) => updateItem(time, 'to', index)"
              ref="deadline"
              :clearable="false"
              :confirm="true"
              confirm-text="Set date"
              prefix-class="xmx"
              v-model="item.to"
              format="HH:mm"
              value-type="format"
              type="time"
              placeholder="hh:mm"
            )
            .converted-time(v-if="item.to") {{ convertToActualTimezone(item.to) }}


          .remove-button(@click="remove(index)")
            .remove-button__icon
              i.fas.fa-trash
          .remove-button.handle(style="cursor: grab; margin-left: 10px;")
            .remove-button__icon
              i.fas.fa-arrows-alt-v

      Add(@add="addAvailableDay")

</template>


<script>
import SelectSingle from "../../../SelectSingle"
import DatePicker from 'vue2-datepicker'
import '@/assets/scss/datepicker.scss'
import Add from "../../../Add";
import draggable from 'vuedraggable'
import moment from "moment-timezone";

export default {
  name: 'ScheduleRow',
  props: {
    daysList: {
      type: Array,
      default: () => []
    },
    timezone: {
      type: String
    }
  },
  components: {
    Add,
    SelectSingle,
    DatePicker,
    draggable

  },
  data() {
    return {
      weekDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      day: '',
      userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }
  },
  methods: {
    convertActualDateFormat(time) {
      const currentDate = new Date();
      const currentDayOfMonth = currentDate.getDate().toString().padStart(2, '0');
      const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const currentYear = currentDate.getFullYear();
      const dateString = `${currentYear}-${currentMonth}-${currentDayOfMonth}`;
      return `${dateString} ${time}`
    },
    getTimeString(timeStr) {
      const yourDateObj = new Date();
      yourDateObj.setTime(Date.parse(timeStr));
      const min = yourDateObj.getMinutes().toString().padStart(2, '0');
      const hour = yourDateObj.getHours().toString().padStart(2, '0');
      return `${hour}:${min}`
    },
    convertToActualTimezone(time) {
      const calculatedDateString = moment.tz(this.convertActualDateFormat(time), this.timezone).tz(this.userTimezone).format()
      return this.getTimeString(calculatedDateString)
    },


    changeItemPosition(data) {
      this.$emit('changeItemPosition', data)
    },
    updateItem(value, prop, index) {
      this.$emit('update', {value, prop, index})
      console.log(value)
    },
    addAvailableDay() {
      this.$emit('add', {day: '', from: '', to: ''})
    },
    setDay(option) {
      this.day = option
    },
    remove(index) {
      this.$emit('remove', index)
    },
  }

}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors.scss";

//.container {
//  //border-right: 1px solid #ededed;
//  padding-right: 20px;
//}

.datepicker {
  position: relative;
}

.converted-time {
  position: absolute;
  top: 9px;
  right: 50px;
  opacity: 0.45;
}


.item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.drop {
  position: relative;
  width: 220px;
  height: 32px;
  background-color: white;
  margin-right: 20px;
}

.time-picker {
  margin-right: 20px;

}

//.time-picker {
//  position: relative;
//}

//.manager-time {
//  position: absolute;
//  top: 0;
//  right: 310px;
//  opacity: 0.45;
//  z-index: 1;
//}
//.time {
//  position: absolute;
//  top: 9px;
//  left: 250px;
//  opacity: 0.45;
//  z-index: 1;
//}

//.time-from {
//position: absolute;
//  top: 0;
//  left: 150px;
//}
//.time-to {
//  position: absolute;
//  top: 0;
//  right: 310px;
//}

.time-text {
  margin-right: 10px;
}

.remove-button {
  width: 25px;
  height: 25px;
  border: 1px solid $border;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  color: $dark-border;

  &:hover {
    color: $text;
  }

  &__icon {
    transition: .2s ease-out;
    font-size: 16px;
    margin-top: 2px;
  }
}
</style>

