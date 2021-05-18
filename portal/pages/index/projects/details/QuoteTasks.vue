<template lang="pug">
  .tasks-table
    DataTable(
      :fields="fields"
      :tableData="project.tasks"
      bodyRowClass="cursor-default"
      :bodyClass="[{ 'tbody_visible-overflow': project.tasks.length < 6 }]",
      :tableheadRowClass="[{ 'tbody_visible-overflow': project.tasks.length < 6 }]",
    )
      .tasks-table__header(slot="headerPair" slot-scope="{ field }") {{ field.label }}
      .tasks-table__header(slot="headerWordcount" slot-scope="{ field }") {{ field.label }}
      .tasks-table__header(slot="headerCost" slot-scope="{ field }") {{ field.label }}
      .tasks-table__data(slot="pair" slot-scope="{ row }") {{ getLanguagePair(row) }}
      .tasks-table__data(slot="wordcount" slot-scope="{ row }") {{ row.finance.Wordcount.receivables }}
      .tasks-table__data(slot="cost" slot-scope="{ row }") {{ row.finance.Price.receivables }}
        .tasks-table__currency(v-if="row.finance.Price.receivables") IJH;

</template>

<script>
	import DataTable from "~/components/Tables/DataTable"
	import { mapGetters, mapActions } from "vuex"
	import taskPair from "~/mixins/taskPair"

	export default {
		mixins: [ taskPair ],
		data() {
			return {
				fields: [
					{ label: "Langauge Pair", headerKey: "headerPair", key: "pair", width: "40%", padding: "0" },
					{ label: "Wordcount", headerKey: "headerWordcount", key: "wordcount", width: "30%", padding: "0" },
					{ label: "Cost", headerKey: "headerCost", key: "cost", width: "30%", padding: "0" }
				]
			}
		},
		methods: {},
		computed: {
			...mapGetters({
				project: "getSelectedProject",
				clientLanguages: "getCombinations"
			})
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
