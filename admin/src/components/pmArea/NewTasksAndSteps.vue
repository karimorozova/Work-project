<template lang="pug">
  .TS
    .TS__title Tasks and Steps

    transition(name="slide-fade")
      NewTasksData(
        v-if="allServices.length && currentProject._id && allLanguages.length"
        :allServices="allServices"
        :allLanguages="allLanguages"
        :currentProject="currentProject"
      )

    NewTasks

    NewSteps


</template>

<script>
import NewTasksData from "./tasks-n-steps/NewTasksData"
import NewTasks from "./tasks-n-steps/NewTasks"
import NewSteps from "./tasks-n-steps/NewSteps"
import { mapGetters } from "vuex"


export default {
  name: "NewTaskAndSteps",

  computed: {
    ...mapGetters({
      allServices: "getAllServices",
      currentProject: "getCurrentProject",
      allLanguages: 'getAllLanguages'
    })
  },

  components: {
    NewTasksData,
    NewTasks,
    NewSteps
  }
}
</script>

<style scoped lang="scss">
@import "../../assets/scss/colors";

.TS {
  background-color: $white;
  padding: 25px;
  box-shadow: $box-shadow;
  position: relative;
  width: 1040px;
  box-sizing: border-box;
  border-radius: 4px;
  margin-top: 50px;

  &__title {
    font-size: 19px;
    font-family: 'Myriad600';
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