<template lang="pug">
.step-files
    StepInfoTitle(title="Files" :isIconReversed="isFilesShown" @titleClick="toggleFilesShow")
    .step-files__table(v-if="isFilesShown")
        DataTable(
            :fields="fields"
            :tableData="stepFiles"
        )
            template(slot="headerCheck" slot-scope="{ field }")
                input.step-files__check(type="checkbox" v-model="isAllChecked")
            template(slot="headerFileName" slot-scope="{ field }")
                span.step-files__label {{ field.label }}
            template(slot="headerCategory" slot-scope="{ field }")
                span.step-files__label {{ field.label }}
            template(slot="headerSource" slot-scope="{ field }")
                span.step-files__label {{ field.label }}
            template(slot="headerTarget" slot-scope="{ field }")
                span.step-files__label {{ field.label }}
            template(slot="check" slot-scope="{ row, index }")
                .step-files__checkbox
                    input.step-files__check(type="checkbox" v-model="row.check")
            template(slot="fileName" slot-scope="{ row, index }")
                span.step-files__name(:class="{'step-files_break-word': row.fileName.length > 40}") {{ row.fileName }}
            template(slot="category" slot-scope="{ row, index }")
                span.step-files__data {{ row.category }}
            template(slot="source" slot-scope="{ row, index }") 
                a.step-files__link(:href='row.source')
                    img.step-files__image(src="../../../assets/images/download-big-b.png")
            template(slot="target" slot-scope="{ row, index }")
                img.step-files__image(v-if="row.category !== 'Reference file' && isCompleted" src="../../../assets/images/download-big-b.png" @click="downloadTargetFile(index)")                            
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
        },
        xtmJobs: {
            type: Array
        }
    },
    data() {
        return {
            isFilesShown: false,
            isAllChecked: false,
            fields: [
                {label: "Check", headerKey: "headerCheck", key: "check", width: "5%", padding: 0},
                {label: "File Name", headerKey: "headerFileName", key: "fileName", width: "33%", padding: 0},
                {label: "Category", headerKey: "headerCategory", key: "category", width: "22%", padding: 0},
                {label: "Source", headerKey: "headerSource", key: "source", width: "20%", padding: 0, cellClass: "step-files_centered"},
                {label: "Target", headerKey: "headerTarget", key: "target", width: "20%", padding: 0, cellClass: "step-files_centered"},
            ]
        }
    },
    methods: {
        ...mapActions({
            storeProject: "setCurrentProject",
            alertToggle: "alertToggle"
        }),
        toggleFilesShow() {
            this.isFilesShown = !this.isFilesShown;
        },
        async downloadTargetFile(index) {
            const xtmJob = this.xtmJobs.find(item => item.fileName === this.stepFiles[index].fileName);
            try {
                const id = this.currentProject._id;
                if(this.step.targetFiles && this.step.targetFiles.length) {
                    return this.downloadExistingTargets(this.step.targetFiles);
                }
                if(this.step.progress.wordsTotal != this.step.progress.wordsDone) return;
                const fileIds = await this.$http.post('/xtm/generate-file', {projectId: this.projectId, jobId: xtmJob.jobId});
                let updatedStep = {...this.step};
                updatedStep.targetFiles = [];
                for(let obj of fileIds.body) {
                    let fileLink = await this.$http.get(`/xtm/target-file?stepName=${this.step.name}&id=${id}&projectId=${this.projectId}&fileId=${obj.fileId}`);
                    let href = fileLink.body.path;
                    updatedStep.targetFiles.push(href);
                    let link = document.createElement('a');
                    link.href = __WEBPACK__API_URL__ + href;
                    link.click();
                }
                const updatedProject = await this.$http.post('/xtm/step-target', {step: updatedStep, projectId: id});
                await this.storeProject(updatedProject.body);
            } catch(err) {
                this.alertToggle({message: err.response.data, isShow: true, type: "error"});
            }
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
        }),
        isCompleted() {
            const { progress } = this.step;
            return progress.wordsDone / progress.wordsTotal * 100 >= 100;
        }
    },
    components: {
        StepInfoTitle,
        DataTable
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

%flex {
    display: flex;
    align-items: center;
    padding-left: 5px;
    height: 30px;
}

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
    &__data, &__checkbox, &__name {
        @extend %flex;
    }
    &__link {
        @extend %flex;
        padding-left: 0;
    }
    &_break-word {
        word-break: break-word;
        align-items: baseline;
        overflow-y: overlay;
    }
}

</style>
