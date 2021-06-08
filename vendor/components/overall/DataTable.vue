<template lang="pug">
  .table
    .table__thead(:class="tableheadClass")
      .table__head-row(:class="tableheadRowClass")
        .table__thead-cell(
          v-for="field of fields"
          :style="{width: field.width, ...field.style}"
          :class="headCellClass"
        )
          slot(:name="field.headerKey" :field="field")

    .table__tbody(:class="bodyClass" @scroll="handleBodyScroll")
      .table__body-row(
        v-for="(row, index) of tableData"
        @click="onClick(index)"
        :class="bodyRowClass"
      )
        .table__tbody-cell(
          v-for="field of fields"
          :style="{width: field.width, padding: field.padding}"
          :class="[bodyCellClass, field.cellClass]"
        )
          slot(:name="field.key" :row="row" :index="index")

</template>

<script>
	export default {
		props: {
			fields: {
				type: Array,
			},
			tableData: {
				type: Array,
			},
			activeIndex: {
				type: Number,
			},
			headCellClass: {
				type: String,
			},
			bodyClass: {
				type: [String, Array],
			},
			bodyRowClass: {
				type: String,
			},
			bodyCellClass: {
				type: String,
			},
			tableheadClass: {
				type: [String, Array],
			},
			tableheadRowClass: {
				type: [String, Array],
			},
		},
		methods: {
			onClick(index) {
				this.$emit("onRowClicked", { index });
			},
			handleBodyScroll(e) {
				const element = e.target;
				if (Math.ceil(element.scrollHeight - element.scrollTop) === element.clientHeight) {
					this.$emit("bottomScrolled");
				}
			},
		},
	};
</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors";

  .table {
    width: 100%;
    &__thead {
      border: 1px solid #938676;
      border-bottom: none;
      .table__head-row {
        background-color: $thead-background;
        color: $white;
      }
    }
    &__tbody {
      max-height: 192px;
      overflow-y: scroll;
      margin-bottom: 20px;
      border: 1px solid $cell-border;
      border-top: none;

      .table__body-row {
        .steps-cell{
          padding: 6px 5px 6px 5px;
        }
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
      .cursor-default,
      .steps-table-row,
      .rates-matrix-row {
        cursor: default;
      }

      .setting-table-body {
        max-height: 400px;
      }
      .settings-table-row {
        cursor: default;
      }

      .client-pricelist-table-body {
        max-height: 400px;
        border: none !important;
      }
      .client-pricelist-table-row {
        cursor: default;
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
      padding: 6px 5px 6px 5px;
      border: 1px solid $cell-border;
      border-right: none;
      border-left: 1px solid $white;
      &:first-child {
        border-left: 1px solid $cell-border;
      }
      &:last-child {
        border-right: 1px solid $cell-border;
      }
    }
    &__thead-cell-icon {
      box-sizing: border-box;
      font-size: 14px;
      padding: 6px 5px 6px 5px;
      border: 0.5px solid $cell-border;
      border-right: none;
      border-left: 0.5px solid $white;
      &:last-child {
        border-right: 0.5px solid $cell-border;
      }
    }
    &__tbody-cell {
      box-sizing: border-box;
      font-size: 14px;
      padding: 6px 5px 6px 5px;
      border-bottom: 1px solid $cell-border;
      border-left: 1px solid $cell-border;
      border-right: none;
      border-top: none;
      min-height: 32px;

      &:last-child {
        border-right: 1px solid $cell-border;
      }
      &:focus-within {
        box-shadow: inset 0 0 5px $cell-border;
      }
    }
    &__head-row,
    &__body-row {
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
    /*display: flex;*/
    /*align-items: center;*/
    /*box-sizing: border-box;*/
  }

  .vendors-table__body,
  .clients__table,
  .reports__table,
  .all-projects {
    max-height: 600px;
  }
  .other-all-projects {
    max-height: calc(90vh - 240px);
  }
  .other-project-cell{
    max-height: 120px;
    overflow-y: auto;
  }
  .vendor-table-cell{
    max-height: 120px;
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
  .candidates-vendor-table{
    max-height: 600px!important;
    overflow-y: scroll;
    margin-bottom: 20px;
    border: 0.5px solid $cell-border;
    border-bottom: 1px solid $cell-border;
    border-top: none;
  }

  .rates-matrix-body {
    max-height: 400px;
    margin-bottom: 0;
  }

  .step-files_centered,
  .tasks_centered {
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
  .height-500 {
    max-height: 500px;
  }
  .pricelist-icon-header {
    background: white;
  }
  .pricelist-icon-body {
    background-color: white !important;
    border: none;
  }
  .table__thead-cell-icon:nth-child(2) {
    border-left: 0.5px solid #938676;
  }
  .client-pricelist-table-head {
    height: auto;
  }
  .matrix-table{
    box-sizing: border-box;
    font-size: 14px;
    padding: 0 0 0 5px;
    height: 32px;
    line-height: 32px;
    border-bottom: 1px solid $cell-border;
    border-left: 1px solid $cell-border;
    border-right: none;
    border-top: none;
  }
  .padding-with-check-box{
    padding: 5px 5px 5px 6px;
    align-items: center;
    display: flex;
  }
</style>
