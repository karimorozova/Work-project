<template lang="pug">
.project-info(v-if="currentProject._id")
    .project-info__all-info
        Project(:project="currentProject")
        //- GeneralInstructions(:project="currentProject")
        ProjectSubInformation(
            :project="currentProject"
        )
    .project-info__all-info
        TasksAndSteps(
            :originallyLanguages="originallyLanguages"
            :originallyUnits="originallyUnits"
            :originallySteps="originallySteps"
            :isFinishedStatus="isFinishedStatus"
            @getMetrics="getMetrics"
            @setVendor="setVendor"
            @setDate="setDate"
            @showErrors="showErrors"
        )
            ValidationErrors(v-if="areErrorsExist"
                :errors="errors"
                :isAbsolute="isBlockAbsoulte"
                @closeErrors="closeErrorsBlock"
            )
        .project-info__action
            ProjectAction(
                :project="currentProject"
                @editAndSend="editAndSend"
                @setStatus="setStatus"
                @refreshProject="refreshProject"
            )
    .project-info__all-info
        ProjectFinance
    .project-info__preview(v-if="isEditAndSend")
        Preview(@closePreview="closePreview" :message="message" @send="sendQuote")
</template>

<script>
const ValidationErrors = () => import("../ValidationErrors");
import Project from "./Project";
import GeneralInstructions from "./GeneralInstructions";
import ProjectAction from "./ProjectAction";
import ProjectFinance from "./ProjectFinance";
import TasksAndSteps from "./TasksAndSteps";
const Preview = () => import("./Preview");
import { mapGetters, mapActions } from 'vuex';
import ProjectSubInformation from './ProjectSubInformation';

export default {
    data() {
        return {
            statuses: ["Accepted", "Draft", "Open", "Ready"],
            errors: [],
            areErrorsExist: false,
            isBlockAbsoulte: true,
            isEditAndSend: false,
            message: "",
            mailSubject: "",

            originallyLanguages: null,
	          originallyUnits: null,
	          originallySteps: null,
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
        async setVendor({vendor, index}) {
            if(this.currentProject.steps[index].vendor &&
                this.currentProject.steps[index].vendor._id === vendor._id) {
                    return
            }
            try {
                await this.setStepVendor({vendor, index});
            } catch(err) { }
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
            const repetitions = Object.keys(metrics).filter(item => item !== "totalWords")
                .reduce((prev, cur) => {
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
                const result = await this.$http.get(`/memoqapi/metrics?projectId=${this.currentProject._id}`);
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
                    const result = await this.$http.get('/all-vendors?filter=Active');
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
        },
        async refreshProject(){
            const { id } = this.$route.params;
            const curProject = await this.$http.get(`/pm-manage/project?id=${id}`);
            await this.setCurrentProject(curProject.body);
        },
        async getOriginallyLanguages(){
          try {
            const result = await this.$http.get("/api/languages");
            this.originallyLanguages = result.body;
          } catch (err) {
            this.alertToggle({
              message: "Error in Originally Languages",
              isShow: true,
              type: "error",
            });
          }
        },
        async getOriginallyUnits() {
          try {
            const result = await this.$http.get("/api/units");
            this.originallyUnits = result.body;
          } catch (err) {
            this.alertToggle({
              message: "Error in Originally Units",
              isShow: true,
              type: "error",
            });
          }
        },
        async getOriginallySteps() {
          try {
            const result = await this.$http.get("/api/steps");
            this.originallySteps = result.body;
          } catch (err) {
            this.alertToggle({
              message: "Error in Originally Steps",
              isShow: true,
              type: "error",
            });
          }
        },

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
        GeneralInstructions,
        ProjectAction,
        TasksAndSteps,
        ProjectFinance,
        Preview,
        ProjectSubInformation
    },
    async created() {
        await this.getProject();
        await this.getVendors();
        await this.getOriginallyLanguages();
        await this.getOriginallyUnits();
        await this.getOriginallySteps();
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
    display: flex;
    flex-direction: column;
    &__all-info {
        display: flex;
        align-items: flex-start;
        box-sizing: border-box;
    }
    &__action {

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
