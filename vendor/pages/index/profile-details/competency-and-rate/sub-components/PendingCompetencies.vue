<template lang="pug">
  .competencies
    PendingCompetenciesModifyModal(
      v-if="editPendingCompetencies"
      :pendingCompetency="editPendingCompetencies"
      @close="closeModal"
      @updated="updateCurrentCompetencies"
    )

    .competencies__table
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

        :isApproveModal="isDeleting"
        @approve="deleteData"
        @notApprove="setDefaults"
        @closeModal="setDefaults"
      )
        template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
          .table__header {{ field.label }}

        template(slot="sourceLanguage", slot-scope="{ row, index }")
          .table__data {{ row.sourceLanguage.lang }}

        template(slot="targetLanguage", slot-scope="{ row, index }")
          .table__data {{ row.targetLanguage.lang }}

        template(slot="industry", slot-scope="{ row, index }")
          .table__data {{ row.industry.name }}

        template(slot="step", slot-scope="{ row, index }")
          .table__data {{ row.step.title }}

        template(slot="rate", slot-scope="{ row, index }")
          .table__data {{ row.rate }}
            span.currency(v-html="currencyIconDetected('EUR')")

        template(slot="icons" slot-scope="{ row, index }")
          .table__icons
            img.table__icon(v-for="(icon, key) in manageIcons" :src="icon.icon" @click="makeActions(index, key)")

</template>

<script>
import { mapActions, mapGetters } from "vuex"
import crudIcons from "../../../../../mixins/crudIcons"
import PendingCompetenciesModifyModal from "./PendingCompetenciesModifyModal"
import GeneralTable from "../../../../../components/general/GeneralTable"
import Button from "../../../../../components/general/Button"
import tableSortAndFilter from "../../../../../mixins/tableSortAndFilter"
import currencyIconDetected from "../../../../../mixins/currencyIconDetected"

export default {
  mixins: [ crudIcons, tableSortAndFilter, currencyIconDetected ],
  props: [ 'arr' ],
  data() {
    return {
      isDeleting: false,
      editPendingCompetencies: null,
      fields: [
        {
          label: "Source Language",
          headerKey: "headerSource",
          key: "sourceLanguage",
          dataKey: 'lang',
          filterInfo: { isFilter: true },
          sortInfo: { isSort: true, order: 'default' },
          style: { width: "23%" }
        },
        {
          label: "Target Language",
          headerKey: "headerTarget",
          key: "targetLanguage",
          dataKey: 'lang',
          filterInfo: { isFilter: true },
          sortInfo: { isSort: true, order: 'default' },
          style: { width: "23%" }
        },
        {
          label: "Industry",
          headerKey: "headerIndustry",
          key: "industry",
          dataKey: 'name',
          filterInfo: { isFilter: true },
          sortInfo: { isSort: true, order: 'default' },
          style: { width: "15%" }
        },
        {
          label: "Step",
          headerKey: "headerStep",
          key: "step",
          dataKey: 'title',
          filterInfo: { isFilter: true },
          sortInfo: { isSort: true, order: 'default' },
          style: { width: "15%" }
        },
        {
          label: "Price",
          headerKey: "headerRate",
          key: "rate",
          sortInfo: { isSort: true, order: 'default' },
          style: { width: "12%" }
        },
        {
          label: "",
          headerKey: "headerIcons",
          key: "icons",
          style: { width: "12%" }
        }
      ]
    }
  },
  methods: {
    ...mapActions([
      "alertToggle"
    ]),
    makeActions(index, key) {
      switch (key) {
        case "delete":
          this.isDeleting = true
          this.currentSelect = index
          break
        default:
          this.currentSelect = index
          this.editPendingCompetencies = this.finalData[index]
          // await this.checkErrors(index)
      }
    },
    sendRequest(pendingCompetencies) {
      try {
        this.$axios.post('/vendor/pending-competencies', {
          token: this.token,
          pendingCompetencies
        })
        this.$emit('updateProp')
        this.alertToggle({ message: "You’ve successfully made changes", isShow: true, type: "success" })
        this.editPendingCompetencies = null
      } catch (e) {
        this.alertToggle({ message: "Cannot edit info", isShow: true, type: "error" })
      }
    },
    updateCurrentCompetencies({ data }) {
      this.finalData[this.currentSelect] = data
      this.sendRequest(this.finalData)
    },
    deleteData() {
      this.isDeleting = false
      const pendingCompetencies = this.finalData.filter((_, i) => i !== this.currentSelect)
      this.sendRequest(pendingCompetencies)
    },
    setDefaults() {
      this.isDeleting = false
    },
    closeModal() {
      return (this.editPendingCompetencies = null)
    },
    closeErrors() {
      this.areErrors = false
    }
  },
  computed: {
    ...mapGetters({
      token: "getToken"
    }),
    rawData() {
      return this.arr
    },
    manageIcons() {
      const { cancel, save, ...res } = this.icons
      return res
    }
  },
  components: {
    Button,
    GeneralTable,
    PendingCompetenciesModifyModal
  }
}
</script>

<style lang="scss" scoped>
@import "../../../../../assets/scss/colors";

.competencies {
  position: relative;
}

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
    gap: 10px;
  }

  &__icon {
    cursor: pointer;
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
