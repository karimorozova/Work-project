<template lang="pug">
  .wrapper
    .steps(v-if="tasksData.service && tasksData.stepsAndUnits")
      .steps__modal-without-border(v-if="isDeleteStep")
        ApproveModal(
          text="Are you sure?"
          approveValue="Yes"
          notApproveValue="Cancel"
          @approve="deleteStep"
          @close="closeAcceptModal"
          @notApprove="closeAcceptModal"
        )
      .steps__modal(v-if="isAddModal")
        .modal-title Add steps to workflow
        .step__setting-title Steps:
        .drop(style="width: 220px;")
          SelectSingle(
            :selectedOption="newStep"
            :options="possibleStepsForAdding"
            placeholder="Option"
            @chooseOption="setNewStep"
          )
        .buttons
          .buttons__btn
            Button(@clicked="addStep" value="Add" )
          .buttons__btn
            Button(@clicked="closeAddStepModal" value="Cancel" :outline="true")

      draggable( :value="tasksData.stepsAndUnits" @input="dragAndDropSteps" handle=".handle")
        .step(v-for="(item, index) in tasksData.stepsAndUnits" )

          .step__titleRow
            .step__titleRow-title {{ item.step.title }}
            .step__titleRow-desctiptions(v-if="isCatUnit || isDisabledPayablesEdit" )
              .step__titleRow-desctiptions-title-date Dates
              .step__titleRow-desctiptions-title(v-if="!isCatUnit || item.step.title !== 'Revising'") Receivables & Payables
            .step__titleRow-desctiptions(v-else)
              .step__titleRow-desctiptions-title-date Dates
              .step__titleRow-desctiptions-title Receivables
              .step__titleRow-desctiptions-title Payables

          .step__detailsRow

            //.step__icons(v-if="tasksData.service && tasksData.service.title !== 'Translation'")
            .step__icons
              .step__icon(@click="openDeleteAcceptModal(index)" style="cursor: pointer;")
                i.fas.fa-trash
              .step__icon.handle(style="cursor: grab")
                i.fas.fa-arrows-alt-v


            .step__date
              .step__datepicker
                .step__datepicker-title Start And Deadline:
                .step__datepicker-input
                  DatePicker.range-with-one-panel(
                    :value="[item.start, item.deadline]"
                    @input="(e) => setDates(e, index)"
                    format="DD-MM-YYYY, HH:mm"
                    prefix-class="xmx"
                    range-separator=" - "
                    :clearable="false"
                    type="datetime"
                    range
                    :disabled-date="notBeforeToday"
                    placeholder="Select datetime range"
                  )

            // CAT ==>
            .step__settings(v-if=" item.step.title === 'Translation' && item.receivables.unit.type === 'CAT Wordcount'" )
              .step__setting
                .step__setting-title Unit:
                .drop
                  SelectSingle(
                    :selectedOption="item.receivables.unit.type || ''"
                    :options="item.step.calculationUnit.map(i => i.type)"
                    placeholder="Option"
                    @chooseOption="(e) => setUnit(e, 'receivables', index)"
                  )
              .step__setting
                .step__setting-title Memoq:
                .drop(v-if="templates.length")
                  SelectSingle(
                    :hasSearch="true"
                    :selectedOption="tasksData.template ? tasksData.template.name : ''"
                    :options="templates.map(i => i.name)"
                    placeholder="Option"
                    @chooseOption="setTemplate"
                  )
            // CAT <==

            // CUSTOM ==>
            .step__settings(v-if="!isCatUnit")
              .step__setting
                .step__setting-title Unit:
                .drop
                  SelectSingle(
                    :selectedOption="item.receivables.unit.type || ''"
                    :options="item.step.calculationUnit.map(i => i.type).filter(i => i !== 'CAT Wordcount')"
                    placeholder="Option"
                    @chooseOption="(e) => setUnit(e, 'receivables', index)"
                  )
              .step__setting
                .step__setting-title Quantity:
                input(type="number" placeholder="Value" min="0" max="100000" :value="item.receivables.quantity || ''" @change="(e) => setQuantity(e, 'receivables', index)")

            .step__settings(v-if="!isCatUnit && !isDisabledPayablesEdit")
              .step__setting
                .step__setting-title Unit:
                .drop
                  SelectSingle(
                    :selectedOption="item.payables.unit.type || ''"
                    :options="item.step.calculationUnit.map(i => i.type).filter(i => i !== 'CAT Wordcount')"
                    placeholder="Option"
                    @chooseOption="(e) => setUnit(e, 'payables', index)"
                    :isDisabled="isDisabledPayablesEdit"
                  )
              .step__setting
                .step__setting-title Quantity:
                input(type="number" :disabled="isDisabledPayablesEdit" placeholder="Value" min="0" max="100000" :value="item.payables.quantity || ''" @change="(e) => setQuantity(e, 'payables', index)")
            // CUSTOM <==


    .add
      .add__row
        .add__add(v-if="tasksData.service.steps.map(i => i.step).length !== tasksData.stepsAndUnits.length")
          Add(@add="openAddStepModal")
        .add__add(v-else)
        .add__options
          CheckBox(:isChecked="isDisabledPayablesEdit" @check="toggleBox" @uncheck="toggleBox")
          span Same payable options

