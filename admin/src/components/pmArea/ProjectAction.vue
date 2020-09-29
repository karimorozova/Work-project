<template lang="pug">
  .project-action
    .project-action__preview(v-if="isEditAndSend")
      Preview(@closePreview="closePreview" :templates="templatesWysiwyg" :message="previewMessage" @send="sendMessage")

    .project-action__title
      .project-action__title-text Project Action:
      .project-action__title-button(@click="refreshProject")

    .project-action__drop-menu
      SelectSingle(
        :selectedOption="selectedAction"
        :options="filteredActions"
        placeholder="Select Action"
        @chooseOption="setAction"
      )

    .project-action__confirm(v-if="isAction('ReOpen') && project.status !== 'Rejected'")
      .project-action__button
        Button(:value="'Confirm'" @clicked="approveAction = true")

    .project-action__confirm(v-if="isAction('ReOpen') && project.status === 'Rejected'")
      .project-action__button
        Button(:value="'Confirm'" @clicked="approveActionToDraft = true")

    .project-action__confirm(v-if="isAction('Accept/Reject Quote')")
      .project-action__button
        Button(:value="'Accept'" @clicked="makeApprovedAction")
      .project-action__button(v-if="isAlternativeAction")
        Button(:value="'Reject'" @clicked="makeAlterAction")

    .project-action__setting(v-if="isAction('Send a Quote')")
      .project-action__confirm
        Button(:value="'Edit & Send'" @clicked="getSendQuoteMessage")
    .project-action__setting(v-if="isAction('Deliver')")
      .project-action__confirm
        Button(:value="'Edit & Send'" @clicked="getDeliveryMessage")
    .project-action__setting(v-if="isAction('Send Project Details')")
      .project-action__confirm
        Button(:value="'Edit & Send'" @clicked="getProjectDetailsMessage")

    .project-action__setting(v-if="isAction('Cancel')")
      .project-action__drop-menu
        SelectSingle(
          :selectedOption="selectedReason"
          :options="reasons"
          placeholder="Select Reason"
          @chooseOption="setReason"
        )
      span More Information:
      textarea(type="text" v-model="moreInformation" rows="4" class="project-action__text-input")
      .project-action__setting(v-if="project.status === 'In progress'")
        .project-action__payment
          .project-action__payment-span
            span Partial Payment
          .project-action__checkbox
            label.switch
              input(type='checkbox' :checked="isPay" v-model="isPay")
              span.slider.round
      .project-action__confirm
        Button(:value="'Confirm'" @clicked="getCancelMessage")

    .project-action__title#sub-line
    .drops
      .drops__item
        .drops__label Account Manager:
          img.drops__assigned-icon(v-if="!project.isAssigned && project.requestId" src="../../assets/images/Other/assigned_status.png")
        .drops__menu
          SelectSingle(
            :options="accManagers"
            :selectedOption="selectedAccManager"
            @chooseOption="(e) => setManager(e, 'accountManager')")
      .drops__item
        .drops__label Project Manager:
          img.drops__assigned-icon(v-if="project.isAssigned && project.requestId" src="../../assets/images/Other/assigned_status.png")
        .drops__menu
          SelectSingle(
            :options="projManagers"
            :selectedOption="selectedProjManager"
            @chooseOption="(e) => setManager(e, 'projectManager')")
      slot
    .approve-action(v-if="approveAction")
      ApproveModal(
        text="Are you sure you want to re-open the project?"
        approveValue="Yes"
        notApproveValue="No"
        @approve="approveModal"
        @close="closeModal"
        @notApprove="closeModal"
      )
    .approve-action(v-if="approveActionToDraft")
      ApproveModal(
        text="Are you sure you want to re-open the project?"
        approveValue="Yes"
        notApproveValue="No"
        @approve="approveModalToDraft"
        @close="closeModal"
        @notApprove="closeModal"
      )

</template>

