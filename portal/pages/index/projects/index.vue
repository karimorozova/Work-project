<template lang="pug">
  .all-projects
    Allprojects(:allProjects="projects" :user="user" @projectDetails='projectDetails')
</template>

<script>
  import Allprojects from "../../../components/projects/Allprojects";
  import { mapGetters } from "vuex";

  export default {
    props: {
      jobsById:{
        type: Array
      },
    },
    data() {
      return {
        projects: []
      }
    },
    methods:{
      projectDetails(data) {
        this.project = data.project;
        this.jobsById = data.jobs;
        this.$router.push('/dashboard/project-info');
      },
      async getAllProjects() {
        const { projects } = (await this.$axios.get(`/portal/all-projects?token=${ this.token }`)).data
        this.projects = projects
      }
    },
    computed: {
      ...mapGetters({
        user: "getUserInfo",
        client: "getClientInfo",
        token: "getToken",
      })
    },
    created() {
      this.getAllProjects()
    },
    components: {
      Allprojects,
    },
  }
</script>

<style scoped>
  .all-projects{
    color: #67573e;
  }
</style>