</template>

<script>
import { mapActions, mapGetters } from "vuex"
import DatepickerWithTime from "../../DatepickerWithTime"


import DatePicker from 'vue2-datepicker'
import '../../../assets/scss/datepicker.scss'
import moment from "moment"
import SelectSingle from "../../SelectSingle"
import draggable from "vuedraggable"
import JobDescriptors from "../JobDescriptors"
import Add from "../../Add"
import CheckBox from "../../CheckBox"
import Button from "../../Button"
import ApproveModal from "../../ApproveModal"

export default {
  components: { Button, CheckBox, Add, JobDescriptors, SelectSingle, DatepickerWithTime, draggable, DatePicker, ApproveModal },
  props: {
    templates: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      time: {},
      isDisabledPayablesEdit: true,
      isAddModal: false,
      isDeleteStep: false,
      deleteStepIndex: '',
      highlighted: {
        days: [ 6, 0 ]
      },
      disabled: {
        to: moment().add(-1, 'day').endOf('day').toDate()
      },
      newStep: ''
    }
  },
  methods: {
    notBeforeToday(date) {
      return date < new Date(this.project.startDate) || new Date(this.project.deadline) < date
    },
    addStep() {
      const step = this.tasksData.service.steps.find(item => item.step.title === this.newStep).step
      let stepsAndUnits = this.tasksData.stepsAndUnits
      stepsAndUnits.push({
        step,
        start: '',
        deadline: '',
        receivables: { unit: step.calculationUnit[0], quantity: 0 },
        payables: { unit: step.calculationUnit[0], quantity: 0 }
      })
      this.closeAddStepModal()
    },
    setNewStep({ option }) {
      this.newStep = option
    },
    openAddStepModal() {
      this.isAddModal = true
    },
    closeAddStepModal() {
      this.isAddModal = false
      this.newStep = ''
    },
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

    setDates(e, index) {
      this.setDate(e[0], 'start', index)
      this.setDate(e[1], 'deadline', index)
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
    openDeleteAcceptModal(id) {
      this.isDeleteStep = true
      this.deleteStepIndex = id
    },
    closeAcceptModal() {
      this.isDeleteStep = false
      this.deleteStepIndex = ''
    },
    deleteStep() {
      const stepsAndUnits = [ ...this.tasksData.stepsAndUnits ]
      stepsAndUnits.splice(this.deleteStepIndex, 1)
      this.setDataValue({ prop: 'stepsAndUnits', value: stepsAndUnits })
      this.closeAcceptModal()
    },
    ...mapActions({ alertToggle: 'alertToggle', setDataValue: "setTasksDataValue" })
  },
  computed: {
    ...mapGetters({
      tasksData: "getTasksData",
      allUnits: "getAllUnits",
      project: "getCurrentProject"
    }),
    isCatUnit() {
      if (this.tasksData && this.tasksData.service && this.tasksData.stepsAndUnits.length) {
        return this.tasksData.stepsAndUnits[0].receivables.unit.type === 'CAT Wordcount'
      }
    },
    possibleStepsForAdding() {
      if (this.tasksData.service) {
        return this.tasksData.service.steps.map(i => i.step.title).filter(j => !this.tasksData.stepsAndUnits.map(i => i.step.title).includes(j))
      }
      return []
    }
  },
  name: "NewServicesCreationStepsWorkflow"
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors";

.steps {
  position: relative;

  &__modal {
    z-index: 12;
    width: fit-content;
    background: white;
    box-shadow: $box-shadow;
    padding: 25px;
    border-radius: 4px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
  }

  &__modal-without-border {
    z-index: 12;
    width: fit-content;
    background: white;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
  }
}

.buttons {
  display: flex;
  gap: 20px;
  margin-top: 12px;
}

.modal-title {
  margin-bottom: 15px;
  font-size: 18px;
  font-family: Myriad600;
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
        width: 210px;
        margin-left: 15px;
        padding-left: 15px;
      }

      &-title-date {
        width: 260px;
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
    width: 210px;
    position: relative;
    margin-left: 15px;
    padding-left: 15px;
    border-left: 1px solid $light-border;

    &-title {
      margin-bottom: 2px;
    }
  }

  &__datepicker {
    width: 260px;
  }

  &__detailsRow {
    display: flex;
    justify-content: end;
  }
}

.drop {
  background: white;
  border-radius: 4px;
  width: 210px;
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
  width: 210px;
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
  top: 25px;
  opacity: .2;
  right: 8px;
  font-size: 16px;
}

.sortable-ghost {
}

.range-with-one-panel {
  width: 260px;
}

.sortable-chosen {
  background: $light-border;
}

</style>