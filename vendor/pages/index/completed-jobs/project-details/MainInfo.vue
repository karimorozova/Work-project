<template lang="pug">
    .main-info
        JobData(:job="job")
        Instructions(:job="job")
        TermsAgree(:job="job")
</template>

<script>
import JobData from "../../../components/details/JobData";
import Instructions from "../../../components/details/Instructions";
import TermsAgree from "../../../components/details/TermsAgree";
import { mapGetters } from "vuex";

export default {
    
    computed: {
        ...mapGetters({
            job: "getSelectedJob"
        })
    },
    components: {
        JobData,
        Instructions,
        TermsAgree
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
}

</style>
