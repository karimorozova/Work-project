<template lang="pug">
  .table

    .table__filters(ref="filter")
      ProjectsLayoutFilter

    .table__result
      LayoutsTable(
        :fields="filteredFields"
        :tableData="list"
        :maxHeight="maxHeight"
        @bottomScrolled="bottomScrolled"
      )
        template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
          .table__header {{ field.label }}

        template(slot="projectId" slot-scope="{ row, index }")
          .table__data
            router-link(class="link-to" :to="{path: `/pangea-projects/all-projects/All/details/${row._id}`}")
              span {{row.projectId}}

        template(slot="projectName" slot-scope="{ row, index }")
          .table__data
            router-link(class="link-to" :to="{path: `/pangea-projects/all-projects/All/details/${row._id}`}")
              span {{row.projectName}}

        template(slot="clientName" slot-scope="{ row, index }")
          .table__data {{row.customer.name}}

        template(slot="languages" slot-scope="{ row, index }")
          .table__data(v-html="projectLanguages(row.tasks)")

        template(slot="startDate" slot-scope="{ row, index }")
          .table__data {{ customFormatter(row.startDate) }}

        template(slot="deadline" slot-scope="{ row, index }")
          .table__data {{ customFormatter(row.deadline) }}

        template(slot="projectManager" slot-scope="{ row, index }")
          .table__data {{ row.projectManager.firstName }} {{ row.projectManager.lastName }}

        template(slot="accountManager" slot-scope="{ row, index }")
          .table__data {{ row.accountManager.firstName }} {{ row.accountManager.lastName }}

        template(slot="industry" slot-scope="{ row, index }")
          .table__data {{ row.industry.name }}

        template(slot="services" slot-scope="{ row, index }")
          .table__data {{ servicesToString(row.tasks) }}

        template(slot="isTest" slot-scope="{ row, index }")
          .table__data(v-if="row.isTest")
            i.fas.fa-check
          .table__data(v-else) -

        template(slot="urgent" slot-scope="{ row, index }")
          .table__data(v-if="row.isUrgent")
            i.fas.fa-check
          .table__data(v-else) -

        template(slot="payables" slot-scope="{ row, index }")
          .table__data(v-if="row.finance.Price.payables")
            span.currency(v-html="currency(row.projectCurrency)")
            span {{ price(row.finance.Price.payables) }}
          .table__data(v-else) -

        template(slot="receivables" slot-scope="{ row, index }")
          .table__data(v-if="row.finance.Price.receivables")
            span.currency(v-html="currency(row.projectCurrency)")
            span {{ price(row.finance.Price.receivables) }}
          .table__data(v-else) -

        template(slot="margin" slot-scope="{ row, index }")
          .table__data(v-if="row.finance.Price.receivables && row.finance.Price.payables")
            span.currency(v-html="currency(row.projectCurrency)")
            span {{ price(row.finance.Price.receivables - row.finance.Price.payables) }}
          .table__data(v-else) -

        template(slot="marginPercentage" slot-scope="{ row, index }")
          .table__data(v-if="row.finance.Price.receivables && row.finance.Price.payables")
            span {{ price( (1 - (row.finance.Price.payables / row.finance.Price.receivables)) * 100 ) }}
            span.symbol %
          .table__data(v-else) -

        template(slot="roi" slot-scope="{ row, index }")
          .table__data {{ roi(row.roi) }}

        template(slot="projectCurrency" slot-scope="{ row, index }")
          .table__data(v-if="row.projectCurrency") {{ row.projectCurrency }}
          .table__data(v-else) -

        template(slot="status" slot-scope="{ row, index }")
          .table__data {{ row.status }}

        template(slot="paymentProfile" slot-scope="{ row, index }")
          .table__data(v-if="row.paymentProfile ") {{ row.paymentProfile }}
          .table__data(v-else) -

        template(slot="xtrf" slot-scope="{ row, index }")
          .table__data(v-if="!!row.hasOwnProperty('isSendToXtrf')" v-html=" inXtrf(row)")
          .table__data(v-else) Old project

        template(slot="progress" slot-scope="{ row, index }")
          .table__data(style="width: 100%" v-if="originallyServices.length && originallyUnits.length")
            ProgressLine(:progress="progress(row)")

        template(slot="discounts" slot-scope="{ row, index }")
          .table__data(v-html="discounts(row.discounts)")

        template(slot="vendors" slot-scope="{ row, index }")
          .table__data soon...

        template(slot="tasksStatuses" slot-scope="{ row, index }")
          .table__data {{ tasksToString(row.tasks) }}


