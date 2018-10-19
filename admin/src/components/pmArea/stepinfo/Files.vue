<template lang="pug">
.step-files
    StepInfoTitle(title="Files" :isIconReversed="isFilesShown" @titleClick="toggleFilesShow")
    .step-files__table(v-if="isFilesShown")
        DataTable(
            :fields="fields"
            :tableData="stepFiles"
        )
            template(slot="Check" slot-scope="{ field }")
                input.step-files__check(type="checkbox" v-model="isAllChecked")
            template(slot="File Name" slot-scope="{ field }")
                span.step-files__label {{ field.label }}
            template(slot="Category" slot-scope="{ field }")
                span.step-files__label {{ field.label }}
            template(slot="Source" slot-scope="{ field }")
                span.step-files__label {{ field.label }}
            template(slot="Target" slot-scope="{ field }")
                span.step-files__label {{ field.label }}
            template(slot="check" slot-scope="{ row, index }")
                input.step-files__check(type="checkbox" v-model="row.check")
            template(slot="fileName" slot-scope="{ row, index }")
                span.step-files__data {{ row.fileName }}
            template(slot="category" slot-scope="{ row, index }")
                span.step-files__data {{ row.category }}
            template(slot="source" slot-scope="{ row, index }")
                img.step-files__image(src="../../../assets/images/download-big-b.png" @click="downloadSourceFile(index)")
            template(slot="target" slot-scope="{ row, index }")
                img.step-files__image(src="../../../assets/images/download-big-b.png" @click="downloadTargetFile")                            
</template>

<script>
import StepInfoTitle from "./StepInfoTitle";
import DataTable from "../../DataTable";
import { mapGetters, mapActions } from 'vuex';

export default {
    props: {
        stepFiles: {
            type: Array
        },
        step: {
            type: Object
        },
        projectId: {
            type: Number
        }
    },
    data() {
        return {
            isFilesShown: false,
            isAllChecked: false,
            fields: [
                {label: "Check", key: "check", width: "5%"},
                {label: "File Name", key: "fileName", width: "33%"},
                {label: "Category", key: "category", width: "22%"},
                {label: "Source", key: "source", width: "20%", cellClass: "step-files_centered"},
                {label: "Target", key: "target", width: "20%", cellClass: "step-files_centered"},
            ]
        }
    },
    methods: {
        ...mapActions({
            storeProject: "setCurrentProject",
        }),
        toggleFilesShow() {
            this.isFilesShown = !this.isFilesShown;
        },
        downloadSourceFile(index) {
            const href = this.stepFiles[index].source.split('./dist')[1];
            let link = document.createElement('a');
            link.href = __WEBPACK__API_URL__ + href;
            link.click();
        },
        async downloadTargetFile() {
            const id = this.currentProject._id;
            if(this.step.targetFiles && this.step.targetFiles.length) {
                return this.downloadExistingTargets(this.step.targetFiles);
            }
            const fileIds = await this.$http.post('/xtm/generate-file', {projectId: this.projectId, taskId: this.step.taskId});
            let updatedStep = {...this.step};
            updatedStep.targetFiles = [];
            for(let obj of fileIds.body) {
                let fileLink = await this.$http.get(`/xtm/target-file?id=${id}&projectId=${this.projectId}&fileId=${obj.fileId}`);
                let href = fileLink.body.path;
                updatedStep.targetFiles.push(href);
                let link = document.createElement('a');
                link.href = __WEBPACK__API_URL__ + href;
                link.click();
            }
            const updatedProject = await this.$http.post('/xtm/step-target', {step: updatedStep, projectId: id});
            await this.storeProject(updatedProject.body);
        },
        downloadExistingTargets(arr) {
            for(let path of arr) {
                let link = document.createElement('a');
                link.href = __WEBPACK__API_URL__ + path;
                link.click();
            }
        }
    },
    computed: {
        ...mapGetters({
            currentProject: "getCurrentProject"
        })
    },
    components: {
        StepInfoTitle,
        DataTable
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.step-files {
    box-shadow: 0 0 5px $brown-shadow;
    padding: 10px;
    &__table {
        margin-top: 20px;
    }
    &__image {
        height: 18px;
        width: 18px;
        cursor: pointer;
    }
}

</style>
