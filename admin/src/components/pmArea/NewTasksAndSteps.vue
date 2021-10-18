<template lang="pug">
 .tasks-and-steps Tasks and Steps
   NewTasksData
   NewTasks
   NewSteps

</template>

<script>
import NewTasksData from "./tasks-n-steps/NewTasksData"
import NewTasks from "./tasks-n-steps/NewTasks"
import NewSteps from "./tasks-n-steps/NewSteps"


export default {
  name: "NewTaskAndSteps",

  components: {
    NewTasksData,
    NewTasks,
    NewSteps,
  }
}
</script>

<style scoped lang="scss">
  @import "../../assets/scss/colors";

  .tasks-and-steps {
    background-color: $white;
    padding: 25px;
    box-shadow: $box-shadow;
    position: relative;

    width: 1040px;
    box-sizing: border-box;
    border-radius: 4px;
    margin: 50px;
  }
</style>