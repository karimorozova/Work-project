<template lang="pug">
  .project-info(v-if="currentProject._id")

    .project-info__leftSide
      Project(:project="currentProject")

      NewTasksAndSteps()

        //ValidationErrors(v-if="areErrorsExist" :errors="errors" :isAbsolute="isBlockAbsoulte" @closeErrors="closeErrorsBlock")

      //.task-and-steps(v-if="originallyLanguages && originallyUnits && originallySteps && originallyServices")
      //  TasksAndSteps(
      //    :originallyLanguages="originallyLanguages"
      //    :originallyUnits="originallyUnits"
      //    :originallySteps="originallySteps"
      //    :originallyServices="originallyServices"
      //    :isFinishedStatus="isFinishedStatus"
      //    @getMetrics="getMetrics"
      //    @setVendor="setVendor"
      //    @setDate="setDate"
      //    @showErrors="showErrors"
      //  )
      //    ValidationErrors(v-if="areErrorsExist" :errors="errors" :isAbsolute="isBlockAbsoulte" @closeErrors="closeErrorsBlock")

      Deliverables(v-if="isStageDelivery")

    .project-info__rigthSide
      ImportProjectToXtrf(
        v-if="canSendToXtrf"
        :project="currentProject"
        @refreshProject="refreshProject"
      )
      ImportTasksToXtrf(
        v-else-if="canSendTaskToXtrf"
        :project="currentProject"
        @refreshProject="refreshProject"
      )
      ProjectSubInformation(:project="currentProject" @refreshProject="refreshProject")
      .project-info__action
        ProjectAction(
          :project="currentProject"
          @editAndSend="editAndSend"
          @setStatus="setStatus"
        )
      ProjectFinance

    .project-info__preview(v-if="isEditAndSend")
      Preview(@closePreview="closePreview" :message="message" @send="sendQuote")

</template>