<script>
	import Preview from "../vendors/WYSIWYG";
	import SelectSingle from "../SelectSingle";
	import Button from "../Button";
	import { mapActions } from "vuex";
	import ApproveModal from "../ApproveModal";

	export default {
		props: {
			project: {
				type: Object
			}
		},
		data() {
			return {
				previewMessage: "",
				selectedAction: "",
				selectedReason: "",
				moreInformation: "",
				reasons: [],
				managers: [],
				templatesWysiwyg: [
					{
						title: "tempate",
						message: "<p>test message</p>"
					}
				],
				actions: ["Cancel"],
				approveButtonValue: "Confirm",
				alternativeButtonValue: "Reject",
				isAlternativeAction: false,
				isEditAndSend: false,
				isPay: false,
				approveAction: false,
				approveActionToDraft: false,
			};
		},
		methods: {
			closeModal() {
				this.approveAction = false;
				this.approveActionToDraft = false;
			},
			approveModal() {
				this.reOpenProject();
				this.approveAction = false;
				this.selectedAction = '';
			},
			approveModalToDraft() {
				this.reOpenProjectToDraft();
				this.approveActionToDraft = false;
				this.selectedAction = '';
			},
			refreshProject() {
				this.$emit("refreshProject");
			},
			closePreview() {
				this.isEditAndSend = false;
			},
			openPreview() {
				this.isEditAndSend = true;
			},
			async getCancelMessage() {
				if(this.project.status === "In progress" || this.project.status === "Draft") {
					await this.setStatus("Cancelled", this.selectedReason);
				}
				try {
					const template = await this.$http.post(
							"/pm-manage/making-cancel-message",
							{ ...this.project, reason: this.selectedReason, isPay: this.isPay }
					);
					this.previewMessage = template.body.message;
					this.openPreview();
				} catch (err) {
					this.alertToggle({ message: err.message, isShow: true, type: "error" });
				}
			},
			async getDeliveryMessage() {
				try {
					const template = await this.$http.post(
							"/pm-manage/making-delivery-message",
							{ ...this.project }
					);
					this.previewMessage = template.body.message;
					this.openPreview();
				} catch (err) {
					this.alertToggle({ message: err.message, isShow: true, type: "error" });
				}
			},
			async getSendQuoteMessage() {
				try {
					const template = await this.$http.get(
							`/pm-manage/quote-message?projectId=${ this.project._id }`
					);
					this.previewMessage = template.body.message;
					this.openPreview();
				} catch (err) {
					this.alertToggle({ message: err.message, isShow: true, type: "error" });
				}
			},
			async getProjectDetailsMessage() {
				try {
					const template = await this.$http.get(
							`/pm-manage/project-details?projectId=${ this.project._id }`
					);
					this.previewMessage = template.body.message;
					this.openPreview();
				} catch (err) {
					this.alertToggle({ message: err.message, isShow: true, type: "error" });
				}
			},
			async sendMessage(message) {
				try {
					this.makeApprovedAction(message);
				} catch (err) {
					this.alertToggle({ message: err.message, isShow: true, type: "error" });
				}
				this.closePreview();
			},
			isAction(action) {
				return this.selectedAction === action;
			},
			setDefaults() {
				this.selectedAction = "";
				this.approveButtonValue = "Confirm";
				this.isAlternativeAction = false;
			},
			setReason({ option }) {
				this.selectedReason = option;
			},
			setAction({ option }) {
				this.selectedAction = option;
				this.isAlternativeAction = false;
				if(this.selectedAction === "Accept/Reject Quote") {
					this.approveButtonValue = "Accept";
					(this.alternativeButtonValue = "Reject"),
							(this.isAlternativeAction = true);
				}
			},
			async makeApprovedAction(message) {
				try {
					switch (this.selectedAction) {
						case "Send a Quote":
							await this.clientQuote(message);
							break;
						case "Send Project Details":
							await this.projectDetails(message);
							break;
						case "Deliver":
							await this.deliverProject(message);
							break;
						case "Accept/Reject Quote":
							await this.acceptQuote();
							break;
						case "Cancel":
							await this.cancelProjectMessage(message);
							break;
					}
				} catch (err) {
					this.alertToggle({
						message: "Internal server error. Cannot execute chosen action.",
						isShow: true,
						type: "error"
					});
				} finally {
					this.setDefaults();
				}
			},
      async reOpenProjectToDraft(){
	      await this.setStatus('Draft', "");
      },
			async reOpenProject() {
				let status;
				if(this.project.status === "Cancelled" || this.project.status === "Cancelled Halfway") {
					status = "fromCancelled"
				} else {
					status = "fromClosed"
				}
				await this.setStatus(status, "");
			},
			async clientQuote(message) {
				try {
					await this.sendClientQuote({ message });
					this.alertToggle({
						message: "Details sent",
						isShow: true,
						type: "success"
					});
				} catch (err) {
					this.alertToggle({
						message: err.message,
						isShow: true,
						type: "error"
					});
				}
			},
			async projectDetails(message) {
				try {
					await this.sendProjectDetails({ message });
					this.alertToggle({
						message: "Details sent",
						isShow: true,
						type: "success"
					});
				} catch (err) {
					this.alertToggle({
						message: err.message,
						isShow: true,
						type: "error"
					});
				}
			},
			async makeAlterAction() {
				try {
					switch (this.selectedAction) {
						case "Accept/Reject Quote":
							await this.rejectQuote();
							break;
					}
				} catch (err) {
					this.alertToggle({
						message: "Internal server error. Cannot execute chosen action.",
						isShow: true,
						type: "error"
					});
				} finally {
					this.setDefaults();
				}
			},
			async cancelProjectMessage(message) {
				if(
						this.project.status === "Delivered" ||
						this.project.status === "Closed"
				)
					return;
				try {
					await this.sendCancelProjectMessage({ message });
					this.alertToggle({
						message: "Letter sent successfully",
						isShow: true,
						type: "success"
					});
				} catch (err) {
					this.alertToggle({ message: err.message, isShow: true, type: "error" });
				}
			},
			async setStatus(status, reason) {
				try {
					await this.setProjectStatus({
						status,
						reason
					});
					this.alertToggle({
						message: "Project's status changed",
						isShow: true,
						type: "success"
					});
				} catch (err) {
					this.alertToggle({ message: err.message, isShow: true, type: "error" });
				}
			},
			async acceptQuote() {
				const status = this.project.isStartAccepted ? "Started" : "Approved";
				try {
					await this.setStatus(status);
				} catch (err) {
					this.alertToggle({ message: err.message, isShow: true, type: "error" });
				}
			},
			async rejectQuote() {
				try {
					await this.setStatus("Rejected");
				} catch (err) {
					this.alertToggle({ message: err.message, isShow: true, type: "error" });
				}
			},
			async deliverProject(message) {
				try {
					await this.deliverProjectToClient({
						id: this.project._id,
						message: message
					});
				} catch (err) {
					this.alertToggle({ message: err.message, isShow: true, type: "error" });
				}
			},
			async setManager({ option }, prop) {
				const manager = this.managers.find(
						item => `${ item.firstName } ${ item.lastName }` === option
				);
				if(manager._id === this.project[prop]._id) return;
				try {
					if(this.type === "project") {
						await this.setProjectValue({
							id: this.project._id,
							prop,
							value: manager
						});
					} else {
					}
				} catch (err) {
				}
			},
			async getManagers() {
				try {
					const result = await this.$http.get("/users");
					this.managers = result.data;
				} catch (err) {
					this.alertToggle({
						message: "Error on getting managers",
						isShow: true,
						type: "error"
					});
				}
			},
			...mapActions({
				setRequestValue: "setRequestValue",
				setProjectValue: "setProjectValue",
				alertToggle: "alertToggle",
				storeProject: "setCurrentProject",
				setProjectStatus: "setProjectStatus",
				sendClientQuote: "sendClientQuote",
				sendProjectDetails: "sendProjectDetails",
				deliverProjectToClient: "deliverProjectToClient",
				sendCancelProjectMessage: "sendCancelProjectMessage"
			})
		},
		computed: {
			type() {
				return this.project.projectId ? "project" : "request";
			},
			accManagers() {
				let result = [];
				if(this.managers.length) {
					result = this.managers.filter(
							item => item.group.name === "Account Managers"
					);
					result = result.map(item => `${ item.firstName } ${ item.lastName }`);
				}
				return result;
			},
			projManagers() {
				let result = [];
				if(this.managers.length) {
					result = this.managers.filter(
							item => item.group.name === "Project Managers"
					);
					result = result.map(item => `${ item.firstName } ${ item.lastName }`);
				}
				return result;
			},
			selectedAccManager() {
				return this.project.accountManager
						? this.project.accountManager.firstName +
						" " +
						this.project.accountManager.lastName
						: "";
			},
			selectedProjManager() {
				return this.project.projectManager
						? this.project.projectManager.firstName +
						" " +
						this.project.projectManager.lastName
						: "";
			},
			filteredActions() {
				let result = this.actions;
				const nonStartedStatuses = [
					"Draft",
					"Quote sent",
					"Requested",
					"Cancelled"
				];
				if(this.project.status === "Approved") {
					// result = ["Send a Quote", "Cancel"];
					result = ["Cancel"];
				}
				if(
						this.project.finance.Price.receivables &&
						nonStartedStatuses.indexOf(this.project.status) !== -1
				) {
					result = ["Send a Quote", "Accept/Reject Quote", "Cancel"];
				}
				if(
						this.project.status === "Started" ||
						this.project.status === "In progress"
				) {
					result = ["Send Project Details", "Cancel"];
				}
				if(this.project.status === "Ready for Delivery") {
					result = ["Deliver", "Cancel"];
				}
				if(this.project.status === "Closed") {
					result = ["ReOpen", "Deliver"];
				}
				if(this.project.status === "Rejected") {
					result = ["ReOpen", "Cancel"]
				}
				if(this.project.status === "Cancelled" || this.project.status === "Cancelled Halfway") {
					result = ['ReOpen']
				}
				return result;
			}
		},
		components: {
			ApproveModal,
			SelectSingle,
			Preview,
			Button
		},
		async created() {
			const reasons = await this.$http.get("/api/reasons");
			for (let key in reasons.data) this.reasons.push(reasons.data[key].reason);
			this.getManagers();
		}
	};
