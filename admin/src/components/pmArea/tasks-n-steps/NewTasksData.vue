<template lang="pug">
  .taskData
    .taskData__errorModal
      ValidationErrors(v-if="IsErrorModal" :errors="errors" @closeErrors="closeErrors")

    .taskData__row
      div Service:
      .drop
        SelectSingle(
          :selectedOption="tasksData.service ? tasksData.service.title : ''"
          :options="mappedClientServices"
          placeholder="Option"
          @chooseOption="setService"
        )

    .taskData__row
      div Extra Services:
      Toggler(:isDisabled="false" :isActive="isAdditions" @toggle="toggleAdditions()")

    .taskData__row(v-if="isAdditions")
      StepsAdditions(
        :stepsAdditions="tasksData.stepsAdditions ? tasksData.stepsAdditions : []"
        @save="setAdditions"
        @delete="setAdditions"
      )

    .taskData__row
      div Languages:
      .languages
        TasksLangsDuo

    .taskData__row
      NewServicesCreationStepsWorkflow

    .taskData__row
      TasksFiles

    .taskData__row
      Button(:value="'Add Tasks'" @clicked="saveTasksChecks")

</template>

<script>
import { mapActions, mapGetters } from "vuex"
import SelectSingle from "../../SelectSingle"
import TasksLangsDuo from "./TasksLangsDuo"
import NewServicesCreationStepsWorkflow from "./NewServicesCreationStepsWorkflow"
import TasksFiles from "./TasksFiles"
import Toggler from "../../Toggler"
import StepsAdditions from "./stepsAdditions"
import Button from "../../Button"
import ValidationErrors from "../../ValidationErrors"

