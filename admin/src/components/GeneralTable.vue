<template lang="pug">
  .go
    .th__modals
      ValidationErrors(
        v-if="areErrors"
        :errors="errors"
        :isAbsolute="isAbsolute"
        @closeErrors="closeErrors"
      )
      ApproveModal(
        v-if="areErrors"
        text="Are you sure?"
        approveValue="Yes"
        notApproveValue="Cancel"
        @approve="approve"
        @notApprove="notApprove"
        @close="closeModal"
      )
    span(@click="showFilters = !showFilters") 'show filter'
    table
      thead
        tr
          th(v-for="header in headers" :style="header.style")
            .th__header
              slot( :name="header.slotHeaderName" :field="header")
              .th__sort-icon(v-if="header.sortInfo.isSort")
                .th__sort-test(v-if="header.sortInfo.order === 'asc' || header.sortInfo.order === 'desc'")
                  i.fas.fa-caret-down(v-if="header.sortInfo.order === 'asc'"  @click.stop="changeSortKey({sortInfo: header.sortInfo, key: header.key, sortField: header.slotDataName, order: 'desc'})")
                  i.fas.fa-caret-up(v-else-if="header.sortInfo.order === 'desc'"  @click.stop="changeSortKey({sortInfo: header.sortInfo, key: header.key, sortField: header.slotDataName, order: 'asc'})")
                i.fas.fa-times-circle(v-if="header.sortInfo.order === 'asc' || header.sortInfo.order === 'desc'"  @click.stop="removeSortKey({sortInfo: header.sortInfo, key: header.key, sortField: header.slotDataName, order: 'asc'})")
                i.fas.fa-sort(v-else @click.stop="addSortKey({sortInfo: header.sortInfo, key: header.key, sortField: header.slotDataName, order: 'asc'})")
            .th__filter(v-if="header.filterInfo.isFilter && showFilters")
              input(:ref='header.slotDataName' @keyup="(e) => setFilter({filterInfo: header.filterInfo, value: e.target.value, key: header.key, filterField: header.slotDataName})")
              i.fas.fa-times-circle.th__filter-close(v-if="header.filterInfo.isFilterSet" @click.stop="removeFilter({ filterInfo: header.filterInfo , filterField: header.slotDataName})")

      tbody
        tr.data(
              v-for="(row, index) of tableData"
        )
          td(v-for="field of headers" :style="field.style")
            slot(:name="field.slotDataName" :row="row" :index="index")

</template>

<script>
import ApproveModal from './ApproveModal'
import ValidationErrors from './ValidationErrors'
	export default {
	  props: {
	    //Array of header Info
      headers: {
        type: Array,
      },
      //Array of data
      tableData: {
        type: Array,
      },

      areErrors: {
        type: Boolean,
        default: false
      }
    },
	  data() {
	    return {
        showFilters: false
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

      setFilter(field) {
        this.$emit('setFilter', field)
      },
      removeFilter(field) {
        this.$refs[field.filterField][0].value = ''
        this.$emit('removeFilter', field)
      }
    },
    components: {
      ValidationErrors,
      ApproveModal
    }
  }
</script>

<style lang="scss" scoped>
  .th {
    &__modals {
      position: absolute;
      z-index: 10;
      top: 50%;
      left: 50%;
      transform: translate(-50%);
    }
    &__sort-icon {
      display: flex;
      width: 25px;
      justify-content: space-between;
    }
    &__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 40px;
    }
    &__filter {
      //height: 31px;
      input {
        width: 100%;
        margin-bottom: 10px;
        box-sizing: border-box;
        padding-right: 20px;
      }

      &-close {
        position: absolute;
        top: 4px;
        right: 4px;
        z-index: 50;
        color: #36304a;
      }
     }
  }
  table {
    border-collapse: collapse;
    background: white;
    width: 100%;
    position: relative;
  }

  table * {
    position: relative;
  }

  table td, table th {
    padding: 0 6px;
  }

  th{
    //display: flex;
    //align-items: center;
    min-height: 40px;
    //justify-content: space-between;
    //flex-shrink: 1;
  }

  td {
    padding: 0 6px 0 6px;
    min-height: 40px;
    display: grid;
    max-height: 60px;
    overflow-y: auto;
    align-items: center;
    letter-spacing: -0.1px;

  }

  tr {
    display: flex;
  }

  table thead {
    height: 40px;
    //background: #d1ccc4;
    background: #e0ddd8;
  }

  table tbody tr:last-child {
    border: 0;
  }

  /*table td, table th {*/
  /*  text-align: left;*/
  /*}*/

  table thead th {
    //color: $text;
    font-weight: unset;
  }

  tbody {
    max-height: 600px;
    display: block;
    overflow-x: auto;
  }

  tbody tr:nth-child(even) {
    background-color: #f5f5f5;
  }

  tbody tr {
    font-size: 14px;
    font-weight: unset;
  }

  tbody tr:hover {
    background-color: #f5f5f5;
    cursor: default;
  }

</style>