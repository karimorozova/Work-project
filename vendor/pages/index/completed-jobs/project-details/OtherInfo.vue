<template lang="pug">
    .other-info
        .other-info__header
            .other-info__photo
                img.other-info__image(v-if="job.manager && job.manager.photo" :src="domain+job.manager.photo")
                img.other-info__image.other-info_no-photo(v-else src="../../../../assets/images/man.png")
            .other__info__item
                LabelValue(title="Project Manager" :value="fullManagerName" customClass="pair_column-flex")
        .other-info__item
            LabelValue(title="Job Type" :value="jobType" customClass="pair_column-flex")
        .other-info__item
            LabelValue(v-if="job.industry" title="Industry" :value="job.industry.name" customClass="pair_column-flex")
        .other-info__item
            LabelValue(title="Start Date" :value="getFormattedDate(job.start)" customClass="pair_column-flex")
        .other-info__item
            LabelValue(title="Deadline" :value="getFormattedDate(job.deadline)" customClass="pair_column-flex")
</template>

<script>
import LabelValue from "../../../components/jobs/LabelValue";
import moment from "moment";
import { mapGetters, mapActions } from "vuex";

export default {
    data() {
        return {
            domain: ""
        }
    },
    methods: {
        getFormattedDate(date) {
            return moment(date).format("DD-MM-YYYY")
        }
    },
    computed: {
        ...mapGetters({
            job: "getSelectedJob"
        }),
        fullManagerName() {
            let result = "";
            if(this.job.manager) {
                result = this.job.manager.firstName + " " + this.job.manager.lastName;
            }
            return result;
        },
        jobType() {
            return this.job.name === 'translate1' ? "Translation" : "Proofing";
        }
    },
    components: {
        LabelValue
    },
    mounted() {
        this.domain = process.env.domain;
    }
}
</script>


<style lang="scss" scoped>
@import "../../../../assets/scss/colors.scss";

.other-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 15px 0 40px;
    height: 100%;
    box-sizing: border-box;
    &__header {
        width: 100%;
        padding: 0 30px 20px;
        box-sizing: border-box;
        border-bottom: 1px solid $light-brown;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    &__photo {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 1px solid $light-brown;
        margin-bottom: 10px;
        box-sizing: border-box;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;

    }
    &__image {
        max-width: 33px;
        max-height: 33px;
        object-fit: contain;
    }
    &_no-photo {
        margin-right: 2px;
    }
}

</style>
