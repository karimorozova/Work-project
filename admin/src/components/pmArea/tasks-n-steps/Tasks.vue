<template lang="pug">
  .tasks
    .tasks__preview(v-if="isEditAndSend")
      Preview(@closePreview="closePreview" :message="previewMessage" @send="sendMessage")
    .tasks__preview(v-if="isEditAndSendQuote")
      PreviewQuote( @closePreview="closePreview"  :allMails="projectClientContacts" :message="previewMessageQuote" @send="sendMessageQuote")
    .tasks__action
      .tasks__title Task Action
      .tasks__drop-menu
        SelectSingle(
          :selectedOption="selectedAction"
          :options="availableActionsOptions"
          placeholder="Select Action"
          @chooseOption="setAction"
        )
    .tasks__table
      .tasks__tabs
        Tabs(
          :tabs="tabs"
          selectedTab="Tasks"
          @setTab="showTab"
        )
      DataTable(
        :fields="fields"
        :tableData="allTasks"
        bodyRowClass="steps-table-row"
        :bodyClass="['steps-table-body', {'tbody_visible-overflow': allTasks.length < 10}]"
        :tableheadRowClass="allTasks.length < 10 ? 'tbody_visible-overflow' : ''"
        @onRowClicked="onRowClicked"
        :bodyCellClass="'steps-cell'"
        :headCellClass="'padding-with-check-box'"
      )
        template(slot="headerCheck" slot-scope="{ field }")
          CheckBox(:isChecked="isAllSelected" :isWhite="true" @check="(e)=>toggleAll(e, true)" @uncheck="(e)=>toggleAll(e, false)" customClass="tasks-n-steps")
        template(slot="headerTaskId" slot-scope="{ field }")
          span.tasks__label {{ field.label }}
        template(slot="headerLanguage" slot-scope="{ field }")
          span.tasks__label {{ field.label }}
        template(slot="headerStart" slot-scope="{ field }")
          span.tasks__label {{ field.label }}
        template(slot="headerDeadline" slot-scope="{ field }")
          span.tasks__label {{ field.label }}
        template(slot="headerProgress" slot-scope="{ field }")
          span.tasks__label {{ field.label }}
        template(slot="headerStatus" slot-scope="{ field }")
          span.tasks__label {{ field.label }}
        template(slot="headerReceivables" slot-scope="{ field }")
          span.tasks__label {{ field.label }}
        template(slot="headerPayables" slot-scope="{ field }")
          span.tasks__label {{ field.label }}
        template(slot="headerMargin" slot-scope="{ field }")
          span.tasks__label {{ field.label }}
        template(slot="headerDelivery" slot-scope="{ field }")
          span.tasks__label {{ field.label }}
        template(slot="check" slot-scope="{ row, index }")
          CheckBox(:isChecked="row.isChecked" @check="(e)=>toggleCheck(e, index, true)" @uncheck="(e)=>toggleCheck(e, index, false)" customClass="tasks-n-steps")
        template(slot="taskId" slot-scope="{ row }")
          span.tasks__task-data {{ row.taskId }}
        template(slot="language" slot-scope="{ row }")
          span.tasks__task-data {{ getPair(row) }}
        template(slot="start" slot-scope="{ row }")
          span.tasks__task-data {{ formatDate(row.start) }}
        template(slot="deadline" slot-scope="{ row }")
          span.tasks__task-data {{ formatDate(row.deadline) }}
        template(slot="progress" slot-scope="{ row, index }")
          ProgressLine(:progress="progress(row, index)")
        template(slot="status" slot-scope="{ row }")
          .tasks__task-status {{ row.status | stepsAndTasksStatusFilter }}
            .tasks__timestamp(v-if="row.isDelivered && row.status === 'Delivered'")
              img.tasks__time-icon(src="../../../assets/images/time_icon.png")
              .tasks__time-data {{ getDeliveredTime(row.deliveredTime) }}
        template(slot="receivables" slot-scope="{ row }")
          span.tasks__money(v-if="row.finance.Price.receivables || row.finance.Price.receivables === 0")
            span(v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
          span.tasks__task-data(v-if="row.finance.Price.receivables !== '' && row.status !== 'Cancelled Halfway'") {{ (row.finance.Price.receivables).toFixed(2) }}
          span.tasks__task-data(v-if="row.finance.Price.halfReceivables && row.status === 'Cancelled Halfway'") {{ (row.finance.Price.halfReceivables).toFixed(2) }}
        template(slot="payables" slot-scope="{ row }")
          span.tasks__money(v-if="row.finance.Price.payables || row.finance.Price.payables === 0")
            span(v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
          span.tasks__task-data(v-if="row.finance.Price.payables !== '' && row.status !== 'Cancelled Halfway'") {{ (row.finance.Price.payables).toFixed(2) }}
          span.tasks__task-data(v-if="row.finance.Price.halfPayables && row.status === 'Cancelled Halfway'") {{ (row.finance.Price.halfPayables).toFixed(2) }}
        template(slot="margin" slot-scope="{ row }")
          span.tasks__money(v-if="marginCalc(row.finance.Price)")
            span(v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
          span.tasks__task-data(v-if="marginCalc(row.finance.Price)") {{ marginCalc(row.finance.Price) }}
        template(slot="delivery" slot-scope="{ row }")
          img.tasks__delivery-image(v-if="row.status==='Ready for Delivery' || row.status==='Delivered'" src="../../../assets/images/download-big-b.png" @click="downloadFiles(row)")
          img.tasks__delivery-image(v-if="row.status.indexOf('Pending Approval') !== -1" src="../../../assets/images/delivery-review-icon.png" @click="reviewForDelivery(row)")

    .tasks__approve-action(v-if="isApproveActionShow")
      ApproveModalPayment(
        :isCheckbox="isAppearCheckBox()"
        :text="modalTexts.main"
        :approveValue="modalTexts.approve"
        :notApproveValue="modalTexts.notApprove"
        @approve="approveAction"
        @notApprove="notApproveAction"
        @close="closeApproveModal"
        @returnData="getApproveModalData"

      )
    .tasks__review(v-if="isDeliveryReview")
      DeliveryReview(:project="currentProject" :user="user" @close="closeReview" :task="reviewTask" @updateTasks="updateReviewTask")
</template>

<script>
	import Preview from "../../vendors/WYSIWYG";
	import PreviewQuote from "../WYSIWYGMultiMails";
	import DataTable from "../../DataTable";
	import ProgressLine from "../../ProgressLine";
	import Tabs from "../../Tabs";
	import SelectSingle from "../../SelectSingle";
	import CheckBox from "@/components/CheckBox";
	import currencyIconDetected from "../../../mixins/currencyIconDetected";

	const ApproveModal = () => import("../../ApproveModal");
	const DeliveryReview = () => import("./DeliveryReview");
	import moment from "moment";
	import { mapGetters, mapActions } from 'vuex';
	import ApproveModalPayment from "../../ApproveModalPayment"

	export default {
		mixins: [currencyIconDetected],
		props: {
			allTasks: {
				type: Array
			},
			originallyUnits: {
				type: Array
			},
			originallySteps: {
				type: Array
			},
			originallyServices: {
				type: Array
			}
		},
		data() {
			return {
				fields: [
					{ label: "check", headerKey: "headerCheck", key: "check", width: "3%" },
					{ label: "Task ID", headerKey: "headerTaskId", key: "taskId", width: "17%" },
					{ label: "Language", headerKey: "headerLanguage", key: "language", width: "10%" },
					{ label: "Start", headerKey: "headerStart", key: "start", width: "9%" },
					{ label: "Deadline", headerKey: "headerDeadline", key: "deadline", width: "9%" },
					{ label: "Progress", headerKey: "headerProgress", key: "progress", width: "8%" },
					{ label: "Status", headerKey: "headerStatus", key: "status", width: "13%" },
					{ label: "Receivables", headerKey: "headerReceivables", key: "receivables", width: "9%" },
					{ label: "Payables", headerKey: "headerPayables", key: "payables", width: "8%" },
					{ label: "Margin", headerKey: "headerMargin", key: "margin", width: "8%" },
					{ label: "Delivery", headerKey: "headerDelivery", key: "delivery", width: "6%", cellClass: "tasks_centered" },
				],
				selectedAction: "",
				tabs: ['Tasks', 'Steps'],
				modalTexts: { main: "Are you sure?", approve: "Yes", notApprove: "No" },
				isApproveActionShow: false,
				isDeliveryReview: false,
				isEditAndSend: false,
				isEditAndSendQuote: false,
				previewMessage: "",
				previewMessageQuote: "",
				reviewTask: [],
				isPay: false,
				validCancelStatuses: ["Created", "Started", "Quote sent", "In progress", "Approved", "Rejected", "Pending Approval"],
				reason: "",
				// pickedTask: null,
			}
		},
		methods: {
			isAppearCheckBox() {
				return this.selectedAction === 'Cancel';
			},
			getTaskPrice(row, prop) {
				const value = row.finance.Price[prop];
				return value === 0 ? value : value.toFixed(2);
			},
			closePreview() {
				this.isEditAndSend = false;
				this.isEditAndSendQuote = false;
				this.selectedAction = "";
			},
			openPreview() {
				this.isEditAndSend = true;
			},
			openPreviewQuote() {
				this.isEditAndSendQuote = true;
			},
			getPair(task) {
				if(task.packageSize) {
					return `${ task.targetLanguage } / ${ task.packageSize }`;
				}
				return `${ task.sourceLanguage } >> ${ task.targetLanguage }`;
			},
			getDeliveredTime(date) {
				return date ? moment(date).format("YYYY-MM-DD, HH:mm Z") : "";
			},
			onRowClicked({ index }) {
				this.$emit("onRowClicked", { index: index })
			},
			async getSendQuoteMessage() {
				try {
					const template = await this.$http.post(
							`/pm-manage/task-quote-message`, {
								projectId: this.currentProject._id,
								tasks: this.allTasks.filter(item => item.isChecked && item.status === "Created").map(item => item.taskId)
							}
					);
					this.previewMessageQuote = template.body.message;
					this.openPreviewQuote();
				} catch (err) {
					this.alertToggle({ message: err.message, isShow: true, type: "error" });
				}
			},
			async setAction({ option }) {
				this.selectedAction = option;
				if(option === 'Delivery Review [1]' || option === 'Delivery Review [2]') {
					this.reviewForDelivery(...this.currentProject.tasks.filter(item => item.isChecked));
					this.isDeliveryReview = true;
				} else if(option === 'Send a Quote') {
					await this.getSendQuoteMessage();
				} else if(option === 'Cancel' || option === 'Deliver') {
					this.setModalTexts(option);
					this.isApproveActionShow = true;
				}
			},
			reviewForDelivery(task) {
				this.reviewTask = task;
				this.isDeliveryReview = true;
			},
			unCheckAllTasks() {
				const unchecked = this.allTasks.map(item => {
					item.isChecked = false;
					return item;
				});
				this.storeProject({ ...this.currentProject, tasks: unchecked });
			},
			updateReviewTask({ tasksIds }) {
				this.reviewTask = this.allTasks.filter(item => tasksIds.indexOf(item.taskId) !== -1);
			},
			setModalTexts(option) {
				this.modalTexts = { main: "Are you sure?", approve: "Yes", notApprove: "No" };
			},
			async approveAction() {
				const checkedTasks = this.allTasks.filter(item => item.isChecked);
				if(!checkedTasks.length) {
					return this.closeApproveModal();
				}
				await this.doTasksApproveaction(checkedTasks);
			},
			async doTasksApproveaction(checkedTasks) {
				try {
					switch (this.selectedAction) {
						case 'Cancel':
							await this.cancelTasks(checkedTasks);
							break;
            case 'Deliver':
							await this.deliverTasks( {tasks: checkedTasks, user:this.user} );
							break
					}
				} catch (err) {
					this.alertToggle({ message: "Server error / Cannot execute action", isShow: true, type: "error" });
				} finally {
					this.closeApproveModal();
					this.unCheckAllTasks();
				}
			},
			notApproveAction() {
				this.closeApproveModal();
				this.unCheckAllTasks();
			},
			async cancelTasks(tasks) {
				const filteredTasks = tasks.filter(item => this.validCancelStatuses.indexOf(item.status) !== -1);
				if(!filteredTasks.length) return;
				try {
					if(this.allTasks.length === tasks.length) {
						await this.setProjectStatus({ status: "Cancelled" });
					} else {
						const updatedProject = await this.$http.post("/pm-manage/cancel-tasks", { tasks: filteredTasks, projectId: this.currentProject._id });
						await this.storeProject(updatedProject.body);
						await this.messageTemplateFormation(filteredTasks);
					}
					this.alertToggle({ message: "Tasks cancelled", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Server error / Cannot cancel chosen tasks", isShow: true, type: "error" })
				}

			},
			async messageTemplateFormation(filteredTasks) {
				const tasksIds = filteredTasks.map(item => item.taskId);
				const cancelledHalfwayTasks = this.currentProject.tasks.filter(item => tasksIds.indexOf(item.taskId) !== -1 && item.status === 'Cancelled Halfway');
				if(cancelledHalfwayTasks.length) {
					try {
						const template = await this.$http.post("/pm-manage/making-tasks-cancel-message", {
							project: this.currentProject,
							tasks: cancelledHalfwayTasks,
							reason: this.reason,
							isPay: this.isPay
						});
						this.previewMessage = template.body.message;
						this.openPreview();
					} catch (err) {
						this.alertToggle({ message: "Cannot formation message", isShow: true, type: "error" })
					}
				}
			},
			async sendMessage(message) {
				try {
					await this.$http.post("/pm-manage/send-task-cancel-message", {
						id: this.currentProject._id,
						message: message
					});
					this.alertToggle({ message: "Message sent", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: err.message, isShow: true, type: "error" });
				}
				this.closePreview();
			},
			async sendMessageQuote({ message, arrayOfEmails }) {
				try {
					const result = await this.$http.post("/pm-manage/send-task-quote", {
						projectId: this.currentProject._id,
						message: message,
						arrayOfEmails: arrayOfEmails,
						tasksIds: this.allTasks.filter(item => item.isChecked && item.status === "Created").map(item => item.taskId)
					});
					this.$emit('updateTasks', result.data.tasks);
					this.alertToggle({ message: "Message sent", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: err.message, isShow: true, type: "error" });
				}
				this.closePreview();
			},
			async getApproveModalData(modalData) {
				try {
					this.reason = modalData.reason;
					this.isPay = modalData.isPay;
				} catch (err) {
					this.alertToggle({ message: err.message, isShow: true, type: "error" });
				}
			},
			showTab({ index }) {
				return !this.currentProject.steps.length || this.tabs[index] === 'Tasks' ? true
						: this.$emit('showTab', { tab: this.tabs[index] });

			},
			formatDate(date) {
				return date.split('T')[0].split('-').reverse().join('-');
			},
			marginCalc(finance) {
				if(finance.halfReceivables >= 0) {
					return (finance.halfReceivables - finance.halfPayables).toFixed(2);
				}
				return (finance.receivables - finance.payables).toFixed(2);
			},
			progress(task) {
				let progress = 0;
				const { _id: catId } = this.originallyUnits.find(({type}) => type === 'CAT Wordcount');
				const CATServices = this.originallyServices
            .filter(({ steps }) => steps.some(({ step : { calculationUnit } }) => calculationUnit.includes(catId)))
            .map(({ title }) => title);

				let taskSteps = this.currentProject.steps.filter(item => item.taskId === task.taskId);
				taskSteps = taskSteps.filter(item => !item.stepId.includes('Canceled'));
				if(CATServices.includes(task.service.title)) {
					const [firstStep, secondStep] = taskSteps;
					if(taskSteps.length === 2) {
						if(isObject(secondStep.progress) && isObject(firstStep.progress)) {
							const firstStepProgress = calculatePercentage(firstStep);
							const secondStepProgress = calculatePercentage(secondStep);
							progress = (firstStepProgress + secondStepProgress) / 2;
						}
					} else if(taskSteps.length === 1) {
						progress = calculatePercentage(firstStep);
					}
				} else {
					progress = taskSteps.reduce((init, cur) => init + cur.progress / taskSteps.length, 0)
				}

				function isObject(key) {
					return typeof key === "object"
				}

				function calculatePercentage(step) {
					return (+step.progress.wordsDone / +step.progress.totalWordCount) * 100;
				}

				return progress.toFixed(2);
			},
			toggleCheck(e, index, val) {
				this.allTasks[index].isChecked = val;
				this.setProjectProp({ value: this.allTasks, prop: 'tasks' });
			},
			toggleAll(e, val) {
				const tasks = this.allTasks.reduce((acc, cur) => {
					acc.push({ ...cur, isChecked: val });
					return acc;
				}, []);
				this.setProjectProp({ value: tasks, prop: 'tasks' });
			},
			closeApproveModal() {
				this.isApproveActionShow = false;
				this.selectedAction = "";
			},
			closeReview() {
				this.isDeliveryReview = false;
				this.selectedAction = "";
			},
			async downloadFiles(task) {
				try {
					let href = task.deliverables;
					if(!href) {
						const result = await this.$http.get(`/pm-manage/deliverables?taskId=${ task.taskId }`);
						href = result.body.link;
					}
					let link = document.createElement('a');
					link.href = __WEBPACK__API_URL__ + href;
					link.target = "_blank";
					link.click();
				} catch (err) {
					this.alertToggle({ message: err.message, isShow: true, type: "error" });
				}
			},
			isEvery(taskStatus) {
				return this.currentProject.tasks
						.filter(item => item.isChecked)
						.every(({ status }) => status === taskStatus);
			},
			...mapActions({
				alertToggle: "alertToggle",
				setProjectProp: "setProjectProp",
				storeProject: "setCurrentProject",
				setProjectStatus: "setProjectStatus",
				deliverTasks: "deliverTasks",
			}),
		},
		computed: {
			...mapGetters({
				currentProject: 'getCurrentProject',
				user: 'getUser'
			}),
			projectClientContacts() {
				return this.currentProject.clientContacts.map(({ email }) => email)
			},
			availableActionsOptions() {
				const { status, tasks } = this.currentProject;
				const checkedTasks = tasks.filter(item => item.isChecked);
				if(checkedTasks.length) {
					if(this.isEvery('Created')) {
						if(status !== "Draft" && status !== "Cost Quote" && status !== "Rejected") {
							return ['Send a Quote', 'Cancel']
						}
						return ['Cancel']
					} else if(this.isEvery("Ready for Delivery")) return ['Deliver'];
					else if(this.isEvery("Pending Approval [DR1]") && checkedTasks.length === 1) return ['Delivery Review [1]'];
					else if(this.isEvery('Pending Approval [DR2]') && checkedTasks.length === 1) return ['Delivery Review [2]'];
					else if(checkedTasks.every(({ status }) => this.validCancelStatuses.includes(status))) return ['Cancel'];
				}
			},
			isAllSelected() {
				const unchecked = this.currentProject.tasks.find(item => !item.isChecked);
				return !unchecked;
			}
		},
		components: {
			ApproveModalPayment,
			DataTable,
			Preview,
			ProgressLine,
			CheckBox,
			SelectSingle,
			ApproveModal,
			DeliveryReview,
			PreviewQuote,
			Tabs
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

  .tasks {
    display: flex;
    flex-direction: column;

    &__action {
      align-self: flex-end;
    }

    &__title {
      margin-bottom: 5px;
      font-size: 16px;
    }

    &__drop-menu {
      position: relative;
      width: 191px;
      height: 28px;
    }

    &__delivery-image {
      height: 18px;
      width: 18px;
      cursor: pointer;
    }

    &__approve-action {
      position: absolute;
      right: 0;
      z-index: 50;
      background-color: $white;
    }

    &__review {
      position: absolute;
      top: -230px;
      right: 0;
      left: 0;
      bottom: 0;
      z-index: 50;
      box-sizing: border-box;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      height: fit-content;
      padding-bottom: 150px;
    }

    &__task-status {
      position: relative;
    }

    &__timestamp {
      cursor: pointer;
      position: absolute;
      right: 0;
      top: 0;

      &:hover {
        .tasks__time-data {
          opacity: 1;
          z-index: 5;
        }
      }
    }

    &__time-data {
      position: absolute;
      top: -2px;
      width: 150px;
      background-color: $white;
      padding: 3px;
      border-radius: 3px;
      margin-left: 22px;
      box-shadow: 0 0 10px $brown-shadow;
      opacity: 0;
      z-index: -2;
      transition: all 0.2s;
    }
  }
</style>
