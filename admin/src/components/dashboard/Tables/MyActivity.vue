<template lang="pug">
  .component
    .component__title My Open Activities
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

        template(slot="client" slot-scope="{ row, index }")
          .table__data
            router-link(class="link-to" :to="{path: `/pangea-clients/all/details/${row.client._id}`}" target="_blank")
              span {{row.client.name}}

        template(slot="priority" slot-scope="{ row, index }")
          .table__data {{row.priority}}

        template(slot="normAssociatedTo" slot-scope="{ row, index }")
          .table__data {{ row.normAssociatedTo }}

        template(slot="dateTime" slot-scope="{ row, index }")
          .table__data {{ customFormatter(row.dateTime) }}


</template>

<script>
	import GeneralTable from '../../GeneralTable'
	import moment from "moment"
	import tableSortAndFilter from "../../../mixins/tableSortAndFilter"

	export default {
		mixins: [ tableSortAndFilter ],
		name: "DueToday.vue",
		props: {
      allActivity: {
				type: Array,
				require: true
			}
		},
		data() {
			return {
				fields: [
					{
						label: "Company",
						headerKey: "headerCompany",
						key: "client",
            dataKey: "name",
						sortInfo: { isSort: true, order: 'default' },
						filterInfo: { isFilter: true },
						style: { "width": "30%" }
					},
					{
						label: "Associated",
						headerKey: "headerClient",
						key: "normAssociatedTo",
						sortInfo: { isSort: true, order: 'default' },
						filterInfo: { isFilter: true },
						style: { "width": "35%" }
					},
					{
						label: "Priority",
						headerKey: "headerClient",
						key: "priority",
						sortInfo: { isSort: true, order: 'default' },
						filterInfo: { isFilter: true },
						style: { "width": "15%" }
					},
					{
						label: "Due",
						headerKey: "headerDeadline",
						key: "dateTime",
						sortInfo: { isSort: true, order: 'default' },
						filterInfo: { isFilter: false },
						style: { "width": "20%" }
					},
				]
			}
		},
		computed: {
			rawData() {
				return this.allActivity
			}
		},
		methods: {
			customFormatter(date) {
				return moment(date).format('MMM D, HH:mm')
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