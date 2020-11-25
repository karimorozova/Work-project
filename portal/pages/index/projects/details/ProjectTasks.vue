<template lang="pug">
  .tasks-table
    DataTable(
      :rowClass="'withoutCursor'"
      :fields="fields"
      :tableData="project.tasks"
      :bodyClass="project.tasks.length < 10 ? 'tbody_visible-overflow' : ''"
      :tableHeadRowClass="project.tasks.length < 10 ? 'tbody_visible-overflow' : ''"
    )
      .tasks-table__header(slot="headerPair" slot-scope="{ field }") {{ field.label }}
      .tasks-table__header(slot="headerStatus" slot-scope="{ field }") {{ field.label }}
      .tasks-table__header(slot="headerWordcount" slot-scope="{ field }") {{ field.label }}
      .tasks-table__header(slot="headerCost" slot-scope="{ field }") {{ field.label }}
      .tasks-table__header(slot="headerDownload" slot-scope="{ field }") {{ field.label }}
      .tasks-table__data(slot="pair" slot-scope="{ row }") {{ getLanguagePair(row) }}
      .tasks-table__data(slot="status" slot-scope="{ row }") {{ row.status }}
      .tasks-table__data(slot="wordcount" slot-scope="{ row }") {{ row.finance.Wordcount.receivables }}
      .tasks-table__data(slot="cost" slot-scope="{ row }") {{ row.finance.Price.receivables }}
        .tasks-table__currency(v-if="row.finance.Price.receivables") &euro;
      .tasks-table__data.tasks-table_centered(slot="download" slot-scope="{ row }")
        img.tasks-table__icon(v-if="isDownload(row)" src="../../../../assets/images/download.png" @click="download(row)")

</template>

<script>
	import DataTable from "~/components/Tables/DataTable";
	import { mapGetters, mapActions } from "vuex";
	import taskPair from "~/mixins/taskPair";

	export default {
		mixins: [taskPair],
		data() {
			return {
				fields: [
					{ label: "Langauge Pair", headerKey: "headerPair", key: "pair", width: "20%", padding: "0" },
					{ label: "Status", headerKey: "headerStatus", key: "status", width: "20%", padding: "0" },
					{ label: "Wordcount", headerKey: "headerWordcount", key: "wordcount", width: "20%", padding: "0" },
					{ label: "Cost", headerKey: "headerCost", key: "cost", width: "20%", padding: "0" },
					{ label: " ", headerKey: "headerDownload", key: "download", width: "20%", padding: "0" }
				],
				tableWidth: 735,
				domain: "",
			}
		},
		methods: {
			isDownload(task) {
				const statuses = ['Ready for Delivery', 'Delivered'];
				return statuses.indexOf(task.status) !== -1;
			},
			async download(task) {
				try {
					let href = task.deliverables;
					if(!href) {
						const result = await this.$axios.get(`/portal/deliverables?taskId=${ task.taskId }`);
						href = result.data.link;
					}
					let link = document.createElement('a');
					link.href = this.domain + href;
					link.target = "_blank";
					link.click();
					if(task.status === "Ready for Delivery") {
						await this.updateTaskStatus({ task, status: 'Delivered' });
					}
				} catch (err) {
					this.alertToggle({ message: err.message, isShow: true, type: "error" });
				}
			}
		},
		computed: {
			...mapGetters({
				project: "getSelectedProject",
				clientLanguages: "getCombinations"
			})
		},
		components: {
			DataTable
		},
		mounted() {
			this.domain = process.env.domain;
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

    &__icon {
      cursor: pointer;
    }

    &_centered {
      justify-content: center;
    }
  }

</style>