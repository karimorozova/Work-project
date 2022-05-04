<template lang="pug">
  .layout
    LayoutWrapper(
      :hasFilterButton="true"
      :hasSettingButton="true"
      :moduleType="moduleType"
    )

      template(slot="filter" slot-scope="{ tableFilters }")
        CustomFilters(
          :tableFilters="tableFilters"
        )

      template(slot="table" slot-scope="{ tableFields, tableMaxHeight }")
        ListTable(
          :fields="tableFields"
          :tableMaxHeight="tableMaxHeight"
          :data="moduleData"
          @lazyLoading="lazyLoading"
        )
          template(slot="projectID" slot-scope="{ item, index }")
            router-link(:to="{path: `/pangea-projects/all-projects/All/details/${item._id}`}" )
              span {{ item.projectId }}

          template(slot="projectName" slot-scope="{ item, index }")
            span {{ item.projectName.length > 28 ? item.projectName.substr(0, 28) + '...' : item.projectName }}

          template(slot="clientName" slot-scope="{ item, index }")
            router-link(:to="{path: `/pangea-clients/all/details/${item.customer._id}`}" target="_blank")
              span {{ item.customer.name }}

          template(slot="startDate" slot-scope="{ item, index }")
            span {{ dateFormat(item.startDate) }}

          template(slot="deadline" slot-scope="{ item, index }")
            span {{ dateFormat(item.deadline) }}

          template(slot="projectManager" slot-scope="{ item, index }")
            .table__data {{ item.projectManager.firstName }} {{ item.projectManager.lastName || '' }}

          template(slot="accountManager" slot-scope="{ item, index }")
            .table__data {{ item.accountManager.firstName }} {{ item.accountManager.lastName || '' }}

          template(slot="industry" slot-scope="{ item, index }")
            .table__data {{ item.industry.name }}

          template(slot="languages" slot-scope="{ item, index }")
            .table__data(v-html="projectLanguages(item.tasks)")

          template(slot="requestId" slot-scope="{ item, index }")
            router-link(v-if="!!item.requestId" :to="{path: `/pangea-projects/requests/closed-requests/Closed/details/${item.requestId._id}`}")
              span {{item.requestId.projectId}}
            span(v-else) -

          template(slot="isTest" slot-scope="{ item, index }")
            span(v-if="item.isTest")
              i.fas.fa-check
            span(v-else) -

          template(slot="urgent" slot-scope="{ item, index }")
            span(v-if="item.isUrgent")
              i.fas.fa-check
            span(v-else) -

          template(slot="payables" slot-scope="{ item, index }")
            span(v-if="item.finance.Price && item.finance.Price.payables") {{ +(item.finance.Price.payables).toFixed(2) }}
            span(v-else) -

          template(slot="receivables" slot-scope="{ item, index }")
            span(v-if="item.finance.Price && item.finance.Price.receivables") {{ +(item.finance.Price.receivables).toFixed(2) }}
            span(v-else) -

          template(slot="total" slot-scope="{ item, index }")
            span(v-if="item.finance.Price && item.finance.Price.receivables") {{ priceTotal(item) }}
            span(v-else) -

          template(slot="margin" slot-scope="{ item, index }")
            span(v-if="item.finance.Price && item.finance.Price.receivables && item.finance.Price.payables")
              span {{+(+item.finance.Price.receivables - +item.finance.Price.payables).toFixed(2) }}
              sup {{ +((1 - (+item.finance.Price.payables / +item.finance.Price.receivables)) * 100).toFixed(0) }} %
            span(v-else) -

          template(slot="roi" slot-scope="{ item, index }")
            span(v-if="item.finance.Price && item.finance.Price.receivables && item.finance.Price.payables")
              span {{ getROI(item) }}
            span(v-else) -

          template(slot="projectCurrency" slot-scope="{ item, index }")
            span(v-if="item.projectCurrency") {{ item.projectCurrency }}
            span(v-else) -

          template(slot="status" slot-scope="{ item, index }")
            span {{ item.status }}

          template(slot="vendors" slot-scope="{ item, index }")
            span(v-if="item.steps.length" style="display: flex; flex-wrap: wrap;")
              router-link( v-for="step in item.steps" v-if="step.vendor" :to="{path: `/pangea-vendors/all/details/${step.vendor._id}`}" target="_blank")
                div(style="margin-right: 5px;") {{ step.vendor.firstName }},
            span(v-else) -

          template(slot="tasksServices" slot-scope="{ item, index }")
            span(v-if="item.tasks.length" ) {{getUniqueTaskAndStepsAtr(item).tasksServices }}
            span(v-else)

          template(slot="stepsServices" slot-scope="{ item, index }")
            span(v-if="item.steps.length" ) {{ getUniqueTaskAndStepsAtr(item).stepsServices }}
            span(v-else)

          template(slot="tasksStatuses" slot-scope="{ item, index }")
            span(v-if="item.tasks.length" ) {{getUniqueTaskAndStepsAtr(item).tasksStatuses }}
            span(v-else)

          template(slot="stepsStatuses" slot-scope="{ item, index }")
            span(v-if="item.steps.length" ) {{ getUniqueTaskAndStepsAtr(item).stepsStatuses }}
            span(v-else)

          template(slot="extraServices" slot-scope="{ item, index }")
            span(v-if="item.additionsSteps.length" ) {{ item.additionsSteps.map(i => i.title).join(", ")}}
            span(v-else)
