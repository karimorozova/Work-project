<template lang="pug">
  .job-details(v-if="job" )
    .job-details__Rside
      ProjectDescription(
        :job="job"
      )
    .job-details__Lside
      ProjectManagerBlock(
        :projectManager="job.projectManager"
      )

</template>

<script>
import { mapGetters } from "vuex"
import ProjectManagerBlock from "./JobsDetailsSub/ProjectManagerBlock"
import ProjectDescription from "./JobsDetailsSub/ProjectDescription"

export default {
  name: "JobDetails",
  components: { ProjectDescription, ProjectManagerBlock },
  data() {
    return {
      job: null
    }
  },
  methods: {
    async getJobsDetails(_stepId, _projectId, _vendorId) {
      try {
        const result = await this.$axios.post(`/vendor/jobs-details`, {
          _stepId,
          _projectId,
          _vendorId
        })
        this.job = result.data
        console.log(this.job)
      } catch (err) {
      }
    }
  },
  computed: {
    ...mapGetters({
      vendor: 'getVendor'
    })
  },
  created() {
    const [ _stepId, _projectId ] = this.$route.params.id.split('_')
    this.getJobsDetails(_stepId, _projectId, this.vendor._id)
  }
}
</script>

<style lang="scss" scoped>
.job-details {
  display: flex;

  &__Lside {
    margin-right: 50px;
    margin-left: 25px;
  }
}
</style>