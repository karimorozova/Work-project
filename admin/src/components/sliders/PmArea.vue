<template lang="pug">
.pm-area
  Sidebar(v-if="!isCreating" 
    title="PM-AREA" 
    :links="sidebarLinks")
  .pm-area__projects-table(v-if="!isCreating")
    Allprojects
  router-view(
    @projectCreating="projectCreating"
    @setValue="setValue"
    @projectCreated="projectCreated"
    @projectDetailsClosed="projectDetailsClosed"
    :project="chosenProject"
  )
</template>

<script>
import Sidebar from '../Sidebar';
import Allprojects from '../pmArea/Allprojects';

export default {
  data() {
    return {
      isCreating: false,
      chosenProject: {
        projectId: "",
        template: "",
        projectName: "",
        customer: {name: ""},
        brief: "",
        notes: "",
        industry: [],
        createdAt: "",
        date: "",
      },
      sidebarLinks: ['Open Projects']
    };
  },
  methods: {
    projectCreating() {
      this.isCreating = true;
      this.chosenProject = {
        projectId: "",
        template: "",
        projectName: "",
        customer: {name: ""},
        brief: "",
        notes: "",
        industry: [],
        createdAt: "",
        date: "",
      }
    },
    projectDetailsClosed() {
      this.isCreating = false;
    },
    projectCreated({project, customer}) {
      this.chosenProject = project;
      this.chosenProject.customer = customer;
    },
    setValue({option, refersTo}) {
      this.chosenProject[refersTo] = option;
      if(refersTo === 'customer' && this.chosenProject.customer.industry.length == 1) {
        this.chosenProject.industry = this.chosenProject.customer.industry[0];
      }
    }
  },
  computed: {
    
  },
  components: {
    Sidebar,
    Allprojects    
  }
};
</script>

<style lang="scss" scoped>

.pm-area {
  min-height: 94vh;
  display: flex;
  width: 100%;
  &__project-details {
    width: 60%;
  }
}

</style>
