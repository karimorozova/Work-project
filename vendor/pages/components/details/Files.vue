<template lang="pug">
.job-files
    .job-files__table
        DataTable(
            :fields="fields"
            :tableData="jobFiles"
            bodyClass="table_no-body-bottom-margin"
        )
            template(slot="headerFileName" slot-scope="{ field }")
                span.job-files__label {{ field.label }}
            template(slot="headerCategory" slot-scope="{ field }")
                span.job-files__label {{ field.label }}
            template(slot="headerProgress" slot-scope="{ field }")
                span.job-files__label {{ field.label }}
            template(slot="headerSource" slot-scope="{ field }")
                span.job-files__label {{ field.label }}
            template(slot="headerTarget" slot-scope="{ field }")
                span.job-files__label {{ field.label }}
            template(slot="headerEditor" slot-scope="{ field }")
                span.job-files__label {{ field.label }}
            template(slot="fileName" slot-scope="{ row, index }")
                span.job-files__name(:class="{'job-files_break-word': row.fileName.length > 40}") {{ row.fileName }}
            template(slot="category" slot-scope="{ row, index }")
                span.job-files__data {{ row.category }}
            template(slot="progress" slot-scope="{ row, index }")
                .job-files__progress(v-if="row.category === 'Source file'")
                    ProgressLine(:progress="getProgress(row)")
            template(slot="source" slot-scope="{ row, index }")
                .job-files_flex-centered
                    a.job-files__link(:href='row.source')
                        img.job-files__image(src="../../../assets/images/download.png")
            template(slot="target" slot-scope="{ row, index }")
                .job-files_flex-centered(v-if="row.category === 'Source file'")
                    .job-files__link(v-if="getProgress(row) === 100 && job.status === 'Completed'")
                        img.job-files__image(src="../../../assets/images/download.png" @click="downloadTarget(row)")
            template(slot="editor" slot-scope="{ row, index }")
                .job-files__editor(v-if="job.status === 'Started' && row.category === 'Source file'")
                    img.job-files__icon(src="../../../assets/images/goto-editor.png" @click="goToXtmEditor(row)")                   
</template>

<script>
import DataTable from "~/components/Tables/DataTable";
import ProgressLine from "~/components/ProgressLine";
import { mapGetters, mapActions } from 'vuex';

export default {
    data() {
        return {
            jobFiles: [],
            fields: [
                {label: "File Name", headerKey: "headerFileName", key: "fileName", width: "35%", padding: 0},
                {label: "Category", headerKey: "headerCategory", key: "category", width: "25%", padding: 0},
                {label: "Progress", headerKey: "headerProgress", key: "progress", width: "12%", padding: 0},
                {label: "Source", headerKey: "headerSource", key: "source", width: "10%", padding: 0},
                {label: "Target", headerKey: "headerTarget", key: "target", width: "10%", padding: 0},
                {label: "Editor", headerKey: "headerEditor", key: "editor", width: "8%", padding: 0}
            ],
            domain: ""
        }
    },
    methods: {
        ...mapActions({
            setJob: "selectJob",
            alertToggle: "alertToggle"
        }),
        getFilesJobId(file) {
            const xtmJob = this.job.xtmJobIds.find(item => item.fileName === file.fileName);
            return xtmJob ? xtmJob.jobId : "";
        },
        getProgress(file) {
            const jobId = this.getFilesJobId(file);
            const progress = jobId ? this.job.progress[jobId] : "";
            return progress ? +(progress.wordsDone / progress.totalWordCount * 100).toFixed(2): "";
        },
        toggleFilesShow() {
            this.isFilesShown = !this.isFilesShown;
        },
        fillJobFiles() {
            if(this.job.sourceFiles) {
                this.jobFiles.push(...this.jobFilesFiller(this.job.sourceFiles, "Source file"));
            }
            if(this.job.refFiles) {
                this.jobFiles.push(...this.jobFilesFiller(this.job.refFiles, "Reference file"));
            }
        },
        jobFilesFiller(arr, category) {
            let files = [];
            for(let file of arr) {
                const nameArr = file.split('/');
                const filePath = this.domain + file.split('./dist')[1];
                const fileName = nameArr[nameArr.length - 1];
                files.push({
                    fileName,
                    category: category,
                    source: filePath
                })
            }
            return files;
        },
        async goToXtmEditor(file) {
            const jobId = this.getFilesJobId(file);
            try {
                const url = await this.$axios.get(`/xtm/editor?jobId=${jobId}&stepName=${this.job.name}`);
                let link = document.createElement("a");
                link.target = "_blank";
                link.href = url.data;
                link.click();
            } catch(err) {
                this.alertToggle({message: err.message, isShow: true, type: "error"});
            }
        },
        async downloadTarget(file) {
            const jobId = this.getFilesJobId(file);
            const existingTarget = this.getExistingTargetPath(jobId);
            if(existingTarget) {
                return this.createLinkAndDownolad(existingTarget);
            }
            try {
                const fileId = await this.$axios.post('/xtm/generate-file', {projectId: this.job.xtmProjectId, jobId});
                let fileLink = await this.$axios.post('/xtm/target-file', 
                    {step: this.job, id: this.job.project_Id, projectId: this.job.xtmProjectId, file: {...fileId.data[0], fileName: file.fileName}});
                let href = fileLink.data.path;
                this.createLinkAndDownolad(href);
                this.setCurrentJob(fileLink.data.updatedProject);
            } catch(err) {
                this.alertToggle({message: err.message, isShow: true, type: "error"});
            }
        },
        createLinkAndDownolad(href) {
            let link = document.createElement('a');
            link.href = this.domain + href;
            link.target = "_blank";
            link.click();
        },
        getExistingTargetPath(jobId) {
            const xtmJob = this.job.xtmJobIds.find(item => item.jobId === jobId);
            return xtmJob.targetFile;
        },
        setCurrentJob(project) {
            const { tasks } = project;
            const updatedTask = tasks.find(item => item.taskId === this.job.taskId);
            const currentJob = {...this.job, xtmJobIds: updatedTask.xtmJobs};
            this.setJob(currentJob);
        }
    },
    computed: {
        ...mapGetters({
            job: "getSelectedJob"
        }),
        isCompleted() {
            const { progress } = this.job;
            return progress.wordsDone / progress.wordsTotal * 100 >= 100;
        }
    },
    components: {
        DataTable,
        ProgressLine
    },
    mounted() {
        this.domain = process.env.domain;
        this.fillJobFiles();
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

.job-files {
    box-shadow: 0 0 5px $brown-shadow;
    padding: 10px;
    width: 100%;
    box-sizing: border-box;
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
    &__progress {
        @extend %flex;
        padding: 0 3px;
    }
    &__editor {
        @extend %flex;
        padding: 0;
        justify-content: center;
    }
    &_break-word {
        word-break: break-word;
        align-items: baseline;
        overflow-y: overlay;
    }
    &_flex-centered {
        display: flex;
        justify-content: center;
    }
}

</style>