<template lang="pug">
  .table
    .table__thead(:class="headerClass")
      .table__thead-row(:class="{'tbody_visible-overflow': (tableData.length || 1) < rowCount }")
        .table__thead-cell(v-for="field of fields" :style="{width: field.width}")
          slot(:name="field.headerKey" :field="field")
    .table__tbody(:class="[bodyClass, {'tbody_visible-overflow': (tableData.length || 1) < rowCount  }]" :style="tbodyStyle")
      .table__tbody-row(v-for="(row, index) of tableData" @click="onClick(index)")
        .table__tbody-cell(v-for="field of fields" :style="{width: field.width, padding: field.padding}")
          slot(:name="field.key" :row="row" :index="index")
    ValidationErrors(
      v-if="areErrors"
      :errors="errors"
      :isAbsolute="isAbsolute"
      @closeErrors="closeErrors"
    )
    .table__approve(v-if="isApproveModal")
      ApproveModal(
        text="Are you sure?"
        approveValue="Yes"
        notApproveValue="Cancel"
        @approve="approve"
        @notApprove="notApprove"
        @close="closeModal"
      )
</template>

<script>
	import ValidationErrors from "../ValidationErrors"
	import ApproveModal from "../ApproveModal"

	export default {
		props: {
			fields: {
				type: Array
			},
			tableData: {
				type: [Array, Object]
			},
			activeIndex: {
				type: Number
			},
			errors: {
				type: Array
			},
			areErrors: {
				type: Boolean,
				default: false
			},
			isApproveModal: {
				type: Boolean,
				default: false
			},
			bodyClass: {
				type: String
			},
			headerClass: {
				type: String
			},
			rowCount: {
				type: Number,
				default: 18
			},
      tbodyStyle: {
			  type: Object,
        default: () =>{
          return {'max-height': '600px' }
        }
      }
		},
		data() {
			return {
				isAbsolute: true
			}
		},
		methods: {
			onClick(index) {
				this.$emit("onRowClicked", { index: index })
			},
			closeErrors() {
				this.$emit("closeErrors")
			},
			approve() {
				this.$emit("approve")
			},
			notApprove() {
				this.$emit("notApprove")
			},
			closeModal() {
				this.$emit("closeModal")
			}
		},
		components: {
			ValidationErrors,
			ApproveModal
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors.scss";

  .table {
    width: 100%;
    cursor: default;

    &__thead {
      border: 1px solid $thead-background;
      border-bottom: none;

      .table__thead-row {
        background-color: $thead-background;
        color: white;
      }
    }

    &__tbody {
      overflow-y: scroll;
      margin-bottom: 20px;
      border: 1px solid $cell-border;
      border-top: none;
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

    &__thead-row,
    &__tbody-row {
      display: flex;
    }

    &__tbody-row{
      background-color: white;

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

    &__thead-row {
      overflow-y: scroll;
    }

    &_scroll-padding {
      padding-right: 15px;
    }

    &_bottom-bordered {
      border-bottom: 0.5px solid $cell-border;
    }

    &__approve {
      position: absolute;
      z-index: 50;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: transparent;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .bodyHeigth-300 {
    max-height: 300px;
    overflow-y: scroll;
    margin-bottom: 20px;
    border: 0.5px solid $cell-border;
    border-bottom: 1px solid $cell-border;
    border-top: none;
  }

  .tbody_visible-overflow {
    overflow: visible;
  }
</style>