<script>
	import ImportProjectToXtrf from "./ImportProjectToXtrf"

	const ValidationErrors = () => import("../ValidationErrors")
	import Project from "./Project"
	import ProjectAction from "./ProjectAction"
	import ProjectFinance from "./ProjectFinance"
	import TasksAndSteps from "./TasksAndSteps"
	import NewTasksAndSteps from "./NewTasksAndSteps"

	const Preview = () => import("./Preview")
	import { mapGetters, mapActions } from 'vuex'
	import ProjectSubInformation from './ProjectSubInformation'
	import Deliverables from './Deliverables'
	import ImportTasksToXtrf from "./ImportTasksToXtrf"

	export default {
		data() {
			return {
				// statuses: [ 'Accepted', 'Draft', 'Open', 'Ready' ],
				errors: [],
				// areErrorsExist: false,
				// isBlockAbsoulte: true,
				isEditAndSend: false,
				message: '',
				mailSubject: '',
				customer: null
			}
		},
		methods: {
			...mapActions([
				"setProjectProp",
				'setProjectStatus',
				'setCurrentProject',
				'setVendorsForProject',
				'alertToggle',
				'removeStepVendor',
				'setStepVendor',
				'setStepDate',
				'updateProgress',
				// 'updateCurrentProject',
				'sendClientQuote',
				'sendProjectDetails',
				'storeCurrentClient'
			]),
			async setVendor({ vendor, index }) {
				if (this.currentProject.steps[index].vendor &&
						this.currentProject.steps[index].vendor._id === vendor._id) {
					return
				}
				try {
					await this.setStepVendor({ vendor, index })
				} catch (err) {
				}
			},
			async setDate({ date, prop, stepId }) {
				try {
					let { steps, _id } = this.currentProject
					const _idx = steps.findIndex(item => item.stepId === stepId)

					steps[_idx][prop] = date
					if (prop === 'deadline' && _idx + 1 < steps.length && steps[_idx].taskId === steps[_idx + 1].taskId) {
						steps[_idx + 1].start = date
					}

					const { type } = this.originallyUnits
							.find(item => item._id.toString() === steps[_idx].serviceStep.unit)

					if (steps[_idx].status !== 'Completed' && steps[_idx].status !== 'Cancelled' && steps[_idx].status !== 'Cancelled Halfway') {

						const finalSteps = steps.reduce((acc, curr) => {
							delete curr.check
							acc.push(curr)
							return acc
						}, [])

						const updatedProject = await this.$http.post('/pm-manage/update-steps-dates', { projectId: _id, steps: finalSteps, step: finalSteps[_idx], stepId, type, prop })
						await this.setCurrentProject(updatedProject.data)
					}
				} catch (err) {
					this.alertToggle({ message: 'Error on Set Step Deadline', isShow: true, type: "error" })
				}
			},
			async setStatus({ option }) {
				try {
					await this.setProjectStatus({ id: this.$route.params.id, status: option })
					this.alertToggle({ message: "Project's status changed", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: err.message, isShow: true, type: "error" })
				}
			},

			wordsCalculation(metrics) {
				const repetitions = Object.keys(metrics)
						.filter(item => item !== "totalWords")
						.reduce((prev, cur) => {
							return prev + metrics[cur].value
						}, 0)

				const receivables = metrics.totalWords - metrics.nonTranslatable
				const payables = receivables - repetitions
				return { receivables, payables }
			},

			async updateProjectProgress() {
				const wordcountTasks = this.currentProject.tasks.filter(item => item.stepsAndUnits.map(i => i.unit).includes('CAT Wordcount'))
				try {
					wordcountTasks.length
							? await this.updateProgress({ projectId: this.currentProject._id, isCatTool: true })
							: await this.updateProgress({ projectId: this.currentProject._id, isCatTool: false })

					this.alertToggle({ message: "Project are updated.", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Project are updated.", isShow: true, type: "success" })
				}
			},

			async getMetrics() {
				try {
					if (this.currentProject.isMetricsExist) return await this.updateProjectProgress()

					await this.$http.post('/memoqapi/metrics', { projectId: this.currentProject._id })

					// const updatedProject = await this.$http.get(`/pm-manage/costs?projectId=${ this.currentProject._id }`)
					// await this.setCurrentProject(updatedProject.body)

					this.alertToggle({ message: "Metrics are received.", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Internal server error. Cannot get metrics.", isShow: true, type: "error" })
				}
			},
			async getVendorsForProject() {
				try {
					const result = await this.$http.get('/pm-manage/vendors-for-project')
					this.setVendorsForProject(result.data)
				} catch (err) {
					this.alertToggle({ message: "Internal service error. Cannot get Vendors.", isShow: true, type: "error" })
				}
			},
			async refreshCustomerInfo() {
				const client = await this.$http.get(`/clientsapi/client?id=${ this.currentProject.customer._id }`)
				this.storeCurrentClient(client.data)
				await this.setProjectProp({ prop: 'customer', value: client.body })
			},
			// showErrors({ errors }) {
			// 	this.errors = [ ...errors ]
			// 	this.areErrorsExist = true
			// },
			// closeErrorsBlock() {
			// 	this.areErrorsExist = false
			// 	this.errors = []
			// },
			editAndSend({ message, subject }) {
				this.isEditAndSend = true
				this.message = message.data.message
				this.mailSubject = subject
			},
			async sendQuote({ message }) {
				try {
					if (this.mailSubject === 'quote') {
						await this.sendClientQuote({ message })
					}
					if (this.mailSubject === 'details') {
						await this.sendProjectDetails({ message })
					}
					this.alertToggle({ message: "Details sent", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: err.message, isShow: true, type: "error" })
				}
				this.closePreview()
			},
			closePreview() {
				this.isEditAndSend = false
			},
			async getProject() {
				const { id } = this.$route.params
				try {
					if (!this.currentProject._id) {
						const curProject = await this.$http.get(`/pm-manage/project?id=${ id }`)
						this.customer = curProject.body.customer
						await this.setCurrentProject(curProject.body)
						await this.storeCurrentClient(curProject.body.customer)
					}
				} catch (err) {
				}
			},
			async refreshProject() {
				try {
					const { id } = this.$route.params
					const curProject = await this.$http.get(`/pm-manage/project?id=${ id }`)
					await this.setCurrentProject(curProject.data)
					this.alertToggle({ message: "Project updated", isShow: true, type: "success" })
				} catch (err) {
				}
			}
		},
		computed: {
			...mapGetters({
				currentProject: 'getCurrentProject',
				currentClient: 'getCurrentClient',
				originallyLanguages: 'getAllLanguages',
				originallySteps: 'getAllSteps',
				originallyServices: "getAllServices",
				originallyUnits: "getAllUnits"
			}),

			canSendToXtrf() {
				const { status, tasks } = this.currentProject

				const closedCheck = tasks.length && (
						tasks.every(({ service }) => service.title === 'Translation')
						|| tasks.every(({ service }) => service.title === 'TransCreation')
						|| (tasks.every(({ service }) => service.title === 'Copywriting') && tasks.length === 1)
						|| (tasks.every(({ service }) => service.title === 'Newsletter' || service.title === "SMS") && tasks.length === 2)
						|| tasks.every(({ service }) => service.title === 'Certified Translation')
						|| tasks.every(({ service }) => service.title === 'Translation Plain')
						|| tasks.every(({ service }) => service.title === 'Editing')
				)

				return closedCheck && (status === 'Closed' || status === 'In progress' || status === 'Approved')
			},
			canSendTaskToXtrf() {
				const { status, tasks } = this.currentProject

				const closedCheck = tasks.length && (
						tasks.every(({ service }) => service.title === 'Compliance')
				)

				return closedCheck && (status === 'Closed' || status === 'In progress' || status === 'Approved')
			},
			isStageDelivery() {
				return this.currentProject.tasks.some(({ status }) => status === 'Completed' || status === 'Pending Approval [DR1]')
			},
			isFinishedStatus() {
				const finishedStatuses = [ 'Delivered', 'Closed', 'Cancelled', 'Cancelled Halfway' ]
				return finishedStatuses.indexOf(this.currentProject.status) !== -1
			}
		},
		components: {
			ImportTasksToXtrf,
			ImportProjectToXtrf,
			ValidationErrors,
			Project,
			ProjectAction,
			TasksAndSteps,
			NewTasksAndSteps,
			ProjectFinance,
			Preview,
			ProjectSubInformation,
			Deliverables
		},
		async created() {
			await this.getProject()
			await this.getVendorsForProject()
		},
		beforeDestroy() {
			this.setCurrentProject({})
		},
		beforeRouteEnter(to, from, next) {
			next(async (vm) => {
				if (from.name === "client-info") {
					await vm.refreshCustomerInfo()
				}
			})
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors.scss";

  .project-info {
    position: relative;
    display: flex;
    margin: 50px;

    &__rigthSide {
      margin-left: 40px;
      padding-right: 40px;
    }

    &__preview {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      z-index: 100
    }

    &_bold {
      font-weight: bold;
    }
  }
</style>
