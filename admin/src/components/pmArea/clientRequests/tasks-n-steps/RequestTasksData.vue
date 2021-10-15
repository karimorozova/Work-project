<template lang="pug">
  .tasks-data(v-if="originallySteps && originallyServices && originallyUnits && currentProject._id && templates.length")
    .tasks-data__main
      .tasks-data__item
        RequestServiceAndWorkflow(
          :currentProject="currentProject"
          :originallyLanguages="originallyLanguages"
          :originallyUnits="originallyUnits"
          :originallySteps="originallySteps"
          :originallyServices="originallyServices"
          @setSourceLanguage="setSourceLang",
          @setTargets="setTargets",
          :templates="templates"
          :currentTaskId="currentTaskId"
        )

      .tasks-data__item
        .tasks-data__item-title Language Setting
        .tasks-data__langs
          span(v-if="isMonoService")
            RequestTasksLangs(
              :originallyLanguages="originallyLanguages"
              :targetLanguages="targetLanguages"
              @setSourceLanguage="setSourceLang",
              @setTargets="setTargets",
            )
          span(v-if="!isMonoService")
            RequestTasksLangsDuo(
              :originallyLanguages="originallyLanguages",
              :calculationUnit="currentUnit",
              :sourceLanguages="sourceLanguages",
              @setSourceLanguage="setSourceLang",
              @setTargets="setTargets",
              :setPossibleTargetsAction="setPossibleTargetsAction"
              :currentTaskId="currentTaskId"
              @endOfSettingTaskData="endOfSettingTaskData"
            )

        .tasks-data__services
          .tasks-data__service-steps(v-if="countCATWordcount === 2")
            RequestJobSettings(
              :tasksDataProp="tasksData",
              v-for="(step, index) in [sortedJobs[0]]",
              :currentJob="step",
              :currentIndex="index"
              :templates="templates"
              :originallyUnits="originallyUnits"
            )

          .tasks-data__service-steps(v-else)
            RequestJobSettings(
              :tasksDataProp="tasksData",
              v-for="(step, index) in sortedJobs",
              :currentJob="step",
              :currentIndex="index"
              :templates="templates"
              :originallyUnits="originallyUnits"
            )

    .tasks-data__filesOptions
      .tasks-data__filesOptions-title File Preparation
      .tasks-data__files
        RequestTasksFiles(
          :tasksData="tasksData"
          :currentProject="currentProject"
          :currentTaskIdForUpdate="currentTaskIdForUpdate"
        )

    .tasks-data__add-tasks
      Button(:value="!!currentTaskIdForUpdate ? 'Update Tasks' : 'Add Tasks' ", @clicked="checkForErrors")

</template>