</template>

<script>
	import LayoutsTable from "../../LayoutsTable"
	import ProjectsLayoutFilter from "./ProjectsLayoutFilter"
	import ProgressLine from "../../ProgressLine"
	import { mapGetters } from "vuex"
	import moment from "moment"
	import _ from "lodash"

	export default {
		props: {
			list: {
				type: Array
			}
		},
		data() {
			return {
				maxHeight: 0,
				fields: [
					{
						label: "Project Id",
						headerKey: "headerID",
						key: "projectId",
						style: { "width": "140px" }
					},
					{
						label: "Project Name",
						headerKey: "headerProjectName",
						key: "projectName",
						style: { "width": "170px" }
					},
					{
						label: "Client Name",
						headerKey: "headerClientName",
						key: "clientName",
						style: { "width": "150px" }
					},
					{
						label: "Languages",
						headerKey: "headerLanguages",
						key: "languages",
						style: { "width": "150px" }
					},
					{
						label: "Start Date",
						headerKey: "headerStartDate",
						key: "startDate",
						style: { "width": "110px" }
					},
					{
						label: "Deadline",
						headerKey: "headerDeadline",
						key: "deadline",
						style: { "width": "110px" }
					},
					{
						label: "Project Manager",
						headerKey: "headerProjectManager",
						key: "projectManager",
						style: { "width": "160px" }
					},
					{
						label: "Account Manager",
						headerKey: "headerAccountManager",
						key: "accountManager",
						style: { "width": "160px" }
					},
					{
						label: "Industry",
						headerKey: "headerIndustry",
						key: "industry",
						dataKey: 'name',
						style: { "width": "140px" }
					},
					{
						label: "Services",
						headerKey: "headerServices",
						key: "services",
						style: { "width": "170px" }
					},
					{
						label: "Test",
						headerKey: "headerTest",
						key: "isTest",
						style: { "width": "60px" }
					},
					{
						label: "Payables",
						headerKey: "payablesHeader",
						key: "payables",
						style: { "width": "90px" }
					},
					{
						label: "Receivables",
						headerKey: "receivablesHeader",
						key: "receivables",
						style: { "width": "90px" }
					},
					{
						label: "Margin",
						headerKey: "marginHeader",
						key: "margin",
						style: { "width": "90px" }
					},
					{
						label: "Margin %",
						headerKey: "marginPercentageHeader",
						key: "marginPercentage",
						style: { "width": "90px" }
					},
					{
						label: "Roi",
						headerKey: "roiHeader",
						key: "roi",
						style: { "width": "90px" }
					},
					{
						label: "Currency",
						headerKey: "projectCurrencyHeader",
						key: "projectCurrency",
						style: { "width": "90px" }
					},
					{
						label: "Status",
						headerKey: "statusHeader",
						key: "status",
						style: { "width": "120px" }
					},
					{
						label: "PP",
						headerKey: "paymentProfileHeader",
						key: "paymentProfile",
						style: { "width": "140px" }
					},
					{
						label: "In XTRF",
						headerKey: "xtrfHeader",
						key: "xtrf",
						style: { "width": "100px" }
					},
					{
						label: "Progress",
						headerKey: "progressHeader",
						key: "progress",
						style: { "width": "120px" }
					},
					{
						label: "Discounts",
						headerKey: "discountsHeader",
						key: "discounts",
						style: { "width": "90px" }
					},
					{
						label: "Urgent",
						headerKey: "urgentHeader",
						key: "urgent",
						style: { "width": "60px" }
					},
					{
						label: "Vendors",
						headerKey: "vendorsHeader",
						key: "vendors",
						style: { "width": "140px" }
					},
					{
						label: "Tasks Statuses",
						headerKey: "tasksStatusesHeader",
						key: "tasksStatuses",
						style: { "width": "160px" }
					}
				]
			}
		},
		methods: {
			discounts(discounts) {
				if (!discounts.length) return '-'
				return discounts.reduce((acc, curr) => {
					acc = acc + `${ curr.value }, `
					return acc
				}, '') + `<span style="margin-left: 4px; color: #9c9c9c;">%</span>`
			},
			progress(project) {
				let progresses = []
				const isObject = (key) => typeof key === "object"
				const calculatePercentage = (step) => (+step.progress.wordsDone / +step.progress.totalWordCount) * 100

				const { _id: catId } = this.originallyUnits
						.find(({ type }) => type === 'CAT Wordcount')

				const CATServices = this.originallyServices
						.filter(({ steps }) => steps.some(({ step: { calculationUnit } }) => calculationUnit.includes(catId)))
						.map(({ title }) => title)

				const tasks = project.tasks
						.filter(({ status }) => status !== 'Cancelled' && status !== 'Cancelled Halfway')

				tasks.forEach(task => {
					let taskSteps = project.steps
							.filter(({ taskId }) => taskId === task.taskId)

					taskSteps = taskSteps
							.filter(({ stepId }) => !stepId.includes('Cancelled'))

					if (CATServices.includes(task.service.title)) {
						if (taskSteps.length === 2) {
							if (isObject(taskSteps[1].progress) && isObject(taskSteps[0].progress)) progresses.push((calculatePercentage(taskSteps[0]) + calculatePercentage(taskSteps[1])) / 2)
						} else if (taskSteps.length === 1) progresses.push(calculatePercentage(taskSteps[0]))
					} else {
						progresses.push(taskSteps.reduce((init, cur) => init + cur.progress / taskSteps.length, 0))
					}
				})

				if (!progresses.length) return 0
				if (progresses.length && progresses.every(item => item === 0)) return 0

				progresses = progresses.map(item => {
					if (isNaN(item) || !item) return 0
					if (typeof item === 'string') return +item
					return item
				})

				const progress = progresses.reduce((a, b) => a + b) / progresses.length
				return Math.ceil(progress) > 100 ? 100 : Math.ceil(progress)
			},
			inXtrf(project) {
				const { tasks, isSendToXtrf, xtrfLink, xtrfLinks } = project
				if (!tasks.length) return '-'

				if (tasks.length && tasks.every(({ service }) => service.title === 'Compliance')) {
					if (isSendToXtrf && xtrfLinks && xtrfLinks.length ) return xtrfLinks.map(({link}) => (`<a style="color: #9c9c9c;" href="${ link }" target="_blank"><i class="fas fa-link"></i></a>`)).join('&nbsp;')
					else return 'Not transferred yet'
				}

				if (tasks.length && tasks.every(({ service }) => service.title === 'Translation')) {
					if (isSendToXtrf) return `<a style="color: #9c9c9c;" href="${ xtrfLink }" target="_blank"><i class="fas fa-link"></i></a>`
					else return 'Not transferred yet'
				}

				if (tasks.length && tasks.every(({ service }) => service.title === 'Copywriting')) {
					if (isSendToXtrf) return `<a style="color: #9c9c9c;" href="${ xtrfLink }" target="_blank"><i class="fas fa-link"></i></a>`
					else return 'Not transferred yet'
				}

				if (tasks.every(({ service }) => service.title === 'Newsletter' || service.title === "SMS") && tasks.length === 2) {
					if (isSendToXtrf) return `<a style="color: #9c9c9c;" href="${ xtrfLink }" target="_blank"><i class="fas fa-link"></i></a>`
					else return 'Not transferred yet'
				}

				return 'No possibility to transfer'
			},
			currency(currency) {
				return currency === 'EUR' ? '&euro;' : currency === 'USD' ? '&#36;' : '&pound;'
			},
			roi(roi) {
				return roi === 'Infinity' || roi === 0 || roi === "0" || roi === "" ? '-' : roi
			},
			price(amount) {
				if (amount % 1 === 0) return amount
				return +amount.toFixed(2)
			},
			projectLanguages(tasks) {
				if (!tasks.length) return '-'
				const taskLanguages = tasks.map(({ sourceLanguage, targetLanguage }) => ({ sourceLanguage, targetLanguage }))
				let groupedLanguages = Object.entries(_.groupBy(taskLanguages, 'sourceLanguage'))
				groupedLanguages = groupedLanguages.map(item => {
					return { sourceLanguage: item[0], targetLanguages: [ ...new Set(item[1].map(({ targetLanguage }) => targetLanguage)) ].join(';&ensp;') }
				})
				groupedLanguages = groupedLanguages.reduce((acc, curr) => {
					acc = acc + `${ curr.sourceLanguage } <span style="font-size: 12px;color: #9c9c9c;margin: 0 2px;"><i class="fas fa-angle-double-right"></i></span> ${ curr.targetLanguages } <br>`
					return acc
				}, '')
				return groupedLanguages
			},
			customFormatter(date) {
				return moment(date).format('MMM D, HH:mm')
			},
			bottomScrolled() {
				this.$emit("bottomScrolled")
			},
			servicesToString(tasks) {
				const services = new Set(tasks.map(({ service }) => service.title))
				return Array.from(services).join(", ") || '-'
			},
			tasksToString(tasks) {
				const statuses = new Set(tasks.map(({ status }) => status === "Started" ? "In progress" : status))
				return Array.from(statuses).join(", ") || '-'
			}
		},
		computed: {
			...mapGetters({
				users: "getUsers",
				user: "getUser",
				originallyUnits: "getAllUnits",
				originallyServices: "getAllServices"
			}),
			filteredFields() {
				if (Object.keys(this.user).length) {
					let filteredFields = []
					const { layoutsSettings: { project: { fields } } } = this.user
					fields.forEach(field => {
						const _idx = this.fields.findIndex(({ key }) => key === field)
						if (_idx !== -1) filteredFields.push(this.fields[_idx])
					})
					return filteredFields
				}
			}
		},
		mounted() {
			setTimeout(() => {
        if(this.$refs.filter.clientHeight){
	        this.maxHeight = Math.floor(+window.innerHeight - +this.$refs.filter.clientHeight - 185)
        }
			}, 20)
		},
		components: { ProgressLine, ProjectsLayoutFilter, LayoutsTable }
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors";

  .table {
    background: white;
    padding: 15px 20px;
    box-sizing: border-box;
    border-radius: 4px;
    box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;

    &__header {
      padding: 0 0 0 7px;
    }

    &__result {
      margin-top: 15px;
    }

    &__data {
      width: 100%;
    }
  }

  a .fa-link {
    transition: .2s ease-out;
    color: $dark-border;
    cursor: pointer;

    &:hover {
      color: $text;
    }
  }

  a {
    color: $text;
    text-decoration: none;
    transition: .2s ease-out;

    &:hover {
      text-decoration: underline;
    }
  }

  .currency {
    margin-right: 4px;
    color: $dark-border;
  }

  .symbol {
    margin-left: 4px;
    color: $dark-border;
  }

  .fa-check {
    color: $dark-border;
  }
</style>