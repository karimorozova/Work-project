<template lang="pug">
.tasks-data
    .tasks-data__langs
        TasksLangs(
            :sourceLanguages="sourceLanguages"
            @setSourceLanguage="setSourceLang"
            @setTargets="setTargets")
    .tasks-data__files
        TasksFiles(
            :refFiles="refFiles"
            :sourceFiles="sourceFiles"
            :isJoinFiles="isJoinFiles"
            @uploadSourceFiles="uploadSourceFiles"
            @uploadRefFiles="uploadRefFiles"
            @deleteFile="deleteFile"
            @toggleJoin="toggleJoin"
        )
    .tasks-data__drops
        .tasks-data__drop-menu
            label.tasks-data__menu-title Template
            SelectSingle(
                :selectedOption="template"
                :options="allTemplates"
                placeholder="Template"
                refersTo="template"
                @chooseOption="setValue"
            )
        .tasks-data__drop-menu
            label.tasks-data__menu-title Workflow       
            SelectSingle(
                :selectedOption="selectedWorkflow.name" 
                :options="workflowStepsNames" 
                placeholder="Workflow"
                @chooseOption="setWorkflow"
            ) 
        .tasks-data__drop-menu
            label.tasks-data__menu-title.tasks-data_relative Service
                Asterisk(:customStyle="asteriskStyle")   
            SelectSingle(
                :selectedOption="service" 
                :options="allServices" 
                placeholder="Service"
                refersTo="service"
                @chooseOption="setValue"
            )     
    .tasks-data__default-dates(v-if="selectedWorkflow.id !== 2890")
        StepsDefaultDate(
            v-for="count in stepsCounter"
            :stepCounter="count"
            :start="stepsDates[count-1].start"
            :deadline="stepsDates[count-1].deadline"
            @setDate="(e) => setDate(e, count)"
        )
    .tasks-data__add-tasks
            Button(value="Add tasks" @clicked="checkForErrors")
    slot(name="errors")
</template>

<script>
import TasksLangs from "./TasksLangs";
import TasksFiles from "./TasksFiles";
import SelectSingle from "../../SelectSingle";
import Asterisk from "../../Asterisk";
import StepsDefaultDate from "./StepsDefaultDate";
import Button from "../../Button";
import { mapGetters, mapActions } from 'vuex';

