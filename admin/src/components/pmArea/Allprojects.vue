<template lang="pug">
    .all-projects
        .all-projects__title All Projects
            span.all-projects__arrows(v-if="showProjectDetails") >>
            span.all-projects__full-path(v-if="showProjectDetails") {{ chosenProject.projectName }}
        .all-projects__table(v-if="!showProjectDetails")
            ProjectsTable(
                :allProjects="allProjects"
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
import { mapGetters, mapActions } from 'vuex';

export default {
    data() {
        return {
            projects: [],
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
        selectProject({project}) {
            this.chosenProject = project;
            this.chosenProject.customer = this.allCustomers.find(item => {
                return item._id = project.customer; 
            })
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
        refreshProjects() {
            this.getProjects();
        },
        async getProjects() {
            let projectsArray = await this.$http.get('../api/allprojects');
            this.projects = projectsArray.body;
            this.setStoreProjects(projectsArray.body);
        },
        showJobs(id) {
            this.jobsShow = true;
            let project = this.allProjects.find(item => {
                return item._id == id
            });
            this.jobs = project.jobs;
        },
        async sendMail(ind) {
            let result = await this.$http.post('../clientsapi/mailtoclient', this.allProjects[ind]);
        },
        async vendorsMail() {
            let result = await this.$http.post('../vendorsapi/mailtovendors', JSON.stringify(this.selectedVendors));
        },
        async edit(i) {
            let jobId = this.jobs[i].id;
            this.$http.get(`../xtm/editor?jobId=${jobId}`)
            .then(res => {
                let link = document.createElement('a');
                link.href = res.data;
                link.target = '_blank';
                link.click();
            })
            .catch(err => {
                console.log(err)
            })
        }
    },
    computed: {
        ...mapGetters({
            allProjects: "getAllProjects",
            allCustomers: "getClients",
        }),
        requestDate() {
            let result = '';
            if(this.project.createdAt) {
                result = moment(this.project.createdAt).format('DD-MM-YYYY');
            }
            return result;
        },
        deadline() {
            let result = '';
            if(this.project.date) {
                result = moment(this.project.date).format('DD-MM-YYYY');
            }
            return result;
        },
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
        }
    },
    mounted() {
        this.getProjects();
    },
    components: {
        Vendorselect,
        ProjectsTable,
        ProjectInfo,
    }
}
</script>

<style lang="scss" scoped>

.all-projects {
    margin: 20px;
    width: 900px;
    &__title {
        font-size: 20px;
        margin-bottom: 20px;
    }
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
