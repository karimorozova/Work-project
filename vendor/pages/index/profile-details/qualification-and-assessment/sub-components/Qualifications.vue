<template lang="pug">
  .qualifications
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

      template(slot="source", slot-scope="{ row, index }")
        .table__data {{ row.source.lang }}

      template(slot="target", slot-scope="{ row, index }")
        .table__data {{ row.target.lang }}

      template(slot="industry", slot-scope="{ row, index }")
        .table__data {{ presentArrays(row.industries, 'name') }}

      template(slot="step", slot-scope="{ row, index }")
        .table__data {{ presentArrays(row.steps, 'title') }}

      template(slot="status", slot-scope="{ row, index }")
        .table__data {{ row.status }}

      template(slot="progress", slot-scope="{ row, index }")
        .table__data
          .progress-line
            .progress-line__body(v-for="stage in 5")
              .progress-line__bar(v-if="stage <= setStatusStage(row.status)", :style="{ background: '#4ba5a5' }")
              .progress-line__bar(v-else)

      template(slot="tqi", slot-scope="{ row, index }")
        .table__data {{ row.tqi }}

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
          label: "Source",
          headerKey: "headerSource",
          key: "source",
          dataKey: 'lang',
          filterInfo: { isFilter: true },
          sortInfo: { isSort: true, order: 'default' },
          style: { width: "16%" }
        },
        {
          label: "Target",
          headerKey: "headerTarget",
          key: "target",
          dataKey: 'lang',
          filterInfo: { isFilter: true },
          sortInfo: { isSort: true, order: 'default' },
          style: { width: "16%" }
        },
        {
          label: "Industries",
          headerKey: "headerIndustry",
          key: "industry",
          style: { width: "16%" }
        },
        {
          label: "Steps",
          headerKey: "headerStep",
          key: "step",
          style: { width: "16%" }
        },
        {
          label: "Test Status",
          headerKey: "headerStatus",
          key: "status",
          filterInfo: { isFilter: true },
          sortInfo: { isSort: true, order: 'default' },
          style: { width: "15%" }
        },
        {
          label: "Progress",
          headerKey: "headerProgress",
          key: "progress",
          style: { width: "12%" }
        },
        {
          label: "TQI",
          headerKey: "headerTQI",
          key: "tqi",
          filterInfo: { isFilter: false },
          sortInfo: { isSort: true, order: 'default' },
          style: { width: "8%" }
        }
      ]
    }
  },
  methods: {
    presentArrays(Arr, key) {
      if (!Arr.length) return ""
      return Arr.reduce((acc, cur) => acc + `${ cur[key] }; `, "")
    },
    setStatusStage(status) {
      switch (status) {
        case "Test Sent":
        case "Sample Requested":
          return 2
        case "Test Received":
        case "Sample Received":
          return 3
        case "Test In Review":
        case "Sample In Review":
          return 4
        case "Passed":
        case "Not Passed":
          return 5
        default:
          return 1
      }
    }
  },
  computed: {
    rawData() {
      return this.arr
    }
  },
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
    padding: 0px 7px;
    width: 100%;
    max-height: 42px;
    overflow-y: auto;
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

.progress-line {
  display: flex;
  height: 30px;
  align-items: center;

  &__body {
    width: 25%;
  }

  &__bar {
    height: 5px;
    margin: 0 2px;
    background: #ccc;
  }
}
</style>
