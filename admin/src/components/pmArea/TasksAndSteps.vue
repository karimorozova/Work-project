<template lang="pug">
  .tasks-steps
    transition(name="slide-fade")
      .tasks-steps__info(v-if="isInfo") {{ selectedInfoMessage }}
        .tasks-steps__file-counter(v-if="fileCounter") {{ fileCounter }} of {{ translateFilesAmount }}

    .tasks-steps__tasks-title(v-if="isProjectFinished" style="margin-bottom: 20px;") Tasks and Steps
    .tasks-steps__tasks-title(v-else) Tasks and Steps

      .tasks-steps__addTask(v-if="!isProjectFinished && !isTaskData" @click="toggleTaskData")
        i.fas.fa-plus-circle
      .tasks-steps__closeAddTask(v-if="!isProjectFinished && isTaskData" @click="toggleTaskData")
        i.fas.fa-times-circle

    transition(name="slide-fade")
      TasksData(
        v-if="isTaskData && !isFinishedStatus && originallyLanguages.length"
        :originallyLanguages="originallyLanguages"
        :originallyUnits="originallyUnits"
        :originallySteps="originallySteps"
        :originallyServices="originallyServices"
        @setValue="setValue"
        @showErrors="showErrors"
        @addTasks="addTasks"
        :isProject="isProject"
      )
        template(slot="errors")
          slot
    .tasks-steps__tables
      Tasks(v-if="currentProject.tasks.length && isTasksShow"
        :allTasks="this.currentProject.tasks"
        :originallyUnits="originallyUnits"
        :originallySteps="originallySteps"
        :originallyServices="originallyServices"
        @showTab="showTab"
        @updateTasks="updateTasks"
      )
      Steps(v-if="currentProject.steps.length && isStepsShow"
        :allSteps="currentProject.steps"
        :tasks="currentProject.tasks"
        :originallyLanguages="originallyLanguages"
        :originallyUnits="originallyUnits"
        @setVendor="setVendor"
        @setDate="setDate"
        @showTab="showTab"
      )
      Button(style="margin-top: 20px;" v-if="currentProject.tasks.length && !isProjectFinished" :value="metricsButton" :outline="true" @clicked="getMetrics" :isDisabled="isDisabled")
</template>

