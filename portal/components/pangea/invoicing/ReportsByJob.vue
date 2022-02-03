<template lang="pug">
  .reports
    GeneralTable(
      :fields="fields"
      :tableData="finalData"
      :isFilterShow="true"
      :isBodyShort="true"
      :isFilterAbsolute="true"

      @addSortKey="addSortKey"
      @changeSortKey="changeSortKey"
      @removeSortKey="removeSortKey"
      @setFilter="setFilter"
      @removeFilter="removeFilter"
      @clearAllFilters="clearAllFilters"
    )
      template(v-for="field in fields", :slot="field.headerKey", slot-scope="{ field }")
        .table__header {{ field.label }}

      template(slot="stepId" slot-scope="{ row, index }")
        .table__data
          .id
            router-link(class="link-to" :to="{path: `/projects/details/${row.projectNativeId}`}")
              span {{row.projectName}}
            .short
              span {{ row.stepId }}

      template(slot="step" slot-scope="{ row, index }")
        .table__data {{row.type === 'Classic' ? row.stepAndUnit.step.title : row.title}}

      template(slot="langPair" slot-scope="{ row, index }")
        .table__data(v-html="getStepPair(row)")

      template(slot="deadline" slot-scope="{ row, index }")
        .table__data {{customFormatter(row.deadline)}}

      template(slot="fee" slot-scope="{ row, index }")
        .table__data
          span.currency(v-html="returnIconCurrencyByStringCode(row.projectCurrency)")
          span {{ row.finance.Price.receivables.toFixed(2) }}
</template>

<script>
import tableSortAndFilter from "../../../mixins/tableSortAndFilter"
import GeneralTable from "../../../components/pangea/GeneralTable"
import moment from "moment"

export default {
  mixins: [tableSortAndFilter],
  components: {
    GeneralTable,
  },
  name: "reportsByJob",
  props: {
    stepsWithProject: {
      type: Array,
    }
  },
  data() {
    return {
      fields: [
        {
          label: "Job ID",
          headerKey: "headerStepId",
          key: "stepId",
          sortInfo: { isSort: true, order: 'default' },
          filterInfo: { isFilter: true },
          style: { width: "35%" }
        },
        {
          label: "Service",
          headerKey: "headerStep",
          key: "step",
          sortInfo: { isSort: true, order: 'default' },
          filterInfo: { isFilter: true },
          style: { width: "20%" }
        },
        {
          label: "Language Pair",
          headerKey: "headerLangPair",
          key: "langPair",
          style: { width: "20%" }
        },
        {
          label: "Date",
          headerKey: "headerDeadline",
          key: "deadline",
          style: { width: "20%" }
        },
        {
          label: "Fee",
          headerKey: "headerFee",
          key: "fee",
          style: { width: "12%" }
        },
      ]

    }
  },
  methods: {

    getStepPair(step) {
      return step.sourceLanguage === step.targetLanguage
          ? `${ step.targetLanguage }`
          : `<span>${ step.sourceLanguage }</span><span style="font-size: 12px;color: #9c9c9c;margin: 0 4px;"><i class="fas fa-angle-double-right"></i></span><span>${ step.targetLanguage }</span>`
    },
    returnIconCurrencyByStringCode(currencyStingCode) {
      switch (currencyStingCode) {
        case "EUR":
          return "&nbsp;&euro;&nbsp;";
        case "USD":
          return "&nbsp;&#36;&nbsp;";
        case "GBP":
          return "&nbsp;&pound;&nbsp;";
        default:
          return "&nbsp;&euro;&nbsp;";
      }
    },
    customFormatter(date) {
      return moment(date).format('MMM D, HH:mm')
    }
  },
  computed: {
    rawData() {
      return this.stepsWithProject
    },
  }
}
</script>

<style scoped lang="scss">
@import "assets/scss/colors";
.table {
  width: 100%;

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
    cursor: pointer;
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
.link-to {
  color: inherit;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
.short {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  opacity: 0.3;
}
.currency {
  margin-right: 4px;
  color: $dark-border;
}
</style>