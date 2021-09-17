<template lang="pug">
  .reports
    .reports__wrapper
      .modal
        .modal__block
          ApproveModal(
            v-if="isActionModal"
            :text='`Confirm action: "${selectedReportAction}"`'
            approveValue="Yes"
            notApproveValue="No"
            @approve="manageReportActions"
            @close="closeApproveActionModal"
            @notApprove="closeApproveActionModal"
          )
      .filter
        .filter__item
          label Report Id:
          .filter__input
            input(type="text" placeholder="Value" :value="reportIdValue" @change="reportIdSetFilter" @keyup.13="reportIdSetFilter")
            .clear-icon(v-if="reportIdValue.length" @click="removeSelectedInputs('reportId')")
              i.fas.fa-backspace
        //.filter__item
        //  label Status:
        //  .filter__input
        //    SelectSingle(
        //      :selectedOption="selectedStatus"
        //      :options="['Created', 'Sent', 'Approved', 'Invoice Received', 'Paid']"
        //      placeholder="Option"
        //      @chooseOption="setStatus"
        //      :isRemoveOption="true"
        //      @removeOption="removeStatus"
        //    )
        .filter__item
          label Vendors:
          .filter__input
            SelectMulti(
              :selectedOptions="selectedVendors"
              :options="allVendors"
              :hasSearch="true"
              placeholder="Options"
              @chooseOptions="setVendors"
              :isSelectedWithIcon="true"
              :isRemoveOption="true"
              @removeOption="removeVendors"
            )
        .filter__item
          label Date From:
          .filter__input
            DatepickerWithTime(
              :value="fromDateValue"
              @selected="setFromDate"
              placeholder="Date"
              :isTime="false"
              :highlighted="highlighted"
              :monday-first="true"
              inputClass="datepicker-custom-filter"
              calendarClass="calendar-custom"
              :format="customFormatter"
              :isClearIcon="true"
              @removeSelectedDate="removeFromDate"
            )
        .filter__item
          label Date To:
          .filter__input
            DatepickerWithTime(
              :value="toDateValue"
              @selected="setToDate"
              placeholder="Date"
              :isTime="false"
              :highlighted="highlighted"
              :monday-first="true"
              inputClass="datepicker-custom-filter"
              calendarClass="calendar-custom"
              :format="customFormatter"
              :isClearIcon="true"
              @removeSelectedDate="removeToDate"
            )

      .options
        .options__item(v-if="ifSomeCheck")
          label Reports Actions:
          .options__input
            SelectSingle(
              :options="availableActionOptions",
              placeholder="Action",
              :selectedOption="selectedReportAction",
              @chooseOption="openApproveActionModal"
            )
          .options__description Reports Selected: {{ reports.filter(item => item.isCheck).length }}

        .options__button(v-else)
          router-link(class="link-to" :to="{path: `/pangea-finance/invoicing-payables/create-reports`}")
            Button(value="Add Reports")

      .reports__container
        .modal
          .modal__block
            ApproveModal(
              v-if="deleteRequestId !== ''"
              text="Are you sure?"
              approveValue="Yes"
              notApproveValue="No"
              @approve="deleteRequest"
              @close="closeDeleteRequestModal"
              @notApprove="closeDeleteRequestModal"
            )
        LayoutsTable(
          :fields="fields"
          :tableData="reports"
          :customNumberOfFilterRows="2"
          @bottomScrolled="bottomScrolled"
        )
          template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
            //.table__header(v-if="field.headerKey === 'headerCheck'")
            //  CheckBox(:isChecked="!!isAllSelected" :isWhite="true" @check="toggleAll(true)" @uncheck="toggleAll(false)")
            .table__header {{ field.label }}

          //template(slot="check" slot-scope="{ row, index }")
          //  .table__data
          //    CheckBox(:isChecked="row.isCheck" @check="toggleCheck(index, true)" @uncheck="toggleCheck(index, false)")

          template(slot="reportId" slot-scope="{ row, index }" )
            .table__data
              router-link(class="link-to" :to="{path: `/pangea-finance/invoicing-payables/paid-invoices/${row._id}`}")
                span {{ row.reportId }}

          template(slot="dateRange" slot-scope="{ row, index }")
            .table__data(v-html="dateRange(row)")

          template(slot="vendorName" slot-scope="{ row, index }")
            .table__data
              router-link(class="link-to" :to="{path: '/pangea-vendors/all/details/' + row.vendor._id }" target= '_blank')
                span {{ row.vendor.firstName + ' ' + row.vendor.surname }}

          template(slot="status" slot-scope="{ row, index }")
            .table__data {{ row.status }}

          template(slot="project" slot-scope="{ row, index }")
            .table__data {{getProjectCount(row.stepFinance) }}

          template(slot="jobs" slot-scope="{ row, index }")
            .table__data {{ row.steps.length }}

          template(slot="amount" slot-scope="{ row, index }")
            .table__data
              span.currency(v-html="'&euro;'")
              span {{ getStepsPayables(row.stepFinance) | roundTwoDigit }}

          template(slot="created" slot-scope="{ row, index }")
            .table__data {{ getTime( row.createdAt) }}

          template(slot="updated" slot-scope="{ row, index }")
            .table__data {{ getTime( row.updatedAt) }}

        .table__empty(v-if="!reports.length") Nothing found...

