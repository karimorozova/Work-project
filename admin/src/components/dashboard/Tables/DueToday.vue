<template lang="pug">
  .component
    .component__title Due Today
    .component__content
      GeneralTable(
        :fields="fields"
        :tableData="finalData"
        :isFilterShow="true"
        :isBodyShort="true"

        @addSortKey="addSortKey"
        @changeSortKey="changeSortKey"
        @removeSortKey="removeSortKey"
        @setFilter="setFilter"
        @removeFilter="removeFilter"
        @clearAllFilters="clearAllFilters"
      )
        template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
          .table__header {{ field.label }}

        template(slot="projectId" slot-scope="{ row, index }")
          .table__data
            router-link(class="link-to" :to="{path: `/pangea-projects/all-projects/All/details/${row._id}`}" target="_blank")
              span {{row.projectId}}

        template(slot="projectName" slot-scope="{ row, index }")
          .table__data {{ setShortProjectName( row.projectName ) }}

        template(slot="customer" slot-scope="{ row, index }")
          .table__data
            router-link(class="link-to" :to="{path: `/pangea-clients/all/details/${row.customer._id}`}" target="_blank")
              span {{ row.customer.name }}

        template(slot="deadline" slot-scope="{ row, index }")
          .table__data {{ customFormatter(row.deadline) }}

        template(slot="status" slot-scope="{ row, index }")
          .table__data {{ row.status }}

        template(slot="assigned" slot-scope="{ row, index }")
          //.table__data {{ row.projectManager.firstName }}
          .table__data soon...

</template>

<script>
	import GeneralTable from '../../GeneralTable'
	import moment from "moment"
	import tableSortAndFilter from "../../../mixins/tableSortAndFilter"

	export default {
		mixins: [ tableSortAndFilter ],
		name: "DueToday.vue",
		props: {
			projects: {
				type: Array,
				require: true
			}
		},
		data() {
			return {
				fields: [
					{
						label: "Id",
						headerKey: "headerID",
						key: "projectId",
						sortInfo: { isSort: true, order: 'default' },
						filterInfo: { isFilter: true },
						style: { "width": "19%" }
					},
					{
						label: "Project",
						headerKey: "headerProjectName",
						key: "projectName",
						sortInfo: { isSort: true, order: 'default' },
						filterInfo: { isFilter: true },
						style: { "width": "19%" }
					},
					{
						label: "Client",
						headerKey: "headerClient",
						key: "customer",
						dataKey: "name",
						sortInfo: { isSort: true, order: 'default' },
						filterInfo: { isFilter: true },
						style: { "width": "17%" }
					},
					{
						label: "Deadline",
						headerKey: "headerDeadline",
						key: "deadline",
						sortInfo: { isSort: true, order: 'default' },
						filterInfo: { isFilter: true },
						style: { "width": "16%" }
					},
					{
						label: "Status",
						headerKey: "headerStatus",
						key: "status",
						sortInfo: { isSort: true, order: 'default' },
						filterInfo: { isFilter: true },
						style: { "width": "16%" }
					},
					{
						label: "Assigned",
						headerKey: "headerAssigned",
						key: "assigned",
						style: { "width": "13%" }
					}
				]
			}
		},
		methods: {
			setShortProjectName(projectName) {
				if (projectName.length > 17) {
					return projectName.substr(0, 17) + '...'
				}
				return projectName
			},
			customFormatter(date) {
				return moment(date).format('MMM D, HH:mm')
			}
		},
		computed: {
			rawData() {
				return this.projects
			}
		},
		components: {
			GeneralTable
		}
	}
</script>

<style scoped lang="scss">
  @import "../../../assets/scss/colors";

  .component {
    &__title {
      position: absolute;
      top: 17px;
      font-size: 18px;
      font-family: 'Myriad600';
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

  .table {
    &__header {
      padding: 0 0 0 6px;
    }

    &__data {
      padding: 0 6px;
      width: 100%;
      display: flex;
      justify-content: space-between;
    }
  }
</style>