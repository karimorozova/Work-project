<template lang="pug">
  .component
    .component__modal-wrapper
      ApproveModal(
        v-if="isDeleting"
        text="Are you sure?"
        approveValue="Yes"
        notApproveValue="Cancel"
        @approve="approveDelete"
        @close="closeDeleteModal"
        @notApprove="closeDeleteModal"
      )
    .component__title All Open Activities
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
          .table__data {{row.priority || '-'}}

        template(slot="normAssociatedTo" slot-scope="{ row, index }")
          .table__data {{ row.normAssociatedTo }}

        template(slot="dateTime" slot-scope="{ row, index }")
          .table__data {{ customFormatter(row.dateTime) }}

        template(slot="normAssignedTo" slot-scope="{ row, index }")
          .table__data {{ row.normAssignedTo}}

        template(slot="action" slot-scope="{ row, index }")
          .table__data.table__actions
            i(class="fas fa-trash icon-button" @click.stop="deleteAction(row._id)")

</template>

<script>
	import GeneralTable from '../../GeneralTable'
	import moment from "moment"
	import tableSortAndFilter from "../../../mixins/tableSortAndFilter"
	import ApproveModal from "../../ApproveModal"

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
						style: { "width": "20%" }
					},
					{
						label: "Associated",
						headerKey: "headerClient",
						key: "normAssociatedTo",
						sortInfo: { isSort: true, order: 'default' },
						filterInfo: { isFilter: true },
						style: { "width": "27%" }
					},
					{
						label: "Priority",
						headerKey: "headerClient",
						key: "priority",
						sortInfo: { isSort: true, order: 'default' },
						filterInfo: { isFilter: true },
						style: { "width": "14%" }
					},
					{
						label: "Due",
						headerKey: "headerDeadline",
						key: "dateTime",
						sortInfo: { isSort: true, order: 'default' },
						filterInfo: { isFilter: false },
						style: { "width": "14%" }
					},
					{
						label: "Assigned To",
						headerKey: "headerAssigned",
						key: "normAssignedTo",
            sortInfo: { isSort: true, order: 'default' },
            filterInfo: { isFilter: true },
						style: { "width": "20%" }
					},
					{
						label: "",
						headerKey: "headerAssigned",
						key: "action",
            sortInfo: { isSort: false, order: 'default' },
            filterInfo: { isFilter: true },
						style: { "width": "5%" }
					}
				],
        isDeleting: false,
        currentDelete: '',
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
			},
      deleteAction(id) {
			  this.currentDelete = id
        this.isDeleting = true
      },
      closeDeleteModal() {
        this.currentDelete = ''
        this.isDeleting = false
      },
      async approveDelete() {
        this.$emit('deleteActivityTask', { id: this.currentDelete })
        this.closeDeleteModal()
      },
		},
		components: {
			GeneralTable,
      ApproveModal
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
    &__modal-wrapper {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 5;
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
    &__actions {
      justify-content: center;
    }
  }
  .icon-button{
    transition: .2s ease-out;
    color: $dark-border;
    cursor: pointer;

    &:hover {
      color: $text;
    }
  }
</style>