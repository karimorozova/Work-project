<template lang="pug">
  .layout
    LayoutWrapper(
      :hasFilterButton="true"
      :hasSettingButton="true"
      :moduleType="moduleType"
      @makeDBRequest="collectQueryData(getModuleData)"
    )
      template(slot="icons")
        Button(value="Test")

      template(slot="filter" slot-scope="{ tableFilters }")
        CustomFilters(
          :tableFilters="tableFilters"
        )
      template(slot="table" slot-scope="{ tableFields, tableSorting, tableMaxHeight }")
        ListTable(
          :fields="tableFields"
          :sorting="tableSorting"
          :tableMaxHeight="tableMaxHeight/2"
          :data="moduleData.steps"
          @lazyLoading="collectQueryData(lazyLoading)"
          @makeDBSortingRequest="collectQueryData(getModuleData)"
        )
          template(slot="sf_projectId" slot-scope="{ item, index }")
            router-link(:to="{path: `/pangea-projects/all-projects/All/details/${item._id}`}" )
              span {{ item.projectId }}

          template(slot="sf_projectName" slot-scope="{ item, index }")
            span {{ item.projectName.length > 28 ? item.projectName.substr(0, 28) + '...' : item.projectName }}

          template(slot="sf_customer.name" slot-scope="{ item, index }")
            router-link(class="link-to" target='_blank' :to="{path: `/pangea-clients/all/details/${item.customer._id}`}")
              div {{ item.customer[0].name }}

          template(slot="sf_steps.stepId" slot-scope="{ item, index }")
            span {{ item.steps.stepId || '-' }}

          template(slot="sf_steps.stepAndUnit.step.title" slot-scope="{ item, index }")
            span {{ item.steps.stepAndUnit.step.title || '-' }}

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

        ListTable(
          :fields="tableFields"
          :sorting="tableSorting"
          :tableMaxHeight="tableMaxHeight/2"
          :data="moduleData.additionsSteps"
          @lazyLoading="collectQueryData(lazyLoading)"
          @makeDBSortingRequest="collectQueryData(getModuleData)"
        )
          template(slot="sf_projectId" slot-scope="{ item, index }")
            router-link(:to="{path: `/pangea-projects/all-projects/All/details/${item._id}`}" )
              span {{ item.projectId }}

          template(slot="sf_projectName" slot-scope="{ item, index }")
            span {{ item.projectName.length > 28 ? item.projectName.substr(0, 28) + '...' : item.projectName }}



</template>

<script>
import LayoutWrapperMixin from "../../../mixins/LayoutWrapperMixin"
import ListTable from "../ListTable"
import LayoutWrapper from "../LayoutWrapper"
import currencyIconDetected from "../../../mixins/currencyIconDetected"
import CustomFilters from "./CustomFilters"
import Button from "../../Button"

export default {
  mixins: [ LayoutWrapperMixin, currencyIconDetected ],
  components: {
    CustomFilters,
    ListTable,
    LayoutWrapper,
    Button,
  },
  name: "index",
  data() {
    return {
      moduleType: 'receivables-reports-steps'
    }
  },
  created() {
    this.collectQueryData(this.getModuleData)
  },
}
</script>

<style scoped lang="scss">

</style>