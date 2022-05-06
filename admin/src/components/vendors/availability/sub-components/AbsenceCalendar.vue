<template lang="pug">
  .container
    ValidationErrors(
      v-if="areErrors"
      :errors="errors"
      :isAbsolute="true"
      @closeErrors="closeErrors"
    )
    Calendar.calendar(
      ref="calendar"
      transition="slide-h"
      @dayclick="onDayClick"
      :attributes="attributes"
      is-range="true"
      :columns="$screens({ default: 1, lg: 2 })"
      :is-expanded="true"
      @daymouseenter="mouseEnter"

    )

    .foo(v-if="isEditModalOpen")
      .modal__close(@click="onCloseEditModalClick")
        i.fas.fa-times
      Button.modal__button--add(value="Add" @clicked="onAddBtnClick")
      EditModalAbsence(
        v-for="editItem in editItems"
        @edit="onEditClick"
        @remove="onRemoveClick"
        @close="onCloseEditModalClick"
        :editItem="editItem"
      )

    ModalAbsence(
      v-if="isModalOpen"
      @close="onCloseModalBtnClick"
      @onSaveClick="onSaveModalBtnClick"
      :absenceScheduleItem="absenceScheduleItem"
    )
    Add(@add="onAddBtnClick")
</template>
<script>
import Calendar from 'v-calendar/lib/components/calendar.umd'
import ModalAbsence from './ModalAbsence'
import EditModalAbsence from './EditModalAbsence'
import Button from "../../../Button"
import ValidationErrors from "../../../ValidationErrors"
import Add from "../../../Add"
import moment from "moment"

export default {
  name: 'AbsenceCalendar',
  components: {
    Calendar,
    ModalAbsence,
    EditModalAbsence,
    Add,
    Button,
    ValidationErrors
  },
  props: {
    absenceSchedule: {
      type: Array
    }
  },
  data() {
    return {
      isModalOpen: false,
      isEditModalOpen: false,
      firstDayOfWeek: 1,
      editItems: [],
      errors: [],
      difference: false,
      areErrors: false,
      absenceScheduleItem: {
        start: new Date(moment().startOf("minute").toISOString()),
        end: new Date(moment().startOf("minute").toISOString()),
        reason: 'None',
        totalDays: 0
      }
    }
  },
  computed: {
    attributes() {
      return this.absenceSchedule.map(item => {

        const startOutput = this.convertDateString(item.start)
        const endOutput = this.convertDateString(item.end)
        item.start = new Date(item.start)
        item.end = new Date(item.end)

        if (item.reason === 'None') {
          return {
            bar: 'gray',
            dates: item,

            popover: {
              label: `${ item.reason } ${ startOutput } - ${ endOutput }`
            }
          }
        }
        if (item.reason === 'Public holiday') {
          return {
            bar: 'teal',
            dates: item,
            popover: {
              label: `${ item.reason } ${ startOutput } - ${ endOutput }`
            }
          }
        }
        if (item.reason === 'Holidays') {
          return {
            bar: 'indigo',
            dates: item,
            popover: {
              label: `${ item.reason } ${ startOutput } - ${ endOutput }`
            }
          }
        }
        if (item.reason === 'Sick leave') {
          return {
            bar: 'red',
            dates: item,
            popover: {
              label: `${ item.reason } ${ startOutput } - ${ endOutput }`
            }
          }
        }
      })
    }
  },
  methods: {
    mouseEnter({ dateTime }) {
      this.absenceSchedule.forEach(({ _id, reason, start, end }) => {
        const d = new Date(start)
        d.setHours(0, 0, 0, 0)
        const startTimestamp = d.getTime()
        const endTimestamp = new Date(end).getTime()
        if (startTimestamp <= dateTime && dateTime <= endTimestamp) {
          this.absenceScheduleItem.start = new Date(start).toLocaleString()
          this.absenceScheduleItem.end = new Date(end).toLocaleString()
          this.absenceScheduleItem.reason = reason
        }
      })
    },
    convertDateString(date) {
      const arr = new Date(date).toString().split(' ')
      arr.splice(5)
      arr[4] = arr[4].split('')
      arr[4].splice(5)
      arr[4].join('')
      const str = Array.from(arr[4]).join('')
      arr[4] = str
      arr.splice(3, 1)
      return arr.join(' ')

    },
    onCloseModalBtnClick() {
      this.isModalOpen = false
    },
    onSaveModalBtnClick(data) {
      this.difference = data.end.getTime() < data.start.getTime()
      this.checkErrors()
      if (this.errors.length) return
      if (!data._id) {
        this.isModalOpen = false
        return this.$emit('saveAbsenceSchedule', [ ...this.absenceSchedule, data ])
      }

      this.absenceSchedule.splice(this.absenceSchedule.findIndex(({ _id }) => `${ _id }` === `${ data._id }`), 1, data)
      this.isModalOpen = false
      return this.$emit('saveAbsenceSchedule', this.absenceSchedule)
    },
    checkErrors() {
      this.errors = []
      if (this.difference) this.errors.push('Please enter valid end day of absence.')

      if (this.errors.length) {
        this.areErrors = true
      }
    },
    closeErrors() {
      this.areErrors = false
    },
    onDayClick({ dateTime, date }) {
      this.editItems = []
      this.absenceSchedule.forEach(({ _id, reason, start, end }) => {
        const d = new Date(start)
        d.setHours(0, 0, 0, 0)
        const startTimestamp = d.getTime()
        const endTimestamp = new Date(end).getTime()

        if (startTimestamp <= dateTime && dateTime <= endTimestamp) {
          this.editItems.push({ _id, type: reason, start, end })
        }
      })

      if (this.editItems.length) {
        this.isModalOpen = false
        this.isEditModalOpen = true
        return
      }
      this.absenceScheduleItem.start = new Date(moment(date).startOf("minute").toISOString())
      this.absenceScheduleItem.end = new Date(moment(date).startOf("minute").toISOString())
      this.isModalOpen = true
    },
    onEditClick(editItem) {
      console.log(editItem)
      this.absenceScheduleItem = editItem
      this.isModalOpen = true
      this.isEditModalOpen = false
      console.log(this.absenceScheduleItem)
    },
    onRemoveClick(day) {
      this.$emit('deleteAbsenceSchedule', day)
      this.isEditModalOpen = false
    },
    onCloseEditModalClick(item) {
      this.isEditModalOpen = false
    },
    onAddBtnClick() {
      if (this.isEditModalOpen) {
        this.isEditModalOpen = false
      }
      this.isModalOpen = true
      this.absenceScheduleItem.start = new Date(moment().startOf("minute").toISOString())
      this.absenceScheduleItem.end = new Date(moment().startOf("minute").toISOString())
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors.scss";

.calendar {
  margin-bottom: 30px;
}

.foo {
  display: flex;
  justify-content: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 8;
  background: white;
  padding: 25px;
  padding-bottom: 50px;
  box-shadow: $box-shadow;
}

.modal__button--add {
  position: absolute;
  bottom: 10px;
  right: 10px;
}

.modal__close {
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

.fas.fa-times {
  width: 20px;
  height: 20px;
}

.calendar /deep/ .vc-text-center.vc-text-xs.vc-text-gray-300.vc-font-semibold {
  color: $text !important;
}

.calendar /deep/ .vc-popover-content {
  background-color: #3FB354 !important;
  background: white !important;
  border: 1px solid $border !important;
  color: $text !important;
}
</style>