</template>

<script>
	import GeneralTable from '../GeneralTable'
	import LayoutsTable from '../LayoutsTable'
	import moment from "moment"
	import CheckBox from "../CheckBox"
	import SelectMulti from "../SelectMulti"
	import { mapActions, mapGetters } from "vuex"
	import DatepickerWithTime from "../DatepickerWithTime"
	import SelectSingle from "../SelectSingle"
	import Button from "../Button"
	import ApproveModal from "../ApproveModal"

	export default {
		name: "InvoicingPayablesList",
		data() {
			return {
				selectedReportAction: '',
				isActionModal: false,
				reports: [],
				highlighted: {
					days: [ 6, 0 ]
				},
				fields: [
          {
            label: "Report Id",
            headerKey: "headerReportId",
            key: "reportId",
            style: { width: "191px" }
          },
          {
            label: "Vendor Name",
            headerKey: "headerVendorName",
            key: "vendorName",
            style: { width: "210px" }
          },
          {
            label: "Date Range",
            headerKey: "headerDateRange",
            key: "dateRange",
            style: { width: "210px" }
          },
          {
            label: "Status",
            headerKey: "headerStatus",
            key: "status",
            style: { width: "130px" }
          },
          {
            label: "Projects",
            headerKey: "headerProject",
            key: "project",
            style: { width: "100px" }
          },
          {
            label: "Jobs",
            headerKey: "headerJobs",
            key: "jobs",
            style: { width: "100px" }
          },
          {
            label: "Amount",
            headerKey: "headerAmount",
            key: "amount",
            style: { width: "150px" }
          },
          {
            label: "Created On",
            headerKey: "headerCreated",
            key: "created",
            style: { width: "190px" }
          },
          {
            label: "Updated On",
            headerKey: "headerUpdated",
            key: "updated",
            style: { width: "190px" }
          }
        ],
				isDataRemain: true,

				reportId: '',
				vendors: '',
				to: '',
				from: '',
				status: '',

				dataVariables: [
					'reportId',
					'vendors',
					'to',
					'from',
					'status'
				],

				deleteRequestId: ''
			}
		},
		methods: {
			...mapActions(['alertToggle']),
			async manageReportActions() {
        if (this.selectedReportAction === "Delete") {
          await this.deleteChecked()
        }else {
          await this.changeTaskStatus()
        }
			},
      async deleteChecked() {
        await this.$http.post('/invoicing-payables/delete-reports', {
          reportIds: this.reports.filter(i => i.isCheck).map(i => i._id.toString()),
        })
        this.closeApproveActionModal()
        await this.getReports()
      },
      async changeTaskStatus() {
	      const nextStatus = this.selectedReportAction === 'Send Report' ? 'Sent' : this.selectedReportAction
	      try {
		      await this.$http.post('/invoicing-payables/manage-report-status', {
			      reportsIds: this.reports.filter(i => i.isCheck).map(i => i._id.toString()),
			      nextStatus
		      })
		      this.closeApproveActionModal()
		      this.getReports()
	      } catch (error) {
		      this.alertToggle({ message: "Error on Reports Actions", isShow: true, type: "error" })
	      }
      },
			openApproveActionModal({ option }) {
				this.selectedReportAction = option
				this.isActionModal = true
			},
			closeApproveActionModal() {
				this.selectedReportAction = ''
				this.isActionModal = false
			},
			setStatus({ option }) {
				this.replaceRoute('status', option)
			},
			// removeStatus() {
			// 	this.replaceRoute('status', '')
			// },
			getTime(time) {
				return moment(time).format('DD-MM-YYYY, HH:mm')
			},
			dateRange(row) {
				return `${ this.formattedDate(row.firstPaymentDate) } <span style="color: #999999;">  /  </span> ${ this.formattedDate(row.lastPaymentDate) || "-" }`
			},
			removeSelectedInputs(prop) {
				this.replaceRoute(prop, '')
			},
			reportIdSetFilter(e) {
				const { value } = e.target
				this.replaceRoute('reportId', value)
			},
			removeFromDate() {
				this.replaceRoute('from', '')
			},
			removeToDate() {
				this.replaceRoute('to', '')
			},
			setFromDate(data) {
				this.replaceRoute('from', moment(data).format('YYYY-MM-DD'))
			},
			setToDate(data) {
				this.replaceRoute('to', moment(data).format('YYYY-MM-DD'))
			},
			getStepsPayables(stepFinance) {
				return stepFinance.reduce((sum, finance) => {
					sum += finance.payables || 0
					return sum
				}, 0)
			},
      getProjectCount(stepFinance) {
        return [...new Set(stepFinance.map(({projectNativeId}) => projectNativeId ))].length
      },
			openDetails(id) {
				this.$emit('openDetails', id)
			},
			formattedDate(date) {
				return moment(date).format("DD-MM-YYYY")
			},
			toggleCheck(index, val) {
				if(this.isActionModal) return
				this.reports[index].isCheck = val
			},
			toggleAll(val) {
				if(this.isActionModal) return
				this.reports = this.reports.reduce((acc, cur) => {
					acc.push({ ...cur, isCheck: val })
					return acc
				}, [])
			},
			getVendorsIdByFullName(option) {
				const { _id } = this.vendorsList.find(({ firstName, surname }) => `${ firstName } ${ surname }` === option)
				return _id
			},
			replaceRoute(key, value) {
				let query = this.$route.query
				delete query[key]
				this.$router.replace({ path: this.$route.path, query: { ...query, [key]: value } })
			},
			removeVendors() {
				this.replaceRoute('vendors', '')
			},
			setVendors({ option }) {
				if (!this.$route.query.vendors) {
					this.replaceRoute('vendors', this.getVendorsIdByFullName(option))
					return
				}
				let _ids = this.$route.query.vendors.split(',')
				if (_ids.includes(this.getVendorsIdByFullName(option))) _ids = _ids.filter(_id => _id !== this.getVendorsIdByFullName(option))
				else _ids.push(this.getVendorsIdByFullName(option))
				this.replaceRoute('vendors', _ids.join(','))
			},
			querySetter(vm, to) {
				for (let variable of this.dataVariables) if (to.query[variable] != null) vm[variable] = to.query[variable]
			},
			defaultSetter() {
				for (let variable of this.dataVariables) this[variable] = ''
			},
			requestToDeleteRequest(id) {
				this.deleteRequestId = id
				console.log(id)
			},
			async deleteRequest() {
				await this.$http.get(`/invoicing-payables/report/${ this.deleteRequestId }/delete`)
        await this.getReports()
				this.closeDeleteRequestModal()
			},
			closeDeleteRequestModal() {
				this.deleteRequestId = ''
			},
			async getReports() {
				this.reports = (await this.$http.post('/invoicing-payables/paid-reports', {
					countToSkip: 0,
					countToGet: 100,
					filters: this.allFilters
				})).data.map(i => ({ ...i, isCheck: false }))
			},
			async bottomScrolled() {
				if (this.isDataRemain) {
					const result = await this.$http.post("/invoicing-payables/paid-reports", {
						filters: this.allFilters,
						countToSkip: this.reports.length,
						countToGet: 100
					})
					this.reports.push(...result.data.map(i => ({ ...i, isCheck: false })))
					this.isDataRemain = result.data.length === 50
				}
			}
		},
		computed: {
			...mapGetters({
				vendorsList: "getAllVendorsForOptions"
			}),
			availableActionOptions() {
				if (this.reports && this.reports.length) {
					if (this.reports.filter(i => i.isCheck).every(i => i.status === 'Created')) {
						return [ 'Send Report', "Delete" ]
					}
				}
			},
			allFilters() {
				const filters = {}
				for (let variable of this.dataVariables) filters[variable] = this[variable]
				return filters
			},
			ifSomeCheck() {
				return this.reports.length && this.reports.some(item => item.isCheck)
			},
			// selectedStatus() {
			// 	return this.$route.query.status || ''
			// },
			selectedVendors() {
				return this.$route.query.vendors && this.vendorsList.length
						? this.$route.query.vendors.split(',').map(_id => {
							const vendor = this.vendorsList.find(vendor => _id === vendor._id)
							return vendor ? `${ vendor.firstName } ${ vendor.surname }` : ''
						})
						: []
			},
			allVendors() {
				return this.vendorsList.map(({ firstName, surname }) => `${ firstName } ${ surname }`)
			},
			fromDateValue() {
				return this.$route.query.from || ''
			},
			toDateValue() {
				return this.$route.query.to || ''
			},
			reportIdValue() {
				return this.$route.query.reportId || ''
			},
			isAllSelected() {
				return (this.reports && this.reports.length) && this.reports.every(i => i.isCheck)
			}
		},
		beforeRouteEnter(to, from, next) {
			next((vm) => {
				vm.defaultSetter()
				vm.querySetter(vm, to)
				vm.getReports()
			})
		},
		watch: {
			$route(to, from) {
				if (to.path === from.path) {
					this.querySetter(this, to)
					this.getReports()
				}
			}
		},
		components: {
			Button,
			SelectSingle,
			DatepickerWithTime,
			SelectMulti,
			GeneralTable,
			LayoutsTable,
			CheckBox,
			ApproveModal
		}
	}
