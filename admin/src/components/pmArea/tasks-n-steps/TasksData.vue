<template lang="pug">
  .tasks-data
    .tasks-data__main
      .tasks-data__item(v-if="originallySteps && originallyServices && originallyUnits && templates.length")
        ServiceAndWorkflow(
          :originallyLanguages="originallyLanguages"
          @setSourceLanguage="setSourceLang",
          @setTargets="setTargets",
          :originallyUnits="originallyUnits"
          :originallySteps="originallySteps"
          :originallyServices="originallyServices"
          :templates="templates"
        )

      .tasks-data__item(v-if="originallySteps && originallyServices && originallyUnits && templates.length")
        .tasks-data__item-title Job Settings
        .tasks-data__langs(v-if="originallyLanguages.length")
          span(v-if="isMonoService")
            TasksLangs(
              :originallyLanguages="originallyLanguages"
              :targetLanguages="targetLanguages"
              @setSourceLanguage="setSourceLang",
              @setTargets="setTargets",
            )
          span(v-if="!isMonoService")
            TasksLangsDuo(
              :originallyLanguages="originallyLanguages",
              :calculationUnit="currentUnit",
              :sourceLanguages="sourceLanguages",
              @setSourceLanguage="setSourceLang",
              @setTargets="setTargets",
              :isRequest="isRequest"
              :setPossibleTargetsAction="setPossibleTargetsAction"
            )

        .tasks-data__services
          .tasks-data__service-steps(v-if="countCATWordcount === 2")
            div(v-if="tasksData.hasOwnProperty('stepsAndUnits') && templates.length && originallyUnits.length")
              JobSettings(
                :tasksDataProp="tasksData",
                v-for="(step, index) in [sortedJobs[0]]",
                :currentJob="step",
                :currentIndex="index"
                :templates="templates"
                :originallyUnits="originallyUnits"
              )

          .tasks-data__service-steps(v-else)
            div(v-if="tasksData.hasOwnProperty('stepsAndUnits') && templates.length && originallyUnits.length")
              JobSettings(
                :tasksDataProp="tasksData",
                v-for="(step, index) in sortedJobs",
                :currentJob="step",
                :currentIndex="index"
                :templates="templates"
                :originallyUnits="originallyUnits"
              )

    .tasks-data__filesOptions(v-if="originallySteps && originallyServices && originallyUnits && templates.length")
      .tasks-data__filesOptions-title File Preparation
      .tasks-data__files(v-if="currentProject.status !== 'Requested'")
        TasksFiles(:tasksData="tasksData")

    span(v-if="originallySteps && originallyServices && originallyUnits && templates.length")
      .tasks-data__add-tasks(v-if="isProject && isButton")
        Button(value="Add tasks", @clicked="checkForErrors")

    .tasks-data__buttons(v-if="isRequest && isButton")
      .tasks-data__button
        Button(:value="currentProject.isAssigned ? 'Assign to AM' : 'Assign to PM'", @clicked="assignManager")
      .tasks-data__button
        Button(value="Add tasks", @clicked="checkForErrors", :isDisabled="isAddTasksDisabled")

    slot(name="errors")
</template>

