<template lang="pug">
  .jobs__table
    DataTable(
      :fields="fields"
      :tableData="jobs"
      :errors="errors"
      :areErrors="areErrors"
      :isApproveModal="isDeleting"
      :bodyClass="[{ 'tbody_visible-overflow': jobs.length < 6 }]",
      :tableheadRowClass="[{ 'tbody_visible-overflow': jobs.length < 6 }]",
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
        .jobs__data {{ row.step.title }}
      template(slot="status" slot-scope="{ row, index }")
        .jobs__data {{ row.status }}
      template(slot="deadLine" slot-scope="{ row, index }")
        .jobs__data(v-if="row.deadline") {{ formatDeadline(row.deadline) }}
      template(slot="amount" slot-scope="{ row, index }")
        .jobs__data {{ (row.nativeFinance.Price.payables).toFixed(2) }}
          span.jobs__currency(v-if="row.nativeFinance.Price.payables")
          span(v-html='returnIconCurrencyByStringCode("EUR")')
      template(slot="icons" slot-scope="{ row, index }")
        .jobs__icons(v-if="isApproveReject(row)")
          img.jobs__icon(v-for="(icon, key) in icons" :src="icon.icon" @click.stop="makeAction(index, key)" :title="key")
</template>

<script>
	import DataTable from "../../../../../components/overall/DataTable"
	import moment from "moment"
	import { mapGetters, mapActions } from "vuex"
	import currencyIconDetected from "../../../../../mixins/currencyIconDetected"

	export default {
		mixins: [ currencyIconDetected ],
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
					{ label: "Status", headerKey: "headerStatus", key: "status", width: "16%", padding: "0" },
					{ label: "Deadline", headerKey: "headerDeadLine", key: "deadLine", width: "16%", padding: "0" },
					{ label: "Total Amount", headerKey: "headerAmount", key: "amount", width: "10%", padding: "0" },
					{ label: "Action", headerKey: "headerIcons", key: "icons", width: "8%", padding: "0" }
				],
				areErrors: false,
				errors: [],
				isDeleting: false,
				icons: {
					Approved: { icon: require("../../../../../assets/images/Approve-icon.png"), active: true },
					Rejected: { icon: require("../../../../../assets/images/Reject-icon.png"), active: true }
				}
			}
		},
		methods: {
			...mapActions({
				selectJob: "selectJob",
				alertToggle: "alertToggle"
			}),
			chooseJob({ index }) {
				this.selectJob(this.jobs[index])
				this.$router.push(`/dashboard/project-details/${ this.jobs[index].project_Id }/${ this.jobs[index]._id }`)
			},
			closeErrors() {
				this.areErrors = false
			},
			formatDeadline(date) {
				if (date) {
					return moment(date).format('DD-MMM-YYYY')
				}
				return ''
			},
			makeAction(index, key) {
				this.$emit('makeAction', { index, key })
			},
			isApproveReject(row) {
				return row.status === "Request Sent" || row.status === "Created" || row.status === "Quote sent"
			}
		},
		components: {
			DataTable
		}

	}
</script>

<style lang="scss" scoped>

  .jobs {

    &__data {
      height: 30px;
      padding: 0 5px;
      display: flex;
      align-items: center;
      box-sizing: border-box;
    }

    &__drop-menu {
      position: relative;
    }

    &__icons {
      display: flex;
      justify-content: center;
      align-items: center;
      padding-top: 5px;

      img {
        height: 20px;
      }
    }

    &__icon {
      cursor: pointer;
      margin-right: 8px;
      transition: transform 0.1s ease-out;

      &:hover {
        transform: scale(1.2);
      }
    }
  }

</style>
