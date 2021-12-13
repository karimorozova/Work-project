<template lang="pug">
  .step-dashboard
    | Soon ...
    //StepsDashboardFilters(
    //  v-if="userGroup && user"
    //  :userId="user._id"
    //  :userGroup="userGroup"
    //)
    //LayoutsTable(
    //  :fields="fields"
    //  :tableData="steps"
    //  @bottomScrolled="bottomScrolled"
    //)
    //  template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
    //    .table__header {{ field.label }}
    //
    //  template(slot="projectId" slot-scope="{ row, index }")
    //    .table__data
    //      router-link(class="link-to" :to="{path: `/pangea-projects/all-projects/All/details/${row._id}`}")
    //        span {{row.projectId}}
    //
    //  template(slot="projectName" slot-scope="{ row, index }")
    //    .table__data
    //      router-link(class="link-to" :to="{path: `/pangea-projects/all-projects/All/details/${row._id}`}")
    //        span {{ getProjectName( row.projectName ) }}
    //
    //  template(slot="clientName" slot-scope="{ row, index }")
    //    .table__data {{row.customer.name}}
    //
    //  template(slot="status" slot-scope="{ row, index }")
    //    .table__data {{row.steps.status}}
    //
    //  template(slot="langPair" slot-scope="{ row, index }")
    //    .table__data
    //      span {{row.steps.sourceLanguage}} &ensp;
    //      span( style="font-size: 12px;color: #9c9c9c;margin: 0 2px;")
    //        i(class="fas fa-angle-double-right")
    //      span {{row.steps.targetLanguage}} &ensp;
    //
    //  template(slot="langPair" slot-scope="{ row, index }")
    //    .table__data
    //      span {{row.steps.sourceLanguage+' '}}
    //      span( style="font-size: 12px;color: #9c9c9c;margin: 0 2px;")
    //        i(class="fas fa-angle-double-right")
    //      span {{' ' + row.steps.targetLanguage}}
    //
    //  template(slot="step" slot-scope="{ row, index }")
    //    .table__data
    //      span {{row.steps.stepAndUnit.step.title}}
    //
    //  template(slot="vendor" slot-scope="{ row, index }")
    //    .table__data(v-if="row.steps.vendor")
    //      span {{row.steps.vendor.firstName + ' ' + row.steps.vendor.surname  }}
    //    .table__data(v-else) -
    //  template(slot="startDate" slot-scope="{ row, index }")
    //    .table__data {{ customFormatter(row.startDate) }}
    //
    //  template(slot="deadline" slot-scope="{ row, index }")
    //    .table__data {{ customFormatter(row.deadline) }}
    //
    //  template(slot="projectManager" slot-scope="{ row, index }")
    //    .table__data {{ row.projectManager.firstName }} {{ row.projectManager.lastName }}
    //
    //  template(slot="accountManager" slot-scope="{ row, index }")
    //    .table__data {{ row.accountManager.firstName }} {{ row.accountManager.lastName }}

</template>

<script>
import LayoutsTable from "../LayoutsTable"
import Tabs from "../Tabs"
import StepsDashboardFilters from "./StepsDashboardFilters"
import moment from "moment"
import { mapGetters } from "vuex"

