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
            )
        .all-projects__table(v-if="!showProjectDetails")
            ProjectsTable(
                :allProjects="filteredProjects"
                @selectProject="selectProject"
            )
        .all-projects__project(v-if="showProjectDetails")
            ProjectInfo(
                :project="chosenProject"
                @refreshProjects="refreshProjects"
                @setProjectDefault="setProjectDefault"
                @tasksAdded="tasksAdded"
                :vendors="allVendors"
            )
        .all-projects__hide-details(v-if="showProjectDetails")
            button.all-projects__but(@click="back") Back to projects
</template>

<script>
import moment from "moment";
import Vendorselect from "./Vendorselect";
import ProjectsTable from "./ProjectsTable";
import ProjectInfo from "./ProjectInfo";
import ProjectFilters from "./ProjectFilters";
import { mapGetters, mapActions } from 'vuex';

export default {
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
            chosenProject: {},
            showProjectDetails: false,
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
        },
        removeLangFilter({from, position}) {
            this[from].splice(position, 1);
        },
        addLangFilter({to, lang}) {
            this[to].push(lang.symbol);
        },
        selectProject({project}) {
            this.chosenProject = project;
            this.storeProject(this.chosenProject);
            this.$router.push({name: 'pm-project-details'});
        },
        setProjectDefault() {
            this.$emit('setProjectDefault');
        },
        async tasksAdded({id}) {
            await this.getProjects();
            this.chosenProject = this.allProjects.find(item => {
                return item._id === id
            })
        },
        back() {
            this.showProjectDetails = false;
        },
        changeVend(data) {
            if(this.selectedVendors[0].name == 'All') {
                this.selectedVendors = [];
                this.selectedVendors.push(data.vendor);
            } else {
                if(this.filteredVendors.indexOf(data.vendor._id) != -1) {
                    this.selectedVendors = this.selectedVendors.filter(item => {
                        return item._id != data.vendor._id
                    })
                } else {
                    this.selectedVendors.push(data.vendor);                    
                }
            }
            if(!this.selectedVendors.length) {
                this.selectedVendors = [{name: "All"}]
            }
        },
        async refreshProjects() {
            await this.getProjects();
        },
        async getProjects() {
            let projectsArray = await this.$http.get('/api/allprojects');
            this.projects = projectsArray.body;
            await this.setStoreProjects(projectsArray.body);
        },
        showJobs(id) {
            this.jobsShow = true;
            let project = this.allProjects.find(item => {
                return item._id == id
            });
            this.jobs = project.jobs;
        },
        async sendMail(ind) {
            let result = await this.$http.post('/clientsapi/mailtoclient', this.allProjects[ind]);
        },
        async vendorsMail() {
            let result = await this.$http.post('/vendorsapi/mailtovendors', JSON.stringify(this.selectedVendors));
        },
        async getManagers() {
            const managers = await this.$http.get("/pm-manage/all-managers");
            this.managers = managers.body;
        },
        // async edit(i) {
        //     let jobId = this.jobs[i].id;
        //     this.$http.get(`../xtm/editor?jobId=${jobId}`)
        //     .then(res => {
        //         let link = document.createElement('a');
        //         link.href = res.data;
        //         link.target = '_blank';
        //         link.click();
        //     })
        //     .catch(err => {
        //         console.log(err)
        //     })
        // }
    },
    computed: {
        ...mapGetters({
            allProjects: "getAllProjects",
            allCustomers: "getClients",
        }),
        filteredVendors() {
            let result = [];
            if(this.selectedVendors[0].name == 'All') {
                result = ["All"]
            } else {
                for(let ven of this.selectedVendors) {
                    result.push(ven._id)
                }
            }
            return result;
        },
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
                    return this.sourceFilter.indexOf(item.jobs[0].sourceLanguage) != -1;
                })
            }
            if(this.targetFilter.length) {
                result = result.filter(item => {
                    for(const job of item.jobs) {
                        if (this.targetFilter.indexOf(job.targetLanguage) != -1) {
                            return item;
                        }
                    }
                })
            }
            return result;
        }
    },
    mounted() {
        this.getProjects();
        this.getManagers();
    },
    components: {
        Vendorselect,
        ProjectsTable,
        ProjectInfo,
        ProjectFilters
    }
}
</script>

<style lang="scss" scoped>

.all-projects {
    margin: 50px 20px 20px 20px;
    width: 1205px;
    box-shadow: 0 0 10px #68573E;
    padding: 15px;
    &__hide-details {
        margin-top: 20px;
        width: 100%;
        display: flex;
        justify-content: flex-end;
    }
    &__but {
        width: 160px;
        padding: 3px;
        color: white;
        background-color: #D15F45;
        border: none;
        outline: none;
        border-radius: 10px;
        cursor: pointer;
        box-shadow: 0 3px 10px #67573E;
        &:active {
            box-shadow: 0 0 5px #67573E;
        }
    }
    &__arrows {
        margin: 0 15px;
    }
}

.vendors-select {
    display: flex;
    align-items: center;
    &__title {
        margin-bottom: 0;
        margin-right: 10px;
    }
    .mail {
        margin-left: 10px;
    }
}

.buttons {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
}

.metrics {
    width: 170px;
    margin-right: 5px;
    padding: 3px;
    color: #FFF;
    background-color: green;
    cursor: pointer;
}

.mail {
    width: 110px;
    padding: 3px;
    color: #FFF;
    background-color: green;
    cursor: pointer;
}

.disabled {
    opacity: 0.4;
    cursor: default;
}

</style>
