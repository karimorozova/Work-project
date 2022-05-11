<template lang="pug">
  .layoutWrapper(v-if="user._id")

    .layoutWrapper__icons
      IconButton(v-if="hasFilterButton" @clicked="toggleFilter")
        i(class="fa-solid fa-sliders")
      IconButton(v-if="hasSettingButton" @clicked="toggleSettings")
        i(class="fas fa-cogs")
      slot(name="icons")

    .layoutWrapper__summary
      .summary(v-if="summary.length")
        .summary__item(v-for="item in summary")
          .summary__item-icon
            span(v-if="item.summaryEnum === 'sorting'")
              i.fa-solid.fa-arrow-up-wide-short
            span(v-if="item.summaryEnum === 'filters'")
              i.fa-solid.fa-magnifying-glass
          .summary__item-name {{ item.name }}
          .summary__item-close(@click="clearSummaryItem(item.id)")
            Close.close__summary

      .options(v-if="summary.length")
        .options__item(@click="clearSummaryByOption('filters')") Clear Filters
        .options__item(@click="clearSummaryByOption('sorting')") Clear Sorting
        .options__item(@click="clearSummaryByOption(null)") Clear Filters / Sorting
        .options__item(@click="togglePresetModal") Save As Preset

    .layoutWrapper__presets
      .presets
        .presets__items Default View
        .presets__items(
          v-if="layoutSettings.presets.filter(({ isCheck }) => isCheck).length"
          v-for="item in layoutSettings.presets.filter(({ isCheck }) => isCheck)"
        ) {{ item.id }}
          //@click="applyPreset(item.id)"
        IconButton(popupText="Add new from copy" @clicked="toggleModalSelect")
          i(class="fa-solid fa-plus")

    .layoutWrapper__table
      slot(
        name="table"
        :tableFields="layoutSettings.fields.filter(({ isCheck }) => isCheck)"
        :tableSorting="layoutSettings.sorting.filter(({ isCheck }) => isCheck)"
        :tableMaxHeight="tableMaxHeight"
      )

    transition(name='top')
      .layoutWrapper__filter(v-if="isFilter")
        .layoutWrapper__filter-body
          Close.close__modal(@clicked="toggleFilter(makeDBRequest)")
          slot(
            name="filter"
            :tableFilters="layoutSettings.filters.filter(({ isCheck }) => isCheck)"
          )

        .layoutWrapper__filter-buttons
          Button(value="Search" @clicked="toggleFilter(makeDBRequest)")

    transition(name='slide')
      .layoutWrapper__setting(v-if="isSettings")
        .setting
          .setting__close
            Close.close__modal(@clicked="toggleSettings")
          .setting__tabs(v-if="tabs.length")
            .tab
              .tab__head
                .tab__head-title {{ selectedTab[0].toUpperCase() + selectedTab.slice(1) }}
                .tab__head-count(v-if="tabs.length > 1") {{ tabs.findIndex(i => i === selectedTab) + 1 }} of {{ tabs.length }}

              .tab__icons(v-if="tabs.length > 1")
                .tab__icon(@click="setTab(selectedTab, 'left')")
                  i(class="fa-solid fa-chevron-left")
                .tab__icon(@click="setTab(selectedTab, 'right')")
                  i(class="fa-solid fa-chevron-right")

          .setting__body(v-if="selectedTab === 'fields'")
            span(v-if="!layoutSettings.fields.length") Setting not available...
            draggable(handle=".handle" v-model="layoutSettings.fields")
              .setting__draggable(v-for="item in layoutSettings.fields")
                .setting__draggable-titleAndOption
                  CheckBox(
                    :isChecked="!!item.isCheck"
                    @check="checker('fields', item.id, true)"
                    @uncheck="checker('fields', item.id, false)"
                  )
                  span(:class="{'opacity04': !item.isCheck}") {{item.name}}
                .setting__draggable-icon.handle(v-if="item.isCheck")
                  i.fas.fa-arrows-alt-v

          .setting__body(v-if="selectedTab === 'filters'")
            span(v-if="!layoutSettings.filters.length") Setting not available...
            draggable(handle=".handle" v-model="layoutSettings.filters")
              .setting__draggable(v-for="item in layoutSettings.filters")
                .setting__draggable-titleAndOption
                  CheckBox(
                    :isChecked="!!item.isCheck"
                    @check="checker('filters', item.id, true)"
                    @uncheck="checker('filters', item.id, false)"
                  )
                  span(:class="{'opacity04': !item.isCheck}") {{item.name}}
                .setting__draggable-icon.handle(v-if="item.isCheck")
                  i.fas.fa-arrows-alt-v

          .setting__body(v-if="selectedTab === 'sorting'")
            span(v-if="!layoutSettings.sorting.length") Setting not available...
            .setting__draggable(v-for="item in layoutSettings.sorting")
              .setting__draggable-titleAndOption
                CheckBox(
                  :isChecked="!!item.isCheck"
                  @check="checker('sorting', item.id, true)"
                  @uncheck="checker('sorting', item.id, false)"
                )
                span(:class="{'opacity04': !item.isCheck}") {{item.name}}

          .setting__body(v-if="selectedTab === 'presets'")
            span(v-if="!layoutSettings.presets.length") Setting not available...
            draggable(handle=".handle" v-model="layoutSettings.presets")
              .setting__draggable(v-for="(item, index) in layoutSettings.presets")
                .setting__draggable-titleAndOption
                  CheckBox(
                    :isChecked="!!item.isCheck"
                    @check="checker('presets', item.id, true)"
                    @uncheck="checker('presets', item.id, false)"
                  )
                  span(:class="{'opacity04': !item.isCheck}") {{ item.id }}

                .setting__draggable-icons
                  IconButton(@clicked="editPreset(index)")
                    i(class="fa-solid fa-pencil")
                  IconButton(@clicked="removePreset(index)")
                    i(class="fa-solid fa-ban")
                  .setting__draggable-icon.handle
                    i.fas.fa-arrows-alt-v

          .setting__button
            Button(value="Approve" @clicked="saveSettingChanges")

    transition(name='top')
      .layoutWrapper__modal(v-if="isPresetModalSelect")
        .layoutWrapper__modal-body
          Close.close__modal(@clicked="toggleModalSelect")
          .layoutWrapper__modal-preset
            .layoutWrapper__modal-preset-name Preset Name:
            .layoutWrapper__modal-preset-input
              input(placeholder="Value" v-model="presetModalId")
            .layoutWrapper__modal-preset-name Copy From:
            .layoutWrapper__modal-preset-input
              SelectSingle(
                placeholder="Option"
                :selectedOption="presetModalSelected"
                :options="['Default View', ...layoutSettings.presets.filter(i => i.isCheck).map(i => i.id)]"
                @chooseOption="({option}) => this.presetModalSelected = option"
              )
        .layoutWrapper__modal-buttons
          Button(value="Submit" :isDisabled="!presetModalSelected || !presetModalId" @clicked="saveNewPresetFromCopy" )
          //Button(value="Submit" :isDisabled="!presetId || presetIdChecker" @clicked="savePreset")

      //.layoutWrapper__modal(v-if="isPresetModal")
      //  .layoutWrapper__modal-body
      //    Close.close__modal(@clicked="togglePresetModal")
      //    .layoutWrapper__modal-preset
      //      .layoutWrapper__modal-preset-name Preset Name:
      //      .layoutWrapper__modal-preset-input
      //        input(placeholder="Value" v-model="presetId")
      //  .layoutWrapper__modal-buttons
      //    Button(value="Submit" :isDisabled="!presetId || presetIdChecker" @clicked="savePreset")