export default {
  name: "StepsDashboard",
  components: {
    LayoutsTable,
    Tabs,
    StepsDashboardFilters,
  },
  data() {
    return {
      tabs: ['My Pipeline', 'All Pipeline'],
      selectedTab: 'My Pipeline',
      filteredFields: [],
      steps: [],
      currentPage: 1,
      isDataRemain: false,

      projectId: '',
      projectName: '',
      accountManager: '',
      projectManager: '',
      tasksStatuses: '',
      sourceLanguages: '',
      targetLanguages: '',
      services: '',

      dataVariables: [
        'projectId',
        'projectName',
        'clientName',
        'projectManager',
        'accountManager',
        'startDate',
        'deadline',
        'sourceLanguages',
        'targetLanguages',
        'industry',
        'services',
        'isTest',
        'projectCurrency',
        'paymentProfile',
        'vendors',
        'tasksStatuses',
        'requestId'
      ],
      fields: [
        {
          label: "Project ID",
          headerKey: "headerID",
          key: "projectId",
          style: { "width": "130px" }
        },
        {
          label: "Project Name",
          headerKey: "headerProjectName",
          key: "projectName",
          style: { "width": "170px" }
        },
        {
          label: "Client Name",
          headerKey: "headerСlientName",
          key: "clientName",
          style: { "width": "170px" }
        },
        {
          label: "Status",
          headerKey: "headerStatus",
          key: "status",
          style: { "width": "120px" }
        },
        {
          label: "Language",
          headerKey: "headerLangPair",
          key: "langPair",
          style: { "width": "120px" }
        },
        {
          label: "Step",
          headerKey: "headerStep",
          key: "step",
          style: { "width": "120px" }
        },
        {
          label: "Vendor",
          headerKey: "headerVendor",
          key: "vendor",
          style: { "width": "140px" }
        },
        {
          label: "Start Date",
          headerKey: "headerStartDate",
          key: "startDate",
          style: { "width": "110px" }
        },
        {
          label: "Deadline",
          headerKey: "headerDeadline",
          key: "deadline",
          style: { "width": "110px" }
        },
        {
          label: "Project Manager",
          headerKey: "headerProjectManager",
          key: "projectManager",
          style: { "width": "140px" }
        },
        {
          label: "Account Manager",
          headerKey: "headerAccountManager",
          key: "accountManager",
          style: { "width": "140px" }
        },
      ]
    }
  },
  methods: {
    highlight() {
      return 'test'
    },
    // clearFilters() {
    //   this.$router.replace({ 'query': null }).catch((err) => err)
    //   this.defaultSetter()
    //   // this.getData()
    // },
    // async updateFiltersAndFields(data) {
    //   // await this.$http.post('/pm-manage/update-filters-and-fields/' + this.user._id, { data })
    //   // await this.setUser()
    // },
    async getData() {
      try {
        const result = (await this.$http.post(`/dashboard-api/pipeline?page=1&limit=25`, { filters: this.filters })).data

        this.steps = result
        this.isDataRemain = result.length === 25
      } catch (err) {
        // this.alertToggle({ message: "Error on project getting data", isShow: true, type: "error" })
      }
    },
    // getLastDateFromRes({ data }) {
    //   return (data && data.length) ? data[data.length - 1].startDate : ""
    // },
    querySetter(vm, to) {
      for (let variable of this.dataVariables) {
        if (to.query[variable] != null) vm[variable] = to.query[variable]
      }
    },
    defaultSetter() {
      for (let variable of this.dataVariables) this[variable] = ''
    },
    getProjectName(str) {
      if (!str.substr(0, 32).includes(' ') && str.length > 32) {
        return str.substr(0, 32) + '...'
      }
      return str
    },
    setTab({ index }) {
      this.selectedTab =  this.tabs[index]
    },
    async bottomScrolled() {
      if (this.isDataRemain) {
        this.currentPage += 1
        const result = (await this.$http.post(`/dashboard-api/pipeline?page=${ this.currentPage }&limit=25`, { filters: this.filters})).data
        this.steps.push(...result)
        // this.steps.push(...result.data)
        this.isDataRemain = result.length === 25
        // this.lastDate = this.getLastDateFromRes(result)
      }
    },
    customFormatter(date) {
      return moment(date).format('MMM D, HH:mm')
    },
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.defaultSetter()
      vm.querySetter(vm, to)
      vm.getData()
    })
  },
  computed: {
    ...mapGetters({
      userGroup: "getUserGroup",
      user: "getUser",
    }),
    filters() {
      const filters = { status: this.status }
      for (let variable of this.dataVariables) filters[variable] = this[variable]
      return filters
    }
  },
  watch: {
    $route(to, from) {
      if (to.path === from.path) {
        this.querySetter(this, to)
        this.getData()
      }
    }
  },
  async created() {
    await this.getData()
  }
}
</script>

<style scoped lang="scss">
@import "../../assets/scss/colors";
.test {
  background-color: red;
}
.step-dashboard {
  width: 1530px;
  margin: 50px 50px 0;
  position: relative;

  background: #fff;
  padding: 15px 20px;
  box-sizing: border-box;
  border-radius: 4px;
  box-shadow: 0 1px 2px 0 rgba(99,99,99,.3),0 1px 3px 1px rgba(99,99,99,.15);

  .table {
    &__header {
      padding: 0 0 0 7px;
    }
  }
}

a {
  color: $text;
  text-decoration: none;
  transition: .2s ease-out;

  &:hover {
    text-decoration: underline;
  }
}
</style>