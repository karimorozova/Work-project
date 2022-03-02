<template lang="pug">
  .education
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

      template(slot="institute" slot-scope="{ row, index }")
        .table__data {{ row.institute }}

      template(slot="field" slot-scope="{ row, index }")
        .table__data {{ row.field }}

      template(slot="study" slot-scope="{ row, index }")
        .table__data {{ row.study }}

      template(slot="grade" slot-scope="{ row, index }")
        .table__data {{ row.grade }}

      template(slot="icons" slot-scope="{ row, index }")
        .table__icons(v-if="row.document" @click="download(row.document)")
          .icon
            i(class="fa-solid fa-download")
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
          headerKey: "headerDuration",
          key: "duration",
          filterInfo: { isFilter: true },
          sortInfo: { isSort: true, order: 'default' },
          style: { width: "20%" }
        },
        {
          label: "Institute / School",
          headerKey: "headerEducation",
          key: "institute",
          filterInfo: { isFilter: true },
          sortInfo: { isSort: true, order: 'default' },
          style: { width: "20%" }
        },
        {
          label: "Major / Department",
          headerKey: "headerDepartment",
          key: "field",
          filterInfo: { isFilter: true },
          sortInfo: { isSort: true, order: 'default' },
          style: { width: "20%" }
        },
        {
          label: "Degree",
          headerKey: "headerDegree",
          key: "study",
          filterInfo: { isFilter: true },
          sortInfo: { isSort: true, order: 'default' },
          style: { width: "20%" }
        },

        {
          label: "Grade",
          headerKey: "headerGrade",
          key: "grade",
          filterInfo: { isFilter: true },
          sortInfo: { isSort: true, order: 'default' },
          style: { width: "10%" }
        },
        {
          label: "",
          headerKey: "headerDocument",
          key: "icons",
          style: { width: "10%" }
        }
      ],

      domain: "http://localhost:3001"
    }
  },
  methods: {
    download({ path }) {
      let link = document.createElement('a')
      link.href = process.env.domain + path
      link.target = "_blank"
      link.click()
    }
  },
  computed: {
    rawData() {
      return this.arr
    }
  },
  components: {
    GeneralTable
  },
  mounted() {
    this.domain = process.env.domain
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
