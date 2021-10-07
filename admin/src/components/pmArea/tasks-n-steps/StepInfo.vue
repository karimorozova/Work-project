<template lang="pug">
  .step-info
    .step-info__title {{ step.stepId }}
    .step-info__close(@click.stop="closeInfo") &#215;

    .step-info__block
      StepDetails(
        :vendor="step.vendor"
        :step="step"
        :task="task"
        :originallyUnits="originallyUnits"
      )
    .step-info__finance
      Finance(
        :step="step"
        @refreshFinance="refreshFinance"
        :originallyUnits="originallyUnits"
        :projectCurrency="projectCurrency"
      )
</template>

<script>
	import Finance from "../stepinfo/finance/Finance"
	import Matrix from "../stepinfo/Matrix"
	import Files from "../stepinfo/Files"
	import { mapGetters, mapActions } from "vuex"
	import StepDetails from "../stepinfo/StepDetails"

	export default {
		props: {
			step: {
				type: Object
			},
			task: {
				type: Object
			},
			index: {
				type: [ Number, String ]
			},
			originallyLanguages: {
				type: Array
			},
			originallyUnits: {
				type: Array
			},
			projectCurrency: {
				type: String
			}
		},
		data() {
			return {
				matrixData: [],
				delivery: null
			}
		},
		methods: {
			refreshFinance({ costs }) {
				// console.log("refresh finance", costs);
			},
			closeInfo() {
				this.$emit("closeStepInfo")
			},
			...mapActions({
				alertToggle: "alertToggle",
				updateMatrix: "updateMatrix"
			})
		},
		mounted() {

		},
		computed: {
			...mapGetters({
				currentProject: "getCurrentProject"
			})
		},
		components: {
			StepDetails,
			Finance,
			Matrix,
			Files
		}
	}
	1
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors";

  .step-info {
    &__title {
      font-size: 18px;
      font-family: Myriad600;
      margin-bottom: 10px;
    }

    &__finance {
      margin-top: 20px;
    }

    &__close {
      position: absolute;
      top: 10px;
      right: 10px;
      font-size: 22px;
      cursor: pointer;
      height: 22px;
      width: 22px;
      justify-content: center;
      display: flex;
      align-items: center;
      font-family: Myriad900;
      opacity: 0.8;
      transition: ease 0.2s;

      &:hover {
        opacity: 1
      }
    }
  }
</style>
