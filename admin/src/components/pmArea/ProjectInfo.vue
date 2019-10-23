<template lang="pug">
.project-info(v-if="currentProject._id")
    .project-info__title Project Id: 
        span.project-info_bold {{currentProject.projectId}}
    .project-info__title Project Status: 
        span.project-info_bold {{ currentProject.status }}
    .project-info__all-info
        Project(:project="currentProject")
        //- ProjectShortDetails(:project="currentProject" @toggleCheck="toggleProjectOption")
        GeneralInstructions(:project="currentProject")
    .project-info__all-info
        TasksAndSteps(
            :isFinishedStatus="isFinishedStatus"
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
const ValidationErrors = () => import("../ValidationErrors");
import Project from "./Project";
// import ProjectShortDetails from "./ProjectShortDetails";
import GeneralInstructions from "./GeneralInstructions";
import ProjectAction from "./ProjectAction";
import ProjectFinance from "./ProjectFinance";
import TasksAndSteps from "./TasksAndSteps";
const Preview = () => import("./Preview");
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
            message: "",
            mailSubject: "",
        }
    },
    methods: {
        ...mapActions([
            "setProjectProp",
            "setProjectStatus",
            "setCurrentProject",
            "vendorsSetting",
            "alertToggle",
            "removeStepVendor",
            "setStepVendor",
            "setStepDate",
            "updateProgress",
            "updateCurrentProject",
            "sendClientQuote",
            "sendProjectDetails"
        ]),
        async toggleProjectOption({key}) {
            try {
                const result = await this.$http.put("/pm-manage/project-option", {projectId: this.currentProject._id, property: key});
                await this.setCurrentProject(result.body);
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
                this.alertToggle({message: "Step data updated", isShow: true, type: "success"})
            } catch(err) {
                this.alertToggle({message: "Internal service error. Cannot calculate payables for the step.", isShow: true, type: "error"})
            }
        },
        async setDate({date, prop, index}) {
            try {
                await this.setStepDate({value: date, prop, index});
                await this.updateCurrentProject({...this.currentProject, id: this.currentProject._id});
                await this.getMetrics();
            } catch(err) { }
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
            }).reduce((prev, cur) => {
                return prev + metrics[cur].value;
            }, 0);
            const receivables = metrics.totalWords - metrics.nonTranslatable;
            const payables = receivables - repetitions;
            return { receivables, payables };
        },
        async updateProjectProgress() {
            const projectId = this.currentProject._id;
            const nonWordcountTasks = this.currentProject.tasks.filter(item => item.service.calculationUnit !== 'Words');
            const wordcountTasks = this.currentProject.tasks.filter(item => item.service.calculationUnit === 'Words');
            try {
                if(nonWordcountTasks.length) {
                    await this.updateProgress({projectId, isCatTool: false});
                }
                if(wordcountTasks.length) {
                    await this.updateProgress({projectId, isCatTool: true});
                }
                this.alertToggle({message: "Metrics are updated.", isShow: true, type: "success"});
            } catch(err) { }
        },
        async getMetrics() {
            try {
                if(this.currentProject.isMetricsExist) {
                    return await this.updateProjectProgress();
                }
                const result = await this.$http.get(`/xtm/metrics?projectId=${this.currentProject._id}`);
                if(result.body.status === 'invalid') {
                    return this.alertToggle({message: "One or all files are not managed yet or invalid. Try later! ", isShow: true, type: "error"});
                }
                const updatedProject = await this.$http.get(`/pm-manage/costs?projectId=${this.currentProject._id}`);
                await this.setCurrentProject(updatedProject.body);
                this.alertToggle({message: "Metrics are received.", isShow: true, type: "success"});
            } catch(err) {
                this.alertToggle({message: "Internal server error. Cannot get metrics.", isShow: true, type: "error"})
            }
        },
        getStepsDates({task, key}) {
            let startDate = task.start;
            let deadline = task.deadline;
            if(task.stepsDates.length) {
                startDate = key === 'translate1' ? task.stepsDates[0].start : task.stepsDates[1].start;
                deadline = key === 'translate1' ? task.stepsDates[0].deadline : task.stepsDates[1].deadline;
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
            await this.setProjectProp({prop: 'customer', value: client.body});
        },
        showErrors({errors}) {
            this.errors = [...errors];
            this.areErrorsExist = true;
        },
        closeErrorsBlock() {
            this.areErrorsExist = false;
            this.errors = [];
        },
        editAndSend({message, subject}) {
            this.isEditAndSend = true;
            this.message = message.data.message;
            this.mailSubject = subject;
        },
        async sendQuote({message}) {
            try {
                if(this.mailSubject === 'quote') {
                    await this.sendClientQuote({ message });
                }
                if(this.mailSubject === 'details') {
                    await this.sendProjectDetails({ message });
                }
                this.alertToggle({message: "Details sent", isShow: true, type: "success"});
            } catch(err) {
                this.alertToggle({message: err.message, isShow: true, type: "error"});
            }
            this.closePreview();
        },
        closePreview() {
            this.isEditAndSend = false;
        },
        async getProject() {
            const { id } = this.$route.params;
            try {
                if(!this.currentProject._id) {
                    const curProject = await this.$http.get(`/pm-manage/project?id=${id}`);
                    await this.setCurrentProject(curProject.body);
                }
            } catch(err) {

            }
        }
    },
    computed: {
        ...mapGetters({
            currentProject: 'getCurrentProject',
            allVendors: "getVendors"
        }),
        isFinishedStatus() {
            const finishedStatuses = ['Delivered', 'Closed', 'Cancelled', 'Canclled Halfway'];
            return finishedStatuses.indexOf(this.currentProject.status) !== -1;
        }
    },
    components: {
        ValidationErrors,
        Project,
        // ProjectShortDetails,
        GeneralInstructions,
        ProjectAction,
        TasksAndSteps,
        ProjectFinance,
        Preview
    },
    created() {
        this.getProject();
        this.getVendors();
    },
    beforeRouteEnter (to, from, next) {
        next(async (vm) => {
            if(from.name === "client-info") {
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
    &_bold {
        font-weight: bold;
    }
}
</style>