<script>
	import TasksData from "./tasks-n-steps/TasksData"
	import Button from "../Button"
	import Tasks from "./tasks-n-steps/Tasks"
	import Steps from "./tasks-n-steps/Steps"
	import { mapGetters, mapActions } from 'vuex'

	export default {
		props: {
			isFinishedStatus: { type: Boolean },
			originallyLanguages: {
				type: Array
			},
			originallyUnits: {
				type: Array
			},
			originallySteps: {
				type: Array
			},
			originallyServices: {
				type: Array
			}
		},
		data() {
			return {
				isTaskData: false,
				isStepsShow: false,
				isTasksShow: true,
				isInfo: false,
				translateFilesAmount: 0
			}
		},
		methods: {
			...mapActions([
				"alertToggle",
				"addProjectTasks",
				"addProjectWordsTasks",
				"clearTasksData",
				"getServices",
				'setCurrentProject'
			]),
			updateTasks(data) {
				this.currentProject.tasks = data
			},
			setDefaultIsTaskData() {
				if (this.currentProject && !this.currentProject.tasks.length) {
					this.isTaskData = true
				}
			},
			toggleTaskData() {
				this.isTaskData = !this.isTaskData
			},
			setValue({ option, prop }) {
				this[prop] = option
			},
			showTab({ tab }) {
				if (tab === 'Tasks') {
					this.isStepsShow = false
					this.isTasksShow = true
				} else {
					this.isStepsShow = true
					this.isTasksShow = false
				}
			},
			setVendor({ vendor, index }) {
				this.$emit("setVendor", { vendor, index })
			},
			setDate({ date, prop, stepId }) {
				this.$emit("setDate", { date, prop, stepId })
			},
			async refreshMetricsIfStepsWereNotCreated() {
				let ifNeedRefreshMetrics = false
				for (let task of this.currentProject.tasks) {
					if (!ifNeedRefreshMetrics) if (!this.currentProject.steps.map(({ taskId }) => taskId).includes(task.taskId)) ifNeedRefreshMetrics = true
				}
				if (ifNeedRefreshMetrics) {
					await this.$http.post('/memoqapi/metrics', { projectId: this.currentProject._id })
					// const updatedProject = await this.$http.get(`/pm-manage/costs?projectId=${ this.currentProject._id }`)
					// await this.setCurrentProject(updatedProject.body)
				}
			},
			getDataForTasks(dataForTasks) {
				let tasksData = new FormData()
				const source = dataForTasks.source ? JSON.stringify(dataForTasks.source) : ""

				tasksData.append('stepsAndUnits', JSON.stringify(dataForTasks.stepsAndUnits))
				tasksData.append('customerName', this.currentProject.customer.name)
				if (dataForTasks.stepsAndUnits.find(item => item.template)) {
					tasksData.append('template', dataForTasks.stepsAndUnits.find(item => item.template).template.id)
				}
				tasksData.append('workflow', dataForTasks.workflow.id)
				tasksData.append('stepsDates', JSON.stringify(dataForTasks.stepsDates))
				tasksData.append('service', JSON.stringify(dataForTasks.service))
				tasksData.append('source', source)
				tasksData.append('targets', JSON.stringify(dataForTasks.targets))
				tasksData.append('projectId', this.currentProject._id)
				// tasksData.append('projectName', `${ this.currentProject.projectId } - ${ this.currentProject.projectName }`)
				tasksData.append('internalProjectId', `${ this.currentProject.projectId }`)
				tasksData.append('nativeProjectName', `${ this.currentProject.projectName }`)
				tasksData.append('industry', this.currentProject.industry.name.replace('&', 'and'))
				tasksData.append('packageSize', dataForTasks.packageSize)
				tasksData.append('quantity', dataForTasks.quantity)
				tasksData.append('projectManager', this.currentProject.projectManager._id)
				return tasksData
			},
			async addTasks(dataForTasks) {
				await this.refreshMetricsIfStepsWereNotCreated()

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
					this.isTaskData = false
					await this.addProjectTasks(tasksData)
					this.clearTasksData()
				} catch (err) {
					this.alertToggle({ message: err.message, isShow: true, type: "error" })
				} finally {
					this.isInfo = false
				}
			},
			async saveProjectWordsTasks(tasksData) {
				try {
					this.isTaskData = false
					await this.addProjectWordsTasks(tasksData)
					this.clearTasksData()
				} catch (err) {
					this.alertToggle({ message: err.message, isShow: true, type: "error" })
				} finally {
					this.isInfo = false
				}
			},
			getMetrics() {
				this.$emit("getMetrics")
			},
			showErrors({ errors }) {
				this.$emit("showErrors", { errors })
			}
		},
		computed: {
			...mapGetters({
				// isShowTasksAndDeliverables: 'isShowTasksAndDeliverables',
				currentProject: 'getCurrentProject',
				selectedInfoMessage: 'getMemoqProjectMessage',
				fileCounter: 'getTranslateFileCounter'
			}),
			metricsButton() {
				const wordsUnit = this.currentProject.tasks.find(item => item.service.calculationUnit === 'Words')
				return !wordsUnit || this.currentProject.isMetricsExist ? "Refresh metrics" : "Get metrics"
			},
			isDisabled() {
				const statuses = [ "Closed", "Cancelled" ]
				return statuses.indexOf(this.currentProject.status) !== -1
			},
			isProjectFinished() {
				const { status } = this.currentProject
				return status === 'Closed' || status === 'Cancelled Halfway' || status === 'Cancelled'
			}
		},
		components: {
			TasksData,
			Button,
			Tasks,
			Steps
		},
		created() {
			this.getServices()
		},
		mounted() {
			this.setDefaultIsTaskData()
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors.scss";

  .tasks-steps {
    box-sizing: border-box;
    min-width: 1040px;
    width: 1040px;
    padding: 25px;
    margin-top: 40px;
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
      display: flex;
      position: absolute;
      z-index: 1000;
      color: $red;
      background-color: $white;
      padding: 20px;
      border-radius: 4px;
      top: 20%;
      margin-left: auto;
      margin-right: auto;
      left: 0;
      right: 0;
      width: fit-content;
      box-shadow: $box-shadow;
    }

    &__file-counter {
      margin-left: 7px;
      text-align: center;
    }

    &__tasks-title {
      font-size: 19px;
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

  .no-box-shadow {
    box-shadow: none;
  }

</style>
