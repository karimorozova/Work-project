<template lang="pug">
  .steps
    .steps__action
      .steps__title Step Action
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
      DataTable(
        :fields="fields"
        :tableData="allSteps"
        :activeIndex="activeIndex"
        :bodyClass="['steps-table-body', {'tbody_visible-overflow': allSteps.length < 10}]"
        :tableheadRowClass="allSteps.length < 10 ? 'tbody_visible-overflow' : ''"
        bodyCellClass="steps-table-cell"
        bodyRowClass="steps-table-row"
        :headCellClass="'padding-with-check-box'"
      )
        template(slot="headerCheck" slot-scope="{ field }")
          CheckBox(:isChecked="isAllSelected" :isWhite="true" @check="(e)=>toggleAll(e, true)" @uncheck="(e)=>toggleAll(e, false)" customClass="tasks-n-steps")
        template(slot="headerName" slot-scope="{ field }")
          span.steps__label {{ field.label }}
        template(slot="headerLanguage" slot-scope="{ field }")
          span.steps__label {{ field.label }}
        template(slot="headerVendor" slot-scope="{ field }")
          span.steps__label {{ field.label }}
        template(slot="headerStart" slot-scope="{ field }")
          span.steps__label {{ field.label }}
        template(slot="headerDeadline" slot-scope="{ field }")
          span.steps__label {{ field.label }}
        template(slot="headerProgress" slot-scope="{ field }")
          span.steps__label {{ field.label }}
        template(slot="headerStatus" slot-scope="{ field }")
          span.steps__label {{ field.label }}
        template(slot="headerReceivables" slot-scope="{ field }")
          span.steps__label {{ field.label }}
        template(slot="headerPayables" slot-scope="{ field }")
          span.steps__label {{ field.label }}
        template(slot="headerMargin" slot-scope="{ field }")
          span.steps__label {{ field.label }}
        template(slot="check" slot-scope="{ row, index }")
          CheckBox(:isChecked="row.check" @check="(e)=>toggleCheck(e, index, true)" @uncheck="(e)=>toggleCheck(e, index, false)" customClass="tasks-n-steps")
          .steps__info-icon(@click="showStepDetails(index)")
            i.fa.fa-info-circle
        template(slot="name" slot-scope="{ row }")
          span.steps__step-data.steps_no-padding {{ row.name }}
        template(slot="language" slot-scope="{ row }")
          span.steps__step-data {{ getStepPair(row) }}

        template(slot="vendor" slot-scope="{ row, index }")
          .steps__vendor-menu(v-if="isVendorSelect(row.status)")
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

          span.steps_no-padding(v-if="!isVendorSelect(row.status)") {{ vendorName(row.vendor) }}
            .steps__vendor-replace(v-if="row.vendor && row.status === 'Started'")
              img.steps__replace-icon(src="../../../assets/images/replace_person.png" @click="showReassignment(index)")
              .steps__tooltip Reassign Vendor
            span.steps__step-no-select(v-if="!row.vendor") No Vendor

        template(slot="start" slot-scope="{ row, index }")
          Datepicker(
            @selected="(e) => changeDate(e, 'start', index)"
            v-model="row.start"
            inputClass="steps__custom-input"
            calendarClass="steps__calendar-custom"
            :format="customFormatter"
            monday-first=true
            :disabledPicker="isDatePickDisabled"
            :highlighted="highlighted"
            @scrollDrop="scrollDrop")
        template(slot="deadline" slot-scope="{ row, index }")
          Datepicker(
            @selected="(e) => changeDate(e, 'deadline', index)"
            v-model="row.deadline"
            inputClass="steps__custom-input"
            calendarClass="steps__calendar-custom"
            :format="customFormatter"
            monday-first=true
            :disabled="disabled"
            :disabledPicker="isDatePickDisabled"
            :highlighted="highlighted"
            @scrollDrop="scrollDrop")
        template(slot="progress" slot-scope="{ row, index }")
          ProgressLineStep(:progress="progress(row.progress)" :lastProgress="lastProgress(row, index)")
        template(slot="status" slot-scope="{ row }")
          span.steps__step-status {{ row.status | stepsAndTasksStatusFilter }}
        template(slot="receivables" slot-scope="{ row }")
          span.steps__money(v-if="isShowValue(row, 'receivables')")
            span(v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
            span.steps__step-data(v-if="row.finance.Price.receivables !== '' && row.status !== 'Cancelled Halfway'") {{ (row.finance.Price.receivables).toFixed(2) }}
            span.steps__step-data(v-if="row.finance.Price.hasOwnProperty('halfReceivables')") {{ (row.finance.Price.halfReceivables).toFixed(2) }}

        template(slot="payables" slot-scope="{ row }")
          span.steps__money(v-if="isShowValue(row, 'payables')")
            span(v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
            span.steps__step-data(v-if="row.finance.Price.payables !== '' && row.status !== 'Cancelled Halfway'") {{ (row.finance.Price.payables).toFixed(2) }}
            span.steps__step-data(v-if="row.finance.Price.hasOwnProperty('halfPayables')") {{ (row.finance.Price.halfPayables).toFixed(2) }}
        template(slot="margin" slot-scope="{ row }")
          span.steps__money(v-if="marginCalc(row)")
            span(v-html="returnIconCurrencyByStringCode(currentProject.projectCurrency)")
          span.steps__step-data(v-if="marginCalc(row)") {{ marginCalc(row) }}
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
        @close="closeApproveModal")
    ValidationErrors(v-if="areErrorsExist"
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

	const Datepicker = () => import("../../Datepicker")
	const ValidationErrors = () => import("../../ValidationErrors")
	import moment from "moment"
	import scrollDrop from "@/mixins/scrollDrop"
	import stepVendor from "@/mixins/stepVendor"
	import currencyIconDetected from "../../../mixins/currencyIconDetected"

	import { mapGetters, mapActions } from 'vuex'
	import ProgressLineStep from "../../ProgressLineStep"

	export default {
		mixins: [scrollDrop, stepVendor, currencyIconDetected],
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
					days: [6, 0]
				},
				disabled: {
					to: moment().add(-1, 'day').endOf('day').toDate()
				},
				tabs: ['Tasks', 'Steps'],
				fields: [
					{ label: "Check", headerKey: "headerCheck", key: "check", width: "5%" },
					{ label: "Step", headerKey: "headerName", key: "name", width: "9%", padding: 0 },
					{ label: "Language", headerKey: "headerLanguage", key: "language", width: "12%" },
					{ label: "Vendor name", headerKey: "headerVendor", key: "vendor", width: "13%", padding: 0 },
					{ label: "Start", headerKey: "headerStart", key: "start", width: "9%" },
					{ label: "Deadline", headerKey: "headerDeadline", key: "deadline", width: "9%" },
					{ label: "Progress", headerKey: "headerProgress", key: "progress", width: "8%" },
					{ label: "Status", headerKey: "headerStatus", key: "status", width: "9%", padding: 0 },
					{ label: "Receivables", headerKey: "headerReceivables", key: "receivables", width: "9%" },
					{ label: "Payables", headerKey: "headerPayables", key: "payables", width: "9%" },
					{ label: "Margin", headerKey: "headerMargin", key: "margin", width: "8%" }
				],
				selectedVendors: [],
				actions: ["Mark as accept/reject", "Request confirmation"],
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
				currentStepIdForRemoveVendor: null
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
				if (step.packageSize) {
					return `${ step.targetLanguage } / ${ step.packageSize }`
				}
				return `${ step.sourceLanguage } >> ${ step.targetLanguage }`
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
				return prog.totalWordCount ? ((prog.wordsDone / prog.totalWordCount) * 100).toFixed(2) : prog
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
			isScrollDrop(drop, elem) {
				return drop && elem.clientHeight >= 320
			},
			customFormatter(date) {
				return moment(date).format('DD-MM-YYYY')
			},
			toggleVendors({ isAll }) {
				this.isAllShow = isAll
			},
			isVendorSelect(status) {
				const validStatuses = ['Started', 'Cancelled', 'Cancelled Halfway', 'Completed']
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
					this.showErrors(['This vendor has already been assigned to a related step'])
				}
			},
			async setAction({ option }) {
				if (option !== "No action available") {
					this.selectedAction = option
					this.setModalTexts(option)
					this.isApproveActionShow = true
				}
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
							if (assignedSteps.length) {
								await this.decideOnSteps(assignedSteps, "Accepted")
							}
							break
						case "ReOpen":
							const steps = checkedSteps.filter(item => item.status === "Completed")
							await this.reopenSteps(steps)
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
						this.showErrors([`One or more steps could not be ${ selectedStatus.toLowerCase() } as payables are missing`])
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
				if (!checkedSteps.length) {
					return this.closeApproveModal()
				}
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
				if (zeroPayablesStep) {
					return this.showErrors(["There are steps with no payables!"])
				}
				try {
					const result = await this.$http.post('/pm-manage/vendor-request', { checkedSteps: filteredSteps, projectId: this.currentProject._id })
					await this.setCurrentProject(result.body)
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
			toggleAll(e, val) {
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
			changeDate(e, prop, index) {
				this.$emit('setDate', { date: new Date(e), prop, index })
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
				vendors: "getVendors",
				userGroup: "getUserGroup"
			}),
			stepActions() {
				let result = this.actions
				const requestedStep = this.allSteps.find(item => item.status === "Request Sent" || item.status === "Created")
				const completedStep = this.allSteps.find(item => item.status === "Completed")
				if (!requestedStep && result.indexOf("Mark as accept/reject") !== -1) {
					result = []
				}
				if (completedStep && result.indexOf("ReOpen") === -1) {
					result.push("ReOpen")
				}
				if (!result.length) {
					result = ["No action available"]
				}
				return result
			},
			isAllSelected() {
				const unchecked = this.currentProject.steps.find(item => !item.check)
				return !unchecked
			},
			isDatePickDisabled() {
				const statuses = ["Closed", "Rejected", "Cancelled", "Cancelled Halfway"]
				return statuses.indexOf(this.currentProject.status) !== -1
			}
		},
		components: {
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

  .steps {
    display: flex;
    flex-direction: column;

    &__table {
      position: relative;
    }

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

    &__info {
      position: absolute;
      top: -300px;
      left: 10%;
      width: 80%;
      z-index: 50;
      background-color: $white;
      box-shadow: 0 2px 4px 0 rgba(103, 87, 62, .3), 0 2px 16px 0 rgba(103, 87, 62, .2);
      margin-bottom: 120px;
    }

    &__info-icon {
      height: 19px;
      i {
        color: $main-color;
        opacity: 0.7;
        transition: all 0.3s;
        cursor: pointer;
        margin-top: 2px;
        margin-left: 5px;

        &:hover {
          opacity: 1;
        }
      }
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
      width: 110px;
      position: absolute;
      right: 25px;
      top: 0;
      display: none;
      background-color: $white;
      color: $orange;
      box-sizing: border-box;
      padding: 3px;
      border-radius: 8px;
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
      height: 29px;
    }

    &__reassignment {
      position: absolute;
      z-index: 100;
      left: 0;
      top: 0;
      bottom: 0;
      right: 0;
    }

    &__approve-action {
      position: absolute;
      right: 0;
      z-index: 50;
      background-color: $white;
    }

    &__step-status {
      padding-left: 5px;
      max-height: 32px;
      overflow-y: auto;
    }

    &_no-padding {
      height: 100%;
      width: 100%;
      max-height: 30px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-left: 5px;
      overflow-y: auto;
      overflow-y: hidden;
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

</style>