</template>

<script>
import IconButton from "../IconButton"
import Button from "../Button"
import Close from "../Close"
import { mapActions, mapGetters } from "vuex"
import draggable from 'vuedraggable'
import CheckBox from "../CheckBox"
import LayoutWrapperMixin from "../../mixins/LayoutWrapperMixin"
import SelectSingle from "../SelectSingle"


export default {
  name: "LayoutWrapper",
  props: {
    hasFilterButton: {
      type: Boolean,
      default: false
    },
    hasSettingButton: {
      type: Boolean,
      default: false
    },
    moduleType: {
      type: String,
      required: true
    }
  },
  mixins: [ LayoutWrapperMixin ],
  data() {
    return {
      tableMaxHeight: 0,
      isFilter: false,
      isSettings: false,

      isPresetModalSelect: false,
      presetModalSelected: '',
      presetModalId: '',

      // isPresetModal: false,

      // presetIdIndex: null,
      // currentPreset:

      tabs: [],
      selectedTab: '',
      layoutSettings: {
        filters: [],
        fields: [],
        sorting: [],
        presets: []
      }
    }
  },
  methods: {
    ...mapActions([ 'alertToggle', "setUser" ]),
    makeDBRequest() {
      this.$emit('makeDBRequest')
    },
    toggleFilter(callback) {
      this.isFilter = !this.isFilter
      this.isPresetModal = false
      if (callback) return callback()
    },
    toggleSettings() {
      if (this.isSettings) this.updatedSettingByUserData()
      this.isSettings = !this.isSettings
    },
    clearSummaryItem(id) {
      this.removeQuery(id)
      this.makeDBRequest()
    },
    async clearSummaryByOption(option) {
      let { query } = this.$route
      const queryArr = Object.keys(query)
      const newQuery = {}

      const checker = () => {
        if (!option) return null
        const keyPrefixes = queryArr.map(key => key.split('_').at(0))
        return !keyPrefixes.some(prefix => option === 'filters' ? prefix === 'f' : prefix === 'sf')
      }
      const replacer = async (query) => {
        await this.$router.replace({ path: this.$route.path, query })
      }
      const cleaner = (item) => {
        const [ prefix ] = item.split('_')
        return option === 'filters' ? prefix === 'sf' : prefix === 'f'
      }
      const executor = async (query) => {
        await replacer(query)
        this.makeDBRequest()
        this.calculateTableMaxHeight()
      }

      if (checker()) return
      if (!option) return executor(null)

      for (const key of queryArr.filter(cleaner)) if (query[key]) newQuery[key] = query[key]
      await executor(newQuery)
    },
    // togglePresetModal() {
    //   if (this.isPresetModal) {
    //     this.presetId = ''
    //     this.isEditPresetId = null
    //   }
    //   this.isPresetModal = !this.isPresetModal
    //   this.isFilter = false
    // },
    // removePreset(index) {
    //   const copy = [ ...this.layoutSettings.presets ]
    //   copy.splice(index, 1)
    //   this.layoutSettings.presets = copy
    // },
    // editPreset(index) {
    //   const { id } = this.layoutSettings.presets.at(index)
    //   this.presetId = id
    //   this.presetIdIndex = index
    //   this.togglePresetModal()
    // },
    setTab(selectedTab, option) {
      const _idx = this.tabs.findIndex(i => i === selectedTab)
      const lastIndex = this.tabs.length - 1

      switch (true) {
        case _idx === 0 && option === 'left':
          this.selectedTab = this.tabs[lastIndex]
          break
        case _idx === lastIndex && option === 'right':
          this.selectedTab = this.tabs[0]
          break
        default:
          const index = option === 'right' ? _idx + 1 : _idx - 1
          this.selectedTab = this.tabs[index]
      }
    },
    checker(prop, id, bool) {
      const checked = this.layoutSettings[prop].find(i => i.id === id)
      checked.isCheck = bool
    },
    // async savePreset() {
    //   const updater = async () => {
    //     await this.saveSettingChanges()
    //     this.togglePresetModal()
    //   }
    //   if (this.presetIdIndex) {
    //     this.layoutSettings.presets[this.presetIdIndex].id = this.presetId
    //     await updater()
    //     return
    //   }

    //   await updater()
    // },
    // async applyPreset(id) {
    //   const { presets } = this.layoutSettings
    //   const { preset, snapshot: { fields, filters, sorting } } = presets.find(i => i.id === id)
    //   await this.$router.replace({ path: this.$route.path + preset })
    //   this.setLayoutSettingsDefault()
    //   this.dataParser(fields, 'fields')
    //   this.dataParser(filters, 'filters')
    //   this.dataParser(sorting, 'sorting')
    //   this.layoutSettings = {
    //     ...this.layoutSettings,
    //     presets
    //   }
    //   this.makeDBRequest()
    // },
    async saveSettingChanges() {

      const dataGenerator = () => {
        const value = {}
        for (const key of [ 'filters', 'fields', 'sorting' ]) value[key] = this.layoutSettings[key].filter(({ isCheck }) => isCheck).map(({ id }) => id)
        value['presets'] = this.layoutSettings['presets']
        return value
      }
      try {
        await this.$http.post('/layouts-api/update-user-layouts-setting', {
          userId: this.user._id,
          prop: this.moduleType,
          value: dataGenerator()
        })
        await this.setUser()
        this.updatedSettingByUserData()
        this.alertToggle({ message: 'Setting saved!', isShow: true, type: "success" })
      } catch (e) {
        this.alertToggle({ message: e.data, isShow: true, type: "error" })
      } finally {
        this.isSettings = false
      }
    },
    setLayoutSettingsDefault() {
      this.layoutSettings = { filters: [], fields: [], sorting: [], presets: [] }
    },
    dataParser(userIds, prop) {
      const list = this.layoutsPossibleSettings[this.moduleType][prop]
      if (!userIds.length) {
        this.layoutSettings[prop] = [ ...list ]
        return
      }
      userIds.forEach(id => {
        const _idx = list.findIndex(i => i.id === id)
        if (_idx !== -1) this.layoutSettings[prop].push({ ...list[_idx], isCheck: true })
      })
      this.layoutSettings[prop].push(
          ...list.filter(i => !this.layoutSettings[prop].map(i => i.id).includes(i.id))
      )
    },
    updatedSettingByUserData() {
      this.tabs = []
      this.setLayoutSettingsDefault()
      const { layoutsSettings: { [this.moduleType]: { fields = [], filters = [], sorting = [], presets = [] } } } = this.user
      this.dataParser(fields, 'fields')
      this.dataParser(filters, 'filters')
      this.dataParser(sorting, 'sorting')
      this.layoutSettings.presets = presets

      for (let prop of [ 'fields', 'filters', 'sorting', 'presets' ]) if (this.layoutSettings[prop].length) this.tabs.push(prop)
      this.selectedTab = this.tabs[0]
    },
    calculateTableMaxHeight() {
      this.$nextTick(() => {
        const { offsetHeight: layoutHeight, childNodes: [ iconsDiv, summaryDiv, presetsDiv ] } = this.$el
        this.tableMaxHeight = layoutHeight - iconsDiv.offsetHeight - summaryDiv.offsetHeight - presetsDiv.offsetHeight
      })
    },
    //presets logic ----------------------------------------------------------------------------------------------------------------------
    toggleModalSelect() {
      if (this.isPresetModalSelect) {
        this.presetModalSelected = ''
        this.presetModalId = ''
      }
      this.isPresetModalSelect = !this.isPresetModalSelect
    },
    async saveNewPresetFromCopy() {
      const snapshotBuilder = () => {
        const _presetIdx = this.layoutSettings.presets.findIndex(i => i.id === this.presetModalSelected)
        const value = {}
        const list = _presetIdx === -1 ? this.layoutSettings : this.layoutSettings.at(_presetIdx)
        for (const key of [ 'filters', 'fields', 'sorting' ]) value[key] = list[key].filter(({ isCheck }) => isCheck).map(({ id }) => id)
        return value
      }
      this.layoutSettings.presets.push({
        isCheck: true,
        preset: !!query ? `?${ query }` : '',
        id: this.presetModalId,
        snapshot: snapshotBuilder()
      })
      await this.saveSettingChanges()
      this.toggleModalSelect()
    }
  },
  computed: {
    ...mapGetters({
      user: "getUser"
    }),
    summary() {
      const summary = []
      for (const queryKey in this.$route.query) {
        if (!!this.$route.query[queryKey]) {
          const [ prefix ] = queryKey.split('_')
          const summaryEnum = prefix === 'sf' ? 'sorting' : 'filters'
          const { name } = this.layoutsPossibleSettings[this.moduleType][summaryEnum].find(j => j.id === queryKey)
          summary.push({
            id: queryKey,
            summaryEnum,
            name
          })
        }
      }
      return summary
    }
    // presetIdChecker() {
    //   const { presets } = this.layoutSettings
    //   return presets.filter((i, _idx) => this.presetIdIndex !== null ? _idx !== this.presetIdIndex : i).some(i => i.id === this.presetId)
    // }
  },
  created() {
    this.updatedSettingByUserData()
    this.calculateTableMaxHeight()
  },
  components: { SelectSingle, CheckBox, Close, Button, IconButton, draggable }

}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.layoutWrapper {
  margin: 0 50px 50px 50px;
  width: calc(100vw - 100px - 256px);
  height: calc(100vh - 50px - 47px);
  position: relative;
  overflow: hidden;

  &__icons {
    display: flex;
    justify-content: end;
    gap: 12px;
    height: 50px;
    align-items: center;
  }

  &__table {
    height: calc(100% - 50px);
  }

  &__setting {
    position: fixed;
    top: 46px;
    right: 0;
    height: 100vh;
    border-left: 1px solid $light-border;
    background: white;
    z-index: 30;
    padding: 25px;
    width: 400px;
    box-sizing: border-box;
  }

  &__filter,
  &__modal {
    position: absolute;
    z-index: 20;
    top: 0;
    left: 0;
    right: 0;
    margin: auto;
    background: white;
    border-bottom: 1px solid $light-border;
    border-left: 1px solid $light-border;
    border-right: 1px solid $light-border;
    padding: 25px;
    min-width: 240px;
    width: fit-content;
    max-width: 955px;
    border-bottom-right-radius: 2px;
    border-bottom-left-radius: 2px;

    &-body {
      @media (max-width: 1120px) {
        max-height: 400px;
        overflow: auto;
      }

      padding: 25px 0 33px;
      margin: 33px 0 25px 0;
      border-top: 1px solid $border;
      border-bottom: 1px solid $border;
    }

    &-buttons {
      display: flex;
      justify-content: center;
      gap: 20px;
    }

    &-preset {
      display: flex;
      align-items: center;
      gap: 20px;

      &-input {
        position: relative;
        width: 220px;
        height: 32px;

        input {
          font-size: 14px;
          color: $text;
          border: 1px solid $border;
          border-radius: 2px;
          box-sizing: border-box;
          padding: 0 7px;
          outline: none;
          height: 32px;
          transition: .1s ease-out;
          width: 220px;
          font-family: 'Myriad400';

          &:focus {
            border: 1px solid $border-focus;
          }
        }
      }
    }
  }
}

