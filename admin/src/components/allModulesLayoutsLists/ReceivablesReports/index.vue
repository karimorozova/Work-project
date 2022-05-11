<template lang="pug">
  .layout
    LayoutWrapper(
      :hasFilterButton="true"
      :hasSettingButton="true"
      :moduleType="moduleType"
      @makeDBRequest="collectQueryData(getModuleData)"
    )

      //template(slot="filter" slot-scope="{ tableFilters }")
      //  CustomFilters(
      //    :tableFilters="tableFilters"
      //  )
      template(slot="table" slot-scope="{ tableFields, tableSorting, tableMaxHeight }")
        ListTable(
          :fields="tableFields"
          :sorting="tableSorting"
          :tableMaxHeight="tableMaxHeight"
          :data="moduleData"
          @lazyLoading="collectQueryData(lazyLoading)"
          @makeDBSortingRequest="collectQueryData(getModuleData)"
        )
          template(slot="sf_projectId" slot-scope="{ item, index }")
            router-link(:to="{path: `/pangea-projects/all-projects/All/details/${item._id}`}" )
              span {{ item.projectId }}

          template(slot="sf_projectName" slot-scope="{ item, index }")
            span {{ item.projectName.length > 28 ? item.projectName.substr(0, 28) + '...' : item.projectName }}

          template(slot="sf_billingName" slot-scope="{ item, index }")
            router-link(class="link-to" target='_blank' :to="{path: `/pangea-clients/all/details/${item.customer._id}`}")
              div {{ item.customer.name }}

          template(slot="sf_stepId" slot-scope="{ item, index }")
            span {{ item.steps.stepId || '-' }}

          template(slot="sf_step" slot-scope="{ item, index }")
            span {{ item.type === 'Classic' ? item.steps.stepAndUnit.step.title : item.steps.title }}

          template(slot="sf_languagePair" slot-scope="{ item, index }")
            span(v-if="item.type === 'Classic'" )
              span(v-if="item.steps.sourceLanguage === item.steps.targetLanguage") {{ item.steps.targetLanguage }}
              span(v-else) {{ item.steps.sourceLanguage }}
                span(style="font-size: 12px;color: #9c9c9c;margin: 0 4px;")
                  i(class="fas fa-angle-double-right")
                | {{ item.steps.targetLanguage }}
            span(v-else) -

          template(slot="sf_status" slot-scope="{ item, index }")
            .table__data {{ item.steps.status || 'Completed' }}

          template(slot="sf_billingDate" slot-scope="{ item, index }")
            span {{ dateFormat( item.billingDate ) }}

          template(slot="sf_fee" slot-scope="{ item, index }")
            span
              span.currency(v-html="returnIconCurrencyByStringCode(item.projectCurrency)")
              span {{ +(item.steps.finance.Price.receivables).toFixed(2) }}

</template>

<script>
import { mapActions } from "vuex"
// import LayoutWrapper from "../LayoutWrapper"
// import ListTable from "../ListTable"
import LayoutWrapperMixin from "../../../mixins/LayoutWrapperMixin"
// import CustomFilters from "../Projects/CustomFilters"
import ListTable from "../ListTable"
import LayoutWrapper from "../LayoutWrapper"
import currencyIconDetected from "../../../mixins/currencyIconDetected"
// import CustomFilters from "./CustomFilters"

const MODULE_TYPE = 'receivables-reports-steps'

export default {
  mixins: [ LayoutWrapperMixin, currencyIconDetected ],
  components: {
    // CustomFilters,
    ListTable,
    LayoutWrapper
  },
  name: "index",
  data() {
    return {
      moduleType: MODULE_TYPE,
      moduleData: [],
      isDataRemain: true
    }
  },
  methods:{
    async getModuleData({ sort = {}, query = {} }) {
      console.log('getModuleData')
      try {
        const res = await this.$http.post(`/layouts-api/${ this.moduleType }`, {
          countToGet: 50,
          countToSkip: 0,
          sort,
          query
        })
        this.moduleData = res.data
        this.isDataRemain = res.data.length === 50
      } catch (e) {
        this.alertToggle({ message: e.data, isShow: true, type: "error" })
      }
    },
    async lazyLoading({ sort = {}, query = {} }) {
      console.log('lazyLoading')
      if (!this.isDataRemain) return
      try {
        const res = await this.$http.post(`/layouts-api/${ this.moduleType }`, {
          countToGet: 50,
          countToSkip: this.moduleData.length,
          sort,
          query
        })
        this.moduleData.push(...res.data)
        this.isDataRemain = res.data.length === 50
      } catch (e) {
        this.alertToggle({ message: e.data, isShow: true, type: "error" })
      }
    },
    collectQueryData(callback) {
      const sort = {}
      const query = {}

      for (const paramsKey in this.$route.params) {
        if (this.$route.params[paramsKey]) {
          query[paramsKey] = this.$route.params[paramsKey]
        }
      }
      for (const queryKey in this.$route.query) {
        if (this.$route.query[queryKey]) {
          const [ prefix ] = queryKey.split('_')
          prefix === 'sf'
              ? sort[queryKey] = this.$route.query[queryKey]
              : query[queryKey] = this.$route.query[queryKey]
        }
      }
      if (callback) return callback({ sort, query })
    },
    ...mapActions([ 'alertToggle' ])
  },

  created() {
    this.collectQueryData(this.getModuleData)
  },
}
</script>

<style scoped lang="scss">

</style>