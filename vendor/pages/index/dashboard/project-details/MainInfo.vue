<template lang="pug">
    .main-info
        .main-info__job-data
            .data-block
                .data-block__item
                    LabelValue(title="Project Name" :isColon="isColon" :value="job.projectName")  
                .data-block__item
                    LabelValue(title="Project ID" :isColon="isColon" :value="job.projectId")  
                .data-block__item
                    LabelValue(v-if="job.finance" title="Total Wordcount" :isColon="isColon" :value="job.finance.Wordcount.receivables")  
            .data-block
                .data-block__item
                    LabelValue(title="Status" :isColon="isColon" :value="job.status")  
                .data-block__item
                    LabelValue(v-if="job.finance" title="Total Cost" :isColon="isColon" :value="job.finance.Price.payables")
                        span.main-info__currency(v-if="job.finance && job.finance.Price.payables") &euro;
                .data-block__item
                    LabelValue(v-if="job.finance" title="Weighted Wordcount" :isColon="isColon" :value="job.finance.Wordcount.payables")
            .data-block
                .data-block__progress
                    Progress(:percent="progress")
        .main-info__instructions
            .main-info__textarea
                .main-info__title Instructions:
                p.main-info__text Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.
            .main-info__files
                .main-info__files-item
                    .main-info__title Reference:
                    img.main-info__download(src="../../../../assets/images/download.png" :class="{'main-info_opacity05': !job.refFiles || !job.refFiles.length}" @click="downloadRef")
                .main-info__files-item
                    .main-info__title Terminology:
                    img.main-info__download(src="../../../../assets/images/download.png" :class="{'main-info_opacity05': !job.terminology}" @click="downloadTerm")
        .main-info__terms
            .main-info__check
                CheckBox(:isChecked="job.isVendorRead" :isReadonly="isReadonly" @check="(e) => toggle(e, true)" @unCheck="(e) => toggle(e, false)")
            span.main-info__text I have read the instructions and downloaded the reference files
        .main-info__button(v-if="isButton" :class="{'main-info_opacity05': !job.isVendorRead}")
            Button(:value="buttonValue" :isDisabled="!job.isVendorRead" @makeAction="makeButtonAction")
            .main-info__select-popup(v-if="isXtmJobs" v-click-outside="closePopup")
                span.main-info__job-ids(v-for="(xtmJob, xtmJobIndex) in job.xtmJobIds" @click.stop="goToXtmEditor(xtmJobIndex)") {{ xtmJob.fileName }}
        .main-info__icons(v-if="job.status === 'Created'")
            .main-info__icon(v-for="(icon, key) in icons")
                img.main-info__image(:src="icon.icon" @click="makeAction(key)")
                span.main-info__tooltip {{ key }}
</template>

<script>
import LabelValue from "../../../components/jobs/LabelValue";
import Button from "~/components/buttons/Button";
import CheckBox from "~/components/CheckBox";
import Progress from "~/components/Progress";
import ClickOutside from "vue-click-outside";
import { mapGetters, mapActions } from "vuex";

export default {
    data() {
        return {
            isColon: true,
            domain: "",
            icons: {
                Approve: {icon: require("../../../../assets/images/Approve-icon.png"), active: true},
                Reject: {icon: require("../../../../assets/images/Reject-icon.png"), active: true}
            },
            isXtmJobs: false
        }
    },
    methods: {
        ...mapActions({
            setStepTermsAgreement: "setStepTermsAgreement",
            setJobStatus: "setJobStatus",
            selectJob: "selectJob",
            alertToggle: "alertToggle"
        }),
        async makeButtonAction() {
            if(!this.job.isVendorRead) return;
            try {
                switch (this.buttonValue) {
                    case "Start":
                        await this.setStatus("Started");
                        break
                    case "Go to Editor":
                        this.isXtmJobs = true;
                        break
                }
            } catch(err) {
                this.alertToggle({message: "Error in jobs action", isShow: true, type: "error"});
            }
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
        async toggle(e, bool) {
            try {
                await this.setStepTermsAgreement({jobId: this.job._id, value: bool});
            } catch(err) {

            }
        },
        downloadRef() {
            if(!this.job.refFiles || !this.job.refFiles.length) return;
            for(let file of this.job.refFiles) {
                let a = document.createElement("a");
                a.href = this.domain + file.split('./dist')[1];
                a.click(); 
            }    
        },
        downloadTerm() {
            if(!this.job.terminology) return;
            console.log('downloading...');
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
    },
    computed: {
        ...mapGetters({
            job: "getSelectedJob",
            allJobs: "getAllJobs"
        }),
        isButton() {
            const statuses = ['Accepted', 'Started'];
            return statuses.indexOf(this.job.status) !== -1;
        },
        isButtonDisabled() {
            return this.job.isVendorRead === 'Started' 
        },
        buttonValue() {
            if(+this.progress >= 100) return "Complete";
            return this.job.status === "Accepted" ? "Start" : "Go to Editor";
        },
        progress() {
            if(this.job.progress) {
                return +(this.job.progress.wordsDone / this.job.progress.wordsTotal * 100).toFixed(2);
            }
        },
        isReadonly() {
            return this.job.projectStatus !== "Started" ||
                this.job.status === "Started";
        }
    },
    components: {
        LabelValue,
        Button,
        CheckBox,
        Progress
    },
    directives: {
        ClickOutside
    },
    mounted() {
        this.domain = process.env.domain;
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
    &__job-data {
       border-bottom: 1px solid $light-brown;
       display: flex;
       flex-direction: column;
       flex-wrap: wrap;
       height: 125px;
       padding: 10px 0 10px 8px;
    }
    &__currency {
        margin-left: 5px;
    }
    &__instructions {
        margin-top: 20px;
        padding-right: 10px;
    }
    &__textarea {
        padding: 8px;
        box-sizing: border-box;
        border: 2px solid $light-brown;
        border-radius: 5px;
        max-height: 125px;
        overflow-y: overlay;
    }
    &__text {
        margin: 10px 0;
        font-size: 14px;
    }
    &__files {
        display: flex;
        margin: 15px 0;
        padding-left: 8px;
    }
    &__files-item {
        display: flex;
        align-items: center;
        width: 30%;
    }
    &__download {
        margin-left: 15px;
        padding-bottom: 3px;
        cursor: pointer;
    }
    &__terms {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 10px;
    }
    &__check {
        margin-right: 10px;
    }
    &__button, &__icons {
        display: flex;
        justify-content: center;
    }
    &__button {
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
        top: -40px;
    }
    &__job-ids {
        font-size: 16px;
        text-decoration: underline;
        margin: 0 5px;
        cursor: pointer;
        &:hover {
            font-weight: 600;
        }
    }
    &_opacity05 {
        opacity: 0.5;
        cursor: default;
    }
}

.data-block {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    position: relative;
    &__progress {
        position: absolute;
        left: -20px;
    }
}

</style>
