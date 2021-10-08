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
    .component__title All Open Requests
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
            .tooltip(v-if="row.projectName.length >= 15")
              .tooltip-data(v-html="row.projectName")
              i(class="fas fa-info")

        template(slot="startDate", slot-scope="{ row, index }")
          .table__data {{ customFormatter(row.startDate) }}

        template(slot="deadline", slot-scope="{ row, index }")
          .table__data {{ customFormatter(row.deadline) }}

        template(slot="status", slot-scope="{ row, index }")
          .table__data {{ row.status }}

        template(slot="createdBy", slot-scope="{ row, index }")
          .table__icons(v-if="getCreatedBy(row.createdBy).isCreatedBy")
            .tooltip.user
              .tooltip-data.user(v-html="getCreatedBy(row.createdBy).createdBy")
              img.image(v-if="client.contacts.find(item => item.email === row.createdBy.email).photo" :src="domain+client.contacts.find(item => item.email === row.createdBy.email).photo")
              i(v-else class="fas fa-user")

</template>

<script>
	import GeneralTable from '../../../components/pangea/GeneralTable'
	import moment from "moment"
	import tableSortAndFilter from "../../../mixins/tableSortAndFilter"
	import ApproveModal from "../../ApproveModal"

	export default {
		mixins: [ tableSortAndFilter ],
		props: {
			allRequests: {
				type: Array,
				require: true
			},
			client: {
				type: Object
			}
		},
		data() {
			return {
				domain: '',
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
					}
				],
				isDeleting: false,
				currentDelete: ''
			}
		},
		computed: {
			rawData() {
				return this.allRequests
			}
		},
		created() {
			this.domain = process.env.domain
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

  .image {
    height: 28px;
    width: 28px;
    border-radius: 50%;
  }

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

  .icon-button {
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
    color: $dark-border;


    &.user {
      height: 28px;
      width: 28px;
      background: $light-border;
      border-radius: 50%;
      justify-content: center;
      align-items: center;
      color: $dark-border;
    }

    &-data {
      visibility: hidden;
      font-size: 14px;
      width: 240px;
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

      &.user {
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