</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors.scss";

  .approve-action {
    position: absolute;
    margin-top: 50px;
  }

  .project-action {
    padding: 20px;
    box-shadow: 0 0 10px #67573e9d;
    box-sizing: border-box;
    width: 390px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;

    &__setting {
      display: flex;
      flex-direction: column;
    }

    &__payment {
      margin-bottom: 10px;

      &-span {
        vertical-align: sub;
        display: inline-block;
        font-size: 18px;
      }
    }

    &__text-input {
      width: 191px;
      margin-top: 10px;
      border-radius: 10px;
      border: 1px solid #68573e;
      padding: 5px;
      color: #68573e;
      resize: none;
      outline: none;
      box-sizing: border-box;
      margin-bottom: 10px;
    }

    &__title {
      padding-bottom: 5px;
      font-size: 22px;
      border-bottom: 1px solid $brown-border;
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      &-button {
        background-image: url("../../assets/images/refresh-icon.png");
        width: 24px;
        height: 20px;
        cursor: pointer;
      }
    }

    &__drop-menu {
      width: 191px;
      height: 28px;
      position: relative;
      margin-bottom: 20px;
    }

    &__confirm {
      display: flex;
    }

    &__button {
      :first-child {
        margin-right: 10px;
      }
    }

    &__checkbox {
      display: inline-flex;

      .switch {
        position: relative;
        display: inline-block;
        width: 60px;
        height: 28px;
        margin-left: 28px;

        input {
          opacity: 0;
          width: 0;
          height: 0;
        }
      }

      .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ebebe4;
        -webkit-transition: 0.4s;
        transition: 0.4s;

        &:before {
          position: absolute;
          content: "";
          height: 19px;
          width: 19px;
          left: 7px;
          bottom: 4px;
          background-color: #fff;
          transition: 0.4s;
        }
      }

      input {
        &:checked {
          + {
            .slider {
              background-color: #67573e;

              &:before {
                -webkit-transform: translateX(26px);
                -ms-transform: translateX(26px);
                transform: translateX(26px);
              }
            }
          }
        }
      }

      .slider.round {
        border-radius: 28px;

        &:before {
          border-radius: 50%;
        }
      }
    }

    .drops {
      width: 100%;
      position: relative;

      &__menu {
        position: relative;
        width: 190px;
        height: 30px;
      }

      &__item {
        @extend %item-style;
        width: 100%;
        justify-content: space-between;
      }

      &__text {
        font-size: 14px;
        font-weight: bolder;
      }

      &__label {
        position: relative;
        width: 160px;
      }

      &__assigned-icon {
        position: absolute;
        left: -18px;
        width: 15px;
      }
    }

    #sub-line {
      margin-top: 29px;
    }

    %item-style {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }
  }
</style>
