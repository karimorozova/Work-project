<template lang="pug">
  .drop-relative
    .drop-select(v-click-outside="outOptions" :class="[{'z-index': isDropped}, customClass]")
      .select(@click="toggleOptions")
        span.selected(v-if="selectedOption") {{ selectedOption }}
        span.selected.no-choice(v-if="!selectedOption") {{ placeholder }}
        .arrow-button
          img(src="../../assets/images/arrow_open.png" :class="{'reverse-icon': isDropped}")
      .drop(v-if="isDropped")
        .drop__item(v-for="(option, index) in options" @click="chooseOption(index)" :class="{active: activeClass(option)}")
          span {{ option }}
</template>

<script>
	import ClickOutside from "vue-click-outside"

	export default {
		props: {
			selectedOption: {
				type: String
			},
			options: {
				type: Array
			},
			customClass: {
				type: String
			},
			placeholder: {
				type: String,
				default: 'Select'
			}
		},
		data() {
			return {
				isDropped: false
			}
		},
		methods: {
			outOptions() {
				this.isDropped = false
			},
			toggleOptions() {
				this.isDropped = !this.isDropped
			},
			chooseOption(index) {
				this.$emit("chooseOption", { option: this.options[index] })
				this.outOptions()
			},
			activeClass(elem) {
				if (this.selectedOption == elem && elem != "Yes") return true
				if (elem == "Yes" && this.selectedOption &&
						this.options.indexOf(this.selectedOption) === -1) return true
				return false
			}
		},
		directives: {
			ClickOutside
		}
	}
</script>

<style lang="scss" scoped>

  .select-comp {
    width: 100%;

    &__label {
      font-size: 14px;
    }
  }

  .drop-relative {
    position: relative;
    height: 42px;
  }

  .drop-select {
    position: absolute;
    width: 100%;
    top: 0;
    border: 1px solid #c3c5c5;
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .drop {
      width: 100%;
      max-height: 188px;
      overflow-y: auto;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
      background-color: white;
      z-index: 60;

      &__item {
        align-items: center;
        padding: 6px;
        border-bottom: .5px solid #C4BEB6;
        cursor: pointer;
        font-size: 14px;
        transition: ease 0.2s;

        &:first-child {
          border-top: .5px solid #C4BEB6;
        }

        &:last-child {
          border: none;
        }

        &:hover {
          background-color: rgba(191, 176, 157, 0.5);
        }
      }

      .active {
        background-color: rgba(102, 86, 61, 0.7);
        color: #FFF;
      }

      .test-options & {
        max-height: 60px;
      }
    }
  }

  .z-index {
    z-index: 1;
  }

  .select {
    border-radius: 4px;
    width: 100%;
    display: flex;
    justify-content: space-between;
    cursor: pointer;

    .selected {
      width: 80%;
      padding: 10px;
      font-size: 14px;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      overflow: auto;
      position: relative;
    }

    .no-choice {
      opacity: 0.5;
    }

    .arrow-button {
      width: 20%;
      display: flex;
      justify-content: center;
      align-items: center;

      img {
        padding-right: 2px;
      }

      .reverse-icon {
        transform: rotate(180deg);
      }
    }
  }

  .account {
    border-radius: 4px;
    top: 0;
    box-shadow: none;
    box-sizing: border-box;

    .select {
      height: 28px;

      .selected {
        width: 82%;
        border-right: 1px solid #bfb09d;
        padding: 0 5px;
      }

      .arrow-button {
        width: 18%;
      }
    }

    .drop {
      border-top: 1px solid #bfb09d;
      max-height: 150px;
    }
  }

</style>
