<template lang="pug">
  .go
    //.th__modals
    //  ValidationErrors(
    //    v-if="areErrors"
    //    :errors="errors"
    //    :isAbsolute="isAbsolute"
    //    @closeErrors="closeErrors"
    //  )
    //  ApproveModal(
    //    text="Are you sure?"
    //    approveValue="Yes"
    //    notApproveValue="Cancel"
    //    @approve="approve"
    //    @notApprove="notApprove"
    //    @close="closeModal"
    //  )
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
            .th__filter(v-if="header.hasFilter && showFilters")
              input(:ref='header.slotDataName' @keyup="(e) => setFilter({value: e.target.value, key: header.key, filterField: header.slotDataName})")
              i.fas.fa-times-circle.th__filter-close( @click.stop="removeFilter({filterField: header.slotDataName})")

      tbody
        tr.data(
              v-for="(row, index) of tableData"
        )
          td(v-for="field of headers" :style="field.style")
            slot(:name="field.slotDataName" :row="row" :index="index")

</template>

<script>
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
      //Shows filters inputs toggle
      // showFilters: {
      //   type: Boolean,
      //   default: false
      // }
    },
	  data() {
	    return {
        showFilters: false
      }
    },
    methods: {
      addSortKey(field) {
        this.$emit('addSortKey', field)
      },
      changeSortKey(field) {
        console.log('this')
        this.$emit('changeSortKey', field)
      },
      removeSortKey(field) {
        this.$emit('removeSortKey', field)
      },

      setFilter(field) {
        this.$emit('setFilter', field)
      },
      removeFilter(field) {

        // console.log({ parrent: this.$parent })
        // console.log(this.$refs, field)
        this.$refs['header.slotDataName'].value = ''
        this.$emit('removeFilter', field)
      }
    }
  }
</script>

<style lang="scss" scoped>
  .th {
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
    background: #36304a;
  }

  table tbody tr:last-child {
    border: 0;
  }

  /*table td, table th {*/
  /*  text-align: left;*/
  /*}*/

  table thead th {
    color: #fff;
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