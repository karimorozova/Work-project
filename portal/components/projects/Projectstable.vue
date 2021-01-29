<template lang="pug">
  .projects-table
    .projects-table__filters
    .projects-table__table
      DataTable(
        :fields="fields"
        :tableData="projects"
        :bodyClass="projects.length < 12 ? 'tbody_visible-overflow' : ''"
        :tableHeadRowClass="projects.length < 12 ? 'tbody_visible-overflow' : ''"
        @onRowClicked="getDetails"
      )
        .projects-table__header(slot="headerRequestDate" slot-scope="{ field }") {{ field.label }}
        .projects-table__header(slot="headerProjectId" slot-scope="{ field }") {{ field.label }}
        .projects-table__header(slot="headerProjectName" slot-scope="{ field }") {{ field.label }}
        .projects-table__header(slot="headerDeadline" slot-scope="{ field }") {{ field.label }}
        .projects-table__header(slot="headerStatus" slot-scope="{ field }") {{ field.label }}
        .projects-table__header(slot="headerTotalCost" slot-scope="{ field }") {{ field.label }}
        .projects-table__header(slot="headerDownload" slot-scope="{ field }") {{ field.label }}
        .projects-table__data(slot="requestDate" slot-scope="{ row, index }") {{ getFormattedDate(row.startDate) }}
        .projects-table__data(slot="projectId" slot-scope="{ row, index }") {{ row.projectId }}
        .projects-table__data(slot="projectName" slot-scope="{ row, index }") {{ row.projectName }}
        .projects-table__data(slot="deadline" slot-scope="{ row, index }") {{ getFormattedDate(row.deadline) }}
        .projects-table__data(slot="status" slot-scope="{ row, index }") {{ row.status }}
        .projects-table__data(slot="totalCost" slot-scope="{ row, index }") {{ row.finance.Price.receivables }}
          .projects-table__currency(v-if="row.finance.Price.receivables")
            span(v-html="currencyIconDetected(row.projectCurrency)")
        .projects-table__data.projects-table_centered(slot="download" slot-scope="{ row, index }")
          img.projects-table__icon(v-if="isDownload(row)" src="../../assets/images/download.png" @click.stop="download(index)")
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
					{ label: "Project ID", headerKey: "headerProjectId", key: "projectId", width: "18%", padding: "0" },
					{ label: "Project Name", headerKey: "headerProjectName", key: "projectName", width: "18%", padding: "0" },
					{ label: "Status", headerKey: "headerStatus", key: "status", width: "18%", padding: "0" },
					{ label: "Request On", headerKey: "headerRequestDate", key: "requestDate", width: "11.5%", padding: "0" },
					{ label: "Deadline", headerKey: "headerDeadline", key: "deadline", width: "11.5%", padding: "0" },
					{ label: "Total Cost", headerKey: "headerTotalCost", key: "totalCost", width: "11.5%", padding: "0" },
					{ label: "", headerKey: "headerDownload", key: "download", width: "11.5%", padding: "0" }
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
			isDownload(project) {
				const statuses = ['Ready for Delivery', 'Delivered', 'Closed']
				return statuses.indexOf(project.status) !== -1 && !project.hasOwnProperty('fromXTRF')
			},
			async clientInfo() {
				const token = this.jsess
				const result = await this.$axios.$get(`/portal/clientinfo?token=${ token }`)
				this.setClientInfo(result.client)
				this.companyName = result.client.name
			},
			async download(index) {
				const project = this.projects[index]
				try {
					let href = project.deliverables
					if (!href) {
						const result = await this.$axios.post('/portal/project-deliverables', { project })
						href = result.data
					}
					let link = document.createElement('a')
					link.href = this.domain + href
					link.target = "_blank"
					link.click()
				} catch (err) {
					this.alertToggle({ message: err.message, isShow: true, type: "error" })
				}
			},
			getDetails({ index }) {
				const id = this.projects[index]._id
				this.$router.push(`/projects/details/${ id }`)
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