export default {
    props: {
        selectedWorkflow: {
            type: Object
        },
        template: {
            type: String
        },
        sourceLanguages: {
            type: Array
        },
        targetLanguages: {
            type: Array
        },
        service: {
            type: String
        },
    },
    data() {
        return {
            templates: [
                {name: 'Excel segment limit', id: 'XLSwithLimit'},
                {name: 'Multilingual Excel', id: 'multiexcel'},
                {name: 'Standard processing', id: '247336FD'},        
            ],
            workflowSteps: [{name: "1 Step", id: 2890}, {name: "2 Steps", id: 2917}],
            stepsCounter: 2,
            stepsDates: [{start: new Date(), deadline: ""}, {start: "", deadline: new Date()}],
            sourceFiles: [],
            refFiles: [],
            isStepsShow: false,
            isTasksShow: true,
            isJoinFiles: false,
            asteriskStyle: {"top": "-4px"}
        }
    },
    methods: {
        ...mapActions({
            addProjectTasks: "addProjectTasks",
            alertToggle: "alertToggle",
            xtmCustomersGetting: "xtmCustomersGetting"
        }),
        setSourceLang({symbol}) {
            this.$emit("setSourceLang", { symbol });
        },
        setValue({option, refersTo}) {
            this.$emit("setValue", { option, refersTo })
        },
        setDate({date, prop}, count) {
            this.stepsDates[count-1][prop] = date;
            if(this.stepsDates[count] && prop === "deadline") {
                this.stepsDates[count].start = date;
                const deadline = new Date(this.stepsDates[count].deadline);
                if(date - deadline > 0) {
                    this.stepsDates[count].deadline = date;
                }
            }
        },
        setWorkflow({option}) {
            const workFlow = this.workflowSteps.find(item => item.name === option);
            this.$emit("setValue", { option: workFlow, refersTo: 'selectedWorkflow' });
        },
        defaultStepDates() {
            this.stepsDates = [
                {start: this.currentProject.createdAt, deadline: ""},
                {start: "", deadline: this.currentProject.deadline}
            ]
        },
        setSource({lang}) {
            this.$emit("setSource", { lang })
        },
        setTargets({targets}) {
            this.$emit("setTargets", { targets });
        },
        uploadSourceFiles({files}) {
            if(files.length) {
                for(let file of files) {
                    const isExist = this.sourceFiles.find(item => item.name === file.name);
                    if(!isExist) {
                        this.sourceFiles.push(file);
                    }
                }
            }
        },
        uploadRefFiles({files}) {
            if(files.length) {
                this.refFiles.push(files[0]);
            }
        },
        deleteFile({index, prop}) {
            this[prop].splice(index, 1);
            if(!this[prop].length) {
                if(prop === "sourceFiles") {
                    this.isSourceFilesShow = false;
                    return this.clearInputFiles(".files-upload__source-file");
                }
                this.isRefFilesShow = false;
                return this.clearInputFiles(".files-upload__ref-file");
            }
        },
        clearInputFiles(str) {
            let inputFiles = document.querySelectorAll(str);
            for(let elem of inputFiles) {
                elem.value = "";
            }
        },
        toggleJoin() {
            this.isJoinFiles = !this.isJoinFiles;
        },
        isRefFilesHasSource() {
            if(!this.refFiles.length) return false;
            for(let file of this.refFiles) {
                const sourceFile = this.sourceFiles.find(item => item.name === file.name);
                if(sourceFile) return true;
            }
            return false;
        },
        checkFirstStepDeadline() {
            if(this.selectedWorkflow.id !== 2890) {
                return this.stepsDates[0].deadline
            }
            return true;
        },
        async checkForErrors() {
            let errors = [];
            if(!this.selectedWorkflow) errors.push("Please, select Workflow.");
            if(!this.template) errors.push("Please, select Template.");
            if(!this.sourceLanguages.length) errors.push("Please, select Source language.");
            if(!this.targetLanguages.length) errors.push("Please, select Target language(s).");
            if(!this.sourceFiles.length) errors.push("Please, upload Source file(s).");
            if(this.sourceFiles.length && this.isRefFilesHasSource()) errors.push("Reference file cannot be the same as Source!");
            if(!this.checkFirstStepDeadline()) errors.push("Please, set the deadline for Step 1.");
            if(errors.length) {
                return this.$emit("showErrors", { errors });
            }
            try {
                await this.addTasks();
            } catch(err) {}
        },
        async getCustomersFromXtm() {
            try {
                if(!this.xtmCustomers.length) {
                    let result = await this.$http.get('/xtm/xtm-customers');
                    this.xtmCustomersGetting(result.body);
                }
            } catch(err) {
                this.alertToggle({message: "Error on getting XTM customers", isShow: true, type: "error"});
            }
        },
        async getTasksData() {
            try {
                if(!this.xtmCustomers.length) {
                    await this.getCustomersFromXtm();
                }
            } catch(err) { }
            const xtmCustomer = this.xtmCustomers.find(item => item.name === this.currentProject.customer.name);
            const xtmId = xtmCustomer ? xtmCustomer.id : "";
            const template = this.template ? this.templates.find(item => item.name === this.template) : {id: ""};
            const source = this.languages.find(item => item.symbol === this.sourceLanguages[0]);
            const service = this.services.find(item => item.title === this.service);
            return { xtmId, template, source, service };
        },
        async addTasks() {
            const { xtmId, template, source, service } = await this.getTasksData();
            if(this.selectedWorkflow.id === 2890) {
                this.stepsDates[0].deadline = this.currentProject.deadline;
            }
            this.$emit("addTasks", { 
                isJoinfiles: this.isJoinFiles, 
                sourceFiles: this.sourceFiles,
                refFiles: this.refFiles,
                stepsDates: this.stepsDates,
                xtmId, template, source, service });
            this.clearInputFiles(".tasks-data__source-file");
            this.clearInputFiles(".tasks-data__ref-file");
            this.sourceFiles = [];
            this.refFiles = [];
        }
    },
    computed: {
        ...mapGetters({
            currentProject: 'getCurrentProject',
            languages: "getAllLanguages",
            services: "getVuexServices",
            xtmCustomers: "getXtmCustomers",
        }),
        allServices() {
            if(this.services.length) {
                return this.services.map(item => {
                    return item.title
                })
            }
            return [];
        },
        allTemplates() {
            return this.templates.map(item => {
                return item.name
            })
        },
        workflowStepsNames() {
            return this.workflowSteps.map(item => {
                return item.name
            })
        }
    },
    components: {
        TasksLangs,
        TasksFiles,
        SelectSingle,
        StepsDefaultDate,
        Button,
        Asterisk
    },
    mounted() {
        this.defaultStepDates();
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.tasks-data {
    position: relative;
    &__drops {
        margin-bottom: 40px;
        width: 100%;
        display: flex;
        justify-content: space-between;
        padding-bottom: 25px;
    }
    &__drop-menu {
        position: relative;
        height: 28px;
        width: 191px;
    }
    &__menu-title {
        font-size: 14px;
    }
    &_relative {
        position: relative;
    }
    &__default-dates {
        margin-bottom: 30px;
    }
    &__add-tasks {
        display: flex;
        align-items: flex-end;
        border-bottom: 1px solid $main-color;
        margin-bottom: 20px;
        padding-bottom: 10px;
    }
    &__files {
        margin: 40px 0;
    }
    &__join-files {
        display: flex;
        align-items: flex-start;
        padding-top: 20px;
    }
}

</style>
