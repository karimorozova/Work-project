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
                CheckBox(:isChecked="job.isVendorRead" :isReadonly="job.isVendorRead" @check="(e) => toggle(e, true)" @unCheck="(e) => toggle(e, false)")
            span.main-info__text I have read the instructions and downloaded the reference files
        .main-info__button
            Button(:value="buttonValue")    
</template>

<script>
import LabelValue from "../LabelValue";
import Button from "~/components/buttons/Button";
import CheckBox from "~/components/CheckBox";
import Progress from "~/components/Progress";
import { mapGetters, mapActions } from "vuex";

export default {
    data() {
        return {
            isColon: true,
            domain: ""
        }
    },
    methods: {
        ...mapActions({
            setStepTermsAgreement: "setStepTermsAgreement" 
        }),
        async toggle(e, bool) {
            try {
                await this.setStepTermsAgreement({jobId: this.job._id, value: bool});
            } catch(err) {

            }
        },
        downloadRef() {
            if(!job.refFiles.length) return;
            for(let file of this.job.refFiles) {
                let a = document.createElement("a");
                a.href = this.domain + file.split('./dist')[1];
                a.click(); 
            }    
        },
        downloadTerm() {
            if(!job.terminology) return;
            console.log('downloading...');
        }
    },
    computed: {
        ...mapGetters({
            job: "getSelectedJob"
        }),
        buttonValue() {
            return "Start"
        },
        progress() {
            return this.job.progress.wordsDone / this.job.progress.wordsTotal;            
        }
    },
    components: {
        LabelValue,
        Button,
        CheckBox,
        Progress
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
    &__button {
        display: flex;
        justify-content: center;
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
