<template lang="pug">
  .TS
    .TS__titleAndButtons
      .TS__title Tasks and Steps
      .TS__buttons
        .TS__button
          .TS__addTask(style="font-size: 14px;" v-if="!isProjectFinished && !isTaskData" @click="toggleVendorManage")
            i.fas.fa-user(style="margin-right: 6px;")
            span Manage Vendors

        .TS__button
          .TS__addTask(v-if="!isProjectFinished && !isTaskData" @click="toggleTaskData")
            i.fas.fa-plus-circle
          .TS__closeAddTask(v-if="!isProjectFinished && isTaskData" @click="toggleTaskData")
            i.fas.fa-times-circle



    .modal(v-if="isModalOpen")
      VendorManage(:steps="currentProject.steps" :industry="currentProject.industry" @closeVendorManage="toggleVendorManage")


    transition(name="slide-fade")
      NewTasksData(
        v-if="isTaskData && allServices.length && currentProject._id && allLanguages.length"
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
      tabs: [ 'Tasks', 'Steps', 'Additional Steps' ],
      isModalOpen: false,
      isTaskData: true
    }
  },
  methods: {
    toggleTaskData() {
      this.isTaskData = !this.isTaskData
    },
    setTab({ index }) {
      this.$router.replace({ 'query': { selectedTab: this.tabs[index] } }).catch((err) => err)
    },
    querySetter(vm, to) {
      if (to.query['selectedTab'] != null) vm['selectedTab'] = to.query['selectedTab']
    },
    toggleVendorManage() {
      this.isModalOpen = !this.isModalOpen
    }
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
    isProjectFinished() {
      const { status } = this.currentProject
      return status === 'Closed' || status === 'Cancelled Halfway' || status === 'Cancelled'
    }
  },

  components: {
    NewTasksData,
    NewTasks,
    NewSteps,
    Tabs,
    AdditionsSteps,
    VendorManage,
    Button
  }
}
</script>

<style scoped lang="scss">
@import "../../assets/scss/colors";

.TS {
  background-color: $white;
  padding: 25px;
  box-shadow: $box-shadow;
  width: 1040px;
  box-sizing: border-box;
  border-radius: 4px;
  margin-top: 50px;

  &__buttons {
    display: flex;
    gap: 12px;
  }

  &__titleAndButtons {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  &
  &__addTask,
  &__closeAddTask {
    padding: 0 7px;
    font-size: 16px;
    border: 1px solid $border;
    border-radius: 4px;
    height: 30px;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: .2s ease-out;
    justify-content: center;
    color: $dark-border;

    &:hover {
      color: $text;
    }
  }

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
    min-width: 1510px;
    width: 1510px;
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