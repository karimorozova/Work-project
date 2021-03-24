<template lang="pug">
  .closed-jobs
    .jobs_block
      .jobs_block__title Completed Jobs
      .jobs
        Filters(
          :startFilter="startFilter"
          :deadFilter="deadFilter"
          :invoiceDateFilter="invoiceDateFilter"
          :jobTypeFilter="jobTypeFilter.title"
          @setJobTypeFilter="setJobTypeFilter"
          @setInvoiceDateFilter="(option) => setFilter(option, 'invoiceDateFilter')"
          @requestOnFilterStartDate="requestOnFilterStartDate"
          @requestOnFilterDeadline="requestOnFilterDeadline"
        )
        .jobs__table
          DataTable(
            :fields="fields"
            :tableData="filteredJob"
            :errors="errors"
            :areErrors="areErrors"
            :isApproveModal="isDeleting"
            :bodyClass="['vendors-table__body',{'tbody_visible-overflow': filteredJob.length < 14}]"
            :tableheadRowClass="[{ 'tbody_visible-overflow': filteredJob.length < 14 }]",
            @closeErrors="closeErrors"
            @onRowClicked="chooseJob"
          )
            template(slot="headerJobId" slot-scope="{ field }")
              .jobs__head-title {{ field.label }}
            template(slot="headerProjectName" slot-scope="{ field }")
              .jobs__head-title {{ field.label }}
            template(slot="headerType" slot-scope="{ field }")
              .jobs__head-title {{ field.label }}
            template(slot="headerDeadline" slot-scope="{ field }")
              .jobs__head-title {{ field.label }}
            template(slot="headerAmount" slot-scope="{ field }")
              .jobs__head-title {{ field.label }}
            template(slot="headerInvoiceDate" slot-scope="{ field }")
              .jobs__head-title {{ field.label }}
            template(slot="jobId" slot-scope="{ row, index }")
              .jobs__data(v-if="currentActive !== index") {{ row.stepId }}
            template(slot="projectName" slot-scope="{ row, index }")
              .jobs__data(v-if="currentActive !== index") {{ row.projectName }}
            template(slot="type" slot-scope="{ row, index }")
              .jobs__data {{ row.name }}
            template(slot="deadline" slot-scope="{ row, index }")
              .jobs__data(v-if="currentActive !== index") {{ formatDeadline(row.deadline) }}
            template(slot="amount" slot-scope="{ row, index }")
              .jobs__data(v-if="currentActive !== index") {{ (row.nativeFinance.Price.payables).toFixed(2) }}
                span.jobs__currency(v-if="row.nativeFinance.Price.payables")
                span(v-html='returnIconCurrencyByStringCode("EUR")')
            template(slot="invoiceDate" slot-scope="{ row, index }")
              .jobs__data(v-if="currentActive !== index") {{ row.invoiceDate }}
    nuxt-child
</template>

