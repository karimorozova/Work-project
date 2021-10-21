<template lang="pug">
  .steps(v-if="tasksData.stepsAndUnits.length")

    .step(v-for="(item, index) in tasksData.stepsAndUnits" )
      h4 Step {{ index + 1 }}
      h4 {{ item.step.title }}

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
            i.far.fa-calendar-alt

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
            i.far.fa-calendar-alt

      .steps__settings(v-if="index === 0 && item.step.title === 'Translation' && item.receivables.unit.type === 'CAT Wordcount'" )
        .steps__setting
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

      .steps__settings(v-if="tasksData.stepsAndUnits[0].receivables.unit.type !== 'CAT Wordcount'")
        .steps__setting
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

        .steps__setting
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


</template>

<script>
import { mapActions, mapGetters } from "vuex"
import DatepickerWithTime from "../../DatepickerWithTime"
import moment from "moment"
import SelectSingle from "../../SelectSingle"

export default {
  components: { SelectSingle, DatepickerWithTime },
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
      stepsAndUnits[index][prop].unit = this.allUnits.find(({ type }) => type === option)
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

.step {
  margin: 20px;
  padding: 20px;
  background: lightsteelblue;
  display: flex;
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
  width: 100%;
  height: 32px;
  transition: .1s ease-out;

  &:focus {
    border: 1px solid $border-focus;
  }
}
</style>