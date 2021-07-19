<template lang="pug">
  .layoutTable

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
        .hideScrollBlock(v-if="tableData.length >= elementToScroll")

        tr(:class="{'scroll': tableData.length >= elementToScroll}")

          th(v-for="{ headerKey, style, sortInfo, dataKey, key, filterInfo, ...rest } in fields" :style="style")

            .th__titleAndSort
              slot(:name="headerKey" :field="{ headerKey, sortInfo, style, dataKey, key, filterInfo, ...rest }")

              .th__sortIcons(v-if="sortInfo && sortInfo.isSort")

                i.fas.fa-times-circle(v-if="sortInfo.order === 'asc' || sortInfo.order === 'desc'" @click.stop="removeSortKey({sortInfo, key: dataKey, sortField: key, order: 'asc'})")
                span(v-if="sortInfo.order === 'asc' || sortInfo.order === 'desc'")
                  i.fas.fa-caret-down(v-if="sortInfo.order === 'asc'" @click.stop="changeSortKey({sortInfo, key: dataKey, sortField: key, order: 'desc'})")
                  i.fas.fa-caret-up(v-else-if="sortInfo.order === 'desc'" @click.stop="changeSortKey({sortInfo, key: dataKey, sortField: key, order: 'asc'})")
                i.fas.fa-sort(v-else @click.stop="addSortKey({sortInfo, key: dataKey, sortField: key, order: 'asc'})")

            //.th__filter(v-if="filterInfo && filterInfo.isFilter && showFilters")
              // input(:ref='key' @keyup="(e) => setFilter({filterInfo, value: e.target.value, key: dataKey, filterField: key})")
              // i.fas.fa-backspace.th__filter-close(v-if="filterInfo.isFilterSet" @click.stop="removeFilter({ filterInfo, filterField: key})")

      tbody(:class="[{'scroll': tableData.length >= elementToScroll},{'shortBody': isBodyShort}]" @scroll="bottomScrolled")
        tr(v-for="(row, index) of tableData")
          td(v-for="field of fields" :style="field.style")
            slot(:name="field.key" :row="row" :index="index" )

</template>

<script>
	import ApproveModal from './ApproveModal'

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
			}
		},
		data() {
			return {
				elementToScroll: 15
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

			// showFilter() {
			//   this.showFilters = !this.showFilters
			//   if (!this.showFilters) {
			//     this.$emit('clearAllFilters')
			//   }
			// },
			// setFilter(field) {
			// 	this.$emit('setFilter', field)
			// },
			// removeFilter(field) {
			// 	this.$refs[field.filterField][0].value = ''
			// 	this.$emit('removeFilter', field)
			// },
			bottomScrolled(e) {
				const element = e.target
				if (Math.ceil(element.scrollHeight - element.scrollTop) === element.clientHeight) {
					this.$emit("bottomScrolled")
				}
			}
		},
		components: {
			ApproveModal
		}
	}
</script>

<style lang="scss" scoped>
  @import "../assets/scss/colors";

  .layoutTable {
    overflow-x: auto;
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
    font-size: 18px;
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
      height: 40px;
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
    height: 40px;
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
    font-family: 'Myriad600';
  }

  tbody {
    max-height: 600px;
    display: block;
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
    height: 40px;
    width: 20px;
    background: white;
    position: absolute;
    right: 1px;
    z-index: 1;
  }

  .scroll {
    overflow-y: scroll;
  }
</style>