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
      ValidationErrors(v-if="areErrorsExist" :errors="errors" :isAbsolute="true" @closeErrors="closeErrorsBlock")

    .tasks-steps__tables
      .tasks__table
        GeneralTable(
          :fields="fields1"
          :tableData="currentTasks"
        )
          template(v-for="field in fields1", :slot="field.headerKey", slot-scope="{ field }")
            .tasks__head-title {{ field.label }}
          template(slot="language" slot-scope="{ row, index }")
            .tasks__data {{ row.language }}
          template(slot="service" slot-scope="{ row, index }")
            .tasks__data {{ row.service }}
          template(slot="steps" slot-scope="{ row, index }")
            .tasks__data {{ row.steps }}
          template(slot="tasksCount" slot-scope="{ row, index }")
            .tasks__data {{ row.tasksLength }} / {{ row.stepsLength }}
          template(slot="filesCount" slot-scope="{ row, index }")
            .tasks__data {{row.sourceLength}} / {{row.refLength}}

          template(slot="icons" slot-scope="{ row, index }")
            .tasks__icons(v-if="canUpdateRequest")
              .tasks__icon(@click="editTasksData(row.taskId)")
                img(src="../../../assets/images/latest-version/i-edit.png")
              .tasks__icon(@click="deleteTask(row.taskId)")
                img(src="../../../assets/images/latest-version/i-delete.png")
            .tasks__icons(v-else)
              .tasks__icon
                img(src="../../../assets/images/latest-version/lock.png")

    .button(v-if="!isTaskData && currentTasks.length && canUpdateRequest")
      .button__convert
        Button(value="Convert into Project" :isDisabled="isButtonDisable" @clicked="convertIntoProject")

</template>

<script>
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
      currentTaskIdForUpdate: '',
      isButtonDisable: false,
      fields1: [
        { label: "Service", headerKey: "headerService", key: "service", style: { width: "16%" } },
        { label: "Service steps", headerKey: "headerSteps", key: "steps", style: { width: "25%" } },
        { label: "Languages", headerKey: "headerLanguage", key: "language", style: { width: "25%" } },
        { label: "Tasks / Steps", headerKey: "headerSteps", key: "tasksCount", style: { width: "12%" } },
        { label: "Source / Ref.", headerKey: "headerSteps", key: "filesCount", style: { width: "12%" } },
        { label: "", headerKey: "headerIcons", key: "icons", style: { width: "10%" } }
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
    // closeTaskDataAndClearTasksRequest() {
    //   this.isTaskData = false
    //   this.clearTasksDataRequest()
    // },
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

      if (title === 'Translation') {
        if (tasksAndSteps.some(item => item.taskData.stepsAndUnits[0].receivables.unit.type === 'CAT Wordcount') &&
            tasksAndSteps.some(item => item.taskData.stepsAndUnits[0].receivables.unit.type !== 'CAT Wordcount')) {
          this.errors.push('Translation services should exist only one type of unit.')
        }
      }
      if (this.errors.length) {
        this.showErrors({ errors: this.errors })
        return
      }
      if (title === 'Translation' && tasksAndSteps[0].taskData.stepsAndUnits[0].receivables.unit.type === 'CAT Wordcount') {
        try {
          const memoqCreatorUser = await this.$http.get(`/memoqapi/user?userId=${ this.currentProject.projectManager._id }`)
          const { creatorUserId: creatorUserForMemoqId } = memoqCreatorUser.data
          if (!creatorUserForMemoqId) {
            this.alertToggle({ message: 'Error on converting project! Not such user [PM] on Memoq', isShow: true, type: "error" })
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
        const projectId = await this.$http.post('/pm-manage/convert-request-into-project', {
          projectId: this.currentProject._id
        })
        const route = this.$router.resolve({ path: `/pangea-projects/draft-projects/Draft/details/${ projectId.data }` })
        window.open(route.href, "_self")
        this.isButtonDisable = false
      } catch (err) {
        this.isButtonDisable = false
        this.alertToggle({ message: 'Error on converting project!', isShow: true, type: "error" })
      }
    },
    async convertCATUnitsProject(creatorUserForMemoqId) {
      try {
        const projectId = await this.$http.post('/pm-manage/convert-translation-request-into-project', {
          projectId: this.currentProject._id,
          creatorUserForMemoqId
        })
        const route = this.$router.resolve({ path: `/pangea-projects/draft-projects/Draft/details/${ projectId.data }` })
        window.open(route.href, "_self")
        this.isButtonDisable = false
      } catch (err) {
        console.log(err)
        if (err.body) {
          this.alertToggle({ message: err.body, isShow: true, type: "error" })
        } else {
          this.alertToggle({ message: 'Error on converting translation project!', isShow: true, type: "error" })
        }
        this.isButtonDisable = false
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
      this.currentTaskIdForUpdate = taskId
      this.isTaskData = true
    },
    setDefault() {
      this.isTaskData = false
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
      this.currentTaskIdForUpdate = ''
      if (!this.isTaskData) {
        this.clearTasksDataRequest()
      }
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
        return {
          taskId,
          language: service.languageForm === 'Mono'
              ? `${ targets.map(i => i.symbol).join(', ') }`
              : `${ sourceLanguage.symbol } >> ${ targets.map(i => i.symbol).join(', ') }`,
          service: service.title,
          steps: [ ...new Set(stepsAndUnits.map(item => item.step.title)) ].join(', '),
          tasksLength: targets.length,
          stepsLength: stepsAndUnits.length * targets.length,
          sourceLength: sourceFiles.length,
          refLength: refFiles.length
        }
      })
    },
    canUpdateRequest() {
      return this.user.group.name === "Administrators"
          || this.user.group.name === "Developers"
          || this.currentProject.projectManager._id.toString() === this.user._id.toString()
          || this.currentProject.accountManager._id.toString() === this.user._id.toString()
          || (this.user.position === 'Compliance Coordinator' && this.user._id.toString() === "61b359f25c9ee507f4aa7a14" && this.currentProject.projectManager._id.toString() === "60b4dee7f2611f5115701566")
    }
  },
  components: {
    NewRequestTasksData,
    GeneralTable,
    Button,
    DataTable,
    Tabs,
    ValidationErrors,
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
    padding-top: 25px;
  }
}

.tasks-steps {
  box-sizing: border-box;
  padding: 25px;
  width: 1040px;
  margin-top: 25px;
  box-shadow: $box-shadow;
  position: relative;
  background: white;
  border-radius: 2px;

  &__addTask,
  &__closeAddTask {
    font-size: 16px;
    border: 1px solid $border;
    border-radius: 2px;
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
    font-size: 16px;
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
