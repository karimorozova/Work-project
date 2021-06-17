<template lang="pug">
  .projects-table
    .projects-table__filters
    .projects-table__table
      DataTable(
        :fields="fields"
        :tableData="projects"
        :bodyClass="[{ 'tbody_visible-overflow': projects.length < 6 }]",
        :tableheadRowClass="[{ 'tbody_visible-overflow': projects.length < 6 }]",
        @onRowClicked="getDetails"
      )
        .projects-table__header(slot="headerRequestDate" slot-scope="{ field }") {{ field.label }}
        .projects-table__header(slot="headerProjectId" slot-scope="{ field }") {{ field.label }}
        .projects-table__header(slot="headerProjectName" slot-scope="{ field }") {{ field.label }}
        .projects-table__header(slot="headerDeadline" slot-scope="{ field }") {{ field.label }}
        .projects-table__header(slot="headerStatus" slot-scope="{ field }") {{ field.label }}
        .projects-table__header(slot="headerTotalCost" slot-scope="{ field }") {{ field.label }}

        .projects-table__data(slot="requestDate" slot-scope="{ row, index }") {{ getFormattedDate(row.startDate) }}
        .projects-table__data(slot="projectId" slot-scope="{ row, index }") {{ row.projectId }}
        .projects-table__data(slot="projectName" slot-scope="{ row, index }") {{ row.projectName }}
        .projects-table__data(slot="deadline" slot-scope="{ row, index }") {{ getFormattedDate(row.deadline) }}
        .projects-table__data(slot="status" slot-scope="{ row, index }") {{ row.status }}
        .projects-table__data(slot="totalCost" slot-scope="{ row, index }") {{ row.finance.Price.receivables }}
          .projects-table__currency(v-if="row.finance.Price.receivables")
            span(v-html="currencyIconDetected(row.projectCurrency)")
</template>

<script>
	import moment from "moment"
	import DataTable from "../Tables/DataTable"
	import { mapActions } from "vuex"
	import currencyIconDetected from "../../mixins/currencyIconDetected"

	export default {
		mixins: [currencyIconDetected],
		props: {
			projects: {
				type: Array,
				default: () => []
			}
		},
		data() {
			return {
				fields: [
					{ label: "Project ID", headerKey: "headerProjectId", key: "projectId", width: "16%", padding: "0" },
					{ label: "Project Name", headerKey: "headerProjectName", key: "projectName", width: "24%", padding: "0" },
					{ label: "Status", headerKey: "headerStatus", key: "status", width: "15%", padding: "0" },
					{ label: "Request On", headerKey: "headerRequestDate", key: "requestDate", width: "15%", padding: "0" },
					{ label: "Deadline", headerKey: "headerDeadline", key: "deadline", width: "15%", padding: "0" },
					{ label: "Total Cost", headerKey: "headerTotalCost", key: "totalCost", width: "15%", padding: "0" },
				],
				domain: ""
			}
		},
		methods: {
			...mapActions([
				"setClientInfo"
			]),
			getFormattedDate(date) {
				return moment(date).format("DD-MM-YYYY")
			},
			async clientInfo() {
				const token = this.jsess
				const result = await this.$axios.$get(`/portal/clientinfo?token=${ token }`)
				this.setClientInfo(result.client)
				this.companyName = result.client.name
			},
			getDetails({ index }) {
				const id = this.projects[index]._id
				this.$router.push(`/projects/all/details/${ id }`)
			}
		},
		components: {
			DataTable
		},
		mounted() {
			this.domain = process.env.domain
		}
	}
</script>


<style lang="scss" scoped>

  .projects-table {
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
