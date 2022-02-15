<template lang="pug">
  .rates
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

      template(slot="sourceLanguage", slot-scope="{ row, index }")
        .table__data {{ row.sourceLanguage.lang }}

      template(slot="targetLanguage", slot-scope="{ row, index }")
        .table__data {{ row.targetLanguage.lang }}

      template(slot="step", slot-scope="{ row, index }")
        .table__data {{ row.step.title }}
      template(slot="unit", slot-scope="{ row, index }")

        .table__data {{ row.unit.type }}
      template(slot="industry", slot-scope="{ row, index }")

        .table__data {{ row.industry.name }}
      template(slot="price", slot-scope="{ row, index }")
        .table__data {{ row.price }}
          span.currency(v-html="returnIconCurrencyByStringCode('EUR')")

</template>

<script>
import GeneralTable from "../../../../../components/general/GeneralTable"
import tableSortAndFilter from "../../../../../mixins/tableSortAndFilter"
import currencyIconDetected from "../../../../../mixins/currencyIconDetected"

export default {
  components: { GeneralTable },
  mixins: [ tableSortAndFilter, currencyIconDetected ],
  props: [ 'arr' ],
  data() {
    return {
      fields: [
        {
          label: "Source Language",
          headerKey: "headerA",
          key: "sourceLanguage",
          dataKey: 'lang',
          filterInfo: { isFilter: true },
          sortInfo: { isSort: true, order: 'default' },
          style: { width: "21.5%" }
        },
        {
          label: "Target Language",
          headerKey: "headerB",
          key: "targetLanguage",
          dataKey: 'lang',
          filterInfo: { isFilter: true },
          sortInfo: { isSort: true, order: 'default' },
          style: { width: "21.5%" }
        },
        {
          label: "Step",
          headerKey: "headerC",
          key: "step",
          dataKey: 'title',
          filterInfo: { isFilter: true },
          sortInfo: { isSort: true, order: 'default' },
          style: { width: "15%" }
        },
        {
          label: "Unit",
          headerKey: "headerD",
          key: "unit",
          dataKey: 'type',
          filterInfo: { isFilter: true },
          sortInfo: { isSort: true, order: 'default' },
          style: { width: "15%" }
        },
        {
          label: "Industry",
          headerKey: "headerE",
          key: "industry",
          dataKey: 'name',
          filterInfo: { isFilter: true },
          sortInfo: { isSort: true, order: 'default' },
          style: { width: "15%" }
        },
        {
          label: "Price",
          headerKey: "headerF",
          key: "price",
          sortInfo: { isSort: true, order: 'default' },
          style: { width: "12%" }
        }
      ]
    }
  },
  methods: {},
  computed: {
    rawData() {
      return this.arr
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../../../../assets/scss/colors";

.currency {
  color: $dark-border;
  margin-left: 4px;
}

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
  font-size: 15px;
  cursor: pointer;
}
</style>
