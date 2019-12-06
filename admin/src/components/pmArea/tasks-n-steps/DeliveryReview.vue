<template lang="pug">
    .review
        .review__top-icons
            img.review__save(src="../../../assets/images/Other/save-icon-qa-form.png" @click="saveChanges")
            span.review__close(@click="close") +
        .review__title Delivery Review {{ dr }}
        Drops(:project="project" :user="user" :assignedManager="assignedManager" @assignManager="assignManager")
        .review__title.review_left-align PM Checklist
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
            Table(
                :tableData="files" 
                @approveFile="approveFile" 
                @uploadFile="uploadFile"
                @checkAll="checkAllFiles"
                @checkFile="checkFile")
        .review__options(v-if="isAllChecked")
            .review__options-check
                CheckBox(:isChecked="areOptions" 
                    customClass="review-options"
                    @check="(e) => toggleOptions(e, true)" 
                    @uncheck="(e) => toggleOptions(e, false)")
            Options(v-if="areOptions"
                :isAssign="isAssign"
                :isDeliver="isDeliver"
                :isNotify="isNotify"
                :isDr1="isDr1"
                @toggleOption="toggleOption"
            )
        .review__button
            Button(v-if="isAllChecked"
                value="Approve Deliverable"
                @clicked="approve"
            )
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import Drops from "../review/Drops";
import Table from "../review/Table";
import Check from "../review/Check";
const Options = () => import("../review/Options");
const CheckBox = () => import("@/components/CheckBox");
const Button = () => import("@/components/Button");

export default {
    props: {
        tasks: {type: Array}
    },
    data() {
        return {
            areFilesChecked: false,
            areFilesConverted: false,
            areOptions: true,
            isDeliver: false,
            isNotify: false,
            isDr1: true,
            isAssign: true,
            files: [],
            assignedManager: null
        }
    },
    methods: {
        ...mapActions([
            "approveDeliveryFile",
            "uploadTarget",
            "approveWithOption",
            "approveDeliverable",
            "alertToggle"
        ]),
        close() {
            this.$emit("close")
        },
        toggleOption({prop}) {
            this[prop] = true;
            if(prop === 'isAssign') {
                this.isDeliver = false;
                this.isNotify = false;
            } else if(prop === 'isDeliver') {
                this.isAssign = false;
                this.isNotify = false;
            } else {
                this.isAssign = false;
                this.isDeliver = false;
            }
        },
        toggle(e, prop) {
            this[prop] = !this[prop];
        },
        toggleOptions(e, bool) {
            this.areOptions = bool;
            this.isAssign = this.isDr1;
            this.isDeliver = !this.isAssign;
            this.isNotify = false;
        },
        checkAllFiles({bool}) {
            this.files = this.files.map(item => {
                return {...item, isChecked: bool}
            })
        },
        checkFile({index, bool}) {
            this.files[index].isChecked = bool;
        },
        async uploadFile({file, index}) {
            const { path, taskId } = this.files[index];
            const fileData = new FormData();
            fileData.append("targetFile", file);
            fileData.append("path", path);
            fileData.append("taskId", taskId);
            try {
                await this.uploadTarget(fileData);
                this.refreshTasks();
            } catch(err) { }
        },
        refreshTasks() {
            const tasksIds = this.tasks.map(item => item.taskId);
            this.$emit('updateTasks', {tasksIds});
        },
        async approveFile({index}) {
            this.files[index].isFileApproved = !this.files[index].isFileApproved;
            // const { taskId, jobId, isFileApproved, path } = this.stepFiles[index];
            // try {
            //     await this.approveDeliveryFile({taskId, jobId, isFileApproved: !isFileApproved, path});
            //     this.refreshTasks();
            // } catch(err) { }
        },
        async saveChanges() {
            
        },
        async approve() {
            const taskIds = this.files.map(item => item.taskId)
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
        },
        assignManager({manager}) {
            this.assignedManager = manager;
        },
        async getDeliveryData() {
            const tasksIds = this.tasks.map(item => item.taskId);
            if(this.tasks[0].status === "Pending Approval [DR2]") {
                this.assignedManager = this.user;
                this.isDr1 = false;
                this.isDeliver = true;
            }
            try {
                const result = await this.$http.post("/pm-manage/delivery-data", {projectId: this.project._id, tasksIds, manager: this.assignedManager});
                this.files = result.data.reduce((acc, cur) => {
                    const taskFiles = cur.files.map(item => { return {...item, taskId: cur.taskId, pair: cur.pair, isChecked: false} });
                    return [...acc, ...taskFiles];
                }, []);
                this.assignedManager = this.assignedManager || this.project.accountManager;
            } catch(err) {
                this.alertToggle({message: "Error on getting delivery data", isShow: true, type: "error"});
            }
        }
    },
    computed: {
        ...mapGetters({
            project: "getCurrentProject",
            user: "getUser"
        }),
        isAllChecked() {
            const unchecked = this.files.filter(item => !item.isFileApproved);
            return this.areFilesChecked && this.areFilesConverted && !unchecked.length;
        },
        dr() {
            return this.tasks[0].status === "Pending Approval [DR1]" ? 1 : 2;
        }
    },
    components: {
        Drops,
        Table,
        Check,
        Options,
        CheckBox,
        Button
    },
    mounted() {
        this.getDeliveryData();
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
        text-align: center;
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
        margin: 10px 0;
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
        width: 430px;
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
    &_left-align {
        text-align: left;
        font-size: 20px; 
    }
}

</style>
