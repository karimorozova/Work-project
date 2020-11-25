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
            getProjectsAndRequests: "getProjectsAndRequests",
            selectProject: "selectProject",
            alertToggle: "alertToggle"
        }),
        async getProjectInfo() {
            const { id } = this.$route.params;
            try {
                if(!this.allProjects.length || !this.allRequests.length) {
                    await this.getProjectsAndRequests();
                }
                const projectsAndRequests = [...this.allProjects, ...this.allRequests];
                const currentProject = projectsAndRequests.find(item => item._id === id);
                await this.selectProject(currentProject);
            } catch(err) {

            }
        }
    },
    computed: {
        ...mapGetters({
            project: "getSelectedProject",
            allProjects: "getAllProjects",
            allRequests: "getAllRequests"
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
    mounted() {
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
        width: 1038px;
        box-shadow: 0 0 10px #67573e9d;
        box-sizing: border-box;
    }
    &__header {
        padding: 20px;
        border-bottom: 1px solid $light-brown;
    }
    &__title {
        font-size: 18px;
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
