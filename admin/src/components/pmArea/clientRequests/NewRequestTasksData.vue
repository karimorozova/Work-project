<template lang="pug">
  .taskData
    .taskData__errorModal
      ValidationErrors(v-if="IsErrorModal" :errors="errors" :isAbsolute="true" @closeErrors="closeErrors")

    .taskData__row-servicesLanguages
      .service
        .drop__title Service:
        .drop
          SelectSingle(
            :selectedOption="currentProject.requestForm.service.title"
            :options="['mappedClientServices']"
            placeholder="Option"
            @chooseOption=""
            :isDisabled="true"
          )

      .language
        NewTasksLangsDuoRequest

    .taskData__row(v-if="currentProject.requestForm.service")
      .tabs-workflow
        .tabs-workflow__title Workflow process:
        .tabs-workflow__tabs
          Tabs(
            :tabs="tabsWorkflow"
            :selectedTab="selectedTabWorkflow"
            @setTab="setTabWorkflow"
          )
      NewRequestCreationStepsWorkflowClassic(v-if="selectedTabWorkflow === 'Alpha'")
      NewRequestServicesCreationStepsWorkflowMemoq(v-if="selectedTabWorkflow === 'Memoq'")
      NewRequestServicesCreationStepsWorkflowMemoqMT(v-if="selectedTabWorkflow === 'Memoq MT'")

    .taskData__filesOptions
      .taskData__files
        RequestTasksFiles(
          :tasksData="tasksData"
          :currentProject="currentProject"
          :currentTaskIdForUpdate="currentTaskIdForUpdate"
        )

    .taskData__button
      Button(:value="currentTaskIdForUpdate ? `Update Tasks & Steps` : `Add Tasks & Steps`" @clicked="saveTasksChecks")

</template>

<script>
import ValidationErrors from "../../ValidationErrors"
import { mapActions, mapGetters } from "vuex"
import SelectSingle from "../../SelectSingle"
import TasksLangsDuo from "../tasks-n-steps/TasksLangsDuo"
import NewTasksLangsDuoRequest from "./NewTasksLangsDuoRequest"
import RequestTasksFiles from "./tasks-n-steps/RequestTasksFiles"
import Button from "../../Button"
import { clearTasksDataRequest } from "../../../vuex/clientsRequests/actions"
import Tabs from "../../Tabs"
import NewRequestCreationStepsWorkflowClassic from './NewRequestCreationStepsWorkflowClassic'
import NewRequestServicesCreationStepsWorkflowMemoq from "./NewRequestServicesCreationStepsWorkflowMemoq"
import NewRequestServicesCreationStepsWorkflowMemoqMT from "./NewRequestServicesCreationStepsWorkflowMemoqMP"

