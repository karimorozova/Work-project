<template lang="pug">
  .modal
    .modal__title--wrapper
      h2.modal__title Time off
      .modal__close(@click="close")
        i.fas.fa-times
    .modal__range
      .modal__range--day
        span.modal__range--text From
        .drop
          DatePicker(
            class="datepicker"
            ref="from"
            prefix-class="xmx"
            value-type="date"
            type="datetime"
            v-model="from"
            format="DD-MM-YYYY, HH:mm"
            :clearable="false"

          )
      .modal__range--day
        span.modal__range--text To
        .drop
          DatePicker(
            class="datepicker"
            ref="to"
            prefix-class="xmx"
            value-type="date"
            type="datetime"
            v-model="to"
            format="DD-MM-YYYY, HH:mm"
            :clearable="false"
            :disabled-date="notBeforeToday"
            :disabled-time="notBeforeTodayTime"
            @close="onTotalDaysClick"

          )

    p.modal__quantity Total: {{totalDays}} d
    .modal__reason
      label.modal__reason--lable Type of leave
      .modal__input--wrapper
        .modal__calendar
          i.fa-solid.fa-calendar-days
        .drop.modal__reason--input
          SelectSingle(
            :options="reasons"
            placeholder="Type of leave"
            :selectedOption="reason"
            @chooseOption="setReason"
          )
    .modal__buttons
      Button.modal__button--save(color="#4ba5a5" value="Save" @clicked="onSaveClick")
      Button(color="#4ba5a5" value="Cancel" @clicked="close" :outline="true")


</template>

<script>
import SelectSingle from "../../../SelectSingle"
import DatePicker from 'vue2-datepicker'
import '@/assets/scss/datepicker.scss'
import Button from "../../../Button"

export default {
  name: 'ModalAbsence',
  data() {
    return {
      reasons: [ 'None', 'Holidays', 'Public holiday', 'Sick leave' ],
      reason: 'None',
      from: new Date(this.absenceScheduleItem.start),
      to: new Date(this.absenceScheduleItem.end),
      oneDay: 1000 * 60 * 60 * 24,
      totalDays: 0,
    }
  },
  props: {
    absenceScheduleItem: {
      type: Object
    }
  },
  methods: {
    notBeforeToday(date) {
      const start = new Date(this.from)
      start.setDate(start.getDate() - 1)
      return date < start
    },
    notBeforeTodayTime(date) {
      return date < new Date(this.from)
    },
    onSaveClick() {
      this.$emit('onSaveClick', { ...this.absenceScheduleItem, start: this.from, end: this.to, reason: this.reason, totalDays: this.totalDays })
    },
    onTotalDaysClick() {
      if (this.from.getDate() === this.to.getDate() && this.from.getMonth() === this.to.getMonth()) {
        this.totalDays = 1
        return
      }
      this.totalDays = Math.ceil(((this.to.getTime() + 1) - this.from.getTime()) / this.oneDay)
    },
    setReason(option) {
      this.reason = option.option
    },
    close() {
      this.$emit('close')
    },
  },
  components: {
    DatePicker,
    SelectSingle,
    Button,
  }

}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors.scss";

.modal {
  z-index: 8;
  position: absolute;
  background: white;
  padding: 20px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  box-shadow: $box-shadow;

  &__close {
    position: absolute;
    right: 10px;
    top: 10px;
    font-size: 16px;
    cursor: pointer;
    opacity: 0.8;
    transition: .1s ease-out;

    &:hover {
      opacity: 1;
    }
  }
}

.modal__button {
  text-align: center;
  min-width: 110px;
  height: 30px;
  font-size: 14px;
  border-radius: 2px;
  background-color: white;
  color: inherit;
  outline: none;
  letter-spacing: 0.2px;
  cursor: pointer;
  transition: .05s ease-out;
  border: 1px solid $border;
  box-sizing: border-box;
  cursor: pointer;
  transition: .05s ease-out;

  &--save {
    margin-right: 20px;
  }

  &:hover, &:focus {
    background-color: $green;
    color: white;
  }

}

.modal__range {
  display: flex;
  margin-bottom: 20px;
}

.modal__range--day {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.modal__range--text {

  margin-bottom: 10px;
  font-size: 14px;
  color: #333333;
  font-weight: 600;
}

.drop {
  position: relative;
  width: 220px;
  height: 32px;
  background-color: white;
  margin-right: 20px;

  &.modal__reason--input {
    width: 100%;
  }
}

.modal__title--wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  position: relative;
}

.modal__title {
  font-size: 16px;
  color: #333333;
  font-weight: 600;
  margin: 0;
}

.modal__close {
  position: absolute;
  top: 1px;
  right: 0;
}

.modal__quantity {
  margin-bottom: 30px;
  font-size: 14px;
  color: #333333;
  font-weight: 600;
}

.modal__buttons {
  //text-align: center;
  display: flex;
  justify-content: center;
}

.modal__reason {
  margin-bottom: 30px;
}

.modal__reason--lable {
  display: block;
  margin-bottom: 10px;
  padding-left: 33px;
  font-size: 14px;
  color: #333333;
  font-weight: 600;
}

.modal__input--wrapper {
  display: flex;
  align-items: center;
}

.modal__calendar {
  color: #999999;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 25px;
  height: 25px;
  margin-right: 10px;
}

.fa-calendar-days {
  width: 20px;
  height: 20px;
}

.modal__range--time {
  align-self: flex-end;
  position: relative;
  width: 110px;
  height: 32px;
  display: flex;
  align-items: center;

}

.timepicker {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  opacity: 0;
}

.modal__range--time--title {
  margin: 0;
  cursor: pointer;
}

.modal__time {
  top: 10px;
  right: 10px;
}
</style>
