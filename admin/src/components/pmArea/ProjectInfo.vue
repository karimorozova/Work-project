<template lang="pug">
.project-info
    .project-info__title Project Details
    .project-info__all-info
        Project(:project="currentProject")
        ProjectShortDetails(:project="currentProject" @setStatus="setStatus" @toggleCheck="toggleProjectOption")
    .project-info__all-info
        .project-info__tasks
            .project-info__tasks-title Tasks and Steps
            .project-info__input-data-row
                .project-info__tasks-col
                    .project-info__drop-menu
                        LanguagesSelect(
                            placeholder="Source Languages"
                            :single='true'
                            :selectedLang="sourceLanguage"
                            @chosenLang="setSource"
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
                        LanguagesSelect(
                            placeholder="Target Languages"
                            :selectedLang="targetLangs"
                            @chosenLang="setTargets"
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
                        UploadFileButton(text="Source Files" @uploadFiles="uploadSourceFiles")
                    .project-info__drop-menu           
                        SelectSingle(
                            :selectedOption="selectedWorkflow.name" 
                            :options="workflowStepsNames" 
                            placeholder="Service"
                            @chooseOption="({option}) => setValue({option}, {refersTo: 'selectedWorkflow'})"
                        ) 
                .project-info__tasks-col
                    .project-info__upload-file
                        UploadFileButton(text="Reference Files" @uploadFiles="uploadRefFiles")     
                    .project-info__add-tasks
                        Button(value="Add tasks" @clicked="addTasks")
            .project-info__tasks-steps
                Tasks(v-if="currentProject.tasks.length && isTasksShow"
                    :allTasks="currentProject.tasks"
                    @showTab="showTab"
                )
                Steps(v-if="currentProject.steps.length && isStepsShow"
                    :allSteps="currentProject.steps"
                    :tasks="currentProject.tasks"
                    :vendors="allVendors"
                    @setVendor="setVendor"
                    @setDate="setDate"
                    @showTab="showTab"
                )
                Button(v-if="currentProject.tasks.length" :value="metricsButton" @clicked="getMetrics")
        .project-info__action
            ProjectAction(:project="currentProject")
    .project-info__all-info
        ProjectFinance
</template>

<script>
import SelectSingle from "../SelectSingle";
import SelectMulti from "../SelectMulti";
import LanguagesSelect from "../LanguagesSelect";
import UploadFileButton from "../UploadFileButton";
import Button from "../Button";
import LabelValue from "./LabelValue";
import Project from "./Project";
import ProjectShortDetails from "./ProjectShortDetails";
import ProjectAction from "./ProjectAction";
import ProjectFinance from "./ProjectFinance";
import Tasks from "./Tasks";
import Steps from "./Steps";
import { mapGetters, mapActions } from 'vuex';

export default {
    data() {
        return {
            templates: [
                {name: 'Excel segment limit', id: 'XLSwithLimit'},
                {name: 'Multilingual Excel', id: 'multiexcel'},
                {name: 'Standard processing', id: '247336FD'},        
            ],
            workflowSteps: [{name: "1 Step", id: 2890}, {name: "2 Steps", id: 2917}],
            selectedWorkflow: {name:"2 Steps", id: 2917},
            template: "",
            sourceLanguage: [],
            targetLanguages: [],
            service: "",
            statuses: ["Accepted", "Draft", "Open", "Ready"],
            sourceFiles: [],
            refFiles: [],
            isStepsShow: false,
            isTasksShow: true,
            excludeKeys: ["nonTranslatable", "totalWords"]
        }
    },
    methods: {
        ...mapActions({
            setProjectValue: "setProjectValue",
            storeProject: "setCurrentProject",
            vendorsSetting: "vendorsSetting",
            alertToggle: 'alertToggle',
            removeStepVendor: 'removeStepVendor',
            setStepVendor: 'setStepVendor',
            setStepDate: 'setStepDate',
        }),
        async toggleProjectOption({key}) {
            try {
                const result = await this.$http.put("/pm-manage/project-option", {projectId: this.currentProject._id, property: key});
                await this.storeProject(result.body);
            } catch(err) {
                this.alertToggle({message: "Internal Server Error / Cannot update Project", isShow: true, type: "error"})
            }
        },
        showTab({tab}) {
            if(tab === 'Tasks') {
                this.isStepsShow = false;
                this.isTasksShow = true;
            } else {
                this.isStepsShow = true;
                this.isTasksShow = false;
            }
        },
        async setVendor({vendor, index}) {
            if(this.currentProject.steps[index].vendor && 
                this.currentProject.steps[index].vendor._id === vendor._id) {
                    return
            }
            try {
                await this.setStepVendor({value: vendor, index});
                const step = this.currentProject.steps[index];
                const updatedProject = await this.$http.post('/service/step-payables', {projectId: this.currentProject._id, step: step});
                await this.storeProject(updatedProject.body);
                this.$emit("refreshProjects");
                this.alertToggle({message: "Step data updated", isShow: true, type: "success"})
            } catch(err) {
                this.alertToggle({message: "Internal service error. Cannot calculate payables for the step.", isShow: true, type: "error"})
            }
        },
        async setDate({date, prop, index}) {
            await this.setStepDate({value: date, prop, index});
            this.getMetrics();
        },
        setStatus({option}) {
           this.setProjectValue({value: option, prop: "status"}) 
        },
        setValue({option, refersTo}) {
            this[refersTo] = option;
        },
        setSource({lang}) {
            this.sourceLanguage[0] = lang.symbol;
        },
        setTargets({lang}) { 
            const position = this.targetLangs.indexOf(lang.symbol);
            if(position != -1) {
                this.targetLanguages.splice(position, 1)
            } else {
                this.targetLanguages.push(lang);
            }
        },
        uploadSourceFiles({files}) {
            this.sourceFiles = files;
        },
        uploadRefFiles({files}) {
            this.refFiles = files;
        },
        async addTasks() {
            const xtmCustomer = this.xtmCustomers.find(item => {
                return item.name === this.currentProject.customer.name
            });
            const xtmId = xtmCustomer ? xtmCustomer.id : "";
            const template = this.template ? this.templates.find(item => {
                    return item.name === this.template
                }) : {id: ""}
            const source = this.languages.find(item => {
                return item.symbol === this.sourceLanguage[0];
            })
            const service = this.services.find(item => {
                return item.title === this.service
            })
            let form = new FormData();
            form.append('customerId', xtmId);
            form.append('customerName', this.currentProject.customer.name);
            form.append('template', template.id);
            form.append('workflow', this.selectedWorkflow.id);
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
            try {
                const updatedProject = await this.$http.post('/xtm/add-tasks', form);
                await this.storeProject(updatedProject.body);
                this.$emit("tasksAdded", {id: this.currentProject._id});
                this.alertToggle({message: "Tasks are added.", isShow: true, type: "success"});
            } catch(err) {
                this.alertToggle({message: "Internal service error. Cannot add tasks.", isShow: true, type: "error"})
            }
        },
        wordsCalculation(metrics) {
            const payables = Object.keys(metrics).filter(item => {
                return this.excludeKeys.indexOf(item) === -1;
            }).reduce((init, cur) => {
                return init + metrics[cur].value;
            }, 0);
            const receivables = metrics.totalWords - metrics.nonTranslatable;
            return { receivables, payables };
        },
        async getMetrics() {
            let project = JSON.stringify(this.currentProject);
            project = JSON.parse(project);
            try {
                for(let task of project.tasks) {
                    const metrics = await this.$http.get(`/xtm/project-metrics?projectId=${task.projectId}&customerId=${project.customer._id}`);
                    const { taskMetrics, progress } = metrics.body;
                    task.metrics = {...taskMetrics};
                    task.finance.Wordcount = this.wordsCalculation(task.metrics);
                    const keysArr = Object.keys(progress);
                    for(const key in progress) {
                        const existedTask = project.steps.find(item => {
                            return item.taskId === task.id && item.name === key
                        })
                        if(!existedTask) {
                            const startDate = key === 'translate1' ? new Date() : "";
                            const deadline = keysArr.indexOf(key) === keysArr.length-1 ? project.deadline : ""
                            project.steps.push({
                                taskId: task.id,
                                name: key,
                                source: task.sourceLanguage,
                                target: task.targetLanguage,
                                vendor: "",
                                start: startDate,
                                deadline: deadline,
                                progress: progress[key],
                                status: "Created",
                                receivables: "",
                                payables: "",
                                clientRate: "",
                                finance: {
                                    'Wordcount': { ...task.finance.Wordcount },
                                    'Price': {receivables: "", payables: ""}
                                },
                                vendorRate: "",
                                margin: "",
                                check: false,
                                vendorsClickedOffer: []
                            })
                        } else {
                            for(const step of project.steps) {
                                if(step.taskId === task.id) {
                                    step.progress = progress[step.name];
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
                this.alertToggle({message: "Metrics are received.", isShow: true, type: "success"});
            } catch(err) {
                this.alertToggle({message: "Internal service error. Cannot get metrics.", isShow: true, type: "error"})
            }
        },
        async getVendors() {
            try{
                if(!this.allVendors.length) {
                    const result = await this.$http.get('/all-vendors');
                    this.vendorsSetting(result.body);
                }
            } catch(err) {
                this.alertToggle({message: "Internal service error. Cannot get Vendors.", isShow: true, type: "error"})
            }
        },
        defaultService() {
            const service = this.services.find(item => {
                return item.symbol === 'tr'
            });
            this.service = service.title;
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
                return item.symbol
            })
        },
        workflowStepsNames() {
            return this.workflowSteps.map(item => {
                return item.name
            })
        },
        metricsButton() {
            return this.currentProject.isMetricsExist ? "Refresh metrics" : "Get metrics"
        }
    },
    components: {
        SelectSingle,
        SelectMulti,
        LanguagesSelect,
        UploadFileButton,
        Button,
        LabelValue,
        Project,
        ProjectShortDetails,
        ProjectAction,
        Tasks,
        Steps,
        ProjectFinance
    },
    mounted() {
        this.getVendors();
        if(!this.currentProject._id) {
            this.$router.replace({name: "pm-projects"})
        };
        this.defaultService();
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
        margin-right: 20px;
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
    &__action {
        width: 20%;
    }
    &__tasks-steps {
        position: relative;
    }
    &__tabs {
        position: absolute;
    }
}
</style>
