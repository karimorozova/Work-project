<template lang="pug">
  .component
    .component__modal-wrapper
      ApproveModal(
        v-if="isChangeStatus"
        text="Are you sure?"
        approveValue="Yes"
        notApproveValue="No"
        @approve="makeAction"
        @close="cancelQuoteAction"
        @notApprove="cancelQuoteAction"
      )
    .component__title My Open Quotes
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
            router-link(class="link-to" :to="{path: `/dashboard/details/${row._id}`}")
              span {{ row.projectId }}


        template(slot="projectName", slot-scope="{ row, index }")
          .table__data
            .short {{ row.projectName }}
            .tooltip(v-if="row.projectName.length >= 15")
              .tooltip-data(v-html="row.projectName")
              i(class="fas fa-info")

        template(slot="startDate", slot-scope="{ row, index }")
          .table__data {{ customFormatter(row.startDate) }}

        template(slot="deadline", slot-scope="{ row, index }")
          .table__data {{ customFormatter(row.deadline) }}

        template(slot="status", slot-scope="{ row, index }")
          .table__data {{ row.status }}


        template(slot="totalCost", slot-scope="{ row, index }")
          .table__data(v-if="row.status !== 'Requested' && row.finance") {{ row.finance.Price.receivables }}
            span.data-table__currency(v-if="row.finance.Price.receivables")

        template(slot="createdBy", slot-scope="{ row, index }")
          .table__icons(v-if="getCreatedBy(row.createdBy).isCreatedBy")
            .tooltip.user
              .tooltip-data.user(v-html="getCreatedBy(row.createdBy).createdBy")
              i(class="fas fa-user")


        template(slot="icons", slot-scope="{ row, index }")
          //.table__icons
            .icon.accept(@click="() => quotesAction(row._id, 'approve')")
              i(class="fas fa-check icon-elem ")
            .icon.reject(@click="() => quotesAction(row._id, 'reject')")
              i(class="fas fa-times icon-elem ")


</template>

<script>
	import GeneralTable from '../../../components/pangea/GeneralTable'
	import moment from "moment"
	import tableSortAndFilter from "../../../mixins/tableSortAndFilter"
	import ApproveModal from "../../ApproveModal"

	export default {
		mixins: [ tableSortAndFilter ],
		props: {
      myQuotes: {
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
            label: "Request On",
            headerKey: "headerRequestDate",
            key: "startDate",
            sortInfo: { isSort: true, order: 'default' },
            // filterInfo: { isFilter: true },
            style: { width: "18%" }
          },
          {
            label: "Deadline",
            headerKey: "headerDeadline",
            key: "deadline",
            sortInfo: { isSort: true, order: 'default' },
            // filterInfo: { isFilter: true },
            style: { width: "16%" }
          },
          {
            label: "Total Cost",
            headerKey: "headerTotalCost",
            key: "totalCost",
            style: { width: "12%" }
          },
          {
            label: "Creator",
            headerKey: "headerCreatedBy",
            key: "createdBy",
            style: { width: "9%" }
          },
          {
            label: "",
            headerKey: "headerIcons",
            key: "icons",
            style: { width: "10%" }
          },
        ],
        isChangeStatus: false,
        quotesActionInfo: {},
        currentDelete: '',
			}
		},
		computed: {
			rawData() {
				return this.myQuotes
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
        return {
          isCreatedBy: !!(createdBy && createdBy.hasOwnProperty('firstName')),
          createdBy: createdBy && createdBy.hasOwnProperty('firstName') ? createdBy.firstName : '-'
        }
      },
      quotesAction(_id,status) {
        this.isChangeStatus = true
        this.quotesActionInfo = {_id, status}
      },
      cancelQuoteAction() {
        this.isChangeStatus = false
        this.quotesActionInfo = {}
      },
      makeAction() {
        this.$emit('changeQuoteStatus', this.quotesActionInfo)
        this.cancelQuoteAction()
      }
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

  .icon {
    svg {
      //font-size: 18px;
    }
    &-elem {
      font-size: 18px;
      cursor: pointer;
    }
    &.accept {
      color: #47a6a6;
    }
    &.reject {
      color: #f5866d;
    }
  }
  .tooltip {
    position: relative;
    display: flex;
    cursor: help;
    color: $dark-border;


    &.user{
      height: 32px;
      width: 32px;
      background: $light-border;
      border-radius: 50%;
      justify-content: center;
      align-items: center;
      color: $dark-border;
    }

    &-data{
      visibility: hidden;
      font-size: 14px;
      width: max-content;
      background: white;
      border-radius: 4px;
      right: 15px;
      top: -7px;
      padding: 7px 7px 5px 7px;
      position: absolute;
      z-index: 555;
      opacity: 0;
      transition: opacity .3s;
      border: 1px solid $text;
      color: $text;
      &.user{
        right: 40px;
        top: 1px;
        color: $text;
      }

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
      .tooltip-data {
        visibility: visible;
        opacity: 1;
      }
    }
  }
</style>