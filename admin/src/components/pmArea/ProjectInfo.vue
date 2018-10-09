<template lang="pug">
.project-info
    .project-info__title Project Details
    .project-info__all-info
        Project(:project="currentProject")
        ProjectShortDetails(:project="currentProject" @setStatus="setStatus")
    .project-info__tasks
        .project-info__tasks-title Tasks and Steps
        .project-info__input-data-row
            .project-info__tasks-col
                .project-info__drop-menu
                    SelectSingle(
                        :selectedOption="sourceLanguage" 
                        :options="allLangs" 
                        placeholder="Source Language"
                        refersTo="sourceLanguage"
                        @chooseOption="setValue"
                    )
                .project-info__drop-menu
                    SelectSingle(
                        :selectedOption="template"
                        :options="allTemplates"
                        placeholder="Template"
                        refersTo="template"
                        @chooseOption="setValue"
                    )
            .project-info__tasks-col
                .project-info__drop-menu            
                    SelectMulti(
                        :selectedOptions="targetLangs"
                        :options="allLangs" 
                        placeholder="Target Language"
                        @chooseOptions="setTargets"
                    )
                .project-info__drop-menu           
                    SelectSingle(
                        :selectedOption="service" 
                        :options="allServices" 
                        placeholder="Service"
                        refersTo="service"
                        @chooseOption="setValue"
                    )     
            .project-info__tasks-col
                .project-info__upload-file
                    UploadFileButton(text="Source Files" @uploadFiles="uploadDetailFiles")
                .project-info__upload-file
                    UploadFileButton(text="Reference Files" @uploadFiles="uploadRefFiles")
            .project-info__tasks-col       
                .project-info__add-tasks
                    Button(value="Add tasks" @clicked="addTasks")
        Tasks(v-if="currentProject.tasks.length && !currentProject.steps.length"
            :allTasks="currentProject.tasks"
        )
        Steps(v-if="currentProject.steps.length"
            :allSteps="currentProject.steps"
            :vendors="allVendors"
            @selectAll="selectAll"
            @setVendor="setVendor"
        )
        Button(v-if="currentProject.tasks.length" :value="metricsButton" @clicked="getMetrics")
</template>

<script>
import SelectSingle from "../SelectSingle";
import SelectMulti from "../SelectMulti";
import UploadFileButton from "../UploadFileButton";
import Button from "../Button";
import LabelValue from "./LabelValue";
import Project from "./Project";
import ProjectShortDetails from "./ProjectShortDetails";
import Tasks from "./Tasks";
import Steps from "./Steps";
import { mapGetters, mapActions } from 'vuex';

