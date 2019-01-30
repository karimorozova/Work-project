<template lang="pug">
.tasks-steps
    .tasks-steps__tasks-title Tasks and Steps
    .tasks-steps__input-data-row
        .tasks-steps__tasks-col
            .tasks-steps__drop-menu
                label.tasks-steps__menu-title.tasks-steps_relative Source Language
                    Asterisk(:customStyle="asteriskStyle")
                LanguagesSelect(
                    placeholder="Source Languages"
                    :langFilter="customerLangFilter.source"
                    :single='true'
                    :selectedLang="sourceLanguage"
                    @chosenLang="setSource"
                )
            .tasks-steps__drop-menu
                label.tasks-steps__menu-title Template
                SelectSingle(
                    :selectedOption="template"
                    :options="allTemplates"
                    placeholder="Template"
                    refersTo="template"
                    @chooseOption="setValue"
                )
        .tasks-steps__tasks-col
            .tasks-steps__drop-menu    
                label.tasks-steps__menu-title.tasks-steps_relative Target Languages
                    Asterisk(:customStyle="asteriskStyle")  
                LanguagesSelect(
                    placeholder="Target Languages"
                    :langFilter="customerLangFilter.target"
                    :selectedLang="targetLangs"
                    @chosenLang="setTargets"
                )
            .tasks-steps__drop-menu
                label.tasks-steps__menu-title.tasks-steps_relative Service
                    Asterisk(:customStyle="asteriskStyle")   
                SelectSingle(
                    :selectedOption="service" 
                    :options="allServices" 
                    placeholder="Service"
                    refersTo="service"
                    @chooseOption="setValue"
                )     
        .tasks-steps__tasks-col
            .tasks-steps__upload-file
                UploadFileButton(text="Source Files *")
                    input.tasks-steps__file-input.tasks-steps__source-file(type="file" @change='uploadSourceFiles' multiple)
                .tasks-steps__files-list
                    .tasks-steps__files-expander(v-if="sourceFiles.length")
                        .tasks-steps__list-title(@click="toggleSourceFiles") Files list
                            img.tasks-steps__list-icon(src="../../assets/images/arrow_open.png" :class="{'tasks-steps_reversed-icon': isSourceFilesShow}")
                    .tasks-steps__loaded-file(v-if="isSourceFilesShow" v-for="(file, index) in sourceFiles") {{ file.name }}
                        span.tasks-steps__delete-file(@click="deleteFile(index, 'sourceFiles')") +
            .tasks-steps__drop-menu
                label.tasks-steps__menu-title Workflow       
                SelectSingle(
                    :selectedOption="selectedWorkflow.name" 
                    :options="workflowStepsNames" 
                    placeholder="Service"
                    @chooseOption="setWorkflow"
                ) 
        .tasks-steps__tasks-col
            .tasks-steps__upload-file
                UploadFileButton(text="Reference Files")
                    input.tasks-steps__file-input.tasks-steps__ref-file(type="file" @change='uploadRefFiles' multiple)
                .tasks-steps__files-list
                    .tasks-steps__files-expander(v-if="refFiles.length")
                        .tasks-steps__list-title(@click="toggleRefFiles") Files list
                            img.tasks-steps__list-icon(src="../../assets/images/arrow_open.png" :class="{'tasks-steps_reversed-icon': isRefFilesShow}")
                    .tasks-steps__loaded-file(v-if="isRefFilesShow" v-for="(file, index) in refFiles") {{ file.name }}
                        span.tasks-steps__delete-file(@click="deleteFile(index, 'refFiles')") +
            .tasks-steps__add-tasks
                Button(value="Add tasks" @clicked="checkForErrors")
        .tasks-steps__join-files
            input.tasks-steps__check(type="checkbox" v-model="isJoinFiles")
            span.tasks-steps__check-title Join Files
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
import SelectSingle from "../SelectSingle";
import Asterisk from "../Asterisk";
import LanguagesSelect from "../LanguagesSelect";
import UploadFileButton from "../UploadFileButton";
import Button from "../Button";
import Tasks from "./Tasks";
import Steps from "./Steps";
import { mapGetters, mapActions } from 'vuex';

