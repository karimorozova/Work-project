<template lang="pug">
  .tasks-steps
    .tasks-steps__tasks-title Tasks and Steps
      img.tasks-steps__arrow(v-if="canUpdateRequest" src="../../../assets/images/open-close-arrow-brown.png" @click="toggleTaskData" :class="{'tasks-steps_rotate': isTaskData }")
    div(v-if="canUpdateRequest")
      RequestTasksData(
        v-if="isTaskData"
        :originallyLanguages="originallyLanguages"
        :originallyUnits="originallyUnits"
        :originallySteps="originallySteps"
        :originallyServices="originallyServices"
        :currentTaskId="currentTaskId"
        :currentTaskIdForUpdate="currentTaskIdForUpdate"
        @endOfSettingTaskData="endOfSettingTaskData"
        @addTasks="addTasks"
        @showErrors="showErrors"
      )
      ValidationErrors(v-if="areErrorsExist" :errors="errors" :isAbsolute="true" @closeErrors="closeErrorsBlock")

    .tasks-steps__tables
      .tasks__tabs
        Tabs(:tabs="tabs" :selectedTab="selectedTab" @setTab="setTab")
      .tasks__table(v-if="isTasksShow")
        DataTable(
          :fields="fields1"
          :tableData="currentTasks"
          :bodyClass="currentTasks.length < 7 ? 'tbody_visible-overflow' : ''"
          :tableheadRowClass="currentTasks.length < 7 ? 'tbody_visible-overflow' : ''"
          bodyRowClass="steps-table-row"
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
            .tasks__data {{ row.source }}
          template(slot="ref" slot-scope="{ row, index }")
            .tasks__data {{ row.ref }}
          template(slot="icons" slot-scope="{ row, index }")
            .tasks__icons(v-if="canUpdateRequest")
              .tasks__icon(@click="editTasksData(row.taskId)")
                img(src="../../../assets/images/Other/edit-icon-qa.png")
              .tasks__icon(@click="deleteTask(row.taskId)")
                img(src="../../../assets/images/latest-version/delete-icon.png")


            .tasks__icons(v-else)
              .tasks__icon
                img(src="../../../assets/images/latest-version/lock.png")

      .tasks__table(v-if="isStepsShow")
        DataTable(
          :fields="fields2"
          :tableData="currentSteps"
          :bodyClass="currentSteps.length < 7 ? 'tbody_visible-overflow' : ''"
          :tableheadRowClass="currentSteps.length < 7 ? 'tbody_visible-overflow' : ''"
          bodyRowClass="steps-table-row"
        )
          template(v-for="field in fields2", :slot="field.headerKey", slot-scope="{ field }")
            .tasks__head-title {{ field.label }}

          template(slot="id" slot-scope="{ row, index }")
            .tasks__data {{ row.stepId }}
          template(slot="language" slot-scope="{ row, index }")
            .tasks__data {{ row.language }}
          template(slot="step" slot-scope="{ row, index }")
            .tasks__data {{ row.step }}
          template(slot="unit" slot-scope="{ row, index }")
            .tasks__data {{ row.unit }}
          template(slot="quantity" slot-scope="{ row, index }")
            .tasks__data {{ row.quantitySize }}
          template(slot="start" slot-scope="{ row, index }")
            .tasks__data {{ row.start }}
          template(slot="deadline" slot-scope="{ row, index }")
            .tasks__data {{ row.deadline }}

    .button(v-if="!isTaskData && currentTasks.length && canUpdateRequest")
      .button__convert
        Button(value="Convert into Project" @clicked="convertIntoProject")

</template>

<script>
	import RequestTasksData from "./tasks-n-steps/RequestTasksData"
	// import Tasks from "./tasks-n-steps/Tasks"
	// import Steps from "./tasks-n-steps/Steps"
	import { mapGetters, mapActions } from 'vuex'
	import ValidationErrors from "../../ValidationErrors"
	import Tabs from "../../Tabs"
	import DataTable from "../../DataTable"
	import moment from 'moment'
	import Button from "../../Button"
  import { getUser } from "../../../vuex/general/getters"

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
					delete: '../../../assets/images/latest-version/delete-icon.png',
					edit: '../../../assets/images/Other/edit-icon-qa.png'
				},
				errors: [],
				isTaskData: false,
				areErrorsExist: false,
				tabs: [ 'Tasks', 'Steps' ],
				isStepsShow: false,
				isTasksShow: true,
				isInfo: false,
				isEditData: false,
				selectedTab: 'Tasks',
				currentTaskId: '',
				currentTaskIdForUpdate: '',
				fields1: [
					{ label: "Task Id", headerKey: "headerId", key: "id", width: "20%", padding: 0 },
					{ label: "Language", headerKey: "headerLanguage", key: "language", width: "15%", padding: 0 },
					{ label: "Service", headerKey: "headerService", key: "service", width: "14%", padding: 0 },
					{ label: "Start", headerKey: "headerStart", key: "start", width: "13%", padding: 0 },
					{ label: "Deadline", headerKey: "headerDeadline", key: "deadline", width: "13%", padding: 0 },
					{ label: "# Source", headerKey: "headerSource", key: "source", width: "8%", padding: 0 },
					{ label: "# Ref.", headerKey: "headerRef", key: "ref", width: "8%", padding: 0 },
					{ label: "", headerKey: "headerIcons", key: "icons", width: "9%", padding: 0 }
				],

				fields2: [
					{ label: "Step Id", headerKey: "headerId", key: "id", width: "20%", padding: 0 },
					{ label: "Language", headerKey: "headerLanguage", key: "language", width: "15%", padding: 0 },
					{ label: "Step", headerKey: "headerStep", key: "step", width: "13%", padding: 0 },
					{ label: "Unit", headerKey: "headerUnit", key: "unit", width: "13%", padding: 0 },
					{ label: "Quantity / Size", headerKey: "headerSize", key: "quantity", width: "13%", padding: 0 },
					{ label: "Start", headerKey: "headerStart", key: "start", width: "13%", padding: 0 },
					{ label: "Deadline", headerKey: "headerDeadline", key: "deadline", width: "13%", padding: 0 }
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
			async convertIntoProject() {
				try {
					const projectId = await this.$http.post('/pm-manage/convert-request-into-project', { projectId: this.currentProject._id })
          this.$router.push(`/project-details/${ projectId.data }`);
				} catch (err) {
					this.alertToggle({ message: 'Error on converting project!', isShow: true, type: "error" })
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
			endOfSettingTaskData() {
				this.currentTaskId = ''
			},
			editTasksData(taskId) {
				this.isEditData = true
				this.currentTaskId = taskId
				this.currentTaskIdForUpdate = taskId
				this.isTaskData = true
			},
			closeErrorsBlock() {
				this.areErrorsExist = false
				this.errors = []
			},
			showErrors({ errors }) {
				this.errors = [ ...errors ]
				this.areErrorsExist = true
			},
			updateTasks(data) {
				// this.currentProject.tasks = data
			},
			setDefaultIsTaskData() {
				if (!this.currentProject.tasksAndSteps.length) {
					this.isTaskData = true
				}
			},
			toggleTaskData() {
				this.isTaskData = !this.isTaskData
				this.currentTaskId = ''
				this.currentTaskIdForUpdate = ''
				if (!this.isTaskData) {
					//TODO: чистить и выбраные таргет языки
					this.clearTasksDataRequest()
				}
			},
			setTab({ index }) {
				this.isTasksShow = index === 0
				this.isStepsShow = !this.isTasksShow
				this.selectedTab = this.tabs[index]
			},

			getDataForTasks(dataForTasks) {
				let tasksData = new FormData()

				if (dataForTasks.stepsAndUnits.find(item => item.template)) tasksData.append('template', dataForTasks.stepsAndUnits.find(item => item.template).template.id)
				tasksData.append('stepsAndUnits', JSON.stringify(dataForTasks.stepsAndUnits))
				tasksData.append('workflow', dataForTasks.workflow.id)
				tasksData.append('stepsDates', JSON.stringify(dataForTasks.stepsDates))
				tasksData.append('service', JSON.stringify(dataForTasks.service))
				tasksData.append('source', dataForTasks.source ? JSON.stringify(dataForTasks.source) : "")
				tasksData.append('targets', JSON.stringify(dataForTasks.targets))
				tasksData.append('requestId', this.currentProject._id)
				if (dataForTasks.refFilesVault) tasksData.append('refFilesVault', JSON.stringify(dataForTasks.refFilesVault))
				if (dataForTasks.refFilesVault) tasksData.append('sourceFilesVault', JSON.stringify(dataForTasks.sourceFilesVault))

				return tasksData
			},
			async addTasks(dataForTasks) {
				let tasksData = this.getDataForTasks(dataForTasks)
				const calculationUnit = [ ...new Set(dataForTasks.stepsAndUnits.map(item => item.unit)) ]
				const { sourceFiles, refFiles } = dataForTasks

				if (sourceFiles && sourceFiles.length) {
					this.translateFilesAmount = sourceFiles.length
					for (let file of sourceFiles) {
						tasksData.append('sourceFiles', file)
					}
				}
				if (refFiles && refFiles.length) {
					for (let file of refFiles) {
						tasksData.append('refFiles', file)
					}
				}

				for (const iterator of calculationUnit) {
					if (iterator === 'CAT Wordcount') {
						try {
							const memoqCreatorUser = await this.$http.get(`/memoqapi/user?userId=${ this.currentProject.projectManager._id }`)
							const { creatorUserId } = memoqCreatorUser.data
							if (!creatorUserId) throw new Error("No such user in memoq")
							tasksData.append('creatorUserId', creatorUserId)
							this.isInfo = true
						} catch (err) {
							this.alertToggle({ message: err.message, isShow: true, type: "error" })
						}
					}
				}

				if (calculationUnit.includes('CAT Wordcount')) {
					await this.saveProjectWordsTasks(tasksData)
				} else {
					await this.saveProjectTasks(tasksData)
				}
			},
			async saveProjectTasks(tasksData) {
				try {
					!!this.currentTaskIdForUpdate && tasksData.append('taskIdForUpdate', this.currentTaskIdForUpdate)

					const updatedProject = !!this.currentTaskIdForUpdate ?
							await this.$http.post('/pm-manage/update-request-tasks', tasksData) :
							await this.$http.post('/pm-manage/request-tasks', tasksData)

					await this.setCurrentClientRequest(updatedProject.data)
					this.isTaskData = false
					this.clearTasksDataRequest()
					!!this.currentTaskIdForUpdate && this.alertToggle({ message: 'Task updated!', isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: 'Error on creating/updating task', isShow: true, type: "error" })
				} finally {
					this.isInfo = false
					this.currentTaskId = ''
					this.currentTaskIdForUpdate = ''
				}
			},
			async saveProjectWordsTasks(tasksData) {
				// try {
				// 	await this.addProjectWordsTasks(tasksData)
				// 	this.isTaskData = false
				// 	this.clearTasksDataRequest()
				// } catch (err) {
				// 	this.alertToggle({ message: err.message, isShow: true, type: "error" })
				// } finally {
				// 	this.isInfo = false
				// }
			},
			getMetrics() {
				// this.$emit("getMetrics")
			}
		},
		computed: {
			...mapGetters({
				currentProject: 'getCurrentClientRequest',
				tasksData: "getTasksDataRequest",
        user: "getUser",
			}),
			currentTasks() {
				return this.currentProject.tasksAndSteps.map(({ taskId, taskData, refFiles, sourceFiles }) => {
					const { source, targets, service, stepsDates } = taskData

					let start, deadline
					if (stepsDates.length === 1) {
						[ start, deadline ] = Object.values(stepsDates[0])
					} else {
						start = stepsDates[0].start
						deadline = stepsDates[1].deadline
					}

					return {
						taskId,
						language: `${ source.symbol } >> ${ targets[0].symbol }`,
						service: service.title,
						start: moment(start).format('DD-MM-YYYY, HH:mm'),
						deadline: moment(deadline).format('DD-MM-YYYY, HH:mm'),
						source: sourceFiles.length,
						ref: refFiles.length
					}
				})
			},
			currentSteps() {
				let a = this.currentProject.tasksAndSteps.map(({ taskId, taskData, refFiles, sourceFiles }) => {
					let result = []
					const { source, targets, service, stepsDates, stepsAndUnits } = taskData
					for (let i = 0; i < stepsAndUnits.length; i++) {
						const item = stepsAndUnits[i]
						result.push({
							stepId: `${ taskId } S0${ i + 1 }`,
							language: `${ source.symbol } >> ${ targets[0].symbol }`,
							step: item.step,
							unit: item.unit,
							quantitySize: item.hasOwnProperty('hours') ? `${ item.hours } / ${ item.size }` : `${ item.quantity } / ${ item.size }`,
							start: moment(stepsDates[i].start).format('DD-MM-YYYY, HH:mm'),
							deadline: moment(stepsDates[i].deadline).format('DD-MM-YYYY, HH:mm')
						})
					}
					return result
				})
				return a.flat()
			},

			metricsButton() {
				// const wordsUnit = this.currentProject.tasks.find(item => item.service.calculationUnit === 'Words')
				// return !wordsUnit || this.currentProject.isMetricsExist ? "Refresh metrics" : "Get metrics"
			},
			isDisabled() {
				// const statuses = [ "Closed", "Cancelled" ]
				// return statuses.indexOf(this.currentProject.status) !== -1
			},
			isProjectFinished() {
				// const { status } = this.currentProject
				// return status === 'Closed' || status === 'Cancelled Halfway' || status === 'Cancelled'
			},
      canUpdateRequest() {
        return this.user.group.name === "Administrators"
            ||  this.user.group.name === "Developers"
            ||  this.currentProject.projectManager._id === this.user._id
      }
		},
		components: {
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
      padding-top: 10px;
    }
  }

  .tasks-steps {
    box-sizing: border-box;
    width: 1000px;
    padding: 20px;
    margin-top: 40px;
    box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
    position: relative;

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
      border: 1px solid $main-color;
      box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
    }

    &__file-counter {
      margin-top: 10px;
      text-align: center;
    }

    &__tasks-title {
      font-size: 21px;
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
      display: flex;
      align-items: center;
      padding-left: 5px;
      height: 30px;
    }

    &__icons {
      display: flex;
      justify-content: space-evenly;
      align-items: center;
      height: 31px;
    }

    &__icon {
      cursor: pointer;
    }
  }

</style>
