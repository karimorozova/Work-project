<template lang="pug">
  .tasks-table
    DataTable(
      :fields="fields"
      :rowClass="'withoutCursor'"
      :tableData="tableData"
      bodyRowClass="cursor-default"
      :bodyClass="[{ 'tbody_visible-overflow': tableData.length < 6 }]",
      :tableheadRowClass="[{ 'tbody_visible-overflow':tableData.length < 6 }]",
    )
      .tasks-table__header(slot="headerPair" slot-scope="{ field }") {{ field.label }}
      .tasks-table__header(slot="headerWordcount" slot-scope="{ field }") {{ field.label }}
      .tasks-table__header(slot="headerCost" slot-scope="{ field }") {{ field.label }}
      .tasks-table__data(slot="pair" slot-scope="{ row }") {{ getLanguagePairs(row) }}
      .tasks-table__data(slot="wordcount" slot-scope="{ row }")
        .tasks-table__finance(v-if="project.status !== 'Requested'") {{ row.finance.Wordcount.receivables }}
        .tasks-table__finance(v-else) -
      .tasks-table__data(slot="cost" slot-scope="{ row }")
        .tasks-table__finance(v-if="project.status !== 'Requested'") {{ row.finance.Price.receivables }}
          span.tasks-table__currency(v-if="row.finance.Price.receivables")
          span(v-html="currencyIconDetected(project.projectCurrency)")
        .tasks-table__finance(v-else) -

</template>

<script>
	import DataTable from "~/components/Tables/DataTable";
	import { mapGetters, mapActions } from "vuex";
	import currencyIconDetected from "../../../../mixins/currencyIconDetected"
  import {allLanguages} from "../../../../store/getters";

	export default {
		mixins: [currencyIconDetected],
		data() {
			return {
				fields: [
					{ label: "Langauge Pair", headerKey: "headerPair", key: "pair", width: "40%", padding: "0" },
					{ label: "Wordcount", headerKey: "headerWordcount", key: "wordcount", width: "30%", padding: "0" },
					{ label: "Cost", headerKey: "headerCost", key: "cost", width: "30%", padding: "0" }
				],
			}
		},
		methods: {
			getLanguagePairs(row) {
				// if(this.project.status === "Requested") {
				// 	return this.project.packageSize ? `${ row.lang } / ${ this.project.packageSize.size }` : `${ this.project.sourceLanguage.lang } => ${ row.lang }`;
				// }
        const sourceLang = this.getLangInfoBySymbol(row.sourceLanguage)
        const targetLang = this.getLangInfoBySymbol(row.targetLanguage)
				return `${sourceLang.lang} >> ${targetLang.lang}`
				//MAX
				//   return this.getQuotePairs(row);
			},
      getLangInfoBySymbol(symbol) {
			  return this.languages.find((lang) => lang.symbol === symbol )
      }
			// getQuotePairs(task) {
			// 	return `${task.sourceLanguage} >> ${task.targetLanguage}`
			// 	// let ratesProp = 'monoRates';
			// 	// if(task.service.calculationUnit !== 'Packages') {
			// 	// 	ratesProp = task.service.calculationUnit.toLowerCase() + 'Rates';
			// 	// }
			// 	//MAX
			// 	// return ratesProp === 'monoRates' ? this.getMonoPair(task) : this.getDuoPair(task, ratesProp);
			// },
			// getMonoPair(task) {
			// 	const targets = this.clientLanguages.monoRates.map(item => item.target);
			// 	const pairLang = targets.find(item => item.symbol === task.targetLanguage);
			// 	return `${ pairLang.lang } / ${ task.packageSize }`;
			// },
			// getDuoPair(task, ratesProp) {
			// 	const pair = this.clientLanguages[ratesProp].find(item => item.source.symbol === task.sourceLanguage && item.target.symbol === task.targetLanguage);
			// 	return `${ pair.source.lang } => ${ pair.target.lang }`;
			// }
		},
		computed: {
			...mapGetters({
				project: "getSelectedProject",
				clientLanguages: "getCombinations",
        languages: "allLanguages",
			}),
			tableData() {
				if(this.project.status !== 'Requested') {
					return this.project.tasks.filter(task => task.status !== "Cancelled");
				}
				return this.project.targetLanguages;
			}
		},
		components: {
			DataTable
		}
	}
</script>

<style lang="scss" scoped>

  .tasks-table {
    &__data {
      height: 30px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      padding: 0 5px;
    }

    &__currency {
      margin-left: 3px;
    }
  }

</style>
