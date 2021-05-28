<template lang="pug">
  .tasks-steps
    .tasks-steps__tasks-title Tasks and Steps
      img.tasks-steps__arrow(src="../../../assets/images/open-close-arrow-brown.png" @click="toggleTaskData" :class="{'tasks-steps_rotate': isTaskData }")
    transition(name="slide-fade")
      div
        RequestTasksData(
          v-if="isTaskData"
          :originallyLanguages="originallyLanguages"
          :originallyUnits="originallyUnits"
          :originallySteps="originallySteps"
          :originallyServices="originallyServices"
          @setValue="setValue"
          @addTasks="addTasks"
          @showErrors="showErrors"
        )
        ValidationErrors(v-if="areErrorsExist" :errors="errors" :isAbsolute="true" @closeErrors="closeErrorsBlock")
    //.tasks-steps__tables
    //  Tasks(v-if="currentProject.tasks.length && isTasksShow"
    //    :allTasks="this.currentProject.tasks"
    //    :originallyUnits="originallyUnits"
    //    :originallySteps="originallySteps"
    //    :originallyServices="originallyServices"
    //    @showTab="showTab"
    //    @updateTasks="updateTasks"
    //  )
    //  Steps(v-if="currentProject.steps.length && isStepsShow"
    //    :allSteps="currentProject.steps"
    //    :tasks="currentProject.tasks"
    //    :originallyLanguages="originallyLanguages"
    //    :originallyUnits="originallyUnits"
    //    @setVendor="setVendor"
    //    @setDate="setDate"
    //    @showTab="showTab"
    //  )
    //  Button(v-if="currentProject.tasks.length && !isProjectFinished" :value="metricsButton" @clicked="getMetrics" :isDisabled="isDisabled")
</template>

<script>
	import RequestTasksData from "./tasks-n-steps/RequestTasksData"
	// import Button from "../../Button"
	// import Tasks from "./tasks-n-steps/Tasks"
	// import Steps from "./tasks-n-steps/Steps"
	import { mapGetters, mapActions } from 'vuex'
	import ValidationErrors from "../../ValidationErrors"

	export default {
		props: {
			originallyLanguages: { type: Array },
			originallyUnits: { type: Array },
			originallySteps: { type: Array },
			originallyServices: { type: Array }
		},
		data() {
			return {
				errors: [],
				isTaskData: false,
				areErrorsExist: false,
				// isStepsShow: false,
				// isTasksShow: true,
				isInfo: false
				// translateFilesAmount: 0
			}
		},
		methods: {
			...mapActions([
				"alertToggle",
				"addProjectTasks",
				"addProjectWordsTasks",
				"clearTasksData",
				'setCurrentProject'
			]),
			closeErrorsBlock() {
				this.areErrorsExist = false;
				this.errors = [];
			},
			showErrors({ errors }) {
				this.errors = [...errors];
				this.areErrorsExist = true;
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
			},
			setValue({ option, prop }) {
				// this[prop] = option
			},
			showTab({ tab }) {
				// if (tab === 'Tasks') {
				// 	this.isStepsShow = false
				// 	this.isTasksShow = true
				// } else {
				// 	this.isStepsShow = true
				// 	this.isTasksShow = false
				// }
			},
			setVendor({ vendor, index }) {
				// this.$emit("setVendor", { vendor, index })
			},
			setDate({ date, prop, index }) {
				// this.$emit("setDate", { date, prop, index })
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
				tasksData.append('projectName', `${ this.currentProject.projectId } - ${ this.currentProject.projectName }`)
				tasksData.append('industry', this.currentProject.industry.name.replace('&', 'and'))
				tasksData.append('packageSize', dataForTasks.packageSize)
				tasksData.append('quantity', dataForTasks.quantity)
				tasksData.append('projectManager', this.currentProject.projectManager._id)
				return tasksData
			},
			async addTasks(dataForTasks) {
				console.log('dataForTasks', dataForTasks)

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
				// try {
				// 	await this.addProjectTasks(tasksData)
				// 	this.isTaskData = false
				// 	this.clearTasksData()
				// } catch (err) {
				// 	this.alertToggle({ message: err.message, isShow: true, type: "error" })
				// } finally {
				// 	this.isInfo = false
				// }
			},
			async saveProjectWordsTasks(tasksData) {
				// try {
				// 	await this.addProjectWordsTasks(tasksData)
				// 	this.isTaskData = false
				// 	this.clearTasksData()
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
				// isShowTasksAndDeliverables: 'isShowTasksAndDeliverables',
				currentProject: 'getCurrentClientRequest'
			}),
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
			}
		},
		components: {
			ValidationErrors,
			RequestTasksData
			// Button,
			// Tasks,
			// Steps
		},
		created() {
			// this.getServices()
		},
		mounted() {
			this.setDefaultIsTaskData()
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

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
