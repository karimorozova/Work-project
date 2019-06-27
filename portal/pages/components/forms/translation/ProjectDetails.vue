<template lang="pug">
    .project-details
        TitleInput(title="PROJECT DETAILS" :isAsterisk="true")
            .project-details__files
                .project-details__item
                    UploadFileButton(label="Files" buttonTitle="Upload File(s)" @uploadedFile="setDetailFiles")
                    .project-details__files-list
                        .project-details__files-item(v-for="(file, index) in detailFiles")
                            span.project-details__remove(@click="(e) => deleteFile(e, index, 'detailFiles')") +
                            span.project-details__file {{ file.name }}
                .project-details__item
                    UploadFileButton(label="Upload Reference File" @uploadedFile="setRefFiles")
                    .project-details__files-list
                        .project-details__files-item(v-for="(file, index) in refFiles")
                            span.project-details__remove(@click="(e) => deleteFile(e, index, 'refFiles')") +
                            span.project-details__file {{ file.name }}
</template>

<script>
import UploadFileButton from "~/components/buttons/UploadFileButton";
import TitleInput from "../TitleInput";
import { mapGetters, mapActions } from "vuex";

export default {
    data() {
        return {

        }
    },
    methods: {
        ...mapActions({
            setOrderDetail: "setOrderDetail",
            removeFile: "removeFile"
        }),
        setDetailFiles({ files }) {
            if(this.detailFiles && this.detailFiles.length) {
                let existingFiles = [...this.detailFiles];
                const fileNames = existingFiles.map(item => item.name);
                for(let file of files) {
                    if(fileNames.indexOf(file.name) === -1) {
                        existingFiles.push(file);
                    }
                }
                return this.setOrderDetail({prop: 'detailFiles', value: [...existingFiles]});
            }
            this.setOrderDetail({prop: 'detailFiles', value: [...files]});
        },
        setRefFiles({ files }) {
            this.setOrderDetail({prop: 'refFiles', value: files});            
        },
        deleteFile(e, index, arr) {
            this.removeFile({prop: arr, index})
        }
    },
    computed: {
        ...mapGetters({
            orderDetails: "getOrderDetails"
        }),
        detailFiles() {
            return this.orderDetails.detailFiles || [];
        },
        refFiles() {
            return this.orderDetails.refFiles || [];
        }
    },
    components: {
        UploadFileButton,
        TitleInput
    }
}
</script>

<style lang="scss" scoped>

.project-details {
    margin-top: 40px;
    width: 100%;
    box-sizing: border-box;
    &__files {
        display: flex;
        justify-content: space-between;
        margin-top: 30px;
        margin-left: 12px;
        box-sizing: border-box;
    }
    &__files-list {
        width: 171px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }
    &__files-item {
        display: flex;
        align-items: center;
    }
    &__remove {
        transform: rotate(45deg);
        margin-right: 5px;
        font-size: 18px;
        font-weight: 700;
        cursor: pointer;
    }
    &__file {
        font-size: 14px;
    }
}

</style>