</script>

<style scoped lang="scss">
  @import "../../assets/scss/colors";

  .fa-trash {
    cursor: pointer;
  }

  .reports {
    position: relative;
    width: 1530px;
    margin: 50px;
    background: #fff;

    &__wrapper {
      position: relative;
      border-radius: 4px;
      padding: 20px;
      box-sizing: border-box;
      box-shadow: 0 1px 2px 0 rgba(99, 99, 99, .3), 0 1px 3px 1px rgba(99, 99, 99, .15);
    }

    &__container {
      margin-top: 15px;
    }
  }

  .filter {
    display: flex;
    flex-wrap: wrap;

    &__item {
      position: relative;
      margin-bottom: 15px;
      margin-right: 25px;
      width: 220px;
    }

    &__input {
      position: relative;
      height: 32px;
    }
  }

  .options {
    display: flex;
    flex-wrap: wrap;
    position: absolute;
    top: 20px;
    right: 20px;
    align-items: center;

    &__description {
      opacity: .5;
      margin-top: 5px;
    }

    &__button {
      height: 66px;
      display: flex;
      align-items: center;
    }

    &__item {
      position: relative;
      margin-bottom: 15px;
      margin-right: 25px;
      width: 220px;
    }

    &__input {
      position: relative;
      height: 32px;
    }
  }

  .table {
    &__icon {
      width: 100%;
      align-items: center;
      display: flex;
      justify-content: center;
      font-size: 15px;
    }

    &__header {
      padding: 0 7px;
    }

    &__empty {
      margin-top: 10px;
    }
  }

  .fa-backspace {
    font-size: 16px;
    transition: .2s ease-out;
    color: $dark-border;
    cursor: pointer;
    position: absolute;
    right: 8px;
    top: 8px;

    &:hover {
      color: $text;
    }
  }

  .clickable-element {
    cursor: pointer;
  }

  a {
    color: inherit;
    text-decoration: none;
    transition: .2s ease-out;

    &:hover {
      text-decoration: underline;
    }
  }

  label {
    display: block;
    margin-bottom: 3px;
    font-family: 'Myriad600';
  }

  input {
    font-size: 14px;
    color: $text;
    border: 1px solid $border;
    border-radius: 4px;
    box-sizing: border-box;
    padding: 0 7px;
    outline: none;
    height: 32px;
    transition: .1s ease-out;
    width: 220px;
    font-family: 'Myriad400';

    &:focus {
      border: 1px solid $border-focus;
    }
  }

  .currency {
    margin-right: 4px;
    color: $dark-border;
  }

  .modal {
    position: relative;

    &__block {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, 50%);
      z-index: 50;
    }
  }
</style>