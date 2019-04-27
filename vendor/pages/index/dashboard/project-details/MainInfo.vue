<template lang="pug">
    .main-info
        JobData(:job="job")
        Instructions(:job="job")
        TermsAgree(:job="job")
        .main-info__buttons(v-if="isButton" :class="{'main-info_opacity05': !job.isVendorRead}")
            .main-info__button
                Button(:value="buttonValue" :isDisabled="!job.isVendorRead" @makeAction="makeButtonAction")
                .main-info__select-popup(v-if="isXtmJobs" v-click-outside="closePopup")
                    span.main-info__job-ids(
                        v-for="(xtmJob, xtmJobIndex) in job.xtmJobIds" 
                        @click.stop="goToXtmEditor(xtmJobIndex)") {{ getFileName(xtmJobIndex) }}
                        span.main-info__full-name(v-if="xtmJob.fileName.length > 15") {{ xtmJob.fileName }}
            .main-info__button(v-if="progress >= 100" )
                Button(value="Complete" @makeAction="showModal")
        .main-info__icons(v-if="areIcons")
            .main-info__icon(v-for="(icon, key) in icons")
                img.main-info__image(:src="icon.icon" @click="makeAction(key)")
                span.main-info__tooltip {{ key }}
        .main-info__modal(v-if="isApproveModal")
            ApproveModal(
                :isCentered="isApproveModal"
                @close="closeModal"
                @notApprove="closeModal"
                @approve="completeJob" 
                text="Are you sure you have completed your job and reviewed your work?"
                approveValue="Complete" 
                notApproveValue="Cancel")
        Forbidden(v-if="isForbidden")
</template>

<script>
import JobData from "../../../components/details/JobData";
import Instructions from "../../../components/details/Instructions";
import TermsAgree from "../../../components/details/TermsAgree";
import Forbidden from "../../../components/details/Forbidden";
import Button from "~/components/buttons/Button";
import ApproveModal from "~/components/ApproveModal";
import ClickOutside from "vue-click-outside";
import { mapGetters, mapActions } from "vuex";

export default {
    data() {
        return {
            isColon: true,
            icons: {
                Approve: {icon: require("../../../../assets/images/Approve-icon.png"), active: true},
                Reject: {icon: require("../../../../assets/images/Reject-icon.png"), active: true}
            },
            isXtmJobs: false,
            isApproveModal: false
        }
    },
    methods: {
        ...mapActions({
            setJobStatus: "setJobStatus",
            selectJob: "selectJob",
            alertToggle: "alertToggle"
        }),
        getFileName(xtmJobIndex) {
            const fileName = this.job.xtmJobIds[xtmJobIndex].fileName;
            return fileName.length < 20 ? fileName : `${fileName.slice(0, 15)}...`;
        },
        async makeButtonAction() {
            if(!this.job.isVendorRead) return;
            try {
                switch (this.buttonValue) {
                    case "Start":
                        await this.setStatus("Started");
                        break
                    case "Enter Editor":
                        await this.enterEditor();
                        break
                }
            } catch(err) {
                this.alertToggle({message: "Error in jobs action", isShow: true, type: "error"});
            }
        },
        async enterEditor() {
            if(this.job.xtmJobIds.length > 1) {
                return this.isXtmJobs = true;
            }
            await this.goToXtmEditor(0);
        },
        async makeAction(key) {
            const status = key === "Approve" ? "Accepted" : "Rejected";
            try {
                await this.setStatus(status);
            } catch(err) {

            }
        },
        async setStatus(status) {
            try {
                await this.setJobStatus({jobId: this.job._id, status});
                const currentJob = this.allJobs.find(item => item._id === this.job._id);
                await this.selectJob(currentJob);
            } catch(err) {
                this.alertToggle({message: "Error in jobs action", isShow: true, type: "error"});
            }
        },
        closePopup() {
            this.isXtmJobs = false;
        },
        async goToXtmEditor(xtmJobIndex) {
            const { jobId } = this.job.xtmJobIds[xtmJobIndex];
            try {
                const url = await this.$axios.get(`/xtm/editor?jobId=${jobId}&stepName=${this.job.name}`);
                let link = document.createElement("a");
                link.target = "_blank";
                link.href = url.data;
                link.click();
                this.currentActive = -1;
                this.closePopup();
            } catch(err) {
                this.alertToggle({message: err.response.data, isShow: true, type: "error"});
            }
        },
        closeModal() {
            this.isApproveModal = false;            
        },
        showModal() {
            this.isApproveModal = true;
        },
        async completeJob() {
            try {
                await this.setStatus("Completed");
                this.closeModal();
            } catch(err) {
                this.alertToggle({message: "Error in jobs action", isShow: true, type: "error"});
            }
        }
    },
    computed: {
        ...mapGetters({
            job: "getSelectedJob",
            allJobs: "getAllJobs"
        }),
        areIcons() {
            const statuses = ["Created", "Request Sent"];
            return statuses.indexOf(this.job.status) !== -1;
        },
        isButton() {
            const statuses = ['Accepted', 'Started', 'Ready to Start', 'Waiting to Start'];
            return statuses.indexOf(this.job.status) !== -1;
        },
        buttonValue() {
            return this.job.status !== "Started" ? "Start" : "Enter Editor";
        },
        progress() {
            if(this.job.progress) {
                return +(this.job.progress.wordsDone / this.job.progress.wordsTotal * 100).toFixed(2);
            }
        },
        isForbidden() {
            if((this.job.status === "Accepted" || this.job.status === "Waiting to Start") && this.job.name !== "translate1") {
                const prevStepProgress = this.job.prevStepProgress.wordsDone / this.job.prevStepProgress.wordsTotal * 100;
                return prevStepProgress < 100 || this.job.prevStepStatus !== "Completed";
            }
            return false;
        }
    },
    components: {
        JobData,
        Instructions,
        TermsAgree,
        Forbidden,
        Button,
        ApproveModal
    },
    directives: {
        ClickOutside
    }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors.scss";

.main-info {
    border-right: 1px solid $light-brown;
    display: flex;
    flex-direction: column;
    padding: 0 0 20px 20px;
    box-sizing: border-box;
    position: relative;
    &__buttons, &__icons {
        display: flex;
        justify-content: center;
    }
    &__button {
        width: 30%;
        display: flex;
        justify-content: center;
        position: relative;
    }
    &__icons {
        width: 15%;
        align-self: center;
        justify-content: space-between;
    }
    &__icon {
        position: relative;
    }
    &__tooltip {
        position: absolute;
        bottom: -15px;
        left: -8px;
        font-size: 14px;
    }
    &__image {
        cursor: pointer;
        transition: transform 0.1s ease-out;
        &:hover {
            transform: scale(1.1);
        }
    }
    &__select-popup {
        position: absolute;
        z-index: 10;
        background-color: $white;
        display: flex;
        padding: 8px;
        box-shadow: 0 0 10px $main-color;
        box-sizing: border-box;
        border-radius: 5px;
        justify-content: center;
        bottom: 40px;
    }
    &__job-ids {
        font-size: 16px;
        text-decoration: underline;
        margin: 0 5px;
        cursor: pointer;
        max-width: 150px;
        position: relative;
        &:hover {
            font-weight: 600;
            .main-info__full-name {
                display: block;
                z-index: 2;
                top: 0;
                left: 0;
            }
        }
    }
    &__full-name {
        position: absolute;
        background-color: $white;
        padding: 2px;
        display: none;
    }
    &_break {
        word-break: break-word;
    }
    &_opacity05 {
        opacity: 0.5;
        cursor: default;
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
