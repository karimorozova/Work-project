<template lang="pug">
  .steps
    .steps__action(v-if="!isProjectFinished")
      .steps__title Step Action:
      .steps__drop-menu
        SelectSingle(
          :selectedOption="selectedAction"
          :options="stepActions"
          placeholder="Select Action"
          @chooseOption="setAction"
        )
    .steps__table
      .steps__tabs
        Tabs(
          :tabs="tabs"
          selectedTab="Steps"
          @setTab="showTab"
        )

      GeneralTable(
        :fields="fields"
        :tableData="allSteps"
      )

        template(slot="headerCheck" slot-scope="{ field }")
          .table__header
            CheckBox(:isChecked="isAllSelected" :isWhite="true" @check="(e)=>toggleAll(true)" @uncheck="(e)=>toggleAll(false)" customClass="tasks-n-steps")
        template(slot="headerInfo" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerName" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerLanguage" slot-scope="{ field }")
          .table__header {{ field.label }}
        template(slot="headerVendor" slot-scope="{ field }")
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

        template(slot="check" slot-scope="{ row, index }")
          .table__data
            CheckBox(:isChecked="row.check" @check="(e)=>toggleCheck(e, index, true)" @uncheck="(e)=>toggleCheck(e, index, false)" customClass="tasks-n-steps")
        template(slot="info" slot-scope="{row, index}")
          .table__data(style="cursor: pointer;" @click="showStepDetails(index)")
            img(src="../../../assets/images/latest-version/view-details.png")
        template(slot="name" slot-scope="{ row }")
          .table__data {{ row.name }}
        template(slot="language" slot-scope="{ row }")
          .table__data(v-html="getStepPair(row)")

        template(slot="vendor" slot-scope="{ row, index }")
          .table__drop(v-if="isVendorSelect(row.status)")
            PersonSelect(
              :persons="extendedVendors(index)"
              :selectedPerson="vendorName(row.vendor)"
              :isExtended="isAllShow"
              :isAdditionalShow="isAdditionalShow"
              @setPerson="(person) => setVendor(person, index)"
              @togglePersonsData="toggleVendors"
              @scrollDrop="personSelectDrop(row)"
              @removeVendorFromStep="removeVendorFromStep"
            )

          .table__vendor(v-if="!isVendorSelect(row.status)") {{ vendorName(row.vendor) }}
            .steps__vendor-replace(v-if="row.vendor && row.status === 'Started'")
              .steps__replace-icon(@click="showReassignment(index)")
                i.fas.fa-exchange-alt
              .steps__tooltip Reassign Vendor
            span.steps__step-no-select(v-if="!row.vendor") No Vendor

        template(slot="start" slot-scope="{ row, index }")
          .table__data
            Datepicker(
              @selected="(e) => changeDate(e, 'start', row.stepId)"
              v-model="row.start"
              inputClass="steps__custom-input"
              calendarClass="steps__calendar-custom"
              :format="customFormatter"
              monday-first=true
              :disabledPicker="isDatePickDisabled"
              :highlighted="highlighted"
              @scrollDrop="scrollDrop"
            )

        template(slot="deadline" slot-scope="{ row, index }")
          .table__data
            Datepicker(
              @selected="(e) => changeDate(e, 'deadline', row.stepId)"
              v-model="row.deadline"
              inputClass="steps__custom-input"
              calendarClass="steps__calendar-custom"
              :format="customFormatter"
              monday-first=true
              :disabled="disabled"
              :disabledPicker="isDatePickDisabled"
              :highlighted="highlighted"
              @scrollDrop="scrollDrop"
            )

        template(slot="progress" slot-scope="{ row, index }")
          .table__data(style="width: 100%")
            ProgressLineStep(:progress="progress(row.progress)" :lastProgress="lastProgress(row, index)")

        template(slot="status" slot-scope="{ row }")
          .table__data
            span {{ row.status | stepsAndTasksStatusFilter }}

        template(slot="receivables" slot-scope="{ row }")
          .table__finance
            span(v-if="isShowValue(row, 'receivables')")
              span(v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
              span(v-if="row.finance.Price.receivables !== '' && row.status !== 'Cancelled Halfway'") {{ (row.finance.Price.receivables).toFixed(2) }}
              span(v-if="row.finance.Price.hasOwnProperty('halfReceivables')") {{ (row.finance.Price.halfReceivables).toFixed(2) }}

        template(slot="payables" slot-scope="{ row }")
          .table__finance
            span(v-if="isShowValue(row, 'payables')")
              span(v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
              span(v-if="row.finance.Price.payables !== '' && row.status !== 'Cancelled Halfway'") {{ (row.finance.Price.payables).toFixed(2) }}
              span(v-if="row.finance.Price.hasOwnProperty('halfPayables')") {{ (row.finance.Price.halfPayables).toFixed(2) }}

        template(slot="margin" slot-scope="{ row }")
          .table__finance
            span(v-if="marginCalc(row)")
              span(v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
            span(v-if="marginCalc(row)") {{ marginCalc(row) }}

      transition(name="fade")
        .steps__info(v-if="isStepInfo")
          StepInfo(
            :step="allSteps[infoIndex]"
            :index="infoIndex"
            :vendors="vendors"
            :task="getTask(infoIndex)"
            @closeStepInfo="closeStepInfo"
            :originallyLanguages="originallyLanguages"
            :originallyUnits="originallyUnits"
            :projectCurrency="currentProject.projectCurrency"
          )
    .steps__reassignment(v-if="isReassignment")
      Reassignment(
        @close="closeReassignment"
        :step="reassignStep"
        :index="infoIndex"
        :originallyLanguages="originallyLanguages"
      )
    .steps__approve-action(v-if="isApproveActionShow")
      ApproveModal(
        :text="modalTexts.main"
        :approveValue="modalTexts.approve"
        :notApproveValue="modalTexts.notApprove"
        @approve="approveAction"
        @notApprove="notApproveAction"
        @close="closeApproveModal"
      )
    .steps__change-deadline(v-if="deadlineModal")
      .steps__change-deadline-close(@click="closeErrorsDeadline") &#215;
      Datepicker(
        @selected="(e) => setMassDeadline(e)"
        :inline="true",
        calendarClass="steps__calendar-custom"
        :format="customFormatter"
        monday-first=true
        :disabled="disabled"
        :disabledPicker="isDatePickDisabled"
        :highlighted="highlighted"
        @scrollDrop="scrollDrop"
      )


    ValidationErrors(
      v-if="areErrorsExist"
      :errors="errors"
      :isAbsolute="true"
      @closeErrors="closeErrors"
    )
</template>

<script>
	import DataTable from "../../DataTable"
	import ProgressLine from "../../ProgressLine"
	import CheckBox from "@/components/CheckBox"
	import Tabs from "../../Tabs"
	import PersonSelect from "../PersonSelect"

	const ApproveModal = () => import("../../ApproveModal")
	const StepInfo = () => import("./StepInfo")
	const Reassignment = () => import("../stepinfo/Reassignment")
	import SelectSingle from "../../SelectSingle"

	const ValidationErrors = () => import("../../ValidationErrors")
	import Datepicker from "../../DatepickerWithTime"
	import moment from "moment"
	import scrollDrop from "@/mixins/scrollDrop"
	import stepVendor from "@/mixins/stepVendor"
	import currencyIconDetected from "../../../mixins/currencyIconDetected"

	import { mapGetters, mapActions } from 'vuex'
	import ProgressLineStep from "../../ProgressLineStep"
	import GeneralTable from "../../GeneralTable"
	import Button from "../../Button"

	export default {
		mixins: [ scrollDrop, stepVendor, currencyIconDetected ],
		props: {
			allSteps: {
				type: Array
			},
			tasks: {
				type: Array
			},
			originallyLanguages: {
				type: Array
			},
			originallyUnits: {
				type: Array
			}
		},
		data() {
			return {
				highlighted: {
					days: [ 6, 0 ]
				},
				disabled: {
					to: moment().add(-1, 'day').endOf('day').toDate()
				},
				tabs: [ 'Tasks', 'Steps' ],
				fields: [
					{ label: "Check", headerKey: "headerCheck", key: "check", style: { "width": "3%" } },
					{ label: "", headerKey: "headerInfo", key: "info", style: { "width": "3%", "border-left": "none" } },
					{ label: "Step", headerKey: "headerName", key: "name", style: { "width": "9%" } },
					{ label: "Langs", headerKey: "headerLanguage", key: "language", style: { "width": "6%" } },
					{ label: "Vendor name", headerKey: "headerVendor", key: "vendor", style: { "width": "16%" } },
					{ label: "Status", headerKey: "headerStatus", key: "status", style: { "width": "8%" } },
					{ label: "Progress", headerKey: "headerProgress", key: "progress", style: { "width": "7%" } },
					{ label: "Start", headerKey: "headerStart", key: "start", style: { "width": "13%" } },
					{ label: "Deadline", headerKey: "headerDeadline", key: "deadline", style: { "width": "13%" } },
					{ label: "Rec.", headerKey: "headerReceivables", key: "receivables", style: { "width": "7%" } },
					{ label: "Pay.", headerKey: "headerPayables", key: "payables", style: { "width": "7%" } },
					{ label: "Margin", headerKey: "headerMargin", key: "margin", style: { "width": "7%" } }
				],
				selectedVendors: [],
				modalTexts: { main: "Are you sure?", approve: "Yes", notApprove: "No" },
				isApproveActionShow: false,
				activeIndex: -1,
				isAllShow: false,
				isAdditionalShow: true,
				chosenStep: {},
				infoIndex: -1,
				isStepInfo: false,
				isReassignment: false,
				reassignStep: {},
				areErrorsExist: false,
				currentStepIdForRemoveVendor: null,
				deadlineModal: false,
				dateNow: new Date()
			}
		},
		methods: {
			async removeVendorFromStep() {
				try {
					const project = await this.$http.post('/pm-manage/remove-vendor-from-step', {
						projectId: this.currentProject._id,
						stepId: this.currentStepIdForRemoveVendor
					})
					this.setCurrentProject(project.data)
					this.alertToggle({ message: "Vendor removed from Step.", isShow: true, type: 'success' })
				} catch (err) {
					this.alertToggle({ message: "Error can't remove Vendor from Step", isShow: true, type: 'success' })
				}
			},
			getStepPair(step) {
				return `<div style="margin-bottom: -2px;">${ step.sourceLanguage }</div><div>${ step.targetLanguage }</div>`
			},
			personSelectDrop(step) {
				const { stepId, vendor } = step
				if (vendor) this.currentStepIdForRemoveVendor = stepId
			},
			// getTotalReceivables(step) {
			//     console.log(step.finance.Price.receivables)
			//
			//     const { finance, clientDiscount } = step;
			//     // if(clientDiscount) {
			//     //     return (finance.Price.receivables - finance.Price.receivables*clientDiscount/100).toFixed(2);
			//     // }
			//     return finance.Price.receivables;
			// },
			progress(prog) {
				return prog.hasOwnProperty('totalWordCount') ? +((prog.wordsDone / prog.totalWordCount) * 100).toFixed(2) : +prog
			},
			lastProgress(step, index) {
				if (step.stepId.includes('R')) {
					const prevStep = this.currentProject.steps[index - 1]
					if (prevStep.finance.Price.hasOwnProperty('halfReceivables') && prevStep.finance.Price.halfReceivables > 0) {
						return ((prevStep.progress.wordsDone / prevStep.progress.totalWordCount) * 100).toFixed(2)
					}
				}
				return 0
			},
			getPrice(row, prop) {
				const value = row.finance.Price[prop]
				return value === 0 ? value : value.toFixed(2)
			},
			getTotalPayables(step) {
				const { finance, vendorDiscount } = step
				if (vendorDiscount) {
					return (finance.Price.payables - finance.Price.payables * vendorDiscount / 100).toFixed(2)
				}
				return finance.Price.payables
			},
			isShowValue(step, prop) {
				if (step.status === "Cancelled Halfway") {
					const halfProp = prop === "receivables" ? "halfReceivables" : "halfPayables"
					const val = step.finance.Price[halfProp]
					return val === 0 ? true : step.finance.Price[halfProp]
				}
				return step.finance.Price[prop] === 0 ? true : step.finance.Price[prop]
			},
			customFormatter(date) {
				return moment(date).format('DD-MM-YYYY, HH:mm')
			},
			toggleVendors({ isAll }) {
				this.isAllShow = isAll
			},
			isVendorSelect(status) {
				const validStatuses = [ 'Started', 'Cancelled', 'Cancelled Halfway', 'Completed' ]
				return validStatuses.indexOf(status) === -1
			},
			showTab({ index }) {
				return this.tabs[index] === 'Steps' ? true
						: this.$emit('showTab', { tab: this.tabs[index] })
			},
			marginCalc(step) {
				const { Price } = step.finance
				if (Price.halfReceivables >= 0) {
					return (Price.halfReceivables - Price.halfPayables).toFixed(2)
				}
				return (+Price.receivables - +Price.payables).toFixed(2)
			},
			getTask(index) {
				return this.tasks.find(item => {
					return item.taskId === this.allSteps[index].taskId
				})
			},
			showStepDetails(index) {
				this.infoIndex = index
				this.isStepInfo = true
			},
			showReassignment(index) {
				this.infoIndex = index
				this.reassignStep = { ...this.allSteps[index] }
				this.isReassignment = true
			},
			closeStepInfo() {
				this.isStepInfo = false
				this.infoIndex = -1
			},
			closeReassignment() {
				this.isReassignment = false
				this.infoIndex = -1
			},
			setVendor({ person }, index) {
				const { stepId, taskId } = this.allSteps[index]
				const doesHaveAccess = this.userGroup.name === "Administrators" || this.userGroup.name === "Developers" || this.userGroup.name === "Project Managers"
				const relatedStep = this.allSteps.find(item => item.stepId !== stepId && item.taskId === taskId)
				if (doesHaveAccess) {
					this.$emit("setVendor", { vendor: person, index })
				} else if (!relatedStep.vendor || relatedStep.vendor.toString() !== person._id.toString()) {
					this.$emit("setVendor", { vendor: person, index })
				} else {
					this.showErrors([ 'This vendor has already been assigned to a related step' ])
				}
			},
			async setAction({ option }) {
				this.selectedAction = option

				switch (option) {
					case "Mark as accept/reject":
					case "Request confirmation":
					case "ReOpen":
						this.setModalTexts(option)
						this.isApproveActionShow = true
						break
					case "Change Deadline" :
						this.deadlineModal = true
						break
				}
			},
			setMassDeadline(e) {
				const checkedSteps = this.currentProject.steps.filter(item => item.check)
        try{
	        for(let step of checkedSteps) this.$emit('setDate', { date: new Date(e), prop: 'deadline', stepId: step.stepId })
        }finally {
          this.closeErrorsDeadline()
        }
			},
			closeErrorsDeadline() {
				this.deadlineModal = false
				this.selectedAction = ''
        this.toggleAll(false)
			},
			setModalTexts(option) {
				this.modalTexts = { main: "Are you sure?", approve: "Yes", notApprove: "No" }
				switch (this.selectedAction) {
					case "Request confirmation":
						this.modalTexts.main = "Please, choose action:"
						this.modalTexts.approve = "Send"
						this.modalTexts.notApprove = "Cancel"
						break
					case "Mark as accept/reject":
						this.modalTexts.main = "Select the status:"
						this.modalTexts.approve = "Accepted"
						this.modalTexts.notApprove = "Rejected"
				}
			},
			getCheckedSteps() {
				return this.allSteps.filter(item => item.check)
			},

			async approveAction() {
				const checkedSteps = this.getCheckedSteps()
				!checkedSteps.length ? this.closeApproveModal() : await this.doStepApproveAction(checkedSteps)
			},
			async doStepApproveAction(checkedSteps) {
				try {
					switch (this.selectedAction) {
						case "Request confirmation":
							await this.requestConfirmation(checkedSteps)
							break
						case "Mark as accept/reject":
							const assignedSteps = checkedSteps.filter(item => item.vendor)
							if (assignedSteps.length) await this.decideOnSteps(assignedSteps, "Accepted")
							break
						case "ReOpen":
							const steps = checkedSteps.filter(item => item.status === "Completed")
							await this.reopenSteps(steps)
							break
					}
				} catch (err) {
				} finally {
					this.closeApproveModal()
				}
			},
			async decideOnSteps(assignedSteps, selectedStatus) {
				try {
					const withPayables = assignedSteps.filter(item => item.finance.Price.payables)
					if (withPayables.length) {
						const status = selectedStatus === 'Accepted' ? this.getAcceptedStepStatus() : selectedStatus
						await this.setStepsStatus({ status, steps: withPayables })
					}
					if (withPayables.length < assignedSteps.length) {
						this.showErrors([ `One or more steps could not be ${ selectedStatus.toLowerCase() } as payables are missing` ])
					}
				} catch (err) {
				}
			},
			getAcceptedStepStatus() {
				let status = 'Accepted'
				if (this.currentProject.status === 'Approved' || this.currentProject.status === 'In progress') {
					status = 'Ready to Start'
				}
				return status
			},
			async notApproveAction() {
				const checkedSteps = this.getCheckedSteps()
				if (!checkedSteps.length) return this.closeApproveModal()
				try {
					switch (this.modalTexts.notApprove) {
						case "No":
						case "Cancel":
							this.closeApproveModal()
							break
						case "Rejected":
							const assignedSteps = checkedSteps.filter(item => item.vendor)
							if (assignedSteps.length) {
								await this.decideOnSteps(assignedSteps, "Rejected")
							}
					}
				} catch (err) {
					this.alertToggle({ message: "Internal server error.Try later.", isShow: true, type: 'error' })
				} finally {
					this.closeApproveModal()
				}
			},
			closeApproveModal() {
				this.isApproveActionShow = false
				this.selectedAction = ""
			},
			async requestConfirmation(steps) {
				const filteredSteps = steps.filter(item => item.status === "Created" || item.status === "Rejected")
				if (!filteredSteps.length) return
				const zeroPayablesStep = filteredSteps.find(item => !item.finance.Price.payables)
				if (!!zeroPayablesStep) {
					return this.showErrors([ "There are steps with no payables!" ])
				}
				try {
					const result = await this.$http.post('/pm-manage/vendor-request', { checkedSteps: filteredSteps, projectId: this.currentProject._id })
					await this.setCurrentProject(result.data)
					this.alertToggle({ message: "Requests has been sent.", isShow: true, type: 'success' })
				} catch (err) {
					this.alertToggle({ message: "Error: Request Confirmation cannot be sent.", isShow: true, type: 'error' })
				}
			},
			showErrors(errors) {
				this.errors = errors
				this.areErrorsExist = true
			},
			closeErrors() {
				this.areErrorsExist = false
				this.errors = []
			},
			toggleCheck(e, index, val) {
				this.allSteps[index].check = val
				this.setProjectProp({ value: this.allSteps, prop: 'steps' })
			},
			toggleAll(val) {
				const steps = this.allSteps.reduce((acc, cur) => {
					acc.push({ ...cur, check: val })
					return acc
				}, [])
				this.setProjectProp({ value: steps, prop: 'steps' })
			},
			vendorName(vendor) {
				const surname = vendor && (vendor.surname && vendor.surname !== "undefined") ? vendor.surname : ""
				return vendor ? vendor.firstName + ' ' + surname : ""
			},
			changeDate(e, prop, stepId) {
				this.$emit('setDate', { date: new Date(e), prop, stepId })
			},
			isEvery(stepStatus) {
				const checkedSteps = this.currentProject.steps.filter(item => item.check)
				if (checkedSteps.length) return checkedSteps.every(({ status }) => status === stepStatus)
			},
			...mapActions([
				"alertToggle",
				"setProjectProp",
				"setCurrentProject",
				"setStepsStatus",
				"setProjectStatus",
				"reopenSteps"
			])
		},
		computed: {
			...mapGetters({
				currentProject: 'getCurrentProject',
				vendors: "getAllVendorsForProject",
				userGroup: "getUserGroup"
			}),
			stepActions() {
				if (this.currentProject) {
					const checkedSteps = this.currentProject.steps.filter(item => item.check).map(item => item.status)
					const availableStatusForChangeDeadline = [ 'Created', 'Ready to Start', 'Request Sent', 'Waiting to Start', 'In progress', 'Started' ]
					const indexesForAvailableStatuses = checkedSteps.map(item => availableStatusForChangeDeadline.indexOf(item))

					if (this.isEvery('Created')) {
						return [ "Mark as accept/reject", "Request confirmation", "Change Deadline" ]
					} else if (this.isEvery('Completed')) {
						return [ "ReOpen" ]
					} else if (indexesForAvailableStatuses.length && !indexesForAvailableStatuses.includes(-1)) {
						return [ "Change Deadline" ]
					}

					// const startAvailableOption = [ "Mark as accept/reject", "Request confirmation" ]
					// const startAvailableStatuses = [ "Created", 'Rejected', 'Approved' ]

					// if (checkedSteps.length) {
					//
					//   if(checkedSteps.every(({status}) => status === 'Created' || status === 'Rejected' )){
					//     return ["Mark as accept/reject", "Request confirmation"]
					//   }else if(checkedSteps.every(({status}) => status === 'Completed' )){
					//     return ["ReOpen"]
					//   }
					// }

					// let result = [ "Mark as accept/reject", "Request confirmation" ]
					// const requestedStep = this.allSteps.find(item => item.status === "Request Sent" || item.status === "Created")
					// const completedStep = this.allSteps.find(item => item.status === "Completed")
					// if (!requestedStep && result.indexOf("Mark as accept/reject") !== -1) {
					// 	result = []
					// }
					// if (completedStep && result.indexOf("ReOpen") === -1) {
					// 	result.push("ReOpen")
					// }
					// if (!result.length) {
					// 	result = [ "No action available" ]
					// }
					// return result

					// return []
				}
			},
			isAllSelected() {
				const unchecked = this.currentProject.steps.find(item => !item.check)
				return !unchecked
			},
			isDatePickDisabled() {
				const statuses = [ "Closed", "Rejected", "Cancelled", "Cancelled Halfway" ]
				return statuses.indexOf(this.currentProject.status) !== -1
			},
			isProjectFinished() {
				const { status } = this.currentProject
				return status === 'Closed' || status === 'Cancelled Halfway' || status === 'Cancelled'
			}
		},
		components: {
			Button,
			GeneralTable,
			ProgressLineStep,
			DataTable,
			ProgressLine,
			PersonSelect,
			SelectSingle,
			CheckBox,
			Datepicker,
			ValidationErrors,
			StepInfo,
			Reassignment,
			ApproveModal,
			Tabs
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

  .table {
    &__data {
      padding: 0 5px;
      word-break: break-word;
    }

    &__header {
      padding: 0 5px;
      word-break: break-all;
    }

    &__drop {
      position: relative;
      height: 32px;
      width: 100%;
      margin: 0 5px;
    }

    &__vendor {
      display: flex;
      justify-content: space-between;
      padding: 0 5px;
      width: 100%;
    }
    &__finance{
      padding: 0 3px 0 5px;
    }
  }

  .steps {
    display: flex;
    flex-direction: column;

    &__step-check {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 31px;
    }

    &__table {
      position: relative;
    }

    &__action {
      align-self: flex-end;
      z-index: 5;
    }

    &__title {
      margin-bottom: 4px;
    }

    &__drop-menu {
      position: relative;
      width: 220px;
      height: 32px;
    }

    &__info {
      position: absolute;
      top: -150px;
      left: 10%;
      width: 80%;
      z-index: 50;
      background-color: $white;
      box-shadow: rgba(81, 68, 48, 0.3) 0px 1px 2px 0px, rgba(81, 68, 48, 0.15) 0px 1px 3px 1px;
      margin-bottom: 120px;
    }

    &__info-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    &__vendor-replace {
      position: relative;
      width: 20px;
      margin-right: 5px;
      box-sizing: border-box;

      &:hover {
        .steps__tooltip {
          display: block;
          z-index: 50;
        }
      }
    }

    &__replace-icon {
      max-width: 20px;
      cursor: pointer;
    }

    &__tooltip {
      text-align: center;
      width: 120px;
      position: absolute;
      right: 27px;
      top: -4px;
      display: none;
      background-color: $text;
      color: white;
      box-sizing: border-box;
      padding: 4px;
      border-radius: 4px;
    }

    &__step-no-select {
      opacity: 0.7;
    }

    &_rotated {
      transform: rotate(180deg);
    }

    &__vendor-menu {
      position: relative;
      width: 100%;
      height: 32px;
    }

    &__reassignment {
      position: absolute;
      z-index: 100;
      left: 0;
      top: 0;
      bottom: 0;
      right: 0;
    }

    &__change-deadline {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 9999;
      box-shadow: rgba(81, 68, 48, 0.3) 0px 1px 2px 0px, rgba(81, 68, 48, 0.15) 0px 1px 3px 1px;
      background-color: #fff;
      border-radius: 4px;
      padding: 30px 0 0 0;
      width: 280px;

      &-close {
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
    }

    &__approve-action {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 9999;
      box-shadow: rgba(81, 68, 48, 0.3) 0px 1px 2px 0px, rgba(81, 68, 48, 0.15) 0px 1px 3px 1px;
      background-color: #fff;
      border-radius: 4px;
    }

    &__step-status {
      max-height: 32px;
      overflow-y: auto;
    }

    &_no-padding {
      height: 100%;
      width: 100%;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: space-between;
      overflow-y: hidden;
      overflow-x: hidden;
    }
  }

  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
  }

  .fade-enter, .fade-leave-to {
    opacity: 0;
  }

  .fa-info-circle {
    font-size: 16px;
  }

  .overHidden {
    overflow-y: hidden;
    overflow-x: hidden;
  }

</style>
