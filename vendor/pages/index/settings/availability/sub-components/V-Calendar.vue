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
      @daymouseenter="mouseEnter"

    )

    .foo(v-if="isEditModalOpen")
      .modal__close(@click="onCloseEditModalClick")
        i.fas.fa-times
      Button.modal__button--add(value="Add" @clicked="onAddBtnClick")
      EditModal.edit(
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
import EditModal from './EditModal'
import Add from '../../../../../components/general/Add'
import Button from "../../../../../components/general/Button"
import moment from "moment"
import ValidationErrors from "../../../../../components/general/ValidationErrors";

export default {
  name: 'AbsenceCalendar',
  components: {
    Calendar,
    ModalAbsence,
    EditModal,
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
              label: `${item.reason} ${startOutput} - ${endOutput}`,
            },
          }
        }
        if (item.reason === 'Public holiday') {
          return {
            bar: 'teal',
            dates: item,
            popover: {
              label: `${item.reason} ${startOutput} - ${endOutput}`,
            },
          }
        }
        if (item.reason === 'Holidays') {
          return {
            bar: 'indigo',
            dates: item,
            popover: {
              label: `${item.reason} ${startOutput} - ${endOutput}`,
            },
          }
        }
        if (item.reason === 'Sick leave') {
          return {
            bar: 'red',
            dates: item,
            popover: {
              label: `${item.reason} ${startOutput} - ${endOutput}`,
            },
          }
        }
      })
    }
  },
  methods: {
    mouseEnter({dateTime}) {
      this.absenceSchedule.forEach(({_id, reason, start, end}) => {
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
      return  arr.join(' ')

    },
    onCloseModalBtnClick() {
      this.isModalOpen = false
    },
    onSaveModalBtnClick(data) {
      this.difference = data.end.getTime() < data.start.getTime()
      this.checkErrors()
      if(this.errors.length) return
      if (!data._id) {
        this.isModalOpen = false
        return this.$emit('saveAbsenceSchedule', [...this.absenceSchedule, data])
      }

      this.absenceSchedule.splice(this.absenceSchedule.findIndex(({_id}) => `${_id}` === `${data._id}`), 1, data)
      this.isModalOpen = false
      return this.$emit('saveAbsenceSchedule', this.absenceSchedule)
    },
    onDayClick({dateTime, date}) {
      this.editItems = []
      this.absenceSchedule.forEach(({_id, reason, start, end}) => {
        const d = new Date(start)
        d.setHours(0, 0, 0, 0)
        const startTimestamp = d.getTime()
        const endTimestamp = new Date(end).getTime()

        if (startTimestamp <= dateTime && dateTime <= endTimestamp) {
          this.editItems.push({_id, type: reason, start, end})
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
      this.absenceScheduleItem = editItem
      this.isModalOpen = true
      this.isEditModalOpen = false
    },
    onRemoveClick(day) {
      this.$emit('deleteAbsenceSchedule', day)
      this.isEditModalOpen = false
    },
    onCloseEditModalClick(item) {
      this.isEditModalOpen = false
    },
    onAddBtnClick() {
      if(this.isEditModalOpen) {
        this.isEditModalOpen = false
      }
      this.isModalOpen = true
      this.absenceScheduleItem.start = new Date(moment().startOf("minute").toISOString())
      this.absenceScheduleItem.end = new Date(moment().startOf("minute").toISOString())
    },
    checkErrors() {
      this.errors = []
      if(this.difference) this.errors.push('Please enter valid end day of absence.')

      if (this.errors.length) {
        this.areErrors = true
      }
    },
    closeErrors() {
      this.areErrors = false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../../../assets/scss/colors';

.calendar {
  margin-bottom: 30px;

  .vc-popover-content {
    background: white !important;
    color: #333 !important;
    border: 1px solid red !important;
    font-family: Roboto400 !important;
    font-size: 14px !important;
    padding: 10px !important;
  }

  .vc-text-center {
    color: #44bbdd !important;
  }

  .vc-day-popover-row {
    margin-top: 6px !important;
  }
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
  //margin: -10px;
  //flex-wrap: wrap;
}
//.edit {
//  flex-basis: calc((100% - 60px) / 3);
//  margin: 10px;
//}
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

.calendar /deep/ .vc-title-wrapper {
  color: $text !important;
  font-family: Myriad400 !important;

  &:hover {
    color: $border  !important;
    opacity: 1;
  }
}
.calendar /deep/ .vc-text-center.vc-text-xs.vc-text-gray-300.vc-font-semibold {
  color: $text !important;
  font-size: 14px;
}
.calendar /deep/ .vc-popover-content {

  background: white  !important;
  border: 1px solid $border  !important;
  color: $text !important;
  font-size: 14px !important;
  font-family: Myriad400 !important;
}
.calendar /deep/ .vc-font-semibold {
  font-weight: 400;
}
.calendar /deep/ .vc-font-medium {
  font-weight: 400;
}
.calendar /deep/ .vc-text-lg {
  font-size: 16px;
}
.calendar /deep/ .hover\:vc-opacity-75:hover {
  color: $dark-border;
  opacity: 1;
}
.calendar /deep/ .hover\:vc-opacity-50:hover {
  opacity: 1;
  & .vc-svg-icon {
    color: $text !important;
  }
}
.calendar /deep/ .hover\:vc-bg-gray-900:hover {
  background-color: white;
  color: $dark-border;
}
.calendar /deep/ .focus\:vc-border-blue-600:focus {
  border-color: $border;
}
.calendar /deep/ .vc-svg-icon {
  color: $dark-border !important;
  &:hover {
    color: $text !important;
  }
}
.calendar /deep/ .vc-bar.vc-bg-teal-600 {
  background-color: $green;
}
.calendar /deep/ .vc-bar.vc-bg-red-600 {
  background-color: $orange;
}
.calendar /deep/ .vc-bar.vc-bg-gray-600 {
  background-color: $beige;
}
.calendar /deep/ .vc-bar.vc-bg-orange-600 {
  background-color:  $medium-red;
}
.calendar /deep/ .vc-bg-teal-500 {
  background-color: $green;
}
.calendar /deep/ .vc-bg-red-500 {
  background-color: $orange;
}
.calendar /deep/ .vc-bg-gray-500 {
  background-color: $beige;
}
.calendar /deep/ .vc-bg-orange-500 {
  background-color:  $medium-red;
}
.calendar /deep/ .vc-text-blue-100 {
  color: $text;
  &:focus {
    color: $dark-border;
  }
}
.calendar /deep/ .hover\:vc-bg-gray-300 {
  background-color: white !important;
}
.calendar /deep/ .vc-bg-blue-100 {
  background-color: white;
}
.calendar /deep/ .hover\:vc-bg-gray-900 {
  background-color: white;
}
.calendar /deep/ .vc-text-blue-900 {
  color: $text;
}
.calendar /deep/ .vc-shadow {
  border-color: $border;
}
.calendar /deep/ .hover\:vc-shadow-inner:hover {
  box-shadow: inset 0 2px 4px 0 transparent;
}
.calendar /deep/ .vc-font-bold {
  font-weight: 400;
}
.calendar /deep/ .vc-shadow {
  box-shadow: $box-shadow;
}
.calendar /deep/ .vc-border-blue-100 {
  border-color: $dark-border;
}
.calendar /deep/ .vc-text-gray-500 {
  color: $dark-border;
}
.calendar /deep/ .vc-day-content:focus {
  background-color: $beige;
}
.calendar /deep/ .vc-day-content:hover {
  background-color: $cell-background;
}
.calendar /deep/ .vc-w-full {
  width: 800px !important;

}
.container /deep/ .calendar {
  margin-left: auto !important;
  margin-right: auto !important;
}
.container /deep/ .vc-border-gray-400 {
  border-color: $border;
}

</style>

