<template lang="pug">
  .lqa-table(v-if="vendorsData")
    DataTable(
      :fields="fields"
      :tableData="vendorsData"
      :bodyClass="vendorsData.length < 6 ? 'tbody_visible-overflow' : ''"
      :tableheadRowClass="vendorsData.length < 6 ? 'tbody_visible-overflow' : ''"
    )
      .lqa-table__header(v-for="{label, headerKey} in fields" :slot="headerKey" slot-scope="{ field }") {{ label }}
      .lqa-table__header(slot="vendor" slot-scope="{ row }") {{ row.name }}
      .lqa-table__header(slot="wordcount" slot-scope="{ row }") {{ row.wordCount }}
      .lqa-table__header(slot="tqi" slot-scope="{ row }")
        span soon...
      .lqa-table__header(slot="lqa1" slot-scope="{ row }")
        span soon...
      .lqa-table__header(slot="lqa2" slot-scope="{ row }")
        span soon...
      .lqa-table__header(slot="lqa3" slot-scope="{ row }")
        span soon...

</template>

<script>
	import DataTable from "@/components/DataTable";

	export default {
		props: {
			vendorsData: { type: Array, default: () => [] },
		},
		data() {
			return {
				fields: [
					{ label: "Vendor Name", headerKey: "headerVendor", key: "vendor", width: "40%" },
					{ label: "Wordcount", headerKey: "headerWords", key: "wordcount", width: "12%", fontWeight: "bolder" },
					{ label: "TQI", headerKey: "headerTqi", key: "tqi", width: "12%" },
					{ label: "LQA 1", headerKey: "headerLqa1", key: "lqa1", width: "12%" },
					{ label: "LQA 2", headerKey: "headerLqa2", key: "lqa2", width: "12%" },
					{ label: "LQA 3", headerKey: "headerLqa3", key: "lqa3", width: "12%" }
				]
			}
		},
		methods: {},
		components: {
			DataTable
		}
	}
</script>

<style lang="scss" scoped>

  .lqa-table {
    margin-top: 3px;
  }
</style>
