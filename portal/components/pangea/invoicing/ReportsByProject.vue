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

      template(slot="projectName" slot-scope="{ row, index }")
        .table__data
          .id
            router-link(class="link-to" :to="{path: `/projects/details/${row.projectNativeId}`}")
              span {{row.projectName}}
            .short
              span {{ row.projectId }}

      template(slot="total" slot-scope="{ row, index }")
        .table__data
          span.currency(v-html="returnIconCurrencyByStringCode(row.projectCurrency)")
          span {{ row.total.toFixed(2) }}
</template>

<script>
import tableSortAndFilter from "../../../mixins/tableSortAndFilter"
import GeneralTable from "../../../components/pangea/GeneralTable"

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
          headerKey: "headerProjectName",
          key: "projectName",
          sortInfo: { isSort: true, order: 'default' },
          filterInfo: { isFilter: true },
          style: { width: "70%" }
        },

        {
          label: "Fee",
          headerKey: "headerTotal",
          key: "total",
          sortInfo: { isSort: true, order: 'default' },
          filterInfo: { isFilter: true },
          style: { width: "30%" }
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
    downloadFile(path) {
      const domain = window.location.hostname === 'localhost'
          ? 'http://localhost:3001'
          : 'https://admin.pangea.global'
      let link = document.createElement('a')
      link.href = domain + '/' + path
      link.target = "_blank"
      link.click()
    },
  },
  computed: {
    rawData() {
      const groupedByProject = this.stepsWithProject.reduce((acc, { projectId, projectName,  projectNativeId, finance })=> {
        if(!acc.hasOwnProperty(projectNativeId)) {
          acc[projectNativeId] = {
            projectId: projectId,
            projectNativeId: projectNativeId,
            projectName: projectName,
            total: finance.Price.receivables
          }
        }else {
          acc[projectNativeId].total = acc[projectNativeId].total + finance.Price.receivables
        }
        return acc
      }, {})
      return Object.values(groupedByProject)
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