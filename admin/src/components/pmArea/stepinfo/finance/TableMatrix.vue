<template lang="pug">
  .tableMatrix
    DataTable(
      :fields="fields"
      :tableData="tableData"
      :bodyRowClass="'settings-table-row'"
      :bodyClass="['', {'tbody_visible-overflow': tableData.length < 6}]"
      :tableheadRowClass="tableData.length < 6 ? 'tbody_visible-overflow' : ''"
    )
      template(v-for="field in fields", :slot="field.headerKey", slot-scope="{ field }")
        .tableMatrix__head-title {{ field.label }}
      template(slot="empty", slot-scope="{ row, index }")
        .tableMatrix__data {{ row.text }}
      template(slot="1", slot-scope="{ row, index }")
        .tableMatrix__data(v-if="selectedTab === 'Receivables'") {{ row.client }}
        .tableMatrix__data(v-if="selectedTab === 'Payables'") {{ row.vendor }}
      template(slot="2", slot-scope="{ row, index }")
        .tableMatrix__data {{ row.value }}
      template(slot="3", slot-scope="{ row, index }")
        .tableMatrix__data(v-if="selectedTab === 'Receivables'") {{ calculatedRate(row.client, row.value) }}
        .tableMatrix__data(v-if="selectedTab === 'Payables'") {{ calculatedRate(row.vendor, row.value) }}
</template>

<script>
	import DataTable from "../../../DataTable";
	import {mapGetters} from "vuex";
	import {isInteger} from "lodash";

	export default {
		props: {
			step: {
				type: Object
			},
			selectedTab: {
				type: String,
			},
		},
		data() {
			return {
				fields: [
					{
						label: "",
						headerKey: "headerEmpty",
						key: "empty",
						width: "25%",
					},
					{
						label: "%",
						headerKey: "headerTranslated",
						key: "1",
						width: "25%",
					},
					{
						label: "Source Word",
						headerKey: "headerRepetitions",
						key: "2",
						width: "25%",
					},
					{
						label: "Rate",
						headerKey: "headerContextMatch",
						key: "3",
						width: "25%",
					},
				],
				tableData: [],
			}
		},
		components: {
			DataTable
		},
		methods: {
			findCurrentTask() {
				return this.currentProject.tasks.find(task => task.taskId === this.step.taskId)
			},
			getStepMetrics() {
				const {metrics} = this.findCurrentTask();
				return metrics;
			},
			changeFormatForMetrics() {
				let arrayOfMetrics = [];
				const subtitles = {
					subtitles: ["%", "Source Word", "Rate"]
				}
				for (let iterator in this.getStepMetrics()) {
					arrayOfMetrics.push(
						Object.assign(this.getStepMetrics()[iterator], subtitles)
					)
				}
				return arrayOfMetrics;
			},
			calculatedRate(rate, wordCount) {
				const currentNumber = (rate * wordCount) / 100
				return isInteger(currentNumber) ? currentNumber : currentNumber.toFixed(3)
			},
			buildMatrixArray(){
				let matrixArr = this.changeFormatForMetrics()
				if (!matrixArr[matrixArr.length - 1].hasOwnProperty('client')) {
					matrixArr.pop()
				}
				this.tableData = matrixArr;
      }
		},
		computed: {
			...mapGetters({
				currentProject: "getCurrentProject",
			}),
		},
		mounted() {
      this.buildMatrixArray();
		}

	}
</script>

<style lang="scss" scoped>
  .tableMatrix {
    &__data {
      padding: 0 5px;
      display: flex;
      align-items: center;
      box-sizing: border-box;
    }
  }
</style>