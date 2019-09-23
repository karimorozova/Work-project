<template lang="pug">
    .files-buttons
        Files
        .files-buttons__terms(v-if="isActiveStatus")
            TermsAgree(:job="job")
        .files-buttons__buttons(v-if="isButton && job.status !== 'Completed'" :class="{'files-buttons_opacity05': !job.isVendorRead}")
            .files-buttons__button(v-if="isStartButton")
                Button(value="Start" :isDisabled="!job.isVendorRead" @makeAction="startJob")
            .files-buttons__button(v-if="progress >= 100" )
                Button(value="Complete" @makeAction="showModal")
        .files-buttons__icons(v-if="areIcons && isActiveStatus")
            .files-buttons__icon(v-for="(icon, key) in icons")
                img.files-buttons__image(:src="icon.icon" @click="makeAction(key)")
                span.files-buttons__tooltip {{ key }}
</template>

<script>
import Files from "./Files";
const TermsAgree = () => import("./TermsAgree");
const Button = () => import("~/components/buttons/Button");
import { mapGetters, mapActions } from "vuex";

export default {
    data() {
        return {
            icons: {
                Approve: {icon: require("../../../assets/images/Approve-icon.png"), active: true},
                Reject: {icon: require("../../../assets/images/Reject-icon.png"), active: true}
            },
        }
    },
    methods: {
        ...mapActions([
            "setJobStatus",
            "selectJob",
            "alertToggle"
        ]),
        async startJob() {
            if(!this.job.isVendorRead) return;
            try {
                await this.setStatus("Started");
            } catch(err) { }
        },
        async makeAction(key) {
            const status = key === "Approve" ? "Accepted" : "Rejected";
            try {
                await this.setStatus(status);
            } catch(err) { }
        },
        async setStatus(status) {
            try {
                await this.setJobStatus({jobId: this.job._id, status});
                const currentJob = this.allJobs.find(item => item._id === this.job._id);
                this.selectJob(currentJob);
            } catch(err) {
                this.alertToggle({message: "Error in jobs action", isShow: true, type: "error"});
            }
        },
        showModal() {
            this.$emit("showModal");
        }
    },
    computed: {
        ...mapGetters({
            job: "getSelectedJob",
            allJobs: "getAllJobs"
        }),
        isActiveStatus() {
            const statuses = ['Cancelled', 'Cancelled Halfway', 'Completed'];
            return statuses.indexOf(this.job.status) === -1;
        },
        isStartButton() {
            return this.job.status === "Accepted" || this.job.status === "Ready to Start" || this.job.status === "Waiting to Start";
        },
        progress() {
            if(this.job.progress) {
                return +(this.job.progress.wordsDone / this.job.progress.wordsTotal * 100).toFixed(2);
            }
        },
        isButton() {
            const statuses = ['Accepted', 'Ready to Start', 'Waiting to Start'];
            return statuses.indexOf(this.job.status) !== -1 || this.progress >= 100;
        },
        areIcons() {
            const statuses = ["Created", "Request Sent"];
            return statuses.indexOf(this.job.status) !== -1;
        },
    },
    components: {
        Files,
        TermsAgree,
        Button
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.files-buttons {
    padding-bottom: 20px;
    display: flex;
    flex-direction: column;
    &__terms {
        margin-top: 10px;
    }
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
        width: 10%;
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
    &_opacity05 {
        opacity: 0.5;
        cursor: default;
    }
}

</style>
