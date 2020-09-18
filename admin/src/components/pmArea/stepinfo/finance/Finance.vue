<template lang="pug">
  .step-finance
    StepInfoTitle(title="Finance" :isIconReversed="isMainInfo" @titleClick="toggleMainInfo")
    .step-finance__main(v-if="isMainInfo")
      InfoBlock(
        :step="step"
        :originallyUnits="originallyUnits"
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
			showMoney(row, key) {
				return row.title !== "Wordcount" && row[key];
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
    box-shadow: 0 0 5px $brown-shadow;
    padding: 20px;

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
