<template lang="pug">
  .TS
    .TS__titleAndButtons
      .TS__title Tasks and Steps
      .TS__buttons
        IconButton(
          v-if="!isProjectFinished && !isTaskData && currentProject.steps.length"
          @clicked="toggleVendorManage"
          :hasPopup="true"
          popupText="Manage Vendors"
        )
          i.fas.fa-user
        IconButton(
          v-if="!isProjectFinished && !isTaskData"
          @clicked="toggleTaskData"
          :hasPopup="true"
          popupText="Add T&S"
        )
          i.fas.fa-plus-circle
        IconButton(
          v-if="!isProjectFinished && isTaskData"
          @clicked="toggleTaskData"
          :hasPopup="true"
          popupText="Close T&S Creation"
        )
          i.fas.fa-times-circle

        IconButton(
          v-if="!isProjectFinished"
          @clicked="refreshProject"
          :hasPopup="true"
          popupText="Update project progress"
        )
          i.fas.fa-sync


    .modal(v-if="isModalOpen")
      VendorManage(
        :steps="currentProject.steps"
        :currentProject="currentProject"
        @closeVendorManage="toggleVendorManage"
        @updateCurrentProject="saveProject"
      )


    transition(name="slide-fade")
      NewTasksData(
        v-if="isTaskData && allServices.length && currentProject._id && allLanguages.length"
        :allServices="allServices"
        :allLanguages="allLanguages"
        :currentProject="currentProject"
      )

    NewTasks(
      v-if="selectedTabQuery === 'Tasks'"
      :tasks="currentProject.tasks"
      :tabs="tabs"
      @setTab="setTab"
    )

    NewSteps(
      v-if="selectedTabQuery === 'Steps'"
      :steps="currentProject.steps"
      :tabs="tabs"
      @setTab="setTab"
    )

    additionsSteps(
      v-if="selectedTabQuery === 'Additional Steps'"
      :additionsSteps="currentProject.additionsSteps"
      :tabs="tabs"
      @setTab="setTab"
    )

    //Invoicing(
    //  v-if="selectedTabQuery === 'Invoicing'"
    //  :tabs="tabs"
    //  @setTab="setTab"
    //)

</template>

<script>
import NewTasksData from "./tasks-n-steps/NewTasksData"
import NewTasks from "./tasks-n-steps/NewTasks"
import NewSteps from "./tasks-n-steps/NewSteps"
import AdditionsSteps from "./tasks-n-steps/AdditionsSteps"
import Tabs from "../Tabs"
import Button from "../Button"
import VendorManage from "./VendorManage"
// import Invoicing from "./tasks-n-steps/Invoicing"
import { mapActions, mapGetters } from "vuex"
import { clearTasksData, foo, updateProgress } from "../../vuex/pmarea/actions"
import IconButton from "../IconButton"

export default {
  name: "NewTaskAndSteps",
  components: {
    IconButton,
    NewTasksData,
    NewTasks,
    NewSteps,
    Tabs,
    AdditionsSteps,
    VendorManage,
    Button
    // Invoicing,
  },
  data() {
    return {
      // tabs: [ 'Tasks', 'Steps', 'Additional Steps', 'Invoicing' ],
      tabs: [ 'Tasks', 'Steps', 'Additional Steps' ],
      isModalOpen: false,
      isTaskData: false
    }
  },
  methods: {
    ...mapActions([ 'setCurrentProject', 'alertToggle', 'clearTasksData', 'updateProgress' ]),
    saveProject(data) {
      this.setCurrentProject(data)
    },
    async refreshProject() {
      if (this.currentProject.tasks.length) {
        const isCatTool = this.currentProject.tasks.some(item => item.memoqDocs.length)
        await this.updateProgress({ projectId: this.currentProject._id, isCatTool })
      } else {
        try {
          const updatedProject = await this.$http.get(`/pm-manage/project?id=${ this.currentProject._id }`)
          this.setCurrentProject(updatedProject.data)
          this.alertToggle({ message: "Project refreshed", isShow: true, type: "success" })
        } catch (err) {
        }
      }
    },
    toggleTaskData() {
      if (this.isTaskData) {
        this.clearTasksData()
      }
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
      let elem = document.getElementsByTagName('body')[0]
      if (this.isModalOpen) {
        elem.classList.add("hiddenScroll")
      } else {
        elem.classList.remove("hiddenScroll")
      }
    },
    setDefaultIsTaskData() {
      if (!this.currentProject.tasks.length) this.isTaskData = true
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
  mounted() {
    this.setDefaultIsTaskData()
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
  border-radius: 2px;
  margin-top: 25px;

  &__buttons {
    display: flex;
    gap: 12px;
  }

  &__titleAndButtons {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  &__refresh {
    font-size: 15px;
    border: 1px solid $border;
    border-radius: 2px;
    height: 30px;
    width: 30px;
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

  &__addTask,
  &__closeAddTask {
    padding: 0 7px;
    font-size: 16px;
    border: 1px solid $border;
    border-radius: 2px;
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
    font-size: 16px;
    font-family: 'Myriad600';
  }

  .modal {
    position: fixed;
    left: 255px;
    top: 0px;
    box-sizing: border-box;
    width: calc(100% - 255px);
    padding: 50px;
    box-shadow: $box-shadow;
    background: white;
    border-radius: 2px;
    z-index: 30000;
    height: 100%;
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