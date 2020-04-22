<template lang="pug">
    .review
        span.review__close(@click="close") +
        .review__title Delivery Review {{ dr }}
        Drops(
            :isReviewing="isReviewing"
            :project="project" 
            :user="user" 
            :dr1Manager="dr1Manager" 
            :dr2Manager="dr2Manager" 
            :timestamp="timestamp"
            @assignManager="assignManager"
            @setContacts="setContacts")
        .review__title.review_left-align {{ checklistTile }} Checklist
        .review__check 
            .review__check-item(v-for="instruction in instructions")
                Check(@toggleApprovement="(e) => toggle(e, instruction)" 
                    :isApproved="instruction.isChecked"
                    :text="instruction.text")
            .review__forbidden(v-if="isReviewing")        
        .review__table
            Table(
                :isReviewing="isReviewing"
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
            .review__forbidden(v-if="isReviewing")            
            Options(v-if="areOptions"
                :isAssign="isAssign"
                :isDeliver="isDeliver"
                :isNotify="isNotify"
                :isDr1="isDr1"
                @toggleOption="toggleOption"
            )
        .review__buttons
            .review__forbidden(v-if="isReviewing")
            .review__button(v-if="!isDr1")
                Button(
                    value="Rollback"
                    @clicked="popupRollback"
                )
            .review__button(v-if="isAllChecked")
                Button(
                    value="Approve Deliverable"
                    @clicked="approve"
                )
        .review__modal(v-if="isModal")
            RollbackModal(:manager="rollbackManager" @close="closeRollback" @setRollbackManager="setRollbackManager" @rollBack="rollBack")
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import Drops from "../review/Drops";
import Table from "../review/Table";
import Check from "../review/Check";
const Options = () => import("../review/Options");
const CheckBox = () => import("@/components/CheckBox");
const Button = () => import("@/components/Button");
const RollbackModal = () => import("../review/RollbackModal");

export default {
    props: {
        task: {type: Object},
        user: {type: Object},
        project: {type: Object}
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
            contacts: [],
            timestamp: "",
            instructions: [],
            isReviewing: false,
            isModal: false,
            rollbackManager: null
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
            "changeReviewManager",
            "rollBackReview",
            "alertToggle"
        ]),
        close() {
            this.$emit("close")
        },
        closeRollback() {
            this.isModal = false;
            this.rollbackManager = JSON.parse(JSON.stringify(this.dr1Manager));
        },
        setContacts({contacts}) {
            this.contacts = [...contacts];
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
        setRollbackManager({manager}) {
            this.rollbackManager = manager;
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
            this.isDeliver = this.isDr1 ? false : bool;
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
        popupRollback() {
            this.isModal = true;
        },
        async uploadFile({file, index}) {
            await this.checkPermission();
            if(this.isReviewing) return;
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
            await this.checkPermission();
            if(this.isReviewing) return;
            this.files[index].isFileApproved = !this.files[index].isFileApproved;
            const { taskId, isFileApproved, path } = this.files[index];
            try {
                await this.approveDeliveryFile({taskId, isFileApproved, paths: [path]});
                await this.getDeliveryData();
            } catch(err) { }
        },
        async approveFiles({checked}) {
            await this.checkPermission();
            if(this.isReviewing) return;
            const paths = checked.map(item => item.path);
            await this.approveDeliveryFile({taskId: this.task.taskId, isFileApproved: true, paths});
            await this.getDeliveryData();
        },
        async checkPermission() {
            if(!this.isReviewing) {
                try {
                    const reviewStatus = await this.$http.get(
                        `/pm-manage/review-status?group=${this.user.group.name}&projectId=${this.project._id}&taskId=${this.task.taskId}&userId=${this.user._id}`
                        );
                    if(reviewStatus.data === "forbidden") {
                        this.isReviewing = true;
                        return this.alertToggle({message: "This task Deliery Review is forbidden for you", isShow: true, type: "error"});
                    }
                } catch(err) {
                    this.alertToggle({message: "Error on checking review status", isShow: true, type: "error"});
                }
            }
        },
        async approve() {
            try {
                if(this.isDr1 && this.isAssign) {
                    await this.assignDr2({
                        projectId: this.project._id, taskId: this.task.taskId, dr2Manager: this.dr2Manager
                        });
                    return await this.getDeliveryData();
                }
                if(!this.isNotify && !this.isDeliver) {
                    return await this.approveDeliverable(this.task.taskId);
                }
                await this.approveWithOption({
                    taskId: this.task.taskId, isDeliver: this.isDeliver, contacts: this.contacts
                    });    
            } catch(err) { 
            } finally {
                this.$emit("close");
            }
        },
        async assignManager({manager, prop}) {
            await this.checkPermission();
            if(this.isReviewing || this.dr1Manager._id === manager._id) return;
            await this.changeReviewManager({
                prevManager: this[prop],
                manager, 
                prop, 
                projectId: this.project._id, 
                taskId: this.task.taskId,
                isAdmin: this.isAdmin,
                status: `dr${this.dr}`
                });
            await this.getDeliveryData();
        },
        async rollBack() {
            await this.rollBackReview({
                projectId: this.project._id, 
                taskId: this.task.taskId,
                manager: this.rollbackManager
                })
            this.close();
        },
        async getDeliveryData() {
            if(this.task.status === "Pending Approval [DR2]") {
                this.isDr1 = false;
            }
            this.isDeliver = this.isDr1 ? false : this.areOptions;
            try {
                const result = await this.$http.post("/pm-manage/delivery-data", {projectId: this.project._id, taskId: this.task.taskId});
                if(result.data.files.length) {
                    this.files = result.data.files.map(item => { return {...item, taskId: this.task.taskId, pair: result.data.pair, isChecked: false} });
                }
                this.dr1Manager = result.data.dr1Manager;
                this.dr2Manager = result.data.dr2Manager;
                this.instructions = result.data.instructions.filter(item => item.step === result.data.status);
                if(this.task.status === "Pending Approval [DR2]") {
                    this.rollbackManager = JSON.parse(JSON.stringify(this.dr1Manager));
                    this.timestamp = result.data.timestamp;
                }                
            } catch(err) {
                this.alertToggle({message: "Error on getting delivery data", isShow: true, type: "error"});
            }
        }
    },
    computed: {
        isAllChecked() {
            const uncheckedFiles = this.files.filter(item => !item.isFileApproved);
            const uncheckedInstructions = this.instructions.filter(item => !item.isChecked);
            return !uncheckedInstructions.length && !uncheckedFiles.length;
        },
        dr() {
            return this.task.status === "Pending Approval [DR1]" ? 1 : 2;
        },
        checklistTile() {
            return this.task.status === "Pending Approval [DR1]" ? "DR1" : "DR2";
        },
        isAdmin() {
            return this.user.group.name === "Administrators" || this.user.group.name === "Developers";
        }
    },
    components: {
        Drops,
        Table,
        Check,
        Options,
        CheckBox,
        Button,
        RollbackModal
    },
    mounted() {
        this.checkPermission()
            .then(res => this.getDeliveryData());
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
        position: relative;
    }
    &__check-item {
        margin-bottom: 5px;
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
    &__buttons {
        display: flex;
        justify-content: center;
        position: relative;
    }
    &__button {
        margin: 0 10px;
    }
    &_left-align {
        text-align: left;
        font-size: 20px; 
    }
    &__modal {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    &__forbidden {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
    }
}

</style>
