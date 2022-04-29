<template lang="pug">
  .layoutWrapper(v-if="user._id")
    .layoutWrapper__summaryAndIcons

      .summaryAndIcons
        .summaryAndIcons__summary
        .summaryAndIcons__icons
          IconButton(v-if="hasFilterButton" @clicked="toggleFilter")
            i(class="fa-solid fa-filter")
          IconButton(v-if="hasSettingButton" @clicked="toggleSettings")
            i(class="fas fa-cogs")

      .summaryOption

    .layoutWrapper__table
      slot(name="table")

    .layoutWrapper__filter(v-if="isFilter")
      .layoutWrapper__filter-body
        slot(name="filter")
      .layoutWrapper__filter-buttons
        Button(value="Search")
        Button(value="Close" :outline="true")

    transition(name='slide')
      .layoutWrapper__setting(v-if="isSettings")
        .setting
          //.setting__title Settings
          .setting__close
            Close(@clicked="toggleSettings")
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

          .setting__button
            Button(value="Approve" )

</template>

<script>
import IconButton from "../IconButton"
import Button from "../Button"
import Close from "../Close"
import { mapGetters } from "vuex"
import draggable from 'vuedraggable'
import CheckBox from "../CheckBox"


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
  data() {
    return {
      isFilter: false,
      isSettings: false,
      // tabs: [ 'Fields', 'Filters', 'Sorting' ],
      tabs: [],
      selectedTab: '',
      layoutSettings: {
        filters: [],
        fields: [],
        sorting: []
      },

      layoutsPossibleSettings: {
        project: {
          filters: [
            {
              id: "projectId",
              name: "Project ID",
              fixed: false,
              isCheck: false
            },
            {
              id: "projectName",
              name: "Project Name",
              fixed: false,
              isCheck: false
            },
            {
              id: "clientName",
              name: "Client Name",
              fixed: false,
              isCheck: false
            },
            {
              id: "startDate",
              name: "Start Date",
              fixed: false,
              isCheck: false
            },
            {
              id: "deadline",
              name: "Deadline",
              fixed: false,
              isCheck: false
            },
            {
              id: "projectManager",
              name: "Project Manager",
              fixed: false,
              isCheck: false
            },
            {
              id: "accountManger",
              name: "Account Manger",
              fixed: false,
              isCheck: false
            },
            {
              id: "sourceLanguages",
              name: "Source Languages",
              fixed: false,
              isCheck: false
            },
            {
              id: "targetLanguages",
              name: "Target Languages",
              fixed: false,
              isCheck: false
            },
            {
              id: "industry",
              name: "Industry",
              fixed: false,
              isCheck: false
            },
            {
              id: "services",
              name: "Services",
              fixed: false,
              isCheck: false
            },
            {
              id: "isTest",
              name: "Test",
              fixed: false,
              isCheck: false
            },
            {
              id: "projectCurrency",
              name: "Currency",
              fixed: false,
              isCheck: false
            },
            {
              id: "paymentProfile",
              name: "Payment Profile",
              fixed: false,
              isCheck: false
            },
            {
              id: "vendors",
              name: "Vendors",
              fixed: false,
              isCheck: false
            },
            {
              id: "tasksStatuses",
              name: "Tasks Statuses",
              fixed: false,
              isCheck: false
            },
            {
              id: "requestId",
              name: "Request ID",
              fixed: false,
              isCheck: false
            }
          ],
          fields: [
            {
              id: "projectID",
              name: "Project ID",
              fixed: false,
              isCheck: false
            },
            {
              id: "projectName",
              name: "Project Name",
              fixed: false,
              isCheck: false
            },
            {
              id: "clientName",
              name: "Client Name",
              fixed: false,
              isCheck: false
            },
            {
              id: "startDate",
              name: "Start Date",
              fixed: false,
              isCheck: false
            },
            {
              id: "deadline",
              name: "Deadline",
              fixed: false,
              isCheck: false
            },
            {
              id: "languages",
              name: "Languages",
              fixed: false,
              isCheck: false
            },
            {
              id: "projectManager",
              name: "Project Manager",
              fixed: false,
              isCheck: false
            },
            {
              id: "accountManager",
              name: "Account Manger",
              fixed: false,
              isCheck: false
            },
            {
              id: "industry",
              name: "Industry",
              fixed: false,
              isCheck: false
            },
            {
              id: "services",
              name: "Services",
              fixed: false,
              isCheck: false
            },
            {
              id: "isTest",
              name: "Test",
              fixed: false,
              isCheck: false
            },
            {
              id: "payables",
              name: "Payables",
              fixed: false,
              isCheck: false
            },
            {
              id: "receivables",
              name: "Receivables",
              fixed: false,
              isCheck: false
            },
            {
              id: "total",
              name: "Total",
              fixed: false,
              isCheck: false
            },
            {
              id: "margin",
              name: "Margin",
              fixed: false,
              isCheck: false
            }, {
              id: "marginPercentage",
              name: "Margin %",
              fixed: false,
              isCheck: false
            }, {
              id: "roi",
              name: "Roi",
              fixed: false,
              isCheck: false
            },
            {
              id: "projectCurrency",
              name: "Currency",
              fixed: false,
              isCheck: false
            },
            {
              id: "status",
              name: "Status",
              fixed: false,
              isCheck: false
            },
            {
              id: "paymentProfile",
              name: "Payment Profile",
              fixed: false,
              isCheck: false
            },
            {
              id: "progress",
              name: "Progress",
              fixed: false,
              isCheck: false
            },
            {
              id: "discounts",
              name: "Discounts",
              fixed: false,
              isCheck: false
            },
            {
              id: "urgent",
              name: "Urgent",
              fixed: false,
              isCheck: false
            },
            {
              id: "vendors",
              name: "Vendors",
              fixed: false,
              isCheck: false
            },
            {
              id: "tasksStatuses",
              name: "Tasks Statuses",
              fixed: false,
              isCheck: false
            },
            {
              id: "requestId",
              name: "Request ID",
              fixed: false,
              isCheck: false
            }
          ],
          sorting: []
        }
      }
    }
  },
  methods: {
    toggleFilter() {
      this.isFilter = !this.isFilter
    },
    toggleSettings() {
      this.isSettings = !this.isSettings
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

      console.log(this.layoutSettings[prop])
      //TODO: ???
      // this.layoutSettings[prop].push(
      //     ...list.filter(i => !this.layoutSettings[prop].map(i => i.id).includes(i))
      // )
    },
    updatedSettingByUserData() {
      const { layoutsSettings: { [this.moduleType]: { fields = [], filters = [], sorting = [] } } } = this.user
      this.dataSaver(fields, 'fields')
      this.dataSaver(filters, 'filters')
      this.dataSaver(sorting, 'sorting')

      for (let prop of [ 'fields', 'filters', 'sorting' ]) if (this.layoutSettings[prop].length) this.tabs.push(prop)
      this.selectedTab = this.tabs[0]
    }
  },
  computed: {
    ...mapGetters({
      user: "getUser"
    })
  },
  created() {
    this.updatedSettingByUserData()
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
  background: lightblue;
  position: relative;

  &__table {
    background-color: #9c9c9c;
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
    &-buttons {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid $light-border;
    }
  }
}

.summaryAndIcons {
  display: flex;
  justify-content: space-between;

  &__icons {
    display: flex;
    gap: 12px;
    margin: 10px 0 10px;
  }
}

.setting {
  &__tabs {
    padding: 15px 0;
    margin: 30px 0 25px 0;
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
    padding: 0px 12px;
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

.filterItem {
  &__label {
    margin-bottom: 3px;
    font-family: 'Myriad600';
  }

  &__input {
    position: relative;
    height: 32px;
    width: 220px;
  }

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

.sortable-chosen {
  background: $light-border;
}

.opacity04 {
  opacity: 0.4;
}
</style>