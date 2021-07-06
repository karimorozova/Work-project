<template lang="pug">
  .project-action

    .project-action__preview(v-if="isEditAndSendQuote")
      PreviewQuote(@closePreview="closePreview" :allMails="projectClientContacts" :message="previewMessage" @send="sendMessageQuotes")

    .project-action__preview(v-if="isEditAndSendCostQuote")
      PreviewQuote(@closePreview="closePreview" :allMails="projectClientContacts" :message="previewMessage" @send="sendMessageCostQuotes")

    .project-action__preview(v-if="isEditAndSend")
      Preview(@closePreview="closePreview" :templates="templatesWysiwyg" :message="previewMessage" @send="sendMessage")

    .project-action__title(:style="{'padding-bottom': '5px'}")
      .project-action__title-text Project Action

    .project-action__drop-menuSend
      .project-details Project Details:
      .project-action__dropBody
        SelectSingle(
          :selectedOption="selectedAction"
          :options="filteredActions"
          placeholder="Select Action"
          @chooseOption="setAction"
        )
    .project-action__confirm(v-if="isAction('Delete') && project.status !== 'Closed'")
      .project-action__button
        Button(:value="'Confirm'" @clicked="makeApprovedAction" :isDisabled="!canDelete")

    .project-action__confirm(v-if="isAction('ReOpen') && project.status !== 'Rejected'")
      .project-action__button
        Button(:value="'Confirm'" @clicked="approveAction = true")

    .project-action__confirm(v-if="isAction('ReOpen') && project.status === 'Rejected'")
      .project-action__button
        Button(:value="'Confirm'" @clicked="approveActionToDraft = true")

    .project-action__confirm(v-if="isAction('Close Project')")
      .project-action__button
        Button(:value="'Confirm'" @clicked="makeApprovedAction")

    .project-action__confirm(v-if="isAction('Accept/Reject Quote')")
      .project-action__button
        Button(:value="'Accept'" @clicked="makeApprovedAction")
      .project-action__button(v-if="isAlternativeAction")
        Button(:value="'Reject'" @clicked="makeAlterAction")

    .project-action__setting(v-if="isAction('Send a Quote')")
      .project-action__confirm
        Button(:value="'Edit & Send'" @clicked="getSendQuoteMessage")

    .project-action__setting(v-if="isAction('Cost Quote')")
      .project-action__confirm
        Button(:value="'Edit & Send'" @clicked="getSendCostQuoteMessage")

    //.project-action__setting(v-if="isAction('Deliver')")
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
        .drops__menu(v-if="!isProjectFinished")
          SelectSingle(
            :options="accManagers"
            :selectedOption="selectedAccManager"
            @chooseOption="(e) => setManager(e, 'accountManager')"
          )
        .drops__menuTitle(v-else) {{ selectedAccManager }}
      .drops__item
        .drops__label Project Manager:
        .drops__menu(v-if="!isProjectFinished")
          SelectSingle(
            :options="projManagers"
            :selectedOption="selectedProjManager"
            @chooseOption="(e) => setManager(e, 'projectManager')"
          )
        .drops__menuTitle(v-else) {{ selectedProjManager }}
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
	import Preview from '../vendors/WYSIWYG';
	import SelectSingle from '../SelectSingle';
	import SelectMulti from '../SelectMulti';
	import Button from '../Button';
	import { mapGetters, mapActions } from 'vuex';
	import ApproveModal from '../ApproveModal';
	import PreviewQuote from "./WYSIWYGMultiMails";
	import { deleteProject } from "../../vuex/pmarea/actions"

	export default {
		props: {
			project: {
				type: Object
			}
		},
		data() {
			return {
				previewMessage: '',
				selectedAction: '',
				selectedReason: '',
				moreInformation: '',
				reasons: [],
				managers: [],
				templatesWysiwyg: [
					{
						title: 'tempate',
						message: '<p>test message</p>'
					}
				],
				actions: ['Cancel'],
				approveButtonValue: 'Confirm',
				alternativeButtonValue: 'Reject',
				isAlternativeAction: false,
				isEditAndSend: false,
				isEditAndSendQuote: false,
				isPay: false,
				approveAction: false,
				approveActionToDraft: false,
				isEditAndSendCostQuote: false,
			};
		},
		methods: {
			...mapActions({
				setRequestValue: 'setRequestValue',
				setProjectValue: 'setProjectValue',
				alertToggle: 'alertToggle',
				storeProject: 'setCurrentProject',
				setProjectStatus: 'setProjectStatus',
				sendClientQuote: 'sendClientQuote',
				sendProjectDetails: 'sendProjectDetails',
				deleteProject: 'deleteProject',
				// deliverProjectToClient: 'deliverProjectToClient',
				sendCancelProjectMessage: 'sendCancelProjectMessage',
				sendClientCostQuote: 'sendClientCostQuote',
			}),
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
			closePreview() {
				this.isEditAndSend = false;
				this.isEditAndSendQuote = false;
				this.isEditAndSendCostQuote = false;
				this.previewMessage = "";
				this.selectedAction = "";
				this.selectedReason = "";
			},
			openPreview() {
				this.isEditAndSend = true;
			},
			openPreviewQuote() {
				this.isEditAndSendQuote = true;
			},
			openPreviewCostQuote() {
				this.isEditAndSendCostQuote = true;
			},
			getCancelStatus() {
				if(
						this.project.status === 'Draft' ||
						this.project.status === "Quote sent" ||
						this.project.status === "Approved" ||
						this.project.status === "Rejected" ||
						this.project.status === "Cost Quote" ||
						this.project.status === "Requested"
				) {
					return "Cancelled"
				} else {
					return "Cancelled Halfway"
				}
			},
			async getCancelMessage() {
				let cancelStatus = this.getCancelStatus();
				try {
					const template = await this.$http.post("/pm-manage/making-cancel-message", { ...this.project, cancelStatus, reason: this.selectedReason, isPay: this.isPay });
					this.previewMessage = template.data.message;
					this.openPreview();
				} catch (err) {
					this.alertToggle({ message: err.message, isShow: true, type: "error" });
				}
			},
			// async getDeliveryMessage() {
			// 	try {
			// 		const template = await this.$http.post(
			// 				"/pm-manage/making-delivery-message",
			// 				{ ...this.project }
			// 		);
			// 		this.previewMessage = template.body.message;
			// 		this.openPreview();
			// 	} catch (err) {
			// 		this.alertToggle({ message: err.message, isShow: true, type: "error" });
			// 	}
			// },
			async getSendCostQuoteMessage() {
				try {
					const template = await this.$http.get(`/pm-manage/quote-cost-message?projectId=${ this.project._id }`);
					this.previewMessage = template.data.message;
					this.openPreviewCostQuote();
				} catch (err) {
					this.alertToggle({ message: err.message, isShow: true, type: "error" });
				}
			},
			async getSendQuoteMessage() {
				try {
					const template = await this.$http.get(`/pm-manage/quote-message?projectId=${ this.project._id }`);
					this.previewMessage = template.data.message;
					this.openPreviewQuote();
				} catch (err) {
					this.alertToggle({ message: err.message, isShow: true, type: "error" });
				}
			},
			async getProjectDetailsMessage() {
				try {
					const template = await this.$http.get(`/pm-manage/project-details?projectId=${ this.project._id }`);
					this.previewMessage = template.data.message;
					this.openPreview();
				} catch (err) {
					this.alertToggle({ message: err.message, isShow: true, type: "error" });
				}
			},
			async sendMessageCostQuotes({ message, arrayOfEmails }) {
				try {
					await this.sendClientCostQuote({ message, arrayOfEmails });
					this.alertToggle({ message: "Cost Quote sent", isShow: true, type: "success" });
				} catch (err) {
					this.alertToggle({ message: err.message, isShow: true, type: "error" });
				} finally {
					this.setDefaults();
					this.closePreview();
				}
			},
			async sendMessageQuotes({ message, arrayOfEmails }) {
				try {
					await this.clientQuote(message, arrayOfEmails);
					this.alertToggle({message: "Quote sent", isShow: true, type: "success"});
				} catch (err) {
					this.alertToggle({message: err.message, isShow: true, type: "error"});
				} finally {
					this.setDefaults();
					this.closePreview();
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
					this.alternativeButtonValue = "Reject";
					this.isAlternativeAction = true;
				}
			},
			async makeApprovedAction(message) {
				try {
					switch (this.selectedAction) {
						case "Send Project Details":
							await this.projectDetails(message);
							break;
						case "Close Project":
							const updatedProject = await this.$http.post('/pm-manage/close-project', {projectId: this.project._id})
							await this.storeProject(updatedProject.data)
							break
							// case "Deliver":
							// 	await this.deliverProject(message);
							// 	break;
						case "Accept/Reject Quote":
							await this.acceptQuote();
							break;
						case "Cancel":
							await this.cancelProjectMessage(message);
							break;
						case "Delete":
							await this.deleteProjectAction();
							break;
					}
				} catch (err) {
					this.alertToggle({ message: "Internal server error. Cannot execute chosen action.", isShow: true, type: "error" });
				} finally {
					this.setDefaults();
				}
			},
			async deleteProjectAction() {
				try {
					await this.deleteProject({ projectId: this.project._id })
					this.$router.back()
					this.alertToggle({message: "Project deleted!", isShow: true, type: "success"});
				}catch (err) {
					this.alertToggle({message: "Project not deleted!", isShow: true, type: "error"});
				}
			},
			async reOpenProjectToDraft() {
				await this.setStatus('Draft', "");
			},
			async reOpenProject() {
				let status;
				if(this.project.status === 'Cancelled' || this.project.status === 'Cancelled Halfway') {
					status = 'fromCancelled';
				} else {
					status = 'fromClosed';
				}
				await this.setStatus(status, '');
			},
			async clientQuote(message, arrayOfEmails) {
				try {
					await this.sendClientQuote({ message, arrayOfEmails });
					this.alertToggle({
						message: 'Details sent',
						isShow: true,
						type: 'success'
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
					this.alertToggle({message: "Details sent", isShow: true, type: "success"});
				} catch (err) {
					this.alertToggle({message: err.message, isShow: true, type: "error"});
				}
			},
			async makeAlterAction() {
				try {
					if(this.selectedAction === "Accept/Reject Quote") {
						await this.rejectQuote();
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
				let cancelStatus = this.getCancelStatus();
				if(this.project.status === "Delivered" || this.project.status === "Closed")
					return;
				try {
					await this.setProjectStatus({status: cancelStatus, reason: this.selectedReason || "",});
					await this.sendCancelProjectMessage({ message });
					this.alertToggle({message: "Letter sent successfully", isShow: true, type: "success"});
				} catch (err) {
					this.alertToggle({ message: err.message, isShow: true, type: "error" });
				} finally {
					this.selectedReason = "";
				}
			},
			async setStatus(status, reason) {
				try {
					await this.setProjectStatus({status, reason});
					this.alertToggle({message: "Project's status changed", isShow: true, type: "success"});
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
			// async deliverProject(message) {
			// 	try {
			// 		await this.deliverProjectToClient({
			// 			id: this.project._id,
			// 			message: message
			// 		});
			// 	} catch (err) {
			// 		this.alertToggle({ message: err.message, isShow: true, type: "error" });
			// 	}
			// },
			async setManager({ option }, prop) {
				const manager = this.managers.find(item => `${ item.firstName } ${ item.lastName }` === option);
				if(manager._id === this.project[prop]._id) return;
				if(this.type === "project") {
					await this.setProjectValue({id: this.project._id, prop, value: manager});
				}
			},
			async getManagers() {
				try {
					const result = await this.$http.get('/users');
					this.managers = result.data;
				} catch (err) {
					this.alertToggle({message: 'Error on getting managers', isShow: true, type: 'error'});
				}
			},
			isAllDeliveredTasks(tasksDR2){
				let statuses = []
				if(tasksDR2.hasOwnProperty('singleLang')){
					const { singleLang } = tasksDR2
					for (const {status} of singleLang) statuses.push(status)
				}
				if(tasksDR2.hasOwnProperty('multiLang')){
					const { multiLang } = tasksDR2
					for (const {status} of multiLang) statuses.push(status)
				}
				return statuses.every(item => item === 'Delivered')
			}
		},
		computed: {
			...mapGetters({
				currentClient: 'getCurrentClient',
				user: 'getUser',
			}),
			isProjectFinished(){
				const { status } = this.project
				return status === 'Closed' || status === 'Cancelled Halfway' || status === 'Cancelled'
			},
			canDelete(){
				return status !== 'Closed'
						&& (this.project.projectManager._id === this.user._id || this.user.group.name === 'Administrators'  || this.user.group.name === 'Developers' )
			},
			projectClientContacts() {
				return this.project.clientContacts.map(({ email }) => email)
			},
			type() {
				return this.project.projectId ? 'project' : 'request';
			},
			accManagers() {
				let result = [];
				if(this.managers.length) {
					result = this.managers.filter(item => item.group.name === 'Account Managers');
					result = result.map(item => `${ item.firstName } ${ item.lastName }`);
				}
				return result;
			},
			projManagers() {
				let result = [];
				if(this.managers.length) {
					result = this.managers.filter(item => item.group.name === "Project Managers");
					result = result.map(item => `${ item.firstName } ${ item.lastName }`);
				}
				return result;
			},
			selectedAccManager() {
				return this.project.accountManager ? this.project.accountManager.firstName + " " + this.project.accountManager.lastName : "";
			},
			selectedProjManager() {
				return this.project.projectManager ? this.project.projectManager.firstName + " " + this.project.projectManager.lastName : "";
			},
			filteredActions() {
				let result = this.actions;
				const nonStartedStatuses = [
					"Draft",
					"Cost Quote",
					"Quote sent",
					"Requested",
					"Cancelled"
				];
				if(this.project.status === "Approved") {
					result = ["Cancel", 'Delete'];
				}
				if(this.project.finance.Price.receivables && nonStartedStatuses.indexOf(this.project.status) !== -1) {
					result = ["Send a Quote", "Cost Quote", "Accept/Reject Quote", "Cancel", 'Delete'];
				}
				if(this.project.status === 'Started' || this.project.status === 'In progress') {
					const { tasks, tasksDR2 } = this.project
					const isAllTasksCompleted =  tasks.filter(({status}) => status !== 'Cancelled' && status !== 'Cancelled Halfway').every(({status}) => status === 'Completed')

					if(isAllTasksCompleted && this.isAllDeliveredTasks(tasksDR2)){
						result = ["Close Project"];
					}else{
						result = ["Send Project Details", "Cancel"];
					}
				}
				if(this.project.status === 'Closed') {
					result = ['ReOpen'];
				}
				if(this.project.status === 'Rejected') {
					result = ['ReOpen', 'Cancel', 'Delete'];
				}
				if(this.project.status === 'Cancelled' || this.project.status === 'Cancelled Halfway') {
					result = ['ReOpen' , 'Delete'];
				}
				return result;
			},
		},
		components: {
			PreviewQuote,
			ApproveModal,
			SelectSingle,
			SelectMulti,
			Preview,
			Button
		},
		async created() {
			const reasons = await this.$http.get("/api/reasons");
			for (let key in reasons.data) this.reasons.push(reasons.data[key].reason);
			await this.getManagers();
		}
	};
</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors.scss";

  .project-action {
    padding: 20px;
    box-shadow: rgba(81, 68, 48, 0.3) 0px 1px 2px 0px, rgba(81, 68, 48, 0.15) 0px 1px 3px 1px;
    box-sizing: border-box;
    width: 400px;
    margin-top: 40px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    background: white;
    border-radius: 4px;

    &__dropBody{
      position: relative;
      width: 220px;
      height: 32px;
      margin-bottom: 20px;
    }

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
      width: 220px;
      margin-top: 5px;
      border-radius: 4px;
      border: 1px solid $border;
      padding: 5px;
      color: $text;
      resize: none;
      outline: none;
      box-sizing: border-box;
      margin-bottom: 20px;
    }

    &__title {
      font-size: 21px;
      font-family: Myriad600;
      border-bottom: 1px solid $border;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    &__drop-menu {
      width: 220px;
      height: 32px;
      position: relative;
      margin-bottom: 20px;
    }

    &__confirm {
      display: flex;
      margin-bottom: 20px;
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
              background-color: #66563d;

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
        width: 220px;
        height: 32px;
      }
      &__menuTitle{
        width: 220px;
        height: 32px;
        display: flex;
        align-items: center;
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

    %item-style {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }
  }

  .approve-action {
    position: absolute;
    margin-top: 50px;
  }

  .project-details{
    margin-bottom: 4px;
  }
</style>
