<template lang="pug">
    .tasks-files
        .tasks-files__upload-file
            FilesUpload(
                buttonValue="Source Files *"
                inputClass="files-upload__source-file"
                :files="sourceFiles"
                @uploadFiles="uploadSourceFiles"
                @deleteFile="(e) => deleteFile(e, 'sourceFiles')")
        .tasks-files__upload-file
            FilesUpload(
                buttonValue="Reference Files"
                inputClass="files-upload__ref-file"
                :files="refFiles"
                @uploadFiles="uploadRefFiles"
                @deleteFile="(e) => deleteFile(e, 'refFiles')")
        .tasks-files__join
            span.tasks-files__toggler-title  Join Files
            .tasks-files__toggler
                BigToggler(:isOn="isJoinFiles" @toggle="toggleJoin")
</template>

<script>
import FilesUpload from "./tasksFiles/FilesUpload";
import BigToggler from "@/components/BigToggler";

export default {
    props: {
        sourceFiles: { type: Array },
        refFiles: { type: Array },
        isJoinFiles: { type: Boolean }
    },
    data() {
        return {
            isSourceFilesShow: false,
            isRefFilesShow: false,
        }
    },
    methods: {
        uploadSourceFiles({files}) {
            this.$emit('uploadSourceFiles', { files });
        },
        toggleSourceFiles() {
            this.isSourceFilesShow = !this.isSourceFilesShow;
        },
        uploadRefFiles({files}) {
            this.$emit('uploadRefFiles', { files });
        },
        toggleRefFiles() {
            this.isRefFilesShow = !this.isRefFilesShow;
        },
        deleteFile({index}, prop) {
            this.$emit('deleteFile', { index, prop });
        },
        toggleJoin() {
            this.$emit("toggleJoin")
        }
    },
    components: {
        FilesUpload,
        BigToggler
    }
}
</script>

<style lang="scss" scoped>

.tasks-files {
    display: flex;
    justify-content: space-between;
    align-items: center;
    &__upload-file {
        position: relative;
    }
    &__join {
        width: 191px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    &__toggler-title {
        font-size: 14px;
        margin-right: 15px;
    }
}

</style>
