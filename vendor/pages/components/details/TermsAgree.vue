<template lang="pug">
  .terms
    .terms__check
      CheckBox(
        :isChecked="job.isVendorRead"
        :isReadonly="isReadonly"
        @check="(e) => toggle(e, true)" @unCheck="(e) => toggle(e, false)"
      )
    span.terms__text I have read the instructions and downloaded the reference files
</template>

<script>
import CheckBox from "~/components/CheckBox"
import { mapActions, mapGetters } from "vuex"

export default {
  props: {
    job: {
      type: Object
    },
    allJobs: {
      type: Array
    }
  },
  data() {
    return {
      project: null
    }
  },
  methods: {
    ...mapActions({
      setStepTermsAgreement: "setStepTermsAgreement"
    }),
    async toggle(e, bool) {
      if (this.job.status === "In progress") return
      try {
        await this.setStepTermsAgreement({ jobId: this.job._id, value: bool })
      } catch (err) {
      }
    },
    async getProjectById() {
      try {
        const result = await this.$axios.post(`vendor/project`, { id: this.job.project_Id, token: this.getToken })
        this.project = JSON.parse(window.atob(result.data))
      } catch (e) {
      }
    }
  },
  computed: {
    ...mapGetters({
      getToken: 'getToken'
    }),
    isReadonly() {
      if (this.project) {
        return this.job.status !== 'Ready to Start'

        // const statuses = [ 'Approved', 'In progress' ]
        // const { taskId, stepId } = this.job
        // const { steps } = this.project
        // let stepsCurrentByTask = steps.filter(item => item.taskId === taskId)
        // stepsCurrentByTask = stepsCurrentByTask.filter(item => item.status !== "Cancelled" && item.status !== "Cancelled Halfway")
        // const currentIndex = stepsCurrentByTask.findIndex(item => item.stepId === stepId)
        // if (statuses.indexOf(this.job.projectStatus) === -1 || this.job.status === 'Completed') {
        //   return true
        // } else if (currentIndex === 0) {
        //   return false
        // } else if (currentIndex >= 1) {
        //   return stepsCurrentByTask[0].status !== "Completed"
        // } else {
        //   return true
        // }
      }
    }

  },
  async created() {
    await this.getProjectById()
  },
  components: {
    CheckBox
  }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.terms {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 20px;

  &__check {
    margin-right: 10px;
  }
}

</style>
