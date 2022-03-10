<template lang="pug">
  .invoice-list
    LayoutsListWrapper(
      v-if="invoices.length"
      :hasFilterButton="false"
      :hasClearButton="false"
      :isFilterActive="isFilterActive"
      @toggleFilters="toggleFilters"
      @clearFilters="clearFilters"
    )
      template(slot="filters")

      template(slot="table")
        LayoutsTable(
          :fields="fields"
          :tableData="invoices"
        )
          template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
            .table__header(v-if="field.headerKey === 'headerCheck'")
              CheckBox(:isChecked="isAllSelected" :isWhite="true"  @check="toggleAll(true)" @uncheck="toggleAll(false)")
            .table__header(v-else) {{ field.label }}

          template(slot="check" slot-scope="{ row, index }")
            .table__data
              CheckBox(:isChecked="row.isCheck" @check="toggleCheck(index, true)" @uncheck="toggleCheck(index, false)")

          template(slot="invoiceId" slot-scope="{ row, index }")
            .table__invoiceId
              router-link(class="link-to" :to="{path: `/pangea-finance/receivables-reports/invoice/${row._id}`}")
                span {{row.invoiceId}}

          template(slot="customer" slot-scope="{ row, index }")
            .table__statusAndProgress
              .status {{ row.customer.name }}

          template(slot="status" slot-scope="{ row, index }")
            .table__statusAndProgress
              .status {{ row.status }}

</template>

<script>
import LayoutsListWrapper from "../LayoutsListWrapper"
import LayoutsListWrapperLogic from "../../mixins/LayoutsListWrapperLogic"
import LayoutsTable from "../LayoutsTable"
import CheckBox from "../CheckBox"
import { mapActions } from "vuex"

export default {
  mixins: [LayoutsListWrapperLogic],
  components: {
    LayoutsListWrapper,
    LayoutsTable,
    CheckBox
  },
  data() {
    return {
      invoices: [],
      isDataRemain: true,
      dataVariables: [
        'clients',
        'sourceLanguages',
        'targetLanguages',
        'deadlineDateFrom',
        'deadlineDateTo',
        'step'
      ],
      fields: [
        {
          label: "",
          headerKey: "headerCheck",
          key: "check",
          style: { width: "26px" }
        },
        {
          label: "Invoice Id",
          headerKey: "headerInvoiceId",
          key: "invoiceId",
          style: { "width": "160px" }
        },
        {
          label: "Client Name",
          headerKey: "headerCustomer",
          key: "customer",
          dataKey: "name",
          style: { "width": "160px" }
        },
        {
          label: "Status",
          headerKey: "headerStatus",
          key: "status",
          style: { "width": "160px" }
        },
      ]
    }
  },
  methods: {
    ...mapActions(["alertToggle"]),
    async getInvoices() {
      try {
        const result = (await this.$http.post(`/invoicing/invoices-list?page=1&limit=25`, { filters: this.filters })).data
        this.invoices = result.map(item => ({ ...item, isCheck: false }))
        this.isDataRemain = result.length === 25
        console.log(this.invoices)
      } catch (err) {
        this.alertToggle({ message: "Error on Steps data", isShow: true, type: "error" })
      }
    },
    querySetter(vm, to) {
      for (let variable of this.dataVariables) if (to.query[variable] != null) vm[variable] = to.query[variable]
    },
    defaultSetter() {
      for (let variable of this.dataVariables) this[variable] = ''
    }
  },
  computed: {
    isAllSelected() {
      if (this.invoices && this.invoices.length) return this.invoices.every(i => i.isCheck)
    },
  },

  beforeRouteEnter(to, from, next) {
    next((vm) => {
      // vm.defaultSetter()
      // vm.querySetter(vm, to)
      vm.getInvoices()
    })
  },
  watch: {
    $route(to, from) {
      if (to.path === from.path) {
        // this.querySetter(this, to)
        this.getInvoices()
      }
    }
  },
}
</script>

<style scoped lang="scss">

</style>