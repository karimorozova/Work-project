<template lang="pug">
.project-info 
    .project-info__title Project Id: 
        span.project-info_bold {{ projectId }}

    .project-info__all-info
        OtherProjectDetails(
          :project="project"
          :projectName="projectName"
        )
    .project-info__all-info
        OtherTasksAndSteps(
          :project="project"
          :projectSteps="projectSteps"
        )
</template>

<script>
import OtherProjectDetails from "./OtherProjectDetails";
import OtherTasksAndSteps from "./OtherTasksAndSteps";
import { mapGetters, mapActions } from "vuex";

export default {
  data() {
    return {
      project: {},
      projectId: "",
      projectName: "",
      projectSteps: []
    };
  },
  methods: {
    ...mapActions(["alertToggle"]),
    async getProjectSteps(id) {
      try {
        const result = await this.$http.get(`/memoqapi/other-project?id=${id}`);
        this.projectSteps = result.data.documents
          .map(
            item =>
              item.UserAssignments.TranslationDocumentUserRoleAssignmentDetails
          )
          .flat();
      } catch (err) {
        this.alertToggle({
          message: "Can't get steps",
          isShow: true,
          type: "error"
        });
      }
    },
    async getProject(id) {
      try {
        const result = await this.$http.get(`/memoqapi/other-project?id=${id}`);
        this.project = result.data;
        this.projectId = /(.*])\s- /gm.exec(result.data.name)[1];
        this.projectName = / - (.*)/gm.exec(result.data.name)[1];
      } catch (err) {
        this.alertToggle({
          message: "Can't get project",
          isShow: true,
          type: "error"
        });
      }
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.getProject(to.params.id);
      vm.getProjectSteps(to.params.id);
    });
  },
  components: {
    OtherProjectDetails,
    OtherTasksAndSteps
  }
};
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.project-info {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  &__title {
    padding: 20px 0 0 40px;
    font-size: 20px;
  }
  &__all-info {
    width: 100%;
    display: flex;
    align-items: flex-start;
    box-sizing: border-box;
    padding-left: 20px;
  }
  &__action {
    width: 20%;
    @media (max-width: 1600px) {
      width: 23%;
    }
  }
  &__preview {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 100;
  }
  &_bold {
    font-weight: bold;
  }
}
</style>
