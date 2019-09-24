<template lang="pug">
.request-tasks
    .request-tasks__tasks-title Tasks and Steps
        img.request-tasks__arrow(src="../../assets/images/open-close-arrow-brown.png" @click="toggleTaskData" :class="{'request-tasks_rotate': isTaskData && !isFinishedStatus}")
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
            service: "",
            isTaskData: true,
        }
    },
    methods: {
        ...mapActions({
            alertToggle: "alertToggle",
            addProjectTasks: "addProjectTasks",
            getServices: "getServices"
        }),
        toggleTaskData() {
            if(this.currentProject.status !== 'Delivered') {
                this.isTaskData = !this.isTaskData;
            }
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
        setDate({date, prop, index}) {
            this.$emit("setDate", {date, prop, index});
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
        }
    },
    components: {
        TasksData
    },
    mounted() {
        this.defaultService();
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
