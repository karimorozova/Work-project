<template lang="pug">
  Allprojects(:projects="projects" :user="user" @projectDetails='projectDetails')
</template>

<script>
  import Allprojects from "~/components/projects/Allprojects";
  export default {
    props: {
      projects: {
        type: Array
      },
      user:{
        type: Object
      },
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
    components: {
      Allprojects,
    },
  }
</script>

<style scoped>

</style>
