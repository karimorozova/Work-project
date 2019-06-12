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
                :allProjects="filteredProjects"
                @selectProject="selectProject"
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
    },
  },
    data() {
        return {
            clientFilter: "",
            sourceFilter: [],
            targetFilter: [],
            statusFilter: "",
            managerFilter: "",
            startFilter: "",
            deadlineFilter: "",
            projects: [],
            managers: [],
            jobs: [],
            jobsShow: false,
            selectedVendors: [{name: 'All'}],
        }
    },
    methods: {
        ...mapActions({
            setStoreProjects: "setAllProjects",
            storeProject: "setCurrentProject",
            loadingToggle: "loadingToggle",
        }),
        setFilter({option, refersTo}) {
            this[refersTo] = option;
            console.log('option: ', option, 'refers: ', refersTo);
        },
        removeLangFilter({from, position}) {
            this[from].splice(position, 1);
        },
        addLangFilter({to, lang}) {
            this[to].push(lang.symbol);
        },
        selectProject({project}) {
            this.storeProject(project);
            this.$router.push(`/pm-project-details/${project._id}`);
        },
        async getProjects() {
          let projectsArray;
            if (this.projectsType === 'requests') {
              projectsArray = await this.$http.get('/api/allprojects?status=Requested');
              this.statusFilter = 'Requested';
            } else {
              projectsArray = await this.$http.get('/api/allprojects?status=AllOthers');
            }
            this.projects = projectsArray.body;
            await this.setStoreProjects(this.projects);
        },
        async getManagers() {
            const managers = await this.$http.get("/pm-manage/all-managers");
            this.managers = managers.body;
        },
    },
    computed: {
        ...mapGetters({
            allProjects: "getAllProjects",
            allCustomers: "getClients",
        }),
        filteredProjects() {
            let result = this.allProjects;
            if(this.statusFilter) {
                result = result.filter(item => {
                    return item.status === this.statusFilter;
                })
            }
            if(this.managerFilter) {
                result = result.filter(item => {
                    return item.projectManager.firstName + ' ' + item.projectManager.lastName === this.managerFilter
                })
            }
            if(this.clientFilter) {
                result = result.filter(item => {
                    return item.customer.name.toLowerCase().indexOf(this.clientFilter) !=-1
                })
            }
            if(this.startFilter) {
                result = result.filter(item => {
                    return new Date(item.createdAt) >= this.startFilter
                })
            }
            if(this.startFilter) {
                result = result.filter(item => {
                    return new Date(item.deadline) >= this.deadlineFilter
                })
            }
            if(this.sourceFilter.length) {
                result = result.filter(item => {
                    return this.sourceFilter.indexOf(item.tasks[0].sourceLanguage) != -1;
                })
            }
            if(this.targetFilter.length) {
                result = result.filter(item => {
                    for(const task of item.tasks) {
                        if (this.targetFilter.indexOf(task.targetLanguage) != -1) {
                            return item;
                        }
                    }
                })
            }
            return result;
        }
    },
    created() {
        this.getProjects();
        this.getManagers();
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
