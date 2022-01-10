<template lang="pug">
  .container
    .container__errorModal
      ValidationErrors(v-if="IsErrorModal" :errors="errors" :isAbsolute="true" @closeErrors="closeErrors")
    .tabs
      Tabs(
        :tabs="tabs"
        :selectedTab="selectedTab"
        @setTab="setTab"
      )

    .option(v-if="selectedTab === 'Memoq'" )
      .taskData
        .taskData__memoqLink
          .taskData__memoqLink-select
            .drop__title Workflow:
            .drop
              SelectSingle(
                :selectedOption="selectedMemoqWorkflow"
                :options="['Translation & Revising', 'Translation Only']"
                placeholder="Option"
                @chooseOption="setMemoqWorkflow"
              )
          .taskData__memoqLink-input
            .drop__title Memoq Project Name:
            .drop__input
              input(v-model="memoqLink" placeholder="Value")

        .taskData__button
          Button(:value="'Add Tasks & Steps'" :isDisabled="isDisabledSaveButton" @clicked="saveTasksChecksMemoq")

    .option(v-if="selectedTab === 'Classic' && allServices.length" )
      .taskData
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
          Button(:value="'Add Tasks & Steps'" :isDisabled="isDisabledSaveButton" @clicked="saveTasksChecks")

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
import { clearTasksData } from "../../../vuex/pmarea/actions"
import Tabs from "../../Tabs"

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
      // tabs: [ 'Classic', 'Memoq', 'XTM' ],
      tabs: [ 'Classic', 'Memoq' ],
      selectedTab: 'Classic',

      memoqLink: '',
      selectedMemoqWorkflow: '',

      allServices: [],
      templates: [],
      isAdditions: false,
      IsErrorModal: false,
      errors: [],
      isDisabledSaveButton: false
    }
  },
  beforeDestroy() {
    console.log('beforeDestroy')
    this.setDataValue({})
  },
  methods: {
    setTab({ index }) {
      this.selectedTab = this.tabs[index]
    },
    setMemoqWorkflow({ option }) {
      this.selectedMemoqWorkflow = option
    },
    async saveTasksChecksMemoq() {
      this.errors = []
      if (!this.memoqLink) this.errors.push('Please enter a Memoq project name.')
      if (!this.selectedMemoqWorkflow) this.errors.push('Please enter a Memoq project name.')
      if (this.errors.length) {
        this.IsErrorModal = true
        return
      }
      this.isDisabledSaveButton = true
      const creatorUserId = await this.getCreatorUserId()
      const { _id: projectId, projectId: internalProjectId, startDate, deadline } = this.currentProject
      const res = await this.$http.post(`/pm-manage/build-TnS-from-memoq-link`, {
        projectId,
        memoqLink: this.memoqLink,
        memoqWorkFlow: this.selectedMemoqWorkflow,
        creatorUserId,
        internalProjectId,
        startDate,
        deadline
      })
      const { data } = res
      if (data.status === 'success') {
        const { data: project } = data
        await this.setCurrentProject(project)
        this.$parent.toggleTaskData()
        this.alertToggle({ message: 'Tasks and Steps are created', isShow: true, type: "success" })
      } else {
        this.alertToggle({ message: data.message, isShow: true, type: "error" })
      }
      this.isDisabledSaveButton = false
    },
    saveTasksChecks() {
      this.errors = []

      const { service } = this.tasksData
      if (service.title === 'Translation') {
        if (!this.tasksData.stepsAndUnits.length || this.tasksData.stepsAndUnits[0].step.title !== 'Translation') {
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
    async getCreatorUserId() {
      try {
        const memoqCreatorUser = await this.$http.get(`/memoqapi/user?userId=${ this.currentProject.projectManager._id }`)
        const { creatorUserId } = memoqCreatorUser.data
        if (!creatorUserId) throw new Error()
        return creatorUserId
      } catch (err) {
        this.alertToggle({ message: 'PM in now exist in Memoq', isShow: true, type: "error" })
      }
    },
    async saveTasks() {
      this.isDisabledSaveButton = true
      const data = this.getDataForTasks(this.tasksData)
      try {
        if (this.tasksData.template && this.tasksData.service.title === 'Translation' && this.tasksData.stepsAndUnits[0].receivables.unit.type === 'CAT Wordcount') {
          const creatorUserId = await this.getCreatorUserId()
          data.append('creatorUserId', creatorUserId)
          try {
            await this.addProjectWordsTasks(data)
          } catch (err) {
            this.isDisabledSaveButton = false
            this.alertToggle({ message: 'Error while creating T&S', isShow: true, type: "error" })
          }
        } else {
          try {
            await this.addProjectTasks(data)
          } catch (err) {
            this.isDisabledSaveButton = false
            this.alertToggle({ message: 'Error while creating T&S', isShow: true, type: "error" })
          }
        }
        this.$parent.toggleTaskData()
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
      // console.log('this.allServices', this.allServices)
      // console.log('this.currentProject', this.currentProject)

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
      for (let { step } of service.steps) {
        if (service.title !== 'Translation') step.calculationUnit = step.calculationUnit.filter(({ type }) => type !== 'CAT Wordcount')
        stepsAndUnits.push({
          step,
          start: '',
          deadline: '',
          receivables: {
            unit: step.calculationUnit[0],
            quantity: 0
          },
          payables: {
            unit: step.calculationUnit[0],
            quantity: 0
          }
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
      setCurrentProject: "setCurrentProject",
      clearTasksData: "clearTasksData"
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
  destroyed() {
    this.clearTasksData()
  },
  components: { Tabs, ValidationErrors, Button, StepsAdditions, Toggler, TasksFiles, NewServicesCreationStepsWorkflow, TasksLangsDuo, SelectSingle }
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
  gap: 10px;
  margin: 17px 0;
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
      border-radius: 4px;
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
</style>