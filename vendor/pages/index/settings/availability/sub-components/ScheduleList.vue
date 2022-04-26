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
          .drop
            DatePicker(
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
          span.time-text to
          .drop
            DatePicker(
              class="datepicker"
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
          .remove-button(@click="remove")
            .remove-button__icon
              i.fas.fa-trash
          .remove-button.handle(style="cursor: grab; margin-left: 10px;")
            .remove-button__icon
              i.fas.fa-arrows-alt-v

    Add(@add="addAvailableDay")
</template>

<script>
import SelectSingle from "../../../../../components/general/SelectSingle"
import DatePicker from 'vue2-datepicker'
import '@/assets/scss/datepicker.scss'
import Add from "../../../../../components/general/Add"
import draggable from 'vuedraggable'

export default {
  name: 'ScheduleRow',
  props: {
    daysList: {
      type: Array,
      default: () => []
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
      weekDays: [ 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday' ]
    }
  },
  methods: {
    changeItemPosition(data) {
      this.$emit('changeItemPosition', data)
    },
    updateItem(value, prop, index) {
      this.$emit('update', { value, prop, index })
    },
    addAvailableDay() {
      this.$emit('add', { day: '', from: '', to: '' })
    },
    setDay(option) {
      this.day = option
    },
    remove() {
      this.$emit('remove')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../../../assets/scss/colors';

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

  &__icon {
    transition: .2s ease-out;
    font-size: 16px;
    margin-top: 2px;

    &:hover {
      color: $text;
    }
  }
}
</style>
