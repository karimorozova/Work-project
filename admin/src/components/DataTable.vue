<template lang="pug">
  .table
    .table__thead(:class="tableheadClass")
      .table__head-row(:class="tableheadRowClass")
        .table__thead-cell(v-for="field of fields" :style="{width: field.width}" :class="headCellClass")
          slot(:name="field.headerKey" :field="field")
    .table__tbody(:class="bodyClass" @scroll="handleBodyScroll")
      .table__body-row(v-for="(row, index) of tableData" @click="onClick(index)" :class="bodyRowClass")
        .table__tbody-cell(v-for="field of fields" :style="{width: field.width, padding: field.padding}" :class="[bodyCellClass, field.cellClass]")
          slot(:name="field.key" :row="row" :index="index")
</template>

<script>
  export default {
    props: {
      fields: {
        type: Array
      },
      tableData: {
        type: Array
      },
      activeIndex: {
        type: Number
      },
      headCellClass: {
        type: String
      },
      bodyClass: {
        type: [String, Array]
      },
      bodyRowClass: {
        type: String
      },
      bodyCellClass: {
        type: String
      },
      tableheadClass: {
        type: String
      },
      tableheadRowClass: {
        type: String
      }
    },
    methods: {
      onClick(index) {
        this.$emit("onRowClicked", {index})
      },
      handleBodyScroll(e) {
        const element = e.target;
        if (
          element.scrollHeight - element.scrollTop - element.clientHeight <= 5 ||
          !(element.scrollHeight - element.scrollTop) - element.clientHeight > 6
        ) {
          this.$emit("bottomScrolled");
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '../assets/scss/colors.scss';

  .table {
    width: 100%;
    &__thead {
      border: .5px solid #938676;
      border-bottom: none;
      .table__head-row {
        background-color: $thead-background;
        color: $white;
      }
    }
    &__tbody {
      max-height: 180px;
      overflow-y: scroll;
      margin-bottom: 20px;
      border: 0.5px solid $cell-border;
      border-bottom: 1px solid $cell-border;
      border-top: none;
      .table__body-row {
        cursor: pointer;
        &:nth-of-type(odd) {
          .table__tbody-cell {
            background-color: $table-row-zebra-background;
          }
        }
        &:hover {
          .table__tbody-cell {
            background-color: $cell-background;
          }
        }
      }
      .steps-table-row, .rates-matrix-row {
        cursor: default;
      }

      .setting-table-body {
        max-height: 400px;
      }
      .settings-table-row{
        cursor: default;
      }
      .settings-table-cell{
        background-color: white!important;
        &:hover{
          background-color: white!important;
        }
      }
      
      .delivery_no-hover-change {
        cursor: default;
        &:hover {
          .table__tbody-cell {
            background-color: $table-row-zebra-background;
          }
        }
      }
    }
    &__thead-cell {
      box-sizing: border-box;
      font-size: 14px;
      padding: 7px 5px 5px 6px;
      border: 0.5px solid $cell-border;
      border-right: none;
      border-left: 0.5px solid $white;
      &:first-child {
        border-left: 0.5px solid $cell-border;
      }
      &:last-child {
        border-right: 0.5px solid $cell-border;
      }
    }
    &__tbody-cell {
      box-sizing: border-box;
      font-size: 14px;
      padding: 7px 5px 5px 6px;
      border: 1px solid $cell-border;
      border-right: none;
      &:last-child {
        border-right: 0.5px solid $cell-border;
      }
      &:focus-within {
        box-shadow: inset 0 0 5px $cell-border;
      }
    }
    &__head-row, &__body-row {
      display: flex;
      flex-wrap: wrap;
    }
    &__head-row {
        overflow-y: scroll;
    }
  }

  .steps-table-body {
    max-height: 320px;
  }

  .steps-table-cell {
    display: flex;
    align-items: center;
    box-sizing: border-box;
  }

  .vendors-table__body, .clients__table,
  .reports__table, .all-projects {
    max-height: 600px;
  }
  .other-all-projects{
    max-height: calc(90vh - 240px);
  }

  .reports__table {
    margin-bottom: 0;
  }

  .vendors-table_scroll-y {
    overflow-y: auto;
    padding: 0;
  }

  .matrix-table {
    max-height: 350px;
  }

  .rates-matrix-body {
    max-height: 400px;
    margin-bottom: 0;
  }

  .step-files_centered, .tasks_centered {
    display: flex;
    justify-content: center;
  }

  .project-finance_no-padding {
    padding: 0;
  }

  .tbody_visible-overflow {
    overflow: visible;
  }

  .table_no-bottom-margin {
    margin-bottom: 0;
  }

  .review-body {
    .table__body-row {
      cursor: default;
    }
  }

  .table__header {
    height: 33px;
    .table__header-row {
      height: 100%;
    }
  }
  .table__body-row-custom {
    height: 33px;
  }
  .flex-content {
    display: flex;
    align-items: center;
  }
  .request-files_table {
      max-height: 136px;
  }
  .height-700 {
      max-height: 700px;
  }
</style>
