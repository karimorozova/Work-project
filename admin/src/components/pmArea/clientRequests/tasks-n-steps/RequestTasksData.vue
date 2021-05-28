<template lang="pug">
  .tasks-data
    .tasks-data__main
      //.tasks-data__item(v-if="originallySteps && originallyServices && originallyUnits && templates.length")
      .tasks-data__item(v-if="currentProject._id")
        RequestServiceAndWorkflow(
          :currentProject="currentProject"
          :originallyLanguages="originallyLanguages"
          :originallyUnits="originallyUnits"
          :originallySteps="originallySteps"
          :originallyServices="originallyServices"
          @setSourceLanguage="setSourceLang",
          @setTargets="setTargets",
          :templates="templates"
        )

      .tasks-data__item
        .tasks-data__item-title Job Settings
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
        )

    .tasks-data__add-tasks
      Button(value="Add tasks", @clicked="checkForErrors")

</template>

<script>
	// import TasksFiles from "./TasksFiles"
	// import TasksFilesRequested from "./TasksFilesRequested"
	// import JobSettings from "./JobSettings"
	// import SelectSingle from "../../../SelectSingle"
	import RequestServiceAndWorkflow from "./RequestServiceAndWorkflow"
	// import BigToggler from "@/components/BigToggler"
	import { mapGetters, mapActions } from "vuex"
	import RequestTasksLangs from "./RequestTasksLangs"
	import RequestTasksLangsDuo from "./RequestTasksLangsDuo"
	import RequestJobSettings from "./RequestJobSettings"
	import RequestTasksFiles from "./RequestTasksFiles"
	import Button from "../../../Button"
	// import DataTable from "../../../DataTable"

	export default {
		props: {
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
				// errors: [],
				setPossibleTargetsAction: false
			}
		},
		methods: {
			...mapActions([ "alertToggle", "setTasksDataValueRequest", "setRequestValue", "setCurrentClientRequest" ]),

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
			isRefFilesHasSource() {
				// const { sourceFiles, refFiles } = this.tasksData
				// if (!refFiles || !refFiles.length) return false
				// for (let file of refFiles) {
				// 	const sourceFile = sourceFiles.find((item) => item.name === file.name)
				// 	if (sourceFile) return true
				// }
				// return false
			},
			isValidQuantity(quantity) {
				// if (!quantity) {
				// 	return false
				// }
				// return /^[1-9]{1,}(\d{1,})?/.test(quantity)
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
					stepsAndUnits
				} = this.tasksData

				if (workflow.id === 2917) {
					if (stepsDates[0].deadline === "" || stepsDates[1].start === "") this.errors.push("Please, select tasks deadline.")
				}
				if (!this.isMonoService && !source) this.errors.push("Please, select Source language.")
				if (stepsAndUnits == null) this.errors.push("Please, select Unit.")
				if (!targets || !targets.length) this.errors.push("Please, select Target language(s).")
				this.checkFiles(sourceFiles, refFiles)
				if (this.isDeadlineMissed()) this.errors.push("Please, update deadline (Project's or tasks).")

				const isUnitCAT = stepsAndUnits.map((i) => i.unit).includes("CAT Wordcount")

				const isStepLanguageOnTargetLanguage = targets.map((i) => i.lang).includes(source.lang)

				if (isUnitCAT && isStepLanguageOnTargetLanguage) this.errors.push('Target and Source Languages cannot be a same if a unit "CAT Wordcount" is selected')

				if (this.countCATWordcount >= 1) {
					let isCATWordcount = []
					stepsAndUnits.forEach((element) => {
						isCATWordcount.push(element.hasOwnProperty("template"))
					})
					if (!isCATWordcount.includes(true)) {
						this.errors.push("Please, select Template.")
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
			checkRequestFies() {
				// const { sourceFiles, refFiles } = this.currentProject
				//
				// if (this.currentUnit === "CAT Wordcount" && !sourceFiles.length)
				// 	this.errors.push("Please, upload Source file(s).")
				//
				// reference file is not mandatory!
				// if (this.currentUnit !== "CAT Wordcount" && !refFiles.length)
				//   this.errors.push("Please, upload Reference file(s).");
			},
			checkFiles(sourceFiles, refFiles) {
          if (this.currentUnit === "CAT Wordcount") {
            if (!sourceFiles || !sourceFiles.length) this.errors.push("Please, upload Source file(s).")
            //REF FILES SAME AS SOURCE!
            if (sourceFiles && sourceFiles.length && this.isRefFilesHasSource()) this.errors.push("Reference file cannot be the same as Source!");
          }

			},
			// checkHoursSteps() {
			//     if(this.currentUnit === 'Hours') {
			//         const steps = [...this.tasksData.service.steps];
			//         const length = +this.tasksData.workflow.name.split(" ")[0];
			//         for(let i = 0; i < length; i++) {
			//             if(!this.tasksData[`${steps[i].step.symbol}-quantity`]
			//              || !this.tasksData[`${steps[i].step.symbol}-hours`]) {
			//                 this.errors.push("Please, set Hours and Quantity for all service steps.");
			//                 return;
			//             }
			//         }
			//     }
			// },
			async assignManager() {
				// await this.setRequestValue({
				// 	id: this.currentProject._id,
				// 	prop: "isAssigned",
				// 	value: !this.currentProject.isAssigned,
				// 	isEmail: true
				// })
			},
			async addTasks() {
				this.$emit("addTasks", { ...this.tasksData, refFiles: this.tasksData.refFiles || [], })
				// this.clearInputFiles(".tasks-data__source-file")
				// this.clearInputFiles(".tasks-data__ref-file")
			},
			clearInputFiles(str) {
				// let inputFiles = document.querySelectorAll(str)
				// for (let elem of inputFiles) {
				// 	elem.value = ""
				// }
			},
			setServiceForm() {
				// this.isMonoService = this.tasksData.service.languageForm === "Mono"
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
				// if (this.tasksData.stepsAndUnits) {
				// 	return this.tasksData.stepsAndUnits.filter(
				// 			(item) => item.unit === "CAT Wordcount"
				// 	).length
				// }
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
					return this.tasksData.stepsAndUnits.find((item) => item.unit === "CAT Wordcount") ? this.tasksData.stepsAndUnits.find((item) => item.unit === "CAT Wordcount").unit : ""
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
			// BigToggler
		},
		async created() {
			// console.log({ testcreated: this.currentProject.customer })
			// if (!this.currentProject.customer) {
			// 	const curClientRequest = await this.$http.post(`/clients-requests/by-id/${ id }`)
			// 	this.setCurrentClientRequest(curClientRequest.data)
			// }
			await this.getMemoqTemplates()
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../../assets/scss/colors.scss";

  .tasks-data {
    position: relative;

    &__filesOptions {
      margin-top: 20px;
      border: 2px solid #938676;
      padding: 20px 15px;
      border-radius: 10px;

      &-title {
        font-size: 18px;
        margin-bottom: 20px;
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
      padding: 20px 15px;
      width: 49%;
      border: 2px solid #938676;
      border-radius: 2px;
      box-sizing: border-box;
      border-radius: 10px;

      &-title {
        font-size: 18px;
        margin-bottom: 20px;
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
