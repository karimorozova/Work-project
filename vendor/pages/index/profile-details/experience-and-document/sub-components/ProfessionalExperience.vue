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

      template(slot="duration" slot-scope="{ row, index }")
        .table__data {{ row.duration }}

      template(slot="occupation" slot-scope="{ row, index }")
        .table__data {{ row.occupation }}

      template(slot="company" slot-scope="{ row, index }")
        .table__data {{ row.company }}

      template(slot="notes" slot-scope="{ row, index }")
        .table__data {{ row.notes }}
</template>

<script>
import GeneralTable from "../../../../../components/general/GeneralTable"
import tableSortAndFilter from "../../../../../mixins/tableSortAndFilter"

export default {
  mixins: [ tableSortAndFilter ],
  props: [ 'arr' ],
  data() {
    return {
      fields: [
        {
          label: "Duration",
          headerKey: "h1",
          key: "duration",
          filterInfo: { isFilter: true },
          sortInfo: { isSort: true, order: 'default' },
          style: { width: "25%" }
        },
        {
          label: "Occupation / Title",
          headerKey: "h2",
          key: "occupation",
          filterInfo: { isFilter: true },
          sortInfo: { isSort: true, order: 'default' },
          style: { width: "25%" }
        },
        {
          label: "Company",
          headerKey: "h3",
          key: "company",
          filterInfo: { isFilter: true },
          sortInfo: { isSort: true, order: 'default' },
          style: { width: "25%" }
        },
        {
          label: "Notes",
          headerKey: "h4",
          key: "notes",
          filterInfo: { isFilter: true },
          sortInfo: { isSort: true, order: 'default' },
          style: { width: "25%" }
        }
      ]
    }
  },
  computed: {
    rawData() {
      return this.arr
    }
  },
  methods: {},
  components: {
    GeneralTable
  }

}
</script>
<style lang="scss" scoped>
@import "../../../../../assets/scss/colors";

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
