<template lang="pug">
.tasks-data
    .tasks-data__main
        .tasks-data__item
                ServiceAndWorkflow
        .tasks-data__item
            .tasks-data__item-title File Preparation
            .tasks-data__langs
                TasksLangs(v-if="isMonoService")

                TasksLangsDuo(v-if="!isMonoService"
                    :calculationUnit="currentUnit"
                    :sourceLanguages="sourceLanguages"
                    @setSourceLanguage="setSourceLang"
                    @setTargets="setTargets"
                    :isRequest="isRequest"
                )
            .tasks-data__files(v-if="currentProject.status !== 'Requested'")
                TasksFiles(:tasksData="tasksData")
            .tasks-data__files.tasks-data_m-bottom-40(v-else)
                TasksFilesRequested

            .tasks-data__service-steps
                //- JobSettings(:steps="tasksData.service.steps")
                JobSettings(:tasksData="tasksData")


            //- .tasks-data__template(v-if="currentUnit === 'Words'")

            //- .tasks-data__template()
            //-     .tasks-data__drop-menu
            //-         label.tasks-data__menu-title Template
            //-         SelectSingle(
            //-             :selectedOption="selectedTemplate"
            //-             :options="allTemplates"
            //-             placeholder="Template"
            //-             @chooseOption="setTemplate"
            //-         )


    .tasks-data__add-tasks(v-if="isProject && isButton")
        Button(value="Add tasks" @clicked="checkForErrors")
    .tasks-data__buttons(v-if="isRequest && isButton")
        .tasks-data__button
            Button(:value="currentProject.isAssigned ? 'Assign to AM' : 'Assign to PM'" @clicked="assignManager")
        .tasks-data__button
            Button(value="Add tasks" @clicked="checkForErrors" :isDisabled="isAddTasksDisabled")
    slot(name="errors")
</template>

<script>
import TasksLangs from "./TasksLangs";
import TasksLangsDuo from "./TasksLangsDuo";
import TasksFiles from "./TasksFiles";
import TasksFilesRequested from "./TasksFilesRequested";
import JobSettings from "./JobSettings";
import SelectSingle from "../../SelectSingle";
import ServiceAndWorkflow from "./ServiceAndWorkflow";
import Button from "../../Button";
import BigToggler from "@/components/BigToggler";
import { mapGetters,mapActions } from 'vuex';

