<template lang="pug">
  .details
    .details__data(v-if="job._id")
      .details__header
        .details__title Project Details
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
	import MainInfo from "../MainInfo";
	import OtherInfo from "../OtherInfo";
	import FilesAndButtons from "../FilesAndButtons";

	const Forbidden = () => import("../../../../components/details/Forbidden");
	const ApproveModal = () => import("~/components/ApproveModal");
	import { mapGetters, mapActions } from "vuex";

	export default {
		data() {
			return {
				isApproveModal: false,
				statuses: ["Quote sent", "Draft", "Requested"],
				targetFiles: [],
				message: "",
				project: null,
				currentStep: {},
				currentTask: {},
			}
		},
		methods: {
			...mapActions({
				getJobs: "getJobs",
				selectJob: "selectJob",
				alertToggle: "alertToggle",
				setJobStatus: "setJobStatus",
			}),
			closeModal() {
				this.isApproveModal = false;
			},
			async getProjectById(id) {
				try {
					const result = await this.$axios.get(`pm-manage/project?id=${ id }`);
					console.log('err')
					console.log(result.data)
					this.project = result.data;
				} catch (e) {
				}
			},
			showModal() {
				this.isApproveModal = true;
			},
			setCurrentJob() {
				const currentJob = this.allJobs.find(item => item._id === this.job._id);
				this.selectJob(currentJob);
			},
			setDeliverables({ files }) {
				this.targetFiles = files;
			},
			async completeJob() {
				this.closeModal();
				try {
					await this.setJobStatus({ jobId: this.job._id, status: "Completed", targetFile: this.targetFiles[0] });
					this.setCurrentJob();
					this.targetFiles = [];
				} catch (err) {
				}
			},
			async refreshProgress() {
				try {
					if(!this.job._id) {
						await this.getJobInfo();
					}
					if(this.job.status !== "Started") return;
					const { type } = this.originallyUnits.find(item => item._id.toString() === this.job.serviceStep.unit.toString())
					const isCatTool = type === 'CAT Wordcount';
					await this.$axios.post('/pm-manage/update-progress', { projectId: this.job.project_Id, isCatTool });
					await this.getJobs();
					this.setCurrentJob();
					this.alertToggle({ message: "Progress updated", isShow: true, type: "success" });
				} catch (err) {
					this.alertToggle({ message: err.response.data, isShow: true, type: "error" });

				}
			},
			async getJobInfo() {
				const { id } = this.$route.params;
				try {
					if(!this.allJobs.length) {
						await this.getJobs();
					}
					const currentJob = this.allJobs.find(item => item._id === id);
					await this.selectJob(currentJob);
				} catch (err) {
				}
			},
			async getStepFromProject(stepId) {
				this.currentStep = await this.project.steps.find(item => item._id === stepId);
			},
			async getTaskFromProject(taskId) {
				this.currentTask = await this.project.tasks.find(item => item.taskId === taskId);
			},
		},
		computed: {
			...mapGetters({
				job: "getSelectedJob",
				allJobs: "getAllJobs",
				originallyUnits: "getOriginallyUnits",
			}),
			buttonValue() {
				return "Start"
			},
			isForbidden() {
				let result = {};
				if(this.currentTask) {
					const { status } = this.currentTask;
					switch (status) {
            case 'Approved':
            case 'Ready to Start':
            case 'In progress':
            case 'Pending Approval [DR1]':
            case 'Pending Approval [DR2]':
            case 'Delivered':
              result = {
                status: false,
                message: ''
              };
              break;
            case 'Created':
            case 'Quote sent':
							result = {
								status: true,
								message: "Project or Task hasn't been approved yet."
							};
							break;
						case "Rejected":
							result = {
								status: true,
								message: "Project or Task has rejected."
							};
							break;
					}
				}
				return result;
			},
		},
		components: {
			MainInfo,
			OtherInfo,
			FilesAndButtons,
			ApproveModal,
			Forbidden
		},
		mounted() {
			this.refreshProgress();
		},
		async created() {
			console.log('tyt22')
			await this.getProjectById(this.$route.params.project);

			if(this.project) {
				console.log('tyt')
				await this.getStepFromProject(this.$route.params.id);
				await this.getTaskFromProject(this.currentStep.taskId);
			}
		},
	}
</script>

<style lang="scss" scoped>
  @import "../../../../../assets/scss/colors";

  .details {
    color: $main-color;
    width: 100%;
    padding: 30px;

    &__data {
      width: 920px;
      margin-top: 10px;
      box-shadow: 0 0 15px $brown-shadow;
      box-sizing: border-box;
      position: relative;
    }

    &__header {
      padding: 10px 20px 10px 28px;
      border-bottom: 1px solid $light-brown;
    }

    &__title {
      font-size: 20px;
    }

    &__info {
      display: flex;
    }

    &__main {
      width: 70%;
    }

    &__describe {
      width: 30%;
      background-color: #F6F1EF;
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
