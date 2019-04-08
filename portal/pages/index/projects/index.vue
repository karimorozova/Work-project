<template lang="pug">
  .all-projects
    Allprojects(:projects="projects" :user="user" @projectDetails='projectDetails')
</template>

<script>
  import Allprojects from "~/components/projects/Allprojects";
  import { mapGetters } from "vuex";

  export default {
    props: {
      jobsById:{
        type: Array
      },
    },
    methods:{
      projectDetails(data) {
        this.project = data.project;
        this.jobsById = data.jobs;
        this.$router.push('/dashboard/project-info');
      },
    },
    computed: {
      ...mapGetters({
        user: "getUserInfo",
        client: "getClientInfo",
        projects: "getAllProjects"
      })
    },
    components: {
      Allprojects,
    },
  }
</script>

<style scoped>

</style>
