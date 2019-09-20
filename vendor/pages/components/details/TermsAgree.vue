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
            const statuses = ["Started", "Approved", "In progress"];
            if(statuses.indexOf(this.job.projectStatus) === -1 || this.job.status === "Completed") return true;
            if(this.job.prevStep && this.job.status !== "Started") {
                return this.job.prevStep.progress < 100 || this.job.prevStep.status !== "Completed";
            }
            if(this.job.status !== "Started") {
                return this.job.status !== "Accepted" && this.job.status !== "Ready to Start";
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
