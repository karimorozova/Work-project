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
          .table__data {{ row.status }}


        template(slot="totalCost", slot-scope="{ row, index }")
          .table__data
            span.currency(v-html="currencyIconDetected(row.projectCurrency)" )
            span {{ getProjectTotal(row) }}

        template(slot="createdBy", slot-scope="{ row, index }")
          .table__icons(v-if="getCreatedBy(row.createdBy).isCreatedBy")
            .tooltip.user__image
              .tooltip-data.user(v-html="getCreatedBy(row.createdBy).createdBy")
              img(v-if="getContactPhoto(row.createdBy)" :src="domain+getContactPhoto(row.createdBy)")
              .user__fakeImage(:style="{'--bgColor': getBgColor(row.createdBy._id)[0], '--color':getBgColor(row.createdBy._id)[1]  }" v-else)
                span {{ row.createdBy.firstName[0].toUpperCase() }}

        template(slot="icons", slot-scope="{ row, index }")
          .table__icons
            router-link(class="link-to" :to="{path: `/projects/details/${row._id}`}")
              i.fa-solid.fa-arrow-right-to-bracket
            //.icon.accept(@click="() => quotesAction(row._id, 'approve')")
            //  i(class="fas fa-check icon-elem ")
            //.icon.reject(@click="() => quotesAction(row._id, 'reject')")
            //  i(class="fas fa-times icon-elem ")


</template>

<script>
import GeneralTable from '../../../components/pangea/GeneralTable'
import moment from "moment"
import tableSortAndFilter from "../../../mixins/tableSortAndFilter"
import ApproveModal from "../../ApproveModal"
import getBgColor from "../../../mixins/getBgColor"
import currencyIconDetected from "../../../mixins/currencyIconDetected"
import { mapGetters } from "vuex"

export default {
  mixins: [ tableSortAndFilter, getBgColor, currencyIconDetected ],
  props: {
    myQuotes: {
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
        }
      ],
      isChangeStatus: false,
      quotesActionInfo: {},
      currentDelete: ''
    }
  },
  created() {
    this.domain = process.env.domain
  },
  computed: {
    ...mapGetters({
      user: "getUserInfo"
    }),
    rawData() {
      return this.myQuotes
    }
  },
  methods: {
    getProjectTotal(project) {
      const { steps, tasks, additionsSteps, minimumCharge, status } = project
      const quotesStatus = status === 'Quote sent' || status === 'Cost Quote'
      let total = 0
      if (minimumCharge.isUsed) {
        total = minimumCharge.value
      } else {
        if (quotesStatus) {
          total = steps.reduce((acc, curr) => acc += +curr.finance.Price.receivables, 0)
        } else {
          const tasksIds = tasks.filter(i => i.status === 'Quote sent').map(i => i.taskId)
          total = steps.filter(i => tasksIds.includes(i.taskId)).reduce((acc, curr) => acc += +curr.finance.Price.receivables, 0)
        }
      }
      if (additionsSteps.length && quotesStatus) {
        const sum = additionsSteps.reduce((acc, curr) => acc += +curr.finance.Price.receivables, 0)
        return +(total + sum).toFixed(2)
      }
      return +(total).toFixed(2)
    },
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
    quotesAction(_id, status) {
      this.isChangeStatus = true
      this.quotesActionInfo = { _id, status }
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

<style lang="scss" scoped>
@import "../../../assets/scss/colors";

.currency {
  margin-right: 4px;
  color: $dark-border;
}

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
    box-sizing: border-box;
  }

  &__icons {
    display: flex;
    justify-content: center;
    width: 100%;
    gap: 10px;
    font-size: 17px;
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

.icon {
  svg {
    //font-size: 18px;
  }

  &-elem {
    font-size: 18px;
    cursor: pointer;
  }

  &.accept {
    color: #4ba5a5;
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