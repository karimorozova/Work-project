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
    .component__title All Open Projects
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
            router-link(class="link-to" :to="{path: `/projects/details/${row._id}`}")
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
          .table__statusAndProgress
            .status {{ row.status  }}
            .progress
              ProgressLineStep(:progress="progress(row.steps, row)" :lastProgress="0")

        template(slot="totalCost", slot-scope="{ row, index }")
          .table__data(v-if="row.status !== 'Requested' && row.finance") {{ row.finance.Price.receivables }}
            span.data-table__currency(v-if="row.finance.Price.receivables")
            span(v-html="currencyIconDetected(row.projectCurrency)")

        template(slot="createdBy", slot-scope="{ row, index }")
          .table__icons(v-if="getCreatedBy(row.createdBy).isCreatedBy")
            .tooltip.user__image
              .tooltip-data.user(v-html="getCreatedBy(row.createdBy).createdBy")
              img(v-if="getContactPhoto(row.createdBy)" :src="domain+getContactPhoto(row.createdBy)")
              .user__fakeImage(:style="{'--bgColor': getBgColor(row.createdBy._id)[0], '--color':getBgColor(row.createdBy._id)[1]  }" v-else)
                span {{ row.createdBy.firstName[0].toUpperCase() }}
          .table__icons(v-else)
            .tooltip.user__image(v-if="row.accountManager && Object.keys(row.accountManager).length" )
              .tooltip-data.user(v-html="'AM: ' + row.accountManager.firstName + ' ' + row.accountManager.lastName || ''")
              img(v-if="row.accountManager.photo && !row.accountManager.photo.includes('https://')" :src="domain+row.accountManager.photo")
              .user__fakeImage(:style="{'--bgColor': getBgColor(row.accountManager._id)[0], '--color':getBgColor(row.accountManager._id)[1]  }" v-else) {{ row.accountManager.firstName[0].toUpperCase() }}


</template>

<script>
import GeneralTable from '../../../components/pangea/GeneralTable'
import ProgressLineStep from '../../../components/pangea/ProgressLineStep'
import moment from "moment"
import tableSortAndFilter from "../../../mixins/tableSortAndFilter"
import ApproveModal from "../../ApproveModal"
import getBgColor from "../../../mixins/getBgColor"

export default {
  mixins: [ tableSortAndFilter, getBgColor ],
  props: {
    allProjects: {
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
  created() {
    this.domain = process.env.domain
  },
  computed: {
    rawData() {
      return this.allProjects
    }
  },
  methods: {
    getContactPhoto({ email }) {
      const { contacts } = this.client
      return contacts.find(item => item.email === email)
          ? contacts.find(item => item.email === email).photo
          : undefined
    },
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
    progress(steps, project) {
      let total = 0
      for (let step of steps) {
        const progress = isNaN(step.progress) ? +(step.progress.wordsDone / step.progress.totalWordCount * 100).toFixed(2) : step.progress
        total += progress
      }
      return (total / steps.length).toFixed(2)
    }
  },
  components: {
    GeneralTable,
    ApproveModal,
    ProgressLineStep
  }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors";

.user {
  &__fakeImage {
    height: 32px;
    width: 32px;
    border-radius: 32px;
    background-color: var(--bgColor);
    color: var(--color);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 18px;
  }

  &__image {
    height: 32px;
    width: 32px;
    border-radius: 32px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 32px;
    }
  }
}


.fa-info {
  color: $dark-border;
}

.component {
  &__title {
    position: absolute;
    top: 25px;
    font-size: 14px;
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

  &__actions {
    justify-content: center;
  }

  &__icons {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }

  &__statusAndProgress {
    width: 100%;
    padding: 0 6px;
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
  text-align: center;


  &.user {
    height: 32px;
    width: 32px;
    background: $light-border;
    border-radius: 50%;
    justify-content: center;
    align-items: center;
    color: $dark-border;
  }

  &-data {
    visibility: hidden;
    font-size: 14px;
    max-width: 280px;
    min-width: 140px;
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