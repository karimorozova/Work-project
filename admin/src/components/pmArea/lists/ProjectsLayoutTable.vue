<template lang="pug">
  .table

    .table__filters
      ProjectsLayoutFilter

    .table__result
      LayoutsTable(
        :fields="fields"
        :tableData="list"
        @bottomScrolled="bottomScrolled"
      )
        template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
          .table__header {{ field.label }}

        template(slot="projectId" slot-scope="{ row, index }")
          .table__data
            router-link(class="link-to" :to="{path: `/pangea-projects/all-projects/All/details/${row._id}`}")
              span {{row.projectId}}

        template(slot="projectName" slot-scope="{ row, index }")
          .table__data {{row.projectName}}

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
          .table__data {{ row.isTest }}


</template>

<script>
	import LayoutsTable from "../../LayoutsTable"
	import ProjectsLayoutFilter from "./ProjectsLayoutFilter"
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
				fields: [
					{
						label: "Project Id",
						headerKey: "headerID",
						key: "projectId",
						// sortInfo: { isSort: true, order: 'default' },
						style: { "width": "150px" }
					},
					{
						label: "Project Name",
						headerKey: "headerProjectName",
						key: "projectName",
						style: { "width": "170px" }
					},
					{
						label: "Cleint Name",
						headerKey: "headerClientName",
						key: "clientName",
						style: { "width": "170px" }
					},
					{
						label: "Languages",
						headerKey: "headerLanguages",
						key: "languages",
						style: { "width": "200px" }
					},
					{
						label: "Start Date",
						headerKey: "headerStartDate",
						key: "startDate",
						style: { "width": "120px" }
					},
					{
						label: "Deadline",
						headerKey: "headerDeadline",
						key: "deadline",
						style: { "width": "120px" }
					},
					{
						label: "Project Manager",
						headerKey: "headerProjectManager",
						key: "projectManager",
						style: { "width": "170px" }
					},
					{
						label: "Account Manager",
						headerKey: "headerAccountManager",
						key: "accountManager",
						style: { "width": "170px" }
					},
					{
						label: "Industry",
						headerKey: "headerIndustry",
						key: "industry",
            dataKey: 'name',
            sortInfo: { isSort: true, order: 'default' },
						style: { "width": "170px" }
					},
					{
						label: "Services",
						headerKey: "headerServices",
						key: "services",
						style: { "width": "170px" }
					},
					{
						label: "Is Test",
						headerKey: "headerTest",
						key: "isTest",
						style: { "width": "100px" }
					},
				]
			}
		},
		methods: {
			projectLanguages(tasks) {
				if (!tasks.length) return '-'
				const taskLanguages = tasks.map(({ sourceLanguage, targetLanguage }) => ({ sourceLanguage, targetLanguage }))
				let groupedLanguages = Object.entries(_.groupBy(taskLanguages, 'sourceLanguage'))
				groupedLanguages = groupedLanguages.map(item => {
					return { sourceLanguage: item[0], targetLanguages: [...new Set(item[1].map(({ targetLanguage }) => targetLanguage))].join(', ') }
				})
				groupedLanguages = groupedLanguages.reduce((acc, curr) => {
					acc = acc + `${curr.sourceLanguage} &#8811; ${curr.targetLanguages } <br>`
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
			  const services = new Set(tasks.map(({service}) => service.title))
        return Array.from(services).join(", ") || '-'
      }
		},
		computed: {
			...mapGetters({
				users: "getUsers"
			})
		},
		components: { ProjectsLayoutFilter, LayoutsTable }
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors";

  .table {
    background: white;
    padding: 20px;
    box-sizing: border-box;
    border-radius: 4px;
    box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;

    &__header {
      padding: 0 0 0 7px;
    }

    &__data {
      padding: 0 7px;
      width: 100%;
      display: flex;
      justify-content: space-between;
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
</style>