<script>
	import TasksLangs from "./TasksLangs"
	import TasksLangsDuo from "./TasksLangsDuo"
	import TasksFiles from "./TasksFiles"
	import JobSettings from "./JobSettings"
	import SelectSingle from "../../SelectSingle"
	import ServiceAndWorkflow from "./ServiceAndWorkflow"
	import Button from "../../Button"
	import BigToggler from "@/components/BigToggler"
	import { mapGetters, mapActions } from "vuex"
	import DataTable from "../../DataTable"

	export default {
		props: {
			isRequest: {
				type: Boolean
			},
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
				templates: [],
				sourceLanguages: [],
				targetLanguages: [],
				errors: [],
				setPossibleTargetsAction: false
			}
		},
		methods: {
			...mapActions([ "alertToggle", "setTasksDataValue", "setRequestValue" ]),

			setSourceLang({ symbol }) {
				const language = this.originallyLanguages.find((item) => item.symbol === symbol)
				this.setTasksDataValue({ prop: "source", value: language })
				this.sourceLanguages = [ language.symbol ]
				if (!this.isMonoService) this.setTargets({ "targets": [] })
				this.setPossibleTargetsAction = true
				setTimeout(() => {
					this.setPossibleTargetsAction = false
				}, 1000)
			},
			setTargets({ targets }) {
				this.setTasksDataValue({ prop: "targets", value: targets })
				this.targetLanguages = [ ...targets ]
			},
			isRefFilesHasSource() {
				const { sourceFiles, refFiles } = this.tasksData
				if (!refFiles || !refFiles.length) return false
				for (let file of refFiles) {
					const sourceFile = sourceFiles.find((item) => item.name === file.name)
					if (sourceFile) return true
				}
				return false
			},
			isValidQuantity(quantity) {
				if (!quantity) {
					return false
				}
				return /^[1-9]{1,}(\d{1,})?/.test(quantity)
			},
			checkRequestErrors() {
				let errors = []
				if (!this.currentProject.industry)
					errors.push("Please, select industry.")
				if (!this.currentProject.projectName)
					errors.push("Please, enter project name.")
				return errors
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

				if (this.isRequest) {
					this.errors = this.checkRequestErrors()
				}
				if (workflow.id === 2917) {
					if (stepsDates[0].deadline === "" || stepsDates[1].start === "") this.errors.push("Please, select tasks deadline.")
				}

				if (!this.isMonoService && !source) this.errors.push("Please, select Source language.")
				if (stepsAndUnits == null) this.errors.push("Please, select Unit.")
				if (!targets || !targets.length) this.errors.push("Please, select Target language(s).")
				this.checkFiles(sourceFiles, refFiles)
				if (this.isDeadlineMissed()) this.errors.push("Please, update deadline (Project's or tasks).")

        if(refFiles.length && sourceFiles.length) {
          if (new Set( [...sourceFiles, ...refFiles].map(({name})=> name)).size !==  [...sourceFiles, ...refFiles].length) this.errors.push("Please, do not select the same files.")
        }

				const isUnitCAT = stepsAndUnits.map((i) => i.unit).includes("CAT Wordcount")
				const isStepLanguageOnTargetLanguage = targets.map((i) => i.lang).includes(source.lang)

				if (isUnitCAT && isStepLanguageOnTargetLanguage) this.errors.push('Target and Source Languages cannot be a same if a unit "CAT Wordcount" is selected')


				if (this.countCATWordcount >= 1) {
					let isCATWordcount = []
					stepsAndUnits.forEach((element) => {
						isCATWordcount.push(element.hasOwnProperty("template"))
					})
					if (!isCATWordcount.includes(true)) this.errors.push("Please, select Template.")
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

				if (this.errors.length) return this.$emit("showErrors", { errors: this.errors })

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

				if (new Date(this.currentProject.deadline).getTime() <= now) {
					return true
				}

				let deadlines = this.tasksData.stepsDates.map(i => i.deadline)

				if (deadlines.filter(i => !i).length) {
					return true
				}

				for (let time of deadlines) {
					if (new Date(time).getTime() <= now) {
						return true
					}
				}
			},
			checkFiles(sourceFiles, refFiles) {
				if (this.currentUnit === "CAT Wordcount") {
					if (!sourceFiles || !sourceFiles.length)
						this.errors.push("Please, upload Source file(s).")
					//REF FILES SAME AS SOURCE!
					//   if (sourceFiles && sourceFiles.length && this.isRefFilesHasSource())
					//     this.errors.push("Reference file cannot be the same as Source!");
					// } else {
					//
					// }
					//reference file is not mandatory!
					// if (!refFiles || !refFiles.length) {
					//   this.errors.push("Please, upload Reference file(s).");
					// }
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
				await this.setRequestValue({
					id: this.currentProject._id,
					prop: "isAssigned",
					value: !this.currentProject.isAssigned,
					isEmail: true
				})
			},
			async addTasks() {
				const source = this.tasksData.source || this.languages.find((item) => item.symbol === "EN-GB")
				this.$emit("addTasks", {
					...this.tasksData,
					refFiles: this.tasksData.refFiles || [],
					source
				})
				this.clearInputFiles(".tasks-data__source-file")
				this.clearInputFiles(".tasks-data__ref-file")
			},
			clearInputFiles(str) {
				let inputFiles = document.querySelectorAll(str)
				for (let elem of inputFiles) {
					elem.value = ""
				}
			},
			setServiceForm() {
				this.isMonoService = this.tasksData.service.languageForm === "Mono"
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
				currentProject: "getCurrentProject",
				languages: "getAllLanguages",
				tasksData: "getTasksData"
			}),
			countCATWordcount() {
				if (this.tasksData.stepsAndUnits) {
					return this.tasksData.stepsAndUnits.filter(
							(item) => item.unit === "CAT Wordcount"
					).length
				}
			},
			sortedJobs() {
				if (this.tasksData.stepsAndUnits) {
					return this.tasksData.stepsAndUnits.sort(
							(a, b) => a.stepCounter - b.stepCounter
					)
				}
			},
			isMonoService() {
				if (this.currentProject.status === "Requested") {
					return this.currentProject.service.languageForm === "Mono"
				}
				return this.tasksData.service
						? this.tasksData.service.languageForm === "Mono"
						: false
			},
			isProject() {
				return (
						this.currentProject.status && this.currentProject.status !== "Requested"
				)
			},
			isButton() {
				const forbiddenStatuses = [ "Cancelled", "Cancelled Halfway", "Closed" ]
				return forbiddenStatuses.indexOf(this.currentProject.status) === -1
			},
			currentUnit() {
				if (this.tasksData.stepsAndUnits) {
					return this.tasksData.stepsAndUnits.find(
							(item) => item.unit === "CAT Wordcount"
					)
							? this.tasksData.stepsAndUnits.find(
									(item) => item.unit === "CAT Wordcount"
							).unit
							: ""
				}
			},
			areAllFilesApproved() {
				const allFiles = [
					...this.currentProject.sourceFiles,
					...this.currentProject.refFiles
				]
				const isNotApproved =
						!allFiles.length || allFiles.find((item) => !item.isApproved)
				return !isNotApproved
			},
			isAddTasksDisabled() {
				return (
						!this.currentProject.isDeadlineApproved ||
						!this.currentProject.isBriefApproved ||
						!this.areAllFilesApproved
				)
			}
		},
		components: {
			DataTable,
			TasksLangs,
			TasksLangsDuo,
			TasksFiles,
			JobSettings,
			SelectSingle,
			Button,
			ServiceAndWorkflow,
			BigToggler
		},
		async created() {
			await this.getMemoqTemplates()
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

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
