<template lang="pug">
  .sidebarSettings
    .sidebarSettings__mainIcon(@click="toggleSettings")
      i.fas.fa-cogs

    transition(name='slide')
      .sidebarSettings__body(v-if="isShowSettings")

        .sidebarSettings__close
          span(@click="toggleSettings")
            i.fas.fa-times

        Tabs(:tabs="tabs" :selectedTab="selectedTab" @setTab="setTab")

        .filters(v-if="selectedTab === 'Filters'")
          draggable(v-model="baseFilters" handle=".handle")
            .draggable__element( v-for="element in baseFilters" :key="element.id" :class="{'opacity05': !element.isCheck}")
              .draggable__element-title
                CheckBox(:isChecked="!!element.isCheck" @check="baseFiltersCheck(element.id, true)" @uncheck="baseFiltersCheck(element.id, false)")
                span {{element.name}}
              .draggable__element-icon
                i.fas.fa-arrows-alt-v.handle

        .fields(v-else)
          draggable(v-model="baseFields" handle=".handle")
            .draggable__element( v-for="element in baseFields" :key="element.id" :class="{'opacity05': !element.isCheck}")
              .draggable__element-title
                CheckBox(:isChecked="!!element.isCheck" @check="baseFieldsCheck(element.id, true)" @uncheck="baseFieldsCheck(element.id, false)")
                span {{element.name}}
              .draggable__element-icon
                i.fas.fa-arrows-alt-v.handle

        .sidebarSettings__button
          Button(value="Update Filters & Fields" @clicked="send")
</template>

<script>
	import Tabs from "../../Tabs"
	import draggable from 'vuedraggable'
	import CheckBox from "../../CheckBox"
	import Button from "../../Button"

	export default {
		name: "ProjectSettingsSidebar",
		components: { Button, CheckBox, Tabs, draggable },
		props: {
			filters: {
				type: Array,
				default: [],
				require: true
			},
			fields: {
				type: Array,
				default: [],
				require: true
			},
			userInfo: {
				type: Object,
				default: [],
				require: true
			}
		},
		data() {
			return {
				baseFilters: this.filters.map(item => {
					if (this.userInfo.filters.includes(item.id)) item.isCheck = true
					return item
				}),
				baseFields: this.fields.map(item => {
					if (this.userInfo.fields.includes(item.id)) item.isCheck = true
					return item
				}),
				isShowSettings: false,
				tabs: [ 'Filters', 'Fields' ],
				selectedTab: 'Filters'
			}
		},
		methods: {
			toggleSettings() {
				this.isShowSettings = !this.isShowSettings
			},
			setTab({ index }) {
				this.isGeneral = index === 0
				this.selectedTab = this.tabs[index]
			},
			send() {
				this.$emit('updateFiltersAndFields', {
					filters: this.baseFilters.filter(({ isCheck }) => isCheck).map(({ id }) => id),
					fields: this.baseFields.filter(({ isCheck }) => isCheck).map(({ id }) => id)
				})
			},
			baseFiltersCheck(checkedId, bool) {
				const checkFilter = this.baseFilters.find(({ id }) => checkedId === id)
				checkFilter.isCheck = bool
			},
			baseFieldsCheck(checkedId, bool) {
				const checkField = this.baseFields.find(({ id }) => checkedId === id)
				checkField.isCheck = bool
			}
		}
	}
</script>

<style scoped lang="scss">
  @import "../../../assets/scss/colors";

  .sortable-ghost {
  }

  .sortable-chosen {
    background: $light-border;
  }

  .filters,
  .fields {
    max-height: 76vh;
    overflow: auto;
  }

  .fa-cogs {
    color: $dark-border;
  }

  i {
    height: 20px;
    width: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .fa-times {
    font-size: 16px;
    transition: .2s ease-out;
    color: $dark-border;
    cursor: pointer;

    &:hover {
      color: $text;
    }
  }

  .sidebarSettings {
    &__button {
      display: flex;
      justify-content: center;
      margin: 20px 0;
    }

    &__close {
      display: flex;
      justify-content: flex-end;
      margin: 12px 0 10px 0;
    }

    &__body {
      position: fixed;
      top: 0;
      right: 0;
      height: 100vh;
      background-color: white;
      padding: 50px 20px 20px 20px;
      background: white;
      z-index: 25;
      box-shadow: $box-shadow;
    }

    &__mainIcon {
      position: absolute;
      right: 10px;
      top: 10px;
      background: #fff;
      border: 1px solid $border;
      border-radius: 2px;
      cursor: pointer;
      padding: 5px;
      transition: .2s ease-out;
      z-index: 20;

      &:hover {
        .fa-cogs {
          color: $text;
        }
      }
    }

    .draggable__element {
      display: flex;
      padding: 9px;
      border: 1px solid $border;
      margin-bottom: 4px;
      border-radius: 2px;
      justify-content: space-between;
      align-items: center;

      &:first-child {
        border-top-left-radius: unset;
        border-top-right-radius: unset;
      }

      &-icon {
        font-size: 16px;
        color: $dark-border;
        cursor: grab;
      }

      &-title {
        display: flex;
        gap: 5px;
        align-items: center;
      }
    }
  }

  .opacity05 {
    opacity: 0.5;
  }

  .slide-enter-active,
  .slide-leave-active {
    transition: 0.2s;
    transition-timing-function: ease-out;
  }

  .slide-enter,
  .slide-leave-to {
    transform: translateX(100%);
    transition: 0.15s;
    transition-timing-function: ease-in;
  }

  .slide-bottom-enter-active,
  .slide-bottom-leave-active {
    transition: 0.2s;
    transition-timing-function: ease-out;
  }

  .slide-bottom-enter,
  .slide-bottom-leave-to {
    transform: translateY(100%);
    transition: 0.15s;
    transition-timing-function: ease-in;
  }
</style>