<script>
	import moment from 'moment'
	import DataTable from "../../../components/overall/DataTable"
	import Filters from "../../components/jobs/Tables/Completed_Jobs/Filters"
	import { mapGetters, mapActions } from "vuex"
	import currencyIconDetected from "../../../mixins/currencyIconDetected"

	export default {
		mixins:[currencyIconDetected],
		data() {
			return {
				fields: [
					{ label: "Job ID", headerKey: "headerJobId", key: "jobId", width: "28%", padding: "0" },
					{ label: "Project Name", headerKey: "headerProjectName", key: "projectName", width: "20%", padding: "0" },
					{ label: "Type", headerKey: "headerType", key: "type", width: "13%", padding: "0" },
					{ label: "Deadline", headerKey: "headerDeadline", key: "deadline", width: "13%", padding: "0" },
					{ label: "Total Amount", headerKey: "headerAmount", key: "amount", width: "13%", padding: "0" },
					{ label: "Invoice date", headerKey: "headerInvoiceDate", key: "invoiceDate", width: "13%", padding: "0" }
				],
				isTableDropMenu: true,
				currentActive: -1,
				areErrors: false,
				errors: [],
				isDeleting: false,
				deleteIndex: -1,
				startDateFilter: { from: "", to: "" },
				deadlineFilter: { from: "", to: "" },
				jobTypeFilter: {title: "All"},
				invoiceDateFilter: "All"
			}
		},
		methods: {
			...mapActions({
				getJobs: "getJobs",
				selectJob: "selectJob",
				alertToggle: "alertToggle"
			}),
			chooseJob({ index }) {
				this.selectJob(this.completedJobs[index])
				this.$router.push(`/completed-jobs/project-details/${ this.completedJobs[index]._id }`)
			},
			closeErrors() {
				this.areErrors = false
			},
			async checkErrors(index) {

			},
			requestOnFilterStartDate(data) {
				if (data.isTouched) {
					this.startDateFilter = { from: data.from, to: data.to }
					this.filterJobs()
				}
				this.currentFormVisible = false
			},
			requestOnFilterDeadline(data) {
				if (data.isTouched) {
					this.deadlineFilter = { from: data.from, to: data.to }
					this.filterJobs()
				}
				this.currentFormVisibleOther = false

			},

			setFilter({ option }, prop) {
				this[prop] = option
				this.filterJobs()
			},
			setJobTypeFilter({ step }) {
				this.jobTypeFilter = step
			},

			filterJobs() {
				this.filteredJobs = this.completedJobs

				if (this.invoiceDateFilter && this.invoiceDateFilter !== 'All') {
					this.filteredJobs = this.filteredJobs.filter(item => item.invoiceDate === this.invoiceDateFilter)
				}

			},
			formatDeadline(date) {
				if (date) {
					return moment(date).format('DD-MMM-YYYY')
				}
				return ''
			}
		},
		computed: {
			...mapGetters({
				jobs: "getAllJobs"
			}),
      filteredJob () {
			  let result = this.completedJobs
        if (this.jobTypeFilter.title !== "All") {
          result = result.filter(item => {
           return  item.serviceStep.step === this.jobTypeFilter._id
        })
        }

        if (this.startDateFilter.from) {
          result = result.filter(item => (
            moment(item.start).isSameOrAfter(moment(this.startDateFilter.from).set({"hour": 0, "minute": 0}))
            && moment(item.start).isSameOrBefore(moment(this.startDateFilter.to).set({"hour": 23, "minute": 59}))
          ))
        }

        if (this.deadlineFilter.from) {
          result = result.filter(item => (
            moment(item.deadline).isSameOrAfter(moment(this.deadlineFilter.from).set({"hour": 0, "minute": 0}))
            && moment(item.deadline).isSameOrBefore(moment(this.deadlineFilter.to).set({"hour": 23, "minute": 59}))
          ))
        }

			  return result
      },
			startFilter() {
				let result = ""
				if (this.startDateFilter.from) {
					result = moment(this.startDateFilter.from).format('DD-MM-YYYY') + ' / ' + moment(this.startDateFilter.to).format('DD-MM-YYYY')
				}
				return result
			},
			deadFilter() {
				let result = ""
				if (this.deadlineFilter.from) {
					result = moment(this.deadlineFilter.from).format('DD-MM-YYYY') + ' / ' + moment(this.deadlineFilter.to).format('DD-MM-YYYY')
				}
				return result
			},
			completedJobs() {
				let result = []
				if (this.jobs.length) {
					result = this.jobs.filter(job => job.status === "Completed" || job.status === "Cancelled" || job.status === "Cancelled Halfway")
				}
				return result
			}
		},
		components: {
			DataTable,
			Filters
		},
		mounted() {
			this.getJobs()
		}
	}
</script>

<style lang="scss" scoped>
  @import '../../../assets/scss/colors.scss';

  .closed-jobs {
    width: 100%;
    padding: 20px 40px;

    .jobs_block {
      color: $main-color;

      &__title {
        margin: 30px 0 10px;
        font-family: Myriad400;
        font-size: 20px;
      }

      .jobs {
        width: 1040px;
        height: auto;
        background-color: $white;
        box-shadow: 0 2px 4px 0 rgba(103, 87, 62, .3), 0 2px 16px 0 rgba(103, 87, 62, .2);
        box-sizing: border-box;
        padding: 20px 20px 0.1px 20px;

        position: relative;

        &__data, &__editing-data {
          height: 30px;
          padding: 0 5px;
          display: flex;
          align-items: center;
          box-sizing: border-box;
        }

        &__editing-data, &__drop-menu {
          box-shadow: inset 0 0 7px $brown-shadow;
        }

        &__drop-menu {
          position: relative;
        }

        &__data-input {
          box-sizing: border-box;
          width: 100%;
          border: none;
          outline: none;
          color: $main-color;
        }

        &__icons {
          padding-top: 3px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        &__icon {
          cursor: pointer;
          opacity: 0.5;
          margin-right: 8px;
          transition: transform 0.1s ease-out;

          &:hover {
            transform: scale(1.2);
          }
        }

        &_opacity {
          opacity: 1;
        }
      }
    }

  }

</style>
