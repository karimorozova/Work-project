<template lang="pug">
  .drop-select(v-click-outside="outClick" :class="customClass")
    .select
      template(v-if="selectedPerson")
        span.selected {{ selectedPerson }}
      template(v-if="!selectedPerson")
        span.selected.no-select Select Vendor
      .arrow-button(@click="togglePersons")
        i.fas.fa-caret-down(:class="{'reverse-icon': isDropped}")
    .drop(v-if="isDropped")
      .drop__item(v-for="(person, index) in extendedPersons" @click="setPerson(index)" :class="{chosen: selectedPerson === getPersonFullName(person)}")
        span(v-if="person.firstName") {{ person.firstName }} {{ person.surname }}
        span.drop__last-item(v-if="person === 'Show all' || person === 'Hide all'") {{ person }}
      .drop__item.remove(v-if="selectedPerson" @click="removeVendorFromStep")
        span.remove__icon
          i.fa.fa-ban(aria-hidden='true')
        span.remove__text Remove Vendor

</template>

<script>
	import ClickOutside from "vue-click-outside"

	export default {
		props: {
			selectedPerson: {
				type: String
			},
			persons: {
				type: Array
			},
			isExtended: {
				type: Boolean
			},
			isAdditionalShow: {
				type: Boolean,
				default: false
			},
			index: {
				type: Number
			},
			customClass: {
				type: String
			}
		},
		data() {
			return {
				isDropped: false,
				errors: []
			}
		},
		methods: {
			removeVendorFromStep() {
				this.$emit('removeVendorFromStep')
			},
			togglePersons(event) {
				let elementsObj = event.composedPath()
				let tr = elementsObj.find(item => {
					if (item.localName == "tr" || (item.className && item.className.indexOf("table__body-row") !== -1)) {
						return item
					}
				})
				let top = 0
				let height = 0
				if (tr) {
					top = tr.offsetTop
					height = tr.offsetHeight
				}
				this.isDropped = !this.isDropped
				this.$emit('scrollDrop', { drop: this.isDropped, offsetTop: top, offsetHeight: height })
			},
			outClick() {
				this.isDropped = false
			},
			getPersonFullName(person) {
				return person.firstName + ' ' + person.surname
			},
			setPerson(index) {
				if (this.extendedPersons[index] === "Show all") {
					return this.$emit('togglePersonsData', { isAll: true })
				}
				if (this.extendedPersons[index] === "Hide all") {
					return this.$emit('togglePersonsData', { isAll: false })
				}
				this.isDropped = false
				this.$emit('setPerson', { person: this.extendedPersons[index] })
			}
		},
		directives: {
			ClickOutside
		},
		computed: {
			extendedPersons() {
				let result = [ ...this.persons ]
				if (this.isAdditionalShow) {
					this.isExtended ? result.push("Hide all") : result.push("Show all")
				}
				return result
			}
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors.scss";

  .remove {
    display: flex;
    justify-content: flex-start;

    &__icon {
      margin-right: 5px;
      color: $orange;
    }

    &__text {
      color: $orange;
    }
  }

  .select {
    width: 100%;
    height: 30px;
    display: flex;
    justify-content: space-between;
    overflow: hidden;

    .selected {
      width: 100%;
      padding: 0 7px;
      font-size: 14px;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      overflow: auto;
      position: relative;

      .steps__vendor-menu & {
        padding-top: 3px;
      }
    }

    .steps__vendor-menu & {
      border: none;
      border-radius: 0;
      height: 32px;
    }

    .no-select {
      opacity: 0.5;
    }

    .arrow-button {
      width: 20%;
      display: flex;
      justify-content: center;
      align-items: center;
      border-left: 1px solid $light-border;
      cursor: pointer;
      color: $border;

      img {
        padding-right: 2px;
      }

      .reverse-icon {
        transform: rotate(180deg);
      }
    }
  }

  .drop-select {
    position: absolute;
    width: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    border-radius: 4px;
    border: 1px solid $border;


    .drop {
      max-height: 320px;
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

      .chosen {
        color: $border;
      }

      &__last-item {
        font-style: italic;
      }
    }
  }

</style>
