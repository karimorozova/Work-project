<template lang="pug">
  .project-inf
    .project-info__all-info
      OtherProjectDetails(
        :project="project"
        :projectName="projectName"
        @updateProject="updateProject"
      )
      span(v-if="Object.keys(project).length")
        OtherProjectSubInformation(
          :project="project"
          :projectId="projectId"
        )
    .project-info__all-info
      OtherTasksAndSteps(
        :project="project"
        :projectId="projectId"
        :projectSteps="projectSteps"
      )
      .project-info__action(v-if="project.status === 'Closed'")
        OtherProjectAction(
          :project="project"
          @refreshCurrProject="refreshProject"
        )
    .project-info__all-info(v-if="project.status === 'Closed' && project.hasOwnProperty('finance')")
      OtherProjectFinance(
        :project="project"
      )

</template>

<script>
	import OtherProjectDetails from "./OtherProjectDetails";
	import OtherTasksAndSteps from "./OtherTasksAndSteps";
	import { mapActions } from "vuex";
	import OtherProjectSubInformation from "./OtherProjectSubInformation";
	import OtherProjectAction from "./OtherProjectAction";
	import OtherProjectFinance from "./OtherProjectFinance";

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
			refreshProject(project) {
				this.project = project
			},
			updateProject(data) {
				this.project = data;
			},
			async getProjectSteps(id) {
				try {
					const result = await this.$http.get(`/memoqapi/other-project?id=${ id }`);
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
					const result = await this.$http.get(`/memoqapi/other-project?id=${ id }`);
					this.project = result.data;
					this.projectId = /(.*])\s- /gm.exec(result.data.name) ?
							/(.*])\s- /gm.exec(result.data.name)[1] :
							'';
					this.projectName = / - (.*)/gm.exec(result.data.name) ?
							/ - (.*)/gm.exec(result.data.name)[1] :
							result.data.name;

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
			OtherProjectFinance,
			OtherProjectAction,
			OtherProjectSubInformation,
			OtherProjectDetails,
			OtherTasksAndSteps
		}
	};
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

  .project-info {
    position: relative;
    display: flex;
    flex-direction: column;

    &__title {
      padding: 20px 0 0 40px;
      font-size: 20px;
    }

    &__all-info {
      display: flex;
      align-items: flex-start;
      box-sizing: border-box;
    }

    &__action {
      /*width: 20%;*/
      /*@media (max-width: 1600px) {*/
      /*  width: 23%;*/
      /*}*/
    }

    &__preview {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      z-index: 100
    }

    &_bold {
      font-weight: bold;
    }
  }
</style>
