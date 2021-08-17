<template lang="pug">
  .invoicing-reports
    .invoicing-reports__block
      .invoicing-reports__title
          .icon-button
            router-link(class="link-to" :to="{path: `/pangea-finance/invoicing-reports/create-reports `}" target="_blank")
              i.fas.fa-plus-circle
      InvoicingReportsList(:reports="reports" @openDetails="openDetails")

</template>

<script>
import AddInvoicing from './AddInvoicing'
import ApproveModal from '../ApproveModal'
import InvoicingReportsList from './InvoicingReportsList'
import InvoicingDetails from './InvoicingDetails'
export default {
  data () {
    return {
      isAddInvoicing: false,
      invoicingEditId: '',
      reports: [],
      reportDetailsInfo: {},
      currentDetails: '',
    }
  },
  methods: {
    toggleAddInvoicing() {
      console.log('here')
      this.isAddInvoicing = !this.isAddInvoicing
    },
    closeAddStepsToInvoicing(){
      this.invoicingEditId = ''
    },
    async refreshReports() {
      this.reports = (await this.$http.post('/invoicing-reports/reports', { countToSkip: 0})).data.map(i => ({ ...i, isCheck: false }))
    },
    async refreshDetailsOfReports(reportId) {
      this.reports = (await this.$http.post('/invoicing-reports/reports', { countToSkip: 0})).data.map(i => ({ ...i, isCheck: false }))
      await this.openDetails(reportId)
      await this.refreshReports()
    },
    async openDetails(id) {
      this.reportDetailsInfo =  (await this.$http.post('/invoicing-reports/report/' + id)).data
    },
    closeDetailsInvoicing(){
      this.reportDetailsInfo = []
    },
  },
  async created() {
    await this.refreshReports()
  },
  components: {
    AddInvoicing,
    ApproveModal,
    InvoicingReportsList,
    InvoicingDetails,
  }
}
</script>

<style scoped lang="scss">
@import "../../assets/scss/colors";
  .invoicing-reports {
    position: relative;
    width: 1530px;
    margin: 50px;
    background: #fff;
    &__block {
      border-radius: 4px;
      padding: 20px;
      box-sizing: border-box;
      box-shadow: 0 1px 2px 0 rgba(99,99,99,.3),0 1px 3px 1px rgba(99,99,99,.15);
    }

    &__title {
      display: flex;
      justify-content: end;
      margin-bottom: 10px;
    }
  }
  .icon-button {
    font-size: 16px;
    border: 1px solid $border;
    border-radius: 4px;
    height: 30px;
    width: 30px;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: .2s ease-out;
    justify-content: center;
    color: $dark-border;

    &:hover {
      color: $text;

    }
  }
  .modals {
    position: absolute;
    z-index: 10;
    bottom: 0;
    top: 0;
    background: #9999993d;
   &__block {
     position: absolute;
   }
  }
  .right {
    float: right;
  }
  .absolute-middle {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, 50%);
  }
  a {
    color: inherit;
  }
</style>