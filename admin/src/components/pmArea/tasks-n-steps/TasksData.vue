<template lang="pug">
.tasks-data
    .tasks-data__main-info
        .tasks-data__column
            .tasks-data__drop-menu
                label.tasks-data__menu-title.tasks-data_relative Source Language
                    Asterisk(:customStyle="asteriskStyle")
                LanguagesSelect(
                    placeholder="Source Languages"
                    :langFilter="customerLangFilter.source"
                    :single='true'
                    :selectedLang="sourceLanguage"
                    customClass="tasks-data__langs"
                    @chosenLang="setSource"
                )
            .tasks-data__drop-menu
                label.tasks-data__menu-title Template
                SelectSingle(
                    :selectedOption="template"
                    :options="allTemplates"
                    placeholder="Template"
                    refersTo="template"
                    @chooseOption="setValue"
                )
        .tasks-data__column
            .tasks-data__drop-menu    
                label.tasks-data__menu-title.tasks-data_relative Target Languages
                    Asterisk(:customStyle="asteriskStyle")  
                LanguagesSelect(
                    placeholder="Target Languages"
                    :langFilter="customerLangFilter.target"
                    :selectedLang="targetLanguages"
                    customClass="tasks-data__langs"
                    @chosenLang="setTargets"
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
        .tasks-data__column
            .tasks-data__upload-file
                UploadFileButton(text="Source Files *")
                    input.tasks-data__file-input.tasks-data__source-file(type="file" @change='uploadSourceFiles' multiple)
                .tasks-data__files-list
                    .tasks-data__files-expander(v-if="sourceFiles.length")
                        .tasks-data__list-title(@click="toggleSourceFiles") Files list
                            img.tasks-data__list-icon(src="../../../assets/images/arrow_open.png" :class="{'tasks-data_reversed-icon': isSourceFilesShow}")
                    .tasks-data__loaded-file(v-if="isSourceFilesShow" v-for="(file, index) in sourceFiles") {{ file.name }}
                        span.tasks-data__delete-file(@click="deleteFile(index, 'sourceFiles')") +
            .tasks-data__drop-menu
                label.tasks-data__menu-title Workflow       
                SelectSingle(
                    :selectedOption="selectedWorkflow.name" 
                    :options="workflowStepsNames" 
                    placeholder="Service"
                    @chooseOption="setWorkflow"
                ) 
        .tasks-data__column
            .tasks-data__upload-file
                UploadFileButton(text="Reference Files")
                    input.tasks-data__file-input.tasks-data__ref-file(type="file" @change='uploadRefFiles' multiple)
                .tasks-data__files-list
                    .tasks-data__files-expander(v-if="refFiles.length")
                        .tasks-data__list-title(@click="toggleRefFiles") Files list
                            img.tasks-data__list-icon(src="../../../assets/images/arrow_open.png" :class="{'tasks-data_reversed-icon': isRefFilesShow}")
                    .tasks-data__loaded-file(v-if="isRefFilesShow" v-for="(file, index) in refFiles") {{ file.name }}
                        span.tasks-data__delete-file(@click="deleteFile(index, 'refFiles')") +
        .tasks-data__join-files
            input.tasks-data__check(type="checkbox" v-model="isJoinFiles")
            span.tasks-data__check-title Join Files
    .tasks-data__default-dates
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
import SelectSingle from "../../SelectSingle";
import Asterisk from "../../Asterisk";
import LanguagesSelect from "../../LanguagesSelect";
import UploadFileButton from "../../UploadFileButton";
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
        sourceLanguage: {
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
            stepsDates: [{start: new Date(), deadline: new Date()}, {start: new Date(), deadline: new Date()}],
            sourceFiles: [],
            refFiles: [],
            isStepsShow: false,
            isTasksShow: true,
            isSourceFilesShow: false,
            isRefFilesShow: false,
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
            this.stepsCounter = workFlow.id === 2890 ? 1 : 2;
            this.getStepsDates(this.stepsCounter);
            this.$emit("setValue", { option: workFlow, refersTo: 'selectedWorkflow' });
        },
        getStepsDates(counter) {
            if(counter === 1 && this.stepsDates.length === 2) {
                this.stepsDates.pop();
            } else {
                this.stepsDates.push({
                    start: this.currentProject.createdAt,
                    deadline: this.currentProject.deadline
                })
            }
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
        setTargets({lang}) {
            this.$emit("setTargets", { lang });
        },
        uploadSourceFiles(event) {
            for(let file of event.target.files) {
                const isExist = this.sourceFiles.find(item => item.name === file.name);
                if(!isExist) {
                    this.sourceFiles.push(file);
                }
            }
        },
        toggleSourceFiles() {
            this.isSourceFilesShow = !this.isSourceFilesShow;
        },
        uploadRefFiles(event) {
            this.refFiles.push(event.target.files[0]);
        },
        toggleRefFiles() {
            this.isRefFilesShow = !this.isRefFilesShow;
        },
        deleteFile(index, prop) {
            this[prop].splice(index, 1);
            if(!this[prop].length) {
                if(prop === "sourceFiles") {
                    this.isSourceFilesShow = false;
                    return this.clearInputFiles(".tasks-data__source-file");
                }
                this.isRefFilesShow = false;
                return this.clearInputFiles(".tasks-data__ref-file");
            }
        },
        clearInputFiles(str) {
            let inputFiles = document.querySelectorAll(str);
            for(let elem of inputFiles) {
                elem.value = "";
            }
        },
        checkForErrors() {
            let errors = [];
            if(!this.selectedWorkflow) errors.push("Please, select Workflow.");
            if(!this.template) errors.push("Please, select Template.");
            if(!this.targetLanguages.length) errors.push("Please, select Target language(s).");
            if(!this.sourceFiles.length) errors.push("Please, upload Source file(s).");
            if(errors.length) {
                return this.$emit("showErrors", { errors });
            }
            this.addTasks();
        },
        async getCustomersFromXtm() {
            try {
                if(!this.allXtmCustomers.length) {
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
            const xtmCustomer = this.xtmCustomers.find(item => {
                return item.name === this.currentProject.customer.name
            });
            const xtmId = xtmCustomer ? xtmCustomer.id : "";
            const template = this.template ? this.templates.find(item => {
                    return item.name === this.template
                }) : {id: ""}
            const source = this.languages.find(item => {
                return item.symbol === this.sourceLanguage[0];
            })
            const service = this.services.find(item => {
                return item.title === this.service
            })
            return { xtmId, template, source, service };
        },
        addTasks() {
            const { xtmId, template, source, service } = this.getTasksData();
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
        },
        customerLangFilter() {
            let result = {source: [], target: []};
            const combs = this.currentProject.customer.languageCombinations;
            for(let comb of combs) {
                if(comb.source && !comb.source._id) {
                    result.source.push(comb.source);
                    result.target.push(comb.target);
                } else if (comb.source && comb.source._id) {
                    result.source.push(comb.source._id);
                    result.target.push(comb.target._id);
                }
            }
            return result;
        }
    },
    components: {
        SelectSingle,
        LanguagesSelect,
        UploadFileButton,
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
    &__main-info {
        margin-bottom: 20px;
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
    &__column {
        width: 20%;
        height: 100px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: flex-start;
        &:nth-of-type(4) {
            height: 117px;
        }
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
    &__tables {
        position: relative;
    }
    &__tabs {
        position: absolute;
    }
    &__upload-file {
        position: relative;
        margin-top: 15px;
    }
    &__files-list {
        box-sizing: border-box;
        background-color: $white;
        padding: 5px;
        position: absolute;
        bottom: 33px;
        left: 0;
        width: 100%;
        overflow-x: hidden;
    }
    &__loaded-file {
        display: flex;
        flex-direction: row-reverse;
        justify-content: flex-end;
        align-items: center;
        font-size: 12px;
    }
    &__delete-file {
        transform: rotate(45deg);
        cursor: pointer;
        font-size: 18px;
        font-weight: bold;
        margin-right: 5px;
    }
    &__files-expander {
        opacity: 0.7;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    &__list-icon {
        margin-left: 5px;
        transform: rotate(180deg);
    }
    &_reversed-icon {
        transform: rotate(0);
    }
    &__list-title {
        cursor: pointer;
    }
    &__join-files {
        display: flex;
        align-items: flex-start;
        padding-top: 20px;
    }
    &__check {
        margin-right: 5px;
        cursor: pointer;
    }
    &__check-title {
        font-size: 14px;
    }
}

</style>
