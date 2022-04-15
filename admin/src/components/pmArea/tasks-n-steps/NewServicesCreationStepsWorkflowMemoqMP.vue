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
        .steps__modal-body
          .step__setting-title Steps:
          .drop(style="width: 220px;")
            SelectSingle(
              :hasSearch="true"
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

      .workflow

        .steps__modal-body(style="margin-top: 20px;")
          .step__setting-title Template:
          .drop(v-if="templates.length")
            SelectSingle(
              :hasSearch="true"
              :selectedOption="tasksData.template ? tasksData.template.name : ''"
              :options="templates.map(i => i.name)"
              placeholder="Option"
              @chooseOption="setTemplate"
            )

        .step(v-for="(item, index) in tasksData.stepsAndUnits" )
          .step__titleRow
            .step__titleRow-title
                span {{ item.step.title }}
                b(v-if="!item.isReceivableVisible" style="margin-left: 4px") [Hidden]
            .step__titleRow-desctiptions
              .step__titleRow-desctiptions-title-date Dates
              .step__titleRow-desctiptions-title Receivables & Payables

          .step__detailsRow
            .step__icons(v-if="item.step.title !== 'Translation' && item.step.title !== 'Post-Editing'")
              .step__icon(@click="openDeleteAcceptModal(index)" style="cursor: pointer;")
                i.fas.fa-trash

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

            .step__settings
              .step__setting
                .step__setting-title Unit:
                .drop
                  SelectSingle(
                    :isDisabled="true"
                    :selectedOption="item.receivables.unit.type || ''"
                    :options="item.step.calculationUnit.map(i => i.type)"
                    placeholder="Option"
                    @chooseOption="(e) => setUnit(e, 'receivables', index)"
                  )

    .add
      .add__row
        .add__add(v-if="tasksData.service.steps.map(i => i.step).length !== tasksData.stepsAndUnits.length")
          Add(@add="openAddStepModal")
        .add__add(v-else)

</template>

<script>
import { mapActions, mapGetters } from "vuex"
import DatePicker from 'vue2-datepicker'
import '../../../assets/scss/datepicker.scss'
import moment from "moment"
import SelectSingle from "../../SelectSingle"
import draggable from "vuedraggable"
import Add from "../../Add"
import CheckBox from "../../CheckBox"
import Button from "../../Button"
import ApproveModal from "../../ApproveModal"

export default {
  name: "NewServicesCreationStepsWorkflowMemoqMT",
  components: { Button, CheckBox, Add, SelectSingle, draggable, DatePicker, ApproveModal },
  data() {
    return {
      templates: [],
      isAddModal: false,
      isDeleteStep: false,
      deleteStepIndex: '',
      newStep: ''
    }
  },
  methods: {
    notBeforeToday(date) {
      const start = new Date(this.project.startDate)
      start.setDate(start.getDate() - 1)
      return date < start || new Date(this.project.deadline) <= date
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
    async getMemoqTemplates() {
      try {
        const result = await this.$http.get("/memoqapi/templates")
        this.templates = result.data
      } catch (err) {
        this.templates = [ { name: 'No Templates' } ]
      }
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
    hideReceivableDefaultSteps() {
      let { stepsAndUnits } = this.tasksData
      stepsAndUnits.forEach((item, index) => {
        if (item.step.title === 'Post-Editing') stepsAndUnits[index].isReceivableVisible = false
      })
    },
    ...mapActions({ alertToggle: 'alertToggle', setDataValue: "setTasksDataValue" })
  },
  computed: {
    ...mapGetters({
      tasksData: "getTasksData",
      allUnits: "getAllUnits",
      project: "getCurrentProject",
      allSteps: "getAllSteps"
    }),
    possibleStepsForAdding() {
      if (this.tasksData.service && this.allSteps.length) {
        return this.tasksData.service.steps.map(i => i.step.title).filter(j => !this.tasksData.stepsAndUnits.map(i => i.step.title).includes(j))
      }
      return []
    }
  },
  async created() {
    this.hideReceivableDefaultSteps()
    await this.getMemoqTemplates()
  }
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
    border-radius: 2px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translateX(-50%) translateY(-49%);

    &-body {
      display: flex;
      gap: 15px;
      align-items: center;
    }
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
  background: $light-background;
  border: 1px solid $light-border;
  border-radius: 2px;
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
    border: 1px solid $border;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 2px;
    box-sizing: border-box;

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
        width: 220px;
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
      font-family: Myriad600;
    }
  }

  &__setting,
  &__datepicker {
    height: 56px;
    width: 220px;
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
  border-radius: 2px;
  width: 220px;
  height: 32px;
  position: relative;
}

input {
  font-size: 14px;
  color: $text;
  border: 1px solid $border;
  border-radius: 2px;
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