export default {
    props: {
        isRequest: {type: Boolean}
    },
    data() {
        return {
            templates: [],
            sourceLanguages: [],
            targetLanguages: [],
            errors: []
        }
    },
    methods: {
        ...mapActions([
            "alertToggle",
            "setTasksDataValue",
            "setRequestValue"
        ]),
        setSourceLang({ symbol }) {
            const value = this.languages.find(item => item.symbol === symbol);
            this.setTasksDataValue({prop: "source", value});
            this.setTasksDataValue({prop: "targets", value: []});
            this.sourceLanguages = [value.symbol];
        },



        // setTemplate({ option }) {
        //     const value = this.templates.find(item => item.name === option);
        //     this.setTasksDataValue({prop: "template", value});
        // },


        setTargets({ targets }) {
            this.setTasksDataValue({prop: "targets", value: targets});
            this.targetLanguages = [...targets];
        },
        isRefFilesHasSource() {
            const { sourceFiles, refFiles } = this.tasksData;
            if (!refFiles || !refFiles.length) return false;
            for (let file of refFiles) {
                const sourceFile = sourceFiles.find(item => item.name === file.name);
                if (sourceFile) return true;
            }
            return false;
        },
        isValidQuantity(quantity) {
            if(!quantity) {
                return false;
            }
            return /^[1-9]{1,}(\d{1,})?/.test(quantity);
        },
        checkRequestErrors() {
            let errors = [];
            if(!this.currentProject.industry) errors.push("Please, select industry.");
            if(!this.currentProject.projectName) errors.push("Please, enter project name.");
            return errors;
        },
        async checkForErrors() {
            this.errors = [];
            const { source, targets, packageSize, sourceFiles, refFiles, quantity } = this.tasksData;
            if(this.isRequest) {
                this.errors = this.checkRequestErrors();
            }
            if(!this.isMonoService && !source) this.errors.push("Please, select Source language.");
            // if(this.isMonoService && !packageSize) this.errors.push("Please, select Package.");
            if(this.tasksData.stepsAndUnits == null) this.errors.push("Please, select Unit.")
            if (!targets || !targets.length) this.errors.push("Please, select Target language(s).");
            this.isRequest ? this.checkRequestFies() : this.checkFiles(sourceFiles, refFiles);
            this.checkHoursSteps();
            // if(this.isMonoService && !this.isValidQuantity(quantity)) this.errors.push("Please, enter the valid Quantity.");
            if(this.isDeadlineMissed()) this.errors.push("Please, update deadline (Project's or tasks).");
            if (this.errors.length) {
                return this.$emit("showErrors", { errors: this.errors });
            }
            try {
                await this.addTasks();
            } catch (err) {
                this.alertToggle({message: "Error on adding tasks", isShow: true, type: "error"});
            }
        },
        isDeadlineMissed() {
            let today = new Date();
            today.setHours(23,59,59);
            const missedDeadline = this.tasksData.stepsDates.find(item => item.deadline && new Date(item.deadline) <= today);
            return !!missedDeadline || new Date(this.currentProject.deadline) <= today;
        },
        checkRequestFies() {
            const { sourceFiles, refFiles } = this.currentProject;
            if(this.currentUnit === 'Words' && !sourceFiles.length) this.errors.push("Please, upload Source file(s).");
            if(this.currentUnit !== 'Words' && !refFiles.length) this.errors.push("Please, upload Reference file(s).");
        },
        checkFiles(sourceFiles, refFiles) {
            if(this.currentUnit === 'Words') {
                if (!sourceFiles || !sourceFiles.length) this.errors.push("Please, upload Source file(s).");
                if (sourceFiles && sourceFiles.length && this.isRefFilesHasSource()) this.errors.push("Reference file cannot be the same as Source!");
            } else {
                if(!refFiles || !refFiles.length) this.errors.push("Please, upload Reference file(s).");
            }
        },
        checkHoursSteps() {
            if(this.currentUnit === 'Hours') {
                const steps = [...this.tasksData.service.steps];
                const length = +this.tasksData.workflow.name.split(" ")[0];
                for(let i = 0; i < length; i++) {
                    if(!this.tasksData[`${steps[i].step.symbol}-quantity`] 
                     || !this.tasksData[`${steps[i].step.symbol}-hours`]) {
                        this.errors.push("Please, set Hours and Quantity for all service steps.");
                        return;
                    }
                }
            }
        },
        async assignManager() {
            await this.setRequestValue({
                id: this.currentProject._id,
                prop: "isAssigned",
                value: !this.currentProject.isAssigned,
                isEmail: true
            })
        },
        async addTasks() {
            const source = this.tasksData.source || this.languages.find(item => item.symbol === 'EN-GB');
            this.$emit("addTasks", {
                ...this.tasksData,
                refFiles: this.tasksData.refFiles || [],
                source
            });
            this.clearInputFiles(".tasks-data__source-file");
            this.clearInputFiles(".tasks-data__ref-file");
        },
        clearInputFiles(str) {
            let inputFiles = document.querySelectorAll(str);
            for (let elem of inputFiles) {
                elem.value = "";
            }
        },
        setServiceForm() {
            this.isMonoService = this.tasksData.service.languageForm === "Mono";
        },

        async getMemoqTemplates() {
            try {
                const result = await this.$http.get("/memoqapi/templates");
                this.templates = result.data || [];
                if(this.templates.length) {
                    const defTemplate = this.templates.find(item => item.name === '2 Steps');
                    this.setTasksDataValue({prop: "template", value: defTemplate || this.templates[0]});
                }
            } catch(err) { }
        }

    },
    computed: {
        ...mapGetters({
            currentProject: 'getCurrentProject',
            languages: "getAllLanguages",
            tasksData: "getTasksData"
        }),

        // allTemplates() {
        //     return this.templates.map(item => item.name);
        // },
        // selectedTemplate() {
        //     return this.tasksData.template ? this.tasksData.template.name : "";
        // },


        isMonoService() {
            if(this.currentProject.status === 'Requested') {
                return this.currentProject.service.languageForm === "Mono";
            }
            return this.tasksData.service ? this.tasksData.service.languageForm === "Mono" : false;
        },
        isProject() {
            return this.currentProject.status && this.currentProject.status !== "Requested";
        },
        isButton() {
            const forbiddenStatuses = ['Cancelled', 'Cancelled Halfway', 'Closed'];
            return forbiddenStatuses.indexOf(this.currentProject.status) === -1;
        },
        currentUnit() {
            return this.tasksData.service ? this.tasksData.service.calculationUnit : "";
        },
        areAllFilesApproved() {
            const allFiles = [ ...this.currentProject.sourceFiles, ...this.currentProject.refFiles];
            const isNotApproved = !allFiles.length || allFiles.find(item => !item.isApproved);
            return !isNotApproved;
        },
        isAddTasksDisabled() {
            return !this.currentProject.isDeadlineApproved || !this.currentProject.isBriefApproved
                || !this.areAllFilesApproved;
        }
    },
    components: {
        TasksLangs,
        TasksLangsDuo,
        TasksFiles,
        TasksFilesRequested,
        JobSettings,
        SelectSingle,
        Button,
        ServiceAndWorkflow,
        BigToggler
    },
    created() {
        this.getMemoqTemplates();
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.tasks-data {
    position: relative;
    &__workflow-wrapper {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 50px;
    }
    &__toggler-title {
        font-size: 14px;
        margin-right: 15px;
    }
    &__main {
        display: flex;
        justify-content: space-between;
    }
    &__item {
        padding: 30px;
        width: 49%;
        border: 1px solid $brown-border;
        border-radius: 2px;
        box-sizing: border-box;

        &-title {
            font-size: 21px;
            margin-bottom: 20px;
        }
    }
    &__drops {
        margin-bottom: 40px;
        width: 100%;
        display: flex;
        justify-content: space-between;
        padding-bottom: 25px;
    }
    &__drop-menu {
        position: relative;
        width: 50%;
        height: 50px;
    }
    &__menu-title {
        font-size: 14px;
    }
    &__add-tasks {
        display: flex;
        justify-content: center;
        padding-top: 20px;
    }
    &__buttons {
        display: flex;
        justify-content: center;
        margin-top: 20px;
    }
    &__button {
        margin: 0 20px;
    }
    &_m-bottom-40 {
        margin-bottom: 40px;
    }

}
</style>
