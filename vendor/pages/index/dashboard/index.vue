<template lang="pug">
  .jobs-layout
    .tabs
      Tabs(
        :tabs="tabs"
        :selectedTab="selectedTab"
        @setTab="setTab"
      )
      .upcoming-counter(v-if="!!quotes.length" )
        .upcoming-counter-icon
          i(class="fa-solid fa-certificate")
        .upcoming-counter-count {{ quotes.length > 9 ? '!!' : quotes.length }}


    div(v-if="selectedTab === 'Open Jobs'" )
      JobsTable(
        :arr="projects"
      )
    div(v-if="selectedTab === 'Upcoming Jobs'")
      JobsTable(
        :arr="quotes"
      )

</template>

<script>
import Tabs from "../../../components/general/Tabs"
import JobsTable from "./sub-components/JobsTable"
import { mapGetters } from "vuex"

export default {
  name: "index",
  components: { JobsTable, Tabs },
  data() {
    return {
      projects: [],
      quotes: [],
      tabs: [ 'Open Jobs', 'Upcoming Jobs' ],
      selectedTab: 'Open Jobs'
    }
  },
  methods: {
    setTab({ index }) {
      this.selectedTab = this.tabs[index]
    },
    async getAllProjects() {
      this.lastDate = new Date()
      this.lastDate.setDate(this.lastDate.getDate() + 1)

      const projects = await this.$axios.post(`/vendor/all-vendor-jobs`, {
        ...this.filters,
        stepsStatuses: { $in: [ 'Approved', 'Rejected', 'Request Sent', 'Ready to Start', 'Waiting to Start', 'In progress' ] },
        lastDate: this.lastDate,
        vendor: this.vendor._id,
        isFilterZeroFinance: false,
        isLimit: false
      })

      projects.data.forEach(elem => {
        const { _id: id, brief, deadline, projectId, projectManager, projectName, startDate, status, steps } = elem
        const job = {
          project_id: id,
          project_brief: brief,
          project_deadline: deadline,
          project_projectId: projectId,
          project_projectManager: projectManager,
          project_projectName: projectName,
          project_startDate: startDate,
          project_status: status,
          total: steps.nativeFinance.Price.payables,
          ...steps
        }

        job.status === 'Request Sent'
            ? this.quotes.push(job)
            : this.projects.push(job)
      })
    }
  },
  computed: {
    ...mapGetters({
      token: 'getToken',
      vendor: 'getVendor'
    })
  },
  created() {
    this.getAllProjects()
  }
}
</script>

<style lang="scss" scoped>
@import "assets/scss/colors";

.jobs-layout {
  padding: 25px;
  background-color: white;
  border-radius: 4px;
  box-shadow: $box-shadow;
  width: 1260px;
  box-sizing: border-box;
  @media all and (max-width: 1400px) {
    width: 1000px;
  }
}

.tabs {
  position: relative;
}

.upcoming-counter {
  position: absolute;
  top: 9px;
  left: 260px;
  display: flex;

  &-count {
    margin-left: -11px;
    margin-top: 3px;
    color: white;
    font-size: 11px;
    font-family: Roboto600;
  }

  &-icon {
    color: $red;
    font-size: 16px;
  }
}


</style>