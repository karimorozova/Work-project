<template lang="pug">
  .tasks-steps(v-if="user._id && currentProject._id" )
    .tasks-steps__tasks-title Tasks and Steps

      .tasks-steps__addTask(v-if="canUpdateRequest && !isTaskData" @click="toggleTaskData")
        i.fas.fa-plus-circle
      .tasks-steps__closeAddTask(v-if="canUpdateRequest && isTaskData" @click="toggleTaskData")
        i.fas.fa-times-circle

    div(v-if="canUpdateRequest")
      transition(name="slide-fade")
        NewRequestTasksData(
          v-if="isTaskData && currentProject._id && allLanguages.length && allSteps.length"
          :allLanguages="allLanguages"
          :currentProject="currentProject"
          :currentTaskIdForUpdate="currentTaskIdForUpdate"
          :allSteps="allSteps"
        )
        //RequestTasksData(
        //  v-if="isTaskData"
        //  :originallyLanguages="originallyLanguages"
        //  :originallyUnits="originallyUnits"
        //  :originallySteps="originallySteps"
        //  :originallyServices="originallyServices"
        //  :currentTaskId="currentTaskId"
        //  :currentTaskIdForUpdate="currentTaskIdForUpdate"
        //  @endOfSettingTaskData="endOfSettingTaskData"
        //  @addTasks="addTasks"
        //  @showErrors="showErrors"
        //)
      ValidationErrors(v-if="areErrorsExist" :errors="errors" :isAbsolute="true" @closeErrors="closeErrorsBlock")

    .tasks-steps__tables
      .tasks__tabs
        Tabs(:tabs="tabs" :selectedTab="selectedTab" @setTab="setTab")
      .tasks__table(v-if="isTasksShow")
        GeneralTable(
          :fields="fields1"
          :tableData="currentTasks"
        )
          template(v-for="field in fields1", :slot="field.headerKey", slot-scope="{ field }")
            .tasks__head-title {{ field.label }}

          template(slot="id" slot-scope="{ row, index }")
            .tasks__data {{ row.taskId }}
          template(slot="language" slot-scope="{ row, index }")
            .tasks__data {{ row.language }}
          template(slot="service" slot-scope="{ row, index }")
            .tasks__data {{ row.service }}
          template(slot="start" slot-scope="{ row, index }")
            .tasks__data {{ row.start }}
          template(slot="deadline" slot-scope="{ row, index }")
            .tasks__data {{ row.deadline }}
          template(slot="source" slot-scope="{ row, index }")
            .tasks__data {{ row.sourceLength }}
          template(slot="ref" slot-scope="{ row, index }")
            .tasks__data {{ row.refLength }}
          template(slot="icons" slot-scope="{ row, index }")
            .tasks__icons(v-if="canUpdateRequest")
              .tasks__icon(@click="editTasksData(row.taskId)")
                img(src="../../../assets/images/latest-version/i-edit.png")
              .tasks__icon(@click="deleteTask(row.taskId)")
                img(src="../../../assets/images/latest-version/i-delete.png")
            .tasks__icons(v-else)
              .tasks__icon
                img(src="../../../assets/images/latest-version/lock.png")

      //.tasks__table(v-if="isStepsShow")
      //  GeneralTable(
      //    :fields="fields2"
      //    :tableData="currentSteps"
      //    :bodyClass="currentSteps.length < 7 ? 'tbody_visible-overflow' : ''"
      //    :tableheadRowClass="currentSteps.length < 7 ? 'tbody_visible-overflow' : ''"
      //    bodyRowClass="steps-table-row"
      //  )
      //    template(v-for="field in fields2", :slot="field.headerKey", slot-scope="{ field }")
      //      .tasks__head-title(v-if="field.headerKey === 'headerSize'")
      //        span(v-if="currentProject.requestForm.service.title === 'Compliance'") Quantity / Template
      //        span(v-else) Quantity / Size
      //      .tasks__head-title {{ field.label }}
      //
      //    template(slot="id" slot-scope="{ row, index }")
      //      .tasks__data {{ row.stepId }}
      //    template(slot="language" slot-scope="{ row, index }")
      //      .tasks__data {{ row.language }}
      //    template(slot="step" slot-scope="{ row, index }")
      //      .tasks__data {{ row.step }}
      //    template(slot="unit" slot-scope="{ row, index }")
      //      .tasks__data {{ row.unit  }}
      //    template(slot="quantity" slot-scope="{ row, index }")
      //      .tasks__data {{ currentProject.requestForm.service.title === 'Translation' ? '-' : row.quantitySize }}
      //    template(slot="start" slot-scope="{ row, index }")
      //      .tasks__data {{ row.start }}
      //    template(slot="deadline" slot-scope="{ row, index }")
      //      .tasks__data {{ row.deadline }}

    .button(v-if="(!isTaskData && currentTasks.length && canUpdateRequest) && currentProject.clientBillingInfo")
      .button__convert
        Button(value="Convert into Project" :isDisabled="isButtonDisable" @clicked="convertIntoProject")

