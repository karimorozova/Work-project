<template lang="pug">
  .drop-select(
    v-click-outside="outOptions"
    :class="[{'z-index': isDropped, 'table-drop-menu': isTableDropMenu, 'disableOverFlow': isSelectedWithIcon}, customClass]"
  )
    .select

      .selectedWithIcon(v-if="selectedOptions.length && isSelectedWithIcon")
        span {{ selectedOptions.length }} Selected...
        .controlOptions
          .tooltip
            .tooltipData(v-html="selectedOptions.join('<br>')")
            i.fas.fa-info-circle
          .remove__icon(v-if="isRemoveOption && selectedOptions.length" @click="removeOption")
            i(class="fas fa-backspace" aria-hidden='true')

      .selected(v-if="selectedOptions.length && !isSelectedWithIcon") {{ selectedOptions.join(', ') }}

      span.selected.no-choice(v-if="!selectedOptions.length") {{ placeholder }}

      .arrow-button(@click="toggleOptions")
        i.fas.fa-caret-down(:class="{'reverse-icon': isDropped}")

    .drop(v-if="isDropped")
      //.remove-option(v-if="isRemoveOption && selectedOptions.length" @click="removeOption")
        span.remove__icon
          i.fa.fa-ban(aria-hidden='true')
          span.remove__text &nbsp; Clear Selected

      .drop__buttonRow(v-if="allOptionsButtons")
        .buttonRow__button(@click="setOrUnsetAllOptions('set')")
          i.fa.fa-check-square-o(aria-hidden='true')
          span Select All
        .buttonRow__button(@click="setOrUnsetAllOptions('unset')")
          i.fa.fa-square-o(aria-hidden='true')
          span Clear All

      .drop__searchBlock
        input.drop__search(v-if="hasSearch" type="text" @input="(e) => search(e)" :placeholder="'🔎︎  Search'" ref="search")

      .drop__item(v-for="(option, index) in filteredOptions" @click="chooseOptions(index)")
        .checkbox
          .checkbox__check(:class="{checked: activeClass(option)}")
        span {{ showOption(option) }}

</template>

