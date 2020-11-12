<template lang="pug">
  .files-buttons
    Files
    .files-buttons__upload(v-if="isFileUpload")
      UploadDeliverable(@setDeliverables="setDeliverables")
    .files-buttons__terms(v-if="job.status !== 'Completed' && job.status !== 'Request Sent' ")
      TermsAgree(v-if="job._id" :job="job")

    .files-buttons__buttons(v-if="deliverables.length || (isButton && job.status !== 'Completed')" :class="{'files-buttons_opacity05': !job.isVendorRead}")
      .files-buttons__button(v-if="isStartButton")
        Button(value="Start" :isDisabled="!job.isVendorRead" @makeAction="startJob")
      .files-buttons__button(v-if="isCompleteButton")
        Button(value="Complete" @makeAction="showModal")

    .files-buttons__icons(v-if="areIcons && job.status !== 'Completed'")
      .files-buttons__icon(v-for="(icon, key) in icons")
        img.files-buttons__image(:src="icon.icon" @click="makeAction(key)")
        span.files-buttons__tooltip {{ key }}

    .alert(v-if="emailAlert")
      span.closebtn(@click="closeEmailAlert") &times;
      |  Credentials from MemoQ account have been sent to your Email.

</template>

<script>
	import Files from "../../../components/details/Files";
	import { mapActions, mapGetters } from "vuex";

	const TermsAgree = () => import("../../../components/details/TermsAgree");
	const UploadDeliverable = () => import("../../../components/details/UploadDeliverable");
	const Button = () => import("~/components/buttons/Button");

	export default {
		props: {
			deliverables: {
				type: Array,
				default: () => []
			},
		},
		methods: {
			...mapActions([
				"setJobStatus",
				"selectJob",
				"alertToggle",

			]),
			closeEmailAlert() {
				this.emailAlert = false;
			},
			setDeliverables({ files }) {
				this.$emit('setDeliverables', { files });
			},
			async createMemoqTranslator() {
				await this.$axios.post(`/vendor/create-memoq-vendor`, { token: this.getToken });
				this.alertToggle({ message: "Vendor is created in MemoQ", isShow: true, type: "success" });
				this.emailAlert = true;
			},
			async startJob() {
				if(!this.job.isVendorRead) return;
				try {
					const { type } = this.originallyUnits.find(item => item._id.toString() === this.job.serviceStep.unit);
					const memoqUsers = await this.$axios.get(`vendor/get-memoq-users?token=${ this.getToken }`);
					const memoqUserGuids = memoqUsers.data.map(({ id }) => id);
					const memoqUserMails = memoqUsers.data.map(({ email }) => email);
					const typeCAT = type === 'CAT Wordcount';

					if(typeCAT && this.getVendor.guid == null && !memoqUserMails.includes(this.getVendor.email)) {
						await this.createMemoqTranslator()
					} else if(typeCAT && this.getVendor.guid && !memoqUserGuids.includes(this.getVendor.guid)) {
						await this.createMemoqTranslator()
					} else if(typeCAT && this.getVendor.guid == null && memoqUserMails.includes(this.getVendor.email)) {
						await this.$axios.post(`/vendor/rewrite-quid-for-translator`, {
							token: this.getToken,
							memoqUsers: memoqUsers.data,
						});
					}
					// if(type === 'CAT Wordcount' && (this.getVendor.guid == null || !memoqUserGuids.includes(this.getVendor.guid))) {
					// 	await this.$axios.post(`/vendor/create-memoq-vendor`, {
					// 		token: this.getToken
					// 	});
					// 	this.alertToggle({ message: "Vendor is created in MemoQ", isShow: true, type: "success" });
					// 	this.emailAlert = true;
					// }
				} catch (err) {
					this.alertToggle({ message: "Error in creating Vendor in MemoQ", isShow: true, type: "error" });
				} finally {
					await this.assignMemoqVendor();
					await this.setStatus("Started");
				}
			},
			async makeAction(key) {
				const status = key === "Approve" ? "Accepted" : "Rejected";
				try {
					await this.setStatus(status);
				} catch (err) {
				}
			},
			async setStatus(status) {
				try {
					await this.setJobStatus({ jobId: this.job._id, status });
					const currentJob = this.allJobs.find(item => item._id === this.job._id);
					this.selectJob(currentJob);
				} catch (err) {
					this.alertToggle({ message: "Error in jobs action", isShow: true, type: "error" });
				}
			},
			async assignMemoqVendor() {
				try {
					await this.$axios.post('/vendor/assign-translator', {
						token: this.getToken,
						stepId: this.job.stepId,
						projectId: this.job.project_Id
					});
				} catch (err) {
				}
			},
			showModal() {
				this.$emit("showModal");
			}
		},
		data() {
			return {
				icons: {
					Approve: { icon: require("../../../../assets/images/Approve-icon.png"), active: true },
					Reject: { icon: require("../../../../assets/images/Reject-icon.png"), active: true }
				},
				emailAlert: false,
			};
		},
		computed: {
			...mapGetters({
				job: "getSelectedJob",
				allJobs: "getAllJobs",
				getToken: "getToken",
				getVendor: "getVendor",
				originallyUnits: "getOriginallyUnits",
			}),
			isStartButton() {
				return this.job.status === "Accepted" || this.job.status === "Ready to Start" || this.job.status === "Waiting to Start";
			},
			progress() {
				if(this.job.progress && this.job.progress.totalWordCount) {
					return +(this.job.progress.wordsDone / this.job.progress.totalWordCount * 100).toFixed(2);
				}
				return this.job.progress;
			},
			isButton() {
				const statuses = ['Accepted', 'Ready to Start', 'Waiting to Start'];
				return statuses.indexOf(this.job.status) !== -1 || this.progress >= 100;
			},
			areIcons() {
				const statuses = ["Created", "Request Sent", "Quote sent"];
				return statuses.indexOf(this.job.status) !== -1;
			},
			isFileUpload() {
				const { type } = this.originallyUnits.find(item => item._id === this.job.serviceStep.unit);
				return this.job.status === 'Started' && type !== 'CAT Wordcount';
			},
			isCompleteButton() {
				const { type } = this.originallyUnits.find(item => item._id === this.job.serviceStep.unit);
				if(type === 'CAT Wordcount') {
					const { title } = this.job.serviceStep;
					const statusWord = title === 'Translation' ? 'Translation' : 'Review1';
					const notFinishedStatus = this.job.memocDocs.find(item => item.WorkflowStatus.indexOf(statusWord) !== -1);
					return this.progress >= 100 && !notFinishedStatus;
				}
				return !!this.deliverables.length;

			}
		},
		components: {
			Files,
			TermsAgree,
			UploadDeliverable,
			Button
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../../assets/scss/colors.scss";

  .files-buttons {
    padding-bottom: 20px;
    display: flex;
    flex-direction: column;

    &__upload {
      padding: 5px;
      box-sizing: border-box;
    }

    &__terms {
      margin-top: 10px;
    }

    &__buttons, &__icons {
      display: flex;
      justify-content: center;
    }

    &__button {
      width: 30%;
      display: flex;
      justify-content: center;
      position: relative;
    }

    &__icons {
      width: 12%;
      align-self: center;
      justify-content: space-between;
      padding: 25px 0 15px 0;
    }

    &__icon {
      position: relative;
    }

    &__tooltip {
      position: absolute;
      bottom: -16px;
      left: -8px;
      /*font-size: 14px;*/
    }

    &__image {
      cursor: pointer;
      transition: transform 0.1s ease-out;

      &:hover {
        transform: scale(1.1);
      }
    }

    &_opacity05 {
      opacity: 0.5;
      cursor: default;
    }
  }

  .alert {
    padding: 20px;
    background-color: #F6F1EF;
    color: #67573E;
    margin: 30px 10px 20px;
  }

  .closebtn {
    margin-left: 15px;
    color: #67573E;
    font-weight: bold;
    float: right;
    font-size: 22px;
    line-height: 20px;
    cursor: pointer;
    transition: 0.3s;
  }

  .closebtn:hover {
    color: black;
  }
</style>
