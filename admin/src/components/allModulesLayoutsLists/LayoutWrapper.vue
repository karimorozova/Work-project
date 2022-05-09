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
        .options__item Save As Preset

      //div {{summary}}

    .layoutWrapper__presets
      //span tabs
      //h1 summary

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
              .setting__draggable(v-for="item in layoutSettings.presets")
                .setting__draggable-titleAndOption
                  span {{ item.id }}
                .setting__draggable-icon.handle
                  i.fas.fa-arrows-alt-v

          .setting__button
            Button(value="Approve" @clicked="saveChanges")

</template>

<script>
import IconButton from "../IconButton"
import Button from "../Button"
import Close from "../Close"
import { mapActions, mapGetters } from "vuex"
import draggable from 'vuedraggable'
import CheckBox from "../CheckBox"
import LayoutWrapperMixin from "../../mixins/LayoutWrapperMixin"


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
      tabs: [],
      // summary: [],
      selectedTab: '',
      layoutSettings: {
        filters: [],
        fields: [],
        sorting: [],
        presets: []
      },

      layoutsPossibleSettings: {
        project: {
          filters: [
            {
              id: "f_projectId",
              name: "Project ID",
              isCheck: false
            },
            {
              id: "f_projectName",
              name: "Project Name",
              isCheck: false
            },
            {
              id: "f_clients",
              name: "Clients",
              isCheck: false
            },
            {
              id: "f_startDate",
              name: "Start Date Range",
              isCheck: false
            },
            {
              id: "f_deadline",
              name: "Deadline Range",
              isCheck: false
            },
            {
              id: "f_projectManager",
              name: "Project Manager",
              isCheck: false
            },
            {
              id: "f_accountManager",
              name: "Account Manger",
              isCheck: false
            },
            {
              id: "f_sourceLanguages",
              name: "Source Languages",
              isCheck: false
            },
            {
              id: "f_targetLanguages",
              name: "Target Languages",
              isCheck: false
            },
            {
              id: "f_industry",
              name: "Industry",
              isCheck: false
            },
            {
              id: "f_tasksServices",
              name: "Tasks Services",
              isCheck: false
            },
            {
              id: "f_stepsServices",
              name: "Step Services",
              isCheck: false
            },
            {
              id: "f_tasksStatuses",
              name: "Tasks Statuses",
              isCheck: false
            },
            {
              id: "f_stepsStatuses",
              name: "Steps Statuses",
              isCheck: false
            },
            {
              id: "f_isTest",
              name: "Test",
              isCheck: false
            },
            {
              id: "f_projectCurrency",
              name: "Currency",
              isCheck: false
            },
            {
              id: "f_vendors",
              name: "Vendors",
              isCheck: false
            },
            {
              id: "f_requestId",
              name: "Request ID",
              isCheck: false
            }
          ],
          fields: [
            {
              id: "sf_projectID",
              name: "Project ID",
              isCheck: false,
              style: { "min-width": "130px" }
            },
            {
              id: "sf_projectName",
              name: "Project Name",
              isCheck: false,
              style: { "min-width": "240px" }
            },
            {
              id: "sf_clientName",
              name: "Client Name",
              isCheck: false,
              style: { "min-width": "180px" }
            },
            {
              id: "sf_startDate",
              name: "Start Date",
              isCheck: false,
              style: { "min-width": "130px" }
            },
            {
              id: "sf_deadline",
              name: "Deadline",
              isCheck: false,
              style: { "min-width": "130px" }
            },
            {
              id: "sf_languages",
              name: "Languages",
              isCheck: false,
              style: { "min-width": "220px" }
            },
            {
              id: "sf_projectManager",
              name: "Project Manager",
              isCheck: false,
              style: { "min-width": "160px" }
            },
            {
              id: "sf_accountManager",
              name: "Account Manger",
              isCheck: false,
              style: { "min-width": "160px" }
            },
            {
              id: "sf_industry",
              name: "Industry",
              isCheck: false,
              style: { "min-width": "130px" }
            },
            {
              id: "sf_isTest",
              name: "Test",
              isCheck: false,
              style: { "min-width": "100px" }
            },
            {
              id: "sf_payables",
              name: "Payables",
              isCheck: false,
              style: { "min-width": "100px" }
            },
            {
              id: "sf_receivables",
              name: "Receivables",
              isCheck: false,
              style: { "min-width": "100px" }
            },
            {
              id: "sf_total",
              name: "Total",
              isCheck: false,
              style: { "min-width": "100px" }
            },
            {
              id: "sf_margin",
              name: "Margin",
              isCheck: false,
              style: { "min-width": "100px" }
            },
            {
              id: "sf_marginPercent",
              name: "Margin %",
              isCheck: false,
              style: { "min-width": "100px" }
            },
            {
              id: "sf_roi",
              name: "Roi",
              isCheck: false,
              style: { "min-width": "100px" }
            },
            {
              id: "sf_projectCurrency",
              name: "Currency",
              isCheck: false,
              style: { "min-width": "100px" }
            },
            {
              id: "sf_status",
              name: "Status",
              isCheck: false,
              style: { "min-width": "130px" }
            },
            {
              id: "sf_urgent",
              name: "Urgent",
              isCheck: false,
              style: { "min-width": "100px" }
            },
            {
              id: "sf_requestId",
              name: "Request ID",
              isCheck: false,
              style: { "min-width": "150px" }
            },
            {
              id: "sf_tasksServices",
              name: "Tasks Services",
              isCheck: false,
              style: { "min-width": "150px" }
            },
            {
              id: "sf_tasksStatuses",
              name: "Tasks Statuses",
              isCheck: false,
              style: { "min-width": "150px" }
            },
            {
              id: "sf_stepsServices",
              name: "Step Services",
              isCheck: false,
              style: { "min-width": "150px" }
            },
            {
              id: "sf_stepsStatuses",
              name: "Steps Statuses",
              isCheck: false,
              style: { "min-width": "150px" }
            },
            {
              id: "sf_extraServices",
              name: "Extra Services",
              isCheck: false,
              style: { "min-width": "130px" }
            },
            {
              id: "sf_vendors",
              name: "Vendors",
              isCheck: false,
              style: { "min-width": "300px" }
            }
          ],
          sorting: [
            {
              id: "sf_projectID",
              name: "Project ID",
              isCheck: false
            },
            {
              id: "sf_projectName",
              name: "Project Name",
              isCheck: false
            },
            {
              id: "sf_clientName",
              name: "Client Name",
              isCheck: false
            },
            {
              id: "sf_startDate",
              name: "Start Date",
              isCheck: false
            },
            {
              id: "sf_deadline",
              name: "Deadline",
              isCheck: false
            },
            {
              id: "sf_projectManager",
              name: "Project Manager",
              isCheck: false
            },
            {
              id: "sf_accountManager",
              name: "Account Manger",
              isCheck: false
            },
            {
              id: "sf_industry",
              name: "Industry",
              isCheck: false
            },
            {
              id: "sf_isTest",
              name: "Test",
              isCheck: false
            },
            {
              id: "sf_payables",
              name: "Payables",
              isCheck: false
            },
            {
              id: "sf_receivables",
              name: "Receivables",
              isCheck: false
            },
            {
              id: "sf_total",
              name: "Total",
              isCheck: false
            },
            {
              id: "sf_margin",
              name: "Margin",
              isCheck: false
            },
            {
              id: "sf_marginPercent",
              name: "Margin %",
              isCheck: false
            },
            {
              id: "sf_roi",
              name: "Roi",
              isCheck: false
            },
            {
              id: "sf_projectCurrency",
              name: "Currency",
              isCheck: false
            },
            {
              id: "sf_status",
              name: "Status",
              isCheck: false
            },
            {
              id: "sf_urgent",
              name: "Urgent",
              isCheck: false
            },
            {
              id: "sf_requestId",
              name: "Request ID",
              isCheck: false
            }
          ]
        }
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
      if (callback) return callback()
    },
    toggleSettings() {
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
    async saveChanges() {
      const value = {}
      for (const key in this.layoutSettings) value[key] = this.layoutSettings[key].filter(({ isCheck }) => isCheck).map(({ id }) => id)
      try {
        await this.$http.post('/api-settings/update-user-layouts-setting', {
          userId: this.user._id,
          prop: this.moduleType,
          value
        })
        await this.setUser()
        this.alertToggle({ message: 'Setting saved!', isShow: true, type: "success" })
      } catch (e) {
        this.alertToggle({ message: e.data, isShow: true, type: "error" })
      } finally {
        this.isSettings = false
      }
    },
    dataSaver(userIds, prop) {
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
      const { layoutsSettings: { [this.moduleType]: { fields = [], filters = [], sorting = [], presets = [] } } } = this.user
      this.dataSaver(fields, 'fields')
      this.dataSaver(filters, 'filters')
      this.dataSaver(sorting, 'sorting')
      this.layoutSettings.presets = presets

      for (let prop of [ 'fields', 'filters', 'sorting', 'presets' ]) if (this.layoutSettings[prop].length) this.tabs.push(prop)
      this.selectedTab = this.tabs[0]
    },
    calculateTableMaxHeight() {
      this.$nextTick(() => {
        const { offsetHeight: layoutHeight, childNodes: [ iconsDiv, summaryDiv, presetsDiv ] } = this.$el
        this.tableMaxHeight = layoutHeight - iconsDiv.offsetHeight - summaryDiv.offsetHeight - presetsDiv.offsetHeight
      })
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
  },
  created() {
    this.updatedSettingByUserData()
    this.calculateTableMaxHeight()
  },
  components: { CheckBox, Close, Button, IconButton, draggable }

}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.layoutWrapper {
  margin: 0 50px 50px 50px;
  width: calc(100vw - 100px - 256px);
  height: calc(100vh - 50px - 47px);
  //background: lightblue;
  position: relative;
  overflow: hidden;

  &__summary {

  }

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

  &__filter {
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
      font-family: 'Myriad600';
      cursor: default;
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
