<template lang="pug">
    .tasks-files
        .tasks-files__main
            .tasks-files__item(v-if="isWordcount")
                span Source file:
                span.tasks-files__label-red *
                .tasks-files__upload-file
                    FilesUpload(
                        buttonValue="Source Files *"
                        inputClass="files-upload__source-file"
                        :files="sourceFiles"
                        @uploadFiles="uploadSourceFiles"
                        @deleteFile="(e) => deleteFile(e, 'sourceFiles')")
            .tasks-files__item
                span Reference file:
                span.tasks-files__label-red *
                .tasks-files__upload-file
                    FilesUpload(
                        buttonValue="Reference Files"
                        inputClass="files-upload__ref-file"
                        :files="refFiles"
                        @uploadFiles="uploadRefFiles"
                        @deleteFile="(e) => deleteFile(e, 'refFiles')")
        .tasks-files__tooltip Total size must be <= 10Mb, each file can be <= 2Mb
</template>

<script>
import FilesUpload from "./tasksFiles/FilesUpload";
import { mapActions } from "vuex";

export default {
    props: {
        tasksData: {
            type: Object
        }
    },
    data() {
        return {
            sourceFiles: [],
            refFiles: [],
            isSourceFilesShow: false,
            isRefFilesShow: false,
            forbiddenExtensions: [
                "webm","mpg","mp2","mpeg","mpe","mpv","ogg","mp4","m4p",
                "m4v","avi","wmv","mov","qt","flv","swf","avchd","jpeg",
                "png","gif","bmp","tiff","ppm","pgm","jpg","svg","bat",
                "mp3", "aac", "3gp","aa","aax","aiff","alac","m4p","mpc"
            ]
        }
    },
    methods: {
        ...mapActions({
            setDataValue: "setTasksDataValue"
        }),
        checkFiles(files) {
            const sizesSum = files.reduce((acc, cur) => acc + cur.size, 0);
            return sizesSum/1000000 <= 10;
        },
        uploadSourceFiles({ files }) {
            const filteredFiles = Array.from(files).filter(item => {
                const {size, name} = item;
                const extension = name.split(".").pop();
                return size/1000000 <= 2 && this.forbiddenExtensions.indexOf(extension) === -1
                });
            if (filteredFiles.length && this.checkFiles(filteredFiles)) {
                for (let file of filteredFiles) {
                    const isExist = this.sourceFiles.find(item => item.name === file.name);
                    if (!isExist) {
                        this.sourceFiles.push(file);
                    }
                }
            }
            if(!filteredFiles.length) {
                this.clearInputFiles(".files-upload__source-file")
            }
            this.setDataValue({prop: "sourceFiles", value: this.sourceFiles});
        },
        uploadRefFiles({ files }) {
            const filteredFiles = Array.from(files).filter(item => item.size/1000000 <= 2);
            if (filteredFiles.length && this.checkFiles(filteredFiles)) {
                for (let file of files) {
                    const isExist = this.refFiles.find(item => item.name === file.name);
                    if (!isExist) {
                        this.refFiles.push(file);
                    }
                }
            }
            if(!filteredFiles.length) {
                this.clearInputFiles(".files-upload__ref-file")
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
    },
    computed: {
        isWordcount() {
            return this.tasksData.stepsAndUnits
                ? this.tasksData.stepsAndUnits
                    .map(item => item.unit)
                    .includes("CAT Wordcount")
                : false;
        }
    }
}
</script>

<style lang="scss" scoped>

.tasks-files {
    position: relative;
    &__item {
        display: flex;
        align-items: center;
    }

    &__label {
        margin-right: 15px;
        &-red{
            color: red;
            font-size: 14px;
            margin-right: 15px;
        }
    }

    &__main {
        display: flex;
        align-items: center;
        margin-bottom: 60px;
        justify-content: space-between;
    }

    &__upload-file {
        position: relative;
    }
    &__tooltip {
        position: absolute;
        bottom: -25px;
        opacity: 0.5;
        font-size: 14px;
        width: 100%;
    }
}

</style>
