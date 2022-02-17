<template lang="pug">
  .experience
    GeneralTable(
      :fields="fields"
      :tableData="finalData"
      :isFilterShow="true"
      :isFilterAbsolute="true"

      @addSortKey="addSortKey"
      @changeSortKey="changeSortKey"
      @removeSortKey="removeSortKey"
      @setFilter="setFilter"
      @removeFilter="removeFilter"
      @clearAllFilters="clearAllFilters"
    )

      template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
        .table__header {{ field.label }}

      template(slot="stepId" slot-scope="{ row, index }")
        .table__data
          //router-link(class="link-to" :to="{path: `/projects/details/${row._id}`}")
          span {{ row.stepId }}

      template(slot="project_projectName" slot-scope="{ row, index }")
        .table__projectName
          .short {{ row.project_projectName }}
          .tooltip(v-if="row.project_projectName.length >= 18")
            .tooltip-data(v-html="row.project_projectName")
            i(class="fa-solid fa-info")

      template(slot="step" slot-scope="{ row, index }")
        .table__data {{ row.step.title }}

      template(slot="deadline" slot-scope="{ row, index }")
        .table__data {{ customFormatter(row.deadline) }}

      template(slot="status" slot-scope="{ row, index }")
        .table__data {{ row.status }}

      template(slot="languages" slot-scope="{ row, index }")
        .table__data
          span(v-html="getStepPair(row)")

      template(slot="total" slot-scope="{ row, index }")
        .table__data
          span.currency(v-html="currencyIconDetected('EUR')" )
          span {{ +(row.total).toFixed(2) }}

      template(slot="enter" slot-scope="{ row, index }")
        .table__icons
          .icon
            i(class="fa-solid fa-arrow-right-to-bracket")

</template>

<script>
import GeneralTable from "../../../../components/general/GeneralTable"
import tableSortAndFilter from "../../../../mixins/tableSortAndFilter"
import moment from "moment"
import currencyIconDetected from "../../../../mixins/currencyIconDetected"

export default {
  mixins: [ tableSortAndFilter, currencyIconDetected ],
  props: [ 'arr' ],
  data() {
    return {
      fields: [
        {
          label: "Job ID",
          headerKey: "h1",
          key: "stepId",
          filterInfo: { isFilter: true },
          sortInfo: { isSort: true, order: 'default' },
          style: { width: "17%" }
        },
        {
          label: "Project Name",
          headerKey: "h2",
          key: "project_projectName",
          filterInfo: { isFilter: true },
          sortInfo: { isSort: true, order: 'default' },
          style: { width: "17%" }
        },
        {
          label: "Service",
          headerKey: "h3",
          key: "step",
          dataKey: 'title',
          filterInfo: { isFilter: true },
          sortInfo: { isSort: true, order: 'default' },
          style: { width: "12%" }
        },
        {
          label: "Deadline",
          headerKey: "h4",
          key: "deadline",
          filterInfo: { isFilter: true },
          sortInfo: { isSort: true, order: 'default' },
          style: { width: "11%" }
        },
        {
          label: "Status",
          headerKey: "h5",
          key: "status",
          filterInfo: { isFilter: true },
          sortInfo: { isSort: true, order: 'default' },
          style: { width: "13%" }
        },
        {
          label: "Languages",
          headerKey: "h5",
          key: "languages",
          style: { width: "13%" }
        },
        {
          label: "Total Cost",
          headerKey: "h5",
          key: "total",
          sortInfo: { isSort: true, order: 'default' },
          style: { width: "11%" }
        },
        {
          label: "",
          headerKey: "h6",
          key: "enter",
          style: { width: "6%" }
        }
      ]
    }
  },
  computed: {
    rawData() {
      return this.arr
    }
  },
  methods: {
    getStepPair(step) {
      return step.sourceLanguage === step.targetLanguage
          ? `${ step.targetLanguage }`
          : `<span>${ step.sourceLanguage }</span><span style="font-size: 12px;color: #9c9c9c;margin: 0 4px;"><i class="fa-solid fa-angle-double-right"></i></span><span>${ step.targetLanguage }</span>`
    },
    customFormatter(date) {
      return moment(date).format('MMM D, HH:mm')
    }
  },
  components: {
    GeneralTable
  }

}
</script>
<style lang="scss" scoped>
@import "assets/scss/colors";

.table {
  width: 100%;

  &__projectName {
    padding: 0 7px;
    width: 90%;
    display: flex;
    justify-content: space-between;
  }

  &__data {
    padding: 0 7px;
  }

  &__header {
    padding: 0 7px;
  }

  &__drop {
    position: relative;
    height: 32px;
    max-width: 220px;
    margin: 0 7px;
    width: 100%;
    background: white;
    border-radius: 4px;
  }

  &__icons {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    gap: 8px;
  }

  &__icon {
    cursor: pointer;
    opacity: 0.5;
  }

  &__opacity {
    opacity: 1;
  }

  &__input {
    width: 100%;
    padding: 0 7px;
  }
}

input {
  font-size: 14px;
  color: $text;
  border: 1px solid $border;
  border-radius: 4px;
  box-sizing: border-box;
  padding: 0 7px;
  outline: none;
  width: 100%;
  height: 32px;
  transition: .1s ease-out;

  &:focus {
    border: 1px solid $border-focus;
  }
}

.icon {
  font-size: 17px;
  cursor: pointer;
}

.short {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 85%;
}

.currency {
  margin-right: 4px;
  color: $dark-border;
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
    padding: 8px 8px 6px 8px;
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
