<template lang="pug">
  .workflow
    .workflow__title Service & Workflow
    .workflow__wrapper
      .workflow__drop-menu
        label.workflow__menu-title.workflow_relative Service:
          span.label-red *
        SelectSingle(
          :selectedOption="service"
          :options="allServices"
          placeholder="Service"
          @chooseOption="setService"
          :positionStyle="positionStyle"
        )
      .workflow__drop-menu
        label.workflow__menu-title Workflow:
        SelectSingle(
          :selectedOption="selectedWorkflow.name"
          :options="workflowStepsNames"
          placeholder="Workflow"
          @chooseOption="setWorkflow"
          :positionStyle="positionStyle"
        )

    .workflow__default-dates(v-if="selectedWorkflow.id === 2917")
      StepsDefaultDateModified(
        :workflowId="2917"
        v-for="count in stepsCounter"
        :stepCounter="count"
        :start="stepsDates[count-1].start"
        :deadline="stepsDates[count-1].deadline"
        @setDate="(e) => setDate(e, count)"
        @sendUnit="pushStepAndUnit"
        :service="service"
        :tasksData="tasksData"
        :originallyUnits="originallyUnits"
        :originallyServices="originallyServices"
        :originallySteps="originallySteps"
      )
    .workflow__default-dates(v-if="selectedWorkflow.id === 2890")
      StepsDefaultDateModified(
        :workflowId="2890"
        v-for="count in 1"
        :stepCounter="count"
        :start="stepsDates[0].start"
        :deadline="stepsDates[0].deadline"
        @setDate="(e) => setDate(e, count)"
        @sendUnit="pushStepAndUnit"
        :service="service"
        :tasksData="tasksData"
        :originallyUnits="originallyUnits"
        :originallyServices="originallyServices"
        :originallySteps="originallySteps"
      )

  transition(name="fade")
    .workflow__error(v-if="isError")
      p.workflow__error-message The Service has no Steps! Please, check the Settings.
</template>

