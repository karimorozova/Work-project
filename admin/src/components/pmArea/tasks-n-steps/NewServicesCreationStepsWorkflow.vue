<template lang="pug">
  .steps(v-if="tasksData.stepsAndUnits && tasksData.stepsAndUnits.length")
    draggable( :value="tasksData.stepsAndUnits" @input="dragAndDropSteps" handle=".handle")
      .step(v-for="(item, index) in tasksData.stepsAndUnits" )

        .step__titleRow
          .step__titleRow-title {{ item.step.title }}

        .step__detailsRow
          .steps__setting(v-if=" item.step.title === 'Translation' && item.receivables.unit.type === 'CAT Wordcount'" )
            .steps__setting-title Unit:
              .drop
                SelectSingle(
                  :selectedOption="item.receivables.unit.type || ''"
                  :options="item.step.calculationUnit.map(i => i.type)"
                  placeholder="Select"
                  @chooseOption="(e) => setUnit(e, 'receivables', index)"
                )
            .steps__setting-title Memoq:
              .drop(v-if="templates.length")
                SelectSingle(
                  :hasSearch="true"
                  :selectedOption="tasksData.template ? tasksData.template.name : ''"
                  :options="templates.map(i => i.name)"
                  placeholder="Select"
                  @chooseOption="setTemplate"
                )

          .steps__setting(v-if="tasksData.stepsAndUnits[0].receivables.unit.type !== 'CAT Wordcount'")
            .steps__setting-title Unit:
            .drop
              SelectSingle(
                :selectedOption="item.receivables.unit.type || ''"
                :options="item.step.calculationUnit.map(i => i.type)"
                placeholder="Select"
                @chooseOption="(e) => setUnit(e, 'receivables', index)"
              )
            .steps__setting-title Quantity:
              input(type="number" placeholder="Value" min="1" max="100000" :value="item.receivables.quantity || ''" @change="(e) => setQuantity(e, 'receivables', index)")

          .steps__setting(v-if="tasksData.stepsAndUnits[0].receivables.unit.type !== 'CAT Wordcount'")
            .steps__setting-title Unit:
            .drop
              SelectSingle(
                :selectedOption="item.payables.unit.type || ''"
                :options="item.step.calculationUnit.map(i => i.type)"
                placeholder="Select"
                @chooseOption="(e) => setUnit(e, 'payables', index)"
              )
            .steps__setting-title Quantity:
              input(type="number" placeholder="Value" min="1" max="100000" :value="item.payables.quantity || ''" @change="(e) => setQuantity(e, 'payables', index)")

          .steps__date
            .steps__datepicker
              .steps__datepicker-title Start:
              .steps__datepicker-input
                DatepickerWithTime(
                  :isReadonly="true"
                  :value="item.start"
                  :format="customFormatter"
                  monday-first=true
                  :highlighted="highlighted"
                  inputClass="datepicker-custom"
                  inputClass2="datepicker-custom-mod"
                  calendarClass="calendar-custom"
                  :placeholder="'Date'"
                  @selected="(e) => setDate(e, 'start', index)"
                )
                i.far.fa-calendar-alt.calendar

            .steps__datepicker
              .steps__datepicker-title Deadline:
              .steps__datepicker-input
                DatepickerWithTime(
                  :isReadonly="true"
                  :value="item.deadline"
                  :format="customFormatter"
                  monday-first=true
                  :highlighted="highlighted"
                  inputClass="datepicker-custom"
                  inputClass2="datepicker-custom-mod"
                  calendarClass="calendar-custom"
                  :placeholder="'Date'"
                  @selected="(e) => setDate(e, 'deadline', index)"
                )
                i.far.fa-calendar-alt.calendar

        .steps__icons(v-if="tasksData.service && tasksData.service.title !== 'Translation'")
          .step__element-icon(@click="deleteStep(index)")
            i.fas.fa-trash
          .draggable__element-icon
            i.fas.fa-arrows-alt-v.handle
</template>

<script>
import { mapActions, mapGetters } from "vuex"
import DatepickerWithTime from "../../DatepickerWithTime"
import moment from "moment"
import SelectSingle from "../../SelectSingle"
import draggable from "vuedraggable"

export default {
  components: { SelectSingle, DatepickerWithTime, draggable },
  props: {
    templates: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
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
      stepsAndUnits[index][prop].quantity = e.target.value
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
    })
  },
  name: "NewServicesCreationStepsWorkflow"
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors";

.steps {
  padding: 25px;
  background: aliceblue;
  
  &__datepicker {
    position: relative;
    height: 55px;
  }

  &__settings {
    display: flex;
  }

  &__setting {

    &-title {

    }
  }
}

.step {
  &__titleRow {
    display: flex;
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid firebrick;

    &-title {
      font-size: 16px;
      font-family: Myriad600;
    }
  }

  background: lightsteelblue;
  padding: 25px;
  border-radius: 4px;
  margin: 20px 0;

  &__detailsRow {
    display: flex;
  }
}

.drop {
  background: white;
  border-radius: 4px;
  width: 220px;
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
  width: 220px;
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
</style>