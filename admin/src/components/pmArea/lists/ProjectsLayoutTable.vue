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

</template>

<script>
	import LayoutsTable from "../../LayoutsTable"
	import ProjectsLayoutFilter from "./ProjectsLayoutFilter"

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
						style: { "width": "150px" }
					}
				]
			}
		},
		methods: {
			bottomScrolled() {
				this.$emit("bottomScrolled")
			}
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