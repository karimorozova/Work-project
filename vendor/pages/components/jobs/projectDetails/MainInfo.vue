<template lang="pug">
    .main-info
        .main-info__job-data
            .main-info__job-item
                LabelValue(title="Project Name" :isColon="isColon" :value="job.projectName")  
            .main-info__job-item
                LabelValue(title="Project ID" :isColon="isColon" :value="job.projectId")  
            .main-info__job-item
                LabelValue(v-if="job.finance" title="Total Wordcount" :isColon="isColon" :value="job.finance.Wordcount.receivables")  
            .main-info__job-item
                LabelValue(title="Status" :isColon="isColon" :value="job.status")  
            .main-info__job-item
                LabelValue(v-if="job.finance" title="Total Cost" :isColon="isColon" :value="job.finance.Price.payables")
                    span.main-info__currency(v-if="job.finance && job.finance.Price.payables") &euro;
            .main-info__job-item
                LabelValue(v-if="job.finance" title="Weighted Wordcount" :isColon="isColon" :value="job.finance.Wordcount.payables")
        .main-info__instructions
            .main-info__textarea
                .main-info__title Instructions:
                p.main-info__text Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.
            .main-info__files
                .main-info__files-item
                    .main-info__title Reference:
                    img.main-info__download(src="../../../../assets/images/download.png")
                .main-info__files-item
                    .main-info__title Terminology:
                    img.main-info__download(src="../../../../assets/images/download.png")
        .main-info__terms
            .main-info__check
                CheckBox(:isChecked="job.isVendorRead" @check="(e) => toggle(e, true)" @unCheck="(e) => toggle(e, false)")
            span.main-info__text I have read the instructions and downloaded the reference files
        .main-info__button
            Button(:value="buttonValue")    
</template>

<script>
import LabelValue from "../LabelValue";
import Button from "~/components/buttons/Button";
import CheckBox from "~/components/CheckBox";
import { mapGetters, mapActions } from "vuex";

export default {
    data() {
        return {
            isColon: true
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
        }
    },
    computed: {
        ...mapGetters({
            job: "getSelectedJob"
        }),
        buttonValue() {
            return "Start"
        }
    },
    components: {
        LabelValue,
        Button,
        CheckBox
    }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors.scss";

.main-info {
    border-right: 1px solid $light-brown;
    display: flex;
    flex-direction: column;
    padding: 20px 0 20px 20px;
    box-sizing: border-box;
    &__job-data {
       border-bottom: 1px solid $light-brown;
       display: flex;
       flex-direction: column;
       flex-wrap: wrap;
       max-height: 130px;
       padding-left: 8px;
    }
    &__job-item {
        margin-bottom: 25px;
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
}

</style>
