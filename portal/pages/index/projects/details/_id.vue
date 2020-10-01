<template lang="pug">
    .details
        .details__data(v-if="project._id")
            .details__header
                .details__title {{ title }}
            .details__info
                .details__main
                    MainInfo
                .details__describe
                    OtherInfo
</template>

<script>
import MainInfo from "./MainInfo";
import OtherInfo from "./OtherInfo";
import { mapGetters, mapActions } from "vuex";

export default {
    data() {
        return {

        }
    },
    methods: {
        ...mapActions({
            getProjects: "getProjectsAndRequests",
            selectProject: "selectProject",
            alertToggle: "alertToggle"
        }),
        async getProjectInfo() {
            const { id } = this.$route.params;
            try {
                if(!this.allProjects.length) {
                    await this.getProjects();
                }
                const currentProject = this.allProjects.find(item => item._id === id);
                await this.selectProject(currentProject);
            } catch(err) {

            }
        }
    },
    computed: {
        ...mapGetters({
            project: "getSelectedProject",
            allProjects: "getAllProjects"
        }),
        title() {
            let result = "Quote Details";
            let statuses = ['Quote sent', 'Requested'];
            if(statuses.indexOf(this.project.status) === -1) {
                result = 'Project Details'
            }
            return result;
        }
    },
    components: {
        MainInfo,
        OtherInfo
    },
    created() {
        this.getProjectInfo();
    }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors.scss";

.details {
    color: $main-color;
    width: 100%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    &__data {
        width: 1020px;
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
        height: 100%;
    }
    &__main {
        width: 75%;
    }
    &__describe {
        width: 25%;
        background-color: #F6F1EF;
    }
}

</style>
