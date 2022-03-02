<template lang="pug">
  .job-details(v-if="job" )
    .job-details__Rside
      ProjectDescription(
        :job="job"
        @updateProgress="getJobsDetails"
      )
      ProjectInstructions(
        v-if="job.status !== 'Completed'"
        :job="job"
      )
      ProjectReferenceFiles(
        v-if="job.status !== 'Completed'"
        :job="job"
      )
      ProjectWorkflow(
        :job="job"
        @setJobStatus="setJobStatus"
        @updateProgress="getJobsDetails"
      )
      ProjectInvoicingStatus(
        v-if="job.status === 'Completed'"
        :job="job"
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
import ProjectInstructions from "./JobsDetailsSub/ProjectInstructions"
import ProjectReferenceFiles from "./JobsDetailsSub/ProjectReferenceFiles"
import ProjectInvoicingStatus from "./JobsDetailsSub/ProjectInvoicingStatus"

export default {
  name: "JobDetails",
  components: { ProjectInvoicingStatus, ProjectReferenceFiles, ProjectInstructions, ProjectWorkflow, ProjectDescription, ProjectManageBlock },
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

        const [ _stepId, _projectId ] = this.$route.params.id.split('_')
        const result = await this.$axios.post(`/vendor/jobs-details`, { _stepId, _projectId, _vendorId: this.vendor._id })
        this.job = result.data
      } catch (err) {
        this.alertToggle({ message: "Error in Action!", isShow: true, type: "error" })
      }
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
  position: relative;

  &__Lside {
    margin-right: 50px;
    margin-left: 25px;
  }
}
</style>