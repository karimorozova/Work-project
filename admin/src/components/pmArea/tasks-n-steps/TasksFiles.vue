<template lang="pug">
.tasks-files
        .tasks-files__main
            .tasks-files__item(v-if="service.calculationUnit === 'Words'")
                span.tasks-files__label Source file:
                .tasks-files__upload-file
                    FilesUpload(
                        buttonValue="Source Files *"
                        inputClass="files-upload__source-file"
                        :files="sourceFiles"
                        @uploadFiles="uploadSourceFiles"
                        @deleteFile="(e) => deleteFile(e, 'sourceFiles')")
            .tasks-files__item
                span.tasks-files__label Reference file:
                .tasks-files__upload-file
                    FilesUpload(
                        buttonValue="Reference Files"
                        inputClass="files-upload__ref-file"
                        :files="refFiles"
                        @uploadFiles="uploadRefFiles"
                        @deleteFile="(e) => deleteFile(e, 'refFiles')")
</template>

<script>
import FilesUpload from "./tasksFiles/FilesUpload";
import { mapActions } from "vuex";

export default {
    props: {
        service: {
            type: Object
        }
    },
    data() {
        return {
            sourceFiles: [],
            refFiles: [],
            isSourceFilesShow: false,
            isRefFilesShow: false,
        }
    },
    methods: {
        ...mapActions({
            setDataValue: "setTasksDataValue"
        }),
        uploadSourceFiles({ files }) {
            if (files.length) {
                for (let file of files) {
                    const isExist = this.sourceFiles.find(item => item.name === file.name);
                    if (!isExist) {
                        this.sourceFiles.push(file);
                    }
                }
            }
            this.setDataValue({prop: "sourceFiles", value: this.sourceFiles});
            this.$emit('uploadSourceFiles', { files });
        },
        uploadRefFiles({ files }) {
            if (files.length) {
                this.refFiles.push(files[0]);
            }
            this.setDataValue({prop: "refFiles", value: this.refFiles});
        },
        deleteFile({ index }, prop) {
            this[prop].splice(index, 1);
            this.setDataValue({prop, value: this[prop]});
            if (!this[prop].length) {
                if (prop === "sourceFiles") {
                    this.isSourceFilesShow = false;
                    return this.clearInputFiles(".files-upload__source-file");
                }
                this.isRefFilesShow = false;
                return this.clearInputFiles(".files-upload__ref-file");
            }
        },
        clearInputFiles(str) {
            let inputFiles = document.querySelectorAll(str);
            for (let elem of inputFiles) {
                elem.value = "";
            }
        },
        toggleSourceFiles() {
            this.isSourceFilesShow = !this.isSourceFilesShow;
        },
        toggleRefFiles() {
            this.isRefFilesShow = !this.isRefFilesShow;
        }
    },
    components: {
        FilesUpload,
    }
}
</script>

<style lang="scss" scoped>

.tasks-files {
    &__item {
        display: flex;
        align-items: center;
    }

    &__label {
        margin-right: 15px;
    }

    &__main {
        display: flex;
        align-items: center;
        margin-bottom: 40px;
        justify-content: space-between;
    }

    &__upload-file {
        position: relative;
    }
}

</style>