export default {
    props: {
        
    },
    data() {
        return {
            templates: [
                {name: 'Excel segment limit', id: 'XLSwithLimit'},
                {name: 'Multilingual Excel', id: 'multiexcel'},
                {name: 'Standard processing', id: '247336FD'},        
            ],
            template: "",
            sourceLanguage: "",
            targetLanguages: [],
            service: "",
            statuses: ["Accepted", "Draft", "Open", "Ready"],
            sourceFiles: [],
            refFiles: []
        }
    },
    methods: {
        ...mapActions({
            setProjectValue: "setProjectValue",
            storeProject: "setCurrentProject",
            vendorsSetting: "vendorsSetting",
            loadingToggle: 'loadingToggle',
            removeStepVendor: 'removeStepVendor',
            setStepVendor: 'setStepVendor'
        }),
        setVendor({vendor, index}) {
            this.setStepVendor({value: vendor, index: index});
        },
        setStatus({option}) {
           this.setProjectValue({value: option, prop: "status"}) 
        },
        setValue({option, refersTo}) {
            this[refersTo] = option;
        },
        setTargets({option}) {
            const lang = this.languages.find(item => {
                return item.lang === option;
            }) 
            const position = this.targetLangs.indexOf(lang.lang);
            if(position != -1) {
                this.targetLanguages.splice(position, 1)
            } else {
                this.targetLanguages.push(lang);
            }
        },
        uploadDetailFiles({files}) {
            this.sourceFiles = files;
        },
        uploadRefFiles({files}) {
            this.refFiles = files;
        },
        async addTasks() {
            const xtmCustomer = this.xtmCustomers.find(item => {
                return item.name === this.currentProject.customer.name
            });
            const template = this.template ? this.templates.find(item => {
                    return item.name === this.template
                }) : {id: ""}
            const source = this.languages.find(item => {
                return item.lang === this.sourceLanguage;
            })
            const service = this.services.find(item => {
                return item.title === this.service
            })
            let form = new FormData();
            form.append('customerId', xtmCustomer.id);
            form.append('template', template.id);
            form.append('service', service._id);
            form.append('source', JSON.stringify(source));
            form.append('targets', JSON.stringify(this.targetLanguages));
            form.append('projectId', this.currentProject._id);
            form.append('projectName', this.currentProject.projectName);
            if(this.sourceFiles.length) {
                for(let file of this.sourceFiles) {
                    form.append('sourceFiles', file)
                }
            }
            if(this.refFiles.length) {
                for(let file of this.refFiles) {
                    form.append('refFiles', file)
                }
            }
            this.loadingToggle(true);
            const updatedProject = await this.$http.post('/xtm/add-tasks', form);
            await this.storeProject(updatedProject.body);
            this.$emit("tasksAdded", {id: this.currentProject._id});
            this.loadingToggle(false);
        },
        async getMetrics() {
            this.loadingToggle(true);
            let project = JSON.stringify(this.currentProject);
            project = JSON.parse(project);
            for(let task of project.tasks) {
                const metrics = await this.$http.get(`/xtm/project-metrics?projectId=${task.projectId}`);
                task.metrics = metrics.body.metrics;
                for(const key in metrics.body.progress) {
                    const existedTask = project.steps.find(item => {
                        return item.taskId === task.id && item.name === key
                    })
                    if(!existedTask) {
                        project.steps.push({
                            taskId: task.id,
                            name: key,
                            source: task.sourceLanguage,
                            target: task.targetLanguage,
                            vendor: "",
                            start: "",
                            deadline: "",
                            progress: metrics.body.progress[key],
                            status: "",
                            receivables: "",
                            payables: "",
                            margin: "",
                            check: false
                        })
                    } else {
                        for(const step of project.steps) {
                            if(step.taskId === task.id) {
                                step.progress = metrics.body.progress[step.name];
                            }
                        }
                    }
                }
            }
            project.isMetricsExist = true;
            await this.$http.post('/xtm/update-project', {id: project._id, tasks: project.tasks, steps: project.steps, isMetricsExist: project.isMetricsExist});
            const updatedProject = await this.$http.get(`/service/costs?projectId=${project._id}`);
            await this.storeProject(updatedProject.body);
            this.$emit("refreshProjects");
            this.loadingToggle(false);
        },
        async getVendors() {
            if(!this.allVendors.length) {
                const result = await this.$http.get('/all-vendors');
                this.vendorsSetting(result.body);
            }
            this.loadingToggle(false);
        },
        async selectAll({isAllSelected}) {
            const steps = this.currentProject.steps.map(item => {
                item.check = isAllSelected;
                return item;
            })
            await this.setProjectValue({value: steps, prop: 'steps'});
        }
    },
    computed: {
        ...mapGetters({
            currentProject: 'getCurrentProject',
            languages: "getAllLanguages",
            services: "getVuexServices",
            xtmCustomers: "getXtmCustomers",
            allVendors: "getVendors"
        }),
        allLangs() {
            return this.languages.map(item => {
                return item.lang
            })
        },
        allServices() {
            return this.services.map(item => {
                return item.title
            })
        },
        allTemplates() {
            return this.templates.map(item => {
                return item.name
            })
        },
        targetLangs() {
            return this.targetLanguages.map(item => {
                return item.lang
            })
        },
        metricsButton() {
            return this.currentProject.isMetricsExist ? "Refresh metrics" : "Get metrics"
        }
    },
    components: {
        SelectSingle,
        SelectMulti,
        UploadFileButton,
        Button,
        LabelValue,
        Project,
        ProjectShortDetails,
        Tasks,
        Steps
    },
    mounted() {
        this.getVendors();
        if(!this.currentProject._id) {
            this.$router.replace({name: "pm-projects"})
        }
    }
}
</script>

<style lang="scss" scoped>
.project-info {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    &__title {
        padding: 20px 0 0 40px;
        font-size: 20px;
    }
    &__all-info {
        width: 100%;
        display: flex;
        align-items: flex-start;
    }    
    &__drop-menu {
        position: relative;
        height: 28px;
        width: 191px;
    }
    &__tasks {
        box-sizing: border-box;
        width: 60%;
        padding: 20px;
        margin-left: 20px;
        box-shadow: 0 3px 20px rgba(104, 87, 62, 0.5);
    }
    &__tasks-title {
        font-size: 18px; 
        margin-bottom: 15px;
    }
    &__input-data-row {
        margin-bottom: 20px;
        width: 100%;
        display: flex;
        justify-content: space-between;
        padding-bottom: 20px;
        border-bottom: 1px solid #68573E;
    }
    &__tasks-col {
        width: 25%;
        height: 78px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: flex-start;
    }
    &__add-tasks {
        display: flex;
        height: 78px;
        align-items: flex-end;
    }
}
</style>
