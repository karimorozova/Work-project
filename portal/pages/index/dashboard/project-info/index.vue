<template lang="pug">
  .detailedProjectWrapper
    projectInfoDetailed(:project="project" :projects="projects" :jobsById="jobsById" :user="user")
</template>

<script>
  import ProjectInfoDetailed from "~/components/projects/ProjectsInfoDetailed";

  export default {
    props: {
      projects: {
        type: Array
      },
      quotes: {
        type: Array
      },
      user: {
        type: Object
      },
      project: {
        type: Object
      },
      jobsById: {
        type: Array
      },
      projectIndex: {
        type: Number
      }
    },
    components: {
      projectInfoDetailed: ProjectInfoDetailed,
    },
  }
</script>

<style scoped>

</style>
