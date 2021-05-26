<template lang="pug">
  .client-req__layout
    .main-wrapper
      FormProject(:project="currentClientRequest")
      TasksAndSteps
    .sub-wrapper
      ProjectSubInformation(:project="currentClientRequest")

</template>

<script>
import FormProject from "./subComponents/FormProject"
import { mapGetters, mapActions } from "vuex"
import ProjectSubInformation from "../ProjectSubInformation"
import TasksAndSteps from "./TasksAndSteps";

export default {
  data(){
    return {
      clientRequest: {}
    }
  },
  computed: {
    ...mapGetters({
      currentClientRequest: "getCurrentClientRequest"
    }),
  },
  components: {TasksAndSteps, ProjectSubInformation, FormProject }
}
</script>

<style scoped lang="scss">
  .client-req {
    &__layout {
      margin: 30px;
      display: flex;
    }
  }

  .main-wrapper {
  }

  .sub-wrapper {
    margin-left: 40px;
    padding-right: 40px;
  }

</style>
