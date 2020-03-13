<template lang="pug">
    .project-details
        TitleInput(title="PROJECT DETAILS" :isAsterisk="true")
            .project-details__files
                .project-details__item
                    UploadFileButton(label="Files" buttonTitle="Upload File(s)" @uploadedFile="setDetailFiles" inputName="detailFiles")
                    .project-details__error(v-if="isDetailBig") Total size must be <= 10MB (file <= 2MB)
                    .project-details__files-list
                        .project-details__files-item(v-for="(file, index) in detailFiles")
                            span.project-details__remove(@click="(e) => deleteFile(e, index, 'detailFiles')") +
                            span.project-details__file {{ file.name }}
                .project-details__item
                    UploadFileButton(label="Upload Reference File" @uploadedFile="setRefFiles" inputName="refFiles")
                    .project-details__error(v-if="isRefBig") Total size must be <= 5MB (file <= 2MB)
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
            isRefBig: false,
            isDetailBig: false
        }
    },
    methods: {
        ...mapActions({
            setOrderDetail: "setOrderDetail",
            removeFile: "removeFile"
        }),
        showBigFileError(prop) {
            this[prop] = true;
            setTimeout(() => {
                this[prop] = false;
            }, 6000)
        },
        setDetailFiles({ files }) {
            const filteredFiles = Array.from(files).filter(item => item.size/1000000 <= 2);
            if(this.detailFiles && this.detailFiles.length) {
                const filesSizesSum = Array.from([...filteredFiles, ...this.detailFiles]).reduce((acc, cur) => acc + cur.size, 0);
                if(filesSizesSum/1000000 > 10 || !filteredFiles.length) return this.showBigFileError("isDetailBig");
                let existingFiles = [...this.detailFiles];
                const fileNames = existingFiles.map(item => item.name);
                for(let file of filteredFiles) {
                    if(fileNames.indexOf(file.name) === -1) {
                        existingFiles.push(file);
                    }
                }
                return this.setOrderDetail({prop: 'detailFiles', value: [...existingFiles]});
                this.clearFileInput('detailFiles');
            }
            const filesSizesSum = filteredFiles.reduce((acc, cur) => acc + cur.size, 0);
            if(filesSizesSum/1000000 > 10  || !filteredFiles.length) return this.showBigFileError("isDetailBig");
            this.setOrderDetail({prop: 'detailFiles', value: [...filteredFiles]});
            this.clearFileInput('detailFiles');
        },
        setRefFiles({ files }) {
            const filteredFiles = Array.from(files).filter(item => item.size/1000000 <= 2);
            const filesSizesSum = filteredFiles.reduce((acc, cur) => acc + cur.size, 0);
            if(filesSizesSum/1000000 > 5  || !filteredFiles.length) return this.showBigFileError("isRefBig");
            this.setOrderDetail({prop: 'refFiles', value: [...filteredFiles]});
            this.clearFileInput('refFiles');
        },
        clearFileInput(name) {
            const fileInput = document.querySelector(`input[name=${name}]`);
            fileInput.value = "";
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
    &__item {
        position: relative;
    }
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
    &__error {
        position: absolute;
        color: red;
        font-size: 14px;
        top: -25px;
        width: 180%;
    }
}

</style>