export default {
  props: {
    currentTaskIdForUpdate: {
      type: String
    },
    allLanguages: {
      type: Array
    },
    allSteps: {
      type: Array
    },
    currentProject: {
      type: Object
    }
  },
  data() {
    return {
      allServices: [],
      templates: [],
      isAdditions: false,
      IsErrorModal: false,
      selectedTabWorkflow: 'Alpha',
      errors: []
    }
  },
  methods: {
    setTabWorkflow({ index }) {
      this.selectedTabWorkflow = this.tabsWorkflow[index]
      this.setDataValue({ prop: "template", value: {} })
      this.setStepsAndUnitByService()
    },
    saveTasksChecks() {
      this.errors = []
      if (!this.tasksData.targets || !this.tasksData.targets.length) this.errors.push("Please, select Target language(s).")
      if (!this.currentTaskIdForUpdate && this.tasksData.stepsAndUnits.some(item => item.step.title === "Translation")) {
        if ((!this.tasksData.sourceFiles || !this.tasksData.sourceFiles.length) && (!this.tasksData.sourceFilesVault || !this.tasksData.sourceFilesVault.length)) {
          this.errors.push("Please, upload Source file(s).")
        }
        if (this.tasksData.targets && this.tasksData.targets.map(i => i.lang).includes(this.currentProject.requestForm.sourceLanguage.lang)) {
          this.errors.push('Target and Source Languages cannot be a same if a step "Translation" is selected')
        }
      }
      if (!this.tasksData.stepsAndUnits.length) {
        this.errors.push("Please, select minimum one Step")
      } else {
        if (this.isStepsWithCATWordcount && !this.isStepsTemplateSet) {
          this.errors.push("Please, select Memoq field")
        }
        if (!this.isStepsWithCATWordcount && !this.isStepsQuantitySet) {
          this.errors.push("Please, write correct quantity")
        }
      }
      for (const stepAndUnit of this.tasksData.stepsAndUnits) {
        if (!stepAndUnit.start && stepAndUnit.start === '' || !stepAndUnit.deadline && stepAndUnit.deadline === '') {
          this.errors.push(`Please, check dates for ${ stepAndUnit.step.title }`)
        }
      }
      if ((this.tasksData.refFiles && this.tasksData.refFiles.length) && (this.tasksData.sourceFiles && this.tasksData.sourceFiles.length)) {
        if (
            new Set([ ...this.tasksData.sourceFiles, ...this.tasksData.refFiles ]
                .map(({ name }) => name)).size !== [ ...this.tasksData.sourceFiles, ...this.tasksData.refFiles ]
                .length
        ) this.errors.push("Reference file cannot be the same as Source.")
      }
      if (this.errors.length) {
        this.IsErrorModal = true
        return
      }
      this.addTasks()
    },
    async addTasks() {
      let tasksData = new FormData()

      if (this.tasksData.template) {
        tasksData.append('template', JSON.stringify(this.tasksData.template))
      }
      tasksData.append('stepsAndUnits', JSON.stringify(this.tasksData.stepsAndUnits))
      tasksData.append('targets', JSON.stringify(this.tasksData.targets))
      tasksData.append('requestId', this.currentProject._id)

      if (this.tasksData.refFilesVault) tasksData.append('refFilesVault', JSON.stringify(this.tasksData.refFilesVault))
      if (this.tasksData.sourceFilesVault) tasksData.append('sourceFilesVault', JSON.stringify(this.tasksData.sourceFilesVault))

      if (this.tasksData.sourceFiles && this.tasksData.sourceFiles.length) {
        for (let file of this.tasksData.sourceFiles) tasksData.append('sourceFiles', file)
      }
      if (this.tasksData.refFiles && this.tasksData.refFiles.length) {
        for (let file of this.tasksData.refFiles) tasksData.append('refFiles', file)
      }
      await this.saveProjectTasks(tasksData)
    },
    async saveProjectTasks(tasksData) {
      try {
        !!this.currentTaskIdForUpdate && tasksData.append('taskIdForUpdate', this.currentTaskIdForUpdate)

        const updatedProject = !!this.currentTaskIdForUpdate ?
            await this.$http.post('/pm-manage/update-request-tasks', tasksData) :
            await this.$http.post('/pm-manage/request-tasks', tasksData)

        await this.setCurrentClientRequest(updatedProject.data)
        this.$parent.setDefault()
        this.clearTasksDataRequest()
        !!this.currentTaskIdForUpdate && this.alertToggle({ message: 'Task updated!', isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: 'Error on creating/updating task', isShow: true, type: "error" })
      }
    },
    closeErrors() {
      this.errors = []
      this.IsErrorModal = false
    },
    async buildAutoData() {
      this.selectedTabWorkflow = 'Alpha'

      if (this.currentTaskIdForUpdate) {
        const { tasksAndSteps } = this.currentProject
        const { taskData } = tasksAndSteps.find(item => item.taskId === this.currentTaskIdForUpdate)

        if (taskData.stepsAndUnits[0].payables.unit.type === 'CAT Wordcount') {
          const step = taskData.stepsAndUnits[0].step.title
          if (step === 'Translation') this.selectedTabWorkflow = 'Memoq'
          if (step === 'Post-Editing') this.selectedTabWorkflow = 'Memoq MT'
          this.setDataValue({ prop: "template", value: taskData.template })
        }

        this.setDataValue({ prop: "targets", value: taskData.targets })
        this.setDataValue({ prop: "stepsAndUnits", value: taskData.stepsAndUnits })
        return
      }

      this.setStepsAndUnitByService()
    },
    setStepsAndUnitByService() {
      const stepsAndUnits = []
      const { service } = this.currentProject.requestForm
      let steps = service.steps.map(item => ({ step: this.allSteps.find(({ _id }) => _id.toString() === item.step.toString()) }))

      if (this.selectedTabWorkflow === 'Alpha' || service.title !== 'Translation') {
        for (let { step } of steps) {
          let units = []
          units = step.calculationUnit.filter(({ type }) => type !== 'CAT Wordcount')
          collectWorkFlow(step, units)
        }
      }
      if (this.selectedTabWorkflow === 'Memoq') {
        for (let { step } of steps) {
          if (step.title !== 'Translation' && step.title !== 'Revising') continue
          let units = []
          units = step.calculationUnit.filter(({ type }) => type === 'CAT Wordcount')
          collectWorkFlow(step, units)
        }
      }
      if (this.selectedTabWorkflow === 'Memoq MT') {
        steps = steps.reduce((acc, curr) => {
          curr.step.title === 'Translation'
              ? acc[1] = curr
              : curr.step.title === 'Revising'
                  ? acc[2] = curr
                  : acc[0] = curr
          return acc
        }, [])
        for (let { step } of steps) {
          let units = []
          units = step.calculationUnit.filter(({ type }) => type === 'CAT Wordcount')
          collectWorkFlow(step, units)
        }
      }

      function collectWorkFlow(step, units) {
        stepsAndUnits.push({
          step,
          start: '',
          deadline: '',
          isReceivableVisible: true,
          receivables: {
            unit: units[0],
            quantity: 0
          },
          payables: {
            unit: units[0],
            quantity: 0
          }
        })
      }

      this.setDataValue({ prop: "stepsAndUnits", value: stepsAndUnits })
    },
    ...mapActions({
      clearTasksDataRequest: "clearTasksDataRequest",
      alertToggle: 'alertToggle',
      setDataValue: "setTasksDataValueRequest",
      setCurrentClientRequest: "setCurrentClientRequest"
    })
  },
  computed: {
    ...mapGetters({
      tasksData: "getTasksDataRequest"
    }),
    tabsWorkflow() {
      return [ 'Alpha', 'Memoq', 'Memoq MT' ].filter(i => this.currentProject.requestForm.service.title === 'Translation' ? i : i !== 'Memoq' && i !== 'Memoq MT')
    },
    isStepsWithCATWordcount() {
      return this.tasksData.stepsAndUnits && this.tasksData.stepsAndUnits.every(({ receivables }) => receivables.unit.type === "CAT Wordcount")
    },
    isStepsQuantitySet() {
      return this.tasksData.stepsAndUnits && this.tasksData.stepsAndUnits.every(({ payables, receivables }) => +payables.quantity > 0 && +receivables.quantity > 0)
    },
    isStepsTemplateSet() {
      return this.tasksData.template && this.tasksData.template.hasOwnProperty('name')
    }
  },
  async created() {
    await this.buildAutoData()
  },
  destroyed() {
    this.clearTasksDataRequest()
  },
  components: {
    NewRequestServicesCreationStepsWorkflowMemoqMT,
    NewRequestServicesCreationStepsWorkflowMemoq,
    NewRequestCreationStepsWorkflowClassic,
    Tabs,
    Button,
    RequestTasksFiles,
    NewTasksLangsDuoRequest,
    TasksLangsDuo,
    ValidationErrors,
    SelectSingle
  }
}

