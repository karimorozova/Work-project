<template lang="pug">
  .tasks
    .tasks__fileDetails(v-if="isFilesDetailsModal && fileDetailsIndex !== null")
      Files(
        @close="hideFileDetails"
        :task="allTasks[fileDetailsIndex]"
      )

    .tasks__preview(v-if="isEditAndSend")
      Preview(@closePreview="closePreview" :message="previewMessage" @send="sendMessage")

    .tasks__preview(v-if="isEditAndSendQuote")
      PreviewQuote( @closePreview="closePreview"  :allMails="projectClientContacts" :message="previewMessageQuote" @send="sendMessageQuote")

    .tasks__modal(v-if="changeManagerModal")
      .tasks__titleModal Set New DR1
      span.tasks__close-modal(@click="closeManagerModal()") &#215;
      .tasks__body
        .tasks__itemsContacts
          .tasks__items2
            .tasks__selectTitle Choose Manager:
            .tasks__select
              SelectSingle(
                :options="managersNames"
                :selectedOption="selectedDr1Manager"
                placeholder="Select Manager"
                @chooseOption="setManager"
              )

        .tasks-files__button-change
          Button(value="Change" :isDisabled="!selectedManager" @clicked="changeManager")


    .tasks__refFiles(v-if="manageFileModal")
      span.tasks__refFilesClose(@click="closeManageModal") &#215;
      .tasks-files__fileItem
        .file-list
          .file-list__items(v-for="item in refFilesForDelete")
            .file-list__item
              .file-list__name {{item.split('/').pop()}}
              span.file-list__delete(@click="setRemoveFile(item)")
                span
                  i.fas.fa-trash

      .tasks-files__tooltipManage Delete unnecessary reference files
    .tasks__approveRef(v-if="manageApprovalModal")
      ApproveModal(
        text="Are you sure?"
        approveValue="Yes"
        notApproveValue="Cancel"
        @approve="removeRefFile"
        @close="closeManageApprovalModal"
        @notApprove="closeManageApprovalModal"
      )

    .tasks__refFiles(v-if="openFileModal")
      span.tasks__refFilesClose(@click="closeFileModal") &#215;
      .tasks-files__item
        span Reference file:
        span.tasks-files__label-red
        .tasks-files__upload-file
          FilesUpload(
            buttonValue="Reference Files"
            inputClass="files-upload__ref-file"
            :files="refFiles"
            @uploadFiles="uploadRefFiles"
            @deleteFile="(e) => deleteFile(e, 'refFiles')"
          )
      .tasks-files__fileItem
        .file-list
          .file-list__items(v-for="(file, index) in refFiles")
            .file-list__item
              .file-list__name {{file.name}}
              span.file-list__delete(@click="deleteFile(index)") &#x2715

      .tasks-files__button(v-if="refFiles.length")
        Button(:value="'Upload'" @clicked="uploadFiles")
      .tasks-files__tooltip Each file can be <= 50Mb
      .tasks-files__tooltip (otherwise it will not be loaded)

    .tasks__action(v-if="!isProjectFinished")
      .tasks__title Task Action:
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

      GeneralTable(
        :fields="fields"
        :tableData="allTasks"
      )
        template(slot="headerCheck" slot-scope="{ field }")
          .table__header
            CheckBox(:isChecked="isAllSelected" :isWhite="true" @check="(e)=>toggleAll(e, true)" @uncheck="(e)=>toggleAll(e, false)" customClass="tasks-n-steps")

        template(slot="headerFilesIcon" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerTaskId" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerService" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerLanguage" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerStart" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerDeadline" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerProgress" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerStatus" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerReceivables" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerPayables" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerMargin" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerDelivery" slot-scope="{ field }")
          .table__header {{ field.label }}

        template(slot="check" slot-scope="{ row, index }")
          .table__data
            CheckBox(:isChecked="row.isChecked" @check="(e)=>toggleCheck(e, index, true)" @uncheck="(e)=>toggleCheck(e, index, false)" customClass="tasks-n-steps")
        template(slot="fileDetails" slot-scope="{row, index}")
          .table__data(style="cursor: pointer;" @click="showFileDetails(index)")
            img(src="../../../assets/images/latest-version/files.png")
        template(slot="taskId" slot-scope="{ row }")
          .table__data {{ row.taskId.substring(row.taskId.length - 3) }}
        template(slot="service" slot-scope="{ row }")
          .table__data {{ row.service.title }}
        template(slot="language" slot-scope="{ row }")
          .table__data(v-html="getPair(row)")
        template(slot="start" slot-scope="{ row }")
          .table__data {{ formatDate(row).start }}
        template(slot="deadline" slot-scope="{ row }")
          .table__data {{ formatDate(row).deadline }}
        template(slot="progress" slot-scope="{ row, index }")
          .table__data(style="width: 100%")
            ProgressLine(:progress="progress(row, index)" :status="row.status")
        template(slot="status" slot-scope="{ row }")
          .table__data {{ row.status | stepsAndTasksStatusFilter }}

        template(slot="receivables" slot-scope="{ row }")
          //.table__finance
            span(v-if="row.finance.Price.receivables || row.finance.Price.receivables === 0")
              span(v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
            span(v-if="row.finance.Price.receivables !== '' && row.status !== 'Cancelled Halfway'") {{ (row.finance.Price.receivables).toFixed(2) }}
            span(v-if="row.finance.Price.halfReceivables && row.status === 'Cancelled Halfway'") {{ (row.finance.Price.halfReceivables).toFixed(2) }}

        template(slot="payables" slot-scope="{ row }")
          //.table__finance
            span(v-if="row.finance.Price.payables || row.finance.Price.payables === 0")
              span(v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
            span(v-if="row.finance.Price.payables !== '' && row.status !== 'Cancelled Halfway'") {{ (row.finance.Price.payables).toFixed(2) }}
            span(v-if="row.finance.Price.halfPayables && row.status === 'Cancelled Halfway'") {{ (row.finance.Price.halfPayables).toFixed(2) }}

        template(slot="margin" slot-scope="{ row, index }")
          //.table__finance
            span(v-if="marginCalc(row)")
              span(v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
            span(v-if="marginCalc(row)") {{ marginCalc(row) }}
            sup(:class="{'red-color': (+marginCalcPercent(row) > 1 && +marginCalcPercent(row) < 50) || +marginCalcPercent(row) < 0  }" v-if="marginCalc(row)") {{ marginCalcPercent(row) }}%

        template(slot="delivery" slot-scope="{ row }")
          .table__data
            img.tasks__delivery-image(v-if="row.status.indexOf('Pending Approval') !== -1" src="../../../assets/images/latest-version/delivery-list.png" @click="reviewForDelivery(row)")

    .tasks__approve-action(v-if="isCancelApproveModal")
      ApproveModalPayment(
        :isCheckbox="isAppearCheckBox()"
        :text="modalTexts.main"
        :approveValue="modalTexts.approve"
        :notApproveValue="modalTexts.notApprove"
        @approve="approveCancelAction"
        @notApprove="notApproveAction"
        @close="closeApproveModal"
        @returnData="getApproveModalData"

      )

    .tasks__review(v-if="isDeliveryReviewMulti && reviewTasksMulti.length")
      DeliveryOneMulti(
        @close="closeMultiReview"
        :user="user"
        :users="users"
        :project="currentProject"
        :allTasks="currentProject.tasks"
        :deliveryTasks="currentProject.tasksDR1.filter(item => reviewTasksMulti.includes(item.taskId))"
      )
    .tasks__review(v-if="isDeliveryReview")
      DeliveryOne(
        :project="currentProject"
        :user="user"
        :users="users"
        :task="reviewTask"
        :deliveryTask="currentProject.tasksDR1.find(({taskId}) => taskId === reviewTask.taskId)"
        @close="closeReview"
      )
</template>

<script>
	import Preview from "../../vendors/WYSIWYG"
	import PreviewQuote from "../WYSIWYGMultiMails"
	import DataTable from "../../DataTable"
	import ProgressLine from "../../ProgressLine"
	import Tabs from "../../Tabs"
	import SelectSingle from "../../SelectSingle"
	import CheckBox from "@/components/CheckBox"
	import currencyIconDetected from "../../../mixins/currencyIconDetected"

	const ApproveModal = () => import("../../ApproveModal")
	import moment from "moment"
	import { mapGetters, mapActions } from 'vuex'
	import ApproveModalPayment from "../../ApproveModalPayment"
	import FilesUpload from "./tasksFiles/FilesUpload"
	import Button from "../../Button"
	import DeliveryOne from "./DeliveryOne"

	import reviewManagers from "@/mixins/reviewManagers"
	import GeneralTable from "../../GeneralTable"
	import DeliveryOneMulti from "./DeliveryOneMulti"
	import Files from "../stepinfo/Files"

	export default {
		mixins: [ currencyIconDetected, reviewManagers ],
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
					{ label: "check", headerKey: "headerCheck", key: "check", style: { "width": "3%" } },
					{ label: "", headerKey: "headerFilesIcon", key: "fileDetails", style: { "width": "3%", "border-left": "none" } },
					{ label: "", headerKey: "headerTaskId", key: "taskId", style: { "width": "4%" } },
					{ label: "Service", headerKey: "headerService", key: "service", style: { "width": "10%" } },
					{ label: "Languages", headerKey: "headerLanguage", key: "language", style: { "width": "11%" } },
					{ label: "Status", headerKey: "headerStatus", key: "status", style: { "width": "11%" } },
					{ label: "Progress", headerKey: "headerProgress", key: "progress", style: { "width": "9%" } },
					{ label: "Start", headerKey: "headerStart", key: "start", style: { "width": "10%" } },
					{ label: "Deadline", headerKey: "headerDeadline", key: "deadline", style: { "width": "10%" } },
					{ label: "Rec.", headerKey: "headerReceivables", key: "receivables", style: { "width": "8%" } },
					{ label: "Pay.", headerKey: "headerPayables", key: "payables", style: { "width": "8%" } },
					{ label: "Margin", headerKey: "headerMargin", key: "margin", style: { "width": "9%" } },
					{ label: "", headerKey: "headerDelivery", key: "delivery", style: { "width": "4%" } }
				],
				selectedAction: "",
				fileUploadStatus: [ "Created", "Started", "Quote sent", "In progress", "Approved", "Rejected", "Pending Approval" ],
				tabs: [ 'Tasks', 'Steps' ],
				modalTexts: { main: "Are you sure?", approve: "Yes", notApprove: "No" },
				isCancelApproveModal: false,
				isDeliveryReview: false,
				isEditAndSend: false,
				isEditAndSendQuote: false,
				previewMessage: "",
				previewMessageQuote: "",
				reviewTask: [],
				isPay: false,
				validCancelStatuses: [ "Created", "Started", "Quote sent", "In progress", "Approved", "Rejected", "Pending Approval" ],
				reason: "",
				openFileModal: false,
				manageFileModal: false,
				refFiles: [],
				refFilesForDelete: [],
				removeFile: null,
				manageApprovalModal: false,
				changeManagerModal: false,
				managers: [],
				selectedManager: null,
				reviewTasksMulti: [],
				isDeliveryReviewMulti: false,
				isFilesDetailsModal: false,
				fileDetailsIndex: null
			}
		},
		methods: {
			showFileDetails(index) {
				this.fileDetailsIndex = index
				this.isFilesDetailsModal = true
			},
			hideFileDetails() {
				this.fileDetailsIndex = null
				this.isFilesDetailsModal = false
			},
			closeManageApprovalModal() {
				this.manageApprovalModal = false
			},
			async changeManager() {
				try {
					const result = await this.$http.post('/delivery/change-managers', {
						projectId: this.currentProject._id,
						checkedTasksId: this.currentProject.tasks.filter(item => item.isChecked).map(({ taskId }) => taskId),
						manager: this.selectedManager
					})

					await this.storeProject(result.body)
					this.closeManagerModal()
					this.selectedAction = ""
					this.selectedManager = null
				} catch (err) {
					this.alertToggle({ message: err.message, isShow: true, type: "error" })
				}
			},
			closeManagerModal() {
				this.changeManagerModal = false
				this.selectedAction = ""
			},
			async removeRefFile() {
				const { taskId: checkedTasksId } = this.currentProject.tasks.find(item => item.isChecked)
				try {
					const result = await this.$http.post('/delivery/remove-reference-files', {
						filePath: this.removeFile,
						checkedTasksId,
						projectId: this.currentProject._id
					})
					this.storeProject(result.data)
					this.alertToggle({ message: "Files removed", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: err.message, isShow: true, type: "error" })
				} finally {
					this.closeManageApprovalModal()
					this.closeManageModal()
				}
			},
			setRemoveFile(file) {
				this.removeFile = file
				this.manageApprovalModal = true
			},
			closeManageModal() {
				this.manageFileModal = false
				this.refFilesForDelete = []
				this.removeFile = null
				this.selectedAction = ""
			},
			deleteFile(index) {
				this.refFiles.splice(index, 1)
			},
			clearInputFiles(str) {
				let inputFiles = document.querySelectorAll(str)
				for (let elem of inputFiles) {
					elem.value = ''
				}
			},
			uploadRefFiles({ files }) {
				const filteredFiles = Array.from(files).filter(item => item.size / 1000000 <= 50)
				if (filteredFiles.length) {
					for (let file of files) {
						if (!this.refFiles.find(item => item.name === file.name)) this.refFiles.push(file)
					}
				}
				if (!filteredFiles.length) {
					this.clearInputFiles(".files-upload__ref-file")
				}
			},
			async uploadFiles() {
				let filesData = new FormData()
				filesData.append('projectId', this.currentProject._id)
				const checkedTasks = this.currentProject.tasks.filter(item => item.isChecked)
				filesData.append('checkedTasks', JSON.stringify(checkedTasks))
				try {
					if (this.refFiles.length) {
						for (let file of this.refFiles) {
							filesData.append('refFiles', file)
						}
					}
					const result = await this.$http.post('/pm-manage/upload-reference-files', filesData)
					this.storeProject(result.data)
					this.alertToggle({ message: "Files saved", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: err.message, isShow: true, type: "error" })
				} finally {
					this.closeFileModal()
				}
			},
			closeFileModal() {
				this.openFileModal = false
				this.refFiles = []
				this.clearInputFiles(".files-upload__ref-file")
				this.selectedAction = ""
			},
			isAppearCheckBox() {
				return this.selectedAction === 'Cancel'
			},
			// getTaskPrice(row, prop) {
			// 	const value = row.finance.Price[prop]
			// 	return value === 0 ? value : value.toFixed(2)
			// },
			closePreview() {
				this.isEditAndSend = false
				this.isEditAndSendQuote = false
				this.selectedAction = ""
			},
			openPreview() {
				this.isEditAndSend = true
			},
			openPreviewQuote() {
				this.isEditAndSendQuote = true
			},
			getPair(task) {
				return `<span>${ task.sourceLanguage }</span><span> &#8811; </span><span>${ task.targetLanguage }</span>`
			},
			async getSendQuoteMessage() {
				try {
					const template = await this.$http.post(
							`/pm-manage/task-quote-message`, {
								projectId: this.currentProject._id,
								tasksIds: this.allTasks.filter(item => item.isChecked && item.status === "Created").map(item => item.taskId)
							}
					)
					this.previewMessageQuote = template.body.message
					this.openPreviewQuote()
				} catch (err) {
					this.alertToggle({ message: err.message, isShow: true, type: "error" })
				}
			},
			async setAction({ option }) {
				this.selectedAction = option

				switch (option) {
					case 'Complete DR1':
						this.reviewTasksMulti = this.currentProject.tasks.filter(item => item.isChecked).map(item => item.taskId)
						this.isDeliveryReviewMulti = true
						this.setShowTasksAndDeliverables(false)
						break
					case 'Send a Quote':
						await this.getSendQuoteMessage()
						break
					case 'Reassign DR1':
						await this.manageDR1()
						break
					case 'Cancel':
						this.modalTexts = { main: "Are you sure?", approve: "Yes", notApprove: "No" }
						this.isCancelApproveModal = true
						break
					case 'Upload reference files':
						this.openFileModal = true
						break
					case 'Manage reference files':
						const { tasks } = this.currentProject
						const checkedTasks = tasks.filter(item => item.isChecked)
						this.refFilesForDelete = checkedTasks[0].refFiles
						this.manageFileModal = true
						break
				}
			},
			async manageDR1() {
				this.changeManagerModal = true
			},
			setManager({ option }) {
				const managerIndex = this.managersNames.indexOf(option)
				this.selectedManager = this.managers[managerIndex]
			},
			reviewForDelivery(task) {
				this.reviewTask = task
				this.isDeliveryReview = true
				this.setShowTasksAndDeliverables(false)
			},
			unCheckAllTasks() {
				const unchecked = this.allTasks.map(item => {
					item.isChecked = false
					return item
				})
				this.storeProject({ ...this.currentProject, tasks: unchecked })
			},
			async approveCancelAction() {
				const checkedTasks = this.allTasks.filter(item => item.isChecked)
				if (!checkedTasks.length) return this.closeApproveModal()
				try {
					await this.cancelTasks(checkedTasks)
					this.alertToggle({ message: "Cancelled", isShow: true, type: "success" })
					this.closeApproveModal()
					this.unCheckAllTasks()
				} catch (e) {
					this.alertToggle({ message: "Server error / Cannot execute action", isShow: true, type: "error" })
				}
			},
			notApproveAction() {
				this.closeApproveModal()
				this.unCheckAllTasks()
			},
			async cancelTasks(tasks) {
				const filteredTasks = tasks.filter(item => this.validCancelStatuses.indexOf(item.status) !== -1)
				if (!filteredTasks.length) return
				try {
					const updatedProject = await this.$http.post("/pm-manage/cancel-tasks", { tasks: filteredTasks, projectId: this.currentProject._id })
					await this.storeProject(updatedProject.data)
					await this.messageTemplateFormation(filteredTasks)

					// if (this.allTasks.length === tasks.length) {
					// 	await this.setProjectStatus({ status: "Cancelled" })
					// } else {
					// }
					this.alertToggle({ message: "Tasks cancelled", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: "Server error / Cannot cancel chosen tasks", isShow: true, type: "error" })
				}
			},
			async messageTemplateFormation(filteredTasks) {
				const tasksIds = filteredTasks.map(item => item.taskId)
				const cancelledHalfwayTasks = this.currentProject.tasks.filter(item => tasksIds.indexOf(item.taskId) !== -1 && item.status === 'Cancelled Halfway')
				if (cancelledHalfwayTasks.length) {
					try {
						const template = await this.$http.post("/pm-manage/making-tasks-cancel-message", {
							project: this.currentProject,
							tasks: cancelledHalfwayTasks,
							reason: this.reason,
							isPay: this.isPay
						})
						this.previewMessage = template.data.message
						this.openPreview()
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
					})
					this.alertToggle({ message: "Message sent", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: err.message, isShow: true, type: "error" })
				}
				this.closePreview()
			},
			async sendMessageQuote({ message, arrayOfEmails }) {
				try {
					const result = await this.$http.post("/pm-manage/send-task-quote", {
						projectId: this.currentProject._id,
						message: message,
						arrayOfEmails: arrayOfEmails,
						tasksIds: this.allTasks.filter(item => item.isChecked && item.status === "Created").map(item => item.taskId)
					})
					this.$emit('updateTasks', result.data.tasks)
					this.alertToggle({ message: "Message sent", isShow: true, type: "success" })
				} catch (err) {
					this.alertToggle({ message: err.message, isShow: true, type: "error" })
				}
				this.closePreview()
			},
			async getApproveModalData(modalData) {
				try {
					this.reason = modalData.reason
					this.isPay = modalData.isPay
				} catch (err) {
					this.alertToggle({ message: err.message, isShow: true, type: "error" })
				}
			},
			showTab({ index }) {
				return !this.currentProject.steps.length || this.tabs[index] === 'Tasks' ? true
						: this.$emit('showTab', { tab: this.tabs[index] })

			},
			formatDate({ taskId }) {
				let dates = {
					start: '',
					deadline: ''
				}
				const currentSteps = this.currentProject.steps
						.filter(item => item.taskId === taskId)
						.filter(item => item.status !== 'Cancelled' && item.status !== 'Cancelled Halfway')

				if (currentSteps.length === 2) {
					const [ first, second ] = currentSteps
					dates.start = date(first.start)
					dates.deadline = date(second.deadline)
				}

				if (currentSteps.length === 1) {
					const { start, deadline } = currentSteps[0]
					dates.start = date(start)
					dates.deadline = date(deadline)
				}

				function date(date) {
					return moment(date).format('MMM D, HH:mm')
				}

				return dates
			},
			getPrice(status, taskId) {
				const { steps } = this.currentProject
				const neededSteps = steps.filter(item => item.taskId === taskId)
				let receivables = 0
				let payables = 0

				if (status === 'Cancelled Halfway') {
					receivables = neededSteps.reduce((a, c) => a + +c.finance.Price.halfReceivables, 0)
					payables = neededSteps.reduce((a, c) => a + +c.finance.Price.halfPayables, 0)
				} else {
					receivables = neededSteps.reduce((a, c) => a + +c.finance.Price.receivables, 0)
					payables = neededSteps.reduce((a, c) => a + +c.finance.Price.payables, 0)
				}

				return { receivables, payables }
			},
			marginCalc({ status, taskId }) {
				const { receivables, payables } = this.getPrice(status, taskId)
				return (receivables - payables).toFixed(2)
			},
			marginCalcPercent({ status, taskId }) {
				const { receivables, payables } = this.getPrice(status, taskId)
				let percent = NaN
				percent = 100 - (payables / receivables) * 100
				return Number.isNaN(percent) ? 0 : percent.toFixed(0)
			},
			progress(task) {
				let progress = 0
				const { _id: catId } = this.originallyUnits.find(({ type }) => type === 'CAT Wordcount')
				const CATServices = this.originallyServices
						.filter(({ steps }) => steps.some(({ step: { calculationUnit } }) => calculationUnit.includes(catId)))
						.map(({ title }) => title)

				let taskSteps = this.currentProject.steps
						.filter(item => item.taskId === task.taskId)

				taskSteps = taskSteps.filter(item => !item.stepId.includes('Cancelled'))

				if (CATServices.includes(task.service.title)) {
					const [ firstStep, secondStep ] = taskSteps
					if (taskSteps.length === 2) {
						if (isObject(secondStep.progress) && isObject(firstStep.progress)) {
							const firstStepProgress = calculatePercentage(firstStep)
							const secondStepProgress = calculatePercentage(secondStep)
							progress = (firstStepProgress + secondStepProgress) / 2
						}
					} else if (taskSteps.length === 1) {
						progress = calculatePercentage(firstStep)
					}
				} else {
					progress = taskSteps.reduce((init, cur) => init + cur.progress / taskSteps.length, 0)
				}

				function isObject(key) {
					return typeof key === "object"
				}

				function calculatePercentage(step) {
					return (+step.progress.wordsDone / +step.progress.totalWordCount) * 100
				}

				return progress.toFixed(2)
			},
			toggleCheck(e, index, val) {
				this.allTasks[index].isChecked = val
				this.setProjectProp({ value: this.allTasks, prop: 'tasks' })
			},
			toggleAll(e, val) {
				const tasks = this.allTasks.reduce((acc, cur) => {
					acc.push({ ...cur, isChecked: val })
					return acc
				}, [])
				this.setProjectProp({ value: tasks, prop: 'tasks' })
			},
			closeApproveModal() {
				this.isCancelApproveModal = false
				this.selectedAction = ""
			},
			closeReview() {
				this.isDeliveryReview = false
				this.selectedAction = ""
				this.setShowTasksAndDeliverables(true)
			},
			closeMultiReview(e) {
				this.reviewTasksMulti = []
				this.isDeliveryReviewMulti = false
				this.selectedAction = ""
				this.setShowTasksAndDeliverables(true)
				this.toggleAll(e, false)
			},
			isEvery(taskStatus) {
				return this.currentProject.tasks
						.filter(item => item.isChecked)
						.every(({ status }) => status === taskStatus)
			},
			...mapActions({
				alertToggle: "alertToggle",
				setProjectProp: "setProjectProp",
				storeProject: "setCurrentProject",
				setProjectStatus: "setProjectStatus",
				setShowTasksAndDeliverables: "setShowTasksAndDeliverables"
			})
		},
		computed: {
			...mapGetters({
				currentProject: 'getCurrentProject',
				user: 'getUser',
				users: 'getUsers'
			}),
			selectedDr1Manager() {
				return this.selectedManager ? `${ this.selectedManager.firstName } ${ this.selectedManager.lastName }` : ""
			},
			projectClientContacts() {
				return this.currentProject.clientContacts.map(({ email }) => email)
			},
			availableActionsOptions() {
				const { status, tasks } = this.currentProject
				const checkedTasks = tasks.filter(item => item.isChecked)
				if (checkedTasks.length) {
					if (this.isEvery('Created')) {

						if (status !== "Draft" && status !== "Cost Quote" && status !== "Rejected") {
							return [ 'Manage reference files', 'Upload reference files', 'Send a Quote', 'Cancel' ]
						} else if (checkedTasks.every(({ status }) => this.fileUploadStatus.includes(status)) && checkedTasks.length === 1) {
							return [ 'Manage reference files', 'Upload reference files', 'Cancel' ]
						} else {
							return [ 'Cancel' ]
						}

					} else if (this.isEvery("Pending Approval [DR1]")) {

						let elements = []
						const [ first ] = checkedTasks
						const isSameService = checkedTasks.every(({ service }) => service.title === first.service.title)
						if (isSameService) elements.push('Complete DR1')
						if (this.canChangeDR1Manager) elements.push('Reassign DR1')
						return elements

					} else if (checkedTasks.every(({ status }) => this.fileUploadStatus.includes(status)) && checkedTasks.length > 1) {
						return [ 'Upload reference files', 'Cancel' ]
					} else if (checkedTasks.every(({ status }) => this.fileUploadStatus.includes(status)) && checkedTasks.length === 1) {
						return [ 'Manage reference files', 'Upload reference files', 'Cancel' ]
					}
				}
			},
			isAllSelected() {
				const unchecked = this.currentProject.tasks.find(item => !item.isChecked)
				return !unchecked
			},
			canChangeDR1Manager() {
				const checkedIds = this.currentProject.tasks
						.filter(item => item.isChecked)
						.map(({ taskId }) => taskId)

				const { _id, group: { name } } = this.user

				return name === 'Administrators'
						|| name === 'Developers'
						|| this.currentProject.tasksDR1.filter(({ taskId }) => checkedIds.includes(taskId)).every(({ dr1Manager }) => {
							return dr1Manager === _id
						})
			},
			isProjectFinished() {
				const { status } = this.currentProject
				return status === 'Closed' || status === 'Cancelled Halfway' || status === 'Cancelled'
			}
		},
		created() {
			this.getManagers()
		},
		components: {
			Files,
			DeliveryOneMulti,
			GeneralTable,
			DeliveryOne,
			Button,
			FilesUpload,
			ApproveModalPayment,
			DataTable,
			Preview,
			ProgressLine,
			CheckBox,
			SelectSingle,
			ApproveModal,
			PreviewQuote,
			Tabs
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

  .table {
    &__data {
      padding: 0 6px;
      word-break: break-word;
    }

    &__header {
      padding: 0 6px;
      word-break: break-all;
    }

    &__finance {
      padding: 0 3px 0 6px;
    }
  }

  .file-list {
    &__items {
      position: relative;
    }

    &__name {
      color: $text;
      margin-right: 10px;
    }

    &__item {
      border-radius: 4px;
      border: 1px solid $border;
      box-sizing: border-box;
      background-color: #fff;
      font-size: 12px;
      padding: 8px;
      margin: 0;
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      margin-top: 10px;
      font-family: -webkit-pictograph;
    }

    &__delete {
      cursor: pointer;
      transform: 0.2s ease;
      font-size: 14px;

      &:hover {
        font-weight: bold;
        cursor: pointer;
      }
    }
  }

  .tasks-files {
    &__item {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
    }

    &__upload-file {
      margin-left: 15px;
    }

    &__button {
      margin-top: 20px;
      text-align: center;
      margin-bottom: 20px;
    }

    &__button-change {
      margin-top: 20px;
      text-align: center;
    }

    &__tooltip {
      text-align: center;
      opacity: 0.6;
    }

    &__tooltipManage {
      text-align: center;
      opacity: 0.6;
      margin-top: 20px;
    }

  }

  .tasks {
    display: flex;
    flex-direction: column;
    position: relative;

    &__approveRef {
      position: absolute;
      z-index: 5555;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    &__refFiles {
      padding: 20px 40px;
      background: white;
      position: absolute;
      box-shadow: $box-shadow;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 500;
    }

    &__refFilesClose {
      position: absolute;
      top: 5px;
      right: 7px;
      font-size: 22px;
      cursor: pointer;
      height: 22px;
      width: 22px;
      justify-content: center;
      display: flex;
      align-items: center;
      font-family: Myriad900;
      opacity: 0.8;
      transition: ease 0.2s;

      &:hover {
        opacity: 1
      }
    }

    &__task-check {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 30px;
    }

    &__task-data {
      height: 30px;
      display: flex;
      align-items: center;
      padding: 0 5px;
      position: relative;
    }

    &__task-progress {
      padding: 0 4px;
      display: flex;
      height: 30px;
      align-items: center;
    }

    &__action {
      align-self: flex-end;
    }

    &__title {
      margin-bottom: 4px;
    }

    &__drop-menu {
      position: relative;
      width: 220px;
      height: 32px;
    }

    &__delivery-image {
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
      top: -64px;
      right: -20px;
      left: -20px;
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
      right: 5px;
      top: 7px;

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
      border-radius: 4px;
      margin-left: 22px;
      box-shadow: $box-shadow;
      opacity: 0;
      z-index: -2;
      transition: all 0.2s;
    }

    &__modal {
      padding: 25px;
      background: white;
      position: absolute;
      box-shadow: $box-shadow;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 500;
    }

    &__fileDetails {
      padding: 25px;
      background: white;
      position: absolute;
      box-shadow: $box-shadow;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 501;
    }

    &__titleModal {
      font-size: 19px;
      margin-bottom: 20px;
      text-align: center;
      font-family: Myriad600;
    }

    &__close-modal {
      position: absolute;
      top: 5px;
      right: 7px;
      font-size: 22px;
      cursor: pointer;
      height: 22px;
      width: 22px;
      justify-content: center;
      display: flex;
      align-items: center;
      font-family: Myriad900;
      opacity: 0.8;
      transition: ease 0.2s;

      &:hover {
        opacity: 1
      }
    }


    &__itemsContacts {
      display: flex;
      justify-content: center;
    }

    &__selectTitle {
      margin-bottom: 4px;
    }


    &__select {
      position: relative;
      height: 32px;
      width: 220px;
    }
  }

  .red-color{
    color: $red;
  }
</style>
