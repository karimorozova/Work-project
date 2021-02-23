<template lang="pug">
  .all-projects
    .all-projects__filters
      ProjectFilters(
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
        :projectsType="projectsType"
        @refreshProjects="refreshProjects"
        :statuses="statuses"
      )
    .all-projects__table
      ProjectsTable(
        v-if="projectsType !== 'requests'"
        :allProjects="tableData"
        @selectProject="selectProject"
        @bottomScrolled="bottomScrolled"
      )
      RequestsTable(
        v-if="projectsType === 'requests'"
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

	export default {
		props: {
			projectsType: {
				type: String
			}
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
				statuses: [],
			}
		},
		methods: {
			...mapActions(["setCurrentProject"]),
			setFilter({ option, prop }) {
				this[prop] = option;
				this.$emit('filterProjects', this.filters);
			},
			removeLangFilter({ from, position }) {
				this[from].splice(position, 1);
				this.$emit('filterProjects', this.filters);
			},
			addLangFilter({ to, lang }) {
				this[to].push(lang.symbol);
				this.$emit('filterProjects', this.filters);
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
				this.$emit('filterProjects', this.filters);
			},
			setStatuses(name) {
				if(name === 'open-projects') {
					this.statuses = ["All", "Approved", "Cancelled", "Cancelled Halfway", "In progress", "Rejected", "Ready for Delivery"]
				} else if(name === 'quote-projects') {
					this.statuses = ["All", "Draft", "Quote sent", "Cost Quote"]
				} else {
					this.statuses = ["Closed"]
				}
			},
		},
		computed: {
			...mapGetters({
				allProjects: "getAllProjects",
				allRequests: "getAllRequests",
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
				return this.projectsType === 'requests' ? [...this.allRequests] : [...this.allProjects];
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
			if(this.projectsType === "requests") {
				this.statusFilter = "Requested";
			}
			this.setStatuses(this.$route.name);
		},
		components: {
			ProjectsTable,
			RequestsTable,
			ProjectInfo,
			ProjectFilters
		}
	}
</script>

<style lang="scss" scoped>

  .all-projects {
    margin: 40px 40px 40px 20px;
    width: 1100px;
    box-shadow: 0 2px 4px 0 rgba(103,87,62,.3), 0 2px 16px 0 rgba(103,87,62,.2);
    padding: 20px;
  }

</style>



