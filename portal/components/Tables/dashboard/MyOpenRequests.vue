<template lang="pug">
  .component
    .component__modal-wrapper
      ApproveModal(
        v-if="isDeleting"
        text="Are you sure?"
        approveValue="Yes"
        notApproveValue="No"
        @approve="approveDelete"
        @close="closeDeleteModal"
        @notApprove="closeDeleteModal"
      )
    .component__title My Open Requests
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
        template(v-for="field in fields", :slot="field.headerKey", slot-scope="{ field }")
          .table__header {{ field.label }}

        template(slot="projectId", slot-scope="{ row, index }")
          .table__data
            router-link(class="link-to" :to="{path: `/client-request/details/${row._id}`}")
              span {{ row.projectId }}

        template(slot="projectName", slot-scope="{ row, index }")
          .table__data
            .short {{ row.projectName }}
            .tooltip
              .tooltipData(v-html="row.projectName")
              i(class="fas fa-info")

        template(slot="startDate", slot-scope="{ row, index }")
          .table__data {{ customFormatter(row.startDate) }}

        template(slot="deadline", slot-scope="{ row, index }")
          .table__data {{ customFormatter(row.deadline) }}

        template(slot="status", slot-scope="{ row, index }")
          .table__data {{ row.status }}

        template(slot="createdBy", slot-scope="{ row, index }")
          .table__icons
            .tooltip
              .tooltipData(v-html="getCreatedBy(row.createdBy)")
              i(class="fas fa-info")




</template>

<script>
	import GeneralTable from '../../../components/pangea/GeneralTable'
	import moment from "moment"
	import tableSortAndFilter from "../../../mixins/tableSortAndFilter"
	import ApproveModal from "../../ApproveModal"

	export default {
		mixins: [ tableSortAndFilter ],
		props: {
      myRequests: {
				type: Array,
				require: true
			}
		},
		data() {
			return {

        fields: [
          {
            label: "Project ID",
            headerKey: "headerProjectId",
            key: "projectId",
            sortInfo: { isSort: true, order: 'default' },
            filterInfo: { isFilter: true },
            style: { width: "19%" }
          },
          {
            label: "Project Name",
            headerKey: "headerProjectName",
            key: "projectName",
            sortInfo: { isSort: true, order: 'default' },
            filterInfo: { isFilter: true },
            style: { width: "20%" }

          },
          {
            label: "Status",
            headerKey: "headerStatus",
            key: "status",
            sortInfo: { isSort: true, order: 'default' },
            filterInfo: { isFilter: true },
            style: { width: "17%" }
          },
          {
            label: "Request On",
            headerKey: "headerRequestDate",
            key: "startDate",
            sortInfo: { isSort: true, order: 'default' },
            filterInfo: { isFilter: false },
            style: { width: "18%" }
          },
          {
            label: "Deadline",
            headerKey: "headerDeadline",
            key: "deadline",
            sortInfo: { isSort: true, order: 'default' },
            filterInfo: { isFilter: false },
            style: { width: "17%" }
          },
          {
            label: "Creator",
            headerKey: "headerCreatedBy",
            key: "createdBy",
            style: { width: "9%" }
          },
        ],
        isDeleting: false,
        currentDelete: '',
			}
		},
		computed: {
			rawData() {
				return this.myRequests
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
      getCreatedBy(createdBy) {
        return createdBy && createdBy.hasOwnProperty('firstName') ? createdBy.firstName : '-'
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
      box-sizing: border-box;
    }
    &__icons {
      display: flex;
      justify-content: center;
      width: 100%;
      gap: 10px;
      //font-size: 16px;
    }
    &__actions {
      justify-content: center;
    }
  }
  .short {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    max-width: 90%;
  }
  .icon-button{
    transition: .2s ease-out;
    color: $dark-border;
    cursor: pointer;

    &:hover {
      color: $text;
    }
  }
  .tooltip {
    position: relative;
    display: flex;
    cursor: help;

    .tooltipData {
      visibility: hidden;
      font-size: 14px;
      width: max-content;
      background: white;
      border-radius: 4px;
      right: 25px;
      padding: 7px 7px 5px 7px;
      position: absolute;
      z-index: 555;
      opacity: 0;
      transition: opacity .3s;
      border: 1px solid $text;
      transform: translate(0,-30%);

      &::after {
        content: "";
        position: absolute;
        top: 8px;
        right: -12px;
        transform: rotate(270deg);
        border-width: 6px;
        border-style: solid;
        border-color: $text transparent transparent;
      }
    }

    &:hover {
      .tooltipData {
        visibility: visible;
        opacity: 1;
      }
    }
  }
</style>