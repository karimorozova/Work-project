<template lang="pug">
  .documents
    .table
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

        template(slot="fileName" slot-scope="{ row, index }")
          .table__data(v-if="row.fileName" ) {{ row.fileName }}
          .table__data(v-else)
            span(style="opacity:.5") Document missing...

        template(slot="category" slot-scope="{ row, index }")
          .table__data {{ row.category }}

        template(slot="icons" slot-scope="{ row, index }")
          .table__icons(v-if="row.fileName" @click="download(row)")
            .icon
              i(class="fa-solid fa-download")

</template>
<script>
import GeneralTable from "../../../../../components/general/GeneralTable"
import tableSortAndFilter from "../../../../../mixins/tableSortAndFilter"

export default {
  components: { GeneralTable },
  mixins: [ tableSortAndFilter ],
  props: [ 'arr' ],
  data() {
    return {
      fields: [
        {
          label: "File Name",
          headerKey: "headerFileName",
          key: "fileName",
          filterInfo: { isFilter: true },
          sortInfo: { isSort: true, order: 'default' },
          style: { width: "50%" }
        },
        {
          label: "Category",
          headerKey: "headerCategory",
          key: "category",
          filterInfo: { isFilter: true },
          sortInfo: { isSort: true, order: 'default' },
          style: { width: "30%" }
        },
        {
          label: "",
          headerKey: "headerIcons",
          key: "icons",
          style: { width: "20%" }
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