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

        //.extraServices
        //  .extraServices__title Extra Services:
        //  Toggler(:isDisabled="false" :isActive="isAdditions" @toggle="toggleAdditions()")

        //.extraServicesTable(v-if="isAdditions")
        //  StepsAdditions(
        //    :stepsAdditions="tasksData.stepsAdditions ? tasksData.stepsAdditions : []"
        //    @save="setAdditions"
        //    @delete="setAdditions"
        //  )

      .language
        NewTasksLangsDuoRequest

    .taskData__row(v-if="tasksData && tasksData.stepsAndUnits" )
      NewRequestServicesCreationStepsWorkflow(
        :templates="templates"
      )

    .taskData__filesOptions
      .taskData__files
        RequestTasksFiles(
          :tasksData="tasksData"
          :currentProject="currentProject"
          :currentTaskIdForUpdate="currentTaskIdForUpdate"
        )

    .taskData__button
      Button(:value="'Add Tasks & Steps'" @clicked="saveTasksChecks")

</template>

<script>
// import { mapActions, mapGetters } from "vuex"
// import SelectSingle from "../../SelectSingle"
// import TasksLangsDuo from "./TasksLangsDuo"
// import NewServicesCreationStepsWorkflow from "./NewServicesCreationStepsWorkflow"
// import TasksFiles from "./TasksFiles"
// import Toggler from "../../Toggler"
// import StepsAdditions from "./stepsAdditions"
// import Button from "../../Button"
import ValidationErrors from "../../ValidationErrors"
import { mapActions, mapGetters } from "vuex"
import SelectSingle from "../../SelectSingle"
import TasksLangsDuo from "../tasks-n-steps/TasksLangsDuo"
import NewTasksLangsDuoRequest from "./NewTasksLangsDuoRequest"
import NewRequestServicesCreationStepsWorkflow from "./NewRequestServicesCreationStepsWorkflow"
import RequestTasksFiles from "./tasks-n-steps/RequestTasksFiles"
import Button from "../../Button"

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
      errors: []
    }
  },
  methods: {
    saveTasksChecks() {
      this.errors = []
      const { service } = this.currentProject.requestForm

      if(service.title === 'Translation'){
        if(!this.tasksData.stepsAndUnits.length || this.tasksData.stepsAndUnits[0].step.title !== 'Translation'){
          this.errors.push("Translation job should be the first step.")
        }
      }

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
      // if (!this.tasksData.sourceFiles || !this.tasksData.sourceFiles.length) {
      //   if ((!this.tasksData.sourceFilesVault || !this.tasksData.sourceFilesVault.length) && (!this.tasksData.sourceFiles || !this.tasksData.sourceFiles.length)) {
      //     this.errors.push("Please, upload Source file(s).")
      //   }
      // }
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
      } finally {

      }
    },
    closeErrors() {
      this.errors = []
      this.IsErrorModal = false
    },
    // setAdditions(data) {
    //   this.setDataValue({ prop: "stepsAdditions", value: data })
    // },
    // toggleAdditions() {
    //   this.isAdditions = !this.isAdditions
    // },
    async buildAutoData() {
      if (this.currentProject.requestForm.service.title === 'Translation') await this.getMemoqTemplates()

      if (this.currentTaskIdForUpdate) {
        const { tasksAndSteps } = this.currentProject
        const { taskData } = tasksAndSteps.find(item => item.taskId === this.currentTaskIdForUpdate)
        if (taskData.stepsAndUnits[0].payables.unit.type === 'CAT Wordcount') {
          this.setDataValue({ prop: "template", value: taskData.template })
        }
        this.setDataValue({ prop: "targets", value: taskData.targets })
        this.setDataValue({ prop: "stepsAndUnits", value: taskData.stepsAndUnits })
        return
      }

      this.setStepsAndUnitByService()
    },
    setStepsAndUnitByService() {
      const { service } = this.currentProject.requestForm
      const steps = service.steps.map(item => ({ step: this.allSteps.find(({ _id }) => _id.toString() === item.step.toString()) }))
      const stepsAndUnits = []
      for (const { step } of steps) {
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
    // getServiceSourceLanguages(service) {
    //   const { customer: { services }, industry } = this.currentProject
    //   const neededServices = services
    //       .filter(item => item.services[0] === service._id.toString() && item.industries[0] === industry._id)
    //       .map(item => item.sourceLanguage)
    //   return this.allLanguages.filter(a => [ ...new Set(neededServices) ].some(b => a._id.toString() === b))
    // },
    // async setService({ option }) {
    // const service = this.allServices.find(item => item.title === option)
    // this.setDataValue({ prop: "service", value: service })
    //
    // if (service.title === 'Translation') await this.getMemoqTemplates()
    //
    // const source = this.getServiceSourceLanguages(service)[0]
    // this.setDataValue({ prop: "source", value: source })
    // this.setDataValue({ prop: "targets", value: [] })
    //
    // this.setStepsAndUnitByService(service)
    // },
    // activeClientServices() {
    //   let finalServicesArr = []
    //   const { industry, customer: { services, rates: { stepMultipliersTable } } } = this.currentProject
    //   const arrayOfClientServices = [ ...new Set(services.filter(({ industries }) => industries[0] === industry._id).map(({ services }) => services).flat()) ]
    //   const clientServices = this.allServices.filter((a) => arrayOfClientServices.some((b) => a._id.toString() === b))
    //
    //   clientServices.forEach(elem => {
    //     if (elem.steps.length) {
    //       const stepsIds = [ ...elem.steps ].map(i => `${ i.step._id }`)
    //       const stepRates = stepMultipliersTable.filter(({ step }) => stepsIds.includes(`${ step }`))
    //       if (stepRates.length) if (!stepRates.every(({ isActive }) => !isActive)) finalServicesArr.push(elem)
    //     }
    //   })
    //   return finalServicesArr
    // },
    async getMemoqTemplates() {
      try {
        const result = await this.$http.get("/memoqapi/templates")
        this.templates = result.data
      } catch (err) {
        this.templates = [ { name: 'No Templates' } ]
      }
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
  components: {
    Button,
    RequestTasksFiles,
    NewRequestServicesCreationStepsWorkflow,
    NewTasksLangsDuoRequest,
    TasksLangsDuo,
    ValidationErrors,
    SelectSingle
  }
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