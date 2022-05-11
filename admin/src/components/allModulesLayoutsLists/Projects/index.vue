<template lang="pug">
  .layout
    LayoutWrapper(
      :hasFilterButton="true"
      :hasSettingButton="true"
      :moduleType="moduleType"
      @makeDBRequest="collectQueryData(getModuleData)"
    )

      template(slot="filter" slot-scope="{ tableFilters }")
        CustomFilters(
          :tableFilters="tableFilters"
        )
      template(slot="table" slot-scope="{ tableFields, tableSorting, tableMaxHeight }")
        ListTable(
          :fields="tableFields"
          :sorting="tableSorting"
          :tableMaxHeight="tableMaxHeight"
          :data="moduleData"
          @lazyLoading="collectQueryData(lazyLoading)"
          @makeDBSortingRequest="collectQueryData(getModuleData)"
        )

          template(slot="sf_projectID" slot-scope="{ item, index }")
            router-link(:to="{path: `/pangea-projects/all-projects/All/details/${item._id}`}" )
              span {{ item.projectId }}

          template(slot="sf_projectName" slot-scope="{ item, index }")
            span {{ item.projectName.length > 28 ? item.projectName.substr(0, 28) + '...' : item.projectName }}

          template(slot="sf_clientName" slot-scope="{ item, index }")
            router-link(:to="{path: `/pangea-clients/all/details/${item.customer._id}`}" target="_blank")
              span {{ item.customer.name }}

          template(slot="sf_startDate" slot-scope="{ item, index }")
            span {{ dateFormat(item.startDate) }}

          template(slot="sf_deadline" slot-scope="{ item, index }")
            span {{ dateFormat(item.deadline) }}

          template(slot="sf_projectManager" slot-scope="{ item, index }")
            .table__data {{ item.projectManager.firstName }} {{ item.projectManager.lastName || '' }}

          template(slot="sf_accountManager" slot-scope="{ item, index }")
            .table__data {{ item.accountManager.firstName }} {{ item.accountManager.lastName || '' }}

          template(slot="sf_industry" slot-scope="{ item, index }")
            .table__data {{ item.industry.name }}

          template(slot="sf_languages" slot-scope="{ item, index }")
            .table__data(v-html="projectLanguages(item.tasks)")

          template(slot="sf_requestId" slot-scope="{ item, index }")
            router-link(v-if="!!item.requestId" :to="{path: `/pangea-projects/requests/closed-requests/Closed/details/${item.requestId._id}`}")
              span {{item.requestId.projectId}}
            span(v-else) -

          template(slot="sf_isTest" slot-scope="{ item, index }")
            span(v-if="item.isTest")
              i.fas.fa-check
            span(v-else) -

          template(slot="sf_urgent" slot-scope="{ item, index }")
            span(v-if="item.isUrgent")
              i.fas.fa-check
            span(v-else) -

          template(slot="sf_payables" slot-scope="{ item, index }")
            span(v-if="item.finance.Price && item.finance.Price.payables") {{ +(item.finance.Price.payables).toFixed(2) }}
            span(v-else) -

          template(slot="sf_receivables" slot-scope="{ item, index }")
            span(v-if="item.finance.Price && item.finance.Price.receivables") {{ +(item.finance.Price.receivables).toFixed(2) }}
            span(v-else) -

          template(slot="sf_total" slot-scope="{ item, index }")
            span(v-if="item.total &&item.finance.Price && item.finance.Price.receivables") {{ +(item.total).toFixed(2) }}
            span(v-else) -

          template(slot="sf_margin" slot-scope="{ item, index }")
            span(v-if="item.finance.Price && item.finance.Price.receivables || item.finance.Price.payables") {{ +(item.margin).toFixed(2) }}
            span(v-else) -

          template(slot="sf_marginPercent" slot-scope="{ item, index }")
            span(v-if="item.finance.Price && item.finance.Price.receivables || item.finance.Price.payables") {{ +(item.marginPercent).toFixed(0) }}
            span(v-else) -

          template(slot="sf_roi" slot-scope="{ item, index }")
            span(v-if="item.finance.Price && item.finance.Price.receivables || item.finance.Price.payables") {{ +(item.roi).toFixed(0) }}
            span(v-else) -

          template(slot="sf_projectCurrency" slot-scope="{ item, index }")
            span(v-if="item.projectCurrency") {{ item.projectCurrency }}
            span(v-else) -

          template(slot="sf_status" slot-scope="{ item, index }")
            span {{ item.status }}

          template(slot="sf_vendors" slot-scope="{ item, index }")
            span(v-if="item.steps.length" style="display: flex; flex-wrap: wrap;")
              router-link( v-for="step in item.steps" v-if="step.vendor" :to="{path: `/pangea-vendors/all/details/${step.vendor._id}`}" target="_blank")
                div(style="margin-right: 5px;") {{ step.vendor.firstName }},
            span(v-else) -

          template(slot="sf_tasksServices" slot-scope="{ item, index }")
            span(v-if="item.tasks.length" ) {{getUniqueTaskAndStepsAtr(item).tasksServices }}
            span(v-else)

          template(slot="sf_stepsServices" slot-scope="{ item, index }")
            span(v-if="item.steps.length" ) {{ getUniqueTaskAndStepsAtr(item).stepsServices }}
            span(v-else)

          template(slot="sf_tasksStatuses" slot-scope="{ item, index }")
            span(v-if="item.tasks.length" ) {{getUniqueTaskAndStepsAtr(item).tasksStatuses }}
            span(v-else)

          template(slot="sf_stepsStatuses" slot-scope="{ item, index }")
            span(v-if="item.steps.length" ) {{ getUniqueTaskAndStepsAtr(item).stepsStatuses }}
            span(v-else)

          template(slot="sf_extraServices" slot-scope="{ item, index }")
            span(v-if="item.additionsSteps.length" ) {{ item.additionsSteps.map(i => i.title).join(", ")}}
            span(v-else)