</script>

<style scoped lang="scss">
@import "../../../assets/scss/colors";

.container {
  position: relative;
}

.taskData {
  position: relative;
  border: 1px solid $light-border;
  padding: 25px;
  margin-bottom: 30px;

  &__xtm {
    display: flex;
    gap: 20px;
    align-items: center;
    justify-content: center;

    &-fileWrapper {
      height: 30px;
      padding: 0 7px;
      display: flex;
      border: 1px solid $border;
      align-items: center;
      gap: 5px;
      border-radius: 2px;
    }

    &-fileName {
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      max-width: 260px;
      opacity: 0.5;
    }

    &-removeFile {
      font-size: 22px;
      cursor: pointer;
      height: 22px;
      width: 22px;
      justify-content: center;
      display: flex;
      align-items: center;
      font-family: Myriad900;
      opacity: 0.8;
      transition: ease 0.2s;

      &:hover {
        opacity: 1
      }
    }
  }

  &__memoqLink {
    display: flex;
    gap: 25px;
  }

  &__button {
    margin-top: 25px;
    display: flex;
    justify-content: center;
  }

  &__files {
    margin-top: 30px;
  }

  &__row {
    &-servicesLanguages {
      display: flex;
      justify-content: space-between;
    }
  }
}

.service {
  width: 410px;
}

.extraServices {
  display: flex;
  gap: 12px;
  margin: 20px 0;
}

.drop {
  width: 220px;
  position: relative;
  height: 32px;

  &__input {
    input {
      font-size: 14px;
      color: $text;
      border: 1px solid $border;
      border-radius: 2px;
      box-sizing: border-box;
      padding: 0 7px;
      outline: none;
      height: 32px;
      width: 690px;
      font-family: 'Myriad400';
      transition: .1s ease-out;

      &:focus {
        border: 1px solid $border-focus;
      }
    }
  }

  &__title {
    margin-bottom: 3px;
    position: relative;
  }
}

.tabs-workflow {
  margin-top: 20px;
  display: flex;
  gap: 25px;
  align-items: baseline;
  border-bottom: 1px solid $light-border;

  &__title {
  }
}
</style>