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

    .option(v-if="selectedTab === 'Smartling Import'")
      .taskData
        .taskData__memoqLink(style="justify-content: center; align-items: flex-end;")
          .taskData__memoqLink-select
            .drop__title Smartling JobID:
            .drop__input()
              input(style="width: 220px;" placeholder="Value" ref="JobID")
          .taskData__memoqLink-select
            .drop__title Workflow:
            .drop
              SelectSingle(
                :selectedOption="selectedSmartlingWorkflow"
                :options="['Post-Editing & Translation & Revising', 'Post-Editing & Translation', 'Translation & Revising', 'Translation Only']"
                placeholder="Option"
                @chooseOption="setSmartlingWorkflow"
              )
          .taskData__xtm
            .taskData__xtm-title Smartling File:
            .taskData__xtm-input(v-if="!smartlingFile")
              UploadFileButton
                input.smartling-file-input(type="file" @change='uploadSmartlingFile' :multiple='false')

            .taskData__xtm-fileWrapper(v-else)
              .taskData__xtm-fileName {{ smartlingFile }}
              .taskData__xtm-removeFile( @click="removeSmartlingFile") &#215;

        .taskData__button
          Button(:value="'Add Tasks & Steps'" :isDisabled="isDisabledSaveButton" @clicked="saveTasksChecksSmartling")

    .option(v-if="selectedTab === 'XTM Import'")
      .taskData
        .taskData__xtm
          .taskData__xtm-title XTM File:
          .taskData__xtm-input(v-if="!xtmFile")
            UploadFileButton
              input.xtm-file-input(type="file" @change='uploadXTMFile' :multiple='false')

          .taskData__xtm-fileWrapper(v-else)
            .taskData__xtm-fileName {{ xtmFile }}
            .taskData__xtm-removeFile( @click="removeXTMFile") &#215;

        .taskData__button
          Button(:value="'Add Tasks & Steps'" :isDisabled="isDisabledSaveButton" @clicked="saveTasksChecksXTM")

    .option(v-if="selectedTab === 'Memoq Import'" )
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
                :hasSearch="true"
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

        .taskData__row(v-if="tasksData.service")
          .tabs-workflow
            .tabs-workflow__title Workflow process:
            .tabs-workflow__tabs
              Tabs(
                :tabs="tabsWorkflow"
                :selectedTab="selectedTabWorkflow"
                @setTab="setTabWorkflow"
              )
          NewServicesCreationStepsWorkflowClassic(v-if="selectedTabWorkflow === 'Alpha'")
          NewServicesCreationStepsWorkflowMemoq(v-if="selectedTabWorkflow === 'Memoq'")
          NewServicesCreationStepsWorkflowMemoqMT(v-if="selectedTabWorkflow === 'Memoq MT'")

        .taskData__files
          TasksFiles

        .taskData__button
          Button(:value="'Add Tasks & Steps'" :isDisabled="isDisabledSaveButton" @clicked="saveTasksChecks")

</template>

