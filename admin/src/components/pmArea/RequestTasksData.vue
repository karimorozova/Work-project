<template lang="pug">
.request-tasks
    transition(name="slide-fade")
        .request-tasks__info(v-if="isInfo") {{ selectedInfoMessage }}
            .request-tasks__file-counter(v-if="fileCounter") {{ fileCounter }} of {{ translateFilesAmount }}
    .request-tasks__tasks-title Tasks and Steps
        img.request-tasks__arrow(src="../../assets/images/open-close-arrow-brown.png" @click="toggleTaskData" :class="{'request-tasks_rotate': isTaskData && !isFinishedStatus}")
    transition(name="slide-fade")
        TasksData(v-if="isTaskData"
            @setValue="setValue"
            @setSourceLang="setSource"
            @setTargets="setTargets"
            @showErrors="showErrors"
            @addTasks="addTasks"
            :isRequest="true"
        )
            template(slot="errors")
                slot
</template>

<script>
import TasksData from "./tasks-n-steps/TasksData";
import { mapGetters, mapActions } from 'vuex';

export default {
    data() {
        return {
            selectedWorkflow: {name:"2 Steps", id: 2917},
            template: "Standard processing",
            sourceLanguages: [],
            targetLanguages: [],
            isTaskData: true,
            isInfo: false,
            translateFilesAmount: 0
        }
    },
    methods: {
        ...mapActions([
            "alertToggle",
            "addTasksFromRequest",
            "addProjectWordsTasks"
            ]),
        toggleTaskData() {
            if(this.currentProject.status !== 'Delivered') {
                this.isTaskData = !this.isTaskData;
            }
        },
        setValue({option, prop}) {
            this[prop] = option;
        },
        setSource({symbol}) {
            this.sourceLanguages = symbol ? [symbol] : [];
        },
        setTargets({targets}) {
            this.targetLanguages = targets;
        },
        setDate({date, prop, index}) {
            this.$emit("setDate", {date, prop, index});
        },
        showErrors({errors}) {
            this.$emit("showErrors", { errors });
        },
        async addTasks(tasksData) {
            let dataForTasks = {...tasksData};
            if(dataForTasks.service.calculationUnit === 'Hours') {
                const steps = [...dataForTasks.service.steps];
                const length = +dataForTasks.workflow.name.split(" ")[0];
                for(let i = 0; i < length; i++) {
                    tasksData.append(`${steps[i].step.symbol}-hours`, dataForTasks[`${steps[i].step.symbol}-hours`])
                    tasksData.append(`${steps[i].step.symbol}-quantity`, dataForTasks[`${steps[i].step.symbol}-quantity`])
                }
            }
            try {
                const request = {...this.currentProject, status: "Draft"};
                if(dataForTasks.service.calculationUnit !== 'Words') {
                    await this.addTasksFromRequest({dataForTasks, request, isWords: false});
                } else {
                    await this.addWordsTasksFromRequest({dataForTasks, request});    
                }
                this.$router.push(`/project-details/${this.currentProject._id}`);
            } catch(err) { }
        },
        async addWordsTasksFromRequest({dataForTasks, request}) {
            try {
                const newProject = await this.$http.post('/pm-manage/request-tasks', {dataForTasks, request, isWords: true});
                const { project, newTasksInfo } = newProject.data;
                let { isAssigned, requestId, refFiles, template, ...tasksData } = newTasksInfo;
                tasksData.template = template.id;
                tasksData.projectId = project._id;
                tasksData.projectName = `${project.projectId} - ${project.projectName}`;
                tasksData.customerName = project.customer.name;
                tasksData.industry = project.industry.name.replace('&','and');
                this.translateFilesAmount = tasksData.translateFiles.length;
                this.isInfo = true;
                await this.addProjectWordsTasks({...tasksData, isRequest: true});
            } catch(err) {
                console.log(err); 
                this.alertToggle({message: "Error on adding tasks from request", isShow: true, type: "error"});
            } finally {
                this.isInfo = false;
            }
        }
    },
    computed: {
        ...mapGetters({
            currentProject: 'getCurrentProject',
            selectedInfoMessage: 'getMemoqProjectMessage',
            fileCounter: 'getTranslateFileCounter'
        }),
        targetLangs() {
            return this.targetLanguages.map(item => {
                return item.symbol
            })
        }
    },
    components: {
        TasksData
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.request-tasks {
    box-sizing: border-box;
    width: 67%;
    padding: 20px;
    margin: 0 20px 20px 20px;
    box-shadow: 0 3px 20px $brown-shadow;
    position: relative;
    @media (max-width: 1600px) {
        width: 70%;
    }
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
        box-shadow: 0 3px 20px $brown-shadow;
    }
    &__file-counter {
        margin-top: 10px;
        text-align: center;
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