</template>

<script>
import { mapActions } from "vuex"
import LayoutWrapper from "../LayoutWrapper"
import ListTable from "../ListTable"
import LayoutWrapperMixin from "../../../mixins/LayoutWrapperMixin"
import CustomFilters from "./CustomFilters"

export default {
  mixins: [ LayoutWrapperMixin ],
  name: "index",
  data() {
    return {
      moduleType: 'project'
    }
  },
  methods: {
    // Table Logic >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    getUniqueTaskAndStepsAtr({ tasks, steps }) {
      return {
        stepsStatuses: makeUnique(steps.map(i => i.status)),
        stepsServices: makeUnique(steps.map(i => i.step.title)),
        tasksStatuses: makeUnique(tasks.map(i => i.status)),
        tasksServices: makeUnique(tasks.map(i => i.service.title))
      }

      function makeUnique(arr) {
        return [ ...new Set(arr) ].join(', ')
      }
    },
    projectLanguages(tasks) {
      if (!tasks.length) return '-'
      const taskLanguages = tasks.map(({ fullSourceLanguage, fullTargetLanguage }) =>
          ({ sourceLanguage: fullSourceLanguage.symbol, targetLanguage: fullTargetLanguage.symbol }))

      return Object.entries(_.groupBy(taskLanguages, 'sourceLanguage'))
          .map(item => ({ sourceLanguage: item[0], targetLanguages: [ ...new Set(item[1].map(({ targetLanguage }) => targetLanguage)) ].join(';&ensp;') }))
          .reduce((acc, curr) => {
            acc = acc + `${ curr.sourceLanguage } <span style="font-size: 12px;color: #999;margin: 0 2px;"><i class="fas fa-angle-double-right"></i></span> ${ curr.targetLanguages } <br>`
            return acc
          }, '')
    }
    // Wrapper Logic >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  },
  created() {
    this.collectQueryData(this.getModuleData)
  },
  components: {
    CustomFilters,
    ListTable, LayoutWrapper
  }
}
</script>
