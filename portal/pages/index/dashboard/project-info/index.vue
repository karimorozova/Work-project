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
      // project: {
      //   type: Object
      // },
      jobsById: {
        type: Array
      },
      projectIndex: {
        type: Number
      }
    },
    data() {
      return {
        project:{
          name:'some name',
          idNumber: 345345,
          status: 'SENT',
          totalAgreed:{
            formattedAmount:1000
          },
          projectManager:{
            name: 'Sam'
          },
          service: 'Special',
          specialization: 'Some spec',
          startDate:{
            formatted:'1980 07 15'
          },
          deadline:{
            formatted:'2980 07 15'
          }

        }
      }
    },
    created() {
      console.log('project: ', this.project);
    },
    components: {
      projectInfoDetailed: ProjectInfoDetailed,
    },
  }
</script>

<style scoped>

</style>