<script>
import { mapActions, mapGetters } from "vuex"
import SelectSingle from "../../SelectSingle"
import TasksLangsDuo from "./TasksLangsDuo"
import NewServicesCreationStepsWorkflowMemoq from "./NewServicesCreationStepsWorkflowMemoq"
import TasksFiles from "./TasksFiles"
import Toggler from "../../Toggler"
import StepsAdditions from "./stepsAdditions"
import Button from "../../Button"
import ValidationErrors from "../../ValidationErrors"
import { clearTasksData } from "../../../vuex/pmarea/actions"
import Tabs from "../../Tabs"
import UploadFileButton from "../../UploadFileButton"
import NewServicesCreationStepsWorkflowClassic from "./NewServicesCreationStepsWorkflowClassic"
import NewServicesCreationStepsWorkflowMemoqMT from "./NewServicesCreationStepsWorkflowMemoqMP"

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
      tabs: [ 'Classic', 'Memoq Import', 'XTM Import', 'Smartling Import' ],
      selectedTab: 'Classic',
      selectedTabWorkflow: 'Alpha',

      memoqLink: '',
      selectedMemoqWorkflow: '',

      xtmFile: '',
      xtmFileData: null,

      smartlingFile: '',
      smartlingFileData: null,
      selectedSmartlingWorkflow: '',

      allServices: [],
      isAdditions: false,
      IsErrorModal: false,
      errors: [],
      isDisabledSaveButton: false
    }
  },
  beforeDestroy() {
    this.setDataValue({})
  },
  methods: {
    uploadSmartlingFile(e) {
      const file = Array.from(e.target.files)[0]
      console.log(file)
      this.smartlingFile = file.name
      this.smartlingFileData = file
    },
    removeXTMFile() {
      let inputFiles = document.querySelectorAll('.xtm-file-input')
      for (let elem of inputFiles) elem.value = ''
      this.xtmFile = ''
      this.xtmFileData = null
    },
    removeSmartlingFile() {
      let inputFiles = document.querySelectorAll('.smartling-file-input')
      for (let elem of inputFiles) elem.value = ''
      this.smartlingFile = ''
      this.smartlingFileData = null
    },
    uploadXTMFile(e) {
      const file = Array.from(e.target.files)[0]
      this.xtmFile = file.name
      this.xtmFileData = file
    },
    setTab({ index }) {
      this.selectedTab = this.tabs[index]
    },
    setTabWorkflow({ index }) {
      this.selectedTabWorkflow = this.tabsWorkflow[index]
      this.setDataValue({ prop: "template", value: {} })
      this.setStepsAndUnitByService(this.tasksData.service)
    },
    setMemoqWorkflow({ option }) {
      this.selectedMemoqWorkflow = option
    },
    setSmartlingWorkflow({ option }) {
      this.selectedSmartlingWorkflow = option
    },
    async saveTasksChecksSmartling() {
      this.errors = []
      if (!this.smartlingFile) this.errors.push('Please upload a Smartling file.')
      if (!this.selectedSmartlingWorkflow) this.errors.push('Please enter the workflow.')
      if (!this.$refs.JobID.value) this.errors.push('Please enter the Smartling JobID.')
      if (this.errors.length) {
        this.IsErrorModal = true
        return
      }
      this.isDisabledSaveButton = true
      const { _id: projectId, projectId: internalProjectId, startDate, deadline } = this.currentProject
      const formData = new FormData()
      formData.append('workflow', this.selectedSmartlingWorkflow)
      formData.append('file', this.smartlingFileData)
      formData.append('projectId', projectId)
      formData.append('internalProjectId', internalProjectId)
      formData.append('startDate', startDate)
      formData.append('deadline', deadline)
      formData.append('SmartlingJobID', this.$refs.JobID.value.trim())

      const res = await this.$http.post(`/pm-manage/build-TnS-from-smartling-file`, formData)
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
    async saveTasksChecksXTM() {
      this.errors = []
      if (!this.xtmFile) this.errors.push('Please upload a XTM file.')
      if (this.errors.length) {
        this.IsErrorModal = true
        return
      }
      this.isDisabledSaveButton = true
      const { _id: projectId, projectId: internalProjectId, startDate, deadline } = this.currentProject
      const formData = new FormData()
      formData.append('file', this.xtmFileData)
      formData.append('projectId', projectId)
      formData.append('internalProjectId', internalProjectId)
      formData.append('startDate', startDate)
      formData.append('deadline', deadline)

      const res = await this.$http.post(`/pm-manage/build-TnS-from-xtm-file`, formData)
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
    async saveTasksChecksMemoq() {
      this.errors = []
      if (!this.memoqLink) this.errors.push('Please enter a Memoq project name.')
      if (!this.selectedMemoqWorkflow) this.errors.push('Please enter the workflow.')
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
      if (!this.tasksData.targets || !this.tasksData.targets.length) this.errors.push("Please, select Target language(s).")

      if (this.tasksData.stepsAndUnits.some(item => item.step.title === "Translation") && (this.selectedTabWorkflow === 'Memoq' || this.selectedTabWorkflow === 'Memoq MT')) {
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
        if (this.selectedTabWorkflow === 'Memoq' || this.selectedTabWorkflow === 'Memoq MT') {
          // this.tasksData.template && this.tasksData.service.title === 'Translation' && this.tasksData.stepsAndUnits[0].receivables.unit.type === 'CAT Wordcount'

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
      const service = this.activeClientServices()[0]
      this.setDataValue({ prop: "service", value: service })
      const source = this.getServiceSourceLanguages(service)[0]
      this.setDataValue({ prop: "source", value: source })
      this.setDataValue({ prop: "targets", value: [] })

      this.selectedTabWorkflow = 'Alpha'
      this.setStepsAndUnitByService(service)
    },
    setStepsAndUnitByService(service) {
      const stepsAndUnits = []

      if (this.selectedTabWorkflow === 'Alpha' || service.title !== 'Translation') {
        for (let { step } of service.steps) {
          let units = []
          units = step.calculationUnit.filter(({ type }) => type !== 'CAT Wordcount')
          collectWorkFlow(step, units)
        }
      }

      if (this.selectedTabWorkflow === 'Memoq') {
        for (let { step } of service.steps) {
          if (step.title !== 'Translation' && step.title !== 'Revising') continue
          let units = []
          units = step.calculationUnit.filter(({ type }) => type === 'CAT Wordcount')
          collectWorkFlow(step, units)
        }
      }

      if (this.selectedTabWorkflow === 'Memoq MT') {
        service.steps = service.steps.reduce((acc, curr) => {
          curr.step.title === 'Translation'
              ? acc[1] = curr
              : curr.step.title === 'Revising'
                  ? acc[2] = curr
                  : acc[0] = curr
          return acc
        }, [])
        for (let { step } of service.steps) {
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
    getServiceSourceLanguages(service) {
      const { customer: { services, clientType }, industry } = this.currentProject
      if (clientType === 'Individual') {
        const englishLanguageIndex = this.allLanguages.findIndex(item => item.lang === "English (United Kingdom)")
        const firstElem = this.allLanguages.splice(englishLanguageIndex, 1)
        this.allLanguages.unshift(firstElem[0])
        return this.allLanguages
      }
      const neededServices = services
          .filter(item => item.services[0] === service._id.toString() && item.industries[0] === industry._id)
          .map(item => item.sourceLanguage)

      return this.allLanguages.filter(a => [ ...new Set(neededServices) ].some(b => a._id.toString() === b))
    },
    async setService({ option }) {
      const service = this.allServices.find(item => item.title === option)
      this.setDataValue({ prop: "service", value: service })
      const source = this.getServiceSourceLanguages(service)[0]
      this.setDataValue({ prop: "source", value: source })
      this.setDataValue({ prop: "targets", value: [] })

      this.setStepsAndUnitByService(service)
    },
    activeClientServices() {
      let finalServicesArr = []
      const { industry, customer: { services, clientType, rates: { stepMultipliersTable } } } = this.currentProject

      if (clientType === 'Individual') return this.allServices

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
    tabsWorkflow() {
      return [ 'Alpha', 'Memoq', 'Memoq MT' ].filter(i => this.tasksData.service.title === 'Translation' ? i : i !== 'Memoq' && i !== 'Memoq MT')
    },
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
  components: {
    NewServicesCreationStepsWorkflowMemoqMT,
    NewServicesCreationStepsWorkflowClassic,
    UploadFileButton,
    Tabs,
    ValidationErrors,
    Button,
    StepsAdditions,
    Toggler,
    TasksFiles,
    NewServicesCreationStepsWorkflowMemoq,
    TasksLangsDuo,
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