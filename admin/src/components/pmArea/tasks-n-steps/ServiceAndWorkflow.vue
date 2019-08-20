<template lang="pug">
    .workflow
        .workflow__title Service & Workflow
        .workflow__wrapper
            .workflow__drop-menu
                label.workflow__menu-title.workflow_relative Service
                    Asterisk(:customStyle="asteriskStyle")
                SelectSingle(
                    :selectedOption="service"
                    :options="allServices"
                    placeholder="Service"
                    refersTo="service"
                    @chooseOption="setService"
                    :positionStyle="positionStyle"
                )
            .workflow__drop-menu
                label.workflow__menu-title Workflow
                SelectSingle(
                    :selectedOption="selectedWorkflow.name"
                    :options="workflowStepsNames"
                    placeholder="Workflow"
                    @chooseOption="setWorkflow"
                    :positionStyle="positionStyle"
                )
        .workflow__default-dates(v-if="selectedWorkflow.id !== 2890")
            StepsDefaultDateModified(
                v-for="count in stepsCounter"
                :stepCounter="count"
                :start="stepsDates[count-1].start"
                :deadline="stepsDates[count-1].deadline"
                @setDate="(e) => setDate(e, count)"
            )    
</template>

<script>
import SelectSingle from "../../SelectSingle";
import Asterisk from "../../Asterisk";
import StepsDefaultDateModified from "./StepsDefaultDateModified";
import { mapGetters, mapActions } from 'vuex';
import setDefaultTranslationService from "@/mixins/setDefaultTranslationService";

export default {
    mixins: [setDefaultTranslationService],
    data() {
        return {
            isNeedToStoreService: true,
            service: "",
            workflowSteps: [{ name: "1 Step", id: 2890 }, { name: "2 Steps", id: 2917 }],
            stepsCounter: 2,
            stepsDates: [{ start: new Date(), deadline: "" }, { start: "", deadline: new Date() }],
            asteriskStyle: {"top": "-2px"},
            positionStyle: {"margin-top": "3px"}
        }
    },
    methods: {
        ...mapActions({
            setDataValue: "setTasksDataValue"
        }),
        setDate({ date, prop }, count) {
            this.stepsDates[count - 1][prop] = date;
            if (this.stepsDates[count] && prop === "deadline") {
                this.stepsDates[count].start = date;
                const deadline = new Date(this.stepsDates[count].deadline);
                if (date - deadline > 0) {
                    this.stepsDates[count].deadline = date;
                }
            }
            this.setDataValue({prop: "stepsDates", value: this.stepsDates});
        },
        setService({option}) {
            this.service = option;
            const value = this.services.find(item => item.title === option);
            this.setDataValue({prop: "service", value});
            value.languageForm === 'Mono' ? this.setWorkflow({option: '1 Step'}) : this.setWorkflow({option: '2 Steps'});
        },
        setWorkflow({option}) {
            const value = this.workflowSteps.find(item => item.name === option);
            this.setDataValue({prop: "workflow", value});
            if(value.id === 2890) {
                let stepDates = {...this.stepsDates[0], deadline: this.currentProject.deadline};
                this.setDataValue({prop: "stepsDates", value: [stepDates]});
            } else {
                this.setDefaultStepDates();
            }
        },
        storeDefaultService(service) {
            this.setDataValue({prop: "service", value: service});
        },
        setDefaultStepDates() {
            this.stepsDates = [
                { start: this.currentProject.createdAt, deadline: "" },
                { start: "", deadline: this.currentProject.deadline }
            ]
            this.setDataValue({prop: "stepsDates", value: this.stepsDates});
        }
    },
    computed: {
        ...mapGetters({
            services: "getVuexServices",
            tasksData: "getTasksData",
            currentProject: "getCurrentProject"
        }),
        selectedWorkflow() {
            return this.tasksData.workflow ? this.tasksData.workflow : {name: ""};
        },
        workflowStepsNames() {
            let result = this.workflowSteps.map(item => item.name);
            if(this.tasksData.service && this.tasksData.service.steps.length < 2) {
                result.pop();
            }
            return result;
        },
        allServices() {
            if (this.services.length) {
                return this.services.map(item => item.title)
            }
            return [];
        }
    },
    mounted() {
        this.setDataValue({prop: "workflow", value: this.workflowSteps[1]});
        this.setDefaultStepDates();
    },
    components: {
        SelectSingle,
        Asterisk,
        StepsDefaultDateModified
    }    
}
</script>

<style lang="scss" scoped>

.workflow {
    &__title {
        font-size: 21px;
        margin-bottom: 20px;
    }
    &__wrapper {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 50px;
    }
    &__drop-menu {
        position: relative;
        width: 191px;
        height: 50px;
    }
    &__menu-title {
        font-size: 14px;
    }
    &__default-dates {
        margin: 30px 0;
    }
    &_relative {
        position: relative;
    }
}

</style>
