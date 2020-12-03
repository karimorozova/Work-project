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
          @updateProject="updateProject"
        )
    .project-info__all-info
      OtherTasksAndSteps(
        :project="project"
        :projectId="projectId"
        :projectSteps="projectSteps"
      )
      .project-info__action
        OtherProjectAction(
          :project="project"
          @refreshCurrProject="refreshProject"
        )
    .project-info__all-info(v-if="project.hasOwnProperty('finance')")
      OtherProjectFinanceBlock(
        @updateXTRFProject="updateProject"
        :isUpdateProject="isUpdateProject"
      )

</template>

<script>
	import OtherProjectDetails from "./OtherProjectDetails";
	import OtherTasksAndSteps from "./OtherTasksAndSteps";
	import { mapActions } from "vuex";
	import OtherProjectSubInformation from "./OtherProjectSubInformation";
	import OtherProjectAction from "./OtherProjectAction";
	import OtherProjectFinanceBlock from "./OtherProjectFinanceBlock";

	export default {
		data() {
			return {
				project: {},
				projectId: "",
				projectName: "",
				projectSteps: [],
				isUpdateProject: false,
			};
		},
		methods: {
			...mapActions(["alertToggle"]),
			refreshProject(project) {
				this.project = project
			},
			updateProject(data) {
				this.project = data;
				this.isUpdateProject = true;
				setTimeout(() => {
					this.isUpdateProject = false;
				}, 500)
			},
			async getProjectSteps(id) {
				try {
					const result = await this.$http.get(`/memoqapi/other-project?id=${ id }`);
					const tasks = result.data.documents.reduce((acc, curr) => {
						for (let i = 0; i < 2; i++)
							curr.UserAssignments.TranslationDocumentUserRoleAssignmentDetails[i].langSymbol = curr.TargetLangCode
						acc.push({ ...curr });
						return acc
					}, []);
					this.projectSteps = tasks.map(item => item.UserAssignments.TranslationDocumentUserRoleAssignmentDetails).flat();
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
			OtherProjectAction,
			OtherProjectSubInformation,
			OtherProjectDetails,
			OtherTasksAndSteps,
			OtherProjectFinanceBlock
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
