<template lang="pug">
    .dashboard
        .jobs_block
            h3 Upcoming Jobs
            .jobs
                UpcomingJobs(
                    :fields="fields"
                    :jobs="upcomingJobs"
                    @makeAction="(e) => makeAction(e, 'upcomingJobs')"
                )
        .jobs_block
            h3 Open Jobs
            .jobs
                OpenedJobs(
                    :fields="fields"
                    :jobs="openedJobs"
                    @showModal="showModal"
                    @makeAction="(e) => makeAction(e, 'openedJobs')"
                )
                .jobs__modal(v-if="isApproveModal")
                  ApproveModal(
                    :isCentered="isApproveModal"
                    @close="closeModal"
                    @notApprove="closeModal"
                    @approve="completeJob" 
                    text="Are you sure you have completed your job and reviewed your work?"
                    approveValue="Complete" 
                    notApproveValue="Cancel"
                  )
        nuxt-child
</template>

<script>
  import DataTable from "~/components/Tables/DataTable";
  import ApproveModal from "~/components/ApproveModal";
  import UpcomingJobs from "../../components/jobs/Tables/Upcoming_Jobs/UpcomingJobs";
  import OpenedJobs from "../../components/jobs/Tables/Opened_Jobs/OpenedJobs";

  import { mapGetters, mapActions } from "vuex";
  import moment from "moment";

  export default {
    data() {
      return {
        fields: [
          {label: "Project ID", headerKey: "headerProjectId", key: "projectId", width: "14%", padding: "0"},
          {label: "Project Name", headerKey: "headerProjectName", key: "projectName", width: "18%", padding: "0"},
          {label: "Type", headerKey: "headerType", key: "type", width: "14%", padding: "0"},
          {label: "Status", headerKey: "headerStatus", key: "status", width: "14%", padding: "0"},
          {label: "Deadline", headerKey: "headerDeadLine", key: "deadLine", width: "14%", padding: "0"},
          {label: "Total Amount", headerKey: "headerAmount", key: "amount", width: "14%", padding: "0"},
          {label: "Action", headerKey: "headerIcons", key: "icons", width: "12%", padding: "0"},
        ],
        jobStatuses: ["Request Sent", "Accepted", "Created"],
        currentIndex: -1,
        isApproveModal: false
      }
    },
    methods: {
      ...mapActions({
        alertToggle: "alertToggle",
        getJobs: "getJobs",
        setJobStatus: "setJobStatus"
      }),
      showModal({index}) {
        this.currentIndex = index;
        this.isApproveModal = true;
      },
      closeModal() {
        this.isApproveModal = false;
      },
      async completeJob() {
        const jobId = this.openedJobs[this.currentIndex]._id;
        try {
          await this.setJobStatus({jobId, status: "Completed"});
          this.closeModal();
        } catch(err) {

        }
      },
      formatDeadline(date) {
        return moment(date).format('DD-MMM-YYYY')
      },
      async checkErrors(index) {

      },
      async makeAction({index, key}, prop) {
        const status = key === "Approve" ? "Accepted" : "Rejected";
        try {
          await this.setJobStatus({jobId: this[prop][index]._id, status});
        } catch(err) {
          this.alertToggle({message: "Error in jobs action", isShow: true, type: "error"});
        }
      }
    },
    computed: {
      ...mapGetters({
        jobs: "getAllJobs"
      }),
      upcomingJobs() {
        return this.jobs.filter(item => {
          return this.jobStatuses.indexOf(item.status) !== -1 && item.projectStatus !== "Started"
        })
      },
      openedJobs() {
        const statuses = [...this.jobStatuses, "Started"];
        return this.jobs.filter(item => {
          return statuses.indexOf(item.status) !== -1 && item.projectStatus === "Started";          
        })
      }
    },
    components: {
      DataTable,
      ApproveModal,
      UpcomingJobs,
      OpenedJobs,
    },
    mounted() {
      this.getJobs();
    }
  }
</script>

<style lang="scss" scoped>
@import '../../../assets/scss/colors.scss';

.dashboard {
  width: 100%;
  padding: 30px;

  .jobs_block {
    color: $main-color;

    .jobs {
      width: 1047px;
      max-height: 600px;
      background-color: $white;
      box-shadow: 0 0 10px $main-color;
      box-sizing: border-box;
      padding: 3px 5px;
      position: relative;
      &_opacity {
        opacity: 1;
      }
      &__modal {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }

}

</style>
