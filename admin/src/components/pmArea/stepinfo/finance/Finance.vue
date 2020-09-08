<template lang="pug">
  .step-finance
    StepInfoTitle(title="Finance" :isIconReversed="isMainInfo" @titleClick="toggleMainInfo")
    .step-finance__main(v-if="isMainInfo")
      .step-finance__info
        .step-finance__table
          DataTable(
            :fields="fields"
            :tableData="tableData"
            :tableheadClass="'table__header'"
            bodyClass="tbody_visible-overflow"
            :tableheadRowClass="'table__header-row tbody_visible-overflow'"
            :bodyRowClass="'table__body-row-custom'"
          )
            template(slot="headerTitle" slot-scope="{ field }")

            template(slot="headerReceivables" slot-scope="{ field }")
              span.step-finance__label {{ field.label }}

            template(slot="headerPayables" slot-scope="{ field }")
              span.step-finance__label {{ field.label }}

            template(slot="title" slot-scope="{ row }")
              span.step-finance__value {{ row.title }}

            template(slot="receivables" slot-scope="{ row }")
              span.step-finance__value {{ row.receivables }}
              span.step-finance__money(v-if="showMoney(row, 'receivables')") &nbsp;&euro;

            template(slot="payables" slot-scope="{ row }")
              span.step-finance__value {{ row.payables }}
              span.step-finance__money(v-if="showMoney(row, 'payables')") &nbsp;&euro;
        Results(:financeData="financeData")
      InfoBlock(:step="step")
      TableMatrix(:step="step")


</template>

<script>
	import DataTable from "../../../DataTable";
	import StepInfoTitle from "./StepInfoTitle";
	import ValidationErrors from "../../../ValidationErrors";
	import ApproveModal from "../../../ApproveModal";
	import Results from "./Results";
	import InfoBlock from "./InfoBlock";
	import TableMatrix from "./TableMatrix"

	export default {
		props: {
			step: {type: Object},
			financeData: {type: Array, default: () => []},
		},
		data() {
			return {
				fields: [
					{
						label: "Title",
						headerKey: "headerTitle",
						key: "title",
						width: "33.33%",
					},
					{
						label: "Receivables",
						headerKey: "headerReceivables",
						key: "receivables",
						width: "33.33%",
					},
					{
						label: "Payables",
						headerKey: "headerPayables",
						key: "payables",
						width: "33.33%",
					},
				],
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
			Results,
			InfoBlock,
			TableMatrix,
		},
		computed: {
			tableData() {
				let result = [];
				const dataLength = this.financeData.length;
				if (dataLength) {
					result = this.financeData;
					result.splice(dataLength - 1, 0, {
						title: "Rate",
						receivables: this.step.clientRate ? this.step.clientRate.value : 0,
						payables: this.step.vendorRate ? this.step.vendorRate.value : 0,
					});
				}
				return result;
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
      height: 130px;
      margin-right: 20px;
    }
  }
</style>
