<template lang="pug">
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
    template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
      .day-today__header {{ field.label }}

    template(slot="projectId" slot-scope="{ row, index }")
      .day-today__data
        span {{row.projectId}}

        router-link(class="link-to" :to="{path: `/pangea-projects/all-projects/All/details/${row._id}`}" target="_blank")
          i(class="fas fa-external-link-alt")

    template(slot="projectName" slot-scope="{ row, index }")
      .day-today__data {{row.projectName}}
    template(slot="customer" slot-scope="{ row, index }")
      .day-today__data
        span {{ row.customer.name }}
        router-link(class="link-to" :to="{path: `/pangea-clients/all/details/${row.customer._id}`}" target="_blank")
          i(class="fas fa-external-link-alt")
    template(slot="deadline" slot-scope="{ row, index }")
      .day-today__data {{ customFormatter(row.deadline) }}
    template(slot="status" slot-scope="{ row, index }")
      .day-today__data {{ row.status }}
    template(slot="assigned" slot-scope="{ row, index }")
      //.day-today__data {{ row.projectManager.firstName }}
      .day-today__data ...coming soon
</template>

<script>
import GeneralTable from '../../GeneralTable'
import moment from "moment"
import tableSortAndFilter from "../../../mixins/tableSortAndFilter"

export default {
  mixins: [tableSortAndFilter],
  name: "DueToday.vue",
  props: {
    projects: {
      type: Array,
      require: true,
    }
  },
  data() {
    return {
      fields: [
        {
          label: "ID",
          headerKey: "headerID",
          key: "projectId",
          sortInfo: {isSort: true, order: 'default'},
          filterInfo: {isFilter: true},
          style: { "width": "18%" }
        },
        {
          label: "Project Name",
          headerKey: "headerProjectName",
          key: "projectName",
          sortInfo: {isSort: true, order: 'default'},
          filterInfo: {isFilter: true},
          style: { "width": "20%" }
        },
        {
          label: "Client",
          headerKey: "headerClient",
          key: "customer",
          dataKey: "name",
          sortInfo: {isSort: true, order: 'default'},
          filterInfo: {isFilter: true},
          style: { "width": "16%" }
        },
        {
          label: "Deadline",
          headerKey: "headerDeadline",
          key: "deadline",
          sortInfo: {isSort: true, order: 'default'},
          filterInfo: {isFilter: true},
          style: { "width": "16%" }
        },
        {
          label: "Status",
          headerKey: "headerStatus",
          key: "status",
          sortInfo: {isSort: true, order: 'default'},
          filterInfo: {isFilter: true},
          style: { "width": "14%" }
        },
        {
          label: "Assigned",
          headerKey: "headerAssigned",
          key: "assigned",
          style: { "width": "16%" }
        }
      ]
    }
  },
  computed: {

    rawData() {
      return this.projects
    },
  },
  methods: {
    customFormatter(date) {
      return moment(date).format('MMM D, HH:mm')
    },
  },
  components: {
    GeneralTable,
  }
}
</script>

<style scoped lang="scss">
@import "../../../assets/scss/colors";
a {
  color: $text;
}

.day-today {
  &__header,
  &__data {
    padding: 0 7px;
  }

  &__data {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }


}
</style>