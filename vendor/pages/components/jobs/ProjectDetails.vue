<template lang="pug">
    .details
        .details__data
            .details__header
                .details__title Project Details
            .details__info
                .details__main
                    MainInfo
                .details__describe
                    OtherInfo 
</template>

<script>
import MainInfo from "./projectDetails/MainInfo";
import OtherInfo from "./projectDetails/OtherInfo";
import { mapGetters, mapActions } from "vuex";

export default {
    data() {
        return {
            
        }
    },
    methods: {
        
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
        MainInfo,
        OtherInfo
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

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
