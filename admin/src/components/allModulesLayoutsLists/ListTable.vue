<template lang="pug">
  .listTable(
    @scroll="lazyLoading"
    :style="{ 'max-height': tableMaxHeight  + 'px' }"
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
          th(v-for="{ style, name, id } in fields")
            .th__titleAndSort(:style="style") {{ name }}
              .th__sortIcons(v-if="sorting.find(i => i.id === id)")


                //span(v-if="!getSimpleValue(id)" @click="sortBy(id, 'ASC')")
                //  i.fas.fa-sort
                //span
                //  span(v-if="getSimpleValue(id)")
                //span(v-if="getSimpleValue(id)" @click="removeSortBy(id)")
                //  i.fas.fa-times-circle

                //i.fas.fa-caret-down
                //i.fas.fa-caret-up

              //  i.fas.fa-times-circle(v-if="sortInfo.order === 'asc' || sortInfo.order === 'desc'" @click.stop="removeSortKey({sortInfo, key: dataKey, sortField: key, order: 'asc'})")
              //  span(v-if="sortInfo.order === 'asc' || sortInfo.order === 'desc'")
              //    i.fas.fa-caret-down(v-if="sortInfo.order === 'asc'" @click.stop="changeSortKey({sortInfo, key: dataKey, sortField: key, order: 'desc'})")
              //    i.fas.fa-caret-up(v-else-if="sortInfo.order === 'desc'" @click.stop="changeSortKey({sortInfo, key: dataKey, sortField: key, order: 'asc'})")
              //  i.fas.fa-sort(v-else @click.stop="addSortKey({sortInfo, key: dataKey, sortField: key, order: 'asc'})")

      tbody
        tr(v-for="(item, index) of data")
          td(v-for="{ id } of fields")
            .td__data
              slot(:name="id" :item="item" :index="index" )

</template>

<script>
import ApproveModal from '../ApproveModal'
import { mapGetters } from "vuex"
import LayoutWrapperMixin from "../../mixins/LayoutWrapperMixin"

export default {
  mixins: [ LayoutWrapperMixin ],
  props: {
    fields: {
      type: Array,
      default: () => []
    },
    sorting: {
      type: Array,
      default: () => []
    },
    data: {
      type: Array,
      default: () => []
    },
    isApproveModal: {
      type: Boolean,
      default: false
    },
    tableMaxHeight: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {}
  },
  methods: {
    sortBy(key, value) {
      this.replaceRoute(key, value)
      this.makeDBSortingRequest()
    },
    removeSortBy(id) {
      this.removeQuery(id)
      this.makeDBSortingRequest()
    },
    makeDBSortingRequest() {
      this.$emit('makeDBSortingRequest')
    },
    approve() {
      this.$emit('approve')
    },
    notApprove() {
      this.$emit('notApprove')
    },
    closeModal() {
      this.$emit('closeModal')
    },
    // addSortKey(field) {
    //   this.$emit('addSortKey', field)
    // },
    // changeSortKey(field) {
    //   this.$emit('changeSortKey', field)
    // },
    // removeSortKey(field) {
    //   this.$emit('removeSortKey', field)
    // },
    lazyLoading(e) {
      const element = e.target
      if (element.scrollTop && Math.ceil(element.scrollHeight - element.scrollTop) === element.clientHeight) {
        if (!!this.requestCounter) return
        this.$emit("lazyLoading")
      }
    }
  },
  computed: {
    ...mapGetters({
      requestCounter: 'getRequestCounter'
    })
  },
  components: {
    ApproveModal
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.listTable {
  overflow: auto;
  border: 1px solid $light-border;
}

%iconsStyle {
  transition: .1s ease-out;
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
  font-size: 17px;
  @extend %iconsStyle;
}

.th {
  &__sortIcons {
    gap: 7px;
    display: flex;
    margin-right: 7px;
    align-items: center;
  }

  &__titleAndSort {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;
    letter-spacing: 0.3px;
  }
}

.td {
  &__data {
    min-height: 42px;
    padding: 5px 10px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: flex-start;

    i {
      color: $dark-border;
    }
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
  width: 100%;
}

th {
  box-sizing: border-box;
  padding: 0 0 0 10px;
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
  color: $link;
  text-decoration: none;
  transition: .2s ease-out;

  &:hover {
    text-decoration: underline;
  }
}
</style>