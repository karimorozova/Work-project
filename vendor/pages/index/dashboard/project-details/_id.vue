<template lang="pug">
    .details
        .details__data(v-if="job._id")
            .details__header
                .details__title Project Details
            .details__info
                .details__main
                    MainInfo
                .details__describe
                    OtherInfo
            .details__files
                FilesAndButtons(:deliverables="targetFiles" @showModal="showModal" @setDeliverables="setDeliverables")
            .details__modal(v-if="isApproveModal")
                 ApproveModal(
                    :isCentered="isApproveModal"
                    @close="closeModal"
                    @notApprove="closeModal"
                    @approve="completeJob" 
                    text="Are you sure you have completed your job and reviewed your work?"
                    approveValue="Complete" 
                    notApproveValue="Cancel")
            Forbidden(v-if="isForbidden" :message="forbiddenMessage")
</template>

<script>
import MainInfo from "./MainInfo";
import OtherInfo from "./OtherInfo";
import FilesAndButtons from "./FilesAndButtons";
const Forbidden = () => import("../../../components/details/Forbidden");
const ApproveModal = () => import("~/components/ApproveModal");
import { mapGetters, mapActions } from "vuex";

export default {
    data() {
        return {
            isApproveModal: false,
            statuses: ["Quote sent", "Draft", "Requested"],
            targetFiles: []
        }
    },
    methods: {
        ...mapActions([
            "getJobs",
            "selectJob",
            "alertToggle",
            "setJobStatus"
        ]),
        closeModal() {
            this.isApproveModal = false;            
        },
        showModal() {
            this.isApproveModal = true;
        },
        setCurrentJob() {
            const currentJob = this.allJobs.find(item => item._id === this.job._id);
            this.selectJob(currentJob);
        },
        setDeliverables({files}) {
            this.targetFiles = files;
        },
        async completeJob() {
            this.closeModal();
            try {
                await this.setJobStatus({jobId: this.job._id, status: "Completed", targetFile: this.targetFiles[0]});
                this.setCurrentJob();
                this.targetFiles = [];
            } catch(err) { }
        },
        async refreshProgress() {
            try {
                if(!this.job._id) {
                    await this.getJobInfo();
                }
                if(this.job.status !== "Started") return;
                const isCatTool = this.job.serviceStep.calculationUnit === 'Words';
                await this.$axios.post('/pm-manage/update-progress', {projectId: this.job.project_Id, isCatTool});
                await this.getJobs();
                this.setCurrentJob();
                this.alertToggle({message: "Progress updated", isShow: true, type: "success"});
            } catch(err) {
                this.alertToggle({message: err.response.data, isShow: true, type: "error"});

            }
        },
        async getJobInfo() {
            const { id } = this.$route.params;
            try {
                if(!this.allJobs.length) {
                    await this.getJobs();
                }
                const currentJob = this.allJobs.find(item => item._id === id);
                await this.selectJob(currentJob);
            } catch(err) {

            }
        }
    },
    computed: {
        ...mapGetters({
            job: "getSelectedJob",
            allJobs: "getAllJobs"
        }),
        buttonValue() {
            return "Start"
        },
        isForbidden() {
            if((this.job.status === "Accepted" || this.job.status === "Waiting to Start") && this.job.prevStep) {
                return this.job.prevStep.progress < 100 || this.job.prevStep.status !== "Completed";
            }
            if(!this.job.prevStep && this.statuses.indexOf(this.job.projectStatus) !== -1) {
                return true;
            } 
            return false;
        },
        forbiddenMessage() {
            let message = "Project hasn't been approved yet.";
            if(this.statuses.indexOf(this.job.projectStatus) === -1) {
                message = "Sorry, you can't start the job until previous job is completed!";
            }
            return message;
        }
    },
    components: {
        MainInfo,
        OtherInfo,
        FilesAndButtons,
        ApproveModal,
        Forbidden
    },
    mounted() {
        this.refreshProgress();
    }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors.scss";

.details {
    color: $main-color;
    width: 100%;
    padding: 30px;
    &__data {
        width: 920px;
        margin-top: 10px;
        box-shadow: 0 0 15px $brown-shadow;
        box-sizing: border-box;
        position: relative;
    }
    &__header {
        padding: 10px 20px 10px 28px;
        border-bottom: 1px solid $light-brown;
    }
    &__title {
        font-size: 19px;
    }
    &__info {
        display: flex;
    }
    &__main {
        width: 70%;
    }
    &__describe {
        width: 30%;
        background-color: #F6F1EF;
    }
    &__modal {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}

</style>
