<template lang="pug">
    .review
        span.review__close(@click="close") +
        .review__title Delivery Review {{ dr }}
        Drops(:project="project" :user="user" :dr1Manager="dr1Manager" :dr2Manager="dr2Manager" :timestamp="timestamp")
        .review__title.review_left-align PM Checklist
        .review__check 
            .review__check-item(v-for="instruction in instructions")
                Check(@toggleApprovement="(e) => toggle(e, instruction)" 
                    :isApproved="instruction.isChecked"
                    :text="instruction.text")
        .review__table
            Table(
                :files="files"
                @approveFile="approveFile"
                @approveFiles="approveFiles"
                @uploadFile="uploadFile"
                @checkAll="checkAllFiles"
                @checkFile="checkFile"
                @updateDeliveryData="getDeliveryData")
        .review__options
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
        task: {type: Object}
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
            dr1Manager: null,
            dr2Manager: null,
            timestamp: "",
            instructions: []
        }
    },
    methods: {
        ...mapActions([
            "approveInstruction",
            "approveDeliveryFile",
            "uploadTarget",
            "approveWithOption",
            "approveDeliverable",
            "assignDr2",
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
        async toggle(e, instruction) {
            await this.approveInstruction({
                projectId: this.project._id,
                taskId: this.task.taskId, 
                instruction
                });
            await this.getDeliveryData();
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
            const { path, isOriginal } = index !== undefined ? this.files[index] : {path: "", isOriginal: false};
            const fileData = new FormData();
            fileData.append("targetFile", file);
            fileData.append("projectId", this.project._id);
            fileData.append("path", path);
            fileData.append("taskId", this.task.taskId);
            fileData.append("isOriginal", isOriginal);
            try {
                await this.uploadTarget(fileData);
                await this.getDeliveryData();
            } catch(err) { }
        },
        async approveFile({index}) {
            this.files[index].isFileApproved = !this.files[index].isFileApproved;
            const { taskId, isFileApproved, path } = this.files[index];
            try {
                await this.approveDeliveryFile({taskId, isFileApproved, paths: [path]});
                await this.getDeliveryData();
            } catch(err) { }
        },
        async approveFiles({checked}) {
            const paths = checked.map(item => item.path);
            await this.approveDeliveryFile({taskId: this.task.taskId, isFileApproved: true, paths});
            await this.getDeliveryData();
        },
        async saveChanges() {
            
        },
        async approve() {
            const taskIds = this.files.map(item => item.taskId)
                .filter((taskId, index, arr) => arr.indexOf(taskId) === index)
            try {
                if(this.isDr1 && this.isAssign) {
                    return await this.assignDr2({projectId: this.project._id, manager: this.assignedManager, taskIds})
                }
                // if(!this.isNotify && !this.isDeliver) {
                //     return await this.approveDeliverable(taskIds);
                // }
                // await this.approveWithOption({taskIds, isDeliver: this.isDeliver});    
            } catch(err) { 
            } finally {
                this.$emit("close");
            }
        },
        assignManager({manager, prop}) {
            this[prop] = manager;
        },
        async getDeliveryData() {
            if(this.task.status === "Pending Approval [DR2]") {
                this.isDr1 = false;
                this.isDeliver = true;
            }
            try {
                const result = await this.$http.post("/pm-manage/delivery-data", {projectId: this.project._id, taskId: this.task.taskId});
                if(result.data.files.length) {
                    this.files = result.data.files.map(item => { return {...item, taskId: this.task.taskId, pair: result.data.pair, isChecked: false} });
                }
                this.dr1Manager = result.data.dr1Manager;
                this.dr2Manager = result.data.dr2Manager;
                this.instructions = result.data.instructions.filter(item => {
                    return result.data.status === "[DR2]" ? item.step === 'dr2' : item.step === 'dr1';
                })
                this.timestamp = this.task.status === "Pending Approval [DR2]" ? result.data.timestamp : "";
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
            const uncheckedFiles = this.files.filter(item => !item.isFileApproved);
            const uncheckedInstructions = this.instructions.filter(item => !item.isChecked);
            return !uncheckedInstructions.length && !uncheckedFiles.length;
        },
        dr() {
            return this.task.status === "Pending Approval [DR1]" ? 1 : 2;
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
    &__close {
        position: absolute;
        top: 0;
        right: 10px;
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
