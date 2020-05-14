<template lang="pug">
.tasks-steps(v-if="project._id")
    .tasks-steps__tasks-title Tasks and Steps
    .tasks-steps__tables
        OtherTasks(
            v-if="isTasksShow"
            :project="project"
             @showTab="showTab"
        )
        OtherSteps(
            v-if="isStepsShow"
            :project="project"
            :projectSteps="projectSteps"
            @showTab="showTab"
        )
</template>

<script>
import OtherTasks from "./OtherTasks";
import OtherSteps from "./OtherSteps";
import { mapGetters, mapActions } from "vuex";

export default {
  props: {
    project: {
      type: Object
    },
    projectSteps: {
      type: Array
    }
  },
  data() {
    return {
      isStepsShow: false,
      isTasksShow: true
    };
  },
  methods: {
    showTab({ tab }) {
      if (tab === "Tasks") {
        this.isStepsShow = false;
        this.isTasksShow = true;
      } else {
        this.isStepsShow = true;
        this.isTasksShow = false;
      }
    }
  },
  components: {
    OtherTasks,
    OtherSteps
  }
};
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.tasks-steps {
  box-sizing: border-box;
  width: 67%;
  padding: 20px;
  margin-left: 20px;
  margin-right: 20px;
  box-shadow: 0 3px 20px $brown-shadow;
  position: relative;
  @media (max-width: 1600px) {
    width: 70%;
  }
  &__info {
    position: absolute;
    z-index: 1000;
    color: $orange;
    background-color: $white;
    padding: 20px;
    top: 20%;
    margin-left: auto;
    margin-right: auto;
    left: 0;
    right: 0;
    width: 300px;
    border: 1px solid $main-color;
    box-shadow: 0 3px 20px $brown-shadow;
  }
  &__file-counter {
    margin-top: 10px;
    text-align: center;
  }
  &__tasks-title {
    font-size: 29px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  &__menu-title {
    font-size: 14px;
  }
  &__tables {
    position: relative;
  }
  &__arrow {
    cursor: pointer;
  }
  &_rotate {
    transform: rotate(180deg);
  }
}

.slide-fade-enter-active {
  transition: all 0.3s ease;
}
.slide-fade-leave-active {
  transition: all 0.1s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateY(10px);
  opacity: 0;
}
</style>
