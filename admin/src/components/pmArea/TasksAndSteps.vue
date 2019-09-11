<template lang="pug">
.tasks-steps
    .tasks-steps__tasks-title Tasks and Steps
        img.tasks-steps__arrow(src="../../assets/images/open-close-arrow-brown.png" @click="toggleTaskData" :class="{'tasks-steps_rotate': isTaskData && !isFinishedStatus}")
    transition(name="slide-fade")
        TasksData(v-if="isTaskData && !isFinishedStatus"
            @setValue="setValue"
            @showErrors="showErrors"
            @addTasks="addTasks"
            :isProject="isProject"
        )
            template(slot="errors")
                slot
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
        Button(v-if="isMetricsButton" :value="metricsButton" @clicked="getMetrics")
</template>

<script>
import TasksData from "./tasks-n-steps/TasksData";
import Button from "../Button";
import Tasks from "./tasks-n-steps/Tasks";
import Steps from "./tasks-n-steps/Steps";
import { mapGetters, mapActions } from 'vuex';

export default {
    props: {
        isFinishedStatus: {type: Boolean}
    },
    data() {
        return {
            isTaskData: false,
            isStepsShow: false,
            isTasksShow: true,
        }
    },
    methods: {
        ...mapActions({
            alertToggle: "alertToggle",
            addProjectTasks: "addProjectTasks",
            clearTasksData: "clearTasksData",
            getServices: "getServices"
        }),
        setDefaultIsTaskData() {
            if(!this.currentProject.tasks || !this.currentProject.tasks.length) {
                this.isTaskData = true;
            }
        },
        toggleTaskData() {
            if(this.currentProject.status !== 'Delivered') {
                this.isTaskData = !this.isTaskData;
            }
        },
        setValue({option, refersTo}) {
            this[refersTo] = option;
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
        getDataForTasks(dataForTasks) {
            let tasksData = new FormData();
            const source = dataForTasks.source ? JSON.stringify(dataForTasks.source) : "";
            tasksData.append('customerId', dataForTasks.xtmId);
            tasksData.append('customerName', this.currentProject.customer.name);
            tasksData.append('template', dataForTasks.template.id);
            tasksData.append('workflow', dataForTasks.workflow.id);
            tasksData.append('stepsDates', JSON.stringify(dataForTasks.stepsDates));
            tasksData.append('service', JSON.stringify(dataForTasks.service));
            tasksData.append('source', source);
            tasksData.append('targets', JSON.stringify(dataForTasks.targets));
            tasksData.append('projectId', this.currentProject._id);
            tasksData.append('projectName', this.currentProject.projectName);
            tasksData.append('join', dataForTasks.isJoinfiles);
            tasksData.append('packageSize', dataForTasks.packageSize);
            tasksData.append('quantity', dataForTasks.quantity);
            return tasksData;
        },
        async addTasks(dataForTasks) {
            let tasksData = this.getDataForTasks(dataForTasks);
            if(dataForTasks.service.calculationUnit === 'Hours') {
                const steps = [...dataForTasks.service.steps];
                const length = +dataForTasks.workflow.name.split(" ")[0];
                for(let i = 0; i < length; i++) {
                    tasksData.append(`${steps[i].step.symbol}-hours`, dataForTasks[`${steps[i].step.symbol}-hours`])
                    tasksData.append(`${steps[i].step.symbol}-quantity`, dataForTasks[`${steps[i].step.symbol}-quantity`])
                }
            }
            const { sourceFiles, refFiles } = dataForTasks;
            if(sourceFiles && sourceFiles.length) {
                for(let file of sourceFiles) {
                    tasksData.append('sourceFiles', file)
                }
            }
            if(refFiles && refFiles.length) {
                for(let file of refFiles) {
                    tasksData.append('refFiles', file)
                }
            }
            try {
                await this.addProjectTasks(tasksData);
                this.isTaskData = false;
                this.clearTasksData();
            } catch(err) { }
        },
        appendHoursStepsInfo(dataForTasks) {
                const steps = [...dataForTasks.service.steps];
                const length = +dataForTasks.workflow.name.split(" ")[0];
                for(let i = 0; i < length; i++) {

                    if(!dataForTasks[`${steps[i].step.symbol}-quantity`] 
                     || !this.tasksData[`${steps[i].step.symbol}-hours`]) {
                        this.errors.push("Please, set Hours and Quantity for all service steps.");
                        return;
                    }
                }
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
            currentProject: 'getCurrentProject'
        }),
        metricsButton() {
            return this.currentProject.isMetricsExist ? "Refresh metrics" : "Get metrics"
        },
        isMetricsButton() {
            if(this.currentProject.tasks) {
                const wordsUnit = this.currentProject.tasks.find(item => item.service.calculationUnit === 'Words');
                return this.currentProject.tasks.length && wordsUnit;
            }
            return false;
        }
    },
    components: {
        TasksData,
        Button,
        Tasks,
        Steps
    },
    created() {
        this.getServices();
    },
    mounted() {
        this.setDefaultIsTaskData();
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.tasks-steps {
    box-sizing: border-box;
    width: 67%;
    padding: 20px;
    margin-left: 20px;
    margin-right: 20px;
    box-shadow: 0 3px 20px $brown-shadow;
    @media (max-width: 1600px) {
        width: 70%;
    }
    &__tasks-title {
        font-size: 29px;
        margin-bottom: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    &__menu-title {
        font-size: 14px;
    }
    &__tables {
        position: relative;
    }
    &__arrow {
        cursor: pointer;
    }
    &_rotate {
        transform: rotate(180deg);
    }
}

.slide-fade-enter-active {
  transition: all .3s ease;
}
.slide-fade-leave-active {
  transition: all .1s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to {
  transform: translateY(10px);
  opacity: 0;
}

</style>