</template>

<script>
import { mapActions } from "vuex"
import LayoutWrapper from "../LayoutWrapper"
import ListTable from "../ListTable"
import LayoutWrapperMixin from "../../../mixins/LayoutWrapperMixin"
import _ from "lodash"
import CustomFilters from "./CustomFilters"

const MODULE_TYPE = 'project'
export default {
  mixins: [ LayoutWrapperMixin ],
  name: "index",
  data() {
    return {
      moduleType: MODULE_TYPE,
      moduleData: [],
      isDataRemain: true
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
    getROI({ finance: { Price: { receivables, payables } } }) {
      const roi = Math.round(((+receivables - +payables) / +payables) * 100)
      return isNaN(roi) || !isFinite(roi) ? '-' : (roi)
    },
    priceTotal({ finance: { Price: { receivables } }, additionsSteps }) {
      const additionsStepsSum = additionsSteps.reduce((acc, { finance }) => acc += finance.Price.receivables, 0)
      return +(+receivables + +additionsStepsSum).toFixed(2)
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
    },

    // Wrapper Logic >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    // { query = {}, sort = { _id: -1 }, options = {}, project = {}, countToSkip = 0, countToGet = 50
    async getModuleData() {
      try {
        const res = await this.$http.post(`/layouts-api/${ this.moduleType }`, {
          countToGet: 50,
          countToSkip: 0
        })
        this.moduleData = res.data
        this.isDataRemain = res.data.length === 50
      } catch (e) {
        this.alertToggle({ message: e.data, isShow: true, type: "error" })
      }
    },
    async lazyLoading() {
      if (!this.isDataRemain) return
      try {
        const res = await this.$http.post(`/layouts-api/${ this.moduleType }`, {
          countToGet: 50,
          countToSkip: this.moduleData.length
        })
        this.moduleData.push(...res.data)
        this.isDataRemain = res.data.length === 50
      } catch (e) {
        this.alertToggle({ message: e.data, isShow: true, type: "error" })
      }
    },
    ...mapActions([ 'alertToggle' ])
  }
  ,
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      // vm.defaultSetter()
      // vm.querySetter(vm, to)
      // let { status } = to.params
      // status.includes('_') ? vm.status = status.replace('_', ' ') : vm.status = status
      vm.getModuleData()
    })
  }
  ,
// watch: {
//   $route(to, from) {
//     if (to.path === from.path) {
//       this.querySetter(this, to)
//       this.getData()
//     }
//   }
// },

  components: {
    CustomFilters,
    ListTable, LayoutWrapper
  }
}
</script>

<style lang="scss" scoped>
.short {

}
</style>