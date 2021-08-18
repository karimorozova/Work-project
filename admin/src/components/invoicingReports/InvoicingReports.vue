<template lang="pug">
  .invoicing-reports
    .invoicing-reports__block
      InvoicingReportsList(:reports="reports" @openDetails="openDetails")
</template>

<script>
	import AddInvoicing from './AddInvoicing'
	import ApproveModal from '../ApproveModal'
	import InvoicingReportsList from './InvoicingReportsList'
	import InvoicingDetails from './InvoicingDetails'

	export default {
		data() {
			return {
				isAddInvoicing: false,
				invoicingEditId: '',
				reports: [],
				reportDetailsInfo: {},
				currentDetails: ''
			}
		},
		methods: {
			toggleAddInvoicing() {
				console.log('here')
				this.isAddInvoicing = !this.isAddInvoicing
			},
			closeAddStepsToInvoicing() {
				this.invoicingEditId = ''
			},
			async refreshReports() {
				this.reports = (await this.$http.post('/invoicing-reports/reports', { countToSkip: 0 })).data.map(i => ({ ...i, isCheck: false }))
			},
			async refreshDetailsOfReports(reportId) {
				this.reports = (await this.$http.post('/invoicing-reports/reports', { countToSkip: 0 })).data.map(i => ({ ...i, isCheck: false }))
				await this.openDetails(reportId)
				await this.refreshReports()
			},
			async openDetails(id) {
				this.reportDetailsInfo = (await this.$http.post('/invoicing-reports/report/' + id)).data
			},
			closeDetailsInvoicing() {
				this.reportDetailsInfo = []
			}
		},
		async created() {
			await this.refreshReports()
		},
		components: {
			AddInvoicing,
			ApproveModal,
			InvoicingReportsList,
			InvoicingDetails
		}
	}
</script>

<style scoped lang="scss">
  @import "../../assets/scss/colors";


</style>