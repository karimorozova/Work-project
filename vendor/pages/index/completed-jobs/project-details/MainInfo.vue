<template lang="pug">
    .main-info
        JobData(:job="job")
        Instructions(:job="job")
</template>

<script>
import JobData from "../../../components/details/JobData";
import Instructions from "../../../components/details/Instructions";
import { mapGetters } from "vuex";

export default {
    
    computed: {
        ...mapGetters({
            job: "getSelectedJob"
        })
    },
    components: {
        JobData,
        Instructions
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
