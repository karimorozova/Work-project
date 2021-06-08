<template lang="pug">
  .all-projects
    .all-projects__filters
      RequestFilters(
        :clientName="clientFilter"
        :sourceLangs="sourceFilter"
        :targetLangs="targetFilter"
        :status="statusFilter"
        :pmFilter="pmFilter"
        :salesFilter="salesFilter"
        :projectManagers="projectManagers"
        :salesManagers="salesManagers"
        @addLangFilter="addLangFilter"
        @removeLangFilter="removeLangFilter"
        @setFilter="setFilter"
        @refreshProjects="refreshProjects"
        :statuses="statuses"
      )
    .all-projects__table
      RequestsTable(
        :allProjects="tableData"
        @selectProject="selectProject"
        @bottomScrolled="bottomScrolled"
      )
</template>

<script>
import moment from "moment";
import ProjectsTable from "./ProjectsTable";
import RequestsTable from "./RequestsTable";
import ProjectInfo from "./ProjectInfo";
import ProjectFilters from "./ProjectFilters";
import { mapGetters, mapActions } from 'vuex';
import { setClientsRequests } from "../../vuex/clientsRequests/actions"
import RequestFilters from "./clientRequests/RequestFilters";

export default {
  props: {
  },
  data() {
    return {
      clientFilter: "",
      sourceFilter: [],
      targetFilter: [],
      statusFilter: "All",
      pmFilter: "All",
      salesFilter: "All",
      startFilter: "",
      deadlineFilter: "",
      managers: [],
      statuses: ["All", "Client Request", "Request Approved"],
    }
  },
  methods: {
    ...mapActions(["setCurrentProject", "setClientsRequests"]),
    setFilter({ option, prop }) {
      this[prop] = option;
      this.refreshProjects()
      // this.setClientsRequests({filters: this.filters});
      // this.$emit('filterProjects', this.filters);
    },
    removeLangFilter({ from, position }) {
      this[from].splice(position, 1);
      this.refreshProjects()
      // this.setClientsRequests({filters: this.filters});
      // this.$emit('filterProjects', this.filters);
    },
    addLangFilter({ to, lang }) {
      this[to].push(lang);
      this.refreshProjects()
      // this.setClientsRequests({filters: this.filters});
    },
    selectProject({ project }) {
      this.setCurrentProject(project);
      const request = this.allRequests.find(item => item._id === project._id);
      if(request) {
        return this.$router.push(`/request-details/${ project._id }`);
      }
      this.$router.push(`/project-details/${ project._id }`);
    },
    async getManagers() {
      const managers = await this.$http.get("/pm-manage/all-managers?groupFilters=Project%20Managers,Sales");
      this.managers = managers.body;
    },
    bottomScrolled() {
      this.$emit("bottomScrolled", { filters: this.filters });
    },
    refreshProjects() {
      this.setClientsRequests({filters: this.filters});
    },
  },
  computed: {
    ...mapGetters({
      allProjects: "getAllProjects",
      allRequests: "getClientsRequests",
      allCustomers: "getClients",
    }),
    filters() {
      const pmIds = this.pmFilter !== 'All' ? this.managers.filter(item => `${ item.firstName } ${ item.lastName }` === this.pmFilter) : null;
      const salesIds = this.salesFilter !== 'All' ? this.managers.filter(item => `${ item.firstName } ${ item.lastName }` === this.salesFilter) : null;
      return {
        statusFilter: this.statusFilter,
        pmIds,
        salesIds,
        clientFilter: this.clientFilter,
        startFilter: this.startFilter,
        deadlineFilter: this.deadlineFilter,
        sourceFilter: this.sourceFilter,
        targetFilter: this.targetFilter
      }
    },
    tableData() {
      return this.allRequests
    },
    projectManagers() {
      return this.managers.filter(item => item.group.name === 'Project Managers')
    },
    salesManagers() {
      return this.managers.filter(item => item.group.name === 'Sales')
    }
  },
  created() {
    this.getManagers();
  },
  mounted() {
    this.setClientsRequests({});
  },
  components: {
    RequestFilters,
    ProjectsTable,
    RequestsTable,
    ProjectInfo,
    ProjectFilters
  }
}
</script>

<style lang="scss" scoped>

.all-projects {
  width: 1160px;
  box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
  padding: 20px;
}

</style>



