<template lang="pug">
  .sidebarSettings
    .sidebarSettings__mainIcon(@click="toggleSettings")
      img(src="../../../assets/images/left-menu-close.png" v-if="!isShowSettings")
      img(src="../../../assets/images/left-menu-open.png" v-else)
    transition(name='slide')
      .sidebarSettings__body(v-if="isShowSettings")
        Tabs(:tabs="tabs" :selectedTab="selectedTab" @setTab="setTab")
        .filters(v-if="selectedTab === 'Filters'")
          draggable(v-model="baseFilters" handle=".handle")
            .draggable__element( v-for="element in baseFilters" :key="element.id")
              CheckBox(:isChecked="!!element.isCheck" @check="baseFiltersCheck(element.id, true)" @uncheck="baseFiltersCheck(element.id, false)")
              span {{element.name}}
              i(class="fa fa-align-justify handle")
        .fields(v-else)
          draggable(v-model="baseFields" handle=".handle")
            .draggable__element( v-for="element in baseFields" :key="element.id")
              CheckBox(:isChecked="!!element.isCheck" @check="baseFieldsCheck(element.id, true)" @uncheck="baseFieldsCheck(element.id, false)")
              span {{element.name}}
              i(class="fa fa-align-justify handle")

        Button(value="Update Filters/Fields" @clicked="send")
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
    },
  },
  data() {
    return {
      baseFilters: this.filters.map(item => {
        if(this.userInfo.filters.includes(item.id)) item.isCheck = true
        return item
      }),
      baseFields: this.fields.map(item => {
        if(this.userInfo.fields.includes(item.id)) item.isCheck = true
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
        filters: this.baseFilters.filter(({isCheck})=>isCheck).map(({id})=> id),
        fields: this.baseFields.filter(({isCheck})=> isCheck).map(({id})=> id)
      })
    },
    baseFiltersCheck(checkedId, bool) {
      const checkFilter = this.baseFilters.find(({id}) => checkedId === id )
      checkFilter.isCheck = bool
    },
    baseFieldsCheck(checkedId, bool) {
      const checkField = this.baseFields.find(({id}) => checkedId === id )
      checkField.isCheck = bool
    },
  },
}
</script>

<style scoped lang="scss">
.sidebarSettings {
  &__body{
    position: fixed;
    bottom: 0;
    top: 0;
    right: 0;
    background-color: white;
    padding-top: 50px;
  }
  &__mainIcon{
    display: inline-block;
  }
  .draggable__element{
    display: flex;
  }
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