<script>
	import RequestServiceAndWorkflow from "./RequestServiceAndWorkflow"
	import { mapGetters, mapActions } from "vuex"
	import RequestTasksLangs from "./RequestTasksLangs"
	import RequestTasksLangsDuo from "./RequestTasksLangsDuo"
	import RequestJobSettings from "./RequestJobSettings"
	import RequestTasksFiles from "./RequestTasksFiles"
	import Button from "../../../Button"

	export default {
		props: {
			currentTaskIdForUpdate: { type: String },
			currentTaskId: { type: String },
			originallyLanguages: { type: Array },
			originallyUnits: { type: Array },
			originallySteps: { type: Array },
			originallyServices: { type: Array }
		},
		data() {
			return {
				templates: [],
				sourceLanguages: [],
				targetLanguages: [],
				errors: [],
				setPossibleTargetsAction: false
			}
		},
		methods: {
			...mapActions([ "alertToggle", "setTasksDataValueRequest", "setRequestValue", "setCurrentClientRequest" ]),
			endOfSettingTaskData() {
				this.$emit('endOfSettingTaskData')
			},
			setSourceLang({ symbol }) {
				const language = this.originallyLanguages.find((item) => item.symbol === symbol)
				this.setTasksDataValueRequest({ prop: "source", value: language })
				this.sourceLanguages = [ language.symbol ]
				if (!this.isMonoService) this.setTargets({ "targets": [] })
				this.setPossibleTargetsAction = true
				setTimeout(() => {
					this.setPossibleTargetsAction = false
				}, 1000)
			},
			setTargets({ targets }) {
				this.setTasksDataValueRequest({ prop: "targets", value: targets })
				this.targetLanguages = [ ...targets ]
			},
			async checkForErrors() {
				this.errors = []
				const {
					source,
					targets,
					sourceFiles,
					refFiles,
					workflow,
					stepsDates,
					stepsAndUnits,
					sourceFilesVault
				} = this.tasksData

				if (workflow.id === 2917) {
					if (stepsDates[0].deadline === "" || stepsDates[1].start === "") this.errors.push("Please, select tasks deadline.")
				}

				if (!this.isMonoService && !source) this.errors.push("Please, select Source language.")
				if (stepsAndUnits == null) this.errors.push("Please, select Unit.")
				if (!targets || !targets.length) this.errors.push("Please, select Target language(s).")

				if (this.currentUnit === "CAT Wordcount") {
					if (this.currentTaskIdForUpdate) {
						const taskData = this.currentProject.tasksAndSteps.find(({ taskId }) => taskId === this.currentTaskIdForUpdate)
						if (!taskData.sourceFiles.length) {
							if ((!sourceFilesVault || !sourceFilesVault.length) && (!sourceFiles || !sourceFiles.length)) this.errors.push("Please, upload Source file(s).")
						}
					} else {
						if ((!sourceFilesVault || !sourceFilesVault.length) && (!sourceFiles || !sourceFiles.length)) this.errors.push("Please, upload Source file(s).")
					}
				}

				if (this.isDeadlineMissed()) this.errors.push("Please, update deadline (Project's or tasks).")

				if ((refFiles && refFiles.length) && (sourceFiles && sourceFiles.length)) {
					if (new Set([ ...sourceFiles, ...refFiles ].map(({ name }) => name)).size !== [ ...sourceFiles, ...refFiles ].length) this.errors.push("Reference file cannot be the same as Source.")
				}

				const isUnitCAT = stepsAndUnits.map(i => i.unit).includes("CAT Wordcount")
				const isStepLanguageOnTargetLanguage = targets.map((i) => i.lang).includes(source.lang)
				if (isUnitCAT && isStepLanguageOnTargetLanguage) this.errors.push('Target and Source Languages cannot be a same if a unit "CAT Wordcount" is selected')

				if (this.countCATWordcount >= 1) {
					if (!Object.keys(stepsAndUnits.find(item => item.hasOwnProperty('template')).template).length) this.errors.push("Please, select Template.")
				} else {
					if (workflow.id === 2917) {
						const [ elem1, elem2 ] = stepsAndUnits
						this.checkUnitQuantity(elem1)
						this.checkUnitQuantity(elem2)
						this.checkUnitSize(elem1)
						this.checkUnitSize(elem2)
					} else {
						const [ elem1 ] = stepsAndUnits
						this.checkUnitQuantity(elem1)
						this.checkUnitSize(elem1)
					}
				}

				if (this.errors.length) {
					return this.$emit("showErrors", { errors: this.errors })
				}
				try {
					await this.addTasks()
				} catch (err) {
					this.alertToggle({ message: "Error on adding tasks", isShow: true, type: "error" })
				}
			},
			checkUnitSize(elem) {
				if (!elem.size) this.errors.push("Please, select step size.")
			},
			checkUnitQuantity(elem) {
				if (!elem.hours && !elem.quantity) this.errors.push("Please, select unit quantity.")
			},
			isDeadlineMissed() {
				let now = new Date().getTime()
				if (new Date(this.currentProject.deadline).getTime() <= now) return true
				let deadlines = this.tasksData.stepsDates.map(i => i.deadline)
				if (deadlines.filter(i => !i).length) return true

				for (let time of deadlines) {
					if (new Date(time).getTime() <= now) {
						return true
					}
				}
			},
			async addTasks() {
				this.$emit("addTasks", {
					...this.tasksData,
					refFiles: this.tasksData.refFiles || [],
					sourceFiles: this.tasksData.sourceFiles || []
				})
			},
			async getMemoqTemplates() {
				try {
					const result = await this.$http.get("/memoqapi/templates")
					this.templates = result.data
				} catch (err) {
				}
			}
		},
		computed: {
			...mapGetters({
				currentProject: "getCurrentClientRequest",
				languages: "getAllLanguages",
				tasksData: "getTasksDataRequest"
			}),
			countCATWordcount() {
				if (this.tasksData.stepsAndUnits) {
					return this.tasksData.stepsAndUnits.filter(item => item.unit === "CAT Wordcount").length
				}
			},
			sortedJobs() {
				if (this.tasksData.stepsAndUnits) return this.tasksData.stepsAndUnits.sort((a, b) => a.stepCounter - b.stepCounter)
			},
			isMonoService() {
				return this.tasksData.service
						? this.tasksData.service.languageForm === "Mono"
						: false
			},
			currentUnit() {
				if (this.tasksData.stepsAndUnits) {
					return this.tasksData.stepsAndUnits.find(item => item.unit === "CAT Wordcount") ? this.tasksData.stepsAndUnits.find(item => item.unit === "CAT Wordcount").unit : ""
				}
			},
			areAllFilesApproved() {
				// const allFiles = [
				// 	...this.currentProject.sourceFiles,
				// 	...this.currentProject.refFiles
				// ]
				// const isNotApproved =
				// 		!allFiles.length || allFiles.find((item) => !item.isApproved)
				// return !isNotApproved
			},
			isAddTasksDisabled() {
				// return (
				// 		!this.currentProject.isDeadlineApproved ||
				// 		!this.currentProject.isBriefApproved ||
				// 		!this.areAllFilesApproved
				// )
			}
		},
		components: {
			Button,
			RequestTasksFiles,
			RequestJobSettings,
			RequestTasksLangsDuo,
			RequestTasksLangs,
			// DataTable,
			// TasksFiles,
			// TasksFilesRequested,
			// JobSettings,
			// SelectSingle,
			RequestServiceAndWorkflow
		},
		async created() {
			await this.getMemoqTemplates()
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../../assets/scss/colors.scss";

  .tasks-data {
    position: relative;

    &__files {
      padding: 0 10px 20px;
    }

    &__filesOptions {
      margin-top: 20px;
      border: 2px solid $border;
      border-radius: 4px;

      &-title {
        font-size: 16px;
        font-family: Myriad600;
        padding: 25px 10px 10px;
      }
    }

    &__workflow-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 50px;
    }

    &__toggler-title {
      font-size: 14px;
      margin-right: 15px;
    }

    &__main {
      display: flex;
      justify-content: space-between;
    }

    &__item {
      width: 470px;
      border: 2px solid $border;
      border-radius: 4px;
      box-sizing: border-box;
      padding-bottom: 25px;

      &-title {
        font-size: 16px;
        font-family: Myriad600;
        padding: 25px 9px 10px;
      }
    }

    &__drops {
      margin-bottom: 40px;
      width: 100%;
      display: flex;
      justify-content: space-between;
      padding-bottom: 25px;
    }

    &__drop-menu {
      position: relative;
      width: 50%;
      height: 50px;
    }

    &__menu-title {
      font-size: 14px;
    }

    &__add-tasks {
      display: flex;
      justify-content: center;
      padding-top: 20px;
    }

    &__buttons {
      display: flex;
      justify-content: center;
      margin-top: 20px;
    }

    &__button {
      margin: 0 20px;
    }

    &_m-bottom-40 {
      margin-bottom: 40px;
    }
  }
</style>
