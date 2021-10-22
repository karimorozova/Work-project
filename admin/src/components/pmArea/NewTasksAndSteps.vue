<template lang="pug">
  .TS
    .TS__title Tasks and Steps

    .modal(v-if="isModalOpen")
      VendorManage(:steps="currentProject.steps" :industry="currentProject.industry" @closeVendorManage="closeVendorManage")

    transition(name="slide-fade")
      NewTasksData(
        v-if="allServices.length && currentProject._id && allLanguages.length"
        :allServices="allServices"
        :allLanguages="allLanguages"
        :currentProject="currentProject"
      )

    Tabs(:tabs="tabs" @setTab="setTab" :selectedTab="selectedTabQuery")
    NewTasks(
      v-if="selectedTabQuery === 'Tasks'"
      :tasks="currentProject.tasks"
    )

    NewSteps(
      v-if="selectedTabQuery === 'Steps'"
      :steps="currentProject.steps"
    )
    Button(style="margin-top: 20px;" value="Manage Vendors" :outline="true" @clicked="openVendorManage")
    additionsSteps(
      v-if="selectedTabQuery === 'Additional Steps'"
      :additionsSteps="currentProject.additionsSteps"
    )

</template>

<script>
import NewTasksData from "./tasks-n-steps/NewTasksData"
import NewTasks from "./tasks-n-steps/NewTasks"
import NewSteps from "./tasks-n-steps/NewSteps"
import AdditionsSteps from "./tasks-n-steps/AdditionsSteps"
import Tabs from "../Tabs"
import Button from "../Button"
import VendorManage from "./VendorManage"
import { mapGetters } from "vuex"


export default {
  name: "NewTaskAndSteps",
  data() {
    return {
      tabs: ['Tasks', 'Steps', 'Additional Steps'],
      isModalOpen: false,
    }
  },
  methods: {
    setTab({ index }) {
      this.$router.replace({ 'query': {selectedTab: this.tabs[index]} }).catch((err) => err)
    },
    querySetter(vm, to) {
      if (to.query['selectedTab'] != null) vm['selectedTab'] = to.query['selectedTab']
    },
    openVendorManage() {
      this.isModalOpen = true
    },
    closeVendorManage() {
      this.isModalOpen = false
    },
  },
  computed: {
    ...mapGetters({
      allServices: "getAllServices",
      currentProject: "getCurrentProject",
      allLanguages: 'getAllLanguages'
    }),
    selectedTabQuery() {
      return this.$route.query.selectedTab || 'Tasks'
    },
  },

  components: {
    NewTasksData,
    NewTasks,
    NewSteps,
    Tabs,
    AdditionsSteps,
    VendorManage,
    Button,
  }
}
</script>

<style scoped lang="scss">
@import "../../assets/scss/colors";

.TS {
  background-color: $white;
  padding: 25px;
  box-shadow: $box-shadow;
  //position: relative;
  width: 1040px;
  box-sizing: border-box;
  border-radius: 4px;
  margin-top: 50px;

  &__title {
    font-size: 19px;
    font-family: 'Myriad600';
  }

  .modal {
    position: absolute;
    left: 0px;
    top: 0px;
    z-index: 45;
    box-sizing: border-box;
    min-width: 1530px;
    width: 1530px;
    padding: 25px;
    box-shadow: $box-shadow;
    background: white;
    border-radius: 4px;
  }
}

.slide-fade-enter-active {
  transition: all .3s ease;
}

.slide-fade-leave-active {
  transition: all .1s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}

.slide-fade-enter, .slide-fade-leave-to {
  transform: translateY(10px);
  opacity: 0;
}
</style>