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
          .table__data {{ projectLanguages(row.tasks) }}

        template(slot="startDate" slot-scope="{ row, index }")
          .table__data {{ customFormatter(row.startDate) }}

        template(slot="deadline" slot-scope="{ row, index }")
          .table__data {{ customFormatter(row.deadline) }}

        template(slot="projectManager" slot-scope="{ row, index }")
          .table__data {{ row.projectManager.firstName }} {{ row.projectManager.lastName }}

        template(slot="accountManager" slot-scope="{ row, index }")
          .table__data {{ row.accountManager.firstName }} {{ row.accountManager.lastName }}


</template>

<script>
	import LayoutsTable from "../../LayoutsTable"
	import ProjectsLayoutFilter from "./ProjectsLayoutFilter"
	import { mapGetters } from "vuex"
	import moment from "moment"

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
					}
				]
			}
		},
		methods: {
			projectLanguages(tasks) {
				console.log(tasks)
			},
			customFormatter(date) {
				return moment(date).format('MMM D, HH:mm')
			},
			bottomScrolled() {
				this.$emit("bottomScrolled")
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
    box-shadow: rgba(81, 68, 48, 0.3) 0px 1px 2px 0px, rgba(81, 68, 48, 0.15) 0px 1px 3px 1px;

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