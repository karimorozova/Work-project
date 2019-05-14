<template lang="pug">
    .review
        .review__top-icons
            img.review__save(src="../../../assets/images/Other/save-icon-qa-form.png" @click="saveChanges")
            span.review__close(@click="close") +
        .review__title Delivery Review
        .review__check
            .review__check-item
                Check(@toggleApprovement="(e) => toggle(e, 'areFilesChecked')" 
                    :isApproved="areFilesChecked"
                    text="Download and check file")
            .review__check-item
                Check(@toggleApprovement="(e) => toggle(e, 'areFilesConverted')" 
                    :isApproved="areFilesConverted"
                    text="Make sure to convert all doc files into PDF")
        .review__table
            Table(:tableData="stepFiles" @approveFile="approveFile" @makeAction="makeFileAction" @uploadFile="uploadFile")
        .review__options(v-if="isAllChecked")
            .review__options-check
                CheckBox(:isChecked="areOptions" 
                    customClass="review-options"
                    @check="(e) => toggleOptions(e, true)" 
                    @uncheck="(e) => toggleOptions(e, false)")
            Options(v-if="areOptions"
                :isDeliver="isDeliver"
                :isNotify="isNotify"
                @toggleDelivery="toggleDelivery"
                @toggleNotify="toggleDelivery"
            )
        .review__button
            Button(v-if="isAllChecked"
                value="Approve Deliverable"
                @clicked="approve"
            )
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import Table from "../review/Table";
import Check from "../review/Check";
const Options = () => import("../review/Options");
const CheckBox = () => import("@/components/CheckBox");
const Button = () => import("@/components/Button");

export default {
    data() {
        return {
            stepFiles: [],
            areFilesChecked: false,
            areFilesConverted: false,
            areOptions: true,
            isDeliver: true,
            isNotify: false
        }
    },
    props: {
        tasks: {type: Array}
    },
    methods: {
        ...mapActions({
            approveDeliveryFile: "approveDeliveryFile",
            uploadTarget: "uploadTarget",
            approveWithOption: "approveWithOption",
            approveDeliverable: "approveDeliverable"
        }),
        close() {
            this.$emit("close")
        },
        getStepsFiles() {
            for(let task of this.tasks) {
                const { xtmJobs } = task;
                const files = xtmJobs.reduce((prev, cur) => {
                    const fileName = cur.targetFile.split("/").pop();
                    prev.push({
                        fileName,
                        pair: `${task.sourceLanguage} >> ${task.targetLanguage}`,
                        taskId: task.taskId,
                        jobId: cur.jobId,
                        path: cur.targetFile,
                        isFileApproved: cur.isFileApproved
                    })
                    return [...prev];
                }, [])
                this.stepFiles.push(...files);
            }
        },
        toggleDelivery({bool}) {
            this.isDeliver = bool;
            this.isNotify = !bool;
        },
        toggle(e, prop) {
            this[prop] = !this[prop];
        },
        toggleOptions(e, bool) {
            this.areOptions = bool;
            this.isDeliver = bool;
            this.isNotify = false;
        },
        createLinkAndDownolad(href) {
            let link = document.createElement('a');
            link.href = __WEBPACK__API_URL__ + href;
            link.target = "_blank";
            link.click();
        },
        async makeFileAction({index, key}) {
            const file = this.stepFiles[index];
            if(file.isFileApproved) return;
            if(key === 'download') {
                this.createLinkAndDownolad(file.path);
            }
            if(key === 'delete') {
                
            }
        },
        async uploadFile({file, index}) {
            const { path } = this.stepFiles[index];
            const fileData = new FormData();
            fileData.append("targetFile", file);
            fileData.append("path", path);
            try {
                await this.uploadTarget(fileData);
            } catch(err) {}
        },
        async approveFile({index}) {
            this.stepFiles[index].isFileApproved = !this.stepFiles[index].isFileApproved;
            const { taskId, jobId, isFileApproved } = this.stepFiles[index];
            try {
                await this.approveDeliveryFile({taskId, jobId, isFileApproved});
            } catch(err) { }
        },
        async saveChanges() {
            
        },
        async approve() {
            const taskIds = this.stepFiles.map(item => item.taskId)
                .filter((taskId, index, arr) => arr.indexOf(taskId) === index)
            try {
                if(!this.isNotify && !this.isDeliver) {
                    return await this.approveDeliverable(taskIds);
                }
                await this.approveWithOption({taskIds, isDeliver: this.isDeliver});    
            } catch(err) { 
            } finally {
                this.$emit("close");
            }
        }
    },
    computed: {
        ...mapGetters({
            project: "getCurrentProject"
        }),
        isAllChecked() {
            const unchecked = this.stepFiles.filter(item => !item.isFileApproved);
            return this.areFilesChecked && this.areFilesConverted && !unchecked.length;
        },
    },
    components: {
        Table,
        Check,
        Options,
        CheckBox,
        Button
    },
    mounted() {
        this.getStepsFiles();
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.review {
    display: flex;
    flex-direction: column;
    width: 80%;
    padding: 20px;
    box-sizing: border-box;
    box-shadow: 0 0 10px $brown-shadow;
    background-color: $white;
    position: relative;
    &__title {
        font-size: 22px;
        font-weight: 600;
        display: flex;
        justify-content: center;
    }
    &__top-icons {
        position: absolute;
        top: 0;
        right: 10px;
        display: flex;
        align-items: center;
    }
    &__save {
        margin-right: 10px;
        padding-bottom: 3px;
        cursor: pointer;
    }
    &__close {
        transform: rotate(45deg);
        cursor: pointer;
        font-size: 30px;
        font-weight: 600;
    }
    &__check {
        margin: 20px 0;
        padding-bottom: 10px;
        border-bottom: 1px solid $main-color;
    }
    &__check-item {
        &:first-child {
            margin-bottom: 10px;
        }
    }
    &__options {
        align-self: center;
        width: 330px;
        height: 28px;
        margin: 20px 0; 
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
    }
    &__options-check {
        position: absolute;
        left: 0;
    }
    &__button {
        align-self: center;
    }
}

</style>
