<template lang="pug">
.tasks-steps
    .tasks-steps__tasks-title Tasks and Steps
        img.tasks-steps__arrow(src="../../assets/images/open-close-arrow-brown.png" @click="toggleTaskData" :class="{'tasks-steps_rotate': isTaskData}")
    transition(name="slide-fade")
        TasksData(v-if="isTaskData"
            :selectedWorkflow="selectedWorkflow"
            :template="template"
            :sourceLanguages="sourceLanguages"
            :targetLanguages="targetLangs"
            :service="service"
            @setValue="setValue"
            @setSourceLang="setSource"
            @setTargets="setTargets"
            @showErrors="showErrors"
            @addTasks="addTasks"
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
            sourceLanguages: [],
            targetLanguages: [],
            service: "",
            isTaskData: false,
            isStepsShow: false,
            isTasksShow: true,
        }
    },
    methods: {
        ...mapActions({
            alertToggle: "alertToggle",
            addProjectTasks: "addProjectTasks",
            getServices: "getServices"
        }),
        setDefaultIsTaskData() {
            if(!this.currentProject.tasks || !this.currentProject.tasks.length) {
                this.isTaskData = true;
            }
        },
        toggleTaskData() {
            this.isTaskData = !this.isTaskData;
        },
        async defaultService() {
            try {
                if(!this.services.length) {
                    await this.getServices();
                }
            } catch(err) {
                this.alertToggle({message: "Error on getting services from DB", isShow: true, type: "error"});
            }
            const service = this.services.find(item => {
                return item.symbol === 'tr'
            });
            this.service = service.title;
        },
        setValue({option, refersTo}) {
            this[refersTo] = option;
        },
        setSource({symbol}) {
            this.sourceLanguages = symbol ? [symbol] : [];
        },
        setTargets({targets}) {
            this.targetLanguages = targets;
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
        getDataForTasks({isJoinfiles, stepsDates, xtmId, template, source, service}) {
            let tasksData = new FormData();
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
            return tasksData;
        },
        async addTasks({sourceFiles, refFiles, isJoinfiles, stepsDates, xtmId, template, source, service}) {
            let tasksData = this.getDataForTasks({isJoinfiles, stepsDates, xtmId, template, source, service});
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
                this.alertToggle({message: "Tasks are added.", isShow: true, type: "success"});
                this.clearTasksFormData();
            } catch(err) {
                this.alertToggle({message: "Internal service error. Cannot add tasks.", isShow: true, type: "error"})
            }
        },
        clearTasksFormData() {
            this.template = "Standard processing";
            this.selectedWorkflow = {name:"2 Steps", id: 2917};
            this.targetLanguages = [];
            this.sourceFiles = [];
            this.refFiles = [];
            this.isTaskData  = false;
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
        this.setDefaultIsTaskData();
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
