<template lang="pug">
  .reports
    .filter
      .filter__item
        label Report Id:
        .filter__input
          input(type="text" placeholder="Value" :value="reportIdValue" @change="reportIdSetFilter" @keyup.13="reportIdSetFilter")
          .clear-icon(v-if="reportIdValue.length" @click="removeSelectedInputs('reportId')")
            i.fas.fa-backspace
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
      .options__item
        label Reports Actions:
        .options__input
          SelectSingle
      router-link(class="link-to" :to="{path: `/pangea-finance/invoicing-reports/create-reports`}")
        Button(value="Add Reports")


    .reports__container
      LayoutsTable(
        :fields="fields"
        :tableData="reports"
        :customNumberOfFilterRows="1"
      )
        template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
          .table__header(v-if="field.headerKey === 'headerCheck'")
            CheckBox(:isChecked="isAllSelected" :isWhite="true" @check="toggleAll(true)" @uncheck="toggleAll(false)")
          .table__header(v-else) {{ field.label }}

        template(slot="check" slot-scope="{ row, index }")
          .table__data
            CheckBox(:isChecked="row.isCheck" @check="toggleCheck(index, true)" @uncheck="toggleCheck(index, false)")

        template(slot="reportId" slot-scope="{ row, index }" )
          .table__data
            router-link(class="link-to" :to="{path: `/pangea-finance/invoicing-reports/reports/${row._id}`}")
              span {{ row.reportId }}

        template(slot="dateRange" slot-scope="{ row, index }")
          .table__data(v-html="dateRange(row)")

        template(slot="vendorName" slot-scope="{ row, index }")
          .table__data
            router-link(class="link-to" :to="{path: '/pangea-vendors/all/details/' + row.vendor._id }" target= '_blank')
              span {{ row.vendor.firstName + ' ' + row.vendor.surname }}

        template(slot="status" slot-scope="{ row, index }")
          .table__data {{ row.status }}

        template(slot="jobs" slot-scope="{ row, index }")
          .table__data {{ row.steps.length }}

        template(slot="amount" slot-scope="{ row, index }")
          .table__data
            span.currency(v-html="'&euro;'")
            span {{ getStepsPayables(row.stepFinance) | roundTwoDigit }}

      .table__empty(v-if="!reports.length") Nothing found...

</template>

<script>
	import GeneralTable from '../GeneralTable'
	import LayoutsTable from '../LayoutsTable'
	import moment from "moment"
	import CheckBox from "../CheckBox"
	import SelectMulti from "../SelectMulti"
	import { mapGetters } from "vuex"
	import DatepickerWithTime from "../DatepickerWithTime"
	import SelectSingle from "../SelectSingle"
	import Button from "../Button"

	export default {
		name: "InvoicingReportsList",
		props: {
			reports: {
				type: Array,
				default: []
			}
		},
		data() {
			return {
				highlighted: {
					days: [ 6, 0 ]
				},
				fields: [
					{
						label: "",
						headerKey: "headerCheck",
						key: "check",
						style: { width: "36px" }
					},
					{
						label: "Report Id",
						headerKey: "headerReportId",
						key: "reportId",
						style: { width: "236px" }
					},
					{
						label: "Date Range",
						headerKey: "headerDateRange",
						key: "dateRange",
						style: { width: "300px" }
					},
					{
						label: "Vendor Name",
						headerKey: "headerVendorName",
						key: "vendorName",
						style: { width: "300px" }
					},
					{
						label: "Status",
						headerKey: "headerStatus",
						key: "status",
						style: { width: "200px" }
					},
					{
						label: "Jobs",
						headerKey: "headerJobs",
						key: "jobs",
						style: { width: "200px" }
					},
					{
						label: "Amount",
						headerKey: "headerAmount",
						key: "amount",
						style: { width: "200px" }
					}

				]

			}
		},
		methods: {
			dateRange(row) {
				return `${ this.formattedDate(row.firstPaymentDate) } <span style="color: #999999;"> / </span> ${ this.formattedDate(row.lastPaymentDate) || "-" }`
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
			openDetails(id) {
				this.$emit('openDetails', id)
			},
			formattedDate(date) {
				return moment(date).format("DD-MM-YYYY")
			},
			toggleCheck(index, val) {
				this.reports[index].isCheck = val
			},
			toggleAll(val) {
				this.reports = this.reports.reduce((acc, cur) => {
					acc.push({ ...cur, isCheck: val })
					return acc
				}, [])
				this.isAllSelected = val
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
			}
		},
		computed: {
			...mapGetters({
				vendorsList: "getAllVendorsForOptions"
			}),
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
			}
		},
		components: {
			Button,
			SelectSingle,
			DatepickerWithTime,
			SelectMulti,
			GeneralTable,
			LayoutsTable,
			CheckBox
		}
	}
</script>

<style scoped lang="scss">
  @import "../../assets/scss/colors";

  .reports {
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
</style>