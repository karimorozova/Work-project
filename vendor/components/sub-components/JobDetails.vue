<template lang="pug">
  .job-details(v-if="job" )
    .job-details__Rside
      ProjectDescription(
        :job="job"
        @updateProgress="getJobsDetails"
      )
      ProjectWorkflow(
        :job="job"
        @setJobStatus="setJobStatus"
        @updateProgress="getJobsDetails"
      )
    .job-details__Lside
      ProjectManageBlock(
        :job="job"
      )
</template>

<script>
import { mapActions, mapGetters } from "vuex"
import ProjectManageBlock from "./JobsDetailsSub/ProjectManageBlock"
import ProjectDescription from "./JobsDetailsSub/ProjectDescription"
import ProjectWorkflow from "./JobsDetailsSub/ProjectWorkflow"

export default {
  name: "JobDetails",
  components: { ProjectWorkflow, ProjectDescription, ProjectManageBlock },
  data() {
    return {
      job: null
    }
  },
  methods: {
    ...mapActions([ 'alertToggle' ]),
    async setJobStatus(payload) {
      const jobId = this.job._id
      try {
        let { status, targetFile } = payload

        if (targetFile) {
          let fileData = new FormData()
          fileData.append('jobId', jobId)
          for (let file of targetFile) fileData.append('targetFile', file)
          await this.$axios.post('/vendor/step-target', fileData)
        }
        if (status === "Completed" && !targetFile) {
          await this.$axios.post('/vendor/target-files', { stepId: jobId })
        }
        await this.$axios.post('/vendor/job', { jobId, status })
      } catch (err) {
        this.alertToggle({ message: "Error in Action!", isShow: true, type: "error" })
      }
      await this.getJobsDetails()
    },
    async getJobsDetails() {
      const [ _stepId, _projectId ] = this.$route.params.id.split('_')
      try {
        const result = await this.$axios.post(`/vendor/jobs-details`, { _stepId, _projectId, _vendorId: this.vendor._id })
        this.job = result.data

        if (result.data.status === 'In progress' && result.data.payablesUnit.type === 'CAT Wordcount') {
          await this.$axios.post('/vendor/update-progress', { token: this.token, projectId: _projectId, isCatTool: true })
          const result = await this.$axios.post(`/vendor/jobs-details`, { _stepId, _projectId, _vendorId: this.vendor._id })
          this.job = result.data
        }
        console.log('START APP', this.job)

        this.alertToggle({ message: "Data received", isShow: true, type: "success" })
      } catch (err) {
      }
    }
  },
  computed: {
    ...mapGetters({
      token: 'getToken',
      vendor: 'getVendor'
    })
  },
  async created() {
    await this.getJobsDetails()
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