<template lang="pug">
  .generalTable

    .filter(v-if="isFilterShow" @click="showFilter" :class="{'absoluteFilter': isFilterAbsolute}")
      span(v-show="!showFilters")
        i.fas.fa-filter
      span(v-show="showFilters")
        i.fas.fa-times-circle#filterClose

    table

      thead
        .hideScrollBlock(v-if="tableData.length >= elementToScroll")

        tr(:class="{'scroll': tableData.length >= elementToScroll}")

          th(v-for="{ headerKey, style, sortInfo, dataKey, key, filterInfo, ...rest } in fields" :style="style")

            .th__titleAndSort
              slot(:name="headerKey" :field="{ headerKey, sortInfo, style, dataKey, key, filterInfo, ...rest }")

              .th__sortIcons(v-if="sortInfo && sortInfo.isSort")
                span.icon-wrapper(v-show="sortInfo.order === 'asc' || sortInfo.order === 'desc'" @click.stop="removeSortKey({sortInfo, key: dataKey, sortField: key, order: 'asc'})")
                  i.fas.fa-times-circle
                span.icon-wrapper(v-show="sortInfo.order === 'asc'" @click.stop="changeSortKey({sortInfo, key: dataKey, sortField: key, order: 'desc'})")
                  i.fas.fa-caret-down
                span.icon-wrapper(v-show="sortInfo.order === 'desc'" @click.stop="changeSortKey({sortInfo, key: dataKey, sortField: key, order: 'asc'})")
                  i.fas.fa-caret-up
                span.icon-wrapper(v-show="sortInfo.order !== 'asc' && sortInfo.order !== 'desc'" @click.stop="addSortKey({sortInfo, key: dataKey, sortField: key, order: 'asc'})")
                  i.fas.fa-sort

            .th__filter(v-if="filterInfo && filterInfo.isFilter && showFilters")
              input(:ref='key' @keyup="(e) => setFilter({filterInfo, value: e.target.value, key: dataKey, filterField: key})")
              span.icon-wrapper(v-if="filterInfo.isFilterSet" @click.stop="removeFilter({ filterInfo, filterField: key})")
                i.fas.fa-backspace.th__filter-close

      tbody(:class="[{'scroll': tableData.length >= elementToScroll},{'shortBody': isBodyShort}]" ref="tableBody" @scroll="handleBodyScroll")
        tr.data(v-for="(row, index) of tableData" :class="{'active': activeField === index}")
          td(v-for="field of fields" :style="field.style" :class="row.class")
            slot(:name="field.key" :row="row" :index="index" )


    ValidationErrors(
      v-if="areErrors"
      :errors="errors"
      :isAbsolute="true"
      @closeErrors="closeErrors"
    )
    .approve(v-if="isApproveModal")
      ApproveModal(
        v-if="isApproveModal"
        text="Are you sure?"
        approveValue="Yes"
        notApproveValue="Cancel"
        @approve="approve"
        @notApprove="notApprove"
        @close="closeModal"
      )

</template>

<script>
import ApproveModal from './ApproveModal'
import ValidationErrors from './ValidationErrors'

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
    areErrors: {
      type: Boolean,
      default: false
    },
    errors: {
      type: Array,
      default: () => []
    },
    isApproveModal: {
      type: Boolean,
      default: false
    },
    isFilterShow: {
      type: Boolean,
      default: false
    },
    isFilterAbsolute: {
      type: Boolean,
      default: false
    },
    isBodyShort: {
      type: Boolean,
      default: false
    },
    activeField: {
      type: Number,
      default: -1
    }
  },
  data() {
    return {
      showFilters: false,
      elementToScroll: this.isBodyShort ? 7 : 13
    }
  },
  methods: {
    closeErrors() {
      this.$emit('closeErrors')
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

    addSortKey(field) {
      this.$emit('addSortKey', field)
    },
    changeSortKey(field) {
      this.$emit('changeSortKey', field)
    },
    removeSortKey(field) {
      this.$emit('removeSortKey', field)
    },

    showFilter() {
      this.showFilters = !this.showFilters
      this.$emit('toggleFilter', this.showFilters)
      if (!this.showFilters) {
        this.$emit('clearAllFilters')
      }
    },
    setFilter(field) {
      this.$emit('setFilter', field)
    },
    removeFilter(field) {
      this.$refs[field.filterField][0].value = ''
      this.$emit('removeFilter', field)
    },

    handleBodyScroll(e) {
      const element = e.target
      if (Math.ceil(element.scrollHeight - element.scrollTop) === element.clientHeight) {
        this.$emit("bottomScrolled")
      }
    }
  },
  components: {
    ValidationErrors,
    ApproveModal
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";
.absoluteFilter {
  position: absolute;
  right: 0;
  top: -37px;
}
.data {
  &.active {
    opacity: 0.5;
  }
}

.generalTable {
  position: relative
}

.approve {
  position: absolute;
  z-index: 50;
  background-color: transparent;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.filter {
  border: 1px solid $border;
  border-radius: 2px;
  height: 30px;
  width: 30px;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: .2s ease-out;
  justify-content: center;
  float: right;

  &:hover {
    .fa-filter {
      color: $text !important;
    }

    #filterClose {
      color: $text !important;
    }
  }
}

%iconsStyle {
  transition: .2s ease-out;
  color: $dark-border;
  cursor: pointer;

  &:hover {
    color: $text;
  }
}

.fa-filter {
  font-size: 12px;
  color: $dark-border;
}

.fa-backspace {
  font-size: 16px;
  @extend %iconsStyle;
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

input {
  font-size: 14px;
  color: $text;
  border: 1px solid $border;
  border-radius: 2px;
  box-sizing: border-box;
  padding: 0 7px;
  outline: none;
  height: 32px;
  width: 100%;
  font-family: 'Roboto400';
  transition: .1s ease-out;

  &:focus {
    border: 1px solid $border-focus;
  }
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
    height: 40px;
  }

  &__filter {
    padding: 0px 8px 8px 8px;
    position: relative;

    &-close {
      position: absolute;
      right: 14px;
      top: 8px;
    }
  }
}


table {
  border-collapse: collapse;
  background: white;
  width: 100%;
  position: relative;
  border: 1px solid $border;
}

table * {
  position: relative;
}

th {
  border-left: 1px solid $border;
  box-sizing: border-box;
  padding: 0;

  &:first-child {
    border-left: none;
  }
}

td {
  border-left: 1px solid $light-border;
  height: 42px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  justify-content: flex-start;
  box-sizing: border-box;
  letter-spacing: -0.1px;
  padding: 0;

  &:first-child {
    border-left: none;
  }
}

tr {
  display: flex;
}

table thead {
  border-bottom: 1px solid $border;
}

table thead th {
  font-weight: unset;
  font-family: 'Roboto600';
}

tbody {
  max-height: 462px;
  display: block;
  color: $text;
}

tbody tr:nth-child(even) {
  background-color: $table-list;
}

tbody tr {
  font-size: 14px;
  font-weight: unset;
}

tbody tr:hover {
  background-color: $table-list-hover;
  cursor: default;
}

.hideScrollBlock {
  height: 100%;
  width: 20px;
  background: white;
  position: absolute;
  right: 1px;
  z-index: 1;
}

.scroll {
  overflow-y: scroll;
}

.red-row{
  background-color: $light-red;
}

.shortBody {
  max-height: 252px;
}
</style>