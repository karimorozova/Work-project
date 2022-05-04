<template lang="pug">
  .job-details(v-if="job" )
    .job-details__Rside
      ProjectDescription(
        :job="job"
        @updateProgress="getJobsDetails"
      )
      //TEMP
      .smartling(v-if="this.job.SmartlingJobID && this.job.status === 'In progress'" style="background-color: white;border-radius: 4px; box-shadow: rgba(99, 99, 99, 0.12) 0px 0px 1px, rgba(99, 99, 99, 0.2) 0px 1px 2px, rgba(99, 99, 99, 0.05) 0px 2px 1.3px; padding: 25px 25px 1px 25px;margin-bottom: 25px; width: 740px;")
        .title(style="font-size: 16px; font-family:Roboto600;") Enter to Smartling:
        p
          a(:href="`https://ti.smartling.com/app/94d7a2dab?locale=${this.job.fullTargetLanguage.smartling || this.job.fullTargetLanguage.iso1}&translationJobUids=${this.job.SmartlingJobID}`" target="_blank") Link
      //TEMP
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
    },
    async onTabEnterJobDetails() {
      if (document.visibilityState === 'visible') {
        await this.getJobsDetails()
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
    document.addEventListener("visibilitychange", this.onTabEnterJobDetails)
  },
  destroyed() {
    document.removeEventListener('visibilitychange', this.onTabEnterJobDetails)
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