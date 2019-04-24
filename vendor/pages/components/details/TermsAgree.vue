<template lang="pug">
    .terms
        .terms__check
            CheckBox(:isChecked="job.isVendorRead" :isReadonly="isReadonly" @check="(e) => toggle(e, true)" @unCheck="(e) => toggle(e, false)")
        span.terms__text I have read the instructions and downloaded the reference files    
</template>

<script>
import CheckBox from "~/components/CheckBox";
import { mapActions } from "vuex";

export default {
    props: {
        job: {type: Object}
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
        isReadonly() {
            if(this.job.projectStatus !== "Started" && this.job.projectStatus !== "Approved" || this.job.status === "Completed") return true;
            if(this.job.name !== "translate1" && this.job.status !== "Started") {
                const prevStepProgress = this.job.prevStepProgress.wordsDone / this.job.prevStepProgress.wordsTotal * 100;
                return prevStepProgress < 100 || this.job.prevStepStatus !== "Completed";
            }
            if(this.job.status !== "Started") {
                return this.job.status !== "Accepted";
            }
            return this.job.status === "Started";
        }
    },
    components: {
        CheckBox
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.terms {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 10px;
    &__text {
        margin: 10px 0;
        font-size: 14px;
    }
    &__check {
        margin-right: 10px;
    }
}

</style>
