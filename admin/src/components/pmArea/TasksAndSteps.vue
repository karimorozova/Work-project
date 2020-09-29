<template lang="pug">
.tasks-steps
    transition(name="slide-fade")
        .tasks-steps__info(v-if="isInfo") {{ selectedInfoMessage }}
            .tasks-steps__file-counter(v-if="fileCounter") {{ fileCounter }} of {{ translateFilesAmount }}
    .tasks-steps__tasks-title Tasks and Steps
        img.tasks-steps__arrow(src="../../assets/images/open-close-arrow-brown.png" @click="toggleTaskData" :class="{'tasks-steps_rotate': isTaskData && !isFinishedStatus}")
    transition(name="slide-fade")
        TasksData(v-if="isTaskData && !isFinishedStatus"
            :originallyLanguages="originallyLanguages"
            :originallyUnits="originallyUnits"
            :originallySteps="originallySteps"
            @setValue="setValue"
            @showErrors="showErrors"
            @addTasks="addTasks"
            :isProject="isProject"
        )
            template(slot="errors")
                slot
    .tasks-steps__tables
        Tasks(v-if="currentProject.tasks.length && isTasksShow"
            :allTasks="this.currentProject.tasks"
            @showTab="showTab"
        )
        Steps(v-if="currentProject.steps.length && isStepsShow"
            :allSteps="currentProject.steps"
            :tasks="currentProject.tasks"
            :originallyLanguages="originallyLanguages"
            :originallyUnits="originallyUnits"
            @setVendor="setVendor"
            @setDate="setDate"
            @showTab="showTab"
        )
        Button(v-if="currentProject.tasks.length" :value="metricsButton" @clicked="getMetrics" :isDisabled="isDisabled")
</template>

<script>
import TasksData from "./tasks-n-steps/TasksData";
import Button from "../Button";
import Tasks from "./tasks-n-steps/Tasks";
import Steps from "./tasks-n-steps/Steps";
import { mapGetters, mapActions } from 'vuex';

export default {
    props: {
        isFinishedStatus: {type: Boolean},
        originallyLanguages: {
            type: Array
        },
        originallyUnits: {
          type: Array
        },
        originallySteps: {
          type: Array
        },
    },
    data() {
        return {
            isTaskData: false,
            isStepsShow: false,
            isTasksShow: true,
            isInfo: false,
            translateFilesAmount: 0
        }
    },
    methods: {
        ...mapActions([
            "alertToggle",
            "addProjectTasks",
            "addProjectWordsTasks",
            "clearTasksData",
            "getServices"
        ]),
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
        setValue({option, prop}) {
            this[prop] = option;
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

          tasksData.append('stepsAndUnits', JSON.stringify(dataForTasks.stepsAndUnits));
          tasksData.append('customerName', this.currentProject.customer.name);
          if (dataForTasks.stepsAndUnits.find(item => item.template)) {
            tasksData.append('template', dataForTasks.stepsAndUnits.find(item => item.template).template.id);
          }
          tasksData.append('workflow', dataForTasks.workflow.id);
          tasksData.append('stepsDates', JSON.stringify(dataForTasks.stepsDates));
          tasksData.append('service', JSON.stringify(dataForTasks.service));
          tasksData.append('source', source);
          tasksData.append('targets', JSON.stringify(dataForTasks.targets));
          tasksData.append('projectId', this.currentProject._id);
          tasksData.append('projectName', `${this.currentProject.projectId} - ${this.currentProject.projectName}`);
          tasksData.append('industry', this.currentProject.industry.name.replace('&', 'and'));
          tasksData.append('packageSize', dataForTasks.packageSize);
          tasksData.append('quantity', dataForTasks.quantity);
          tasksData.append('projectManager', this.currentProject.projectManager._id);
          tasksData.append('accountManager', this.currentProject.accountManager._id);
          return tasksData;
        },
        async addTasks(dataForTasks) {
            let tasksData = this.getDataForTasks(dataForTasks);
            const calculationUnit = [...new Set(dataForTasks.stepsAndUnits.map(item => item.unit))];
            const { sourceFiles, refFiles } = dataForTasks;

            if(sourceFiles && sourceFiles.length) {
                this.translateFilesAmount = sourceFiles.length;
                for(let file of sourceFiles) {
                  tasksData.append('sourceFiles', file);
                }
            }
            if(refFiles && refFiles.length) {
                for(let file of refFiles) {
                  tasksData.append('refFiles', file);
                }
            }

            for (const iterator of calculationUnit) {
                if(iterator === 'CAT Wordcount'){
                    try {
                        const memoqCreatorUser = await this.$http.get(`/memoqapi/user?userId=${this.currentProject.projectManager._id}`);
                        const { creatorUserId } = memoqCreatorUser.data;
                        if(!creatorUserId) throw new Error("No such user in memoq");
                        tasksData.append('creatorUserId', creatorUserId);
                        this.isInfo = true;
                    } catch (err) {
                        this.alertToggle({message: err.message, isShow: true, type: "error"});
                    }
                }
            }

            if( calculationUnit.includes('CAT Wordcount')){
                await this.saveProjectWordsTasks(tasksData);
            } else {
                await this.saveProjectTasks(tasksData);
            }
        },
        async saveProjectTasks(tasksData){
            try {
                await this.addProjectTasks(tasksData);
                this.isTaskData = false;
                this.clearTasksData();
            } catch (err) {
                this.alertToggle({message: err.message, isShow: true, type: "error"});
            }finally{
                this.isInfo = false;
            }
        },
        async saveProjectWordsTasks(tasksData){
            try {
                await this.addProjectWordsTasks(tasksData);
                this.isTaskData = false;
                this.clearTasksData();
            } catch (err) {
                this.alertToggle({message: err.message, isShow: true, type: "error"});
            }finally{
                this.isInfo = false;
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
            currentProject: 'getCurrentProject',
            selectedInfoMessage: 'getMemoqProjectMessage',
            fileCounter: 'getTranslateFileCounter'
        }),
        metricsButton() {
            const wordsUnit = this.currentProject.tasks.find(item => item.service.calculationUnit === 'Words');
            return !wordsUnit || this.currentProject.isMetricsExist ? "Refresh metrics" : "Get metrics"
        },
        isDisabled() {
            const statuses = ["Closed", "Cancelled"];
            return statuses.indexOf(this.currentProject.status) !== -1;
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
    min-width: 1000px;
    width: 1000px;
    padding: 20px;
    margin: 0 40px;
    box-shadow: 0 0 10px #67573e9d;
    position: relative;
    &__info {
        position: absolute;
        z-index: 1000;
        color: $orange;
        background-color: $white;
        padding: 20px;
        top: 20%;
        margin-left: auto;
        margin-right: auto;
        left: 0;
        right: 0;
        width: 300px;
        border: 1px solid $main-color;
        box-shadow: 0 0 10px #67573e9d;
    }
    &__file-counter {
        margin-top: 10px;
        text-align: center;
    }
    &__tasks-title {
        font-size: 22px;
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
