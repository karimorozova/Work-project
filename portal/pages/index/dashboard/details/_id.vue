<template lang="pug">
  .details(v-if="project._id")
    .details__title {{ title }}
    .details__data
      .details__info
        .details__main
          MainInfo
        .details__describe
          OtherInfo
</template>

<script>
import MainInfo from "./MainInfo"
import OtherInfo from "./OtherInfo"
import { mapActions, mapGetters } from "vuex"

export default {
		data() {
			return {}
		},
		methods: {
			...mapActions({
				selectProject: "selectProject",
				alertToggle: "alertToggle"
			}),
			async getProjectInfo() {
				const { id } = this.$route.params
				try {
					// //MM
					// // if(!this.allProjects.length || !this.allRequests.length) {
					// //     await this.getProjectsAndRequests();
					// // }
					// if (!this.allProjects.length) {
					// 	await this.getProjectsAndRequests()
					// }
					// const projectsAndRequests = [...this.allProjects, ...this.allRequests]
					// const currentProject = projectsAndRequests.find(item => item._id === id)

          const { project } = (await this.$axios.get('/portal/project/' + id + '?token=' + this.token)).data
          await this.selectProject(project)
				} catch (err) {

				}
			}
		},
		computed: {
			...mapGetters({
				project: "getSelectedProject",
        token: "getToken"
			}),
			title() {
				let result = "Quote Details"
				let statuses = ['Quote sent', 'Requested']
				if (statuses.indexOf(this.project.status) === -1) {
					result = 'Project Details'
				}
				return result
			}
		},
		components: {
			MainInfo,
			OtherInfo
		},
		mounted() {
			this.getProjectInfo()
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../../assets/scss/colors.scss";

  .details {
    color: $main-color;
    width: 100%;
    box-sizing: border-box;
    width: 1040px;

    &__data {
      box-sizing: border-box;
      box-shadow: rgba(103, 87, 62, .3) 0px 2px 5px, rgba(103, 87, 62, .15) 0px 2px 6px 2px;
    }

    &__header {
      padding: 20px;
      border-bottom: 1px solid $light-brown;
    }

    &__title {
      margin: 30px 0 10px;
      font-size: 20px;
    }

    &__info {
      display: flex;
      height: 100%;
    }

    &__main {
      width: 72%;
    }

    &__describe {
      width: 28%;
      background-color: #f4f2f1;
    }
  }

</style>