<script>
	import ClickOutside from "vue-click-outside"

	export default {
		props: {
			customClass: {
				type: String
			},
			isTableDropMenu: {
				type: Boolean,
				default: false
			},
			selectedOptions: {
				type: Array
			},
			options: {
				type: Array
			},
			hasSearch: {
				type: Boolean,
				default: false
			},
			placeholder: {
				type: String,
				default: ""
			},
			allOptionsButtons: {
				type: Boolean,
				default: false
			},
			isSelectedWithIcon: {
				type: Boolean,
				default: false
			},
			isRemoveOption: {
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
			removeOption() {
				this.$emit("removeOption")
				this.outOptions()
			},
			showOption(opt) {
				return (typeof opt === "string") ? opt : opt.name
			},
			outOptions() {
				this.isDropped = false
				this.searchValue = ""
			},
			searchFocus() {
				this.$nextTick(() => this.$refs.search.focus())
			},
			toggleOptions() {
				this.isDropped = !this.isDropped
				this.searchValue = ""
				if (this.isDropped && this.hasSearch) {
					this.searchFocus()
				}
			},
			chooseOptions(index) {
				this.$emit("chooseOptions", { option: this.filteredOptions[index] })
				// this.searchFocus();
			},
			activeClass(elem) {
				return (this.selectedOptions.indexOf(elem) !== -1 ||
						this.selectedOptions.indexOf(elem.name) !== -1)
			},
			search(e) {
				this.searchValue = e.target.value
			},
			setOrUnsetAllOptions(key) {
				switch (key) {
					case "set":
						const arrayForSet = this.filteredOptions.filter((a) => !this.selectedOptions.includes(a))
						for (let index = 0; index < arrayForSet.length; index++) {
							this.$emit("chooseOptions", { option: arrayForSet[index] })
						}
						break
					case "unset":
						for (let index = 0; index < this.selectedOptions.length; index++) {
							this.$emit("chooseOptions", { option: this.selectedOptions[index] })
						}
						break
				}
			}
		},
		computed: {
			filteredOptions() {
				let result = this.options
				if (this.searchValue) {
					return result.filter(item => item.toLowerCase().indexOf(this.searchValue.toLowerCase()) !== -1)
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

  .disableOverFlow {
    overflow: unset !important;
  }

  .controlOptions {
    display: flex;
    align-items: center;
  }

  .remove__icon i {
    color: inherit;
    font-size: inherit;
  }

  .remove__icon {
    margin-left: 7px;
    cursor: pointer;
    font-size: 16px;
    transition: .1s ease-out;
    display: flex;
    color: $dark-border;

    &:hover {
      color: $text;
    }
  }

  .selectedWithIcon {
    width: 80%;
    padding: 3px 7px;
    font-size: 14px;
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .fa-info-circle {
    font-size: 16px;
    cursor: help;
    transition: .2s ease-out;
    color: $dark-border;

    &:hover {
      color: $text;
    }
  }

  i {
    font-size: 20px;
    color: $border;
  }

  .fa-check-square-o,
  .fa-square-o {
    padding-right: 5px;
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

      &__item {
        padding: 0 7px;
        height: 31px;
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

      &__buttonRow {
        height: 32px;
        display: flex;

        .buttonRow {
          &__button {
            width: 50%;
            background: $table-list;
            color: $text;
            cursor: pointer;
            font-size: 12px;
            font-family: 'Myriad600';
            display: flex;
            justify-content: center;
            align-items: center;
            border-bottom: 1px solid $border;
            transition: .1s ease-out;

            &:hover {
              background-color: $table-list-hover;
            }
          }
        }

        .buttonRow__button:last-child {
          border-left: 1px solid $border;
        }
      }

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

      .domain__options & {
        max-height: 170px;
      }

      .project & {
        max-height: 180px;
      }

      .project-info__tasks & {
        max-height: 170px;
      }

      .filters & {
        max-height: 200px;
      }
    }

    .filters & {
      width: 100%;
    }
  }

  .z-index {
    z-index: 13;
  }

  .select {
    border-radius: 4px;
    width: 100%;
    height: 30px;
    display: flex;
    justify-content: space-between;

    .selected {
      width: 100%;
      padding: 3px 7px;
      font-size: 14px;
      max-height: 40px;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      overflow: auto;
      position: relative;

      .filters & {
        width: 76%;
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

      .filters & {
        width: 24%;
      }

      .rates-filters__item & {
        width: 20%;
      }
    }

    .rates-filters__item & {
      height: 32px;
    }
  }

  .checkbox {
    min-width: 14px;
    height: 14px;
    border: 1px solid $text;
    margin-right: 6px;

    .checked {
      width: 100%;
      height: 100%;
      position: relative;

      &::after {
        content: "";
        position: absolute;
        display: inline-block;
        height: 5px;
        width: 8px;
        border-left: 2px solid;
        border-bottom: 2px solid;
        left: 2px;
        top: 2px;
        transform: rotate(-45deg);
      }
    }
  }


  .tooltip {
    position: relative;
    display: flex;

    .tooltipData {
      visibility: hidden;
      font-size: 14px;
      width: max-content;
      background: white;
      border-radius: 4px;
      right: 25px;
      padding: 7px 7px 5px 7px;
      position: absolute;
      z-index: 555;
      opacity: 0;
      transition: opacity .3s;
      border: 1px solid $text;

      &::after {
        content: "";
        position: absolute;
        top: 2px;
        right: -12px;
        transform: rotate(270deg);
        border-width: 6px;
        border-style: solid;
        border-color: $text transparent transparent;
      }
    }

    &:hover {
      .tooltipData {
        visibility: visible;
        opacity: 1;
      }
    }
  }

</style>
