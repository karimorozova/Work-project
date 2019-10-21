<template lang="pug">
    .all-projects
        .all-projects__filters
            ProjectFilters(
                :clientName="clientFilter"
                :sourceLangs="sourceFilter"
                :targetLangs="targetFilter"
                :status="statusFilter"
                :projectManager="managerFilter"
                :managers="managers"
                @addLangFilter="addLangFilter"
                @removeLangFilter="removeLangFilter"
                @setFilter="setFilter"
                :projectsType="projectsType"
            )
        .all-projects__table
            ProjectsTable(
                :allProjects="tableData"
                @selectProject="selectProject"
                @bottomScrolled="bottomScrolled"
            )
</template>

<script>
import moment from "moment";
import ProjectsTable from "./ProjectsTable";
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
            managerFilter: "All",
            startFilter: "",
            deadlineFilter: "",
            managers: []
        }
    },
    methods: {
        ...mapActions(["setCurrentProject"]),
        setFilter({option, prop}) {
            this[prop] = option;            
            this.$emit('filterProjects', this.filters);
        },
        removeLangFilter({from, position}) {
            this[from].splice(position, 1);
            this.$emit('filterProjects', this.filters);
        },
        addLangFilter({to, lang}) {
            this[to].push(lang.symbol);
            this.$emit('filterProjects', this.filters);
        },
        selectProject({project}) {
            this.setCurrentProject(project);
            const request = this.allRequests.find(item => item._id === project._id);
            if(request) {
                return this.$router.push(`/request-details/${project._id}`); 
            }
            this.$router.push(`/project-details/${project._id}`);
        },
        async getManagers() {
            const managers = await this.$http.get("/pm-manage/all-managers?groupFilter=Project%20Managers");
            this.managers = managers.body;
        },
        bottomScrolled() {
            this.$emit("bottomScrolled", {filters: this.filters});
        }
    },
    computed: {
        ...mapGetters({
            allProjects: "getAllProjects",
            allRequests: "getAllRequests",
            allCustomers: "getClients",
        }),
        filters() {
            const managersIds = this.managerFilter !== 'All' ? this.managers.filter(item => `${item.firstName} ${item.lastName}` === this.managerFilter) : null;
            return {
                statusFilter: this.statusFilter,
                managersIds,
                clientFilter: this.clientFilter,
                startFilter: this.startFilter,
                deadlineFilter: this.deadlineFilter,
                sourceFilter: this.sourceFilter,
                targetFilter: this.targetFilter
            }
        },
        tableData() {
            return this.projectsType === 'requests' ? [...this.allRequests] : [...this.allProjects];
        }
    },
    created() {
        this.getManagers();
    },
    mounted() {
        if(this.projectsType === "requests") {
            this.statusFilter = "Requested";
        }
    },
    components: {
        ProjectsTable,
        ProjectInfo,
        ProjectFilters
    }
}
</script>

<style lang="scss" scoped>

.all-projects {
    margin: 50px 20px 20px 20px;
    max-width: 1205px;
    width: calc(100% - 60px);
    box-shadow: 0 0 10px #68573E;
    padding: 15px;
}

</style>
