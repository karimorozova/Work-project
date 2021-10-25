<template lang="pug">
  .wrapper
    .steps(v-if="tasksData.stepsAndUnits && tasksData.stepsAndUnits.length")
      draggable( :value="tasksData.stepsAndUnits" @input="dragAndDropSteps" handle=".handle")
        .step(v-for="(item, index) in tasksData.stepsAndUnits" )

          .step__titleRow
            .step__titleRow-title {{ item.step.title }}
            .step__titleRow-desctiptions(v-if="isCatUnit || isDisabledPayablesEdit" )
              .step__titleRow-desctiptions-title Receivables & Payables
              .step__titleRow-desctiptions-title Dates
            .step__titleRow-desctiptions(v-else)
              .step__titleRow-desctiptions-title Receivables
              .step__titleRow-desctiptions-title Payables
              .step__titleRow-desctiptions-title Dates

          .step__detailsRow

            .step__icons(v-if="tasksData.service && tasksData.service.title !== 'Translation'")
              .step__icon(@click="deleteStep(index)" style="cursor: pointer;")
                i.fas.fa-trash
              .step__icon.handle(style="cursor: grab")
                i.fas.fa-arrows-alt-v


            .step__settings(v-if=" item.step.title === 'Translation' && item.receivables.unit.type === 'CAT Wordcount'" )
              .step__setting
                .step__setting-title Unit:
                .drop
                  SelectSingle(
                    :selectedOption="item.receivables.unit.type || ''"
                    :options="item.step.calculationUnit.map(i => i.type)"
                    placeholder="Select"
                    @chooseOption="(e) => setUnit(e, 'receivables', index)"
                  )
              .step__setting
                .step__setting-title Memoq:
                .drop(v-if="templates.length")
                  SelectSingle(
                    :hasSearch="true"
                    :selectedOption="tasksData.template ? tasksData.template.name : ''"
                    :options="templates.map(i => i.name)"
                    placeholder="Select"
                    @chooseOption="setTemplate"
                  )

            .step__settings(v-if="!isCatUnit")
              .step__setting
                .step__setting-title Unit:
                .drop
                  SelectSingle(
                    :selectedOption="item.receivables.unit.type || ''"
                    :options="item.step.calculationUnit.map(i => i.type)"
                    placeholder="Select"
                    @chooseOption="(e) => setUnit(e, 'receivables', index)"
                  )
              .step__setting
                .step__setting-title Quantity:
                input(type="number" placeholder="Value" min="1" max="100000" :value="item.receivables.quantity || ''" @change="(e) => setQuantity(e, 'receivables', index)")

            .step__settings(v-if="!isCatUnit && !isDisabledPayablesEdit")
              .step__setting
                .step__setting-title Unit:
                .drop
                  SelectSingle(
                    :selectedOption="item.payables.unit.type || ''"
                    :options="item.step.calculationUnit.map(i => i.type)"
                    placeholder="Select"
                    @chooseOption="(e) => setUnit(e, 'payables', index)"
                    :isDisabled="isDisabledPayablesEdit"
                  )
              .step__setting
                .step__setting-title Quantity:
                input(type="number" :disabled="isDisabledPayablesEdit" placeholder="Value" min="1" max="100000" :value="item.payables.quantity || ''" @change="(e) => setQuantity(e, 'payables', index)")

            .step__date
              .step__datepicker
                .step__datepicker-title Start:
                .step__datepicker-input
                  DatepickerWithTime(
                    :isReadonly="true"
                    :value="item.start"
                    :format="customFormatter"
                    monday-first=true
                    :highlighted="highlighted"
                    inputClass="datepicker-custom"
                    inputClass2="datepicker-custom-mod2"
                    calendarClass="calendar-custom"
                    :placeholder="'Date'"
                    @selected="(e) => setDate(e, 'start', index)"
                  )
                  i.far.fa-calendar-alt.calendar

              .step__datepicker
                .step__datepicker-title Deadline:
                .step__datepicker-input
                  DatepickerWithTime(
                    :isReadonly="true"
                    :value="item.deadline"
                    :format="customFormatter"
                    monday-first=true
                    :highlighted="highlighted"
                    inputClass="datepicker-custom"
                    inputClass2="datepicker-custom-mod2"
                    calendarClass="calendar-custom"
                    :placeholder="'Date'"
                    @selected="(e) => setDate(e, 'deadline', index)"
                  )
                  i.far.fa-calendar-alt.calendar

    .add(v-if="!isCatUnit" )
      .add__row
        .add__add(v-if="tasksData.service.steps.map(i => i.step).length !== tasksData.stepsAndUnits.length")
          Add
        .add__add(v-else)
        .add__options
          CheckBox(:isChecked="isDisabledPayablesEdit" @check="toggleBox" @uncheck="toggleBox")
          span Same payable options

</template>

<script>
import { mapActions, mapGetters } from "vuex"
import DatepickerWithTime from "../../DatepickerWithTime"
import moment from "moment"
import SelectSingle from "../../SelectSingle"
import draggable from "vuedraggable"
import JobDescriptors from "../JobDescriptors"
import Add from "../../Add"
import CheckBox from "../../CheckBox"

