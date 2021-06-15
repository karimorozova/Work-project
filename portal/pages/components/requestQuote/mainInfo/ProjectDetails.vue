<template lang="pug">
    .project-details
        SectionTitle(text="PROJECT DETAILS" number="4")
        .project-details__main
            .project-details__item
                Files(label="Files" buttonTitle="Upload file(s)" ref="det" inputName="detailFiles" isMultiple)
                Deadline
            .project-details__item(v-if="detailFiles.length")            
                UploadedList(:files="detailFiles" @remove="(e) => removeFile(e, 'detailFiles')")
            .project-details__item
                Files(label="Upload Reference File" buttonTitle="Upload" comment="Type Text" inputName="refFiles" :isMultiple="isRefFilesMultiple")
                FileTypes
            .project-details__item(v-if="refFiles.length")
                UploadedList(:files="refFiles" @remove="(e) => removeFile(e, 'refFiles')")
        .project-details__brief
            .project-details__title Enter a short brief
            textarea.project-details__text(rows="10" @input="setBrief")
</template>

<script>
import SectionTitle from "./SectionTitle";
import Files from "./projectDetails/Files";
import Deadline from "./projectDetails/Deadline";
import FileTypes from "./projectDetails/FileTypes";
import UploadedList from "./projectDetails/UploadedList";
import { mapActions, mapGetters } from "vuex";

export default {
    data() {
        return {
            isRefFilesMultiple: false
        }
    },
    methods: {
        ...mapActions({
            setDetail: "setRequestQuoteDetail"
        }),
        removeFile({index}, arrName) {
            let filesArr = [...this[arrName]];
            filesArr.splice(index, 1);
            this.setDetail({prop: arrName, value: filesArr});
            if(!filesArr.length) {
                this.resetInput(arrName);
            }
        },
        resetInput(name) {
            let input = document.querySelector(`input[name=${name}]`);
            input.value = "";
        },
        setBrief(e) {
            const { value } = e.target;
            this.setDetail({prop: 'brief', value});
        }
    },
    computed: {
        ...mapGetters({
            requestDetails: "getRequestQuoteDetails"
        }),
        detailFiles() {
            return this.requestDetails.detailFiles || [];
        },
        refFiles() {
            return this.requestDetails.refFiles || [];
        }
    },
    components: {
        SectionTitle,
        Files,
        Deadline,
        FileTypes,
        UploadedList
    }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors.scss";

.project-details {
    margin-bottom: 30px;
    &__main {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    &__item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 40px;
        box-sizing: border-box;
        width: 80%;
        margin-bottom: 40px;
        @media (max-width: 768px) {
            padding: 0;
        }
        @media (max-width: 550px) {
            width: 90%;
        }
    }
    &__brief {
        width: 100%;
    }
    &__title {
        font-family: MyriadBold;
        font-size: 14px;
    }
    &__text {
        resize: none;
        width: 100%;
        box-sizing: border-box;
        padding: 5px;
        border: 1px solid $light-brown;
        border-radius: 4px;
        outline: none;
        &:focus {
            box-shadow: 0 0 5px $light-brown;
        }
    }
}

</style>
