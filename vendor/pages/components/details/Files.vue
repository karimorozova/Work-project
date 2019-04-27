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
            template(slot="headerSource" slot-scope="{ field }")
                span.job-files__label {{ field.label }}
            template(slot="headerTarget" slot-scope="{ field }")
                span.job-files__label {{ field.label }}
            template(slot="fileName" slot-scope="{ row, index }")
                span.job-files__name(:class="{'job-files_break-word': row.fileName.length > 40}") {{ row.fileName }}
            template(slot="category" slot-scope="{ row, index }")
                span.job-files__data {{ row.category }}
            template(slot="source" slot-scope="{ row, index }")
                .job-files_flex-centered
                    a.job-files__link(:href='row.source')
                        img.job-files__image(src="../../../assets/images/download.png")                         
</template>

<script>
import DataTable from "~/components/Tables/DataTable";
import { mapGetters, mapActions } from 'vuex';

export default {
    props: {
        domain: {type: String}
    },
    data() {
        return {
            jobFiles: [],
            fields: [
                {label: "File Name", headerKey: "headerFileName", key: "fileName", width: "48%", padding: 0},
                {label: "Category", headerKey: "headerCategory", key: "category", width: "32%", padding: 0},
                {label: "Source", headerKey: "headerSource", key: "source", width: "20%", padding: 0}
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
                    fileName: fileName,
                    category: category,
                    source: filePath
                })
            }
            return files;
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
        DataTable
    },
    mounted() {
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