.options {
  display: flex;
  gap: 15px;
  padding: 10px 0;

  &__item {
    color: $green;
    letter-spacing: -0.1px;

    &:hover {
      cursor: pointer;
      text-decoration: underline;
    }
  }
}

.summary {
  display: flex;
  gap: 12px;
  background: $table-header;
  padding: 10px;
  flex-wrap: wrap;

  &__item {
    position: relative;
    height: 30px;
    box-sizing: border-box;
    border: 1px solid $border;
    border-radius: 2px;
    transition: .2s ease-out;
    display: flex;
    align-items: center;
    background: white;
    gap: 10px;
    padding: 0 10px;

    &-icon {
      color: $border;
    }

    &-close {
      margin-top: -1px;
    }

    &-name {
      cursor: default;
      margin-top: 2px;
    }
  }
}

.setting {
  &__tabs {
    padding: 15px 0;
    margin: 33px 0 25px 0;
    border-top: 1px solid $border;
    border-bottom: 1px solid $border;
  }

  &__body {
    height: calc(100vh - 15px - 40px - 33px - 50px - 46px - 80px);
    overflow-y: auto;
  }

  &__button {
    display: flex;
    justify-content: center;
    margin-top: 25px;
  }

  &__draggable {
    display: flex;
    height: 40px;
    padding: 0 12px;
    border: 1px solid $light-border;
    margin-bottom: 8px;
    margin-right: 8px;
    justify-content: space-between;
    align-items: center;

    &-icons {
      display: flex;
      gap: 8px;
    }

    &-icon {
      font-size: 14px;
      color: $dark-border;
      cursor: grab;
      background: $table-list;
      height: 28px;
      width: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 28px;
    }

    &-titleAndOption {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }
}

.presets {
  display: flex;
  gap: 12px;
  padding-bottom: 10px;
  flex-wrap: wrap;

  &__items {
    position: relative;
    height: 30px;
    box-sizing: border-box;
    border: 1px solid $border;
    border-radius: 2px;
    transition: .1s ease-out;
    line-height: 30px;
    background: white;
    padding: 0 12px;
    cursor: pointer;

    &:hover {
      border: 1px solid $border-focus;
    }
  }
}

.tab {
  display: flex;
  justify-content: space-between;
  align-items: center;

  &__head {
    display: flex;
    gap: 20px;

    &-count {
      color: $border;
    }

    &-title {
      font-family: Myriad600;
      width: 80px;
    }
  }

  &__icons {
    display: flex;
    gap: 10px;
    margin-right: -2px;
  }

  &__icon {
    font-size: 15px;
    color: $dark-border;
    cursor: pointer;
    height: 20px;
    width: 20px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      color: $text;
    }
  }

}

.slide-enter-active,
.slide-leave-active {
  transition: 0.15s;
  transition-timing-function: ease-out;
}

.slide-enter,
.slide-leave-to {
  transform: translateX(100%);
  transition: 0.12s;
  transition-timing-function: ease-in;
}

.top-enter-active,
.top-leave-active {
  transition: 0.15s;
  transition-timing-function: ease-out;
}

.top-enter,
.top-leave-to {
  transform: translateY(-100%);
  transition: 0.12s;
  transition-timing-function: ease-in;
}

.sortable-chosen {
  background: $light-border;
}

.opacity04 {
  opacity: 0.4;
}

.close {
  &__modal {
    right: 25px;
    top: 25px;
  }

  &__summary {
    position: relative;
    //top: 4px;
    //right: 6px;
  }
}
</style>