export default {
  components: { CheckBox, Add, JobDescriptors, SelectSingle, DatepickerWithTime, draggable },
  props: {
    templates: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      isDisabledPayablesEdit: true,
      highlighted: {
        days: [ 6, 0 ]
      },
      disabled: {
        to: moment().add(-1, 'day').endOf('day').toDate()
      }
    }
  },
  methods: {
    ...mapActions({ alertToggle: 'alertToggle', setDataValue: "setTasksDataValue" }),
    toggleBox() {
      this.isDisabledPayablesEdit = !this.isDisabledPayablesEdit
    },
    setTemplate({ option }) {
      const template = this.templates.find(i => i.name === option)
      this.setDataValue({ prop: 'template', value: template })
    },
    customFormatter(date) {
      return moment(date).format('DD-MM-YYYY, HH:mm')
    },
    setDate(e, prop, index) {
      let stepsAndUnits = this.tasksData.stepsAndUnits
      stepsAndUnits[index][prop] = new Date(e)
      this.setDataValue({ prop: 'stepsAndUnits', value: stepsAndUnits })
    },
    setQuantity(e, prop, index) {
      let stepsAndUnits = this.tasksData.stepsAndUnits
      if (this.isDisabledPayablesEdit) {
        stepsAndUnits[index]['receivables'].quantity = e.target.value
        stepsAndUnits[index]['payables'].quantity = e.target.value
      } else {
        stepsAndUnits[index][prop].quantity = e.target.value
      }
      this.setDataValue({ prop: 'stepsAndUnits', value: stepsAndUnits })
    },
    setUnit({ option }, prop, index) {
      let stepsAndUnits = this.tasksData.stepsAndUnits
      const unit = this.allUnits.find(({ type }) => type === option)

      if (this.tasksData.service.title === 'Translation') {
        for (let i = 0; i < stepsAndUnits.length; i++) {
          for (const prop of [ 'receivables', 'payables' ]) stepsAndUnits[i][prop].unit = unit
        }
      } else {
        if (this.isDisabledPayablesEdit) {
          stepsAndUnits[index]['receivables'].unit = unit
          stepsAndUnits[index]['payables'].unit = unit
        }
        stepsAndUnits[index][prop].unit = unit
        this.setDataValue({ prop: 'stepsAndUnits', value: stepsAndUnits })
      }
    },
    dragAndDropSteps(stepsAndUnits) {
      this.setDataValue({ prop: 'stepsAndUnits', value: stepsAndUnits })
    },
    deleteStep(index) {
      const stepsAndUnits = [ ...this.tasksData.stepsAndUnits ]
      stepsAndUnits.splice(index, 1)
      this.setDataValue({ prop: 'stepsAndUnits', value: stepsAndUnits })
    }
  },
  computed: {
    ...mapGetters({
      tasksData: "getTasksData",
      allUnits: "getAllUnits"
    }),
    isCatUnit() {
      if (this.tasksData && this.tasksData.service) {
        return this.tasksData.stepsAndUnits[0].receivables.unit.type === 'CAT Wordcount'
      }
    }
  },
  name: "NewServicesCreationStepsWorkflow"
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors";

.steps {

}

.add {
  &__row {
    display: flex;
    justify-content: space-between;
  }

  &__options {
    display: flex;
    gap: 7px;
    align-items: center;
  }
}

.step {
  margin: 20px 0;
  background: #f7f7f759;
  border: 1px solid $light-border;
  border-radius: 4px;
  padding: 10px 20px;

  &__icons {
    width: 100%;
    display: flex;
    gap: 14px;

  }

  &__icon {
    color: $dark-border;
    transition: .2s ease-out;
    font-size: 14px;
    height: 30px;
    width: 30px;
    background: white;
    border: 1px solid #bfbfbf;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;

    &:hover {
      color: $text;
    }
  }

  &__titleRow {
    display: flex;
    margin-bottom: 12px;
    border-bottom: 1px solid $dark-border;
    padding-bottom: 8px;
    padding-top: 2px;
    justify-content: space-between;
    height: 17px;
    align-items: center;

    &-title {
      width: 201px;
      font-size: 14px;
    }

    &-desctiptions {
      display: flex;

      &-title {
        width: 200px;
        margin-left: 15px;
        padding-left: 15px;
      }
    }

    &-title {
      font-size: 14px;
      font-family: Myriad900;
    }
  }

  &__setting,
  &__datepicker {
    height: 56px;
    width: 200px;
    position: relative;
    margin-left: 15px;
    padding-left: 15px;
    border-left: 1px solid $light-border;

    &-title {
      margin-bottom: 2px;
    }
  }

  &__detailsRow {
    display: flex;
    justify-content: end;
  }
}

.drop {
  background: white;
  border-radius: 4px;
  width: 200px;
  height: 32px;
  position: relative;
}

input {
  font-size: 14px;
  color: $text;
  border: 1px solid $border;
  border-radius: 4px;
  box-sizing: border-box;
  padding: 0 7px;
  outline: none;
  width: 200px;
  height: 32px;
  transition: .1s ease-out;

  &:focus {
    border: 1px solid $border-focus;
  }
}

.draggable__element-icon {
  font-size: 16px;
  color: $dark-border;
  cursor: grab;
}

.calendar {
  position: absolute;
  top: 24px;
  opacity: .3;
  right: 8px;
  font-size: 16px;
}

.sortable-ghost {
}

.sortable-chosen {
  background: $light-border;
}

</style>