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
                TasksFiles(:service="tasksData.service")
            .tasks-data__files(v-else)
                TasksFilesRequested
            .tasks-data__join-files-wrapper(v-if="currentUnit === 'Words'")
                .tasks-data__join
                    span.tasks-data__toggler-title  Join Files
                    .tasks-data__toggler
                        BigToggler(:isOn="isJoinFiles" @toggle="toggleJoin")
                .tasks-data__drop-menu
                    label.tasks-data__menu-title Template
                    SelectSingle(
                        :selectedOption="selectedTemplate"
                        :options="allTemplates"
                        placeholder="Template"
                        @chooseOption="setTemplate"
                    )
    .tasks-data__add-tasks(v-if="isProject")
        Button(value="Add tasks" @clicked="checkForErrors")
    .tasks-data__buttons(v-else)
        .tasks-data__button
            Button(value="Assign to PM")
        .tasks-data__button
            Button(value="Analyze")
    slot(name="errors")
</template>

<script>
import TasksLangs from "./TasksLangs";
import TasksLangsDuo from "./TasksLangsDuo";
import TasksFiles from "./TasksFiles";
import TasksFilesRequested from "./TasksFilesRequested";
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
            templates: [
                {name: 'Excel segment limit', id: 'XLSwithLimit'},
                {name: 'Multilingual Excel', id: 'multiexcel'},
                {name: 'Standard processing', id: '247336FD'},
            ],
            sourceLanguages: [],
            targetLanguages: [],
            isJoinFiles: false,
        }
    },
    methods: {
        ...mapActions({
            addProjectTasks: "addProjectTasks",
            alertToggle: "alertToggle",
            xtmCustomersGetting: "xtmCustomersGetting",
            setDataValue: "setTasksDataValue"
        }),
        setSourceLang({ symbol }) {
            const value = this.languages.find(item => item.symbol === symbol);
            this.setDataValue({prop: "source", value});
            this.setDataValue({prop: "targets", value: []});
            this.sourceLanguages = [value.symbol];
        },
        setTemplate({ option }) {
            const value = this.templates.find(item => item.name === option);
            this.setDataValue({prop: "template", value});
        },
        setTargets({ targets }) {
            this.setDataValue({prop: "targets", value: targets});
            this.targetLanguages = [...targets];
        },
        toggleJoin() {
            this.isJoinFiles = !this.isJoinFiles;
            this.setDataValue({prop: "isJoinFiles", value: this.isJoinFiles});
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
        async checkForErrors() {
            let errors = [];
            const { targets, sourceFiles } = this.tasksData;
            if (!targets || !targets.length) errors.push("Please, select Target language(s).");
            if (!sourceFiles || !sourceFiles.length) errors.push("Please, upload Source file(s).");
            if (sourceFiles && sourceFiles.length && this.isRefFilesHasSource()) errors.push("Reference file cannot be the same as Source!");
            if (errors.length) {
                return this.$emit("showErrors", { errors });
            }
            try {
                await this.addTasks();
            } catch (err) {
                this.alertToggle({message: "Error on adding tasks",isShow: true,type: "error"});
            }
        },
        async getCustomersFromXtm() {
            try {
                if (!this.xtmCustomers.length) {
                    let result = await this.$http.get('/xtm/xtm-customers');
                    this.xtmCustomersGetting(result.body);
                }
            } catch (err) {
                this.alertToggle({message: "Error on getting XTM customers",isShow: true,type: "error"});
            }
        },
        async getXtmId() {
            try {
                if (!this.xtmCustomers.length) {
                    await this.getCustomersFromXtm();
                }
            } catch (err) {}
            const xtmCustomer = this.xtmCustomers.find(item => item.name === this.currentProject.customer.name);
            const xtmId = xtmCustomer ? xtmCustomer.id : "";
            return { xtmId };
        },
        async addTasks() {
            const { xtmId } = await this.getXtmId();
            const source = this.tasksData.source || this.languages.find(item => item.symbol === 'EN-GB');
            this.$emit("addTasks", {
                isJoinfiles: this.tasksData.isJoinFiles,
                sourceFiles: this.tasksData.sourceFiles,
                refFiles: this.tasksData.refFiles || [],
                stepsDates: this.tasksData.stepsDates,
                xtmId,
                template: this.tasksData.template,
                source,
                targets: this.tasksData.targets,
                service: this.tasksData.service,
                workflow: this.tasksData.workflow.id
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
    },
    computed: {
        ...mapGetters({
            currentProject: 'getCurrentProject',
            languages: "getAllLanguages",
            services: "getVuexServices",
            xtmCustomers: "getXtmCustomers",
            tasksData: "getTasksData"
        }),
        allServices() {
            if (this.services.length) {
                return this.services.map(item => item.title);
            }
            return [];
        },
        allTemplates() {
            return this.templates.map(item => item.name);
        },
        selectedTemplate() {
            return this.tasksData.template ? this.tasksData.template.name : "";
        },
        isMonoService() {
            return this.tasksData.service ? this.tasksData.service.languageForm === "Mono" : false;
        },
        isProject() {
            return this.currentProject.status && this.currentProject.status !== "Requested";
        },
        currentUnit() {
            return this.tasksData.service ? this.tasksData.service.calculationUnit : "";
        }
    },
    components: {
        TasksLangs,
        TasksLangsDuo,
        TasksFiles,
        TasksFilesRequested,
        SelectSingle,
        Button,
        ServiceAndWorkflow,
        BigToggler
    },
    mounted() {
        this.setDataValue({prop: "template", value: {name: 'Standard processing', id: '247336FD'}});
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

    &__join {
        width: 145px;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 63px;
    }

    &__join-files-wrapper {
        display: flex;
        justify-content: space-between;
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
        width: 191px;
    }

    &__menu-title {
        font-size: 14px;
    }
    &__add-tasks {
        display: flex;
        justify-content: center;
        padding-top: 20px;
    }

    &__join-files {
        display: flex;
        align-items: flex-start;
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

}
</style>
