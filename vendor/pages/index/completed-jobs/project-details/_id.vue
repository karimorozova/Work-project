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
                FilesAndButtons
</template>

<script>
import MainInfo from "./MainInfo";
import OtherInfo from "./OtherInfo";
import FilesAndButtons from "../../../components/details/FilesAndButtons";
import { mapGetters, mapActions } from "vuex";

export default {
    data() {
        return {
            
        }
    },
    methods: {
        ...mapActions({
            getJobs: "getJobs",
            selectJob: "selectJob",
            alertToggle: "alertToggle"
        }),
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
        })
    },
    components: {
        MainInfo,
        OtherInfo,
        FilesAndButtons
    },
    mounted() {
        this.getJobInfo();
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
}

</style>
