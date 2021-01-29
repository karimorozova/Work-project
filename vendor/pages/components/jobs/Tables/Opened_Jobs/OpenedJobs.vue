<template lang="pug">
  .jobs__table
    DataTable(
      :fields="fields"
      :tableData="jobs"
      :errors="errors"
      :areErrors="areErrors"
      :isApproveModal="isDeleting"
      :bodyClass="jobs.length < 7 ? 'tbody_height-200 tbody_visible-overflow' : 'tbody_height-200'"
      :tableHeadRowClass="jobs.length < 7 ? 'tbody_visible-overflow' : ''"
      @closeErrors="closeErrors"
      @onRowClicked="chooseJob"
    )
      template(slot="headerJobId" slot-scope="{ field }")
        .jobs__head-title {{ field.label }}
      template(slot="headerProjectName" slot-scope="{ field }")
        .jobs__head-title {{ field.label }}
      template(slot="headerType" slot-scope="{ field }")
        .jobs__head-title {{ field.label }}
      template(slot="headerStatus" slot-scope="{ field }")
        .jobs__head-title {{ field.label }}
      template(slot="headerProgress" slot-scope="{ field }")
        .jobs__head-title {{ field.label }}
      template(slot="headerDeadLine" slot-scope="{ field }")
        .jobs__head-title {{ field.label }}
      template(slot="headerAmount" slot-scope="{ field }")
        .jobs__head-title {{ field.label }}
      template(slot="headerIcons" slot-scope="{ field }")
        .jobs__head-title {{ field.label }}
      template(slot="jobId" slot-scope="{ row, index }")
        .jobs__data {{ row.stepId }}
      template(slot="projectName" slot-scope="{ row, index }")
        .jobs__data {{ row.projectName }}
      template(slot="type" slot-scope="{ row, index }")
        .jobs__data {{ row.name }}
      template(slot="status" slot-scope="{ row, index }")
        .jobs__data {{ row.status | stepStatusFilter }}
      template(slot="progress" slot-scope="{ row, index }")
        .jobs__data
          ProgressLine(:progress="progress(row.progress)")
      template(slot="deadLine" slot-scope="{ row, index }")
        .jobs__data(v-if="row.deadline") {{ formatDeadline(row.deadline) }}
      template(slot="amount" slot-scope="{ row, index }")
        .jobs__data {{ row.nativeFinance.Price.payables }}
          span.jobs__currency(v-if="row.nativeFinance.Price.payables")
          span(v-html='returnIconCurrencyByStringCode("EUR")')
      template(slot="icons" slot-scope="{ row, index }")
        .jobs__icons(v-if="!isApproveReject(row)")
          img.jobs__icon(v-if="isCompleteIcon(row)" src="../../../../../assets/images/complete-icon_small.png" @click.stop="showModal(index)")
          img.jobs__icon(v-if="isEnterIcon(row.status)" src="../../../../../assets/images/enter-icon.png")
        .jobs__icons(v-else)
          img.jobs__icon(v-for="(icon, key) in icons" :src="icon.icon" @click.stop="makeAction(index, key)" :title="key")
</template>

<script>
	import DataTable from "~/components/Tables/DataTable"
	import ProgressLine from "~/components/ProgressLine"
	import moment from "moment"
	import ClickOutside from "vue-click-outside"
	import { mapGetters, mapActions } from "vuex"
	import currencyIconDetected from "../../../../../mixins/currencyIconDetected"

	export default {
		mixins: [currencyIconDetected],
		props: {
			jobs: {
				type: Array
			}
		},
		data() {
			return {
				fields: [
					{ label: "Job ID", headerKey: "headerJobId", key: "jobId", width: "20%", padding: "0" },
					{ label: "Project Name", headerKey: "headerProjectName", key: "projectName", width: "20%", padding: "0" },
					{ label: "Type", headerKey: "headerType", key: "type", width: "10%", padding: "0" },
					{ label: "Status", headerKey: "headerStatus", key: "status", width: "10.6%", padding: "0" },
					{ label: "Progress", headerKey: "headerProgress", key: "progress", width: "10.6%", padding: "0" },
					{ label: "Deadline", headerKey: "headerDeadLine", key: "deadLine", width: "10.6%", padding: "0" },
					{ label: "Total Amount", headerKey: "headerAmount", key: "amount", width: "10%", padding: "0" },
					{ label: "Action", headerKey: "headerIcons", key: "icons", width: "8.2%", padding: "0" }
				],
				areErrors: false,
				errors: [],
				isDeleting: false,
				icons: {
					Approve: { icon: require("../../../../../assets/images/Approve-icon.png"), active: true },
					Reject: { icon: require("../../../../../assets/images/Reject-icon.png"), active: true }
				}
			}
		},
		methods: {
			...mapActions({
				selectJob: "selectJob",
				alertToggle: "alertToggle"
			}),
			makeAction(index, key) {
				this.$emit('makeAction', { index, key })
			},
			chooseJob({ index }) {
				this.selectJob(this.jobs[index])
				this.$router.push(`/dashboard/project-details/${ this.jobs[index].project_Id }/${ this.jobs[index]._id }`)
			},
			closeErrors() {
				this.areErrors = false
			},
			formatDeadline(date) {
				return moment(date).format('DD-MMM-YYYY')
			},
			isApproveReject(row) {
				return row.status === "Request Sent" || row.status === "Created" || row.status === "Quote sent"
			},
			isEnterIcon(status) {
				const statuses = ["Accepted", "Ready to Start", "Started"]
				return statuses.indexOf(status) !== -1
			},
			isCompleteIcon(row) {
				return this.progress(row.progress) >= 100 && row.status === "Started"
			},
			progress(prog) {
				return prog.totalWordCount ? ((prog.wordsDone / prog.totalWordCount) * 100).toFixed(2) : prog
			},
			showModal(index) {
				this.$emit("showModal", { index })
			}
		},
		filters: {
			stepStatusFilter: (status) => status === 'Started' ? 'In progress' : status
		},
		components: {
			DataTable,
			ProgressLine
		},
		directives: {
			ClickOutside
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../../../assets/scss/colors.scss";

  .jobs {

    &__data {
      height: 30px;
      padding: 0 5px;
      display: flex;
      align-items: center;
      box-sizing: border-box;
    }

    &__icons {
      padding-top: 5px;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
    }

    &__icon {
      cursor: pointer;
      margin-right: 8px;
      transition: transform 0.1s ease-out;


      &:hover {
        transform: scale(1.1);
      }
    }

    &_disable {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }

</style>

