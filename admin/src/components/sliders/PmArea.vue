<template lang="pug">
.pm-area
  router-view
  //- Sidebar(v-if="!detailsShow" 
  //-   title="PM-AREA" 
  //-   :links="sidebarLinks")
  //- .pm-area__projects-table(v-if="!detailsShow")
  //-   Allprojects(
  //-     @selectProject="selectProject"
  //-     @setProjectDefault="setProjectDefault"
  //-   )
  //- router-view(
  //-   @showProjectInfo="showProjectInfo"
  //-   @setValue="setValue"
  //-   @projectCreated="projectCreated"
  //-   @projectDetailsClosed="projectDetailsClosed"
  //-   :project="chosenProject"
  //- )
  //- .pm-area__project-details(v-if="detailsShow && chosenProject.projectId")
  //-   ProjectDetails()
</template>

<script>
import Sidebar from '../Sidebar';
import Allprojects from '../pmArea/Allprojects';
import ProjectInfo from "../pmArea/ProjectInfo";
import ProjectDetails from '../pmArea/ProjectDetails';

export default {
  data() {
    return {
      detailsShow: false,
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
    showProjectInfo() {
      this.detailsShow = true;
    },
    projectDetailsClosed() {
      this.detailsShow = false;
    },
    setProjectDefault() {
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
    projectCreated({project, customer}) {
      this.chosenProject = project;
      this.chosenProject.customer = customer;
    },
    setValue({option, refersTo}) {
      this.chosenProject[refersTo] = option;
      if(refersTo === 'customer' && this.chosenProject.customer.industry.length == 1) {
        this.chosenProject.industry = this.chosenProject.customer.industry[0];
      }
    },
    selectProject({project}) {
      // this.$router.push({name: "project"});
      this.detailsShow = true;
      this.chosenProject = project;
    }
  },
  computed: {
    
  },
  components: {
    Sidebar,
    Allprojects,
    ProjectInfo,
    ProjectDetails
  }
};
</script>

<style lang="scss" scoped>

.pm-area {
  min-height: 94vh;
  display: flex;
  width: 100%;
  &__project-details {
    width: 20%;
  }
}

</style>
