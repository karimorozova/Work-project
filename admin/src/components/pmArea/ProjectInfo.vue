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
                        label.project-info__menu-title.project-info_relative Source Language
                            Asterisk(:customStyle="asteriskStyle")
                        LanguagesSelect(
                            placeholder="Source Languages"
                            :langFilter="customerLangFilter.source"
                            :single='true'
                            :selectedLang="sourceLanguage"
                            @chosenLang="setSource"
                        )
                    .project-info__drop-menu
                        label.project-info__menu-title Template
                        SelectSingle(
                            :selectedOption="template"
                            :options="allTemplates"
                            placeholder="Template"
                            refersTo="template"
                            @chooseOption="setValue"
                        )
                .project-info__tasks-col
                    .project-info__drop-menu    
                        label.project-info__menu-title.project-info_relative Target Languages
                            Asterisk(:customStyle="asteriskStyle")  
                        LanguagesSelect(
                            placeholder="Target Languages"
                            :langFilter="customerLangFilter.target"
                            :selectedLang="targetLangs"
                            @chosenLang="setTargets"
                        )
                    .project-info__drop-menu
                        label.project-info__menu-title.project-info_relative Service
                            Asterisk(:customStyle="asteriskStyle")   
                        SelectSingle(
                            :selectedOption="service" 
                            :options="allServices" 
                            placeholder="Service"
                            refersTo="service"
                            @chooseOption="setValue"
                        )     
                .project-info__tasks-col
                    .project-info__upload-file
                        UploadFileButton(text="Source Files *")
                            input.project-info__file-input.project-info__source-file(type="file" @change='uploadSourceFiles' multiple)
                        .project-info__files-list
                            .project-info__files-expander(v-if="sourceFiles.length")
                                .project-info__list-title(@click="toggleSourceFiles") Files list
                                    img.project-info__list-icon(src="../../assets/images/arrow_open.png" :class="{'project-info_reversed-icon': isSourceFilesShow}")
                            .project-info__loaded-file(v-if="isSourceFilesShow" v-for="(file, index) in sourceFiles") {{ file.name }}
                                span.project-info__delete-file(@click="deleteFile(index, 'sourceFiles')") +
                    .project-info__drop-menu
                        label.project-info__menu-title Workflow       
                        SelectSingle(
                            :selectedOption="selectedWorkflow.name" 
                            :options="workflowStepsNames" 
                            placeholder="Service"
                            @chooseOption="({option}) => setValue({option}, {refersTo: 'selectedWorkflow'})"
                        ) 
                .project-info__tasks-col
                    .project-info__upload-file
                        UploadFileButton(text="Reference Files")
                            input.project-info__file-input.project-info__ref-file(type="file" @change='uploadRefFiles' multiple)
                        .project-info__files-list
                            .project-info__files-expander(v-if="refFiles.length")
                                .project-info__list-title(@click="toggleRefFiles") Files list
                                    img.project-info__list-icon(src="../../assets/images/arrow_open.png" :class="{'project-info_reversed-icon': isRefFilesShow}")
                            .project-info__loaded-file(v-if="isRefFilesShow" v-for="(file, index) in refFiles") {{ file.name }}
                                span.project-info__delete-file(@click="deleteFile(index, 'refFiles')") +
                    .project-info__add-tasks
                        Button(value="Add tasks" @clicked="checkForErrors")
                .project-info__join-files
                    input.project-info__check(type="checkbox" v-model="isJoinFiles")
                    span.project-info__check-title Join Files
            .project-info__tasks-steps
                Tasks(v-if="currentProject.tasks.length && isTasksShow"
                    :allTasks="currentProject.tasks"
                    @showTab="showTab"
                )
                Steps(v-if="currentProject.steps.length && isStepsShow"
                    :allSteps="currentProject.steps"
                    :tasks="currentProject.tasks"
                    @setVendor="setVendor"
                    @setDate="setDate"
                    @showTab="showTab"
                )
                Button(v-if="currentProject.tasks.length" :value="metricsButton" @clicked="getMetrics")
        .project-info__action
            ProjectAction(:project="currentProject")
    .project-info__all-info
        ProjectFinance
    ValidationErrors(v-if="areErrorsExist"
        :errors="errors"
        @closeErrors="closeErrorsBlock"
    )
