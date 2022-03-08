<template lang="pug">
  .layoutTable(
    @scroll="bottomScrolled"
    :style="{ 'max-height': innerHeight - 145 - minusExtraHeight  + 'px' }"
  )
    .th__modals
      ApproveModal(
        v-if="isApproveModal"
        text="Are you sure?"
        approveValue="Yes"
        notApproveValue="Cancel"
        @approve="approve"
        @notApprove="notApprove"
        @close="closeModal"
      )

    table
      thead
        tr
          th(v-for="{ headerKey, style, sortInfo, dataKey, key, filterInfo, ...rest } in fields")
            .th__titleAndSort(:style="style")
              slot(:name="headerKey" :field="{ headerKey, sortInfo, style, dataKey, key, filterInfo, ...rest }")
              .th__sortIcons(v-if="sortInfo && sortInfo.isSort")
                i.fas.fa-times-circle(v-if="sortInfo.order === 'asc' || sortInfo.order === 'desc'" @click.stop="removeSortKey({sortInfo, key: dataKey, sortField: key, order: 'asc'})")
                span(v-if="sortInfo.order === 'asc' || sortInfo.order === 'desc'")
                  i.fas.fa-caret-down(v-if="sortInfo.order === 'asc'" @click.stop="changeSortKey({sortInfo, key: dataKey, sortField: key, order: 'desc'})")
                  i.fas.fa-caret-up(v-else-if="sortInfo.order === 'desc'" @click.stop="changeSortKey({sortInfo, key: dataKey, sortField: key, order: 'asc'})")
                i.fas.fa-sort(v-else @click.stop="addSortKey({sortInfo, key: dataKey, sortField: key, order: 'asc'})")

      tbody
        tr(v-for="(row, index) of tableData")
          td(v-for="{ key } of fields")
            .td__data
              slot(:name="key" :row="row" :index="index" )

</template>

<script>
import ApproveModal from './ApproveModal'
import { mapGetters } from "vuex"

export default {
  props: {
    fields: {
      type: Array,
      default: () => []
    },
    tableData: {
      type: Array,
      default: () => []
    },
    isApproveModal: {
      type: Boolean,
      default: false
    },
    minusExtraHeight: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      innerHeight: 0
    }
  },
  methods: {
    approve() {
      this.$emit('approve')
    },
    notApprove() {
      this.$emit('notApprove')
    },
    closeModal() {
      this.$emit('closeModal')
    },
    addSortKey(field) {
      this.$emit('addSortKey', field)
    },
    changeSortKey(field) {
      this.$emit('changeSortKey', field)
    },
    removeSortKey(field) {
      this.$emit('removeSortKey', field)
    },
    bottomScrolled(e) {
      const element = e.target
      if (Math.ceil(element.scrollHeight - element.scrollTop) === element.clientHeight) {
        this.$emit("bottomScrolled")
      }
    }
  },
  mounted() {
    this.innerHeight = window.innerHeight
  },
  computed: {
    ...mapGetters({
      user: "getUser"
    })
  },
  components: {
    ApproveModal
  }
}
</script>

<style lang="scss" scoped>
@import "../assets/scss/colors";

.layoutTable {
  overflow: auto;
  border: 1px solid $light-border;
}

%iconsStyle {
  transition: .2s ease-out;
  color: $dark-border;
  cursor: pointer;

  &:hover {
    color: $text;
  }
}

.fa-sort {
  font-size: 16px;
  @extend %iconsStyle;
}

.fa-times-circle {
  font-size: 15px;
  @extend %iconsStyle;
}

.fa-caret-up,
.fa-caret-down {
  font-size: 19px;
  @extend %iconsStyle;
}

.th {
  &__sortIcons {
    gap: 6px;
    display: flex;
    margin-right: 8px;
    align-items: center;
  }

  &__titleAndSort {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 45px;
  }
}

.td {
  &__data {
    min-height: 45px;
    padding: 4px 8px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }
}

table td:first-child {
  box-shadow: inset -1px 0 0 $light-border;
}

table tr th:first-child, table td:first-child {
  position: sticky;
  left: 0;
  z-index: 10;
  background: #fff;
}

table tr th:first-child {
  z-index: 11;
}

table tr th {
  position: sticky;
  top: 0;
  z-index: 9;
}

table {
  border-collapse: collapse;
  background: white;
}

th {
  box-sizing: border-box;
  padding: 0 0 0 8px;
  background: $table-header !important;
}

table td {
  padding: 0;
  box-shadow: inset -1px 0 0 $light-border;

  &:last-child {
    box-shadow: none;
  }
}

table th {
  box-shadow: inset -1px 0 0 $border;

  &:last-child {
    box-shadow: none;
  }
}

td {
  box-sizing: border-box;
  letter-spacing: -0.1px;
}

table thead th {
  font-weight: unset;
  font-family: 'Myriad600';
}

tbody {
  color: $text;
}

tbody tr:nth-child(even),
tbody tr:nth-child(2n) td:first-child {
  background-color: $table-list;
}

tbody tr {
  font-size: 14px;
  font-weight: unset;
}

tbody tr:hover td {
  background-color: $table-list-hover !important;
  cursor: default;
}

a {
  color: inherit;
  text-decoration: none;
  transition: .2s ease-out;

  &:hover {
    text-decoration: underline;
  }
}
</style>