<template lang="pug">
.project-info
    .project-info__title Project Details
    .project-info__all-info
        Project(:project="currentProject")
        ProjectShortDetails(:project="currentProject" @setStatus="setStatus" @toggleCheck="toggleProjectOption")
    .project-info__all-info
        TasksAndSteps(
            @tasksAdded="tasksAdded"
            @getMetrics="getMetrics"
            @setVendor="setVendor"
            @setDate="setDate"
            @showErrors="showErrors")
            ValidationErrors(v-if="areErrorsExist"
                :errors="errors"
                :isAbsolute="isBlockAbsoulte"
                @closeErrors="closeErrorsBlock"
            )
        .project-info__action(v-if="currentProject.status !== 'Closed'")
            ProjectAction(
                :project="currentProject"
                @editAndSend="editAndSend"
                @setStatus="setStatus")
    .project-info__all-info
        ProjectFinance
    .project-info__preview(v-if="isEditAndSend")
        Preview(@closePreview="closePreview" :message="message" @send="sendQuote")
</template>

<script>
import ValidationErrors from "../ValidationErrors";
import Project from "./Project";
import ProjectShortDetails from "./ProjectShortDetails";
import ProjectAction from "./ProjectAction";
import ProjectFinance from "./ProjectFinance";
import TasksAndSteps from "./TasksAndSteps";
import Preview from "./Preview";
import { mapGetters, mapActions } from 'vuex';

export default {
    data() {
        return {
            statuses: ["Accepted", "Draft", "Open", "Ready"],
            excludeKeys: ["nonTranslatable", "totalWords"],
            errors: [],
            areErrorsExist: false,
            isBlockAbsoulte: true,
            isEditAndSend: false,
            message: ""
        }
    },
    methods: {
        ...mapActions({
            setProjectValue: "setProjectValue",
            setProjectStatus: "setProjectStatus",
            storeProject: "setCurrentProject",
            vendorsSetting: "vendorsSetting",
            alertToggle: 'alertToggle',
            removeStepVendor: 'removeStepVendor',
            setStepVendor: 'setStepVendor',
            setStepDate: 'setStepDate',
            updateCurrentProject: "updateCurrentProject",
            sendClientQuote: "sendClientQuote"
        }),
        tasksAdded({id}) {
            this.$emit("tasksAdded", { id });
        },
        async toggleProjectOption({key}) {
            try {
                const result = await this.$http.put("/pm-manage/project-option", {projectId: this.currentProject._id, property: key});
                await this.storeProject(result.body);
            } catch(err) {
                this.alertToggle({message: "Internal Server Error / Cannot update Project", isShow: true, type: "error"})
            }
        },
        async setVendor({vendor, index}) {
            if(this.currentProject.steps[index].vendor && 
                this.currentProject.steps[index].vendor._id === vendor._id) {
                    return
            }
            try {
                await this.setStepVendor({vendor, index});
                this.$emit("refreshProjects");
                this.alertToggle({message: "Step data updated", isShow: true, type: "success"})
            } catch(err) {
                this.alertToggle({message: "Internal service error. Cannot calculate payables for the step.", isShow: true, type: "error"})
            }
        },
        async setDate({date, prop, index}) {
            await this.setStepDate({value: date, prop, index});
            await this.updateCurrentProject({...this.currentProject, id: this.currentProject._id});
            await this.getMetrics();
        },
        async setStatus({option}) {
            try {
                await this.setProjectStatus({status: option});
                this.alertToggle({message: "Project's status changed", isShow: true, type: "success"});
            } catch(err) {
                this.alertToggle({message: err.message, isShow: true, type: "error"});
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
                this.alertToggle({message: "Internal server error. Cannot update metrics.", isShow: true, type: "error"})
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
                            const {startDate, deadline} = this.getStepsDates({task, key})
                            project.steps.push({
                                taskId: task.taskId,
                                name: key,
                                source: task.sourceLanguage,
                                target: task.targetLanguage,
                                vendor: null,
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
                                vendorsClickedOffer: [],
                                isVendorRead: false
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
                this.alertToggle({message: "Internal server error. Cannot get metrics.", isShow: true, type: "error"})
            }
        },
        getStepsDates({task, key}) {
            let startDate = task.start; 
            let deadline = task.deadline; 
            if(task.stepsDates.length) {
                const startDate = key === 'translate1' ? task.stepsDates[0].start : task.stepsDates[1].start;
                const deadline = key === 'translate1' ? task.stepsDates[0].deadline : task.stepsDates[1].deadline;
            }
            return {startDate, deadline};
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
        async refreshCustomerInfo() {
            const client = await this.$http.get(`/clientsapi/client?id=${this.currentProject.customer._id}`);
            await this.setProjectValue({prop: 'customer', value: client.body}); 
        },
        showErrors({errors}) {
            this.errors = [...errors];
            this.areErrorsExist = true;
        },
        closeErrorsBlock() {
            this.areErrorsExist = false;
            this.errors = [];
        },
        editAndSend({message}) {
            this.isEditAndSend = true;
            this.message = message.data.message;
        },
        async sendQuote({message}) {
            try {
                await this.sendClientQuote({ message });
                this.alertToggle({message: "Quote Details sent", isShow: true, type: "success"});
            } catch(err) {
                this.alertToggle({message: err.message, isShow: true, type: "error"});
            }
            this.closePreview();
        },
        closePreview() {
            this.isEditAndSend = false;
        }
    },
    computed: {
        ...mapGetters({
            currentProject: 'getCurrentProject',
            allVendors: "getVendors"
        })
    },
    components: {
        ValidationErrors,
        Project,
        ProjectShortDetails,
        ProjectAction,
        TasksAndSteps,
        ProjectFinance,
        Preview
    },
    mounted() {
        this.getVendors();
        if(!this.currentProject._id) {
            this.$router.replace({name: "pm-projects"})
        };
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
        box-sizing: border-box;
        padding-left: 20px;
    }
    &__action {
        width: 20%;
        @media (max-width: 1600px) {
            width: 23%;
        }
    }
    &__preview {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        z-index: 100
    }
}
</style>
