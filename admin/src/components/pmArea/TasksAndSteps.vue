<template lang="pug">
.tasks-steps
    .tasks-steps__tasks-title Tasks and Steps
    TasksData(
        :selectedWorkflow="selectedWorkflow"
        :template="template"
        :sourceLanguage="sourceLanguage"
        :targetLanguages="targetLangs"
        :service="service"
        @setValue="setValue"
        @setSource="setSource"
        @setTargets="setTargets"
        @showErrors="showErrors"
        @addTasks="addTasks"
    )
    .tasks-steps__tables
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
</template>

<script>
import TasksData from "./tasks-n-steps/TasksData";
import Button from "../Button";
import Tasks from "./tasks-n-steps/Tasks";
import Steps from "./tasks-n-steps/Steps";
import { mapGetters, mapActions } from 'vuex';

export default {
    data() {
        return {
            selectedWorkflow: {name:"2 Steps", id: 2917},
            template: "Standard processing",
            sourceLanguage: ["EN-GB"],
            targetLanguages: [],
            service: "",
            isStepsShow: false,
            isTasksShow: true,
        }
    },
    methods: {
        ...mapActions({
            alertToggle: "alertToggle",
            addProjectTasks: "addProjectTasks"
        }),
        defaultService() {
            const service = this.services.find(item => {
                return item.symbol === 'tr'
            });
            this.service = service.title;
        },
        setValue({option, refersTo}) {
            this[refersTo] = option;
        },
        setSource({lang}) {
            this.sourceLanguage = [lang.symbol];
        },
        setTargets({lang}) {
            const position = this.targetLangs.indexOf(lang.symbol);
            if(position != -1) {
                this.targetLanguages.splice(position, 1)
            } else {
                this.targetLanguages.push(lang);
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
        setVendor({vendor, index}) {
            this.$emit("setVendor", {vendor, index})
        },
        setDate({date, prop, index}) {
            this.$emit("setDate", {date, prop, index});
        },
        async addTasks({sourceFiles, refFiles, isJoinfiles, stepsDates, xtmId, template, source, service}) {
            let tasksData = new FormData()
            tasksData.append('customerId', xtmId);
            tasksData.append('customerName', this.currentProject.customer.name);
            tasksData.append('template', template.id);
            tasksData.append('workflow', this.selectedWorkflow.id);
            tasksData.append('stepsDates', JSON.stringify(stepsDates));
            tasksData.append('service', service._id);
            tasksData.append('source', JSON.stringify(source));
            tasksData.append('targets', JSON.stringify(this.targetLanguages));
            tasksData.append('projectId', this.currentProject._id);
            tasksData.append('projectName', this.currentProject.projectName);
            tasksData.append('join', isJoinfiles);
            if(sourceFiles.length) {
                for(let file of sourceFiles) {
                    tasksData.append('sourceFiles', file)
                }
            }
            if(refFiles.length) {
                for(let file of refFiles) {
                    tasksData.append('refFiles', file)
                }
            }
            try {
                await this.addProjectTasks(tasksData);
                this.$emit("tasksAdded", {id: this.currentProject._id});
                this.alertToggle({message: "Tasks are added.", isShow: true, type: "success"});
                this.clearTasksFormData();
            } catch(err) {
                this.alertToggle({message: "Internal service error. Cannot add tasks.", isShow: true, type: "error"})
            }
        },
        clearTasksFormData() {
            this.template = "";
            this.targetLanguages = [];
            this.sourceFiles = [];
            this.refFiles = [];
        },
        getMetrics() {
            this.$emit("getMetrics");
        },
        showErrors({errors}) {
            this.$emit("showErrors", { errors });
        }
    },
    computed: {
        ...mapGetters({
            currentProject: 'getCurrentProject',
            services: "getVuexServices",
        }),
        targetLangs() {
            return this.targetLanguages.map(item => {
                return item.symbol
            })
        },
        metricsButton() {
            return this.currentProject.isMetricsExist ? "Refresh metrics" : "Get metrics"
        },
    },
    components: {
        TasksData,
        Button,
        Tasks,
        Steps
    },
    mounted() {
        this.defaultService();
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.tasks-steps {
    box-sizing: border-box;
    width: 60%;
    padding: 20px;
    margin-left: 20px;
    margin-right: 20px;
    box-shadow: 0 3px 20px $brown-shadow;
    @media (max-width: 1600px) {
        width: 70%;
    }
    &__tasks-title {
        margin-bottom: 20px;
    }
    &__menu-title {
        font-size: 14px;
    }
    &__tables {
        position: relative;
    }
}
</style>
