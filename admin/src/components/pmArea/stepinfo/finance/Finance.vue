<template lang="pug">
  .step-finance
    StepInfoTitle(title="Finance" :isIconReversed="isMainInfo" @titleClick="toggleMainInfo")
    .step-finance__main(v-if="isMainInfo")
      InfoBlock(
        :step="step"
        :originallyUnits="originallyUnits"
        :projectCurrency="projectCurrency"
      )
</template>

<script>
	import DataTable from "../../../DataTable";
	import StepInfoTitle from "./StepInfoTitle";
	import ValidationErrors from "../../../ValidationErrors";
	import ApproveModal from "../../../ApproveModal";
	import InfoBlock from "./InfoBlock";

	export default {
		props: {
			step: {type: Object},
			originallyUnits: {
				type: Array
			},
			projectCurrency: {
				type: String,
			}
		},
		data() {
			return {
				isMainInfo: false,
			};
		},
		methods: {
			toggleMainInfo() {
				this.isMainInfo = !this.isMainInfo;
			},
		},
		components: {
			DataTable,
			StepInfoTitle,
			ValidationErrors,
			ApproveModal,
			InfoBlock,
		},
		computed: {
			getUnitTypeByUnitId() {
				return this.originallyUnits
					.find(unit => unit._id.toString() === this.step.serviceStep.unit).type;
			},
		},
	};
</script>

<style lang="scss" scoped>
  @import "../../../../assets/scss/colors";

  .step-finance {
    box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;
    padding: 20px;
    border-radius: 4px;


    &__main {
      display: flex;
      flex-direction: column;
    }

    &__info {
      margin-top: 20px;
      display: flex;
      transition: all 0.3s;
    }

    &__table {
      width: 520px;
      margin-right: 20px;
    }
  }
</style>