<script>
	import SelectSingle from "../../../SelectSingle"
	import StepsDefaultDateModified from "./StepsDefaultDateModified"
	import { mapGetters, mapActions } from "vuex"
	import setDefaultTasksService from "@/mixins/setDefaultTasksService"
	import TasksLanguages from "../../../../mixins/TasksLanguages"

	export default {
		mixins: [ setDefaultTasksService, TasksLanguages ],
		props: {
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
			},
			templates: {
				type: Array
			}
		},
		data() {
			return {
				isNeedToStoreService: true,
				service: "",
				workflowSteps: [
					{ name: "1 Step", id: 2890 },
					{ name: "2 Steps", id: 2917 }
				],
				stepsCounter: 2,
				stepsDates: [
					{ start: new Date(), deadline: "" },
					{ start: "", deadline: new Date() }
				],
				positionStyle: { "margin-top": "3px" },
				isError: false,
				stepsAndUnits: [],
				stepsAndUnitsMono: [],
				workFlowOption: null
			}
		},
		methods: {
			...mapActions({
				setDataValue: "setTasksDataValue"
			}),
			showError() {
				this.isError = true
				setTimeout(() => {
					this.isError = false
				}, 4000)
			},
			setDate({ date, prop }, count) {
				this.stepsDates[count - 1][prop] = date
				if (this.stepsDates[count] && prop === "deadline") {
					this.stepsDates[count].start = date
					const deadline = new Date(this.stepsDates[count].deadline)
					if (date - deadline > 0) {
						this.stepsDates[count].deadline = date
					}
				}
				if (this.selectedWorkflow.id === 2890) {
					this.setDataValue({ prop: "stepsDates", value: [ this.stepsDates[0] ] })
				} else {
					this.setDataValue({ prop: "stepsDates", value: this.stepsDates })
				}
			},
			setDefaultStepsAndUnits(option) {
				let defaultStepsAndUnits
				const currentSteps = this.services.find(item => item.title === this.service)

				if (option === "2 Steps") {
					let firstUnit = returnUnit(0, this.originallySteps)
					let secondUnit = returnUnit(1, this.originallySteps)
					if (this.service === "Translation") {
						const unitsObjects = this.originallyUnits.filter(item => {
							return currentSteps.steps[0].step.calculationUnit.some(item2 => {
								return item._id.toString() === item2.toString()
							})
						})
						const firstUnitCAT = unitsObjects.find(item => item.type === "CAT Wordcount")
						if (firstUnitCAT.hasOwnProperty('type')) {
							firstUnit = firstUnitCAT.type
						}
					}
					defaultStepsAndUnits = [
						{
							step: currentSteps.steps[0].step.title,
							unit: firstUnit,
							stepCounter: 1,
							size: null
						},
						{
							step: currentSteps.steps[1].step.title,
							unit: secondUnit,
							stepCounter: 2,
							size: null
						}
					]
					this.stepsAndUnits = defaultStepsAndUnits
				} else {
					let firstUnit = returnUnit(0, this.originallySteps)
					defaultStepsAndUnits = [
						{
							step: currentSteps.steps[0].step.title,
							unit: firstUnit,
							stepCounter: 1,
							size: null
						}
					]
					this.stepsAndUnitsMono = defaultStepsAndUnits
				}

				this.setDataValue({ prop: "stepsAndUnits", value: defaultStepsAndUnits })

				function returnUnit(index, array) {
					return array.find((item) => item.title === currentSteps.steps[index].step.title
					).calculationUnit[0].type
				}
			},
			setDefaultTemplate() {
				let catUnit = this.tasksData.stepsAndUnits.find(item => item.unit === 'CAT Wordcount')
				if (catUnit) {
					let stepsAndUnits = this.tasksData.stepsAndUnits
					let template = {
						template: {
							...this.templates[0]
						}
					}
					Object.assign(stepsAndUnits[catUnit.stepCounter - 1], stepsAndUnits[catUnit.stepCounter - 1], template)
					this.setDataValue({ prop: "stepsAndUnits", value: stepsAndUnits })
				}
			},

			setService({ option }) {
				const service = this.services.find((item) => item.title === option)
				this.service = service.title
				if (!service.steps.length) return this.showError()
				this.setDataValue({ prop: "service", value: service })
				const countStepsInService = service.steps.length === 1 ? "1 Step" : "2 Steps"
				this.setWorkflow({ option: countStepsInService })
				this.setDefaultLanguages(service)
			},
			setWorkflow({ option }) {
				const workflowSteps = this.workflowSteps.find((item) => item.name === option)
				this.workFlowOption = workflowSteps.name
				this.setDataValue({ prop: "workflow", value: workflowSteps })
				this.setDefaultStepsAndUnits(this.workFlowOption)
				this.setDefaultTemplate()
				workflowSteps.id === 2890 ? this.setNotDefaultStepDates() : this.setDefaultStepDates()
			},
			setNotDefaultStepDates() {
				this.stepsDates = [
					{ start: this.currentProject.startDate, deadline: this.currentProject.deadline },
					{ start: "", deadline: "" }
				]
				let stepDates = { ...this.stepsDates[0], deadline: this.currentProject.deadline }
				this.setDataValue({ prop: "stepsDates", value: [ stepDates ] })
			},
			setDefaultStepDates() {
				this.stepsDates = [
					{ start: this.currentProject.startDate, deadline: "" },
					{ start: "", deadline: this.currentProject.deadline }
				]
				this.setDataValue({ prop: "stepsDates", value: this.stepsDates })
			},
			pushStepAndUnit(data) {
				if (this.selectedWorkflow.id === 2890) {
					if (!this.stepsAndUnitsMono.length) {
						this.stepsAndUnitsMono.push(data)
					}
					this.stepsAndUnitsMono.forEach((element, index) => {
						element.step === data.step
								? (this.stepsAndUnitsMono[index].unit = data.unit)
								: false
					})
					this.setDataValue({
						prop: "stepsAndUnits",
						value: this.stepsAndUnitsMono
					})
				}
				if (this.selectedWorkflow.id === 2917) {
					if (!this.stepsAndUnits.length) {
						this.stepsAndUnits.push(data)
					}
					this.stepsAndUnits.forEach((element, index, array) => {
						if (element.step === data.step) {
							this.stepsAndUnits[index].unit = data.unit
						}
						if (array.map((element) => element.step).indexOf(data.step) === -1) {
							this.stepsAndUnits.push(data)
						}
					})
					this.setDataValue({ prop: "stepsAndUnits", value: this.stepsAndUnits })
				}
			}
		},
		computed: {
			...mapGetters({
				services: "getVuexServices",
				tasksData: "getTasksData",
				currentProject: "getCurrentClientRequest"
			}),
			selectedWorkflow() {
				return this.tasksData.workflow ? this.tasksData.workflow : { name: "" }
			},
			workflowStepsNames() {
				let result = this.workflowSteps.map((item) => item.name)
				if (this.tasksData.service && this.tasksData.service.steps.length < 2) {
					result.pop()
				}
				return result
			},
			allServices() {
				if (this.services.length) {
					return this.currentClientServices().map((i) => i.title)
				}
				return []
			}
		},
		components: {
			SelectSingle,
			StepsDefaultDateModified
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../../assets/scss/colors.scss";

  .workflow {
    position: relative;

    &__title {
      font-size: 18px;
      margin-bottom: 20px;
    }

    &__wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    &__drop-menu {
      position: relative;
      width: 191px;
      height: 50px;
    }

    &__default-dates {
    }

    &__error {
      position: absolute;
      top: 0;
      left: 60px;
      box-shadow: 0 0 5px $orange;
      z-index: 10;
      background-color: $white;
      padding: 0 5px;
      border-radius: 10px;
    }

    &__error-message {
      color: $orange;
      font-weight: 600;
    }

    &_relative {
      position: relative;
    }
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.4s;
  }

  .fade-enter,
  .fade-leave-to {
    opacity: 0;
  }

  .label-red {
    color: red;
    font-size: 14px;
  }
</style>
