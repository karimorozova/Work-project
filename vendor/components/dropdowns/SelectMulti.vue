<template lang="pug">
  .drop__wrapper
    .drop-select(v-click-outside="outOptions" :class="customClass")
      .select(@click="toggleOptions")
        span.selected(v-if="selectedOptions.length") {{ selectedOptions.join('; ') }}
        span.selected.no-choice(v-if="!selectedOptions.length") Select
        .arrow-button
          img(src="../../assets/images/arrow_open.png" :class="{'reverse-icon': isDropped}")
      .drop(v-if="isDropped")
        .drop__item(v-for="(option, index) in options" @click="chooseOptions(index)")
          .checkbox
            .checkbox__check(:class="{checked: activeClass(option)}")
          span {{ option }}
</template>

<script>
	import ClickOutside from "vue-click-outside"

	export default {
		props: {
			selectedOptions: {
				type: Array
			},
			options: {
				type: Array
			},
			otherChoice: {
				type: String,
				default: ""
			},
			otherDtpChoice: {
				type: String,
				default: ""
			},
			otherSoftwareChoice: {
				type: String,
				default: ""
			},
			customClass: {
				type: String
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
			chooseOptions(index) {
				this.$emit("chooseOptions", { option: this.options[index] })
			},
			activeClass(elem) {
				return (this.selectedOptions.indexOf(elem) != -1 ||
						this.otherChoice.indexOf(elem) != -1 ||
						this.otherDtpChoice.indexOf(elem) != -1 ||
						this.otherSoftwareChoice.indexOf(elem) != -1)
			}
		},
		directives: {
			ClickOutside
		}
	}
</script>

<style lang="scss" scoped>
  .drop__wrapper {
    position: relative;
    height: 42px;
  }

  .drop-select {
    position: absolute;
    width: 100%;
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
      flex-direction: column;
      background-color: white;
      z-index: 60;

      &__item {
        display: flex;
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

      .domain__options & {
        max-height: 170px;
      }
    }
  }

  .select {
    border-radius: 4px;
    width: 100%;
    height: 36px;
    display: flex;
    justify-content: space-between;
    cursor: pointer;

    .selected {
      width: 80%;
      padding: 3px 10px;
      font-size: 14px;
      max-height: 36px;
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

  .checkbox {
    width: 14px;
    height: 14px;
    border: 1px solid #67573E;
    margin-right: 5px;

    .checked {
      width: 100%;
      height: 100%;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        width: 6px;
        border: 1px solid #67573E;
        top: 7px;
        left: 1px;
        -webkit-transform: rotate(45deg);
        transform: rotate(45deg);
      }

      &::after {
        content: '';
        position: absolute;
        width: 7px;
        border: 1px solid #67573E;
        top: 5px;
        left: 5px;
        -webkit-transform: rotate(-58deg);
        transform: rotate(-58deg);
      }
    }
  }

  .filters {
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

      &__item {
        .checkbox {
          margin-left: 0;
        }
      }
    }
  }

</style>