</template>

<script>
import SelectSingle from "../SelectSingle";
import SelectMulti from "../SelectMulti";
import Asterisk from "../Asterisk";
import ValidationErrors from "../ValidationErrors";
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
            template: "Standard processing",
            sourceLanguage: ["EN-GB"],
            targetLanguages: [],
            service: "",
            statuses: ["Accepted", "Draft", "Open", "Ready"],
            sourceFiles: [],
            refFiles: [],
            isStepsShow: false,
            isTasksShow: true,
            excludeKeys: ["nonTranslatable", "totalWords"],
            isSourceFilesShow: false,
            isRefFilesShow: false,
            isJoinFiles: false,
            errors: [],
            areErrorsExist: false,
            asteriskStyle: {"top": "-4px"}
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
        uploadSourceFiles(event) {
            this.sourceFiles.push(event.target.files[0]);
        },
        toggleSourceFiles() {
            this.isSourceFilesShow = !this.isSourceFilesShow;
        },
        uploadRefFiles(event) {
            this.refFiles.push(event.target.files[0]);
        },
        toggleRefFiles() {
            this.isRefFilesShow = !this.isRefFilesShow;
        },
        deleteFile(index, prop) {
            this[prop].splice(index, 1);
            if(!this[prop].length) {
                if(prop === "sourceFiles") {
                    this.isSourceFilesShow = false;
                    return this.clearInputFiles(".project-info__source-file");
                }
                this.isRefFilesShow = false;
                return this.clearInputFiles(".project-info__ref-file");
            }
        },
        clearTasksFormData() {
            this.template = "";
            this.targetLanguages = [];
            this.sourceFiles = [];
            this.refFiles = [];
            this.clearInputFiles(".project-info__file-input");
        },
        clearInputFiles(str) {
            let inputFiles = document.querySelectorAll(str);
            for(let elem of inputFiles) {
                elem.value = "";
            }
        },
        async checkForErrors() {
            this.errors = [];
            if(!this.selectedWorkflow) this.errors.push("Please, select Workflow.");
            if(!this.template) this.errors.push("Please, select Template.");
            if(!this.sourceLanguage.length) this.errors.push("Please, select Source language.");
            if(!this.targetLanguages.length) this.errors.push("Please, select Target language(s).");
            if(!this.service) this.errors.push("Please, select Service.");
            if(!this.sourceFiles.length) this.errors.push("Please, upload Source file(s).");
            if(this.errors.length) {
                this.areErrorsExist = true;
                return
            }
            await this.addTasks();
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
            form.append('join', this.isJoinFiles);
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
                this.clearTasksFormData()
            } catch(err) {
                this.alertToggle({message: "Internal service error. Cannot add tasks.", isShow: true, type: "error"})
            }
        },
        wordsCalculation(metrics) {
            const repetitions = Object.keys(metrics).filter(item => {
                return this.excludeKeys.indexOf(item) === -1;
            }).reduce((init, cur) => {
                return init + metrics[cur].value;
            }, 0);
            const receivables = metrics.totalWords - metrics.nonTranslatable;
            const payables = receivables - repetitions;
            return { receivables, payables };
        },
        async updateProgress() {
            try {
                const updatedData = await this.$http.get(`/xtm/update-progress?projectId=${this.currentProject._id}`);
                await this.storeProject(updatedData.body);
                this.$emit("refreshProjects");
                this.alertToggle({message: "Metrics are updated.", isShow: true, type: "success"});
            } catch(err) {
                this.alertToggle({message: "Internal service error. Cannot update metrics.", isShow: true, type: "error"})
            }
        },
        async getMetrics() {
            try {
                if(this.currentProject.isMetricsExist) {
                    return await this.updateProgress();
                }
                let project = JSON.stringify(this.currentProject);
                project = JSON.parse(project);
                for(let task of project.tasks) {
                    const metrics = await this.$http.get(`/xtm/project-metrics?projectId=${task.projectId}&customerId=${project.customer._id}`);
                    const { taskMetrics, progress } = metrics.body;
                    task.metrics = !task.finance.Price.receivables ? {...taskMetrics} : task.metrics;
                    task.finance.Wordcount = this.wordsCalculation(task.metrics);
                    const keysArr = Object.keys(progress);
                    for(const key in progress) {
                        const existedTask = project.steps.find(item => {
                            return item.taskId === task.taskId && item.name === key
                        })
                        if(!existedTask) {
                            const startDate = key === 'translate1' ? new Date() : "";
                            const deadline = keysArr.indexOf(key) === keysArr.length-1 ? project.deadline : ""
                            project.steps.push({
                                taskId: task.taskId,
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
                                if(step.taskId === task.taskId) {
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
        },
        async refreshCustomerInfo() {
            const client = await this.$http.get(`/clientsapi/client?id=${this.currentProject.customer._id}`);
            await this.setProjectValue({prop: 'customer', value: client.body}); 
        },
        closeErrorsBlock() {
            this.areErrorsExist = false;
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
        },
        customerLangFilter() {
            let result = {source: [], target: []};
            const combs = this.currentProject.customer.languageCombinations;
            for(let comb of combs) {
                result.source.push(comb.source);
                result.target.push(comb.target);
            }
            result.source.filter((elem, i, arr) => arr.indexOf(elem) === i);
            result.target.filter((elem, i, arr) => arr.indexOf(elem) === i);
            return result;
        }
    },
    components: {
        SelectSingle,
        SelectMulti,
        ValidationErrors,
        LanguagesSelect,
        UploadFileButton,
        Button,
        LabelValue,
        Project,
        ProjectShortDetails,
        ProjectAction,
        Tasks,
        Steps,
        ProjectFinance,
        Asterisk
    },
    mounted() {
        this.getVendors();
        if(!this.currentProject._id) {
            this.$router.replace({name: "pm-projects"})
        };
        this.defaultService();
    },
    beforeRouteEnter (to, from, next) {
        next(async (vm) => {
            if(from.name === "client-details"){
                await vm.refreshCustomerInfo();
            }
        })
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

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
    &__menu-title {
        font-size: 14px;
    }
    &_relative {
        position: relative;
    }
    &__tasks {
        box-sizing: border-box;
        width: 60%;
        padding: 20px;
        margin-left: 20px;
        margin-right: 20px;
        box-shadow: 0 3px 20px $brown-shadow;
        @media (max-width: 1600px) {
            width: 70%;
        }
    }
    &__tasks-title {
        font-size: 18px; 
        margin-bottom: 20px;
    }
    &__input-data-row {
        margin-bottom: 20px;
        width: 100%;
        display: flex;
        justify-content: space-between;
        padding-bottom: 25px;
        border-bottom: 1px solid $main-color;
    }
    &__tasks-col {
        width: 20%;
        height: 100px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: flex-start;
        &:nth-of-type(4) {
            height: 117px;
        }
    }
    &__add-tasks {
        display: flex;
        height: 78px;
        align-items: flex-end;
    }
    &__action {
        width: 20%;
        @media (max-width: 1600px) {
            width: 23%;
        }
    }
    &__tasks-steps {
        position: relative;
    }
    &__tabs {
        position: absolute;
    }
    &__upload-file {
        position: relative;
        margin-top: 15px;
    }
    &__files-list {
        box-sizing: border-box;
        background-color: $white;
        padding: 5px;
        position: absolute;
        bottom: 33px;
        left: 0;
        width: 100%;
        overflow-x: hidden;
    }
    &__loaded-file {
        display: flex;
        flex-direction: row-reverse;
        justify-content: flex-end;
        align-items: center;
        font-size: 12px;
    }
    &__delete-file {
        transform: rotate(45deg);
        cursor: pointer;
        font-size: 18px;
        font-weight: bold;
        margin-right: 5px;
    }
    &__files-expander {
        opacity: 0.7;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    &__list-icon {
        margin-left: 5px;
        transform: rotate(180deg);
    }
    &_reversed-icon {
        transform: rotate(0);
    }
    &__list-title {
        cursor: pointer;
    }
    &__join-files {
        display: flex;
        align-items: flex-start;
        padding-top: 20px;
    }
    &__check {
        margin-right: 5px;
        cursor: pointer;
    }
    &__check-title {
        font-size: 14px;
    }
    &__gen-info {
        display: flex;
        justify-content: space-between;
        .gen-info__block {
            width: 40%;
        }
    }
}
</style>
