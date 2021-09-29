<template lang="pug">
  .drop-select(
    v-click-outside="outOptions"
    :class="[{'z-index': isDropped, 'table-drop-menu-no-shadow': isTableDropMenuNoShadow, 'table-drop-menu': isTableDropMenu, 'disabled': isDisabled}, customClass]"
    :style="positionStyle"
  )

    .select
      .content
        span.selected(v-if="selectedOption") {{ selectedOption }}
        span.selected.no-choice(v-if="!selectedOption") {{ placeholder }}

        .remove__icon(v-if="isRemoveOption && ( Object.keys(selectedOption).length )" @click="removeOption")
          i(class="fas fa-backspace" aria-hidden='true')
      .arrow-button(@click="toggleOptions")
        i.fas.fa-caret-down(:class="{'reverse-icon': isDropped}")

    .drop(v-if="isDropped")
      //.remove-option(v-if="isRemoveOption && ( Object.keys(selectedOption).length )" @click="removeOption")
        span.remove__icon
          i.fa.fa-ban(aria-hidden='true')
          span.remove__text &nbsp; Clear Selected

      .drop__searchBlock
        input.drop__search(v-if="hasSearch" type="text" @input="(e) => search(e)" :placeholder="'🔎︎  Search'" ref="search" :disabled="isDisabled")

      .drop__item(v-for="(option, index) in filteredOptions" @click="chooseOption(index)" :class="{active: activeClass(option)}")
        span {{ showOption(option) }}


</template>

<script>
	import ClickOutside from "vue-click-outside"

	export default {
		props: {
			selectedOption: {
				type: [ String, Object ]
			},
			options: {
				type: Array
			},
			placeholder: {
				type: String
			},
			positionStyle: {
				type: Object
			},
			hasSearch: {
				type: Boolean,
				default: false
			},
			isTableDropMenu: {
				type: Boolean,
				default: false
			},
			isTableDropMenuNoShadow: {
				type: Boolean,
				default: false
			},
			customClass: {
				type: String
			},
			isRemoveOption: {
				type: Boolean,
				default: false
			},
			isDisabled: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				isDropped: false,
				searchValue: ""
			}
		},
		methods: {
			showOptions(event) {
				let elementsObj = event.composedPath()
				const classNames = [ "table__tbody-row", "table__body-row" ]
				let tr = elementsObj.find(item => {
					if (item.localName == "tr" || classNames.indexOf(item.className) !== -1) {
						return item
					}
				})
				let top = 0
				let height = 0
				if (tr) {
					top = tr.offsetTop
					height = tr.offsetHeight
				}
				this.$emit('scrollDrop', { drop: this.isDropped, offsetTop: top, offsetHeight: height })
			},
			showOption(opt) {
				return (typeof opt === "string") ? opt : opt.name
			},
			outOptions() {
				this.isDropped = false
				this.searchValue = ""
			},
			toggleOptions(event) {
				if (this.isDisabled) return
				this.isDropped = !this.isDropped
				this.searchValue = ""
				if (this.isDropped && this.hasSearch) {
					this.$nextTick(() => this.$refs.search.focus())
				}
				this.showOptions(event)
			},
			chooseOption(index) {
				this.$emit("chooseOption", { option: this.filteredOptions[index], index })
				this.outOptions()
			},
			activeClass(elem) {
				if (this.selectedOption == elem && elem != "Yes") return true
				if (elem == "Yes" && this.selectedOption &&
						this.options.indexOf(this.selectedOption) === -1) return true
				return false
			},
			search(e) {
				this.searchValue = e.target.value
			},
			removeOption() {
				this.$emit("removeOption")
				this.outOptions()
			}
		},
		computed: {
			isObject() {
				return typeof this.selectedOption === "object"
			},
			filteredOptions() {
				let result = this.options
				if (this.searchValue) {
					return result.filter(item => {
						if (item.name) {
							return item.name.toLowerCase().indexOf(this.searchValue.toLowerCase()) !== -1
						}
						return item.toLowerCase().indexOf(this.searchValue.toLowerCase()) !== -1
					})
				}
				return result
			}
		},
		directives: {
			ClickOutside
		}
	}
</script>

<style lang="scss" scoped>
  @import '../assets/scss/colors.scss';

  i {
    font-size: 20px;
    color: $border;
  }
  .content {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }
  .remove__icon i {
    color: inherit;
    font-size: inherit;
  }

  .remove__icon {
    margin: 0 7px;
    cursor: pointer;
    font-size: 16px;
    transition: .1s ease-out;
    display: flex;
    align-items: center;
    color: $dark-border;

    &:hover {
      color: $text;
    }
  }

  .drop-select {
    position: absolute;
    width: 100%;
    border: 1px solid $border;
    border-radius: 4px;
    overflow: hidden;
    flex-direction: column;
    box-sizing: border-box;

    .drop {
      max-height: 375px;
      overflow-y: auto;
      overflow-x: hidden;
      background-color: #FFF;
      border-top: 1px solid $border;
      box-sizing: border-box;
      z-index: 10;

      &__search {
        box-sizing: border-box;
        width: 94%;
        padding: 0 7px;
        outline: none;
        height: 32px;
        color: $text;
        border: 1px solid $border;
        margin: 9px 3%;
        transition: .1s ease-out;

        &:focus {
          border: 1px solid $dark-border;
        }
      }

      &__searchBlock {
        border-bottom: 1px solid $light-border;
      }

      &__item {
        padding: 7px;
        border-bottom: 1px solid $light-border;
        cursor: pointer;
        font-size: 14px;
        transition: .1s ease-out;
        display: flex;
        align-items: center;
        color: $text;

        &:last-child {
          border: none;
        }

        &:hover {
          background-color: $list-hover;
        }
      }

      .active {
        color: $border;
      }

    }

    .filters &, .project-finance__drop-menu & {
      width: 100%;
    }

    .inner-component &, .services__drop-menu & {
      border: none;
      border-radius: 0;
      height: 100%;
      overflow: visible;
    }
  }

  .z-index {
    z-index: 13;
  }

  .select {
    width: 100%;
    height: 30px;
    display: flex;
    justify-content: space-between;

    .selected {
      width: 100%;
      padding: 0 7px;
      font-size: 14px;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      overflow: auto;
      position: relative;

      .inner-component & {
        width: 83%;
      }

      .block-item__drop-menu & {
        width: 80%;
      }
    }

    .no-choice {
      opacity: 0.45;
    }

    .arrow-button {
      width: 20%;
      display: flex;
      justify-content: center;
      align-items: center;
      border-left: 1px solid $light-border;
      cursor: pointer;
      transition: .1s ease-out;

      .reverse-icon {
        transform: rotate(180deg);
      }

      .block-item__drop-menu & {
        width: 20%;
        border-left: 1px solid $light-border
      }
    }

    .no-border {
      border-left: none;
      cursor: default;
      opacity: 0;
    }

    .inner-component & {
      border: none;
      border-radius: 0;
      box-shadow: inset 0 0 8px rgba(191, 176, 157, 1);
      height: 100%;

      .selected {
        padding: 2px 5px;
      }
    }
  }
</style>