export default {
  name: "NewTasksData",
  props: {
    allServices: {
      type: Array
    },
    allLanguages: {
      type: Array
    },
    currentProject: {
      type: Object
    }
  },
  data() {
    return {
      isAdditions: false,
      IsErrorModal: false,
      errors: []
    }
  },
  methods: {
    saveTasksChecks() {
      this.errors = []
      if (!this.tasksData.targets || !this.tasksData.targets.length) this.errors.push("Please, select Target language(s).")
      if (this.tasksData.stepsAndUnits.some(item => item.step.title === "Translation")) {
        if (!this.tasksData.sourceFiles || !this.tasksData.sourceFiles.length) {
          this.errors.push("Please, upload Source file(s).")
        }
        if (this.tasksData.targets.map((i) => i.lang).includes(this.tasksData.source.lang)) {
          this.errors.push('Target and Source Languages cannot be a same if a step "Translation" is selected')
        }
      }
      if (this.errors.length) {
        this.IsErrorModal = true
        return
      }
      this.saveTasks()
    },
    async saveTasks() {
      const data = this.getDataForTasks(this.tasksData)
      try {
        if (true) {
          await this.addProjectTasks(data)
        }
        if (false) {
          await this.addProjectWordsTasks(data)
        }
      } catch (err) {
        this.alertToggle({ message: 'Error while creating T&S', isShow: true, type: "error" })
      }
    },
    getDataForTasks(tasksData) {
      let data = new FormData()
      if (tasksData.sourceFiles && tasksData.sourceFiles.length) {
        for (let file of tasksData.sourceFiles) {
          data.append('sourceFiles', file)
        }
      }
      if (tasksData.refFiles && tasksData.refFiles.length) {
        for (let file of tasksData.refFiles) {
          data.append('refFiles', file)
        }
      }
      if (tasksData.source) {
        data.append('source', JSON.stringify(tasksData.source))
      }
      data.append('targets', JSON.stringify(tasksData.targets))
      data.append('service', JSON.stringify(tasksData.service))
      data.append('stepsAdditions', JSON.stringify(tasksData.stepsAdditions))
      data.append('stepsAndUnits', JSON.stringify(tasksData.stepsAndUnits))

      data.append('projectId', JSON.stringify(this.currentProject._id))
      data.append('internalProjectId', JSON.stringify(this.currentProject.projectId))
      data.append('nativeProjectName', JSON.stringify(this.currentProject.projectName))
      data.append('industry', JSON.stringify(this.currentProject.industry))
      data.append('projectManager', JSON.stringify(this.currentProject.projectManager._id))
      data.append('customerName', this.currentProject.customer.name)

      return data
    },
    closeErrors() {
      this.errors = []
      this.IsErrorModal = false
    },
    setAdditions(data) {
      this.setDataValue({ prop: "stepsAdditions", value: data })
    },
    toggleAdditions() {
      this.isAdditions = !this.isAdditions
    },
    buildAutoData() {
      console.log('this.allServices', this.allServices)
      console.log('this.currentProject', this.currentProject)

      const service = this.activeClientServices()[0]
      this.setDataValue({ prop: "service", value: service })

      const source = this.getServiceSourceLanguages(service)[0]
      this.setDataValue({ prop: "source", value: source })
      this.setDataValue({ prop: "targets", value: [] })

      this.setStepsAndUnitByService(service)
    },
    setStepsAndUnitByService(service) {
      const stepsAndUnits = []
      for (const { step } of service.steps) {
        stepsAndUnits.push({
          step,
          start: '',
          deadline: '',
          receivables: { unit: step.calculationUnit[0], quantity: 0 },
          payables: { unit: step.calculationUnit[0], quantity: 0 }
        })
      }
      this.setDataValue({ prop: "stepsAndUnits", value: stepsAndUnits })
    },
    getServiceSourceLanguages(service) {
      const { customer: { services }, industry } = this.currentProject
      const neededServices = services
          .filter(item => item.services[0] === service._id.toString() && item.industries[0] === industry._id)
          .map(item => item.sourceLanguage)
      return this.allLanguages.filter(a => [ ...new Set(neededServices) ].some(b => a._id.toString() === b))
    },
    setService({ option }) {
      const service = this.allServices.find(item => item.title === option)
      this.setDataValue({ prop: "service", value: service })

      const source = this.getServiceSourceLanguages(service)[0]
      this.setDataValue({ prop: "source", value: source })
      this.setDataValue({ prop: "targets", value: [] })

      this.setStepsAndUnitByService(service)
    },
    activeClientServices() {
      let finalServicesArr = []
      const { industry, customer: { services, rates: { stepMultipliersTable } } } = this.currentProject
      const arrayOfClientServices = [ ...new Set(services.filter(({ industries }) => industries[0] === industry._id).map(({ services }) => services).flat()) ]
      const clientServices = this.allServices.filter((a) => arrayOfClientServices.some((b) => a._id.toString() === b))

      clientServices.forEach(elem => {
        if (elem.steps.length) {
          const stepsIds = [ ...elem.steps ].map(i => `${ i.step._id }`)
          const stepRates = stepMultipliersTable.filter(({ step }) => stepsIds.includes(`${ step }`))
          if (stepRates.length) if (!stepRates.every(({ isActive }) => !isActive)) finalServicesArr.push(elem)
        }
      })
      return finalServicesArr
    },
    ...mapActions({
      alertToggle: 'alertToggle',
      setDataValue: "setTasksDataValue",
      addProjectTasks: "addProjectTasks",
      addProjectWordsTasks: "addProjectWordsTasks",
      setCurrentProject: "setCurrentProject"
    })
  },
  computed: {
    ...mapGetters({
      tasksData: "getTasksData"
    }),
    mappedClientServices() {
      if (this.activeClientServices().length) return this.activeClientServices().map(i => i.title)
      return []
    }
  },
  async created() {
    this.buildAutoData()
  },
  components: { ValidationErrors, Button, StepsAdditions, Toggler, TasksFiles, NewServicesCreationStepsWorkflow, TasksLangsDuo, SelectSingle }
}

</script>

<style scoped lang="scss">
.taskData {
  &__row {

  }
}

.drop {
  width: 220px;
  position: relative;
  height: 32px;
}
</style>