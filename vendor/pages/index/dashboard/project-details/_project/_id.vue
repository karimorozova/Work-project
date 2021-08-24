<template lang="pug">
  .details(v-if="job._id")
    .title Project Details
    //.btn(v-if="!isForbidden.status")
      //Button(:value="'Update'" @clicked="updateData")
    .details__data
      .details__info
        .details__main
          MainInfo
        .details__describe
          OtherInfo
      .details__files
        FilesAndButtons(
          :deliverables="targetFiles"
          @showModal="showModal"
          @setDeliverables="setDeliverables"
        )
      .details__modal(v-if="isApproveModal")
        ApproveModal(
          :isCentered="isApproveModal"
          @close="closeModal"
          @notApprove="closeModal"
          @approve="completeJob"
          text="Are you sure you have completed your job and reviewed your work?"
          approveValue="Complete"
          notApproveValue="Cancel")
      Forbidden(v-if="isForbidden.status" :message="isForbidden.message")
</template>

<script>
	import MainInfo from "../MainInfo"
	import OtherInfo from "../OtherInfo"
	import FilesAndButtons from "../FilesAndButtons"

	const Forbidden = () => import("../../../../components/details/Forbidden")
	const ApproveModal = () => import("~/components/ApproveModal")
	import { mapGetters, mapActions } from "vuex"
	import Button from "../../../../../components/overall/Button"

	export default {
		data() {
			return {
				isApproveModal: false,
				statuses: [ "Quote sent", "Draft", "Requested" ],
				targetFiles: [],
				message: "",
				project: null,
				currentStep: {},
				currentTask: {}
			}
		},
		methods: {
			...mapActions({
				getJobs: "getJobs",
				selectJob: "selectJob",
				alertToggle: "alertToggle",
				setJobStatus: "setJobStatus",
				setJobComplianceStatus: "setJobComplianceStatus"
			}),
			closeModal() {
				this.isApproveModal = false
			},
			// async updateData() {
				// try {
				// 	await this.getProjectById(this.$route.params.project)
				// 	if (this.project) {
				// 		await this.getStepFromProject(this.$route.params.id)
				// 		await this.getTaskFromProject(this.currentStep.taskId)
				// 	}
				// } catch (err) {
				// } finally {
				// 	this.refreshProgress()
				// }
			// },
			async getProjectById(id) {
				try {
					const result = await this.$axios.post(`vendor/project`, {
						id,
						token: this.getToken
					})
					this.project = JSON.parse(window.atob(result.data))
				} catch (e) {
				}
			},
			showModal() {
				this.isApproveModal = true
			},
			setCurrentJob() {
				const currentJob = this.allJobs.find(item => item._id === this.job._id)
				this.selectJob(currentJob)
			},
			setDeliverables({ files }) {
				this.targetFiles = files
			},
      // #Complete
			async completeJob() {
				const { type } = this.originallyUnits.find(item => item._id.toString() === this.job.serviceStep.unit)
				this.closeModal()
				try {
					if (type === 'CAT Wordcount') {
						await this.setJobStatus({ jobId: this.job._id, status: "Completed", targetFile: this.targetFiles[0] })
						await this.$axios.post('/vendor/set-workFlowStatus', { token: this.getToken, stepId: this.job.stepId, stepAction: 'Finish' })
					}else if(this.job.serviceStep.title === "Compliance"){
						await this.setJobComplianceStatus({ jobId: this.job._id, status: "Completed", targetFile: this.targetFiles })
					}else{
						await this.setJobStatus({ jobId: this.job._id, status: "Completed", targetFile: this.targetFiles[0] })
					}
					this.setCurrentJob()
					this.targetFiles = []
				} catch (err) {
				}
			},
			async refreshProgress() {
				try {
					if (!this.job._id) {
						await this.getJobInfo()
					}
					if (this.job.status !== "Started") return
					const { type } = this.originallyUnits.find(item => item._id.toString() === this.job.serviceStep.unit.toString())
					const isCatTool = type === 'CAT Wordcount'
					await this.$axios.post('/vendor/update-progress', { token: this.getToken, projectId: this.job.project_Id, isCatTool })
					await this.getJobs()
					this.setCurrentJob()
					this.alertToggle({ message: "Progress updated", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: err.response.data, isShow: true, type: "error" })

				}
			},
			async getJobInfo() {
				const { id } = this.$route.params
				try {
					if (!this.allJobs.length) {
						await this.getJobs()
					}
					const currentJob = this.allJobs.find(item => item._id === id)
					await this.selectJob(currentJob)
				} catch (err) {
				}
			},
			async getStepFromProject(stepId) {
				this.currentStep = await this.project.steps.find(item => item._id === stepId)
			},
			async getTaskFromProject(taskId) {
				this.currentTask = await this.project.tasks.find(item => item.taskId === taskId)
			}
		},
		computed: {
			...
					mapGetters({
						job: "getSelectedJob",
						allJobs: "getAllJobs",
						originallyUnits: "getOriginallyUnits",
						getToken: "getToken"
					}),
			buttonValue() {
				return "Start"
			},
			isForbidden() {
				let result = {}

				if (this.currentTask && this.currentStep) {
					const isRequestStepStatus = this.currentStep.status === 'Request Sent'
					const { status } = this.currentTask
					if ((status === 'Created' || status === 'Quote sent') && !isRequestStepStatus) {
						result = {
							status: true,
							message: "Project or Task hasn't been approved yet."
						}
					} else if (
							(status === 'Approved' || status === 'Ready to Start' || status === 'In progress' || status === 'Pending Approval [DR1]' || status === 'Pending Approval [DR2]' || status === 'Delivered')
							&& this.currentStep.status !== 'Rejected'
					) {
						result = {
							status: false,
							message: ''
						}
					} else if (status === 'Rejected' || this.currentStep.status === 'Rejected') {
						result = {
							status: true,
							message: "Project or Task has rejected."
						}
					}
				}
				return result
			}
		},
		components: {
			Button,
			MainInfo,
			OtherInfo,
			FilesAndButtons,
			ApproveModal,
			Forbidden
		},
		mounted() {
			this.refreshProgress()
		},
		async created() {
			await this.getProjectById(this.$route.params.project)
			if (this.project) {
				await this.getStepFromProject(this.$route.params.id)
				await this.getTaskFromProject(this.currentStep.taskId)
			}
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../../../assets/scss/colors";

  .title {
    font-size: 18px;
    font-family: Myriad600;
    margin-bottom: 10px;
  }

  .details {
    color: $main-color;
    width: 100%;
    padding: 20px 40px;

    &__data {
      width: 1040px;
      margin-top: 10px;
      box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
      box-sizing: border-box;
      position: relative;
    }

    &__header {
      padding: 10px 20px;
      border-bottom: 1px solid rgb(197, 191, 181);
    }

    &__title {
      font-size: 20px;
      font-family: Myriad400;
    }

    &__info {
      display: flex;
    }

    &__main {
      width: 70%;
    }

    &__describe {
      width: 30%;
      background-color: #f4f2f1;
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

</style>
