<template lang="pug">
  .taskData
    .taskData__row
      div Service:
      .drop
        SelectSingle(
          :selectedOption="tasksData.service ? tasksData.service.title : ''"
          :options="mappedClientServices"
          placeholder="Option"
          @chooseOption="setService"
        )

    .taskData__row
      div Languages:
      .languages
        TasksLangsDuo

    .taskData__row
      NewServicesCreationStepsWorkflow


</template>

<script>
import { mapActions, mapGetters } from "vuex"
import SelectSingle from "../../SelectSingle"
import TasksLangsDuo from "./TasksLangsDuo"
import NewServicesCreationStepsWorkflow from "./tasksFiles/NewServicesCreationStepsWorkflow"

export default {
  name: "NewTasksData",
  props: {
    allServices: {
      type: Array
    },
    allLanguages: {
      type: Array
    },
    currentProject: {
      type: Object
    }
  },
  data() {
    return {
      templates: []
    }
  },
  methods: {
    ...mapActions({ alertToggle: 'alertToggle', setDataValue: "setTasksDataValue" }),
    buildAutoData() {
      console.log('this.allServices', this.allServices)
      console.log('this.currentProject', this.currentProject)

      const service = this.activeClientServices()[0]
      this.setDataValue({ prop: "service", value: service })

      const source = this.getServiceSourceLanguages(service)[0]
      this.setDataValue({ prop: "source", value: source })

      const stepsAndUnits = []
      for (const { step } of service.steps) {
        stepsAndUnits.push({
          step,
          start: '',
          deadline: '',
          receivables: { unit: step.calculationUnit[0], quantity: 0 },
          payables: { unit: step.calculationUnit[0], quantity: 0 }
        })
      }
      this.setDataValue({ prop: "stepsAndUnits", value: stepsAndUnits })


    },
    getServiceSourceLanguages(service) {
      const { customer: { services }, industry } = this.currentProject
      const neededServices = services
          .filter(item => item.services[0] === service._id.toString() && item.industries[0] === industry._id)
          .map(item => item.sourceLanguage)
      return this.allLanguages.filter(a => [ ...new Set(neededServices) ].some(b => a._id.toString() === b))
    },
    setService({ option }) {
      this.setDataValue({ prop: "service", value: this.allServices.find(item => item.title === option) })
    },
    activeClientServices() {
      let finalServicesArr = []
      const { industry, customer: { services, rates: { stepMultipliersTable } } } = this.currentProject
      const arrayOfClientServices = [ ...new Set(services.filter(({ industries }) => industries[0] === industry._id).map(({ services }) => services).flat()) ]
      const clientServices = this.allServices.filter((a) => arrayOfClientServices.some((b) => a._id.toString() === b))

      clientServices.forEach(elem => {
        if (elem.steps.length) {
          const stepsIds = [ ...elem.steps ].map(i => `${ i.step._id }`)
          const stepRates = stepMultipliersTable.filter(({ step }) => stepsIds.includes(`${ step }`))
          if (stepRates.length) if (!stepRates.every(({ isActive }) => !isActive)) finalServicesArr.push(elem)
        }
      })
      return finalServicesArr
    }
  },
  computed: {
    ...mapGetters({
      tasksData: "getTasksData"
    }),
    // selectedWorkflow() {
    // 	return this.tasksData.workflow ? this.tasksData.workflow : { name: "" }
    // },
    // workflowStepsNames() {
    // 	let result = this.workflowSteps.map((item) => item.name)
    // 	const { steps } = this.tasksData.service
    // 	if (this.tasksData.service && steps.length === 2 && this.isActiveStepInRates(steps[0].step._id) && this.isActiveStepInRates(steps[1].step._id)) {
    // 		return result
    // 	} else {
    // 		result.pop()
    // 		return result
    // 	}
    // },
    mappedClientServices() {
      if (this.activeClientServices().length) return this.activeClientServices().map(i => i.title)
      return []
    }
    // async getMemoqTemplates() {
    // 	try {
    // 		const result = await this.$http.get("/memoqapi/templates")
    // 		this.templates = result.data
    // 	} catch (err) {
    // 	}
    // }
  },
  async created() {
    this.buildAutoData()
  },
  components: { NewServicesCreationStepsWorkflow, TasksLangsDuo, SelectSingle }
}

</script>

<style scoped lang="scss">
.taskData {
  &__row {

  }
}

.drop {
  width: 220px;
  position: relative;
  height: 32px;
}
</style>