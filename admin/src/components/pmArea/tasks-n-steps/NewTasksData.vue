<template lang="pug">
  .taskData(v-if="allServices.length")
    .taskData__errorModal
      ValidationErrors(v-if="IsErrorModal" :errors="errors" :isAbsolute="true" @closeErrors="closeErrors")

    .taskData__row-servicesLanguages
      .service
        .drop__title Service:
        .drop
          SelectSingle(
            :selectedOption="tasksData.service ? tasksData.service.title : ''"
            :options="mappedClientServices"
            placeholder="Option"
            @chooseOption="setService"
          )

        .extraServices
          .extraServices__title Extra Services:
          Toggler(:isDisabled="false" :isActive="isAdditions" @toggle="toggleAdditions()")

        .extraServicesTable(v-if="isAdditions")
          StepsAdditions(
            :stepsAdditions="tasksData.stepsAdditions ? tasksData.stepsAdditions : []"
            @save="setAdditions"
            @delete="setAdditions"
          )

      .language
        TasksLangsDuo

    .taskData__row
      NewServicesCreationStepsWorkflow(
        :templates="templates"
      )

    .taskData__files
      TasksFiles

    .taskData__button
      Button(:value="'Add Tasks & Steps'" @clicked="saveTasksChecks")

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
    allLanguages: {
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
      errors: []
    }
  },
  methods: {
    saveTasksChecks() {
      this.errors = []

      const { service } = this.tasksData
      if(service.title === 'Translation'){
        if(!this.tasksData.stepsAndUnits.length || this.tasksData.stepsAndUnits[0].step.title !== 'Translation'){
          this.errors.push("Translation job should be the first step.")
        }
      }
      if (!this.tasksData.targets || !this.tasksData.targets.length) this.errors.push("Please, select Target language(s).")
      if (this.tasksData.stepsAndUnits.some(item => item.step.title === "Translation")) {
        if (!this.tasksData.sourceFiles || !this.tasksData.sourceFiles.length) {
          this.errors.push("Please, upload Source file(s).")
        }
        if (this.tasksData.targets.map((i) => i.lang).includes(this.tasksData.source.lang)) {
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
      this.saveTasks()
    },
    async saveTasks() {
      const data = this.getDataForTasks(this.tasksData)
      try {
        if (this.tasksData.template && this.tasksData.service.title === 'Translation') {
          try {
            const memoqCreatorUser = await this.$http.get(`/memoqapi/user?userId=${ this.currentProject.projectManager._id }`)
            const { creatorUserId } = memoqCreatorUser.data
            if (!creatorUserId) throw new Error()
            data.append('creatorUserId', creatorUserId)
            this.isInfo = true
          } catch (err) {
            this.alertToggle({ message: 'PM in now exist in Memoq', isShow: true, type: "error" })
          }
          await this.addProjectWordsTasks(data)
        } else {
          await this.addProjectTasks(data)
        }
        this.alertToggle({ message: 'Tasks and Steps are created', isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: 'Error while creating T&S', isShow: true, type: "error" })
      }
    },
    getDataForTasks(tasksData) {
      let data = new FormData()
      if (tasksData.sourceFiles && tasksData.sourceFiles.length) {
        for (let file of tasksData.sourceFiles) data.append('sourceFiles', file)
      }
      if (tasksData.refFiles && tasksData.refFiles.length) {
        for (let file of tasksData.refFiles) data.append('refFiles', file)
      }
      if (tasksData.source) {
        data.append('source', JSON.stringify(tasksData.source))
      }
      if (tasksData.template) {
        data.append('template', JSON.stringify(tasksData.template))
      }
      data.append('targets', JSON.stringify(tasksData.targets))
      data.append('service', JSON.stringify(tasksData.service))
      data.append('stepsAdditions', JSON.stringify(tasksData.stepsAdditions || []))
      data.append('stepsAndUnits', JSON.stringify(tasksData.stepsAndUnits))

      data.append('industry', JSON.stringify(this.currentProject.industry))
      data.append('projectId', this.currentProject._id)
      data.append('internalProjectId', this.currentProject.projectId)
      data.append('nativeProjectName', this.currentProject.projectName)
      data.append('projectManager', this.currentProject.projectManager._id)
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
    async buildAutoData() {
      console.log('this.allServices', this.allServices)
      console.log('this.currentProject', this.currentProject)

      const service = this.activeClientServices()[0]
      this.setDataValue({ prop: "service", value: service })

      if (service.title === 'Translation') await this.getMemoqTemplates()

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
    async setService({ option }) {
      const service = this.allServices.find(item => item.title === option)
      this.setDataValue({ prop: "service", value: service })

      if (service.title === 'Translation') await this.getMemoqTemplates()

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
    async getMemoqTemplates() {
      try {
        const result = await this.$http.get("/memoqapi/templates")
        this.templates = result.data
      } catch (err) {
        this.templates = [ { name: 'No Templates' } ]
      }
    },
    async getAllServices() {
      try {
        const units = await this.$http.get("/api/units")
        const services = await this.$http.get("/api/services")
        this.allServices = services.data.map(i => {
          i.steps.map(j => {
            j.step.calculationUnit = j.step.calculationUnit.map(k => {
              k = units.data.find(({ _id }) => `${ _id }` === `${ k }`)
              return k
            })
            return j
          })
          return i
        })
      } catch (err) {
        this.alertToggle({ message: "Error on getting Services", isShow: true, type: "error" })
      }
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
    isStepsWithCATWordcount() {
      return this.tasksData.stepsAndUnits && this.tasksData.stepsAndUnits.every(({ receivables }) => receivables.unit.type === "CAT Wordcount")
    },
    isStepsQuantitySet() {
      return this.tasksData.stepsAndUnits && this.tasksData.stepsAndUnits.every(({ payables, receivables }) => +payables.quantity > 0 && +receivables.quantity > 0)
    },
    isStepsTemplateSet() {
      return this.tasksData.template && this.tasksData.template.hasOwnProperty('name')
    },
    mappedClientServices() {
      if (this.activeClientServices().length) return this.activeClientServices().map(i => i.title)
      return []
    }
  },
  async created() {
    await this.getAllServices()
    await this.buildAutoData()
  },
  components: { ValidationErrors, Button, StepsAdditions, Toggler, TasksFiles, NewServicesCreationStepsWorkflow, TasksLangsDuo, SelectSingle }
}

</script>

<style scoped lang="scss">
@import "../../../assets/scss/colors";

.taskData {
  position: relative;
  border: 2px solid $light-border;
  border-radius: 4px;
  padding: 25px;
  margin-bottom: 30px;

  &__button {
    margin-top: 20px;
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
  gap: 10px;
  margin: 17px 0;
}

.drop {
  width: 220px;
  position: relative;
  height: 32px;

  &__title {
    margin-bottom: 3px;
    position: relative;
  }
}
</style>