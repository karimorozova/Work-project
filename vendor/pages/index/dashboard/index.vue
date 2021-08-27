<template lang="pug">
  .dashboard
    .jobs_block
      .jobs_block__title Upcoming Jobs
      .jobs
        UpcomingJobs(
          :jobs="upcomingJobs"
          @makeAction="(e) => makeAction(e, 'upcomingJobs')"
        )
    .jobs_block
      .jobs_block__title Open Jobs
      .jobs
        OpenedJobs(
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
	import DataTable from "../../../components/overall/DataTable"
	import ApproveModal from "~/components/ApproveModal"
	import UpcomingJobs from "../../components/jobs/Tables/Upcoming_Jobs/UpcomingJobs"
	import OpenedJobs from "../../components/jobs/Tables/Opened_Jobs/OpenedJobs"

	import { mapGetters, mapActions } from "vuex"
	import moment from "moment"

	export default {
		data() {
			return {
				jobStatuses: ["Request Sent", "Accepted", "Ready to Start", "Waiting to Start"],
				currentIndex: -1,
				isApproveModal: false
			}
		},
		methods: {
			...mapActions({
				alertToggle: "alertToggle",
				getJobs: "getJobs",
				setJobStatus: "setJobStatus",
				setOriginallyUnits: "setOriginallyUnits"
			}),
			showModal({ index }) {
				this.currentIndex = index
				this.isApproveModal = true
			},
			closeModal() {
				this.isApproveModal = false
			},
			async completeJob() {
				const jobId = this.openedJobs[this.currentIndex]._id
				try {
					await this.setJobStatus({ jobId, status: "Completed" })
					this.closeModal()
				} catch (err) {
				}
			},
			formatDeadline(date) {
				return moment(date).format('DD-MMM-YYYY')
			},
			async checkErrors(index) {

			},
			async makeAction({ index, key }, prop) {
				const status = key === "Approve" ? "Accepted" : "Rejected"
				try {
					await this.setJobStatus({ jobId: this[prop][index]._id, status })
				} catch (err) {
					this.alertToggle({ message: "Error in jobs action", isShow: true, type: "error" })
				}
			}
		},
		computed: {
			...mapGetters({
				jobs: "getAllJobs"
			}),
			upcomingJobs() {
				return this.jobs.filter(item => {
					if (item.status === 'Request Sent') {
						return item
					}
					return this.jobStatuses.indexOf(item.status) !== -1 && item.projectStatus !== 'Started'
							&& item.projectStatus !== 'Approved' && item.projectStatus !== 'In progress'
				})
			},
			openedJobs() {
				let statuses = this.jobStatuses.filter(item => item !== "Request Sent")
				statuses.push("Started")
				return this.jobs.filter(item => {
					return statuses.indexOf(item.status) !== -1 && (item.projectStatus === 'Started'
							|| item.projectStatus === 'Approved' || item.projectStatus === 'In progress')
				})
			}
		},
		components: {
			DataTable,
			ApproveModal,
			UpcomingJobs,
			OpenedJobs
		},
		mounted() {
			this.getJobs()
		}
	}
</script>

<style lang="scss" scoped>
  @import '../../../assets/scss/colors.scss';

  .dashboard {

    .jobs_block {
      margin-bottom: 50px;

      &__title {
        font-size: 18px;
        font-family: Myriad600;
        margin-bottom: 10px;
      }

      .jobs {
        width: 1040px;
        max-height: 600px;
        background-color: $white;
        box-shadow: 0 2px 4px 0 rgba(103, 87, 62, .3), 0 2px 16px 0 rgba(103, 87, 62, .2);
        box-sizing: border-box;
        padding: 20px 20px 0.1px 20px;
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