export default {
    data() {
        return {
            templates: [
                {name: 'Excel segment limit', id: 'XLSwithLimit'},
                {name: 'Multilingual Excel', id: 'multiexcel'},
                {name: 'Standard processing', id: '247336FD'},        
            ],
            workflowSteps: [{name: "1 Step", id: 2890}, {name: "2 Steps", id: 2917}],
            selectedWorkflow: {name:"2 Steps", id: 2917},
            template: "Standard processing",
            sourceLanguage: ["EN-GB"],
            targetLanguages: [],
            service: "",
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
            alertToggle: "alertToggle"
        }),
        defaultService() {
            const service = this.services.find(item => {
                return item.symbol === 'tr'
            });
            this.service = service.title;
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
        setValue({option, refersTo}) {
            this[refersTo] = option;
        },
        setWorkflow({option}) {
            this.selectedWorkflow = this.workflowSteps.find(item => item.name === option);
        },
        setSource({lang}) {
            this.sourceLanguage[0] = lang.symbol;
        },
        setTargets({lang}) { 
            const position = this.targetLangs.indexOf(lang.symbol);
            if(position != -1) {
                this.targetLanguages.splice(position, 1)
            } else {
                this.targetLanguages.push(lang);
            }
        },
        uploadSourceFiles(event) {
            this.sourceFiles.push(event.target.files[0]);
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
                    return this.clearInputFiles(".project-info__source-file");
                }
                this.isRefFilesShow = false;
                return this.clearInputFiles(".project-info__ref-file");
            }
        },
        clearInputFiles(str) {
            let inputFiles = document.querySelectorAll(str);
            for(let elem of inputFiles) {
                elem.value = "";
            }
        },
        async checkForErrors() {
            let errors = [];
            if(!this.selectedWorkflow) errors.push("Please, select Workflow.");
            if(!this.template) errors.push("Please, select Template.");
            if(!this.sourceLanguage.length) errors.push("Please, select Source language.");
            if(!this.targetLanguages.length) errors.push("Please, select Target language(s).");
            if(!this.service) errors.push("Please, select Service.");
            if(!this.sourceFiles.length) errors.push("Please, upload Source file(s).");
            if(errors.length) {
                return this.$emit("showErrors", { errors });
            }
            await this.addTasks();
        },
        getTasksData() {
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
        async addTasks() {
            const { xtmId, template, source, service } = this.getTasksData();
            let form = new FormData();
            form.append('customerId', xtmId);
            form.append('customerName', this.currentProject.customer.name);
            form.append('template', template.id);
            form.append('workflow', this.selectedWorkflow.id);
            form.append('service', service._id);
            form.append('source', JSON.stringify(source));
            form.append('targets', JSON.stringify(this.targetLanguages));
            form.append('projectId', this.currentProject._id);
            form.append('projectName', this.currentProject.projectName);
            form.append('join', this.isJoinFiles);
            if(this.sourceFiles.length) {
                for(let file of this.sourceFiles) {
                    form.append('sourceFiles', file)
                }
            }
            if(this.refFiles.length) {
                for(let file of this.refFiles) {
                    form.append('refFiles', file)
                }
            }
            try {
                await this.addProjectTasks(form);
                this.$emit("tasksAdded", {id: this.currentProject._id});
                this.alertToggle({message: "Tasks are added.", isShow: true, type: "success"});
                this.clearTasksFormData()
            } catch(err) {
                this.alertToggle({message: "Internal service error. Cannot add tasks.", isShow: true, type: "error"})
            }
        },
        clearTasksFormData() {
            this.template = "";
            this.targetLanguages = [];
            this.sourceFiles = [];
            this.refFiles = [];
            this.clearInputFiles(".project-info__file-input");
        },
        getMetrics() {
            this.$emit("getMetrics");
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
            return this.services.map(item => {
                return item.title
            })
        },
        allTemplates() {
            return this.templates.map(item => {
                return item.name
            })
        },
        targetLangs() {
            return this.targetLanguages.map(item => {
                return item.symbol
            })
        },
        workflowStepsNames() {
            return this.workflowSteps.map(item => {
                return item.name
            })
        },
        metricsButton() {
            return this.currentProject.isMetricsExist ? "Refresh metrics" : "Get metrics"
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
        Button,
        Tasks,
        Steps,
        Asterisk
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
    &__tasks-title {
        font-size: 18px; 
        margin-bottom: 20px;
    }
    &__input-data-row {
        margin-bottom: 20px;
        width: 100%;
        display: flex;
        justify-content: space-between;
        padding-bottom: 25px;
        border-bottom: 1px solid $main-color;
    }
    &__tasks-col {
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
    &__add-tasks {
        display: flex;
        height: 78px;
        align-items: flex-end;
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