</template>

<script>
import RequestTasksData from "./tasks-n-steps/RequestTasksData"
import { mapGetters, mapActions } from 'vuex'
import ValidationErrors from "../../ValidationErrors"
import Tabs from "../../Tabs"
import DataTable from "../../DataTable"
import moment from 'moment'
import Button from "../../Button"
import GeneralTable from "../../GeneralTable"
import NewRequestTasksData from "./NewRequestTasksData"

export default {
  props: {
    originallyLanguages: { type: Array },
    originallyUnits: { type: Array },
    originallySteps: { type: Array },
    originallyServices: { type: Array }
  },
  data() {
    return {
      icons: {
        delete: '../../../assets/images/latest-version/i-delete.png',
        edit: '../../../assets/images/Other/edit-icon-qa.png'
      },
      errors: [],
      isTaskData: false,
      areErrorsExist: false,
      tabs: [ 'Tasks and Steps' ],
      isStepsShow: false,
      isTasksShow: true,
      // isEditData: false,
      selectedTab: 'Tasks and Steps',
      // currentTaskId: '',
      currentTaskIdForUpdate: '',
      isButtonDisable: false,
      fields1: [
        { label: "Task Id", headerKey: "headerId", key: "id", style: { width: "19%" } },
        { label: "Service", headerKey: "headerService", key: "service", style: { width: "15%" } },
        { label: "Language", headerKey: "headerLanguage", key: "language", style: { width: "20%" } },
        { label: "# Source", headerKey: "headerSource", key: "source", style: { width: "7%" } },
        { label: "# Ref.", headerKey: "headerRef", key: "ref", style: { width: "7%" } },
        { label: "", headerKey: "headerIcons", key: "icons", style: { width: "8%" } }
      ],

      fields2: [
        { label: "Step Id", headerKey: "headerId", key: "id", style: { width: "19%" } },
        { label: "Language", headerKey: "headerLanguage", key: "language", style: { width: "20%" } },
        { label: "Step", headerKey: "headerStep", key: "step", style: { width: "12%" } },
        { label: "Unit", headerKey: "headerUnit", key: "unit", style: { width: "12%" } },
        { label: "", headerKey: "headerSize", key: "quantity", style: { width: "13%" } },
        { label: "Start", headerKey: "headerStart", key: "start", style: { width: "12%" } },
        { label: "Deadline", headerKey: "headerDeadline", key: "deadline", style: { width: "12%" } }
      ]
    }
  },
  methods: {
    ...mapActions([
      "alertToggle",
      "clearTasksDataRequest",
      "setCurrentClientRequest",
      "setTasksDataValueRequest"
    ]),
    closeTaskDataAndClearTasksRequest() {
      this.isTaskData = false
      this.clearTasksDataRequest()
    },
    checkTranslationSourceFiles(title, tasksAndSteps) {
      if (title === 'Translation') {
        if (tasksAndSteps.length) {
          if (!tasksAndSteps.every(item => item.sourceFiles.length)) {
            this.errors = []
            this.errors.push('Each task should exist source file')
          }
        }
      }
    },
    async convertIntoProject() {
      this.isButtonDisable = true
      const { requestForm: { service: { title } }, tasksAndSteps } = this.currentProject
      this.checkTranslationSourceFiles(title, tasksAndSteps)
      if (this.errors.length) {
        this.showErrors({ errors: this.errors })
        return
      }

      if (title === 'Translation') {
        try {
          const memoqCreatorUser = await this.$http.get(`/memoqapi/user?userId=${ this.currentProject.projectManager._id }`)
          const { creatorUserId: creatorUserForMemoqId } = memoqCreatorUser.data
          if (!creatorUserForMemoqId) {
            this.alertToggle({ message: 'Error on converting project! Not such user on Memoq', isShow: true, type: "error" })
            return
          }
          await this.convertCATUnitsProject(creatorUserForMemoqId)
        } catch (err) {
          this.alertToggle({ message: 'Error on converting translation project!', isShow: true, type: "error" })
        }
      } else {
        await this.convertCustomUnitsProject()
      }
    },
    async convertCustomUnitsProject() {
      try {
        const projectId = await this.$http.post('/pm-manage/convert-request-into-project', { projectId: this.currentProject._id })
        const route = this.$router.resolve({ path: `/pangea-projects/draft-projects/Draft/details/${ projectId.data }` })
        window.open(route.href, "_self")
        this.isButtonDisable = false
      } catch (err) {
        this.alertToggle({ message: 'Error on converting project!', isShow: true, type: "error" })
      }
    },
    async convertCATUnitsProject(creatorUserForMemoqId) {
      try {
        const projectId = await this.$http.post('/pm-manage/convert-translation-request-into-project', { projectId: this.currentProject._id, creatorUserForMemoqId })
        const route = this.$router.resolve({ path: `/pangea-projects/draft-projects/Draft/details/${ projectId.data }` })
        window.open(route.href, "_self")
        this.isButtonDisable = false
      } catch (err) {
        this.alertToggle({ message: 'Error on converting translation project!', isShow: true, type: "error" })
      }
    },
    async deleteTask(taskId) {
      try {
        const updatedProject = await this.$http.delete(`/pm-manage/delete-request-tasks/${ taskId }/${ this.currentProject._id }`)
        await this.setCurrentClientRequest(updatedProject.data)
        this.alertToggle({ message: 'Task deleted!', isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: 'Error on deleting task!', isShow: true, type: "error" })
      }
    },
    editTasksData(taskId) {
      // this.isEditData = true
      // this.currentTaskId = taskId
      this.currentTaskIdForUpdate = taskId
      this.isTaskData = true
    },
    setDefault() {
      this.isTaskData = false
      // this.currentTaskId = ''
      this.currentTaskIdForUpdate = ''
    },
    closeErrorsBlock() {
      this.areErrorsExist = false
      this.errors = []
    },
    showErrors({ errors }) {
      this.errors = [ ...errors ]
      this.areErrorsExist = true
    },
    setDefaultIsTaskData() {
      if (!this.currentProject.tasksAndSteps.length) {
        this.isTaskData = true
      }
    },
    toggleTaskData() {
      this.isTaskData = !this.isTaskData
      // this.currentTaskId = ''
      this.currentTaskIdForUpdate = ''
      if (!this.isTaskData) {
        this.clearTasksDataRequest()
      }
    },
    setTab({ index }) {
      this.isTasksShow = index === 0
      this.isStepsShow = !this.isTasksShow
      this.selectedTab = this.tabs[index]
    }

  },
  computed: {
    ...mapGetters({
      allLanguages: 'getAllLanguages',
      currentProject: 'getCurrentClientRequest',
      tasksData: "getTasksDataRequest",
      user: "getUser",
      allSteps: "getAllSteps"
    }),
    currentTasks() {
      return this.currentProject.tasksAndSteps.map(({ taskId, taskData, refFiles, sourceFiles }) => {
        const { targets, stepsAndUnits } = taskData
        const { requestForm: { sourceLanguage, service } } = this.currentProject

        // let start, deadline
        // if (stepsDates.length === 1) {
        // 	[ start, deadline ] = Object.values(stepsDates[0])
        // } else {
        // 	start = stepsDates[0].start
        // 	deadline = stepsDates[1].deadline
        // }

        return {
          // taskId: taskId + ` (Task count: ${ targets.length })`,
          taskId,
          language: `${ sourceLanguage.symbol } >> ${ targets.map(i => i.symbol).join(', ') }`,
          service: service.title,
          sourceLength: sourceFiles.length,
          refLength: refFiles.length
        }
      })
    },
    currentSteps() {
      // return []
      // let a = this.currentProject.tasksAndSteps.map(({ taskId, taskData, refFiles, sourceFiles }) => {
      // 	let result = []
      // 	const { source, targets, service, stepsDates, stepsAndUnits } = taskData
      // 	for (let i = 0; i < stepsAndUnits.length; i++) {
      // 		const item = stepsAndUnits[i]
      // 		result.push({
      // 			stepId: `${ taskId } S0${ i + 1 }`,
      // 			language: `${ source.symbol } >> ${ targets.map(i => i.symbol).join(', ') }`,
      // 			step: item.step,
      // 			unit: item.unit,
      // 			quantitySize: item.hasOwnProperty('hours') ? `${ item.hours } / ${ item.size }` : `${ item.quantity } / ${ item.size }`,
      // 			start: moment(stepsDates[i].start).format('MMM D, HH:mm'),
      // 			deadline: moment(stepsDates[i].deadline).format('MMM D, HH:mm')
      // 		})
      // 	}
      // 	return result
      // })
      // return a.flat()
    },
    canUpdateRequest() {
      return this.user.group.name === "Administrators"
          || this.user.group.name === "Developers"
          || this.currentProject.projectManager._id === this.user._id
    }
  },
  components: {
    NewRequestTasksData,
    GeneralTable,
    Button,
    DataTable,
    Tabs,
    ValidationErrors,
    RequestTasksData
  },
  mounted() {
    this.setDefaultIsTaskData()
  }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.button {
  &__convert {
    display: flex;
    justify-content: center;
    padding-top: 20px;
  }
}

.tasks-steps {
  box-sizing: border-box;
  padding: 25px;
  width: 1040px;
  margin-top: 50px;
  box-shadow: $box-shadow;
  position: relative;
  background: white;
  border-radius: 4px;

  &__addTask,
  &__closeAddTask {
    font-size: 16px;
    border: 1px solid $border;
    border-radius: 4px;
    height: 30px;
    width: 30px;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: .2s ease-out;
    justify-content: center;
    color: $dark-border;

    &:hover {
      color: $text;

    }
  }

  &__info {
    position: absolute;
    z-index: 1000;
    color: $orange;
    background-color: $white;
    padding: 20px;
    top: 20%;
    margin-left: auto;
    margin-right: auto;
    left: 0;
    right: 0;
    width: 300px;
    border: 1px solid $border;
    box-shadow: $box-shadow;
  }

  &__file-counter {
    margin-top: 10px;
    text-align: center;
  }

  &__tasks-title {
    font-size: 19px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: Myriad600;
  }

  &__menu-title {
    font-size: 14px;
  }

  &__tables {
    position: relative;
  }

  &__arrow {
    cursor: pointer;
  }

  &_rotate {
    transform: rotate(180deg);
  }
}

.no-box-shadow {
  box-shadow: none;
}

.tasks {
  &__data {
    padding: 0px 7px;
    display: grid;
    height: 40px;
    align-items: center;
    overflow: auto;
  }

  &__head-title {
    padding: 0 7px;
  }

  &__icons {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    height: 31px;
    width: 100%;
  }

  &__icon {
    cursor: pointer;
  }
}

.slide-fade-enter-active {
  transition: all .3s ease;
}

.slide-fade-leave-active {
  transition: all .1s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}

.slide-fade-enter, .slide-fade-leave-to {
  transform: translateY(10px);
  opacity: 0;
}
</style>
