<template lang="pug">
.create-project
    Project(
        :project="project"
        @projectCreated="projectCreated"
        @setValue="setValue"
    )
</template>

<script>
import Project from "./Project";
import { mapGetters, mapActions } from 'vuex';

export default {
    data() {
        return {
            project: {
                projectId: "",
                template: "",
                projectName: "",
                customer: {name: ""},
                brief: "",
                notes: "",
                industry: "",
                startDate: new Date(),
                deadline: "",
            }
        }
    },
    methods: {
        ...mapActions({
            storeProject: "setCurrentProject"
        }),
        setValue({option, refersTo}) {
            this.project[refersTo] = option;
        },
        projectCreated({project, customer}) {
            this.project = project;
            this.project.customer = customer;
            this.storeProject(this.project);
            this.$router.push(`/project-details/${project._id}`);
        }
    },
    components: {
        Project
    }
}
</script>

<style lang="scss" scoped>
.create-project {
    width: 100%;
}
</style>
